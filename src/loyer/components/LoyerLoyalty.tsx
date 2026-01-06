
import React, { useState } from 'react';
import type { Restaurant, Reward, LoyaltyTier, UserLoyaltyData, LoyaltyConfig } from '../../shared/types';

interface LoyerLoyaltyProps {
    restaurants: Restaurant[];
    onToggleFollow?: (id: number) => void;
}

// --- SUB-COMPONENTS FOR DIFFERENT CARDS ---

const TierBadge: React.FC<{ tier: LoyaltyTier }> = ({ tier }) => {
    const colors = {
        Bronze: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800',
        Silver: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
        Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800',
    };
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[tier]}`}>
            <span className="mr-1">{icons[tier]}</span>
            {tier}
        </span>
    );
};

const PointsCard: React.FC<{ restaurant: Restaurant, data: UserLoyaltyData, config: LoyaltyConfig }> = ({ restaurant, data, config }) => {
    const progress = (data.points / data.nextTierThreshold) * 100;
    return (
        <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30">
            <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 dark:text-gray-400 font-medium">{data.tier}</span>
                <span className="text-gray-500 dark:text-gray-400">Prochain: <strong>{data.tier === 'Bronze' ? 'Silver' : 'Gold'}</strong></span>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-orange-300 to-orange-500`} 
                    style={{width: `${Math.min(progress, 100)}%`}}
                ></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-right">
                {data.nextTierThreshold - data.points} points restants
            </p>
        </div>
    );
};

const StampsCard: React.FC<{ restaurant: Restaurant, data: UserLoyaltyData, config: LoyaltyConfig }> = ({ restaurant, data, config }) => {
    const currentStamps = data.stamps || 6; // Mock if undefined
    const target = config.targetCount || 10;
    return (
        <div className="px-4 py-4 bg-gray-50/50 dark:bg-slate-700/30">
            <div className="grid grid-cols-5 gap-2 mb-3">
                {Array.from({ length: target }).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all ${
                        i < currentStamps 
                        ? 'bg-brand-secondary border-brand-secondary text-white shadow-sm' 
                        : 'border-gray-200 dark:border-slate-600 text-gray-300 dark:text-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                        <span className="text-[10px] font-bold">{i < currentStamps ? '✓' : i+1}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                Plus que {target - currentStamps} tampons pour : <span className="text-brand-secondary font-bold">{config.rewardLabel}</span>
            </p>
        </div>
    );
};

const MissionsCard: React.FC<{ restaurant: Restaurant, data: UserLoyaltyData, config: LoyaltyConfig }> = ({ restaurant, data, config }) => {
    const missions = config.missions || [];
    return (
        <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-700/30 space-y-3">
            {missions.map(mission => {
                const userProgress = data.missionsProgress?.find(p => p.missionId === mission.id)?.current || 0;
                const percent = (userProgress / mission.goal) * 100;
                return (
                    <div key={mission.id} className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-gray-100 dark:border-slate-600 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{mission.icon} {mission.title}</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{userProgress}/{mission.goal}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-purple-500 rounded-full" style={{width: `${percent}%`}}></div>
                        </div>
                        <div className="text-[10px] text-right text-purple-600 dark:text-purple-400 font-bold">
                            Gain : {mission.reward}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const SpendingCard: React.FC<{ restaurant: Restaurant, data: UserLoyaltyData, config: LoyaltyConfig }> = ({ restaurant, data, config }) => {
    const spent = data.points; // Using points field as "amount spent" for this demo
    const target = config.targetSpending || 100;
    const progress = (spent / target) * 100;
    
    return (
        <div className="px-4 py-4 bg-gray-50/50 dark:bg-slate-700/30 flex items-center justify-between">
            <div className="flex-1 mr-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Cagnotte</span>
                    <span className="font-bold text-green-600">{spent}€ / {target}€</span>
                </div>
                <div className="h-3 w-full bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{width: `${Math.min(progress, 100)}%`}}></div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase">Récompense</div>
                <div className="text-xs font-bold text-brand-primary">{config.rewardLabel}</div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const LoyerLoyalty: React.FC<LoyerLoyaltyProps> = ({ restaurants, onToggleFollow }) => {
    const [activeTab, setActiveTab] = useState<'cards' | 'wallet'>('cards');
    
    // Filtre pour ne montrer que les restaurants suivis
    const myPrograms = restaurants.filter(r => r.isFollowed && r.loyaltyData);
    
    // Aggregates for header
    const totalPoints = myPrograms.reduce((acc, curr) => acc + (curr.loyaltyData?.points || 0), 0);
    const allRewards = myPrograms.flatMap(r => 
        (r.loyaltyData?.rewards || []).map(reward => ({ ...reward, restaurantName: r.name, restaurantId: r.id }))
    );
    const realTimeRewards = allRewards.filter(r => r.isRealTime);
    const regularRewards = allRewards.filter(r => !r.isRealTime);

    const handleUseReward = (name: string) => {
        alert(`Vous avez utilisé : ${name}. Montrez ce code au serveur.`);
    }

    return (
        <div className="bg-gray-50 dark:bg-slate-900 h-full animate-fade-in pb-24 transition-colors duration-500">
            {/* Header / Digital Card */}
            <div className="relative bg-brand-primary h-64 rounded-b-[40px] px-6 pt-12 text-white shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary opacity-10 rounded-full -ml-10 -mb-10 pointer-events-none"></div>
                
                <div className="relative z-10 text-center">
                    <h1 className="text-xl font-medium opacity-90">Loycal Pass Universel</h1>
                    <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner flex flex-col items-center">
                        <p className="text-sm font-light opacity-80 mb-1">Points cumulés</p>
                        <p className="text-5xl font-bold tracking-tight">{totalPoints}</p>
                        <div className="mt-4 bg-white p-2 rounded-lg">
                             {/* Fake QR Code */}
                            <div className="w-32 h-8 bg-gray-900 flex items-center justify-center space-x-1 overflow-hidden">
                                {Array.from({length: 12}).map((_,i) => (
                                    <div key={i} className="w-1.5 h-full bg-white mx-[1px]" style={{height: `${Math.random() * 100}%`}}></div>
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] mt-2 opacity-60">Scannez ce code en caisse</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center -mt-6 relative z-20 px-6">
                <div className="bg-white dark:bg-slate-800 rounded-full shadow-lg p-1 flex w-full max-w-sm">
                    <button 
                        onClick={() => setActiveTab('cards')}
                        className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'cards' ? 'bg-brand-secondary text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        Mes Cartes ({myPrograms.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('wallet')}
                        className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'wallet' ? 'bg-brand-secondary text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        Récompenses ({allRewards.length})
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 mt-6 space-y-6">
                
                {/* WALLET TAB */}
                {activeTab === 'wallet' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Real-time Offers */}
                        {realTimeRewards.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                                    <span className="animate-pulse mr-2">⚡</span> Offres Flash & Happy Hours
                                </h2>
                                <div className="space-y-3">
                                    {realTimeRewards.map((reward, idx) => (
                                        <div key={idx} className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-900 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                                            <div className="relative z-10 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-lg">{reward.description}</p>
                                                    <p className="text-sm opacity-90">{reward.restaurantName}</p>
                                                    {reward.expiry && <p className="text-xs font-bold mt-2 bg-white/20 inline-block px-2 py-1 rounded">Expire: {reward.expiry}</p>}
                                                </div>
                                                <button onClick={() => handleUseReward(reward.description)} className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Rewards */}
                        <div>
                             <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Récompenses disponibles</h2>
                             {regularRewards.length === 0 ? (
                                 <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                                     <p className="text-gray-500 dark:text-gray-400">Aucune récompense pour le moment.</p>
                                 </div>
                             ) : (
                                <div className="space-y-3">
                                    {regularRewards.map((reward, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 shadow-sm flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 dark:text-white">{reward.description}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{reward.restaurantName}</p>
                                            </div>
                                            <button onClick={() => handleUseReward(reward.description)} className="px-3 py-1.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition-colors">Utiliser</button>
                                        </div>
                                    ))}
                                </div>
                             )}
                        </div>
                    </div>
                )}

                {/* CARDS TAB */}
                {activeTab === 'cards' && (
                    <div className="space-y-4 animate-fade-in">
                        {myPrograms.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="bg-gray-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">Aucun programme rejoint</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-6">Explorez la carte pour trouver vos restaurants préférés.</p>
                            </div>
                        ) : (
                            myPrograms.map(resto => {
                                const data = resto.loyaltyData!;
                                const config = resto.loyaltyConfig || { type: 'points' }; // Default if missing
                                
                                return (
                                    <div key={resto.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transform transition-all hover:scale-[1.02]">
                                        {/* Card Header */}
                                        <div className="p-4 flex items-center space-x-4 border-b border-gray-50 dark:border-slate-700">
                                            <img src={`https://picsum.photos/seed/${resto.id}/100`} alt={resto.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white">{resto.name}</h3>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <TierBadge tier={data.tier} />
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                        {config.type === 'points' ? 'Points' : config.type === 'stamps' ? 'Carte Tampon' : config.type === 'spending' ? 'Cagnotte' : 'Missions'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {config.type === 'points' && (
                                                    <p className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">{data.points}</p>
                                                )}
                                                {config.type === 'stamps' && (
                                                    <p className="text-2xl font-bold text-brand-primary dark:text-brand-secondary">{data.stamps || 0}<span className="text-sm text-gray-400">/{config.targetCount || 10}</span></p>
                                                )}
                                                {config.type === 'spending' && (
                                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{data.points}€</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dynamic Body Content */}
                                        {config.type === 'points' && <PointsCard restaurant={resto} data={data} config={config} />}
                                        {config.type === 'stamps' && <StampsCard restaurant={resto} data={data} config={config} />}
                                        {config.type === 'spending' && <SpendingCard restaurant={resto} data={data} config={config} />}
                                        {config.type === 'missions' && <MissionsCard restaurant={resto} data={data} config={config} />}

                                        {/* Benefits / Footer */}
                                        <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                            <div className="flex flex-wrap gap-2">
                                                {(data.tier === 'Silver' || data.tier === 'Gold') && <span className="text-xs bg-white dark:bg-slate-600 border dark:border-slate-500 px-2 py-1 rounded text-gray-600 dark:text-gray-200">💎 Statut VIP</span>}
                                                <span className="text-xs bg-white dark:bg-slate-600 border dark:border-slate-500 px-2 py-1 rounded text-gray-600 dark:text-gray-200">🎁 {data.rewards.length} Avantage(s)</span>
                                            </div>
                                            {onToggleFollow && (
                                                <button onClick={() => onToggleFollow(resto.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">
                                                    Quitter
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoyerLoyalty;
