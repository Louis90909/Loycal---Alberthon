
import React, { useState } from 'react';
import type { Restaurant } from '../../shared/types';
import { MOCK_MENU, MOCK_EVENTS } from '../../shared/constants';
import BookingModal from './BookingModal';
import { RemiIcon } from '../../restaurateur/components/icons/RemiIcon';

interface RestaurantDetailsProps {
    restaurant: Restaurant;
    onBack: () => void;
    onToggleFollow: (id: number) => void;
}

const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({ restaurant, onBack, onToggleFollow }) => {
    const [activeTab, setActiveTab] = useState<'menu' | 'loyalty' | 'infos'>('menu');
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    
    return (
        <div className="bg-white dark:bg-slate-900 min-h-full animate-fade-in relative z-50">
            {/* IMMERSIVE HERO */}
            <div className="h-[40vh] w-full relative">
                <img 
                    src={`https://picsum.photos/seed/${restaurant.id}/800/800`} 
                    className="w-full h-full object-cover"
                    alt={restaurant.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
                
                <button 
                    onClick={onBack}
                    className="absolute top-14 left-6 bg-white/20 backdrop-blur-xl p-3 rounded-full text-white hover:bg-white/40 transition-all active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-8 pb-12">
                     <span className="bg-brand-secondary text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block shadow-lg">
                        {restaurant.cuisine}
                    </span>
                    <h1 className="text-4xl font-extrabold text-white leading-tight shadow-sm mb-2">{restaurant.name}</h1>
                    <div className="flex items-center text-white/90 font-medium text-sm space-x-2">
                        <span>{'€'.repeat(restaurant.budget)}</span>
                        <span>•</span>
                        <span>{restaurant.ambiance}</span>
                        <span>•</span>
                        <span className="text-yellow-400">★ {restaurant.aggregateRating}</span>
                    </div>
                </div>
            </div>

            {/* CONTENT CONTAINER - Round corners overlapping image */}
            <div className="relative -mt-6 bg-white dark:bg-slate-900 rounded-t-[2.5rem] min-h-[500px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                
                {/* TABS */}
                <div className="flex justify-center pt-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4"></div>
                </div>
                <div className="flex px-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-[2.5rem]">
                    {['menu', 'loyalty', 'infos'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === tab 
                                ? 'border-gray-900 text-gray-900 dark:text-white dark:border-white' 
                                : 'border-transparent text-gray-400'
                            }`}
                        >
                            {tab === 'menu' ? 'La Carte' : tab === 'loyalty' ? 'Fidélité' : 'Infos'}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="p-6 pb-32">
                    {activeTab === 'menu' && (
                        <div className="space-y-8 animate-fade-in">
                            {['Plats', 'Desserts', 'Boissons'].map(cat => (
                                <div key={cat}>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{cat}</h3>
                                    <div className="space-y-4">
                                        {MOCK_MENU.filter(m => m.category === cat).map((item, index) => (
                                            <div key={item.id} className="flex items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h4>
                                                        {/* Ajout suggestif Rémi */}
                                                        {cat === 'Plats' && index === 0 && (
                                                            <div className="flex items-center bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                                                                <div className="w-3 h-3 mr-1"><RemiIcon /></div>
                                                                Top
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">Délicieux choix du chef.</p>
                                                    <span className="text-brand-primary font-bold mt-1 block">{item.price} €</span>
                                                </div>
                                                <div className="w-20 h-20 bg-gray-100 rounded-xl bg-cover bg-center" style={{backgroundImage: `url(${item.image || 'https://picsum.photos/100'})`}}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'loyalty' && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                                <div className="relative z-10">
                                    <p className="opacity-80 text-sm mb-1">Votre cagnotte</p>
                                    <p className="text-4xl font-bold mb-4">{restaurant.loyaltyData?.points || 0} <span className="text-lg font-normal">pts</span></p>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-secondary w-[40%]"></div>
                                    </div>
                                    <p className="text-xs mt-2 opacity-60">Encore 120 pts pour le niveau Gold</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => onToggleFollow(restaurant.id)}
                                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all ${
                                    restaurant.isFollowed 
                                    ? 'bg-gray-100 text-gray-500' 
                                    : 'bg-brand-secondary text-white hover:bg-orange-600'
                                }`}
                            >
                                {restaurant.isFollowed ? '✓ Vous êtes membre' : 'Rejoindre le club fidélité'}
                            </button>
                         </div>
                    )}

                    {activeTab === 'infos' && (
                        <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
                            <p>📍 12 Rue de Rivoli, Paris</p>
                            <p>📞 01 23 45 67 89</p>
                            <p>⏰ Ouvert tous les jours jusqu'à 23h</p>
                        </div>
                    )}
                </div>

                {/* STICKY BOTTOM ACTION */}
                <div className="fixed bottom-6 left-6 right-6 z-50">
                    <button 
                        onClick={() => setIsBookingOpen(true)}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-2xl hover:scale-[1.02] transition-transform flex justify-between px-8 items-center"
                    >
                        <span>Réserver une table</span>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">Dès 20:00</span>
                    </button>
                </div>
            </div>

            <BookingModal 
                isOpen={isBookingOpen} 
                onClose={() => setIsBookingOpen(false)} 
                restaurantName={restaurant.name} 
                restaurantId={restaurant.id}
            />
        </div>
    );
};

export default RestaurantDetails;
