import { expect, test } from 'bun:test';

import type {
  AuthorizationAttemptPersistencePort,
  AuthPort,
  ServerCallerAuthenticationPort,
  SessionPersistencePort,
} from './index.js';
import { CAPABILITIES } from './index.js';

const AUTH_PORT_OPERATIONS = [
  'signIn',
  'signUp',
  'signOut',
  'getSession',
  'refreshSession',
  'requestPasswordReset',
  'verifyOtp',
  'startAuthorization',
  'completeAuthorization',
] as const satisfies readonly (keyof AuthPort)[];

test('exports the neutral execution port for every canonical operation', () => {
  expect(AUTH_PORT_OPERATIONS).toEqual([
    'signIn',
    'signUp',
    'signOut',
    'getSession',
    'refreshSession',
    'requestPasswordReset',
    'verifyOtp',
    'startAuthorization',
    'completeAuthorization',
  ]);
  expect(CAPABILITIES).toHaveLength(AUTH_PORT_OPERATIONS.length);
});

test('publishes no provider implementation from the JavaScript surface', () => {
  expect(Object.keys({ CAPABILITIES })).toEqual(['CAPABILITIES']);
});

test('publishes host-owned persistence ports without a provider implementation', () => {
  const ports: readonly (SessionPersistencePort | AuthorizationAttemptPersistencePort)[] = [];

  expect(ports).toEqual([]);
});

test('publishes the provider-neutral server caller authentication port', () => {
  const ports: readonly ServerCallerAuthenticationPort[] = [];

  expect(ports).toEqual([]);
});
