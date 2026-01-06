
import React, { useState } from 'react';
import type { Restaurant } from '../../shared/types';

interface LoyerProfileProps {
    restaurants: Restaurant[];
}

const dietaryPreferences = [
    "Végétarien",
    "Vegan",
    "Sans gluten",
    "Sans lactose",
    "Halal",
    "Casher"
];

// Mock Data pour l'historique spécifique au profil
const MOCK_HISTORY = [
    {
        id: 'RES-9021',
        type: 'reservation',
        date: 'Demain, 20:00',
        restaurantName: 'Sushi Zen Master',
        restaurantId: 3,
        status: 'upcoming',
        people: 2,
        pointsEarned: 0,
        amount: 0,
        items: []
    },
    {
        id: 'CMD-8859',
        type: 'order',
        date: 'Hier, 20:30',
        restaurantName: 'Le Bistrot Gourmand',
        restaurantId: 1,
        status: 'completed',
        people: 2,
        pointsEarned: 42,
        amount: 42.50,
        items: [
            { name: '2x Burger Classique', price: 29.00 },
            { name: '1x Vin Rouge (Pichet)', price: 13.50 }
        ],
        hasTicket: true
    },
    {
        id: 'CMD-7742',
        type: 'order',
        date: '05 Mai, 12:15',
        restaurantName: 'Pasta Bella',
        restaurantId: 2,
        status: 'completed',
        people: 1,
        pointsEarned: 18,
        amount: 18.00,
        items: [
            { name: '1x Pâtes Carbonara', price: 12.00 },
            { name: '1x Tiramisu', price: 6.00 }
        ],
        hasTicket: true
    }
];

// Composant Ticket Modal
const TicketModal: React.FC<{ item: any, onClose: () => void }> = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-none sm:rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up relative">
                
                {/* Header Ticket */}
                <div className="bg-brand-primary p-4 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">✕</button>
                    <h2 className="text-lg font-bold">Ticket de Caisse</h2>
                    <p className="text-sm opacity-80">{item.restaurantName}</p>
                </div>

                <div className="p-6 bg-white font-mono text-sm text-gray-800 relative">
                     {/* Dentelure CSS */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-white -mt-2" style={{maskImage: 'radial-gradient(circle, transparent 5px, black 6px)', maskSize: '15px 15px', maskPosition: 'bottom'}}></div>
                    
                    <div className="text-center mb-6 mt-2">
                        <p className="font-bold text-lg">{item.restaurantName}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                        <p className="text-xs text-gray-500">Commande #{item.id}</p>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                        {item.items.map((prod: any, i: number) => (
                            <div key={i} className="flex justify-between mb-1">
                                <span>{prod.name}</span>
                                <span>{prod.price.toFixed(2)} €</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between font-bold text-lg mb-2">
                        <span>TOTAL</span>
                        <span>{item.amount.toFixed(2)} €</span>
                    </div>

                    <div className="mt-6 bg-brand-secondary/10 p-3 rounded-lg border border-brand-secondary/20 text-center">
                        <p className="text-brand-secondary font-bold text-lg">+{item.pointsEarned} Points</p>
                        <p className="text-xs text-brand-dark">Fidélité Loycal</p>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="h-10 bg-gray-900 mx-auto w-3/4 flex items-center justify-center space-x-0.5 overflow-hidden">
                             {Array.from({length: 40}).map((_,i) => (
                                <div key={i} className="w-0.5 h-full bg-white mx-[0.5px]" style={{height: `${60 + Math.random() * 40}%`}}></div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{item.id}</p>
                    </div>
                </div>
                 <div className="p-4 bg-gray-100 dark:bg-slate-700 text-center">
                    <button onClick={onClose} className="text-brand-primary dark:text-white font-bold text-sm">Fermer</button>
                </div>
            </div>
        </div>
    );
}

// Composant Toggle Switch pour la section Données
const Toggle: React.FC<{ label: string, description: string, icon: string, enabled: boolean, onChange: () => void }> = ({ label, description, icon, enabled, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{description}</p>
            </div>
        </div>
        <button 
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${enabled ? 'bg-brand-secondary' : 'bg-gray-300 dark:bg-slate-600'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


const LoyerProfile: React.FC<LoyerProfileProps> = ({ restaurants }) => {
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [favoriteDishes, setFavoriteDishes] = useState("Pizza, Sushi, Burger");
    const [viewTicketItem, setViewTicketItem] = useState<any | null>(null);
    
    // State pour les communications
    const [comms, setComms] = useState({
        notifications: true,
        email: false,
        sms: true
    });
    
    // Dynamically filter followed restaurants based on props
    const myPrograms = restaurants.filter(r => r.isFollowed);

    const togglePreference = (preference: string) => {
        setSelectedPreferences(prev => 
            prev.includes(preference) 
                ? prev.filter(p => p !== preference)
                : [...prev, preference]
        );
    };

    const handleToggleComm = (key: keyof typeof comms) => {
        setComms(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 h-full animate-fade-in transition-colors duration-500">
            {/* Header */}
            <header className="px-4 pt-12 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personnalisez votre expérience Loycal</p>
                    </div>
                    <div className="relative">
                         <img src="https://picsum.photos/id/237/100/100" alt="User profile" className="w-16 h-16 rounded-full border-4 border-gray-50 dark:border-slate-800 shadow-md" />
                         <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="px-4 pb-24 space-y-8 mt-6">
                
                {/* My Loyalty Cards */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white">Mes Programmes</h2>
                         <span className="text-xs font-semibold bg-brand-light dark:bg-slate-800 text-brand-primary dark:text-brand-secondary px-2 py-1 rounded-full">{myPrograms.length} actifs</span>
                    </div>
                    
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                        {myPrograms.length > 0 ? myPrograms.map(resto => (
                            <div key={resto.id} className="min-w-[280px] flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex-shrink-0 flex items-center justify-center text-lg shadow-inner overflow-hidden">
                                     <img src={`https://picsum.photos/seed/${resto.id}/100`} alt={resto.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-brand-dark dark:text-white text-sm">{resto.name}</h3>
                                        <span className="text-xs font-bold text-brand-secondary">{resto.loyaltyData?.tier || 'Membre'}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                                        <div className="bg-brand-secondary h-1.5 rounded-full" style={{width: `${Math.floor(Math.random() * 80) + 10}%`}}></div>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                         <p className="text-[10px] text-gray-400">Prochaine: Café</p>
                                         <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{resto.loyaltyData?.points || 0} pts</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="w-full p-6 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Vous n'avez rejoint aucun programme.</p>
                                <p className="text-xs text-brand-secondary font-medium">Explorez la carte pour en trouver !</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Historique & Reservations */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Historique & Réservations</h2>
                    <div className="space-y-3">
                        {MOCK_HISTORY.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'reservation' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            <span className="text-lg">{item.type === 'reservation' ? '📅' : '🧾'}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.restaurantName}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                                        </div>
                                    </div>
                                    {item.status === 'upcoming' ? (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">À venir</span>
                                    ) : (
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.amount.toFixed(2)} €</p>
                                            {item.pointsEarned > 0 && <p className="text-xs font-bold text-brand-secondary">+{item.pointsEarned} pts</p>}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pl-[52px]">
                                    {item.type === 'reservation' ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Table pour {item.people} personnes.</p>
                                    ) : (
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-gray-500 italic">{item.items.length} articles</p>
                                            {item.hasTicket && (
                                                <button 
                                                    onClick={() => setViewTicketItem(item)}
                                                    className="flex items-center text-xs font-bold text-brand-primary dark:text-brand-secondary hover:underline"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Voir le ticket
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Données & Communications (NOUVELLE SECTION) */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Données & Communications</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Choisissez comment vous souhaitez recevoir les offres exclusives et les surprises de vos restaurants préférés.</p>
                    <div className="space-y-3">
                        <Toggle 
                            label="Notifications Push" 
                            description="Alertes temps réel et offres de proximité" 
                            icon="🔔" 
                            enabled={comms.notifications} 
                            onChange={() => handleToggleComm('notifications')} 
                        />
                        <Toggle 
                            label="Emails Marketing" 
                            description="Newsletters hebdomadaires et codes promos" 
                            icon="📧" 
                            enabled={comms.email} 
                            onChange={() => handleToggleComm('email')} 
                        />
                        <Toggle 
                            label="SMS & Offres Flash" 
                            description="Ventes privées et rappels de réservations" 
                            icon="📱" 
                            enabled={comms.sms} 
                            onChange={() => handleToggleComm('sms')} 
                        />
                    </div>
                </div>

                {/* Dietary Preferences */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Préférences Alimentaires</h2>
                    <div className="flex flex-wrap gap-2">
                        {dietaryPreferences.map(pref => {
                            const isSelected = selectedPreferences.includes(pref);
                            return (
                                <button 
                                    key={pref} 
                                    onClick={() => togglePreference(pref)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors border ${
                                        isSelected 
                                            ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {pref}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Favorite Dishes */}
                <div>
                    <label htmlFor="favorite-dishes" className="block text-xl font-bold text-gray-800 dark:text-white mb-3">
                        Mes Plats Préférés
                    </label>
                    <textarea
                        id="favorite-dishes"
                        rows={3}
                        className="block w-full rounded-xl border-gray-200 dark:border-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm bg-gray-50 dark:bg-slate-800 dark:text-white p-4"
                        placeholder="Listez ici vos plats favoris..."
                        value={favoriteDishes}
                        onChange={(e) => setFavoriteDishes(e.target.value)}
                    />
                </div>
                
                {/* Save Button */}
                <div className="pt-2">
                     <button
                        className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-brand-secondary hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transform transition-transform active:scale-95"
                    >
                        Sauvegarder les modifications
                    </button>
                </div>
            </div>

            {/* Ticket Modal Overlay */}
            <TicketModal item={viewTicketItem} onClose={() => setViewTicketItem(null)} />
        </div>
    );
};

export default LoyerProfile;
