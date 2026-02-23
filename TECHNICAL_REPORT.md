# Loycal - Detailed Technical Architecture Report

## 1. Project Overview & Business Logic
**Loycal** is a modern, AI-augmented Software-as-a-Service (SaaS) platform built specifically to digitize and enhance restaurant loyalty programs and customer engagement. 

The core value proposition relies on bridging the gap between physical point-of-sale (POS) systems, personalized marketing (Flash Promos & Campaigns), and intelligent customer interactions (RAG-powered AI). The platform caters to three user archetypes:
1. **Loyer (Customers)**: A seamless mobile-first interface to track points, books offers, and engage with the AI.
2. **Restaurateurs (B2B)**: A robust dashboard to orchestrate campaigns, monitor real-time POS analytics, and configure loyalty rules.
3. **Administrators**: Overarching command center for platform health, onboarding, and global metrics.

---

## 2. Global Architecture & Infrastructure
Loycal employs a modern decoupled architecture, splitting the Frontend interface from the core Backend logic. Both components are designed to scale independently, utilizing TypeScript across the entire ecosystem to maintain end-to-end type safety.

### 2.1 The Hybrid Database Strategy
Loycal employs a dual-database approach to balance real-time authentication speed with complex relational data integrity:

#### A. Firebase (Authentication & Real-time Synchronization)
Firebase is utilized exclusively for **Identity Access Management (IAM)** and client-side authentication handling.
- **Firebase Auth**: Manages secure user sign-ups, JWT token generation, password resets, and OAuth providers (Google/Apple). 
- **Firestore (Legacy/Sync)**: Previously used as the primary NoSQL backend, Firestore is now maintained purely for real-time synchronization tasks or rapid prototyping of mock data (via the `firebaseMigration.ts` script).

#### B. PostgreSQL (Primary Relational Data Store)
The core business logic demands strict ACID compliance, complex joins for analytics, and robust foreign-key constraints. Therefore, **PostgreSQL** serves as the ultimate source of truth.
- **Prisma ORM**: Acts as the bridge between the NestJS backend and PostgreSQL, providing type-safe database queries and automated schema migrations.
- **Schema Highlights**:
  - `User` table linked 1-to-1 with Firebase Auth UIDs.
  - Relational mapping between `Restaurants`, `Campaigns`, `Reservations`, and `Orders`.
  - Polymorphic or varied representations for `LoyaltyPrograms` (Points-based, Stamp-based, Mission-based).

### 2.2 Backend Architecture (NestJS)
The backend is a monolithic Node.js application built with **NestJS 10**, structured into highly cohesive domain modules.
- **Language**: TypeScript
- **AuthModule**: Intercepts Firebase JWTs, validates them using Passport.js, and maps requests to the internal Postgres `User` entity.
- **RestaurantsModule & PosModule**: Handles the core business entities. The POS module exposes endpoints capable of consuming webhooks from physical cash registers to automatically trigger loyalty point accruals.
- **CampaignsModule**: Manages the lifecycle of standard communications (SMS/Email simulations) and Flash Promotions (time-bound, quantity-limited offers).
- **LoyaltyModule**: The rules engine. It calculates point ratios, tracks stamps, and evaluates mission completions based on the customer's POS order history.

### 2.3 Artificial Intelligence Implementation (Rémi RAG System)
The standout technological feature of Loycal is "Rémi", the AI assistant powered by the **Google Gemini API**.
- **Retrieval-Augmented Generation (RAG)**: Rémi does not rely solely on pre-trained knowledge. The `AiModule` intercepts user queries and injects contextual data (the user's current points, nearby restaurant menus, active flash offers) into the Gemini prompt. 
- **Vectorization Roadmap**: Future iterations of the RAG system aim to vectorize unstructured data (e.g., PDF menus, reviews) using embeddings to perform semantic searches before token generation.

### 2.4 Frontend Architecture (React + Vite)
The client-facing application is a Single Page Application (SPA).
- **Tooling**: React 18, bundled via Vite 6.2 for ultra-fast Hot Module Replacement (HMR).
- **Styling**: TailwindCSS provides scalable utility classes. The project uses a custom UI component library (`src/shared/design`) to ensure design consistency across Loyer, Restaurateur, and Admin views.
- **Routing & State**: standard React routing handles the complex nested views of the Restaurateur dashboard. State is lifted or context-bound depending on the domain scope.
- **API Communication**: An Axios interceptor automatically attaches the Firebase JWT to every outgoing request heading to the NestJS backend.
- **Data Visualization**: Recharts is deeply integrated to render complex analytics (Visit frequency, Revenue over time, Customer segmentation) in the Restaurateur dashboard.

---

## 3. Security & CI/CD Practices
- **Role-Based Access Control (RBAC)**: Enforced via NestJS Guards. A customer cannot access POS or Campaign endpoints.
- **Secret Management**: `.env` files strictly separate configuration logic (e.g., Gemini API keys, Supabase/PostgreSQL connection strings).
- **Git History Auditing**: The repository recently underwent a BFG/Filter-Branch scrub to permanently rewrite its history, eliminating exposed legacy credentials and ensuring SOC2 compliance readiness.
- **Code Quality**: Enforced via ESLint and Prettier, with pre-configured TypeScript compilation rules.

---

## 4. Operational Status & Roadmap
Loycal is currently marked as **Production-Ready** for its MVP scope.

**Immediate Technical Roadmap:**
1. **Automated User Syncing**: Finalizing Cron jobs or webhook listeners to perfectly synchronize Firebase Auth deletion/creation events with the PostgreSQL `User` table to prevent orphaned records.
2. **Native Mobile App (React Native)**: Transitioning the `Loyer` web domain into a compiled iOS/Android application to leverage push notifications for Flash Campaigns.
3. **Advanced RAG Vector Store**: Implementing Pinecone or pgvector to store menu and customer preference embeddings for near-instant AI semantic matching.

---
*Report automatically generated from source code topology. Loycal Engineering Team - February 2026.*
