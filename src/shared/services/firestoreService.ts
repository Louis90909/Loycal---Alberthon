/**
 * Service Firestore pour Loycal
 * Remplace api.ts pour toutes les opérations CRUD via Firebase
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    setDoc,
} from 'firebase/firestore';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    getAuth,
    type User as FirebaseUser,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { auth, db } from './firebase';
import app from './firebase';
import type {
    User,
    Restaurant,
    Campaign,
    FlashPromotion,
    Reservation,
    MenuItem,
    POSOrder,
    Customer,
} from '../types';

// ============================================
// HELPERS
// ============================================

const toDate = (ts: any): string => {
    if (!ts) return new Date().toISOString();
    if (ts instanceof Timestamp) return ts.toDate().toISOString();
    if (typeof ts === 'string') return ts;
    return new Date().toISOString();
};

// ============================================
// FIRESTORE SERVICE CLASS
// ============================================

class FirestoreService {
    private listeners: Function[] = [];
    private currentUser: User | null = null;
    private authUnsubscribe: (() => void) | null = null;
    private userDocUnsubscribe: (() => void) | null = null;
    private authReady: boolean = false;

    // Caches temps réel — mis à jour via onSnapshot
    private _usersCache: User[] = [];
    private _restaurantsCache: Restaurant[] = [];
    private _usersSnapUnsub: (() => void) | null = null;
    private _restaurantsSnapUnsub: (() => void) | null = null;

    constructor() {
        // Écouter les changements d'état d'authentification
        this.authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            // Annuler l'écoute de l'ancien profil
            if (this.userDocUnsubscribe) {
                this.userDocUnsubscribe();
                this.userDocUnsubscribe = null;
            }

            if (firebaseUser) {
                // Écoute TEMPS RÉEL du profil Firestore
                const userRef = doc(db, 'users', firebaseUser.uid);
                this.userDocUnsubscribe = onSnapshot(userRef, async (snap) => {
                    if (!snap.exists()) {
                        // Profil supprimé de Firestore → déconnexion
                        console.warn('[Auth] Profil utilisateur supprimé de Firestore — déconnexion');
                        this.currentUser = null;
                        await signOut(auth);
                    } else {
                        const userData = { id: firebaseUser.uid, ...snap.data() } as User;
                        if (userData.status === 'SUSPENDED') {
                            // Compte suspendu → déconnexion immédiate
                            console.warn('[Auth] Compte suspendu — déconnexion forcée');
                            this.currentUser = null;
                            localStorage.removeItem('user');
                            await signOut(auth);
                        } else {
                            this.currentUser = userData;
                        }
                    }
                    this.authReady = true;
                    this.notifyListeners();
                }, (error) => {
                    console.error('[Auth] Erreur écoute profil:', error);
                    this.authReady = true;
                    this.notifyListeners();
                });
            } else {
                this.currentUser = null;
                this.authReady = true;
                this.notifyListeners();
            }
        });

        // Écoute temps réel des collections globales
        this._startCollectionListeners();
    }

    /**
     * onSnapshot sur collections users + restaurants.
     * Tout changement (console Firebase, backend, autre client) se propage automatiquement.
     */
    private _startCollectionListeners() {
        this._usersSnapUnsub = onSnapshot(
            collection(db, 'users'),
            (snap) => {
                this._usersCache = snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
                this.notifyListeners();
            },
            (err) => console.error('[onSnapshot users]', err)
        );

        this._restaurantsSnapUnsub = onSnapshot(
            collection(db, 'restaurants'),
            (snap) => {
                this._restaurantsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
                this.notifyListeners();
            },
            (err) => console.error('[onSnapshot restaurants]', err)
        );
    }

    isAuthReady(): boolean {
        return this.authReady;
    }

    subscribe(listener: Function) {
        this.listeners.push(listener);
        // Ne pas appeler listener() immédiatement — attendre que Firebase soit prêt
        // Sauf si l'auth est déjà résolue (ex: re-subscribe après reconnexion)
        if (this.authReady) {
            listener();
        }
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach((listener) => listener());
    }

    // ============================================
    // AUTH
    // ============================================

    async login(email: string, password: string): Promise<User> {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
            if (!userDoc.exists()) {
                await signOut(auth);
                throw new Error('Profil utilisateur introuvable');
            }
            const userData = { id: credential.user.uid, ...userDoc.data() } as User;
            if (userData.status === 'SUSPENDED') {
                await signOut(auth);
                throw new Error('Ce compte a été suspendu. Contactez l\'administrateur.');
            }
            this.currentUser = userData;
            localStorage.setItem('user', JSON.stringify(userData));
            this.notifyListeners();
            return userData;
        } catch (error: any) {
            const msg = error.code === 'auth/invalid-credential'
                ? 'Email ou mot de passe incorrect'
                : error.message || 'Erreur de connexion';
            throw new Error(msg);
        }
    }

    async registerClient(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ): Promise<User> {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const userData: Omit<User, 'id'> = {
                email,
                firstName,
                lastName,
                role: 'CLIENT',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', credential.user.uid), userData);
            const user = { id: credential.user.uid, ...userData };
            this.currentUser = user;
            localStorage.setItem('user', JSON.stringify(user));
            this.notifyListeners();
            return user;
        } catch (error: any) {
            const msg = error.code === 'auth/email-already-in-use'
                ? 'Cet email est déjà utilisé'
                : error.message || 'Erreur d\'inscription';
            throw new Error(msg);
        }
    }

    logout() {
        signOut(auth);
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.notifyListeners();
    }

    getCurrentUser(): User | null {
        if (this.currentUser) return this.currentUser;
        // Fallback localStorage pour compatibilité
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    // ============================================
    // ADMIN — lecture temps réel (via caches onSnapshot)
    // ============================================

    /**
     * Retourne tous les utilisateurs depuis le cache temps réel.
     * Mis à jour automatiquement dès qu'un changement est fait dans Firestore
     * (console Firebase, backend, admin panel).
     */
    async getUsersAdmin(): Promise<User[]> {
        // Si le cache est vide (premier appel très rapide), on attend un peu
        if (this._usersCache.length === 0) {
            const snap = await getDocs(collection(db, 'users'));
            this._usersCache = snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
        }
        return this._usersCache;
    }

    /**
     * Retourne tous les restaurants (actifs + inactifs) depuis le cache temps réel.
     */
    async getAllRestaurantsAdmin(): Promise<Restaurant[]> {
        if (this._restaurantsCache.length === 0) {
            const snap = await getDocs(collection(db, 'restaurants'));
            this._restaurantsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        }
        return this._restaurantsCache;
    }

    // ============================================
    // RESTAURANTS
    // ============================================

    async getRestaurants(activeOnly: boolean = true): Promise<Restaurant[]> {
        // Utilise le cache temps réel (mis à jour par onSnapshot en continu)
        if (this._restaurantsCache.length > 0) {
            return activeOnly
                ? this._restaurantsCache.filter((r: any) => r.status === 'ACTIVE')
                : this._restaurantsCache;
        }
        // Fallback premier chargement (cache pas encore rempli)
        try {
            const q = activeOnly
                ? query(collection(db, 'restaurants'), where('status', '==', 'ACTIVE'))
                : query(collection(db, 'restaurants'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            return [];
        }
    }

    async getRestaurant(id: number | string): Promise<Restaurant | null> {
        try {
            const docRef = doc(db, 'restaurants', String(id));
            const snap = await getDoc(docRef);
            if (!snap.exists()) return null;
            return { id: snap.id, ...snap.data() } as any;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            return null;
        }
    }

    async updateRestaurantProfile(restaurantId: number | string, data: Partial<Restaurant>): Promise<void> {
        try {
            await updateDoc(doc(db, 'restaurants', String(restaurantId)), {
                ...data,
                updatedAt: serverTimestamp(),
            });
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de mise à jour');
        }
    }

    async updateRestaurantMenu(restaurantId: number | string, menu: MenuItem[]): Promise<void> {
        try {
            await updateDoc(doc(db, 'restaurants', String(restaurantId)), {
                menu,
                updatedAt: serverTimestamp(),
            });
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de mise à jour menu');
        }
    }

    // ============================================
    // LOYALTY
    // ============================================

    async getMemberships(userId: string) {
        try {
            const q = query(collection(db, 'memberships'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (error) {
            console.error('Error fetching memberships:', error);
            return [];
        }
    }

    async getRestaurantCustomers(restaurantId: number | string): Promise<Customer[]> {
        try {
            const q = query(
                collection(db, 'memberships'),
                where('restaurantId', '==', String(restaurantId))
            );
            const snap = await getDocs(q);
            if (snap.empty) return [];

            const customers: Customer[] = [];
            for (const d of snap.docs) {
                const mem = d.data();
                let userObj = { firstName: 'Client', lastName: 'Inconnu', avatarUrl: 'https://i.pravatar.cc/150?u=' + mem.userId };
                try {
                    const uSnap = await getDoc(doc(db, 'users', mem.userId));
                    if (uSnap.exists()) {
                        const uData = uSnap.data();
                        userObj = { ...userObj, ...uData } as any;
                    }
                } catch (e) { }

                customers.push({
                    id: mem.userId,
                    name: `${userObj.firstName} ${userObj.lastName}`.trim(),
                    avatarUrl: userObj.avatarUrl,
                    visitsPerMonth: Math.round((mem.stamps || 0) / 3) || 1,
                    lastVisit: 'Il y a 2 jours', // Valeur par défaut / approximative
                    favoriteDishes: ['-'],
                    averageTicket: 0,
                    totalRevenue: mem.totalRevenue || 0,
                    loyaltyScore: mem.points || 0,
                    status: (mem.points || 0) > 500 ? 'Premium' : (mem.points || 0) > 100 ? 'Fidèle' : 'Nouveau',
                    insights: [],
                    visitHistory: [],
                    spendingHistory: []
                } as any);
            }
            return customers;
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

    async getLoyaltyProgram(restaurantId: number | string) {
        try {
            const q = query(
                collection(db, 'loyaltyPrograms'),
                where('restaurantId', '==', String(restaurantId)),
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() };
        } catch (error) {
            console.error('Error fetching loyalty program:', error);
            return null;
        }
    }

    async validateVisit(
        userId: string,
        restaurantId: number,
        code: string,
        amount?: number,
    ): Promise<{ success: boolean; pointsEarned: number; message?: string }> {
        try {
            const program = await this.getLoyaltyProgram(restaurantId);
            const pointsEarned = amount && program
                ? Math.floor(amount * ((program as any).spendingRatio || 1.5))
                : 50;

            // Créer la visite
            await addDoc(collection(db, 'visits'), {
                userId,
                restaurantId: String(restaurantId),
                amount: amount || null,
                pointsEarned,
                validationCode: code,
                validationMethod: code ? 'code' : 'nfc',
                createdAt: serverTimestamp(),
            });

            // Mettre à jour ou créer l'adhésion
            const q = query(
                collection(db, 'memberships'),
                where('userId', '==', userId),
                where('restaurantId', '==', String(restaurantId)),
            );
            const snap = await getDocs(q);
            if (snap.empty) {
                await addDoc(collection(db, 'memberships'), {
                    userId,
                    restaurantId: String(restaurantId),
                    points: pointsEarned,
                    stamps: 1,
                    tier: 'Bronze',
                    joinedDate: serverTimestamp(),
                    createdAt: serverTimestamp(),
                });
            } else {
                const memberDoc = snap.docs[0];
                const current = memberDoc.data();
                await updateDoc(memberDoc.ref, {
                    points: (current.points || 0) + pointsEarned,
                    stamps: (current.stamps || 0) + 1,
                    updatedAt: serverTimestamp(),
                });
            }

            this.notifyListeners();
            return { success: true, pointsEarned };
        } catch (error: any) {
            return { success: false, pointsEarned: 0, message: error.message || 'Erreur validation' };
        }
    }

    // ============================================
    // CAMPAIGNS
    // ============================================

    async getCampaigns(restaurantId: number | string): Promise<Campaign[]> {
        try {
            const q = query(
                collection(db, 'campaigns'),
                where('restaurantId', '==', String(restaurantId))
            );
            const snapshot = await getDocs(q);
            const campaigns = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
            return campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }
    }

    async createCampaign(campaign: Omit<Campaign, 'id' | 'stats' | 'createdAt'>): Promise<void> {
        try {
            await addDoc(collection(db, 'campaigns'), {
                ...campaign,
                restaurantId: String(campaign.restaurantId),
                stats: { openRate: 0, conversionRate: 0, revenue: 0 },
                createdAt: serverTimestamp(),
            });
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de création campagne');
        }
    }

    async getFlashPromotions(restaurantId: number | string): Promise<FlashPromotion[]> {
        try {
            const q = query(
                collection(db, 'flashPromotions'),
                where('restaurantId', '==', String(restaurantId))
            );
            const snapshot = await getDocs(q);
            const promos = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
            return promos.filter(p => p.active);
        } catch (error) {
            console.error('Error fetching flash promotions:', error);
            return [];
        }
    }

    async getAllActiveFlashPromotions(): Promise<FlashPromotion[]> {
        try {
            const q = query(
                collection(db, 'flashPromotions'),
                where('active', '==', true),
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
        } catch (error) {
            console.error('Error fetching flash promotions:', error);
            return [];
        }
    }

    async createFlashPromotion(promo: Omit<FlashPromotion, 'id' | 'createdAt'>): Promise<FlashPromotion> {
        try {
            const docRef = await addDoc(collection(db, 'flashPromotions'), {
                ...promo,
                restaurantId: String(promo.restaurantId),
                quantityRemaining: promo.quantityTotal,
                active: true,
                createdAt: serverTimestamp(),
            });

            // Generate a campaign linked to this flash promotion
            await this.createCampaign({
                restaurantId: promo.restaurantId as any,
                name: `⚡ Flash : ${promo.itemName}`,
                type: 'flash',
                status: 'active',
                description: `Vente flash sur ${promo.itemName} ! ${promo.discountPrice}€ au lieu de ${promo.originalPrice}€.`,
                targetSegment: 'Tous',
                flashPromoId: docRef.id
            } as any);

            this.notifyListeners();
            return { id: docRef.id, ...promo, createdAt: new Date().toISOString() };
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de création promotion flash');
        }
    }

    // Listener temps réel pour les flash promos (côté client)
    subscribeToFlashPromotions(callback: (promos: FlashPromotion[]) => void) {
        const q = query(
            collection(db, 'flashPromotions'),
            where('active', '==', true),
        );
        return onSnapshot(q, (snapshot) => {
            const promos = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
            callback(promos);
        });
    }

    // ============================================
    // RESERVATIONS
    // ============================================

    async createReservation(res: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
        try {
            const docRef = await addDoc(collection(db, 'reservations'), {
                ...res,
                restaurantId: String(res.restaurantId),
                status: 'confirmed',
                createdAt: serverTimestamp(),
            });
            this.notifyListeners();
            return {
                id: docRef.id,
                ...res,
                status: 'confirmed',
                createdAt: new Date().toISOString(),
            };
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de création réservation');
        }
    }

    async getUserReservations(userId: string): Promise<Reservation[]> {
        try {
            const q = query(
                collection(db, 'reservations'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
        } catch (error) {
            console.error('Error fetching reservations:', error);
            return [];
        }
    }

    async getRestaurantReservations(restaurantId: number | string): Promise<Reservation[]> {
        try {
            const q = query(
                collection(db, 'reservations'),
                where('restaurantId', '==', String(restaurantId)),
                orderBy('createdAt', 'desc'),
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
        } catch (error) {
            console.error('Error fetching restaurant reservations:', error);
            return [];
        }
    }

    // ============================================
    // ANALYTICS
    // ============================================

    async getAnalytics(restaurantId: number | string) {
        try {
            const visitsQ = query(
                collection(db, 'visits'),
                where('restaurantId', '==', String(restaurantId)),
            );
            const visitsSnap = await getDocs(visitsQ);
            const visits = visitsSnap.docs.map((d) => d.data());

            const totalVisits = visits.length;
            const totalRevenue = visits.reduce((sum, v) => sum + (v.amount || 0), 0);
            const averageTicket = totalVisits > 0 ? totalRevenue / totalVisits : 0;

            return { totalRevenue, totalVisits, averageTicket };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { totalRevenue: 0, totalVisits: 0, averageTicket: 0 };
        }
    }

    // ============================================
    // POS
    // ============================================

    async getPOSOrders(restaurantId: number | string): Promise<POSOrder[]> {
        try {
            const q = query(
                collection(db, 'posOrders'),
                where('restaurantId', '==', String(restaurantId)),
                orderBy('createdAt', 'desc'),
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
        } catch (error) {
            console.error('Error fetching POS orders:', error);
            return [];
        }
    }

    // Listener temps réel pour les commandes POS
    subscribeToPOSOrders(restaurantId: number | string, callback: (orders: POSOrder[]) => void) {
        const q = query(
            collection(db, 'posOrders'),
            where('restaurantId', '==', String(restaurantId)),
            orderBy('createdAt', 'desc'),
        );
        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
                createdAt: toDate((d.data() as any).createdAt),
            } as any));
            callback(orders);
        });
    }

    async savePOSOrder(order: POSOrder): Promise<void> {
        try {
            if (order.id && !order.id.startsWith('new-')) {
                // Mise à jour commande existante
                await updateDoc(doc(db, 'posOrders', order.id), {
                    status: order.status,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Nouvelle commande
                await addDoc(collection(db, 'posOrders'), {
                    restaurantId: String((order as any).restaurantId || '1'),
                    items: order.items,
                    status: order.status || 'pending',
                    total: order.total,
                    type: order.type,
                    tableNumber: order.tableNumber || null,
                    customerId: order.customer?.id || null,
                    createdAt: serverTimestamp(),
                });
            }
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de sauvegarde commande');
        }
    }

    async payOrder(id: string, method: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'posOrders', id), {
                status: 'paid',
                paymentMethod: method,
                paidAt: serverTimestamp(),
            });
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de paiement');
        }
    }

    async deletePOSOrder(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'posOrders', id));
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de suppression');
        }
    }

    // ============================================
    // ADMIN
    // ============================================

    async deleteRestaurant(id: number | string): Promise<void> {
        const idStr = String(id);
        console.log('[Admin] Suppression restaurant:', idStr);
        try {
            await deleteDoc(doc(db, 'restaurants', idStr));
            this.notifyListeners();
            console.log('[Admin] Restaurant supprimé avec succès');
        } catch (error: any) {
            console.error('[Admin] Erreur suppression:', error.code, error.message);
            if (error.code === 'permission-denied') {
                throw new Error('Permission refusée. Vérifiez les règles Firestore ou reconnectez-vous en tant qu\'Admin.');
            }
            throw new Error(error.message || 'Erreur de suppression');
        }
    }

    async toggleRestaurantStatus(id: number | string): Promise<void> {
        try {
            const restaurant = await this.getRestaurant(id);
            if (restaurant) {
                await updateDoc(doc(db, 'restaurants', String(id)), {
                    status: restaurant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    updatedAt: serverTimestamp(),
                });
            }
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de mise à jour');
        }
    }

    async toggleUserStatus(id: string): Promise<void> {
        try {
            const userDoc = await getDoc(doc(db, 'users', id));
            if (userDoc.exists()) {
                const current = userDoc.data();
                await updateDoc(doc(db, 'users', id), {
                    status: current.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                    updatedAt: serverTimestamp(),
                });
            }
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de mise à jour');
        }
    }

    async updateRestaurant(id: string, data: Partial<{ name: string; cuisine: string; offer: string; budget: number; ambiance: string; address: string }>): Promise<void> {
        try {
            await updateDoc(doc(db, 'restaurants', id), {
                ...data,
                updatedAt: serverTimestamp(),
            });
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de mise à jour du restaurant');
        }
    }

    async updateUser(id: string, data: Partial<{ firstName: string; lastName: string; email: string; role: string }>): Promise<void> {
        try {
            await updateDoc(doc(db, 'users', id), {
                ...data,
                updatedAt: serverTimestamp(),
            });
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(error.message || 'Erreur de mise à jour de l\'utilisateur');
        }
    }

    async sendResetEmailToUser(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            throw new Error(error.message || 'Erreur d\'envoi d\'email');
        }
    }

    /**
     * Supprime un utilisateur :
     * - Appelle le backend (Firebase Admin SDK) pour supprimer le compte Auth
     * - Supprime le profil Firestore (quelle que soit la réponse du backend)
     */
    async deleteUser(uid: string): Promise<void> {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        let backendError: string | null = null;

        // 1. Appel backend pour supprimer Firebase Auth
        try {
            const res = await fetch(`${API_URL}/admin/users/${uid}`, { method: 'DELETE' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                backendError = body.message || `Backend error ${res.status}`;
                console.warn('[Admin] Backend delete warning:', backendError);
            }
        } catch (e: any) {
            backendError = e.message;
            console.warn('[Admin] Backend non disponible, suppression Firestore seulement:', e.message);
        }

        // 2. Supprimer le profil Firestore (toujours, même si le backend a échoué)
        try {
            await deleteDoc(doc(db, 'users', uid));
            this.notifyListeners();
        } catch (error: any) {
            throw new Error(`Erreur suppression Firestore: ${error.message}`);
        }

        if (backendError) {
            console.warn('[Admin] Profil Firestore supprimé mais le compte Firebase Auth nécessite une configuration du service account backend.');
        }
    }

    /**
     * Synchronise les utilisateurs (Nettoyage des orphelins Firestore sans Auth correspondant et ajout des manquants)
     */
    async syncUsers(): Promise<{ deletedCount: number; deletedIds: string[]; addedCount: number; addedIds: string[]; totalAuth: number; totalFirestore: number }> {
        let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        // Si l'application est ouverte depuis un mobile/réseau (ex: 192.168.1.x), il faut remplacer localhost
        if (API_URL.includes('localhost') && window.location.hostname !== 'localhost') {
            API_URL = API_URL.replace('localhost', window.location.hostname);
        }

        console.log('[Admin] Calling syncUsers endpoint:', `${API_URL}/admin/sync-users`);
        try {
            const res = await fetch(`${API_URL}/admin/sync-users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error('[Admin] Erreur backend syncUsers:', res.status, body);
                throw new Error(`${body.message || 'Erreur inconnue'} (HTTP ${res.status}) sur ${API_URL}`);
            }
            const result = await res.json();
            // Si des suppressions ont eu lieu, le snapshot listener devrait déjà avoir mis à jour le cache
            // Mais on force une notification au cas où
            if (result.deletedCount > 0 || result.addedCount > 0) {
                this.notifyListeners();
            }
            return result;
        } catch (error: any) {
            console.error('[Admin] Erreur de synchronisation:', error);
            throw new Error(error.message || 'Erreur de synchronisation');
        }
    }


    /**
     * Crée un compte RESTAURATEUR + restaurant sans déconnecter l'admin
     * Utilise une 2ème instance Firebase pour préserver la session courante
     */
    async createRestaurateur(data: any): Promise<void> {
        const secondaryAuth = await this._createUserSecondaryApp(data.email, data.password || 'Loycal2024!');
        const uid = secondaryAuth.uid;
        try {
            // Créer le restaurant dans Firestore
            const restoRef = await addDoc(collection(db, 'restaurants'), {
                name: data.restaurantName,
                cuisine: data.category || 'Française',
                offer: data.offer || 'Bienvenue',
                budget: data.budget || 2,
                ambiance: data.ambiance || 'Cozy',
                popularity: 'Nouveau',
                distance: Math.floor(Math.random() * 1000),
                status: 'ACTIVE',
                aggregateRating: 0,
                visitCount: 0,
                rewardScore: 0,
                lat: 48.8566 + (Math.random() * 0.02 - 0.01),
                lng: 2.3522 + (Math.random() * 0.02 - 0.01),
                menu: [],
                createdAt: serverTimestamp(),
            });

            // Créer le profil Firestore
            await setDoc(doc(db, 'users', uid), {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'RESTAURATEUR',
                status: 'ACTIVE',
                restaurantId: restoRef.id,
                createdAt: serverTimestamp(),
            });

            // Envoyer l'email de réinitialisation (toujours référencer l'auth principal)
            if (data.sendResetEmail) {
                await sendPasswordResetEmail(auth, data.email);
            }

            this.notifyListeners();
        } catch (error: any) {
            console.error('[Admin] Erreur création restaurateur:', error);
            throw new Error(error.message || 'Erreur de création');
        }
    }

    /**
     * Crée un compte CLIENT simple sans déconnecter l'admin
     */
    async createClient(data: { firstName: string; lastName: string; email: string; password: string; sendResetEmail?: boolean }): Promise<void> {
        const secondaryAuth = await this._createUserSecondaryApp(data.email, data.password || 'Loycal2024!');
        const uid = secondaryAuth.uid;
        try {
            // Créer le profil Firestore
            await setDoc(doc(db, 'users', uid), {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'CLIENT',
                status: 'ACTIVE',
                points: 0,
                memberships: [],
                createdAt: serverTimestamp(),
            });

            if (data.sendResetEmail) {
                await sendPasswordResetEmail(auth, data.email);
            }

            this.notifyListeners();
        } catch (error: any) {
            console.error('[Admin] Erreur création client:', error);
            throw new Error(error.message || 'Erreur de création client');
        }
    }

    /**
     * Crée un utilisateur Firebase Auth via une app secondaire
     * afin de ne PAS remplacer la session de l'admin en cours
     */
    private async _createUserSecondaryApp(email: string, password: string): Promise<{ uid: string }> {
        const secondaryAppName = `secondary-${Date.now()}`;
        const firebaseConfig = {
            apiKey: app.options.apiKey,
            authDomain: app.options.authDomain,
            projectId: app.options.projectId,
            storageBucket: app.options.storageBucket,
            messagingSenderId: app.options.messagingSenderId,
            appId: app.options.appId,
        };
        const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
        const secondaryAuth = getAuth(secondaryApp);
        try {
            const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const uid = credential.user.uid;
            await signOut(secondaryAuth); // Nettoyage
            return { uid };
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Un compte existe déjà avec cet email.');
            }
            throw error;
        }
    }


    // ============================================
    // HELPERS
    // ============================================

    activatePromo(userId: string, promoId: string) {
        console.log(`Promo ${promoId} activated for user ${userId}`);
    }
}

// Export singleton
export const firestoreService = new FirestoreService();
export default firestoreService;
