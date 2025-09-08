// src/ws/stomp.ts
import SockJS from "sockjs-client";
import { Client, IMessage, Stomp } from "@stomp/stompjs";

let client: Client | null = null;
let ready: Promise<void> | null = null;

const WS_BASE = import.meta.env.VITE_WS_BASE || "http://localhost:8080"; // HTTP base (SockJS)
const WS_URL = `${WS_BASE}/ws`; // matches registry.addEndpoint("/ws").withSockJS()

export async function connect(): Promise<void> {
  if (ready) return ready;
  ready = new Promise<void>((resolve, reject) => {
    if (client && client.connected) {
      resolve();
      return;
    }
    client = Stomp.over(() => new SockJS(WS_URL));
    client.debug = () => {};
    client.reconnectDelay = 2000;

    client.onConnect = () => resolve();
    client.onStompError = (f) => reject(f);
    client.onWebSocketClose = () => {
      ready = null; // force a fresh connect on next call
      client = null;
    };

    client.activate();
  });
  return ready;
}

export async function subscribeJson(
  topic: string,
  handler: (payload: any) => void
) {
  await connect();
  const sub = client!.subscribe(topic, (m: IMessage) => {
    try {
      handler(JSON.parse(m.body));
    } catch {
      /* ignore */
    }
  });
  return () => sub.unsubscribe();
}
