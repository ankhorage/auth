/*** Identify a principal whose sessions must remain isolated from every other user and tenant. */
export interface SessionSubject {
  readonly userId: string;
  readonly tenantId?: string;
}

/*** Persist an opaque encrypted value without interpreting, decrypting, or exposing its contents. */
export interface EncryptedPayload {
  readonly ciphertext: string;
}

/*** Represent a durable server-side session whose identifier carries no claims or credentials. */
export interface DurableSession {
  readonly sessionId: string;
  readonly subject: SessionSubject;
  readonly encryptedPayload: EncryptedPayload;
  readonly createdAt: number;
  readonly expiresAt: number;
}

/*** Describe the result of storing a new opaque session identifier. */
export type CreateSessionResult =
  | { readonly status: 'created' }
  | { readonly status: 'identifier_conflict' }
  | { readonly status: 'unavailable' };

/*** Describe the result of resolving a session without treating an inactive session as authenticated. */
export type ReadSessionResult =
  | { readonly status: 'found'; readonly session: DurableSession }
  | { readonly status: 'not_found' }
  | { readonly status: 'revoked' }
  | { readonly status: 'expired' }
  | { readonly status: 'unavailable' };

/*** Describe the result of revoking a session for its exact user and tenant boundary. */
export type RevokeSessionResult =
  | { readonly status: 'revoked' }
  | { readonly status: 'not_found' }
  | { readonly status: 'subject_mismatch' }
  | { readonly status: 'expired' }
  | { readonly status: 'already_revoked' }
  | { readonly status: 'unavailable' };

/*** Describe the result of atomically replacing one session identifier with another. */
export type RotateSessionResult =
  | { readonly status: 'rotated' }
  | { readonly status: 'not_found' }
  | { readonly status: 'subject_mismatch' }
  | { readonly status: 'expired' }
  | { readonly status: 'already_revoked' }
  | { readonly status: 'replacement_identifier_conflict' }
  | { readonly status: 'unavailable' };

/*** Define host-supplied durable session storage; rotation commits replacement creation and prior-session revocation together. */
export interface SessionPersistencePort {
  create(session: DurableSession): Promise<CreateSessionResult>;
  read(sessionId: string, now: number): Promise<ReadSessionResult>;
  revoke(input: {
    readonly sessionId: string;
    readonly subject: SessionSubject;
    readonly now: number;
  }): Promise<RevokeSessionResult>;
  rotate(input: {
    readonly replacedSessionId: string;
    readonly replacement: DurableSession;
    readonly subject: SessionSubject;
    readonly now: number;
  }): Promise<RotateSessionResult>;
}

/*** Represent short-lived callback state encrypted by the host and bound to one browser session. */
export interface AuthorizationAttempt {
  readonly attemptId: string;
  readonly sessionId: string;
  readonly encryptedPayload: EncryptedPayload;
  readonly expiresAt: number;
}

/*** Describe the result of creating a new one-time authorization attempt. */
export type CreateAuthorizationAttemptResult =
  | { readonly status: 'created' }
  | { readonly status: 'identifier_conflict' }
  | { readonly status: 'unavailable' };

/*** Describe the result of atomically consuming a callback-bound authorization attempt. */
export type ConsumeAuthorizationAttemptResult =
  | { readonly status: 'consumed'; readonly attempt: AuthorizationAttempt }
  | { readonly status: 'not_found' }
  | { readonly status: 'expired' }
  | { readonly status: 'session_mismatch' }
  | { readonly status: 'unavailable' };

/*** Define host-supplied one-time authorization-attempt persistence for OAuth callback replay and CSRF protection. */
export interface AuthorizationAttemptPersistencePort {
  create(attempt: AuthorizationAttempt): Promise<CreateAuthorizationAttemptResult>;
  consume(input: {
    readonly attemptId: string;
    readonly sessionId: string;
    readonly now: number;
  }): Promise<ConsumeAuthorizationAttemptResult>;
}
