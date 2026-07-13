/**
 * Singleton GramJS (MTProto) client for Telegram operations.
 * Reuses a single connection across all server-side requests.
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/StringSession.js';

let _client: TelegramClient | null = null;
let _connecting = false;

export async function getGramJSClient(): Promise<TelegramClient> {
  if (_client && _client.connected) return _client;

  // Prevent concurrent connect races
  while (_connecting) {
    await new Promise(r => setTimeout(r, 100));
  }

  if (_client && _client.connected) return _client;

  _connecting = true;
  try {
    const sessionString = process.env.TELEGRAM_SESSION_STRING || '';
    const apiId = parseInt(process.env.TELEGRAM_APP_ID || '35381768');
    const apiHash = process.env.TELEGRAM_APP_HASH || '';

    if (!sessionString || !apiHash) {
      throw new Error('TELEGRAM_SESSION_STRING or TELEGRAM_APP_HASH not set in environment.');
    }

    const session = new StringSession(sessionString);
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
      retryDelay: 1000,
      autoReconnect: true,
      requestRetries: 3,
    });

    await client.connect();
    _client = client;
    console.log('[GramJS] Connected to Telegram MTProto successfully.');
    return client;
  } finally {
    _connecting = false;
  }
}

export function getChannelId(): string {
  return process.env.TELEGRAM_CHANNEL_ID || '-1004421022974';
}
