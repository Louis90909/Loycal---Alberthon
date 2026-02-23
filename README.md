# 🎯 Loycal - AI-Powered Loyalty Platform for Restaurants

<div align="center">
  <img width="1200" height="475" alt="Loycal Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Loycal** is a comprehensive loyalty and customer engagement platform designed specifically for restaurants. It combines modern web technologies with AI-powered features to help restaurateurs build stronger relationships with their customers.

## ✨ Key Features

- 🤖 **AI Assistant (Rémi)**: Intelligent chatbot powered by Google Gemini with RAG for personalized recommendations
- 🎁 **Loyalty Program**: Points-based system with automated rewards and visit tracking
- ⚡ **Flash Campaigns**: Time-limited promotional offers to drive customer engagement
- 💳 **POS Integration**: Point-of-sale system with real-time order management
- 📊 **Analytics Dashboard**: Comprehensive business insights with interactive charts
- 📅 **Reservations**: Real-time booking system with instant confirmation
- 👥 **Multi-Role Support**: Separate interfaces for Customers, Restaurateurs, and Administrators

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6.2
- **UI**: Custom component library with responsive design
- **Charts**: Recharts for data visualization
- **API Client**: Axios with JWT authentication

### Backend
- **Framework**: NestJS 10 (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **AI**: Google Gemini API with RAG implementation
- **Architecture**: RESTful API with 35+ endpoints

## 📁 Project Structure

```text
loycal-ai/
├── src/                      # Frontend main source code
│   ├── admin/               # Admin interface
│   ├── auth/                # Authentication screens
│   ├── loyer/               # Customer app views
│   ├── restaurateur/        # Restaurateur dashboard views
│   └── shared/              # Shared logic and types
├── components/               # Reusable React UI components
├── services/                 # Frontend API services
├── backend/                 # Backend infrastructure (NestJS)
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── restaurants/    # Restaurant management
│   │   ├── campaigns/      # Marketing campaigns
│   │   ├── loyalty/        # Loyalty program
│   │   ├── analytics/      # Business analytics
│   │   └── ai/             # AI integrations (Gemini, RAG)
│   └── prisma/             # Database schema
└── package.json            # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Gemini API key

### 1. Clone & Install
```bash
git clone https://github.com/Louis90909/Loycal---Alberthon.git
cd Loycal---Alberthon

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd backend
npm install
```

### 2. Environment Configuration

**Frontend** - Create `.env` in the root folder:
```env
VITE_API_URL=http://localhost:3001
VITE_USE_REAL_API=true
```

**Backend** - Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/loycal"
JWT_SECRET="your-secret-key-here"
PORT=3001
FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Database Setup
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 4. Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
# In the root project folder
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📄 Documentation & Links

More details can be found in the following files available in the root folder:
- `TECHNICAL_DOCUMENTATION.md` - In-depth technical specs and architecture.
- `PLAN_MIGRATION.md` - Migration and structural planning.
- `STATUS_FINAL.md` - Overall system status map.

---

**Status**: ✅ Production-Ready | 🚀 Deployment-Ready

Built with ❤️ for the restaurant industry.
