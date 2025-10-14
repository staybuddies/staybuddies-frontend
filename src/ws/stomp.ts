// stomp.ts
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

/** 
 * Decide which base to use for SockJS, then append /ws.
 * In development: use relative path '/ws' (proxied by Vite)
 * In production: use full URL from VITE_SOCKJS_BASE
 */
function sockJsUrl(): string {
  // ✅ FIX: In development, use relative path for Vite proxy
  if (import.meta.env.DEV) {
    console.log('[stomp] Using relative WebSocket path for development');
    return '/ws';
  }
  
  // ✅ In production, use full URL
  const base =
    import.meta.env.VITE_SOCKJS_BASE ||
    import.meta.env.VITE_API_BASE ||
    window.location.origin;
  
  const fullUrl = `${normalizeHttpBase(base).replace(/\/+$/, "")}/ws`;
  console.log('[stomp] Using WebSocket URL:', fullUrl);
  return fullUrl;
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
  console.log('[stomp] Connecting to:', url);

  // IMPORTANT: resolve quickly so callers don't block the UI
  connecting = new Promise<void>((resolve) => {
    const safeResolveOnce = (() => {
      let done = false;
      return () => { 
        if (!done) { 
          done = true; 
          resolve(); 
        } 
      };
    })();

    if (!client) {
      client = new Client({
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: 4000,           // keep trying
        heartbeatIncoming: 4000,        // server heartbeat interval
        heartbeatOutgoing: 4000,        // client heartbeat interval
        debug: (str) => {
          // Enable debug logging in development
          if (import.meta.env.DEV) {
            console.log('[stomp debug]', str);
          }
        },
      });

      client.onConnect = (frame) => {
        console.log('[stomp] ✅ Connected successfully', frame);
        connecting = null; // clear the promise
        
        // restore lost subs
        for (const [dest, handler] of desired) {
          const sub = client!.subscribe(dest, (frame: IMessage) => {
            try { 
              handler(JSON.parse(frame.body || "{}")); 
            } catch (err) {
              console.error('[stomp] Failed to parse message:', err);
            }
          });
          live.set(dest, sub);
          console.log('[stomp] Subscribed to:', dest);
        }
      };

      client.onWebSocketClose = (evt) => {
        console.log('[stomp] WebSocket closed', evt);
        connecting = null; // allow reconnection
        for (const sub of live.values()) {
          try { sub.unsubscribe(); } catch {}
        }
        live.clear();
      };

      client.onStompError = (frame) => {
        console.error('[stomp] ❌ Broker error:', frame?.headers, frame?.body);
        connecting = null; // allow retry
      };
      
      client.onWebSocketError = (event) => {
        console.error('[stomp] ❌ WebSocket error:', event);
        connecting = null; // allow retry
      };

      client.onDisconnect = () => {
        console.log('[stomp] Disconnected');
        connecting = null;
      };
    }

    client.activate();

    // Don't block the caller: resolve soon even if WS isn't up yet
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
      try { 
        handler(JSON.parse(msg.body || "{}")); 
      } catch (err) {
        console.error('[stomp] Failed to parse message from', destination, err);
      }
    });
    live.set(destination, sub);
    console.log('[stomp] Subscribed to:', destination);
  }
  
  return () => {
    console.log('[stomp] Unsubscribing from:', destination);
    desired.delete(destination);
    const sub = live.get(destination);
    if (sub) {
      try { 
        sub.unsubscribe(); 
      } finally { 
        live.delete(destination); 
      }
    }
  };
}

/** Send a message to a destination */
export async function sendMessage(destination: string, body: any): Promise<void> {
  await connect();
  
  if (!client?.connected) {
    console.error('[stomp] Cannot send message - not connected');
    throw new Error('WebSocket not connected');
  }
  
  client.publish({
    destination,
    body: JSON.stringify(body),
  });
  console.log('[stomp] Sent message to:', destination);
}

/** Disconnect and cleanup */
export function disconnect(): void {
  if (client) {
    console.log('[stomp] Disconnecting...');
    client.deactivate();
    client = null;
    connecting = null;
    desired.clear();
    live.clear();
  }
}

/** Check if currently connected */
export function isConnected(): boolean {
  return client?.connected ?? false;
}