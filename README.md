# @malvo/react-native-connect

React Native component for the **hosted Malvo Connect widget** (Open Finance
Brasil), talking to your own Malvo API.

It wraps the hosted widget (`{baseUrl}/connect?token=...`) in a
[`react-native-webview`](https://github.com/react-native-webview/react-native-webview)
and bridges its `postMessage` events to your callbacks.

## Install

```bash
npm install @malvo/react-native-connect react-native-webview
```

Follow `react-native-webview`'s platform setup (pods on iOS). `react-native` and
`react-native-webview` are peer dependencies.

## Usage

The only required input is a **Connect Token** minted by *your* backend
(`POST /auth` → `apiKey` → `POST /connect_token` → `accessToken`, 30-min TTL).

```tsx
import { Modal } from "react-native";
import { MalvoConnect } from "@malvo/react-native-connect";

function ConnectModal({ token, visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <MalvoConnect
        connectToken={token}
        baseUrl="https://malvo.io"
        includeSandbox={__DEV__}
        onSuccess={({ item }) => {
          console.log("connected", item.id);
          onClose();
        }}
        onError={(error) => console.warn(error.code, error.message)}
        onClose={onClose}
      />
    </Modal>
  );
}
```

> **Webhooks are the source of truth.** `onSuccess` is best-effort UX. Persist
> connections from the `item/created` / `item/updated` webhooks on your backend.

## Payments (Pix)

The Connect widget authorizes **data** consent. **Payment initiation** (Pix /
ITP) with redirection sends the payer to their own bank, which blocks embedding —
so it opens the system browser, not the WebView.

Create the initiation on your backend (`createPaymentInitiation` in
[`@malvo/server`](https://www.npmjs.com/package/@malvo/server)), then open the
returned `authorizationUrl`:

```tsx
import { openPaymentAuthorization } from "@malvo/react-native-connect";

// authorizationUrl comes from your backend's createPaymentInitiation(...)
await openPaymentAuthorization(authorizationUrl);
```

After the payer authorizes and returns to your `redirectUrl` (deep link),
execute and reconcile the Pix from your backend. See the
[Pix payments guide](https://docs.malvo.io/guides/pix-payments).

### No-redirection (FIDO)

For the JSR journey the payer authorizes with biometrics on-device. This SDK
exposes the extension point `MalvoFidoAuthenticator` — implement it with your
passkey library (e.g. `react-native-passkey`); the SDK does not bundle one, so
you own the authenticator and the associated-domains configuration for the
Malvo/Celcoin relying party.

```ts
import type { MalvoFidoAuthenticator } from "@malvo/react-native-connect";

const authenticator: MalvoFidoAuthenticator = {
  createCredential: (options) => passkey.register(options), // your passkey lib
  getAssertion: (options) => passkey.authenticate(options),
};
```

The backend steps (`createEnrollment`, `fidoRegistration`, `authoriseFido`,
`executePixV4`, …) run on your server via `@malvo/server`; the authenticator is
called between them to run the two WebAuthn ceremonies.

## Open Finance / OAuth

By default the bank consent runs **inside the WebView** and resumes
automatically. For institutions that refuse embedded WebViews, set
`oauthRedirectScheme` and:

1. Pass the matching `options.oauthRedirectUri` (e.g. `malvo://oauth-callback`)
   to `POST /connect_token` on your backend.
2. Register the scheme natively (iOS `CFBundleURLTypes`, Android intent-filter).

On the deep-link return the WebView re-loads `/connect/finish` and resumes.

## Props

| Prop | Type | Notes |
|---|---|---|
| `connectToken` | `string` | **Required.** |
| `baseUrl` | `string` | malvo-web origin. Default `https://malvo.io`. |
| `includeSandbox` | `boolean` | Show sandbox connectors. |
| `updateItem` | `string` | Item id for an update flow. |
| `connectorTypes` / `connectorIds` / `countries` / `language` / `selectedConnectorId` | — | Filtering / UX hints. |
| `oauthRedirectScheme` | `string` | Custom scheme for external-browser OAuth deep-link return. |
| `onSuccess` / `onError` / `onOpen` / `onClose` / `onEvent` | callbacks | Widget lifecycle callbacks. |
