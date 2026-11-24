/*** Describe opaque credential material extracted by a server transport without coupling verification to that transport. */
export interface ServerCallerAuthenticationInput {
  readonly credential?: string;
}

/*** Represent the identity and normalized claims that a provider has verified for a server caller. */
export interface VerifiedCaller {
  readonly id: string;
  readonly claims?: Readonly<Record<string, boolean | number | string | null>>;
}

/*** Describe an explicit failed server authentication outcome without disclosing credential material. */
export type ServerCallerAuthenticationFailure =
  | { readonly status: 'missing_credential' }
  | { readonly status: 'invalid_credential' }
  | { readonly status: 'expired_credential' }
  | { readonly status: 'unverifiable_credential' };

/*** Describe the trusted result of asking a provider to authenticate one server caller. */
export type ServerCallerAuthenticationResult =
  | { readonly status: 'authenticated'; readonly caller: VerifiedCaller }
  | ServerCallerAuthenticationFailure;

/*** Define the provider-neutral boundary that verifies transport-supplied credentials for a server host. */
export interface ServerCallerAuthenticationPort {
  authenticateCaller(
    input: ServerCallerAuthenticationInput,
  ): Promise<ServerCallerAuthenticationResult>;
}
