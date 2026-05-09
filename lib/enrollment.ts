import { query } from '@/lib/database';

export type EnrollmentUserColumn = 'user_id' | 'student_id';

let cachedEnrollmentUserColumn: EnrollmentUserColumn | null = null;

export async function ensurePaymentSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS course_enrollment_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      payment_method VARCHAR(20) NOT NULL,
      payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      enrollment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
      payer_name VARCHAR(150),
      payer_mobile VARCHAR(20),
      payment_mobile VARCHAR(20),
      payment_mobile_last3 VARCHAR(3),
      transaction_id VARCHAR(100),
      bkash_payment_id VARCHAR(120),
      bkash_reference VARCHAR(120),
      gateway_response JSONB,
      admin_note TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_request_unique_success
    ON course_enrollment_requests (user_id, course_id)
    WHERE enrollment_status IN ('approved', 'active')
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_enrollment_requests_course
    ON course_enrollment_requests (course_id)
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status
    ON course_enrollment_requests (enrollment_status, payment_status)
  `);
}

export async function detectEnrollmentUserColumn(): Promise<EnrollmentUserColumn> {
  if (cachedEnrollmentUserColumn) {
    return cachedEnrollmentUserColumn;
  }

  const result = await query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'enrollments' AND column_name IN ('user_id', 'student_id')
    `
  );

  const availableColumns = new Set(result.rows.map((row: { column_name: string }) => row.column_name));
  cachedEnrollmentUserColumn = availableColumns.has('user_id') ? 'user_id' : 'student_id';
  return cachedEnrollmentUserColumn;
}

export async function createEnrollmentIfMissing(userId: number, courseId: number): Promise<void> {
  const userColumn = await detectEnrollmentUserColumn();
  const existing = await query(
    `SELECT id FROM enrollments WHERE ${userColumn} = $1 AND course_id = $2`,
    [userId, courseId]
  );

  if (existing.rows.length > 0) {
    return;
  }

  await query(
    `INSERT INTO enrollments (${userColumn}, course_id, enrollment_date, status, completion_percentage)
     VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)`,
    [userId, courseId, 'active', 0]
  );
}
