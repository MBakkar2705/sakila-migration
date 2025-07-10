require('dotenv').config();

const { Client } = require('pg');
const Redis = require('ioredis');

console.log('🚀 Script city lancé');

const pgClient = new Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,

});

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD
});

async function migrateCities() {
  await pgClient.connect();
  console.log('✔️ Connecté à PostgreSQL');

  const res = await pgClient.query('SELECT city_id, city, country_id, last_update FROM city');
  console.log(`🔢 ${res.rows.length} villes trouvées`);

  for (const row of res.rows) {
    const key = `city:${row.city_id}`;
    const value = {
      name: row.city,
      country_id: row.country_id,
      updated_at: row.last_update.toISOString(),
    };
    await redis.set(key, JSON.stringify(value));
    console.log(`➡️ ${key} migrée`);
  }

  console.log('✅ Migration CITY terminée');
  await pgClient.end();
  redis.disconnect();
}

migrateCities().catch((err) => console.error('❌ Erreur migration city', err));
