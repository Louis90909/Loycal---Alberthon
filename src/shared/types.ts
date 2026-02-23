
export type RestaurateurView = 'dashboard' | 'loyalty-program' | 'campaigns' | 'customers' | 'customerProfile' | 'analytics' | 'remi-expert' | 'pos' | 'profile-editor' | 'reservations';

export type LoyerClientView = 'explore' | 'map' | 'loyalty' | 'profile' | 'restaurant-details';

// --- AUTH & USER TYPES ---
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'RESTAURATEUR' | 'CLIENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    createdAt: string;
    status: UserStatus;
    restaurantId?: number;
}

// --- CORE BUSINESS TYPES ---

export interface Reservation {
    id: string;
    restaurantId: number;
    userId: string;
    date: string;
    time: string;
    guests: number;
    status: 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    available?: boolean;
}

export interface FlashPromotion {
    id: string;
    restaurantId: number;
    menuItemId: string;
    itemName: string;
    discountPrice: number;
    originalPrice: number;
    quantityTotal: number;
    quantityRemaining: number;
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    active: boolean;
    createdAt: string;
    targetSegment?: string;
}

export interface Campaign {
    id: string;
    restaurantId: number;
    name: string;
    type: 'SMS' | 'Email' | 'Push' | 'reactivation' | 'flash';
    status: 'active' | 'scheduled' | 'ended';
    stats: {
        openRate: number;
        conversionRate: number;
        revenue: number;
    };
    description: string;
    targetSegment: string;
    createdAt: string;
    flashPromoId?: string;
}

export interface Restaurant {
    id: number;
    name: string;
    cuisine: string;
    offer: string;
    lat: number;
    lng: number;
    budget: 1 | 2 | 3;
    popularity: 'Tendance' | 'Populaire' | 'Classique' | 'Nouveau' | 'Chinoise';
    ambiance: 'Cozy' | 'Festif' | 'Romantique' | 'Business' | 'Chill';
    distance: number;
    status?: 'ACTIVE' | 'INACTIVE';
    isFollowed?: boolean;
    aggregateRating: number;
    visitCount: number;
    rewardScore: number;
    loyaltyData?: UserLoyaltyData;
    loyaltyConfig?: LoyaltyConfig;
    activePromotions?: Promotion[];
    description?: string;
    menu?: MenuItem[]; // Carte propre au restaurant
    // Added for MapDiscovery and LoyerMap
    isCurrentUser?: boolean;
    userRating?: number;
    friendsActivity?: {
        count: number;
        avatars: string[];
        names: string[];
    };
}

export type CustomerStatus = 'Premium' | 'Fidèle' | 'Habitué' | 'Inactif' | 'Nouveau' | 'Occasionnel' | 'VIP';

export interface Customer {
    id: number | string;
    name: string;
    avatarUrl: string;
    visitsPerMonth: number;
    lastVisit: string;
    favoriteDishes: string[];
    averageTicket: number;
    totalRevenue: number;
    loyaltyScore: number;
    status: CustomerStatus;
    insights: string[];
    visitHistory: { month: string; visits: number }[];
    spendingHistory: { month: string; spent: number }[];
    churnProbability?: number;
    preferredDay?: string; // "Lundi", "Mardi", etc.
    preferredService?: 'Déjeuner' | 'Dîner';
}

// --- AUTRES TYPES ---
export interface Promotion {
    id: string;
    restaurantId: number;
    title: string;
    description: string;
    active: boolean;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold';

export interface Reward {
    id: string;
    type: string;
    description: string;
    cost: number;
    isRealTime?: boolean;
    expiry?: string; // Added for LoyerLoyalty
}

export type LoyaltyProgramType = 'points' | 'stamps' | 'spending' | 'missions';
export interface Mission { id: string; title: string; goal: number; reward: string; icon?: string; }
export interface LoyaltyConfig { type: LoyaltyProgramType; spendingRatio?: number; targetCount?: number; targetSpending?: number; welcomeBonus?: number; missions?: Mission[]; rewardLabel?: string; }

export interface UserLoyaltyData {
    points: number;
    stamps?: number;
    tier: LoyaltyTier;
    nextTierThreshold: number;
    rewards: Reward[];
    joinedDate: string;
    missionsProgress?: { missionId: string; current: number }[]; // Added for LoyerLoyalty
}

export interface UserPromoStatus { promoId: string; userId: string; status: string; }
export interface Visit { id: string; userId: string; restaurantId: number; date: string; amount?: number; pointsEarned: number; validationMethod: string; }
export interface ValidationCode { code: string; restaurantId: number; type: string; isUsed: boolean; }
export interface OrderItem extends MenuItem { quantity: number; }

export interface POSOrder {
    id: string;
    items: OrderItem[];
    status: string;
    total: number;
    createdAt: string;
    type: string;
    customer?: Customer;
    appliedReward?: Reward;
    paymentMethod?: string;
    tableNumber?: string; // Added for POSSystem
    restaurantId?: number;
}

// --- AI SERVICE TYPES ---

export interface OfferSuggestion {
    title: string;
    description: string;
    target: string;
    implementationTip: string;
}

export interface CampaignIdea {
    channel: 'SMS' | 'Email';
    targetSegment: string;
    objective: string;
    message: string;
}

// Added RemiRecommendation to fix missing export error in constants.ts
export interface RemiRecommendation {
    id: string;
    type: 'opportunity' | 'optimization' | 'alert';
    title: string;
    description: string;
    impact?: string;
    actionLabel: string;
    isUrgent?: boolean;
}

// Placeholder types to satisfy component imports
export interface SocialActivity { id: string; }
export interface LocalEvent { id: string; }
export interface CommunityChallenge { id: string; }
