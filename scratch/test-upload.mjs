import { MTProtoStorageProvider } from '../lib/video-storage.ts';
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
    console.log('Reading mock video file or creating a dummy buffer...');
    const buffer = Buffer.from('dummy video content payload');
    
    const provider = new MTProtoStorageProvider();
    console.log('Calling uploadVideo...');
    const result = await provider.uploadVideo(
      buffer,
      'test-mock-video.mp4',
      'video/mp4',
      'Test Mock Video'
    );
    console.log('Upload success! Result:', result);
  } catch (err) {
    console.error('Test Upload Error:', err);
  }
}

run();
