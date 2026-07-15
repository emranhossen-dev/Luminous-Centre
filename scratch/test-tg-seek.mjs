import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import fs from 'fs';
import path from 'path';
import bigInt from 'big-integer';

// Simple .env parser
const envContent = fs.readFileSync('.env', 'utf-8');
const process_env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    const commentIdx = val.indexOf('#');
    if (commentIdx !== -1) {
      val = val.substring(0, commentIdx).trim();
    }
    process_env[key] = val.trim();
  }
});

const apiId = parseInt(process_env.TELEGRAM_APP_ID);
const apiHash = process_env.TELEGRAM_APP_HASH;
const session = new StringSession(process_env.TELEGRAM_SESSION_STRING);

async function main() {
  console.log('Connecting to Telegram...');
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  console.log('Connected.');

  const channelId = parseInt(process_env.TELEGRAM_CHANNEL_ID);
  const messages = await client.getMessages(channelId, { limit: 5 });
  const msg = messages.find(m => m.media && m.media.document);
  if (!msg) {
    console.log('No video document message found.');
    await client.disconnect();
    return;
  }

  const doc = msg.media.document;
  console.log(`Found document: ID=${doc.id}, size=${doc.size}`);

  const inputLocation = new Api.InputDocumentFileLocation({
    id: doc.id,
    accessHash: doc.accessHash,
    fileReference: doc.fileReference,
    thumbSize: '',
  });

  // Target range: start = 5000, end = 10000 (chunkSize = 5001)
  const start = 5000;
  const end = 10000;
  const targetSize = end - start + 1;

  const alignedStart = Math.floor(start / 4096) * 4096;
  const skipBytes = start - alignedStart;
  const CHUNK = 512 * 1024;

  console.log(`Requested range: bytes=${start}-${end} (size=${targetSize})`);
  console.log(`Aligned offset to 4096 boundary: alignedStart=${alignedStart}, skipBytes=${skipBytes}`);

  try {
    let downloaded = 0;
    let skipped = 0;
    let resultBuffer = Buffer.alloc(0);

    for await (const chunk of client.iterDownload({
      file: inputLocation,
      offset: bigInt(alignedStart),
      requestSize: CHUNK,
    })) {
      console.log(`Received Telegram chunk of size: ${chunk.length}`);
      let chunkToProcess = chunk;

      if (skipped < skipBytes) {
        const neededSkip = skipBytes - skipped;
        if (chunkToProcess.length <= neededSkip) {
          skipped += chunkToProcess.length;
          console.log(`Skipped whole chunk: ${chunkToProcess.length} bytes`);
          continue;
        } else {
          chunkToProcess = chunkToProcess.slice(neededSkip);
          skipped = skipBytes;
          console.log(`Skipped partial chunk: ${neededSkip} bytes, kept ${chunkToProcess.length} bytes`);
        }
      }

      const remaining = targetSize - downloaded;
      if (chunkToProcess.length > remaining) {
        resultBuffer = Buffer.concat([resultBuffer, chunkToProcess.slice(0, remaining)]);
        downloaded = targetSize;
        console.log(`Enqueued last partial chunk: ${remaining} bytes. Reached target size.`);
        break;
      }

      resultBuffer = Buffer.concat([resultBuffer, chunkToProcess]);
      downloaded += chunkToProcess.length;
      console.log(`Enqueued full chunk: ${chunkToProcess.length} bytes. Total downloaded: ${downloaded}`);
      if (downloaded >= targetSize) break;
    }

    console.log(`Success! Total bytes collected: ${resultBuffer.length} (expected: ${targetSize})`);
  } catch (err) {
    console.error('Test failed:', err);
  }

  await client.disconnect();
}

main();
