import { expect, test } from 'bun:test';

import type {
  AuthorizationAttempt,
  AuthorizationAttemptPersistencePort,
  ConsumeAuthorizationAttemptResult,
  CreateAuthorizationAttemptResult,
  CreateSessionResult,
  DurableSession,
  ReadSessionResult,
  RevokeSessionResult,
  RotateSessionResult,
  SessionPersistencePort,
  SessionSubject,
} from '../../../persistence.js';

/*** Exercise the published contract with a test-only adapter; production hosts must supply durable storage. */
const createPersistenceFixture = (): SessionPersistencePort &
  AuthorizationAttemptPersistencePort => {
  const sessions = new Map<string, DurableSession>();
  const revoked = new Set<string>();
  const attempts = new Map<string, AuthorizationAttempt>();

  return {
    create: (value) => {
      if ('expiresAt' in value && 'encryptedPayload' in value && 'subject' in value) {
        if (sessions.has(value.sessionId))
          return Promise.resolve({ status: 'identifier_conflict' });
        sessions.set(value.sessionId, value);
        return Promise.resolve({ status: 'created' });
      }

      if (attempts.has(value.attemptId)) return Promise.resolve({ status: 'identifier_conflict' });
      attempts.set(value.attemptId, value);
      return Promise.resolve({ status: 'created' });
    },
    read: (sessionId, now) => Promise.resolve(readSession(sessions, revoked, sessionId, now)),
    revoke: ({ sessionId, subject, now }) =>
      Promise.resolve(revokeSession(sessions, revoked, sessionId, subject, now)),
    rotate: ({ replacedSessionId, replacement, subject, now }) =>
      Promise.resolve(
        rotateSession(sessions, revoked, replacedSessionId, replacement, subject, now),
      ),
    consume: ({ attemptId, sessionId, now }) =>
      Promise.resolve(consumeAttempt(attempts, attemptId, sessionId, now)),
  };
};

/*** Resolve a session fixture using the active-session semantics required by the public port. */
const readSession = (
  sessions: ReadonlyMap<string, DurableSession>,
  revoked: ReadonlySet<string>,
  sessionId: string,
  now: number,
): ReadSessionResult => {
  const session = sessions.get(sessionId);
  if (session === undefined) return { status: 'not_found' };
  if (revoked.has(sessionId)) return { status: 'revoked' };
  if (session.expiresAt <= now) return { status: 'expired' };
  return { status: 'found', session };
};

/*** Revoke exactly the session owned by the requested user and tenant fixture. */
const revokeSession = (
  sessions: ReadonlyMap<string, DurableSession>,
  revoked: Set<string>,
  sessionId: string,
  subject: SessionSubject,
  now: number,
): RevokeSessionResult => {
  const result = readSession(sessions, revoked, sessionId, now);
  if (result.status !== 'found')
    return result.status === 'revoked' ? { status: 'already_revoked' } : result;
  if (!isSameSubject(result.session.subject, subject)) return { status: 'subject_mismatch' };
  revoked.add(sessionId);
  return { status: 'revoked' };
};

/*** Replace an active owned session in one fixture operation, never leaving both identifiers usable. */
const rotateSession = (
  sessions: Map<string, DurableSession>,
  revoked: Set<string>,
  replacedSessionId: string,
  replacement: DurableSession,
  subject: SessionSubject,
  now: number,
): RotateSessionResult => {
  const result = readSession(sessions, revoked, replacedSessionId, now);
  if (result.status !== 'found')
    return result.status === 'revoked' ? { status: 'already_revoked' } : result;
  if (!isSameSubject(result.session.subject, subject)) return { status: 'subject_mismatch' };
  if (!isSameSubject(replacement.subject, subject)) return { status: 'subject_mismatch' };
  if (sessions.has(replacement.sessionId)) return { status: 'replacement_identifier_conflict' };
  sessions.set(replacement.sessionId, replacement);
  revoked.add(replacedSessionId);
  return { status: 'rotated' };
};

/*** Consume an unexpired attempt only when the callback presents its originating session identifier. */
const consumeAttempt = (
  attempts: Map<string, AuthorizationAttempt>,
  attemptId: string,
  sessionId: string,
  now: number,
): ConsumeAuthorizationAttemptResult => {
  const attempt = attempts.get(attemptId);
  if (attempt === undefined) return { status: 'not_found' };
  if (attempt.expiresAt <= now) {
    attempts.delete(attemptId);
    return { status: 'expired' };
  }
  if (attempt.sessionId !== sessionId) return { status: 'session_mismatch' };
  attempts.delete(attemptId);
  return { status: 'consumed', attempt };
};

/*** Compare user and optional tenant identity without accepting cross-tenant sessions. */
const isSameSubject = (left: SessionSubject, right: SessionSubject): boolean =>
  left.userId === right.userId && left.tenantId === right.tenantId;

/*** Create deterministic server-only fixture data without modeling credentials or provider tokens. */
const createSession = (sessionId: string, subject: SessionSubject): DurableSession => ({
  sessionId,
  subject,
  encryptedPayload: { ciphertext: 'ciphertext' },
  createdAt: 1,
  expiresAt: 100,
});

test('keeps sessions opaque, user and tenant isolated, revocable, and expired when read', async () => {
  const persistence = createPersistenceFixture();
  const session = createSession('session-a', { userId: 'user-a', tenantId: 'tenant-a' });

  expect(await persistence.create(session)).toEqual<CreateSessionResult>({ status: 'created' });
  expect(await persistence.read(session.sessionId, 99)).toEqual<ReadSessionResult>({
    status: 'found',
    session,
  });
  expect(
    await persistence.revoke({
      sessionId: session.sessionId,
      subject: { userId: 'user-a', tenantId: 'tenant-b' },
      now: 2,
    }),
  ).toEqual<RevokeSessionResult>({ status: 'subject_mismatch' });
  expect(
    await persistence.revoke({ sessionId: session.sessionId, subject: session.subject, now: 2 }),
  ).toEqual<RevokeSessionResult>({ status: 'revoked' });
  expect(await persistence.read(session.sessionId, 2)).toEqual<ReadSessionResult>({
    status: 'revoked',
  });
  expect(await persistence.read(session.sessionId, 100)).toEqual<ReadSessionResult>({
    status: 'revoked',
  });
});

test('rotates a session atomically so its replacement is the only active identifier', async () => {
  const persistence = createPersistenceFixture();
  const subject = { userId: 'user-a', tenantId: 'tenant-a' };
  const original = createSession('session-a', subject);
  const replacement = createSession('session-b', subject);

  await persistence.create(original);
  expect(
    await persistence.rotate({
      replacedSessionId: original.sessionId,
      replacement,
      subject,
      now: 2,
    }),
  ).toEqual<RotateSessionResult>({ status: 'rotated' });
  expect(await persistence.read(original.sessionId, 2)).toEqual<ReadSessionResult>({
    status: 'revoked',
  });
  expect(await persistence.read(replacement.sessionId, 2)).toEqual<ReadSessionResult>({
    status: 'found',
    session: replacement,
  });
});

test('consumes a callback attempt once, only from its originating session, and expires it', async () => {
  const persistence = createPersistenceFixture();
  const attempt: AuthorizationAttempt = {
    attemptId: 'attempt-a',
    sessionId: 'session-a',
    encryptedPayload: { ciphertext: 'ciphertext' },
    expiresAt: 100,
  };

  expect(await persistence.create(attempt)).toEqual<CreateAuthorizationAttemptResult>({
    status: 'created',
  });
  expect(
    await persistence.consume({ attemptId: attempt.attemptId, sessionId: 'session-b', now: 2 }),
  ).toEqual<ConsumeAuthorizationAttemptResult>({ status: 'session_mismatch' });
  expect(
    await persistence.consume({
      attemptId: attempt.attemptId,
      sessionId: attempt.sessionId,
      now: 2,
    }),
  ).toEqual<ConsumeAuthorizationAttemptResult>({ status: 'consumed', attempt });
  expect(
    await persistence.consume({
      attemptId: attempt.attemptId,
      sessionId: attempt.sessionId,
      now: 2,
    }),
  ).toEqual<ConsumeAuthorizationAttemptResult>({ status: 'not_found' });

  const expired = { ...attempt, attemptId: 'attempt-b', expiresAt: 2 };
  await persistence.create(expired);
  expect(
    await persistence.consume({
      attemptId: expired.attemptId,
      sessionId: expired.sessionId,
      now: 2,
    }),
  ).toEqual<ConsumeAuthorizationAttemptResult>({ status: 'expired' });
});
