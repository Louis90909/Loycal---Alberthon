# Plan de Migration - Loycal

## 🎯 Objectif

Transformer Loycal d'une application prototype avec mocks en une application production-ready avec backend réel, base de données, RAG et design system cohérent.

## 📅 Phases de Migration

### Phase 1 : Audit et Documentation ✅ (EN COURS)

**Durée estimée** : 2-3 jours

- [x] Inventaire complet du code
- [x] Documentation architecture
- [x] Identification des dépendances mockBackend
- [ ] Création diagrammes de flux
- [ ] Documentation API cible

**Livrables** :
- `INVENTAIRE.md` ✅
- `ARCHITECTURE.md` ✅
- `PLAN_MIGRATION.md` ✅

---

### Phase 2 : Conception Backend et Base de Données

**Durée estimée** : 5-7 jours

#### 2.1 Schéma de Base de Données
- [ ] Finaliser schéma PostgreSQL (voir `ARCHITECTURE.md`)
- [ ] Créer migrations Prisma
- [ ] Définir relations et contraintes
- [ ] Créer index pour performance

#### 2.2 Initialisation Backend NestJS
- [ ] Créer projet NestJS
- [ ] Configurer Prisma
- [ ] Configurer JWT Auth
- [ ] Créer structure modules (auth, users, restaurants, etc.)

#### 2.3 API REST de Base
- [ ] Module Auth (login, register, refresh)
- [ ] Module Users (CRUD)
- [ ] Module Restaurants (CRUD, menu)
- [ ] Module Loyalty (programmes, adhésions)
- [ ] Tests unitaires API

**Livrables** :
- Backend NestJS fonctionnel
- Base de données PostgreSQL avec schéma complet
- APIs de base testées

---

### Phase 3 : Remplacement des Mocks par APIs Réelles

**Durée estimée** : 7-10 jours

#### 3.1 Service API Client (Frontend)
- [ ] Créer `src/shared/services/api.ts` (remplace mockBackend)
- [ ] Implémenter toutes les méthodes API
- [ ] Gestion erreurs et retry
- [ ] Intercepteurs axios/fetch

#### 3.2 Migration Authentification
- [ ] Remplacer `mockBackend.login()` par `api.auth.login()`
- [ ] Gestion tokens JWT (localStorage → httpOnly cookies si possible)
- [ ] Refresh tokens automatique

#### 3.3 Migration Restaurants
- [ ] `getRestaurants()` → API réelle
- [ ] `updateRestaurantProfile()` → API réelle
- [ ] `updateRestaurantMenu()` → API réelle
- [ ] Corriger bug `RestaurantProfileEditor` (chargement)

#### 3.4 Migration Campagnes
- [ ] `createCampaign()` → API réelle
- [ ] `createFlashPromotion()` → API réelle
- [ ] `getCampaigns()` → API réelle

#### 3.5 Migration Réservations
- [ ] Implémenter `createReservation()` réellement
- [ ] Afficher réservations existantes
- [ ] Gestion disponibilités

#### 3.6 Migration POS
- [ ] `savePOSOrder()` → API réelle
- [ ] `payOrder()` → API réelle
- [ ] Validation codes réelle

#### 3.7 Migration Analytics
- [ ] `getAnalytics()` → API réelle
- [ ] Connecter graphiques Recharts aux vraies données
- [ ] Implémenter rapports détaillés

**Livrables** :
- Frontend connecté à backend réel
- Plus aucune dépendance à mockBackend
- Toutes les fonctionnalités opérationnelles

---

### Phase 4 : Intégration RAG et Amélioration IA

**Durée estimée** : 5-7 jours

#### 4.1 Setup Vector Database
- [ ] Choisir Pinecone ou Qdrant
- [ ] Créer namespaces par restaurant
- [ ] Configurer embeddings (OpenAI ou Gemini)

#### 4.2 Service RAG
- [ ] Créer `rag.service.ts` dans backend
- [ ] Pipeline d'indexation (visits, campaigns, analytics)
- [ ] Fonction de recherche vectorielle
- [ ] Intégration avec Gemini

#### 4.3 Amélioration Rémi IA
- [ ] Corriger historique conversations (persister en DB)
- [ ] Enrichir contexte avec RAG
- [ ] Améliorer prompts
- [ ] Gestion erreurs robuste

#### 4.4 Génération Contenu IA
- [ ] Offres générées avec contexte
- [ ] Campagnes générées avec données réelles
- [ ] Insights analytiques automatiques

**Livrables** :
- RAG opérationnel
- Rémi IA avec contexte riche
- Génération contenu améliorée

---

### Phase 5 : Refonte UI/UX et Design System

**Durée estimée** : 7-10 jours

#### 5.1 Choix Design System
- [ ] Évaluer Material UI vs Chakra UI vs Tailwind UI
- [ ] Installer et configurer
- [ ] Créer thème cohérent (couleurs, typographie)

#### 5.2 Refonte Composants
- [ ] Créer composants de base (Button, Input, Card, etc.)
- [ ] Refonte Dashboard restaurateur
- [ ] Refonte app client (Loyer)
- [ ] Harmoniser libellés (français uniquement)

#### 5.3 Responsive Design
- [ ] Tester sur mobile/tablette/desktop
- [ ] Améliorer navigation mobile
- [ ] Optimiser formulaires

#### 5.4 Accessibilité
- [ ] Ajouter ARIA labels
- [ ] Navigation clavier
- [ ] Contraste couleurs

**Livrables** :
- Design system cohérent
- UI moderne et professionnelle
- Responsive et accessible

---

### Phase 6 : State Management et Optimisation

**Durée estimée** : 3-5 jours

#### 6.1 State Management
- [ ] Choisir Redux Toolkit ou Zustand
- [ ] Créer stores (auth, restaurants, loyalty, etc.)
- [ ] Migrer state local vers stores

#### 6.2 React Query
- [ ] Installer React Query
- [ ] Remplacer useEffect/fetch par useQuery
- [ ] Cache et invalidation automatique

#### 6.3 Optimisation Performance
- [ ] Lazy loading composants
- [ ] Code splitting
- [ ] Optimisation images
- [ ] Memoization

**Livrables** :
- State management centralisé
- Performance optimisée
- Cache intelligent

---

### Phase 7 : Tests et Qualité

**Durée estimée** : 5-7 jours

#### 7.1 Tests Unitaires
- [ ] Tests services backend (Jest)
- [ ] Tests composants React (Vitest + Testing Library)
- [ ] Coverage > 80%

#### 7.2 Tests d'Intégration
- [ ] Tests API end-to-end
- [ ] Tests flux utilisateur critiques

#### 7.3 E2E Tests
- [ ] Playwright ou Cypress
- [ ] Scénarios critiques (login, réservation, validation)

#### 7.4 Linting et Formatage
- [ ] ESLint configuré
- [ ] Prettier configuré
- [ ] Pre-commit hooks (Husky)

**Livrables** :
- Suite de tests complète
- Code qualité élevée
- Documentation tests

---

### Phase 8 : CI/CD et Déploiement

**Durée estimée** : 3-5 jours

#### 8.1 CI/CD Pipeline
- [ ] GitHub Actions ou GitLab CI
- [ ] Tests automatiques sur PR
- [ ] Build automatique
- [ ] Déploiement staging automatique

#### 8.2 Déploiement Production
- [ ] Backend : Railway/Render/AWS
- [ ] Database : Supabase/Neon/AWS RDS
- [ ] Frontend : Vercel/Netlify
- [ ] Vector DB : Pinecone (cloud)

#### 8.3 Monitoring
- [ ] Sentry pour erreurs
- [ ] Analytics (Google Analytics ou Plausible)
- [ ] Logs centralisés

**Livrables** :
- Pipeline CI/CD opérationnel
- Application déployée en production
- Monitoring configuré

---

## 📊 Planning Global

| Phase | Durée | Priorité | Dépendances |
|-------|-------|----------|-------------|
| Phase 1 | 2-3j | 🔴 Critique | Aucune |
| Phase 2 | 5-7j | 🔴 Critique | Phase 1 |
| Phase 3 | 7-10j | 🔴 Critique | Phase 2 |
| Phase 4 | 5-7j | 🟡 Important | Phase 3 |
| Phase 5 | 7-10j | 🟡 Important | Phase 3 |
| Phase 6 | 3-5j | 🟢 Optionnel | Phase 5 |
| Phase 7 | 5-7j | 🟡 Important | Phase 3-6 |
| Phase 8 | 3-5j | 🟡 Important | Phase 7 |

**Durée totale estimée** : 37-54 jours (7-11 semaines)

## 🎯 Priorités Court Terme (2 semaines)

1. **Phase 2** : Backend et base de données fonctionnels
2. **Phase 3.1-3.3** : Migration auth et restaurants
3. **Phase 3.4** : Migration campagnes
4. **Corrections bugs** : RestaurantProfileEditor, RemiExpertHub

## 🚨 Risques et Mitigation

### Risque 1 : Complexité migration données
- **Mitigation** : Scripts de migration progressifs, tests sur copie DB

### Risque 2 : RAG complexe à implémenter
- **Mitigation** : Commencer simple (indexation basique), itérer

### Risque 3 : Performance avec vraie DB
- **Mitigation** : Index appropriés, cache Redis, pagination

### Risque 4 : Rétrocompatibilité
- **Mitigation** : Versioning API, migration progressive

## 📝 Checklist Démarrage

- [ ] Créer repository backend séparé (ou monorepo)
- [ ] Setup environnement développement (Docker Compose pour PostgreSQL)
- [ ] Créer compte Pinecone/Qdrant
- [ ] Configurer variables d'environnement
- [ ] Documenter processus de développement

## 🔄 Itérations

Chaque phase peut être itérative :
- **Sprint 1** : Phase 2 (Backend base)
- **Sprint 2** : Phase 3.1-3.4 (Migration partielle)
- **Sprint 3** : Phase 3.5-3.7 + Phase 4 (RAG)
- **Sprint 4** : Phase 5 (UI/UX)
- **Sprint 5** : Phase 6-8 (Finalisation)

## 📞 Points de Contrôle

- **Fin Phase 2** : Backend opérationnel, APIs testées
- **Fin Phase 3** : Frontend connecté, fonctionnalités critiques OK
- **Fin Phase 4** : RAG opérationnel, Rémi amélioré
- **Fin Phase 5** : UI/UX professionnelle
- **Fin Phase 7** : Tests complets, qualité code
- **Fin Phase 8** : Production déployée








