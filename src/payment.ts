import { Linking } from "react-native";

/**
 * Payment initiation (Pix / ITP) helpers.
 *
 * The redirection payment journey is NOT rendered in the Connect WebView: the
 * payer authorizes on their own bank, which blocks embedding its authorization
 * page. Open the payment initiation's `authorizationUrl` in the system browser
 * instead. Create the initiation on your backend (`createPaymentInitiation` in
 * `@malvo/server`), then hand its `authorizationUrl` here.
 *
 * ```ts
 * // backend: const { authorizationUrl } = await malvo.createPaymentInitiation({ ... });
 * await openPaymentAuthorization(authorizationUrl);
 * ```
 */
export async function openPaymentAuthorization(
  authorizationUrl: string,
): Promise<void> {
  if (!authorizationUrl) {
    throw new Error("openPaymentAuthorization: authorizationUrl is required");
  }
  await Linking.openURL(authorizationUrl);
}
