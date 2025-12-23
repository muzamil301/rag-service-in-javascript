import { pool, initDB } from '@dev-brain/database';

export const getDbStatus = async () => {
  await initDB();
  const result = await pool.query('SELECT NOW()');
  return result.rows[0];
};