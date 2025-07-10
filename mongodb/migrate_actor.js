require('dotenv').config();
const { MongoClient } = require('mongodb');
const { Client } = require('pg');

const pgClient = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
});

const mongoClient = new MongoClient(process.env.MONGO_URI);

(async () => {
  try {
    await pgClient.connect();
    await mongoClient.connect();

    console.log("✅ Connexions établies");

    const res = await pgClient.query('SELECT actor_id, first_name, last_name, last_update FROM actor');
    const actors = res.rows;

    const collection = mongoClient.db().collection('actor');
    await collection.insertMany(actors);

    console.log(`✅ ${actors.length} acteurs migrés vers MongoDB`);
  } catch (error) {
    console.error("❌ Erreur de migration :", error.message);
  } finally {
    await pgClient.end();
    await mongoClient.close();
  }
})();
