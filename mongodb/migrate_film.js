require('dotenv').config();
const { Client } = require('pg');
const { MongoClient } = require('mongodb');

// 🔐 Récupération des URI depuis le fichier .env
const PG_URI = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  // 📦 Connexion PostgreSQL
  const pgClient = new Client(PG_URI);
  await pgClient.connect();

  // 📦 Connexion MongoDB
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();

  console.log('✅ Connexions établies');

  const mongoDb = mongoClient.db('sakila');
  const filmCollection = mongoDb.collection('film');

  try {
    // 🎬 Extraction des films depuis PostgreSQL
    const result = await pgClient.query('SELECT film_id, title, release_year, language_id, last_update FROM film');
    const films = result.rows.map(film => ({
      film_id: film.film_id,
      title: film.title,
      release_year: film.release_year,
      language_id: film.language_id,
      last_update: film.last_update,
    }));

    // 📥 Insertion dans MongoDB
    const insertResult = await filmCollection.insertMany(films);
    console.log(`✅ ${insertResult.insertedCount} films migrés vers MongoDB`);
  } catch (error) {
    console.error('⛔️ Erreur pendant la migration:', error);
  } finally {
    // 🔐 Fermeture des connexions
    await pgClient.end();
    await mongoClient.close();
  }
})();
