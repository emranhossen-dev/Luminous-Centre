import { getGramJSClient, getChannelId } from '../lib/gramjs-client.ts';
import fs from 'fs';

// Manually parse .env
try {
  const envText = fs.readFileSync('.env', 'utf8');
  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) continue;
    const key = trimmed.substring(0, firstEq).trim();
    const val = trimmed.substring(firstEq + 1).trim();
    process.env[key] = val;
  }
} catch (e) {
  console.log('No .env found');
}

async function run() {
  try {
    console.log('Connecting...');
    const client = await getGramJSClient();
    console.log('Connected! Checking channel...');
    const channelId = getChannelId();
    console.log('Channel ID:', channelId);
    
    // Try to get channel info
    const entity = await client.getEntity(channelId);
    console.log('Entity retrieved successfully:', entity.title || entity.username);
    
    await client.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Test Connection Error:', err);
  }
}

run();
