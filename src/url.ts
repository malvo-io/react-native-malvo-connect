import type { MalvoConnectOptions } from "./types";
import { DEFAULT_BASE_URL } from "./types";

function normalizeBase(baseUrl?: string): string {
  return (baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

/**
 * Builds `"{baseUrl}/connect?..."` for the given options. The hosted widget
 * reads `token` (and `resumeItemId`) today; filtering params are sent
 * forward-compatibly so they apply as soon as the widget honours them.
 */
export function buildConnectUrl(options: MalvoConnectOptions): string {
  const base = normalizeBase(options.baseUrl);
  const params: Record<string, string> = { token: options.connectToken };

  if (options.includeSandbox) params.includeSandbox = "true";
  if (options.updateItem) params.updateItem = options.updateItem;
  if (options.connectorTypes?.length)
    params.connectorTypes = options.connectorTypes.join(",");
  if (options.connectorIds?.length)
    params.connectorIds = options.connectorIds.join(",");
  if (options.countries?.length) params.countries = options.countries.join(",");
  if (options.language) params.language = options.language;
  if (options.selectedConnectorId != null)
    params.selectedConnectorId = String(options.selectedConnectorId);

  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${base}/connect?${query}`;
}

/** The hosted OAuth-return landing (`/connect/finish`), re-loaded after an
 * external-browser OAuth deep-link return so the widget resumes. */
export function buildFinishUrl(baseUrl?: string): string {
  return `${normalizeBase(baseUrl)}/connect/finish`;
}
