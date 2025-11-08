import { broadcastToChannel } from './websocket.js';
import { db } from '../db/client.js';

export async function broadcastToSession(sessionId: string, event: StreamEvent) {
  // Store event in database
  await db.streamEvent.create({
    data: {
      sessionId,
      agentType: event.agentType,
      eventType: event.type,
      data: event.data,
    },
  });

  // Broadcast to WebSocket channel
  broadcastToChannel(sessionId, event);
}

export interface StreamEvent {
  type: 'progress' | 'result' | 'error' | 'complete' | 'token';
  agentType: string;
  data: any;
}

export async function streamToken(sessionId: string, agentType: string, token: string) {
  await broadcastToSession(sessionId, {
    type: 'token',
    agentType,
    data: { token },
  });
}

export async function streamProgress(sessionId: string, agentType: string, message: string, progress?: number) {
  await broadcastToSession(sessionId, {
    type: 'progress',
    agentType,
    data: { message, progress },
  });
}

export async function streamResult(sessionId: string, agentType: string, result: any) {
  await broadcastToSession(sessionId, {
    type: 'result',
    agentType,
    data: result,
  });
}

export async function streamError(sessionId: string, agentType: string, error: string) {
  await broadcastToSession(sessionId, {
    type: 'error',
    agentType,
    data: { error },
  });
}

export async function streamComplete(sessionId: string, agentType: string) {
  await broadcastToSession(sessionId, {
    type: 'complete',
    agentType,
    data: {},
  });
}


