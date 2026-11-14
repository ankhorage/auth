# Public API

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
