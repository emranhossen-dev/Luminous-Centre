import fs from 'fs';
import { NextRequest } from 'next/server.js';

// Parse .env first
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
} catch (e) {}

async function run() {
  try {
    const { PATCH } = await import('../app/api/admin/enhanced-enrollments/[id]/route.ts');
    const jwt = (await import('jsonwebtoken')).default;

    // Generate a valid admin token
    const adminToken = jwt.sign(
      { userId: 1, email: 'admin@luminous.com', roleId: 1, roleName: 'admin', permissions: ['*'] },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    // Create a mock NextRequest
    const req = new NextRequest('http://localhost:3000/api/admin/enhanced-enrollments/32', {
      method: 'PATCH',
      headers: {
        'authorization': `Bearer ${adminToken}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ enrollment_status: 'admitted' })
    });

    console.log('Triggering actual PATCH handler for ID 32...');
    const res = await PATCH(req, { params: Promise.resolve({ id: '32' }) });
    console.log('Status code:', res.status);
    const data = await res.json();
    console.log('Response body:', data);

  } catch (err) {
    console.error('Test script error:', err);
  }
}

run();
