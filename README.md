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
- 👥 **Multi-Role Support**: Separate interfaces for customers, restaurateurs, and administrators

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

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd loycal-ai
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Environment Variables**

   **Frontend** - Create `.env` in root:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_USE_REAL_API=true
   ```

   **Backend** - Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/loycal"
   JWT_SECRET="your-secret-key-here"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

5. **Setup Database**
   ```bash
   cd backend
   npm run prisma:migrate
   npm run prisma:generate
   ```

6. **Run the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
loycal-ai/
├── src/                      # Frontend source code
│   ├── admin/               # Admin interface
│   ├── auth/                # Authentication screens
│   ├── loyer/               # Customer app
│   ├── restaurateur/        # Restaurateur dashboard
│   └── shared/              # Shared components & utilities
├── backend/                 # Backend source code
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── restaurants/    # Restaurant management
│   │   ├── campaigns/      # Marketing campaigns
│   │   ├── loyalty/        # Loyalty program
│   │   ├── analytics/      # Business analytics
│   │   └── remi/           # AI assistant
│   └── prisma/             # Database schema
├── components/             # Shared UI components
├── services/               # API services
└── TECHNICAL_NOTE.md       # Technical documentation

```

## 🎯 Features Overview

### For Customers (Loyer App)
- Browse nearby restaurants
- View and book flash offers
- Make reservations
- Track loyalty points
- View visit history

### For Restaurateurs
- Manage restaurant profile
- Create marketing campaigns
- Monitor analytics and reports
- Access AI assistant (Rémi)
- Manage loyalty program
- POS system integration

### For Administrators
- Manage all restaurants
- View platform analytics
- User management
- System configuration

## 🧪 Testing

The application includes comprehensive testing capabilities:

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

## 📊 Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:
- Users (customers, restaurateurs, admins)
- Restaurants
- Campaigns & Promotions
- Reservations
- Loyalty Programs & Points
- Orders & Transactions
- AI Chat History

View the complete schema in `prisma-schema.prisma`.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation with class-validator

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For technical support or questions:
- Check the `TECHNICAL_NOTE.md` for detailed documentation
- Review `STATUS_FINAL.md` for project status
- See `PLAN_MIGRATION.md` for architecture details

---

**Status**: ✅ Production-Ready | 🚀 Deployment-Ready

Built with ❤️ for the restaurant industry
# Loycal---Alberthon
