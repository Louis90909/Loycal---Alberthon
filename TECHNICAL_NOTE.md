# Loycal - Technical Note
**AI-Powered Loyalty Platform for Restaurants**

---

## 📋 Project Overview

**Loycal** is a comprehensive loyalty and customer engagement platform designed specifically for restaurants. It combines modern web technologies with AI-powered features to help restaurateurs build stronger relationships with their customers while providing an intuitive experience for both business owners and patrons.

### Key Features
- **Multi-Role Architecture**: Separate interfaces for customers (Loyer), restaurateurs, and administrators
- **AI Assistant (Rémi)**: Intelligent chatbot powered by Google Gemini with RAG (Retrieval-Augmented Generation) for personalized recommendations and campaign generation
- **Loyalty Program**: Points-based system with automated rewards and visit tracking
- **Flash Campaigns**: Time-limited promotional offers to drive customer engagement
- **POS Integration**: Point-of-sale system with real-time order management and payment processing
- **Analytics Dashboard**: Comprehensive business insights with interactive charts and detailed reports
- **Real-time Reservations**: Booking system with instant confirmation and management

---

## 🎥 Demo Video

**Watch the full demonstration (3-5 minutes):**  
🔗 **[Loom Video - Loycal Platform Demo](https://www.loom.com/share/ac601be9eaa04b0baa69bc3be8448c98)**  

The demo showcases:
- User authentication flow (customer & restaurateur)
- Restaurant discovery and flash offer browsing
- Reservation booking process
- Restaurateur dashboard with analytics
- AI assistant (Rémi) interaction
- Loyalty program management
- Campaign creation workflow

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.2
- **UI Components**: Custom component library with responsive design
- **Charts**: Recharts for data visualization
- **State Management**: React hooks with custom service layer
- **API Client**: Axios with JWT authentication

### Backend
- **Framework**: NestJS 10 (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **AI Integration**: Google Gemini API with RAG implementation
- **API Architecture**: RESTful with 35+ endpoints across 9 modules

### Architecture Highlights
- **Modular Design**: Separation of concerns with dedicated modules (Auth, Restaurants, Campaigns, Loyalty, Analytics, etc.)
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Real API Integration**: Complete migration from mock data to production-ready REST APIs
- **Scalable Database Schema**: Comprehensive Prisma schema with relational data models

---

## 🚀 Key Achievements

### Development Milestones
1. **Complete Backend Implementation**: 9 NestJS modules with ~35 REST endpoints
2. **Frontend Migration**: Successfully migrated 14 components from mock data to real API integration
3. **Bug Fixes**: Resolved 3 critical bugs (profile editor, reservations, AI chat)
4. **Feature Activation**: Enabled real reservations and AI chat with RAG
5. **Database Design**: Comprehensive schema supporting all business requirements

### Technical Innovations
- **Intelligent AI Assistant**: Context-aware chatbot that learns from restaurant data
- **Automated Loyalty System**: Points attribution based on spending with configurable rules
- **Dynamic Campaign Engine**: Flexible promotion system with time-based offers
- **Real-time Analytics**: Live business metrics with historical trend analysis

---

## 📦 Installation & Setup

```bash
# Frontend
npm install
# Configure .env with VITE_API_URL and VITE_USE_REAL_API=true
npm run dev

# Backend
cd backend
npm install
# Configure .env with DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm run prisma:migrate
npm run start:dev
```

**Prerequisites**: Node.js, PostgreSQL, Gemini API key

---

## 📚 Appendix: GitHub Repository

**Full source code and documentation:**  
🔗 **[GitHub Repository - Loycal](#)**  
*(Link to be added - User will create repository)*

### Repository Contents
- Complete source code (Frontend + Backend)
- Comprehensive README with setup instructions
- Database schema and migration files
- API documentation
- Architecture diagrams
- Development status reports

### Documentation Files
- `README.md` - Quick start guide
- `STATUS_FINAL.md` - Project completion status
- `PLAN_MIGRATION.md` - Migration strategy details
- `prisma-schema.prisma` - Complete database schema

---

## 🎯 Conclusion

Loycal demonstrates a production-ready, full-stack application that successfully integrates modern web technologies with AI capabilities. The platform addresses real business needs in the restaurant industry while maintaining code quality, scalability, and user experience excellence.

**Status**: ✅ 100% Functional | ✅ Production-Ready | 🚀 Deployment-Ready

---

*Technical Note - Loycal Platform | January 2026*
