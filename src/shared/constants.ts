
import type { Restaurant, Customer, MenuItem, POSOrder, Promotion, ValidationCode, Campaign, RemiRecommendation } from './types';

export const MOCK_MENU: MenuItem[] = [
    { id: 'm1', name: 'Burger Classic', price: 14.50, category: 'Plats', available: true },
    { id: 'm2', name: 'Le Bacon Cheese', price: 16.00, category: 'Plats', available: true },
    { id: 'm3', name: 'Frites Maison', price: 4.50, category: 'Accompagnements', available: true },
    { id: 'm4', name: 'Tiramisu Nutella', price: 7.50, category: 'Desserts', available: true },
    { id: 'm5', name: 'Pizza Margherita', price: 12.00, category: 'Plats', available: true },
    { id: 'm6', name: 'Sushi Saumon (x6)', price: 9.50, category: 'Plats', available: true },
    { id: 'm7', name: 'Café Gourmand', price: 8.50, category: 'Desserts', available: true },
];

export const MOCK_RESTAURANTS: Restaurant[] = [
    { 
        id: 1, 
        name: "Le Bistrot Gourmand", 
        cuisine: "Française", 
        offer: "Café gourmand offert", 
        lat: 48.8584, lng: 2.2945, budget: 2, 
        popularity: 'Populaire', ambiance: 'Romantique', distance: 120, 
        aggregateRating: 4.7, visitCount: 850, rewardScore: 75,
        isCurrentUser: true,
        loyaltyConfig: { type: 'points', spendingRatio: 1.5, rewardLabel: 'Dessert Offert' },
        loyaltyData: { points: 150, tier: 'Silver', nextTierThreshold: 500, joinedDate: '2023-10-01', rewards: [] },
        menu: [...MOCK_MENU],
        activePromotions: [
            { id: 'p1', restaurantId: 1, title: 'Happy Hour Double Points', description: 'Gagnez 2x plus de points entre 17h et 19h.', active: true }
        ]
    },
    { 
        id: 2, 
        name: "Mama Pizza", 
        cuisine: "Italienne", 
        offer: "-20% sur la 2ème pizza", 
        lat: 48.8566, lng: 2.3522, budget: 1, 
        popularity: 'Tendance', ambiance: 'Cozy', distance: 450, 
        aggregateRating: 4.5, visitCount: 1200, rewardScore: 90,
        loyaltyConfig: { type: 'stamps', targetCount: 10, rewardLabel: 'Pizza au choix offerte', welcomeBonus: 2 },
        loyaltyData: { points: 0, stamps: 6, tier: 'Bronze', nextTierThreshold: 10, joinedDate: '2024-01-15', rewards: [] },
        menu: [MOCK_MENU[4], MOCK_MENU[3]],
        activePromotions: [
            { id: 'p2', restaurantId: 2, title: 'Vente Flash: Margherita', description: 'Seulement 8€ ce midi !', active: true }
        ]
    },
    { 
        id: 3, 
        name: "Sushi Zen Master", 
        cuisine: "Japonaise", 
        offer: "Soupe Miso offerte", 
        lat: 48.8606, lng: 2.3376, budget: 3, 
        popularity: 'Populaire', ambiance: 'Business', distance: 800, 
        aggregateRating: 4.8, visitCount: 600, rewardScore: 60,
        loyaltyConfig: { 
            type: 'missions', 
            missions: [
                { id: 'mis1', title: 'Fan de Ramen', goal: 3, reward: '1 Gyoza offert', icon: '🍜' },
                { id: 'mis2', title: 'Explorateur', goal: 5, reward: 'Plateau Tokyo offert', icon: '🍣' }
            ]
        },
        loyaltyData: { points: 200, tier: 'Gold', nextTierThreshold: 1000, joinedDate: '2023-05-20', missionsProgress: [{ missionId: 'mis1', current: 2 }], rewards: [] },
        menu: [MOCK_MENU[5], MOCK_MENU[6]],
        friendsActivity: { count: 2, avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2'], names: ['Julien', 'Sarah'] }
    },
    { 
        id: 4, 
        name: "L'Atelier du Burger", 
        cuisine: "Américaine", 
        offer: "Frites XL offertes", 
        lat: 48.8534, lng: 2.3488, budget: 2, 
        popularity: 'Nouveau', ambiance: 'Chill', distance: 300, 
        aggregateRating: 4.2, visitCount: 150, rewardScore: 30,
        loyaltyConfig: { type: 'spending', targetSpending: 100, rewardLabel: 'Menu Signature Offert' },
        loyaltyData: { points: 45, tier: 'Bronze', nextTierThreshold: 100, joinedDate: '2024-02-01', rewards: [] },
        menu: [MOCK_MENU[0], MOCK_MENU[1], MOCK_MENU[2]]
    },
    { 
        id: 5, 
        name: "Brunchy Corner", 
        cuisine: "Française", 
        offer: "Mousse au chocolat offerte", 
        lat: 48.8644, lng: 2.3312, budget: 2, 
        popularity: 'Tendance', ambiance: 'Festif', distance: 950, 
        aggregateRating: 4.6, visitCount: 450, rewardScore: 85,
        loyaltyConfig: { type: 'points', spendingRatio: 2, rewardLabel: 'Cocktail Offert' },
        loyaltyData: { points: 380, tier: 'Silver', nextTierThreshold: 500, joinedDate: '2023-11-12', rewards: [] },
        menu: [MOCK_MENU[6], MOCK_MENU[3]]
    },
    { 
        id: 6, 
        name: "Le Petit Mexique", 
        cuisine: "Mexicaine", 
        offer: "Nachos de bienvenue", 
        lat: 48.8512, lng: 2.3588, budget: 1, 
        popularity: 'Classique', ambiance: 'Festif', distance: 1100, 
        aggregateRating: 4.4, visitCount: 980, rewardScore: 70,
        loyaltyConfig: { type: 'stamps', targetCount: 8, rewardLabel: 'Burrito Offert' },
        loyaltyData: { points: 0, stamps: 3, tier: 'Bronze', nextTierThreshold: 8, joinedDate: '2023-08-05', rewards: [] },
        menu: [MOCK_MENU[0], MOCK_MENU[6]]
    }
];

export const MOCK_DEMAND_FORECAST = [
    { hour: '11h', "Déjeuner": 12, "Dîner": 0 },
    { hour: '12h', "Déjeuner": 45, "Dîner": 0 },
    { hour: '13h', "Déjeuner": 58, "Dîner": 0 },
    { hour: '14h', "Déjeuner": 22, "Dîner": 0 },
    { hour: '18h', "Déjeuner": 0, "Dîner": 15 },
    { hour: '19h', "Déjeuner": 0, "Dîner": 42 },
    { hour: '20h', "Déjeuner": 0, "Dîner": 65 },
    { hour: '21h', "Déjeuner": 0, "Dîner": 38 },
];

export const MOCK_REVENUE_FORECAST = [
    { day: 'Lun', "CA Prévu": 1200, "CA Réel": 1150 },
    { day: 'Mar', "CA Prévu": 1100, "CA Réel": 1250 },
    { day: 'Mer', "CA Prévu": 1400, "CA Réel": 1380 },
    { day: 'Jeu', "CA Prévu": 1800, "CA Réel": 1600 },
    { day: 'Ven', "CA Prévu": 2500, "CA Réel": 2400 },
    { day: 'Sam', "CA Prévu": 3200, "CA Réel": 3100 },
    { day: 'Dim', "CA Prévu": 2800, "CA Réel": 2900 },
];

export const MOCK_RETENTION_DATA = [
    { month: 'Oct', rate: 22 },
    { month: 'Nov', rate: 25 },
    { month: 'Déc', rate: 28 },
    { month: 'Jan', rate: 30 },
    { month: 'Fév', rate: 32 },
    { month: 'Mar', rate: 35 },
];

export const MOCK_REWARDS_DATA = [
    { name: 'Lun', gagne: 400, utilise: 120 },
    { name: 'Mar', gagne: 300, utilise: 80 },
    { name: 'Mer', gagne: 500, utilise: 150 },
    { name: 'Jeu', gagne: 600, utilise: 220 },
    { name: 'Ven', gagne: 850, utilise: 300 },
    { name: 'Sam', gagne: 950, utilise: 450 },
    { name: 'Dim', gagne: 700, utilise: 200 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: "Alexandre Dupont",
    avatarUrl: "https://i.pravatar.cc/150?u=alex",
    visitsPerMonth: 4,
    lastVisit: "Il y a 3 jours",
    favoriteDishes: ["Burger Classic"],
    averageTicket: 42.50,
    totalRevenue: 852.00,
    loyaltyScore: 88,
    status: "Premium",
    insights: ["Client fidèle du jeudi soir.", "Aime le vin rouge."],
    preferredDay: "Jeudi",
    preferredService: "Dîner",
    visitHistory: [{ month: 'Jan', visits: 3 }, { month: 'Fev', visits: 4 }, { month: 'Mar', visits: 5 }],
    spendingHistory: [{ month: 'Jan', spent: 120 }, { month: 'Fev', spent: 180 }, { month: 'Mar', spent: 210 }],
  },
  {
    id: 2,
    name: "Marie Leroy",
    avatarUrl: "https://i.pravatar.cc/150?u=marie",
    visitsPerMonth: 2,
    lastVisit: "Il y a 10 jours",
    favoriteDishes: ["Salade César", "Café Gourmand"],
    averageTicket: 22.00,
    totalRevenue: 440.00,
    loyaltyScore: 45,
    status: "Habitué",
    insights: ["Vient surtout au déjeuner.", "Sensible aux promos flash."],
    preferredDay: "Mardi",
    preferredService: "Déjeuner",
    visitHistory: [{ month: 'Jan', visits: 2 }, { month: 'Fev', visits: 2 }],
    spendingHistory: [{ month: 'Jan', spent: 45 }, { month: 'Fev', spent: 44 }],
  }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 'cp1', restaurantId: 1, name: 'Relance Inactifs 30j', status: 'active', type: 'SMS', stats: { openRate: 45, conversionRate: 12, revenue: 850 }, description: 'SMS automatique aux inactifs', targetSegment: 'Inactifs 30j', createdAt: new Date().toISOString() },
    { id: 'cp2', restaurantId: 1, name: 'Offre Jeudi Soir', status: 'ended', type: 'Push', stats: { openRate: 88, conversionRate: 25, revenue: 1420 }, description: 'Double points ce jeudi', targetSegment: 'Habitués du soir', createdAt: new Date().toISOString() },
];

export const MOCK_POS_ORDERS: POSOrder[] = [
    { id: '#CMD-084', items: [], status: 'paid', total: 45.50, createdAt: new Date().toISOString(), type: 'dine_in', paymentMethod: 'card' },
    { id: '#CMD-085', items: [], status: 'paid', total: 12.00, createdAt: new Date().toISOString(), type: 'takeaway', paymentMethod: 'cash' }
];

export const MOCK_CUSTOMER_SEGMENTS = [
  { name: 'Nouveaux', count: 120, description: '1ère visite ce mois.', color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Gros Paniers', count: 45, description: 'Moyenne > 45€.', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'Fidèles du Midi', count: 85, description: 'Habitués 12h-14h.', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: 'À Risque', count: 14, description: 'Pas de visite > 45j.', color: 'text-rose-600', bgColor: 'bg-rose-50' }
];

export const MOCK_REMI_RECOMMENDATIONS: RemiRecommendation[] = [
    {
        id: 'rec1',
        type: 'opportunity',
        title: 'Boostez vos midis du jeudi',
        description: 'Nous avons détecté une baisse de fréquentation le jeudi midi. Ciblez vos habitués avec une offre dessert offert.',
        impact: '+15% de CA',
        actionLabel: 'Créer une offre flash',
        isUrgent: true
    },
    {
        id: 'rec2',
        type: 'optimization',
        title: 'Récompense Dessert',
        description: 'Le coût de votre récompense actuelle est élevé. Rémi suggère de passer à un café gourmand pour optimiser vos marges.',
        impact: '+5% de marge brute',
        actionLabel: 'Modifier le programme',
    }
];

export const MOCK_PROMOTIONS: Promotion[] = [];
export const MOCK_VALIDATION_CODES: ValidationCode[] = [];
export const MOCK_ACTIVITIES = [];
export const MOCK_EVENTS = [];
export const MOCK_CHALLENGES = [];
