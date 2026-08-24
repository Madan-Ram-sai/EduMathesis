import pg from "pg";
const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || "edumathesis",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
    };

export const pool = new Pool(poolConfig);

// export const query = (text, params = []) => pool.query(text, params);

/** Run related SQL statements atomically with a dedicated PostgreSQL client. */
export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const connectDB = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    client.release();
    console.log(`\n PostgreSQL connected !! DB Time: ${res.rows[0].now}`);
  } catch (error) {
    console.error("PostgreSQL connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
