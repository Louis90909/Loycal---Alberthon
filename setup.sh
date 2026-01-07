#!/bin/bash

# Script de setup initial pour Loycal
# À exécuter APRÈS l'installation de Node.js

echo "🚀 Configuration initiale de Loycal..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    echo "Consultez INSTALLER_NODEJS.md pour les instructions."
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"
echo "✅ npm détecté: $(npm --version)"

# Installer les dépendances frontend
echo ""
echo "📦 Installation des dépendances frontend..."
npm install

# Installer les dépendances backend
echo ""
echo "📦 Installation des dépendances backend..."
cd backend
npm install

# Générer le client Prisma
echo ""
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Lancer la migration
echo ""
echo "🗄️  Création des tables dans Supabase..."
npx prisma migrate dev --name init

cd ..

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "Pour démarrer l'application, exécutez :"
echo "  ./start.sh"
