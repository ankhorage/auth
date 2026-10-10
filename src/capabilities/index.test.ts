import { isCapability } from '@ankhorage/capability';
import {
  AUTH_EMPTY_INPUT_SCHEMA,
  AUTH_NULLABLE_SESSION_RESULT_SCHEMA,
  AUTH_OAUTH_COMPLETION_RESULT_SCHEMA,
  AUTH_OAUTH_START_RESULT_SCHEMA,
  AUTH_VOID_RESULT_SCHEMA,
  COMPLETE_OAUTH_AUTHORIZATION_INPUT_SCHEMA,
  PASSWORD_RESET_INPUT_SCHEMA,
  SIGN_IN_INPUT_SCHEMA,
  SIGN_IN_RESULT_SCHEMA,
  SIGN_OUT_INPUT_SCHEMA,
  SIGN_UP_INPUT_SCHEMA,
  SIGN_UP_RESULT_SCHEMA,
  START_OAUTH_AUTHORIZATION_INPUT_SCHEMA,
  VERIFY_OTP_INPUT_SCHEMA,
} from '@ankhorage/contracts/auth';
import type { Capability } from '@ankhorage/contracts/capability';
import { expect, test } from 'bun:test';

import { CAPABILITIES } from './index.js';

test('publishes only the canonical invocable auth descriptors', () => {
  const capabilities: readonly Capability[] = CAPABILITIES;

  expect(capabilities.every(isCapability)).toBe(true);
  expect(capabilities.map(({ id }) => id)).toEqual([
    'auth.signIn',
    'auth.signUp',
    'auth.signOut',
    'auth.getSession',
    'auth.refreshSession',
    'auth.requestPasswordReset',
    'auth.verifyOtp',
    'auth.oauth.startAuthorization',
    'auth.oauth.completeAuthorization',
  ]);
  expect(
    capabilities.every(
      (capability) =>
        capability.owner === '@ankhorage/auth' &&
        capability.access[0] === 'invoke' &&
        capability.binding.kind === 'auth' &&
        capability.binding.bindableAs[0] === 'target',
    ),
  ).toBe(true);
});

test('binds every descriptor schema to the released Contracts source', () => {
  expect(CAPABILITIES.map((capability) => capability.input.schema)).toEqual([
    SIGN_IN_INPUT_SCHEMA,
    SIGN_UP_INPUT_SCHEMA,
    SIGN_OUT_INPUT_SCHEMA,
    AUTH_EMPTY_INPUT_SCHEMA,
    AUTH_EMPTY_INPUT_SCHEMA,
    PASSWORD_RESET_INPUT_SCHEMA,
    VERIFY_OTP_INPUT_SCHEMA,
    START_OAUTH_AUTHORIZATION_INPUT_SCHEMA,
    COMPLETE_OAUTH_AUTHORIZATION_INPUT_SCHEMA,
  ]);
  expect(CAPABILITIES.map((capability) => capability.output.schema)).toEqual([
    SIGN_IN_RESULT_SCHEMA,
    SIGN_UP_RESULT_SCHEMA,
    AUTH_VOID_RESULT_SCHEMA,
    AUTH_NULLABLE_SESSION_RESULT_SCHEMA,
    AUTH_NULLABLE_SESSION_RESULT_SCHEMA,
    AUTH_VOID_RESULT_SCHEMA,
    SIGN_IN_RESULT_SCHEMA,
    AUTH_OAUTH_START_RESULT_SCHEMA,
    AUTH_OAUTH_COMPLETION_RESULT_SCHEMA,
  ]);
});

test('materializes the package metadata directly from the canonical catalog', async () => {
  const manifest: unknown = JSON.parse(
    await Bun.file(new URL('../../package.json', import.meta.url)).text(),
  );

  expect(manifest).toMatchObject({ ankh: { capabilities: CAPABILITIES } });
});
