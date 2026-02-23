
import { MOCK_RESTAURANTS, MOCK_POS_ORDERS, MOCK_PROMOTIONS, MOCK_VALIDATION_CODES, MOCK_CAMPAIGNS, MOCK_MENU, MOCK_CUSTOMERS } from './constants';
import type { User, Restaurant, MenuItem, FlashPromotion, Campaign, Customer, POSOrder, Reservation } from './types';

const STORAGE_KEY = 'loycal_data_store';
const USER_KEY = 'loycal_current_user';

class MockBackend {
    private data: {
        users: User[];
        restaurants: Restaurant[];
        posOrders: POSOrder[];
        campaigns: Campaign[];
        flashPromotions: FlashPromotion[];
        reservations: Reservation[];
        flashReservations: Map<string, Set<string>>; // userId -> Set of flashPromoId
    };
    private currentUser: User | null = null;
    private listeners: Function[] = [];

    constructor() {
        // Récupérer l'utilisateur connecté
        const savedUser = localStorage.getItem(USER_KEY);
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = {
                users: [
                    { id: 'u1', email: 'admin@loycal.com', role: 'ADMIN', firstName: 'Super', lastName: 'Admin', createdAt: new Date().toISOString(), status: 'ACTIVE' },
                    { id: 'u2', email: 'resto@bistrot.com', role: 'RESTAURATEUR', firstName: 'Jean', lastName: 'Bistrot', createdAt: new Date().toISOString(), status: 'ACTIVE', restaurantId: 1 },
                    { id: 'u3', email: 'client@loycal.com', role: 'CLIENT', firstName: 'Client', lastName: 'Demo', createdAt: new Date().toISOString(), status: 'ACTIVE' },
                ],
                restaurants: [...MOCK_RESTAURANTS],
                posOrders: [...MOCK_POS_ORDERS],
                campaigns: [...MOCK_CAMPAIGNS] as any,
                flashPromotions: [
                    {
                        id: 'flash-init-1',
                        restaurantId: 1,
                        menuItemId: 'm1',
                        itemName: 'Burger Classic',
                        originalPrice: 14.50,
                        discountPrice: 9.90,
                        quantityTotal: 20,
                        quantityRemaining: 8,
                        startTime: '11:00',
                        endTime: '23:00',
                        active: true,
                        createdAt: new Date().toISOString()
                    }
                ],
                reservations: [],
                flashReservations: new Map()
            };
            this.save();
        }
    }

    private save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        // Sauvegarder aussi l'utilisateur connecté
        if (this.currentUser) {
            localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem(USER_KEY);
        }
    }

    subscribe(listener: Function) {
        this.listeners.push(listener);
        listener();
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    private notifyListeners() {
        this.save();
        this.listeners.forEach(l => l());
    }

    // --- AUTH ---
    async login(email: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (user) {
                    this.currentUser = user;
                    this.notifyListeners();
                    resolve(user);
                }
                else reject(new Error("Utilisateur non trouvé."));
            }, 500);
        });
    }

    async registerClient(email: string, firstName: string, lastName: string) {
        return new Promise<User>((resolve) => {
            setTimeout(() => {
                const newUser: User = {
                    id: `u-${Date.now()}`,
                    email,
                    role: 'CLIENT',
                    firstName,
                    lastName,
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE'
                };
                this.data.users.push(newUser);
                this.currentUser = newUser;
                this.notifyListeners();
                resolve(newUser);
            }, 800);
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem(USER_KEY);
        this.notifyListeners();
    }

    getCurrentUser() { return this.currentUser; }

    getRestaurants() { return this.data.restaurants.filter(r => r.status === 'ACTIVE'); }

    async getRestaurant(restaurantId: number): Promise<Restaurant | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const restaurant = this.data.restaurants.find(r => r.id === restaurantId);
                resolve(restaurant || null);
            }, 300);
        });
    }

    async updateRestaurantMenu(restaurantId: number, menu: MenuItem[]): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const idx = this.data.restaurants.findIndex(r => r.id === restaurantId);
                if (idx !== -1) {
                    this.data.restaurants[idx].menu = menu;
                    this.notifyListeners();
                }
                resolve();
            }, 800);
        });
    }

    async updateRestaurantProfile(restaurantId: number, data: any): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const idx = this.data.restaurants.findIndex(r => r.id === restaurantId);
                if (idx !== -1) {
                    this.data.restaurants[idx] = { ...this.data.restaurants[idx], ...data };
                    this.notifyListeners();
                }
                resolve();
            }, 800);
        });
    }

    async createFlashPromotion(promo: Omit<FlashPromotion, 'id' | 'createdAt'>): Promise<FlashPromotion> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newPromo: FlashPromotion = {
                    ...promo,
                    id: `flash-${Date.now()}`,
                    createdAt: new Date().toISOString()
                };
                this.data.flashPromotions.push(newPromo);

                const newCamp: Campaign = {
                    id: `camp-flash-${Date.now()}`,
                    restaurantId: promo.restaurantId,
                    name: `⚡ Flash : ${promo.itemName}`,
                    type: 'flash',
                    status: 'active',
                    stats: { openRate: 0, conversionRate: 0, revenue: 0 },
                    description: `Vente flash sur ${promo.itemName} ! ${promo.discountPrice}€ au lieu de ${promo.originalPrice}€.`,
                    targetSegment: 'Clients fidèles',
                    createdAt: new Date().toISOString(),
                    flashPromoId: newPromo.id
                };
                this.data.campaigns.unshift(newCamp);

                this.notifyListeners();
                resolve(newPromo);
            }, 1200);
        });
    }

    getCampaigns(restaurantId: number) {
        return this.data.campaigns.filter(c => c.restaurantId === restaurantId);
    }

    getFlashPromotions(restaurantId: number) {
        return this.data.flashPromotions.filter(p => p.restaurantId === restaurantId && p.active);
    }

    getAllActiveFlashPromotions() {
        return this.data.flashPromotions.filter(p => p.active);
    }

    async getPOSOrders(restaurantId?: number): Promise<POSOrder[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (restaurantId) {
                    resolve(this.data.posOrders.filter(o => o.restaurantId === restaurantId));
                } else {
                    resolve(this.data.posOrders);
                }
            }, 300);
        });
    }

    savePOSOrder(order: POSOrder) {
        const idx = this.data.posOrders.findIndex(o => o.id === order.id);
        if (idx !== -1) {
            this.data.posOrders[idx] = order;
        } else {
            this.data.posOrders.push(order);
        }
        this.notifyListeners();
    }

    deletePOSOrder(id: string) { this.data.posOrders = this.data.posOrders.filter(o => o.id !== id); this.notifyListeners(); }

    async payOrder(id: string, method: string) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const idx = this.data.posOrders.findIndex(o => o.id === id);
                if (idx !== -1) {
                    this.data.posOrders[idx].status = 'paid';
                    this.data.posOrders[idx].paymentMethod = method;
                    this.notifyListeners();
                }
                resolve();
            }, 1000);
        });
    }

    async getAnalytics(restaurantId: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const orders = this.data.posOrders.filter(o => o.status === 'paid' && o.restaurantId === restaurantId);
                const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
                const totalVisits = orders.length;
                const averageTicket = totalVisits > 0 ? totalRevenue / totalVisits : 0;

                resolve({
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    totalVisits,
                    averageTicket: Math.round(averageTicket * 100) / 100,
                    loyaltyRate: 65, // Mock
                    newCustomers: 45, // Mock
                    returningCustomers: 120, // Mock
                    topItems: [], // Mock
                    revenueByDay: [], // Mock
                });
            }, 300);
        });
    }

    async getRestaurantCustomers(restaurantId: number | string): Promise<Customer[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const rIdNum = typeof restaurantId === 'string' ? parseInt(restaurantId) || 1 : restaurantId;
                const customers: Customer[] = MOCK_CUSTOMERS.map(c => ({
                    ...c,
                    id: c.id.toString(),
                })) as any;
                resolve(customers); // In a mock we just return the global mocked list
            }, 300);
        });
    }

    async createCampaign(campaign: Omit<Campaign, 'id' | 'stats' | 'createdAt'>) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const newCamp: Campaign = {
                    ...campaign,
                    id: `camp-${Date.now()}`,
                    stats: { openRate: 0, conversionRate: 0, revenue: 0 },
                    createdAt: new Date().toISOString()
                };
                this.data.campaigns.unshift(newCamp);
                this.notifyListeners();
                resolve();
            }, 800);
        });
    }

    async createReservation(res: Omit<Reservation, 'id' | 'createdAt'> & { flashPromoId?: string }) {
        return new Promise<Reservation>((resolve, reject) => {
            setTimeout(() => {
                // Check if this is a flash promotion reservation
                const flashPromoId = (res as any).flashPromoId;

                if (flashPromoId) {
                    // Validate flash reservation limit (1 per user per promo)
                    const userFlashReservations = this.data.flashReservations.get(res.userId) || new Set();

                    if (userFlashReservations.has(flashPromoId)) {
                        reject(new Error('Vous avez déjà réservé cette offre flash'));
                        return;
                    }

                    // Check if flash promo still has quantity
                    const flashPromo = this.data.flashPromotions.find(fp => fp.id === flashPromoId);
                    if (!flashPromo || flashPromo.quantityRemaining <= 0) {
                        reject(new Error('Cette offre flash n\'est plus disponible'));
                        return;
                    }

                    // Decrease quantity
                    flashPromo.quantityRemaining--;

                    // Track the reservation
                    userFlashReservations.add(flashPromoId);
                    this.data.flashReservations.set(res.userId, userFlashReservations);
                }

                // Create the reservation
                const newReservation: Reservation = {
                    ...res,
                    id: `res-${Date.now()}`,
                    createdAt: new Date().toISOString()
                };

                this.data.reservations.push(newReservation);
                this.notifyListeners();
                resolve(newReservation);
            }, 1000);
        });
    }

    getUsersAdmin() { return this.data.users; }
    getAllRestaurantsAdmin() { return this.data.restaurants; }

    deleteRestaurant(id: number) {
        this.data.restaurants = this.data.restaurants.filter(r => r.id !== id);
        this.notifyListeners();
    }

    toggleRestaurantStatus(id: number) {
        const idx = this.data.restaurants.findIndex(r => r.id === id);
        if (idx !== -1) {
            this.data.restaurants[idx].status = this.data.restaurants[idx].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            this.notifyListeners();
        }
    }

    toggleUserStatus(id: string) {
        const idx = this.data.users.findIndex(u => u.id === id);
        if (idx !== -1) {
            this.data.users[idx].status = this.data.users[idx].status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            this.notifyListeners();
        }
    }

    async createRestaurateur(data: any) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const restaurantId = this.data.restaurants.length + 1;
                const newResto: Restaurant = {
                    id: restaurantId,
                    name: data.restaurantName,
                    cuisine: data.category,
                    offer: data.offer,
                    lat: 48.8566 + (Math.random() * 0.02 - 0.01),
                    lng: 2.3522 + (Math.random() * 0.02 - 0.01),
                    budget: data.budget,
                    popularity: 'Nouveau',
                    ambiance: data.ambiance,
                    distance: Math.floor(Math.random() * 1000),
                    status: 'ACTIVE',
                    aggregateRating: 0,
                    visitCount: 0,
                    rewardScore: 0,
                    menu: [...MOCK_MENU]
                };

                const newUser: User = {
                    id: `u-${Date.now()}`,
                    email: data.email,
                    role: 'RESTAURATEUR',
                    firstName: data.firstName,
                    lastName: data.lastName,
                    createdAt: new Date().toISOString(),
                    status: 'ACTIVE',
                    restaurantId: restaurantId
                };

                this.data.restaurants.push(newResto);
                this.data.users.push(newUser);
                this.notifyListeners();
                resolve();
            }, 1000);
        });
    }

    async validateVisit(userId: string, restaurantId: number, code: string, amount?: number) {
        return new Promise<{ success: boolean, pointsEarned: number, message?: string }>((resolve) => {
            setTimeout(() => {
                if (code === '1234' || code === 'BONUS') {
                    const points = amount ? Math.floor(amount * 1.5) : 50;
                    resolve({ success: true, pointsEarned: points });
                } else {
                    resolve({ success: false, pointsEarned: 0, message: "Code incorrect." });
                }
            }, 1000);
        });
    }

    activatePromo(userId: string, promoId: string) {
        console.log(`Promo ${promoId} activated for user ${userId}`);
    }

    getReservations(restaurantId?: number): Reservation[] {
        if (restaurantId) {
            return this.data.reservations.filter(r => r.restaurantId === restaurantId);
        }
        return this.data.reservations;
    }

    updateReservationStatus(reservationId: string, status: 'confirmed' | 'cancelled' | 'completed') {
        const reservation = this.data.reservations.find(r => r.id === reservationId);
        if (reservation) {
            reservation.status = status;
            this.notifyListeners();
        }
    }

    getUsers(): User[] {
        return this.data.users;
    }
}
export const mockBackend = new MockBackend();
