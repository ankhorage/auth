# Public API

## AuthorizationAttempt

Kind: `type`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:72:1`

Represent short-lived callback state encrypted by the host and bound to one browser session.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| attemptId | property | `string` | yes |  |
| encryptedPayload | property | `EncryptedPayload` | yes |  |
| expiresAt | property | `number` | yes |  |
| sessionId | property | `string` | yes |  |

## AuthorizationAttemptPersistencePort

Kind: `type`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:94:1`

Define host-supplied one-time authorization-attempt persistence for OAuth callback replay and CSRF protection.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| consume | method | `(input: { readonly attemptId: string; readonly sessionId: string; readonly now: number; }) => Promise<ConsumeAuthorizationAttemptResult>` | yes |  |
| create | method | `(attempt: AuthorizationAttempt) => Promise<CreateAuthorizationAttemptResult>` | yes |  |

## AuthPort

Kind: `type`
Module: `src/features/auth/ports/authPort.ts`
Source: `src/features/auth/ports/authPort.ts:17:1`

Define the provider-neutral executable authentication boundary.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| completeAuthorization | method | `(input: CompleteOAuthAuthorizationInput) => Promise<AuthOAuthCompletionResult>` | yes |  |
| getSession | method | `() => Promise<AuthResult<AuthSession \| null>>` | yes |  |
| refreshSession | method | `() => Promise<AuthResult<AuthSession \| null>>` | yes |  |
| requestPasswordReset | method | `(input: PasswordResetInput) => Promise<AuthResult>` | yes |  |
| signIn | method | `(input: SignInInput) => Promise<AuthResult<AuthSession>>` | yes |  |
| signOut | method | `(input?: SignOutInput) => Promise<AuthResult>` | yes |  |
| signUp | method | `(input: SignUpInput) => Promise<AuthResult<AuthSession \| AuthUser>>` | yes |  |
| startAuthorization | method | `(input: StartOAuthAuthorizationInput) => Promise<AuthOAuthStartResult>` | yes |  |
| verifyOtp | method | `(input: VerifyOtpInput) => Promise<AuthResult<AuthSession>>` | yes |  |

## CAPABILITIES

Kind: `value`
Module: `src/capabilities/index.ts`
Source: `src/capabilities/index.ts:20:14`

Define the provider-neutral authentication operations published by this package.

## ConsumeAuthorizationAttemptResult

Kind: `unknown`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:86:1`

Describe the result of atomically consuming a callback-bound authorization attempt.

## CreateAuthorizationAttemptResult

Kind: `unknown`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:80:1`

Describe the result of creating a new one-time authorization attempt.

## CreateSessionResult

Kind: `unknown`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:22:1`

Describe the result of storing a new opaque session identifier.

## DurableSession

Kind: `type`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:13:1`

Represent a durable server-side session whose identifier carries no claims or credentials.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| createdAt | property | `number` | yes |  |
| encryptedPayload | property | `EncryptedPayload` | yes |  |
| expiresAt | property | `number` | yes |  |
| sessionId | property | `string` | yes |  |
| subject | property | `SessionSubject` | yes |  |

## EncryptedPayload

Kind: `type`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:8:1`

Persist an opaque encrypted value without interpreting, decrypting, or exposing its contents.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| ciphertext | property | `string` | yes |  |

## ReadSessionResult

Kind: `unknown`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:28:1`

Describe the result of resolving a session without treating an inactive session as authenticated.

## RevokeSessionResult

Kind: `unknown`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:36:1`

Describe the result of revoking a session for its exact user and tenant boundary.

## RotateSessionResult

Kind: `unknown`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:45:1`

Describe the result of atomically replacing one session identifier with another.

## SessionPersistencePort

Kind: `type`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:55:1`

Define host-supplied durable session storage; rotation commits replacement creation and prior-session revocation together.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| create | method | `(session: DurableSession) => Promise<CreateSessionResult>` | yes |  |
| read | method | `(sessionId: string, now: number) => Promise<ReadSessionResult>` | yes |  |
| revoke | method | `(input: { readonly sessionId: string; readonly subject: SessionSubject; readonly now: number; }) => Promise<RevokeSessionResult>` | yes |  |
| rotate | method | `(input: { readonly replacedSessionId: string; readonly replacement: DurableSession; readonly subject: SessionSubject; readonly now: number; }) => Promise<RotateSessionResult>` | yes |  |

## SessionSubject

Kind: `type`
Module: `src/features/auth/ports/persistencePort.ts`
Source: `src/features/auth/ports/persistencePort.ts:2:1`

Identify a principal whose sessions must remain isolated from every other user and tenant.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| tenantId | property | `string \| undefined` | no |  |
| userId | property | `string` | yes |  |
