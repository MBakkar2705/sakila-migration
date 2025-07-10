# SAKILA Migration – From PostgreSQL to Redis & MongoDB

Academic project aimed at migrating a relational database to NoSQL systems:
- `country`, `city` → Redis (key-value)
- `film`, `actor`, `language`, `category` → MongoDB (document-oriented)

---

## Project Structure
sakila-migration/ 
├── mongodb/        # Scripts to migrate FILM, ACTOR, LANGUAGE, CATEGORY to MongoDB 
├── node-modules/   # Installed Node.js dependencies (dotenv, pg, mongodb, ioredis, etc.) 
├── redis/          # Scripts to migrate COUNTRY and CITY to Redis Cloud 
├── sql/            # .sql files to recreate the PostgreSQL database: sakila-schema.sql and sakila-data.sql 
├── .env.example    # Configuration template (no sensitive data); copy to .env before running 
├── Project Brief   # Description of the academic task 
├── package         # Main file listing project dependencies 
├── package-lock    # npm lock file for consistent dependency versions 
├── README.md       # Main documentation (French)
├── README.en.md    # Main documentation (English)


>  Before launching the project, create a `.env` file based on `.env.example` and enter your own credentials.

---

## Redis Insight Setup

- Connected to Redis Cloud
- Redis database imported into Redis Insight interface

---

## PostgreSQL Setup

- `sakila` database created via PgAdmin
- Imported files: `sakila-schema.sql` and `sakila-data.sql`
- Conflict between staff and store resolved by allowing NULL in `store_id`

---
	
## Redis Migration Scripts

### `redis/migrate_country.js`
- Node.js initialized via:
```bash
npm init -y
npm install pg ioredis
```

- Main script: migrate_country.js
- Shortcut in package.json:
"scripts": {
  "migrate:country": "node migrate_country.js"
}

- Technologies:
- pg: PostgreSQL connection
- ioredis: Redis Cloud insertion via non-TLS endpoint (port 11980)
- Redis keys follow this format:
country:<id> → {
  "name": "<country name>",
  "updated_at": "<ISO timestamp>"
}

### `redis/migrate_city.js`
- Shortcut: npm run migrate:city
- Redis key follow this format:
city:<id> → {
  "name": "<city name>",
  "country_id": <country_id>,
  "updated_at": "<ISO timestamp>"
}

- Data verified via Redis Insight:
- Keys appear with filter city:*
- Structure matches PostgreSQL content

- Environment Variables
Sensitive data (passwords, hosts, ports) are stored in .env (not versioned).
Structure example:
PG_USER=postgres
PG_PASSWORD=*****
PG_HOST=localhost
PG_PORT=5432
PG_DB=sakila

REDIS_HOST=***
REDIS_PORT=11980
REDIS_USERNAME=default
REDIS_PASSWORD=*****

MONGO_URI=mongodb+srv://sakila_user:<password>@cluster0.xxxxx.mongodb.net/sakila

Loaded via dotenv.

The .env.example file provides a neutral reference.

 MongoDB & Compass Setup
- MongoDB Compass version 1.38+ installed
- Cluster created on MongoDB Atlas (database: sakila)
- Connection via URI with IP whitelist 0.0.0.0/0 for testing
- film collection populated — others follow progressively
- Validation done through Compass interface

MongoDB Migration Scripts
Each script fetches from PostgreSQL and inserts into MongoDB using:
- pg → PostgreSQL queries
- mongodb → MongoDB Atlas connection
- dotenv → Environment config
mongodb/migrate_film.js
film:<id> → {
  film_id,
  title,
  release_year,
  language_id,
  last_update
}


mongodb/migrate_actor.js
actor:<id> → {
  actor_id,
  first_name,
  last_name,
  last_update
}


mongodb/migrate_language.js
language:<id> → {
  language_id,
  name,
  last_update
}


mongodb/migrate_category.js
category:<id> → {
  category_id,
  name,
  last_update
}

All results verified in MongoDB Compass:
Documents match PostgreSQL structure, insertion confirmed.

---

 Author
Project developed by Mohamed Bakkar
Part of an academic program on relational-to-NoSQL migration.
GitHub: MBakkar2705

