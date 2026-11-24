import { expect, test } from 'bun:test';

import type {
  ServerCallerAuthenticationPort,
  ServerCallerAuthenticationResult,
} from './serverCallerAuthenticationPort.js';

/*** Create a deterministic provider fixture that models only verified outcomes and stable failures. */
const createVerifier = (): ServerCallerAuthenticationPort => ({
  authenticateCaller: ({ credential }) => Promise.resolve(resolveCaller(credential)),
});

/*** Model provider-owned verification without allowing the server boundary to echo credential material. */
const resolveCaller = (credential: string | undefined): ServerCallerAuthenticationResult => {
  if (credential === undefined) return { status: 'missing_credential' };
  if (credential === 'expired') return { status: 'expired_credential' };
  if (credential === 'unverifiable') return { status: 'unverifiable_credential' };
  if (credential !== 'verified') return { status: 'invalid_credential' };

  return {
    status: 'authenticated',
    caller: {
      id: 'user-123',
      claims: { emailVerified: true, role: 'member' },
    },
  };
};

test('returns only a verified caller identity and normalized provider-neutral claims', async () => {
  const verifier = createVerifier();

  expect(await verifier.authenticateCaller({ credential: 'verified' })).toEqual({
    status: 'authenticated',
    caller: {
      id: 'user-123',
      claims: { emailVerified: true, role: 'member' },
    },
  });
});

test('fails closed for missing, invalid, expired, and unverifiable credentials', async () => {
  const verifier = createVerifier();

  expect(await verifier.authenticateCaller({})).toEqual({ status: 'missing_credential' });
  expect(await verifier.authenticateCaller({ credential: 'forged' })).toEqual({
    status: 'invalid_credential',
  });
  expect(await verifier.authenticateCaller({ credential: 'expired' })).toEqual({
    status: 'expired_credential',
  });
  expect(await verifier.authenticateCaller({ credential: 'unverifiable' })).toEqual({
    status: 'unverifiable_credential',
  });
});

test('does not return raw credential material after authentication', async () => {
  const verifier = createVerifier();
  const result = await verifier.authenticateCaller({ credential: 'verified' });

  expect(JSON.stringify(result)).not.toContain('verified');
  expect(result).not.toHaveProperty('credential');
  if (result.status === 'authenticated') expect(result.caller).not.toHaveProperty('credential');
});
