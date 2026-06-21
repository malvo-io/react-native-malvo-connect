/** Shared option/callback types for the Malvo Connect React Native SDK. */

export interface MalvoSuccess {
  item: Record<string, unknown> & { id: string; status?: string };
}

export interface MalvoError {
  code: string;
  message: string;
  itemId?: string;
}

export interface MalvoEvent {
  type: string;
  [key: string]: unknown;
}

export interface MalvoConnectOptions {
  /** The 30-minute Connect Token from your backend (`POST /connect_token`). */
  connectToken: string;
  /** Origin serving the hosted widget (the malvo-web `FRONTEND_URL`). */
  baseUrl?: string;
  includeSandbox?: boolean;
  /** Existing item id for an update flow (token must be minted with it). */
  updateItem?: string;
  connectorTypes?: string[];
  connectorIds?: number[];
  countries?: string[];
  language?: string;
  selectedConnectorId?: number;
  /**
   * Custom scheme for the Open Finance OAuth deep-link return (e.g. `"malvo"`
   * for `malvo://oauth-callback`). When set, the same redirect URI must be
   * passed to `POST /connect_token` as `options.oauthRedirectUri` and registered
   * in the host app (iOS `CFBundleURLTypes`, Android intent-filter).
   */
  oauthRedirectScheme?: string;
  onSuccess?: (data: MalvoSuccess) => void;
  onError?: (error: MalvoError) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onEvent?: (event: MalvoEvent) => void;
}

export const DEFAULT_BASE_URL = "https://malvo.io";
