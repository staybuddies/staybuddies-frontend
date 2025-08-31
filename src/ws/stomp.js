import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'

let client = null
let readyPromise = null
let resolveReady = null

function ensureClient () {
  if (client) return client
  client = new Client({
    // must match your Spring endpoint in WebSocketConfig
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: (msg) => console.log('[STOMP]', msg)
  })
  client.onConnect = () => resolveReady && resolveReady()
  return client
}

export function connect () {
  const c = ensureClient()
  if (!readyPromise) {
    readyPromise = new Promise((res) => { resolveReady = res })
  }
  if (!c.active) c.activate()
  return readyPromise
}

export async function subscribeJson (destination, handler) {
  await connect()
  const sub = client.subscribe(destination, (m) => {
    try { handler(JSON.parse(m.body)) } catch (e) {}
  })
  return () => sub.unsubscribe()
}
