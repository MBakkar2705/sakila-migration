# Migration SAKILA - PostgreSQL vers Redis & MongoDB

Projet académique visant à migrer une base relationnelle vers des bases NoSQL :
- `country`, `city` vers Redis (clé-valeur)
- `film`, `actor`, `language`, `category` vers MongoDB (documents)

---

##  Structure du projet
sakila-migration/ 
├── mongodb/        # Scripts pour migrer FILM, ACTOR, LANGUAGE, CATEGORY vers MongoDB
├── node-modules/   # Modules Node.js installés via npm (dotenv, pg, mongodb, ioredis, etc.)
├── redis/          # Scripts pour migrer COUNTRY et CITY vers Redis Cloud
├── sql/            # Fichiers .sql pour recréer la base PostgreSQL: sakila-schema.sql et sakila-data.sql
├── .env.example	 # Modèle de configuration sans données sensibles, à copier en .env pour lancer le projet 
├── Enoncé projet   # Présentation du travail à faire
├── package         # Fichier principal listant les dépendances du projet Node.js
├── package-lock    # Fichier de verrouillage généré par npm pour garantir la cohérence des versions installées
├── README.md       # Documentation principale du projet (version française)
├── README.en.md    # Documentation principale du projet (version anglaise)

>  Avant de lancer le projet, créez un fichier `.env` à partir de `.env.example` et remplissez vos propres identifiants.

### Installation Redis Insight
- Connexion établie à Redis Cloud
- Base `redis.cloud` importée dans l’interface

###  PostgreSQL
- Base `sakila` créé depuis PgAdmin
- Fichiers importés : `sakila-schema.sql`, `sakila-data.sql`
- Détection de conflits dans les contraintes entre staff et store, résolution avec modif de store_id (NULL autorisé)
	

### Création du script redis/migrate_country.js
- Initialisation du projet Node.js via :
  ```bash
  npm init -y
  npm install pg ioredis```
- Fichier package.json contient :
- Dépendances : pg, ioredis
- Script principal : migrate_country.js
- Script personnalisé 
"scripts": {
  "migrate:country": "node migrate_country.js"
}
- Exécution rapide : npm run migrate:country
- Script Node.js utilisant :
- pg → Connexion à PostgreSQL (sakila)
- ioredis → Insertion des données dans Redis Cloud via endpoint non-TLS (port 11980)
- Format des clés générées dans Redis :
country:<id> → {
  name: <nom du pays>,
  updated_at: <timestamp ISO>
}
- Exemple de contenu réel pour country:1
{
  "name": "Japan",
  "updated_at": "2006-02-15T04:44:00.000Z"
}
- Execution du script :
	npm run migrate:country
- Resultat console :
	Connexion à PostgreSQL établie  
	Données COUNTRY récupérées (109 lignes) 
	Clés country:<id> insérées dans Redis Cloud
- Résultat validé dans Redis Insight :
	Clés visibles via le filtre country:*
	Données correctement formatées (objet JSON)
	Concordance confirmée avec les données PostgreSQL

### Création du script redis/migrate_city.js :
- Exécution rapide : npm run migrate:city
- Script Node.js ajouté dans le dossier redis/
- Utilise :
- pg → Connexion à PostgreSQL (sakila)
- ioredis → Insertion des données dans Redis Cloud via endpoint non-TLS (port 11980)
- Format des clés générées dans Redis :
city:<id> → {
  name: <nom de la ville>,
  country_id: <id du pays associé>,
  updated_at: <timestamp ISO>
}
- Exemple de contenu réel pour city:1 :
{
  "name": "Aguascalientes",
  "country_id": 60,
  "updated_at": "2006-02-15T04:44:00.000Z"
}
- Exécution du script :
	npm run migrate:city
- Résultat console :
	Connexion à PostgreSQL établie 
	Données CITY récupérées (600+ lignes)  
	Clés city:<id> insérées dans Redis Cloud
- Résultat validé dans Redis Insight :
	Clés visibles via le filtre city:*
	Données correctement formatées (objet JSON)
	Concordance confirmée avec les données PostgreSQL

### Variables d’environnement (.env)

Les paramètres sensibles (identifiants, mots de passe, host Redis/PostgreSQL...) sont regroupés dans le fichier `.env`, non versionné dans Git.

Format typique :

```env
PG_USER=postgres
PG_PASSWORD=*****
PG_HOST=localhost
PG_PORT=5432
PG_DB=sakila

REDIS_HOST=***
REDIS_PORT=11980
REDIS_USERNAME=default
REDIS_PASSWORD=*****

Chargé automatiquement par le module dotenv. Les scripts migrate_country.js et migrate_city.js utilisent process.env pour plus de sécurité et de portabilité.
Exemple de structure disponible dans `.env.example`

### MongoDB & Compass

MongoDB est utilisé dans ce projet pour migrer et structurer les données NoSQL via Atlas et Compass.

- MongoDB Compass installé (version 1.38 ou plus)
- Cluster créé sur MongoDB Atlas (base sakila)
- Connexion établie via chaîne URI (Compass ou driver Node.js)
- Accès autorisé via IP publique ou `0.0.0.0/0` (mode test)
- Collection `film` créée dans la base `sakila` pour valider la migration
- Les collections actor, language, et category seront ajoutées à mesure que la migration progresse.

- Chaîne de connexion stockée dans un fichier .env.
	MONGO_URI=mongodb+srv://sakila_user:<password>@cluster0.xxxxx.mongodb.net/sakila
	Exemple de structure disponible dans docs/.env.example
- Visualisation et vérification
	L'accès aux données NoSQL se fait via MongoDB Compass :
	Connexion au cluster via l'URI mentionnée dans .env
	Parcours visuel des collections et documents
	Vérification des migrations et formats JSON

- Script Node.js placé dans le dossier mongodb/
- Initialisation du projet déjà centralisée (npm init + package.json à la racine)
- Dépendances utilisées :
- pg → Requête des données PostgreSQL
- mongodb → Insertion dans MongoDB Atlas
- dotenv → Chargement des variables d’environnement depuis .env

### Création du script mongodb/migrate_film.js :

- Structure des documents MongoDB insérés :
film:<id> → {
  film_id: <id>,
  title: <titre du film>,
  release_year: <année>,
  language_id: <id langue>,
  last_update: <timestamp ISO>
}
- Exemple réel :
{
  "film_id": 1,
  "title": "ACADEMY DINOSAUR",
  "release_year": 2006,
  "language_id": 1,
  "last_update": "2006-02-15T05:03:42.000Z"
}
- Exécution du script :
	node mongodb/migrate_film.js
- Résultat console :
	Connexions établies  
	1000 films migrés vers MongoDB
- Résultat validé dans MongoDB Compass :
	Documents visibles dans la collection film
	Structure JSON conforme aux données PostgreSQL
	Connexions et insertions vérifiées en conditions réelles

### Création du script mongodb/migrate_actor.js :
- Structure des documents MongoDB insérés :
actor:<id> → {
  actor_id: <id>,
  first_name: <prénom>,
  last_name: <nom>,
  last_update: <timestamp ISO>
}
- Exemple réel :
{
  "actor_id": 7,
  "first_name": "GRACE",
  "last_name": "MOSTEL",
  "last_update": "2006-02-15T04:34:33.000Z"
}
- Exécution du script :
	node mongodb/migrate_actor.js
- Resultat console
 	Connexions établies  
	200 acteurs migrés vers MongoDB
- Résultat validé dans MongoDB Compass :
	Documents visibles dans la collection actor
	Structure JSON conforme aux données PostgreSQL
	Connexions et insertions vérifiées en conditions réelles

### Création du script mongodb/migrate_language.js :

- Structure des documents MongoDB insérés :
language:<id> → {
  language_id: <id>,
  name: <nom de la langue>,
  last_update: <timestamp ISO>
}
- Exemple réel :
{
  "language_id": 1,
  "name": "English",
  "last_update": "2006-02-15T05:02:19.000Z"
}

- Exécution du script :
	node mongodb/migrate_language.js
- Résultat console :
	Connexions établies  
	7 langues migrées vers MongoDB
- Résultat validé dans MongoDB Compass :
	Documents visibles dans la collection language
	Structure JSON conforme aux données PostgreSQL
	Connexions et insertions vérifiées en conditions réelles

### Création du script mongodb/migrate_category.js :

- Structure des documents MongoDB insérés :
category:<id> → {
  category_id: <id>,
  name: <nom de la catégorie>,
  last_update: <timestamp ISO>
}
- Exemple réel :
{
  "category_id": 4,
  "name": "Action",
  "last_update": "2006-02-15T04:46:27.000Z"
}
- Exécution du script :
	node mongodb/migrate_category.js
- Résultat console :
	Connexions établies  
	16 catégories migrées vers MongoDB
- Résultat validé dans MongoDB Compass :
	Documents visibles dans la collection category
	Structure JSON conforme aux données PostgreSQL
	Connexions et insertions vérifiées en conditions réelles


# Auteur

Projet réalisé par **Mohamed Bakkar** dans le cadre de la formation sur la migration de bases relationnelles vers NoSQL.

GitHub : [MBakkar2705](https://github.com/MBakkar2705)
