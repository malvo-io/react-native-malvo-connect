import { useCallback, useEffect, useRef } from "react";
import type { ComponentType, RefAttributes } from "react";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewProps } from "react-native-webview";
import type {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import type { MalvoConnectOptions, MalvoError } from "./types";
import { buildConnectUrl, buildFinishUrl } from "./url";

/**
 * `react-native-webview`'s root `WebView` class is typed `WebView<P = undefined>`,
 * so its props resolve to `WebViewProps & undefined` (`never`) under strict TS.
 * Re-type it for JSX while keeping the runtime value and the class ref (whose
 * `injectJavaScript` we call) intact.
 */
const TypedWebView = WebView as unknown as ComponentType<
  WebViewProps & RefAttributes<WebView>
>;

/**
 * Renders the hosted Malvo Connect widget in a `react-native-webview` and
 * bridges its `postMessage` events to your callbacks — the drop-in equivalent
 * of `react-native-pluggy-connect`'s `PluggyConnect`.
 *
 * The hosted widget posts every `malvo:*` event to
 * `window.ReactNativeWebView.postMessage`, surfaced here through `onMessage`.
 * Open Finance OAuth runs inside the WebView by default; for banks that refuse
 * embedded WebViews, set `oauthRedirectScheme` and the deep-link return resumes
 * the flow.
 *
 * Place it inside your own screen/modal:
 *
 * ```tsx
 * <MalvoConnect
 *   connectToken={token}
 *   onSuccess={({ item }) => onConnected(item)}
 *   onError={(error) => console.warn(error.code)}
 *   onClose={() => setVisible(false)}
 * />
 * ```
 */
export function MalvoConnect(props: MalvoConnectOptions) {
  const { onSuccess, onError, onOpen, onClose, onEvent, oauthRedirectScheme } =
    props;
  const baseUrl = props.baseUrl;
  const webRef = useRef<WebView>(null);
  const openReported = useRef(false);

  // Keep the latest callbacks without re-subscribing.
  const handlers = useRef({ onSuccess, onError, onOpen, onClose, onEvent });
  handlers.current = { onSuccess, onError, onOpen, onClose, onEvent };

  const uri = buildConnectUrl(props);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    let data: { type?: unknown } | null = null;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (!data || typeof data.type !== "string") return;

    handlers.current.onEvent?.(data as { type: string });

    switch (data.type) {
      case "malvo:success":
        handlers.current.onSuccess?.({
          item: (data as { item: MalvoSuccessItem }).item,
        });
        break;
      case "malvo:error":
        handlers.current.onError?.(
          ((data as { error?: MalvoError }).error ?? {
            code: "UNKNOWN",
            message: "Erro desconhecido",
          }) as MalvoError,
        );
        break;
      case "malvo:close":
        handlers.current.onClose?.();
        break;
      default:
        break;
    }
  }, []);

  // Deep-link return from an external-browser OAuth: re-load /connect/finish in
  // the (still-alive) WebView so its sessionStorage-based resume kicks in.
  useEffect(() => {
    if (!oauthRedirectScheme) return;
    const prefix = `${oauthRedirectScheme.toLowerCase()}:`;
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.toLowerCase().startsWith(prefix)) {
        const finish = JSON.stringify(buildFinishUrl(baseUrl));
        webRef.current?.injectJavaScript(
          `window.location.assign(${finish}); true;`,
        );
      }
    });
    return () => sub.remove();
  }, [oauthRedirectScheme, baseUrl]);

  const isDeepLink = useCallback(
    (url: string) =>
      !!oauthRedirectScheme &&
      url.toLowerCase().startsWith(`${oauthRedirectScheme.toLowerCase()}:`),
    [oauthRedirectScheme],
  );

  return (
    <TypedWebView
      ref={webRef}
      source={{ uri }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      setSupportMultipleWindows={false}
      onMessage={handleMessage}
      onLoadEnd={() => {
        if (openReported.current) return;
        openReported.current = true;
        handlers.current.onOpen?.();
        handlers.current.onEvent?.({ type: "OPEN" });
      }}
      onShouldStartLoadWithRequest={(request: ShouldStartLoadRequest) => {
        // Hand our own deep link off to the Linking listener above.
        return !isDeepLink(request.url);
      }}
    />
  );
}

type MalvoSuccessItem = Record<string, unknown> & {
  id: string;
  status?: string;
};
