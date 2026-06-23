import pool from './database';

export async function logAudit(
  userId: string,
  action: string,
  module: string,
  recordId?: string,
  ipAddress?: string
) {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, module, record_id, ip_address)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [userId, action, module, recordId || null, ipAddress || null];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // We intentionally don't throw here to avoid failing the main request 
    // just because auditing failed, but we log the error.
  }
}
