/**
 * Run this script ONCE to generate your Telegram MTProto session string.
 * 
 * Usage:
 *   node scripts/generate-telegram-session.mjs
 * 
 * You will be asked for:
 *   1. Your phone number (the Telegram account that is admin in the channel)
 *   2. The OTP code Telegram sends you
 *   3. Your 2FA password (if enabled)
 * 
 * After completion, copy the session string into your .env file as:
 *   TELEGRAM_SESSION_STRING=<the string shown>
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import * as readline from 'readline';

const API_ID   = 35381768;
const API_HASH = '66f6d5345f4e0883a682857f6612307d';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

async function main() {
  console.log('\n=== Luminous LMS — Telegram MTProto Session Generator ===\n');
  console.log('This will authenticate your Telegram account via MTProto.');
  console.log('The generated session string will allow the server to upload');
  console.log('files up to 2 GB to your private Telegram channel.\n');

  const session = new StringSession('');
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => {
      const phone = await ask('Enter your phone number (with country code, e.g. +8801XXXXXXXXX): ');
      return phone.trim();
    },
    password: async () => {
      const pwd = await ask('Enter your 2FA password (press Enter if none): ');
      return pwd;
    },
    phoneCode: async () => {
      const code = await ask('Enter the OTP code Telegram sent you: ');
      return code.trim();
    },
    onError: (err) => {
      console.error('Authentication error:', err.message);
    },
  });

  const sessionString = client.session.save();
  console.log('\n✅ Authentication successful!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Add this to your .env file:\n');
  console.log(`TELEGRAM_SESSION_STRING=${sessionString}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  Keep this session string SECRET — treat it like a password.');
  console.log('   Anyone with this string can access your Telegram account.\n');

  await client.disconnect();
  rl.close();
}

main().catch(console.error);
