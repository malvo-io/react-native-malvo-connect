## 0.1.0

- Initial release.
- `MalvoConnect` React Native component: wraps the hosted Malvo Connect widget
  in `react-native-webview` and bridges `malvo:success` / `malvo:error` /
  `malvo:close` events to `onSuccess` / `onError` / `onClose` / `onEvent`.
- Open Finance OAuth runs in-WebView by default, with optional external-browser
  + deep-link return via `oauthRedirectScheme`.
