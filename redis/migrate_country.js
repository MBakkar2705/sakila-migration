require('dotenv').config();

// ------------🔧 MODULES
const { Client } = require('pg');
const Redis = require('ioredis');

// ------------⚙️ CONFIGURATIONS

// Connexion à PostgreSQL (adapté à tes paramètres locaux)
const pgClient = new Client({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,

});

// Connexion à Redis Cloud
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD
});

console.log('🚀 Script lancé');

// ------------🚀 MIGRATION
async function migrateCountries() {
  try {
    await pgClient.connect();
    console.log('✔️ Connecté à PostgreSQL');

    const res = await pgClient.query('SELECT country_id, country, last_update FROM country');

    for (const row of res.rows) {
      const key = `country:${row.country_id}`;
      const value = {
        name: row.country,
        updated_at: row.last_update.toISOString()
      };
      await redis.set(key, JSON.stringify(value));
      console.log(`➡️ ${key} migré vers Redis`);
    }

    console.log('✅ Migration terminée');
  } catch (err) {
    console.error('❌ Erreur de migration', err);
  } finally {
    await pgClient.end();
    redis.disconnect();
  }
}

migrateCountries();
