import { query } from './database';
import { getGramJSClient, getChannelId } from './gramjs-client';
import { Api } from 'telegram';
import { CustomFile } from 'telegram/client/uploads.js';
import bigInt from 'big-integer';

export interface VideoUploadResult {
  fileId: string;
  fileSize?: number;
}

export interface VideoStreamResult {
  stream: ReadableStream | null;
  status: number;
  headers: Record<string, string>;
}

export interface VideoStorageProvider {
  uploadVideo(fileBuffer: Buffer, fileName: string, mimeType: string, title: string): Promise<VideoUploadResult>;
  streamVideo(fileId: string, rangeHeader?: string): Promise<VideoStreamResult>;
}

/**
 * MTProto storage provider using GramJS.
 * Bypasses the 50 MB Bot API limit — supports files up to 2 GB.
 * fileId format: "mtproto:{messageId}" stored in the database.
 */
export class MTProtoStorageProvider implements VideoStorageProvider {
  async uploadVideo(fileBuffer: Buffer, fileName: string, _mimeType: string, title: string): Promise<VideoUploadResult> {
    const channelId = getChannelId();
    console.log(`[MTPROTO-STORAGE] Uploading "${fileName}" (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB) via MTProto...`);

    const client = await getGramJSClient();

    const customFile = new CustomFile(fileName, fileBuffer.length, '', fileBuffer);

    console.log('[MTPROTO-STORAGE] Direct upload to Telegram storage (uploadFile)...');
    const fileHandle = await client.uploadFile({
      file: customFile,
      workers: 4,
      maxBufferSize: 2 * 1024 * 1024 * 1024,
    } as any);

    console.log('[MTPROTO-STORAGE] Sending uploaded file message to channel...');
    const message = await client.sendFile(channelId, {
      file: fileHandle,
      caption: title,
      forceDocument: false,
      supportsStreaming: true,
      attributes: [
        new Api.DocumentAttributeFilename({ fileName }),
      ],
    });

    const messageId = message.id;
    console.log(`[MTPROTO-STORAGE] Upload successful! Channel message_id: ${messageId}`);

    // Get document size from the message media
    let fileSize: number | undefined;
    try {
      const media = message.media as Api.MessageMediaDocument;
      const doc = media?.document as Api.Document;
      if (doc?.size) fileSize = Number(doc.size);
    } catch (_) {}

    return {
      fileId: `mtproto:${messageId}`,
      fileSize,
    };
  }

  async streamVideo(fileId: string, rangeHeader?: string): Promise<VideoStreamResult> {
    const channelId = getChannelId();
    const messageId = parseInt(fileId.replace('mtproto:', ''));

    if (!messageId) {
      throw new Error(`Invalid MTProto fileId: ${fileId}`);
    }

    console.log(`[MTPROTO-STORAGE] Streaming message_id: ${messageId}, Range: ${rangeHeader || 'None'}`);

    const client = await getGramJSClient();

    // Fetch fresh message to get current file_reference (Telegram refreshes these)
    const messages = await client.getMessages(channelId, { ids: [messageId] });
    const msg = messages[0];

    if (!msg || !msg.media) {
      throw new Error(`Message ${messageId} not found or has no media.`);
    }

    const media = msg.media as Api.MessageMediaDocument;
    const doc = media.document as Api.Document;

    if (!doc) {
      throw new Error(`Message ${messageId} has no document attached.`);
    }

    const totalSize = Number(doc.size);

    // Parse Range header
    let start = 0;
    let end = totalSize - 1;
    let isRange = false;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        start = match[1] ? parseInt(match[1]) : 0;
        end = match[2] ? parseInt(match[2]) : totalSize - 1;
        isRange = true;
      }
    }

    const chunkSize = end - start + 1;

    // Align start offset to nearest multiple of 4096 bytes (required by Telegram API)
    const alignedStart = Math.floor(start / 4096) * 4096;
    const skipBytes = start - alignedStart;

    const inputLocation = new Api.InputDocumentFileLocation({
      id: doc.id,
      accessHash: doc.accessHash,
      fileReference: doc.fileReference,
      thumbSize: '',
    });

    // Stream in chunks using iterDownload.
    // Omit limit/chunkSize parameters to prevent GramJS from buffering the entire file range in memory.
    const CHUNK = 512 * 1024; // 512 KB per request
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let downloaded = 0;
          let skipped = 0;

          for await (const chunk of client.iterDownload({
            file: inputLocation,
            offset: bigInt(alignedStart),
            requestSize: CHUNK,
          })) {
            let chunkToProcess = chunk;

            // Discard the alignment padding bytes from the beginning of the stream
            if (skipped < skipBytes) {
              const neededSkip = skipBytes - skipped;
              if (chunkToProcess.length <= neededSkip) {
                skipped += chunkToProcess.length;
                continue;
              } else {
                chunkToProcess = chunkToProcess.slice(neededSkip);
                skipped = skipBytes;
              }
            }

            // Slice chunk if it exceeds the remaining requested bytes
            const remainingToDownload = chunkSize - downloaded;
            if (chunkToProcess.length > remainingToDownload) {
              controller.enqueue(chunkToProcess.slice(0, remainingToDownload));
              downloaded = chunkSize;
              break;
            }

            controller.enqueue(chunkToProcess);
            downloaded += chunkToProcess.length;
            if (downloaded >= chunkSize) break;
          }
        } catch (err) {
          console.error('[MTPROTO-STORAGE] Stream error:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return {
      stream: readableStream,
      status: isRange ? 206 : 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(chunkSize),
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
      },
    };
  }
}

/**
 * Legacy Bot API provider (for old Bot API file_ids already in the DB, 50 MB limit).
 */
export class TelegramBotAPIStorageProvider implements VideoStorageProvider {
  private botToken: string;
  private channelId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || '';
  }

  async uploadVideo(fileBuffer: Buffer, fileName: string, mimeType: string, title: string): Promise<VideoUploadResult> {
    if (!this.botToken || !this.channelId) {
      throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID missing');
    }

    console.log(`[BOTAPI-STORAGE] Uploading "${fileName}" (${fileBuffer.length} bytes)...`);

    const boundary = `----Boundary${Math.random().toString(36).substring(2)}`;
    const parts: Buffer[] = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${this.channelId}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${title}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ];

    const payload = Buffer.concat(parts);
    const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length.toString(),
      },
      body: payload,
    });

    const data = await response.json();
    if (!data.ok) throw new Error(data.description || 'Bot API upload failed');

    const doc = data.result?.document;
    if (!doc?.file_id) throw new Error('file_id missing from Bot API response');

    return { fileId: doc.file_id, fileSize: doc.file_size };
  }

  async streamVideo(fileId: string, rangeHeader?: string): Promise<VideoStreamResult> {
    const getFileRes = await fetch(`https://api.telegram.org/bot${this.botToken}/getFile?file_id=${fileId}`);
    const getFileData = await getFileRes.json();

    if (!getFileData.ok || !getFileData.result?.file_path) {
      throw new Error(getFileData.description || 'getFile failed');
    }

    const fetchHeaders: Record<string, string> = {};
    if (rangeHeader) fetchHeaders['Range'] = rangeHeader;

    const mediaRes = await fetch(
      `https://api.telegram.org/file/bot${this.botToken}/${getFileData.result.file_path}`,
      { headers: fetchHeaders }
    );

    const responseHeaders: Record<string, string> = { 'Accept-Ranges': 'bytes' };
    ['content-type', 'content-length', 'content-range', 'accept-ranges'].forEach(h => {
      const v = mediaRes.headers.get(h);
      if (v) responseHeaders[h] = v;
    });

    return { stream: mediaRes.body, status: mediaRes.status, headers: responseHeaders };
  }
}

/**
 * Factory: auto-selects MTProto (GramJS) if session string is configured,
 * falls back to Bot API for legacy files.
 */
export function getStorageProvider(): VideoStorageProvider {
  return new MTProtoStorageProvider();
}

/**
 * Get the right provider based on the stored fileId format.
 * mtproto:XXX → MTProtoStorageProvider
 * everything else → Bot API (legacy)
 */
export function getStreamingProvider(fileId: string): VideoStorageProvider {
  if (fileId.startsWith('mtproto:')) {
    return new MTProtoStorageProvider();
  }
  return new TelegramBotAPIStorageProvider();
}

export async function ensureVideoStorageSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS lesson_videos (
      id SERIAL PRIMARY KEY,
      lesson_id INTEGER,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      telegram_file_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      duration VARCHAR(50),
      thumbnail VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
