## 0.3.0

- Add `MalvoFidoAuthenticator` — extension point for the no-redirection (JSR)
  payment journey. Implement it with your passkey library to run the on-device
  WebAuthn ceremonies; the SDK bundles no passkey dependency.

## 0.2.0

- Add `openPaymentAuthorization(authorizationUrl)` — open a Pix payment
  initiation's authorization page in the system browser. The redirection payment
  journey is not rendered in the Connect WebView (banks block embedding). Pair it
  with `createPaymentInitiation` in `@malvo/server`.

## 0.1.0

- Initial release.
- `MalvoConnect` React Native component: wraps the hosted Malvo Connect widget
  in `react-native-webview` and bridges `malvo:success` / `malvo:error` /
  `malvo:close` events to `onSuccess` / `onError` / `onClose` / `onEvent`.
- Open Finance OAuth runs in-WebView by default, with optional external-browser
  + deep-link return via `oauthRedirectScheme`.
