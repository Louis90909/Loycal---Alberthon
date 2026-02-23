/**
 * Script de migration des données mock vers Firebase Firestore
 * À exécuter une seule fois depuis la console du navigateur ou via un bouton admin
 * 
 * Usage dans la console navigateur :
 *   import('/src/shared/services/firebaseMigration.ts').then(m => m.migrateAllData())
 */

import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    query,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from './firebase';

// ============================================
// DONNÉES MOCK À MIGRER
// ============================================

const DEMO_USERS = [
    { email: 'admin@loycal.com', password: 'DEMO_PASSWORD_HERE', firstName: 'Super', lastName: 'Admin', role: 'ADMIN' },
    { email: 'resto@bistrot.com', password: 'DEMO_PASSWORD_HERE', firstName: 'Jean', lastName: 'Bistrot', role: 'RESTAURATEUR', restaurantId: 'resto-1' },
    { email: 'client@loycal.com', password: 'DEMO_PASSWORD_HERE', firstName: 'Client', lastName: 'Demo', role: 'CLIENT' },
];

const DEMO_RESTAURANTS = [
    {
        id: 'resto-1',
        name: 'Le Bistrot Gourmand',
        cuisine: 'Française',
        offer: 'Café gourmand offert',
        lat: 48.8584, lng: 2.2945,
        budget: 2,
        popularity: 'Populaire',
        ambiance: 'Romantique',
        distance: 120,
        status: 'ACTIVE',
        aggregateRating: 4.7,
        visitCount: 850,
        rewardScore: 75,
        description: 'Restaurant gastronomique français au cœur de Paris.',
        menu: [
            { id: 'm1', name: 'Burger Classic', price: 14.50, category: 'Plats', available: true },
            { id: 'm2', name: 'Le Bacon Cheese', price: 16.00, category: 'Plats', available: true },
            { id: 'm3', name: 'Frites Maison', price: 4.50, category: 'Accompagnements', available: true },
            { id: 'm4', name: 'Tiramisu Nutella', price: 7.50, category: 'Desserts', available: true },
            { id: 'm7', name: 'Café Gourmand', price: 8.50, category: 'Desserts', available: true },
        ],
        activePromotions: [
            { id: 'p1', restaurantId: 'resto-1', title: 'Happy Hour Double Points', description: 'Gagnez 2x plus de points entre 17h et 19h.', active: true }
        ]
    },
    {
        id: 'resto-2',
        name: 'Mama Pizza',
        cuisine: 'Italienne',
        offer: '-20% sur la 2ème pizza',
        lat: 48.8566, lng: 2.3522,
        budget: 1,
        popularity: 'Tendance',
        ambiance: 'Cozy',
        distance: 450,
        status: 'ACTIVE',
        aggregateRating: 4.5,
        visitCount: 1200,
        rewardScore: 90,
        menu: [
            { id: 'm5', name: 'Pizza Margherita', price: 12.00, category: 'Plats', available: true },
            { id: 'm4', name: 'Tiramisu Nutella', price: 7.50, category: 'Desserts', available: true },
        ],
        activePromotions: [
            { id: 'p2', restaurantId: 'resto-2', title: 'Vente Flash: Margherita', description: 'Seulement 8€ ce midi !', active: true }
        ]
    },
    {
        id: 'resto-3',
        name: 'Sushi Zen Master',
        cuisine: 'Japonaise',
        offer: 'Soupe Miso offerte',
        lat: 48.8606, lng: 2.3376,
        budget: 3,
        popularity: 'Populaire',
        ambiance: 'Business',
        distance: 800,
        status: 'ACTIVE',
        aggregateRating: 4.8,
        visitCount: 600,
        rewardScore: 60,
        menu: [
            { id: 'm6', name: 'Sushi Saumon (x6)', price: 9.50, category: 'Plats', available: true },
            { id: 'm7', name: 'Café Gourmand', price: 8.50, category: 'Desserts', available: true },
        ],
    },
    {
        id: 'resto-4',
        name: "L'Atelier du Burger",
        cuisine: 'Américaine',
        offer: 'Frites XL offertes',
        lat: 48.8534, lng: 2.3488,
        budget: 2,
        popularity: 'Nouveau',
        ambiance: 'Chill',
        distance: 300,
        status: 'ACTIVE',
        aggregateRating: 4.2,
        visitCount: 150,
        rewardScore: 30,
        menu: [
            { id: 'm1', name: 'Burger Classic', price: 14.50, category: 'Plats', available: true },
            { id: 'm2', name: 'Le Bacon Cheese', price: 16.00, category: 'Plats', available: true },
            { id: 'm3', name: 'Frites Maison', price: 4.50, category: 'Accompagnements', available: true },
        ],
    },
    {
        id: 'resto-5',
        name: 'Brunchy Corner',
        cuisine: 'Française',
        offer: 'Mousse au chocolat offerte',
        lat: 48.8644, lng: 2.3312,
        budget: 2,
        popularity: 'Tendance',
        ambiance: 'Festif',
        distance: 950,
        status: 'ACTIVE',
        aggregateRating: 4.6,
        visitCount: 450,
        rewardScore: 85,
        menu: [
            { id: 'm7', name: 'Café Gourmand', price: 8.50, category: 'Desserts', available: true },
            { id: 'm4', name: 'Tiramisu Nutella', price: 7.50, category: 'Desserts', available: true },
        ],
    },
    {
        id: 'resto-6',
        name: 'Le Petit Mexique',
        cuisine: 'Mexicaine',
        offer: 'Nachos de bienvenue',
        lat: 48.8512, lng: 2.3588,
        budget: 1,
        popularity: 'Classique',
        ambiance: 'Festif',
        distance: 1100,
        status: 'ACTIVE',
        aggregateRating: 4.4,
        visitCount: 980,
        rewardScore: 70,
        menu: [
            { id: 'm1', name: 'Burger Classic', price: 14.50, category: 'Plats', available: true },
            { id: 'm7', name: 'Café Gourmand', price: 8.50, category: 'Desserts', available: true },
        ],
    },
];

const DEMO_LOYALTY_PROGRAMS = [
    {
        id: 'lp-1',
        restaurantId: 'resto-1',
        type: 'points',
        spendingRatio: 1.5,
        rewardLabel: 'Dessert Offert',
        welcomeBonus: 0,
    },
    {
        id: 'lp-2',
        restaurantId: 'resto-2',
        type: 'stamps',
        targetCount: 10,
        rewardLabel: 'Pizza au choix offerte',
        welcomeBonus: 2,
    },
    {
        id: 'lp-3',
        restaurantId: 'resto-3',
        type: 'missions',
        missions: [
            { id: 'mis1', title: 'Fan de Ramen', goal: 3, reward: '1 Gyoza offert', icon: '🍜' },
            { id: 'mis2', title: 'Explorateur', goal: 5, reward: 'Plateau Tokyo offert', icon: '🍣' },
        ],
    },
    {
        id: 'lp-4',
        restaurantId: 'resto-4',
        type: 'spending',
        targetSpending: 100,
        rewardLabel: 'Menu Signature Offert',
    },
    {
        id: 'lp-5',
        restaurantId: 'resto-5',
        type: 'points',
        spendingRatio: 2,
        rewardLabel: 'Cocktail Offert',
    },
    {
        id: 'lp-6',
        restaurantId: 'resto-6',
        type: 'stamps',
        targetCount: 8,
        rewardLabel: 'Burrito Offert',
    },
];

const DEMO_CAMPAIGNS = [
    {
        restaurantId: 'resto-1',
        name: 'Relance Inactifs 30j',
        status: 'active',
        type: 'SMS',
        stats: { openRate: 45, conversionRate: 12, revenue: 850 },
        description: 'SMS automatique aux inactifs',
        targetSegment: 'Inactifs 30j',
    },
    {
        restaurantId: 'resto-1',
        name: 'Offre Jeudi Soir',
        status: 'ended',
        type: 'Push',
        stats: { openRate: 88, conversionRate: 25, revenue: 1420 },
        description: 'Double points ce jeudi',
        targetSegment: 'Habitués du soir',
    },
];

const DEMO_FLASH_PROMOS = [
    {
        restaurantId: 'resto-1',
        menuItemId: 'm1',
        itemName: 'Burger Classic',
        originalPrice: 14.50,
        discountPrice: 9.90,
        quantityTotal: 20,
        quantityRemaining: 8,
        startTime: '11:00',
        endTime: '23:00',
        active: true,
    },
];

// ============================================
// FONCTIONS DE MIGRATION
// ============================================

async function isAlreadyMigrated(): Promise<boolean> {
    const q = query(collection(db, 'restaurants'), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
}

async function migrateUsers() {
    console.log('👤 Migration des utilisateurs...');
    const results: { email: string; uid: string }[] = [];

    for (const user of DEMO_USERS) {
        try {
            // Essayer de créer le compte
            let uid: string;
            try {
                const cred = await createUserWithEmailAndPassword(auth, user.email, user.password);
                uid = cred.user.uid;
            } catch (e: any) {
                if (e.code === 'auth/email-already-in-use') {
                    // Connexion pour récupérer l'UID
                    const cred = await signInWithEmailAndPassword(auth, user.email, user.password);
                    uid = cred.user.uid;
                    console.log(`  ℹ️ Utilisateur existant: ${user.email}`);
                } else {
                    throw e;
                }
            }

            await setDoc(doc(db, 'users', uid), {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: 'ACTIVE',
                restaurantId: (user as any).restaurantId || null,
                createdAt: new Date().toISOString(),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            results.push({ email: user.email, uid });
            console.log(`  ✅ ${user.email} (${user.role})`);
        } catch (e: any) {
            console.error(`  ❌ Erreur pour ${user.email}:`, e.message);
        }
    }
    return results;
}

async function migrateRestaurants() {
    console.log('🍽️ Migration des restaurants...');
    for (const resto of DEMO_RESTAURANTS) {
        const { id, ...data } = resto;
        await setDoc(doc(db, 'restaurants', id), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log(`  ✅ ${resto.name}`);
    }
}

async function migrateLoyaltyPrograms() {
    console.log('🎯 Migration des programmes de fidélité...');
    for (const lp of DEMO_LOYALTY_PROGRAMS) {
        const { id, ...data } = lp;
        await setDoc(doc(db, 'loyaltyPrograms', id), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log(`  ✅ Programme pour ${lp.restaurantId} (${lp.type})`);
    }
}

async function migrateCampaigns() {
    console.log('📣 Migration des campagnes...');
    for (const camp of DEMO_CAMPAIGNS) {
        await addDoc(collection(db, 'campaigns'), {
            ...camp,
            createdAt: new Date().toISOString(),
        });
        console.log(`  ✅ ${camp.name}`);
    }
}

async function migrateFlashPromos() {
    console.log('⚡ Migration des flash promos...');
    for (const promo of DEMO_FLASH_PROMOS) {
        await addDoc(collection(db, 'flashPromotions'), {
            ...promo,
            createdAt: new Date().toISOString(),
        });
        console.log(`  ✅ Flash: ${promo.itemName}`);
    }
}

async function migrateMemberships(userUid: string) {
    console.log('🏅 Migration des adhésions client...');
    // Adhésions demo pour Client
    const memberships = [
        { userId: userUid, restaurantId: 'resto-1', points: 150, stamps: 0, tier: 'Silver', joinedDate: '2023-10-01' },
        { userId: userUid, restaurantId: 'resto-2', points: 0, stamps: 6, tier: 'Bronze', joinedDate: '2024-01-15' },
        { userId: userUid, restaurantId: 'resto-3', points: 200, stamps: 0, tier: 'Gold', joinedDate: '2023-05-20', missionsProgress: [{ missionId: 'mis1', current: 2 }] },
        { userId: userUid, restaurantId: 'resto-4', points: 45, stamps: 0, tier: 'Bronze', joinedDate: '2024-02-01' },
        { userId: userUid, restaurantId: 'resto-5', points: 380, stamps: 0, tier: 'Silver', joinedDate: '2023-11-12' },
        { userId: userUid, restaurantId: 'resto-6', points: 0, stamps: 3, tier: 'Bronze', joinedDate: '2023-08-05' },
    ];

    for (const m of memberships) {
        await addDoc(collection(db, 'memberships'), {
            ...m,
            createdAt: new Date().toISOString(),
        });
        console.log(`  ✅ Adhésion: ${m.restaurantId}`);
    }
}

// ============================================
// MIGRATION PRINCIPALE
// ============================================

export async function migrateAllData(): Promise<void> {
    console.log('🚀 Début de la migration vers Firebase...\n');

    try {
        // Vérifier si déjà migré
        if (await isAlreadyMigrated()) {
            console.log('⚠️ Des données existent déjà dans Firestore. Migration annulée pour éviter les doublons.');
            console.log('   Pour forcer la migration, appelez migrateAllData(true)');
            return;
        }

        // 1. Utilisateurs
        const users = await migrateUsers();
        const clientUid = users.find(u => u.email === 'client@loycal.com')?.uid;

        // 2. Restaurants
        await migrateRestaurants();

        // 3. Programmes de fidélité
        await migrateLoyaltyPrograms();

        // 4. Campagnes
        await migrateCampaigns();

        // 5. Flash promos
        await migrateFlashPromos();

        // 6. Adhésions (si on a l'UID de Client)
        if (clientUid) {
            await migrateMemberships(clientUid);
        }

        console.log('\n✅ Migration terminée avec succès !');
        console.log('\n📋 Comptes de démo créés :');
        console.log('   👤 Client    : client@loycal.com / (mot de passe configuré)');
        console.log('   🍴 Resto     : resto@bistrot.com / (mot de passe configuré)');
        console.log('   ⚙️  Admin     : admin@loycal.com / (mot de passe configuré)');

    } catch (error: any) {
        console.error('❌ Erreur lors de la migration:', error.message);
        throw error;
    }
}

export default migrateAllData;
