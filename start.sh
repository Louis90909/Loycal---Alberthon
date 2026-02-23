#!/bin/bash

# Script de démarrage automatique pour Loycal (Local Mode)
# Ce script démarre le backend NestJS et le frontend Vite

echo "🚀 Démarrage de Loycal (Local Mode)..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Vérifier les prérequis
echo "📋 Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

# Vérifier si les ports sont libres
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Le port 3000 est déjà utilisé${NC}"
fi

if check_port 3001; then
    echo -e "${YELLOW}⚠️  Le port 3001 est déjà utilisé${NC}"
fi

# Vérifier les fichiers .env
echo ""
echo "📝 Vérification des fichiers de configuration..."

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env n'existe pas${NC}"
    echo "   Créez-le avec vos identifiants Supabase :"
    echo "   DATABASE_URL=\"postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true\""
    echo "   DIRECT_URL=\"postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres\""
    echo "   JWT_SECRET=\"votre-secret-jwt\""
    echo "   JWT_EXPIRES_IN=\"7d\""
    echo "   GEMINI_API_KEY=\"votre-cle-api\""
    echo "   PORT=3001"
    echo ""
fi

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env (racine) n'existe pas${NC}"
    echo "   Créez-le avec :"
    echo "   VITE_API_URL=http://localhost:3001"
    echo "   VITE_USE_REAL_API=true"
    echo ""
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances frontend..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances backend..."
    cd backend
    npm install
    cd ..
fi

# Générer Prisma Client si nécessaire
if [ ! -d "backend/node_modules/.prisma" ]; then
    echo "🔧 Génération du client Prisma..."
    cd backend
    npx prisma generate
    cd ..
fi

# Démarrer le backend
echo ""
echo "🔧 Démarrage du backend (NestJS)..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Vérifier que le backend a démarré
if check_port 3001; then
    echo -e "${GREEN}✅ Backend démarré sur http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Le backend n'a pas démarré. Vérifiez backend.log${NC}"
fi

# Démarrer le frontend
echo ""
echo "🎨 Démarrage du frontend (Vite)..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# Vérifier que le frontend a démarré
if check_port 3000; then
    echo -e "${GREEN}✅ Frontend démarré sur http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Le frontend n'a pas démarré. Vérifiez frontend.log${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Démarrage terminé !${NC}"
echo ""
echo "📊 Services :"
echo "   - Frontend : http://localhost:3000"
echo "   - Backend  : http://localhost:3001"
echo ""
echo "📝 Logs :"
echo "   - Backend  : tail -f backend.log"
echo "   - Frontend : tail -f frontend.log"
echo ""
echo "🛑 Pour arrêter :"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Attendre la fin
wait









