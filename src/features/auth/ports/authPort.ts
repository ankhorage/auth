import type {
  AuthOAuthCompletionResult,
  AuthOAuthStartResult,
  AuthResult,
  AuthSession,
  AuthUser,
  CompleteOAuthAuthorizationInput,
  PasswordResetInput,
  SignInInput,
  SignOutInput,
  SignUpInput,
  StartOAuthAuthorizationInput,
  VerifyOtpInput,
} from '@ankhorage/contracts/auth';

/*** Define the provider-neutral executable authentication boundary. */
export interface AuthPort {
  signIn(input: SignInInput): Promise<AuthResult<AuthSession>>;
  signUp(input: SignUpInput): Promise<AuthResult<AuthSession | AuthUser>>;
  signOut(input?: SignOutInput): Promise<AuthResult>;
  getSession(): Promise<AuthResult<AuthSession | null>>;
  refreshSession(): Promise<AuthResult<AuthSession | null>>;
  requestPasswordReset(input: PasswordResetInput): Promise<AuthResult>;
  verifyOtp(input: VerifyOtpInput): Promise<AuthResult<AuthSession>>;
  startAuthorization(input: StartOAuthAuthorizationInput): Promise<AuthOAuthStartResult>;
  completeAuthorization(input: CompleteOAuthAuthorizationInput): Promise<AuthOAuthCompletionResult>;
}
