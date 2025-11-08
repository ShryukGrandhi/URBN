import { FastifyInstance } from 'fastify';
import { SocketStream } from '@fastify/websocket';

interface WebSocketClient {
  socket: SocketStream;
  sessionId: string;
  subscribedTo: Set<string>;
}

const clients = new Map<string, WebSocketClient>();

export function setupWebSocket(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (socket, request) => {
    const sessionId = Math.random().toString(36).substring(7);
    
    const client: WebSocketClient = {
      socket,
      sessionId,
      subscribedTo: new Set(),
    };
    
    clients.set(sessionId, client);
    
    console.log(`WebSocket client connected: ${sessionId}`);

    // Send welcome message
    socket.send(JSON.stringify({
      type: 'connected',
      sessionId,
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    socket.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        handleClientMessage(client, data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    // Handle disconnect
    socket.on('close', () => {
      console.log(`WebSocket client disconnected: ${sessionId}`);
      clients.delete(sessionId);
    });

    socket.on('error', (error) => {
      console.error(`WebSocket error for ${sessionId}:`, error);
      clients.delete(sessionId);
    });
  });
}

function handleClientMessage(client: WebSocketClient, data: any) {
  const { type, payload } = data;

  switch (type) {
    case 'subscribe':
      // Subscribe to specific channels (e.g., simulation, debate, report)
      if (payload.channel) {
        client.subscribedTo.add(payload.channel);
        client.socket.send(JSON.stringify({
          type: 'subscribed',
          channel: payload.channel,
        }));
      }
      break;

    case 'unsubscribe':
      if (payload.channel) {
        client.subscribedTo.delete(payload.channel);
        client.socket.send(JSON.stringify({
          type: 'unsubscribed',
          channel: payload.channel,
        }));
      }
      break;

    case 'ping':
      client.socket.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString(),
      }));
      break;

    default:
      console.warn('Unknown message type:', type);
  }
}

export function broadcastToChannel(channel: string, data: any) {
  const message = JSON.stringify({
    type: 'broadcast',
    channel,
    data,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients.values()) {
    if (client.subscribedTo.has(channel)) {
      try {
        client.socket.send(message);
      } catch (error) {
        console.error('Error broadcasting to client:', error);
      }
    }
  }
}

export function broadcastToAll(data: any) {
  const message = JSON.stringify({
    type: 'broadcast',
    data,
    timestamp: new Date().toISOString(),
  });

  for (const client of clients.values()) {
    try {
      client.socket.send(message);
    } catch (error) {
      console.error('Error broadcasting to client:', error);
    }
  }
}

export function sendToSession(sessionId: string, data: any) {
  const client = clients.get(sessionId);
  if (client) {
    try {
      client.socket.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error sending to session:', error);
    }
  }
}


