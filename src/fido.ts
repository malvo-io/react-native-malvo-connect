/**
 * No-redirection (JSR / FIDO) payment journey — extension point.
 *
 * In the JSR journey the payer authorizes the Pix on-device with biometrics
 * (WebAuthn/passkey), in two ceremonies: registering a credential once, then
 * signing each payment. This SDK does **not** bundle a passkey library — you
 * keep control of the authenticator (e.g. `react-native-passkey`) and of the
 * associated-domains / assetlinks configuration for the Malvo/Celcoin relying
 * party. Implement {@link MalvoFidoAuthenticator} to plug your authenticator in.
 *
 * The WebAuthn payloads are exchanged verbatim with the Malvo backend (via your
 * server, using `@malvo/server`), so they are typed as opaque JSON — pass them
 * straight through.
 */

/** Registration options from `fidoRegistrationOptions` (feed to the ceremony). */
export type FidoRegistrationOptions = Record<string, unknown>;
/** Credential produced by the registration ceremony (send to `fidoRegistration`). */
export type FidoCredential = Record<string, unknown>;
/** Sign options from `fidoSignOptions` (feed to the ceremony). */
export type FidoSignOptions = Record<string, unknown>;
/** Assertion produced by the sign ceremony (send to `authoriseFido`). */
export type FidoAssertion = Record<string, unknown>;

/**
 * The device-side authenticator for the JSR journey. Implement it with your
 * platform passkey/WebAuthn library.
 *
 * Typical flow (backend steps run on your server via `@malvo/server`):
 *
 * 1. `createEnrollment` → `fidoRegistrationOptions(enrollmentId)`
 * 2. `authenticator.createCredential(options)` → `fidoRegistration(enrollmentId, credential)`
 * 3. `createEnrollmentPaymentInitiation(enrollmentId, …)` → `fidoSignOptions(paymentId)`
 * 4. `authenticator.getAssertion(options)` → `authoriseFido(paymentId, assertion)`
 * 5. `executePixV4(paymentId, …)`
 */
export interface MalvoFidoAuthenticator {
  /** Run the WebAuthn registration ceremony (`navigator.credentials.create()` equivalent). */
  createCredential(options: FidoRegistrationOptions): Promise<FidoCredential>;
  /** Run the WebAuthn assertion ceremony (`navigator.credentials.get()` equivalent). */
  getAssertion(options: FidoSignOptions): Promise<FidoAssertion>;
}
