import fs from 'fs';

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
    const { query } = await import('../lib/database.js');
    const courseId = 39;
    
    // Get modules to delete
    const existingModulesRes = await query(
      'SELECT id FROM curriculum_modules WHERE course_id = $1',
      [courseId]
    );
    const existingModuleIds = existingModulesRes.rows.map(r => r.id);
    
    console.log('Existing Module IDs:', existingModuleIds);
    
    if (existingModuleIds.length > 0) {
      console.log('Attempting to delete modules using: DELETE FROM curriculum_modules WHERE id = ANY($1)');
      const res = await query('DELETE FROM curriculum_modules WHERE id = ANY($1)', [existingModuleIds]);
      console.log('Delete successful! Affected rows:', res.rowCount);
    } else {
      console.log('No modules found to delete.');
    }
  } catch (err) {
    console.error('Database Operation Error:', err);
  }
}

run();
