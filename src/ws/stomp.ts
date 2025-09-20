// src/ws/stomp.ts
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/** Normalize a base URL to http/https (SockJS requirement). */
function normalizeHttpBase(input?: string): string {
  if (!input) return window.location.origin;
  let u = input.trim();
  u = u.replace(/^ws(s?):\/\//i, (_m, s) => `http${s ? "s" : ""}://`);
  if (u.startsWith("//")) return `${window.location.protocol}${u}`;
  if (u.startsWith("/")) return `${window.location.origin}${u}`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${window.location.protocol}//${u}`;
}

/** Decide which base to use for SockJS, then append /ws. */
function sockJsUrl(): string {
  const base =
    import.meta.env.VITE_SOCKJS_BASE ||      // << set this to your backend base in dev
    import.meta.env.VITE_API_BASE ||
    window.location.origin;
  return `${normalizeHttpBase(base).replace(/\/+$/, "")}/ws`;
}

let client: Client | null = null;
let connecting: Promise<void> | null = null;

// Remember desired subscriptions to re-add after reconnect
type Handler = (json: any) => void;
const desired = new Map<string, Handler>();
const live = new Map<string, StompSubscription>();

export async function connect(): Promise<void> {
  // if connected, quick return
  if (client?.connected) return;
  if (connecting) return connecting;

  const url = sockJsUrl();

  // IMPORTANT: resolve quickly so callers don't block the UI
  connecting = new Promise<void>((resolve) => {
    const safeResolveOnce = (() => {
      let done = false;
      return () => { if (!done) { done = true; resolve(); } };
    })();

    if (!client) {
      client = new Client({
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: 4000,           // keep trying
        debug: () => {},                // add console.log to debug frames
      });

      client.onConnect = () => {
        // restore lost subs
        for (const [dest, handler] of desired) {
          const sub = client!.subscribe(dest, (frame: IMessage) => {
            try { handler(JSON.parse(frame.body || "{}")); } catch {}
          });
          live.set(dest, sub);
        }
      };

      client.onWebSocketClose = () => {
        for (const sub of live.values()) {
          try { sub.unsubscribe(); } catch {}
        }
        live.clear();
      };

      client.onStompError = (f) => {
        console.warn("[stomp] broker error", f?.headers, f?.body);
      };
      client.onWebSocketError = (e) => {
        console.warn("[stomp] ws error", e);
      };
    }

    client.activate();

    // Don’t block the caller: resolve soon even if WS isn’t up yet
    setTimeout(safeResolveOnce, 400);   // UI proceeds; WS continues in background
  });

  return connecting;
}

/** Subscribe (remembered) and parse JSON; returns an unsubscribe fn. */
export async function subscribeJson(
  destination: string,
  handler: Handler
): Promise<() => void> {
  await connect();
  desired.set(destination, handler);

  if (client?.connected) {
    const sub = client.subscribe(destination, (msg: IMessage) => {
      try { handler(JSON.parse(msg.body || "{}")); } catch {}
    });
    live.set(destination, sub);
  }
  return () => {
    desired.delete(destination);
    const sub = live.get(destination);
    if (sub) {
      try { sub.unsubscribe(); } finally { live.delete(destination); }
    }
  };
}
