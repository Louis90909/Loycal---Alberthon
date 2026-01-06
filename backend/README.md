# Loycal Backend API

Backend NestJS pour l'application Loycal - Programme de fidélité pour restaurants.

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### Étapes

1. **Installer les dépendances**
   ```bash
   cd backend
   npm install
   ```

2. **Configurer la base de données**
   
   Créer un fichier `.env` à la racine du dossier `backend` :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/loycal?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Créer la base de données PostgreSQL**
   ```bash
   createdb loycal
   # ou via psql
   psql -U postgres
   CREATE DATABASE loycal;
   ```

4. **Générer le client Prisma**
   ```bash
   npx prisma generate
   ```

5. **Exécuter les migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Démarrer le serveur**
   ```bash
   npm run start:dev
   ```

Le serveur sera accessible sur `http://localhost:3001`

## 📡 Endpoints API

### Authentification

- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription client
- `GET /auth/me` - Profil utilisateur actuel (protégé)

### Utilisateurs

- `GET /users/me` - Profil utilisateur actuel
- `GET /users/:id` - Détails utilisateur
- `GET /users` - Liste tous les utilisateurs (admin)

### Restaurants

- `GET /restaurants` - Liste restaurants (actifs par défaut)
- `GET /restaurants/:id` - Détails restaurant
- `PUT /restaurants/:id` - Mettre à jour restaurant (protégé)
- `PUT /restaurants/:id/menu` - Mettre à jour carte (protégé)

### Loyalty (Fidélité)

- `POST /loyalty/visits` - Valider une visite (protégé)
- `GET /loyalty/memberships` - Adhésions de l'utilisateur (protégé)
- `GET /loyalty/memberships/:restaurantId` - Adhésion spécifique (protégé)
- `GET /loyalty/programs/:restaurantId` - Programme fidélité d'un restaurant
- `POST /loyalty/programs` - Créer un programme fidélité (protégé)

### Campaigns (Campagnes)

- `POST /campaigns` - Créer une campagne (protégé)
- `GET /campaigns/:restaurantId` - Campagnes d'un restaurant
- `POST /campaigns/flash` - Créer une vente flash (protégé)
- `GET /campaigns/flash/:restaurantId` - Promotions flash d'un restaurant
- `GET /campaigns/flash` - Toutes les promotions flash actives

### Reservations

- `POST /reservations` - Créer une réservation (protégé)
- `GET /reservations/me` - Réservations de l'utilisateur (protégé)
- `DELETE /reservations/:id` - Annuler une réservation (protégé)

### Analytics

- `GET /analytics/:restaurantId` - Statistiques d'un restaurant (protégé)
- `GET /analytics/:restaurantId/revenue-forecast` - Prévision revenus (protégé)
- `GET /analytics/:restaurantId/customer-segments` - Segmentation clients (protégé)

### POS (Système de Caisse)

- `POST /pos/orders` - Créer une commande (protégé)
- `GET /pos/orders/:restaurantId` - Commandes d'un restaurant (protégé)
- `GET /pos/orders/detail/:id` - Détails d'une commande (protégé)
- `PUT /pos/orders/:id/pay` - Payer une commande (protégé)
- `PUT /pos/orders/:id/status` - Mettre à jour le statut (protégé)
- `DELETE /pos/orders/:id` - Supprimer une commande (protégé)

### AI (Rémi IA)

- `POST /ai/chat` - Chat avec Rémi (protégé, avec RAG)
- `POST /ai/generate-offer` - Générer une offre (protégé)
- `POST /ai/generate-campaign` - Générer une campagne (protégé)

## 🔐 Authentification

Les endpoints protégés nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

Le token est retourné lors de la connexion ou de l'inscription.

## 📊 Base de Données

### Prisma Studio

Pour visualiser et gérer la base de données :
```bash
npm run prisma:studio
```

### Migrations

Créer une nouvelle migration :
```bash
npm run prisma:migrate
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Structure

```
backend/
├── src/
│   ├── auth/              # Authentification JWT
│   ├── users/             # Gestion utilisateurs
│   ├── restaurants/       # Gestion restaurants
│   ├── loyalty/           # Programme fidélité
│   ├── campaigns/         # Campagnes marketing
│   ├── reservations/      # Réservations
│   ├── pos/               # Système de caisse
│   ├── analytics/         # Analytics
│   ├── ai/                # IA & RAG
│   └── database/          # Prisma service
├── prisma/
│   └── schema.prisma      # Schéma base de données
└── package.json
```

## ✅ Modules Implémentés

- [x] Auth (authentification JWT)
- [x] Users (gestion utilisateurs)
- [x] Restaurants (CRUD restaurants et menu)
- [x] Loyalty (programme fidélité, adhésions, visites)
- [x] Campaigns (campagnes, promotions flash)
- [x] Reservations (réservations)
- [x] Analytics (statistiques, rapports)
- [x] POS (système de caisse)
- [x] AI (Rémi IA avec RAG basique)

## 🎉 Tous les modules sont implémentés !

## 🔄 Prochaines Étapes

1. Implémenter module Loyalty
2. Implémenter module Campaigns
3. Implémenter module Reservations
4. Implémenter module Analytics
5. Implémenter module AI avec RAG

## 📚 Documentation

Voir les fichiers dans le dossier parent :
- `ARCHITECTURE.md` - Architecture complète
- `PLAN_MIGRATION.md` - Plan de migration
- `DEPENDENCIES_MOCKBACKEND.md` - Migration depuis mockBackend

