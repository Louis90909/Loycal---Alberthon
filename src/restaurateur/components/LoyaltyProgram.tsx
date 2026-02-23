
import React, { useState, useEffect } from 'react';
import { RemiIcon } from './icons/RemiIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { LoyaltyProgramType, LoyaltyConfig, Mission } from '../../shared/types';
import { generateDynamicInsight } from '../services/geminiService';
import { getBackendService } from '../../shared/services/apiConfig';

// --- COMPONENTS ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode, title?: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                {title && (
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

const LoyaltyProgram: React.FC = () => {
    const [config, setConfig] = useState<LoyaltyConfig>({
        type: 'stamps',
        spendingRatio: 1,
        targetCount: 10,
        targetSpending: 100,
        welcomeBonus: 0,
        rewardLabel: 'Un Dessert Offert',
        missions: []
    });

    const [newMission, setNewMission] = useState<{ title: string, goal: number, reward: string }>({ title: '', goal: 1, reward: '' });
    const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [aiInsight, setAiInsight] = useState<string>("Chargement de l'analyse de Rémi...");
    const [isInsightLoading, setIsInsightLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsInsightLoading(true);
            try {
                const backend = await getBackendService();
                const user = backend.getCurrentUser();
                if (user?.restaurantId) {
                    const analytics: any = await backend.getAnalytics(
                        user.restaurantId
                    );
                    const context = {
                        revenue: analytics?.totalRevenue || 0,
                        averageTicket: analytics?.averageTicket || 0,
                        loyaltyType: config.type
                    };
                    const result = await generateDynamicInsight("Programme de Fidélité", context);
                    if (isMounted) setAiInsight(result);
                } else {
                    if (isMounted) setAiInsight("Le mode 'Tampons' est idéal pour les restaurants à forte fréquence de visite.");
                }
            } catch (error) {
                setAiInsight("Le mode 'Tampons' est idéal pour les restaurants à forte fréquence de visite.");
            } finally {
                setIsInsightLoading(false);
            }
        };
        let isMounted = true;
        fetchInsight();
        return () => { isMounted = false; };
    }, [config.type]);

    const handleSave = () => {
        setIsMigrationModalOpen(true);
    };

    const confirmMigration = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsMigrationModalOpen(false);
            alert("Programme mis à jour ! Les clients ont été notifiés.");
        }, 1500);
    };

    const addMission = () => {
        if (!newMission.title || !newMission.reward) return;
        const mission: Mission = {
            id: Date.now().toString(),
            title: newMission.title,
            goal: newMission.goal,
            reward: newMission.reward,
            icon: '🎯'
        };
        setConfig({ ...config, missions: [...(config.missions || []), mission] });
        setNewMission({ title: '', goal: 1, reward: '' });
    };

    const removeMission = (id: string) => {
        setConfig({ ...config, missions: config.missions?.filter(m => m.id !== id) });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-20 max-w-5xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 mt-4">Programme de Fidélité</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { id: 'points', label: 'Points', icon: '🎯', desc: 'Classique & Flexible' },
                        { id: 'stamps', label: 'Tampons', icon: '🎫', desc: 'Simple & Efficace' },
                        { id: 'spending', label: 'Cagnotte', icon: '💳', desc: 'Encourage la dépense' },
                        { id: 'missions', label: 'Missions', icon: '⚔️', desc: 'Gamification Fun' },
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setConfig({ ...config, type: mode.id as LoyaltyProgramType })}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 group ${config.type === mode.id
                                ? 'border-brand-secondary bg-brand-secondary/5 text-brand-secondary ring-4 ring-brand-secondary/20 shadow-lg scale-105'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-brand-primary/30 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{mode.icon}</span>
                            <span className="font-bold text-lg">{mode.label}</span>
                            <span className="text-xs font-medium mt-1 opacity-70">{mode.desc}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-brand-primary/5 to-blue-50 border border-brand-primary/10 rounded-2xl p-6 mb-10 flex items-start space-x-5 shadow-sm">
                    <div className="bg-white p-3 rounded-full shadow-md border border-gray-100 flex-shrink-0 -mt-1">
                        <RemiIcon className="w-12 h-12" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-brand-primary text-sm uppercase tracking-wide mb-1 flex items-center">
                            L'avis de Rémi l'Expert
                            {isInsightLoading ? (
                                <SpinnerIcon className="ml-2 w-4 h-4 text-brand-primary" />
                            ) : (
                                <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            )}
                        </h4>
                        <p className={`text-gray-700 text-lg leading-relaxed font-medium transition-opacity duration-300 ${isInsightLoading ? 'opacity-50' : 'opacity-100'}`}>
                            {aiInsight}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-secondary"></div>
                    <h3 className="font-bold text-2xl text-gray-800 border-b border-gray-100 pb-4">Configuration : Mode {config.type.charAt(0).toUpperCase() + config.type.slice(1)}</h3>

                    {config.type === 'points' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-base font-bold text-gray-700 mb-3">Générosité (Points par Euro)</label>
                                <div className="flex items-center space-x-6">
                                    <input
                                        type="range" min="0.5" max="5" step="0.5"
                                        value={config.spendingRatio}
                                        onChange={(e) => setConfig({ ...config, spendingRatio: parseFloat(e.target.value) })}
                                        className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                                    />
                                    <div className="bg-brand-primary text-white px-4 py-2 rounded-xl font-bold text-xl min-w-[100px] text-center shadow-md">
                                        {config.spendingRatio} pts
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {config.type === 'stamps' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-3">Objectif à atteindre (Tampons)</label>
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => setConfig({ ...config, targetCount: Math.max(5, (config.targetCount || 10) - 1) })} className="w-12 h-12 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 text-xl text-gray-600 transition-colors">-</button>
                                        <span className="text-4xl font-extrabold text-brand-dark w-32 text-center">{config.targetCount}</span>
                                        <button onClick={() => setConfig({ ...config, targetCount: Math.min(20, (config.targetCount || 10) + 1) })} className="w-12 h-12 rounded-xl bg-gray-100 font-bold hover:bg-gray-200 text-xl text-gray-600 transition-colors">+</button>
                                    </div>
                                </div>
                                <div className="bg-brand-light/30 border border-brand-primary/20 p-4 rounded-xl relative">
                                    <div className="absolute -top-3 -right-3">
                                        <RemiIcon className="w-10 h-10" />
                                    </div>
                                    <label className="block text-sm font-bold text-brand-primary mb-2">Boost Démarrage ("Illusion de Progrès")</label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="checkbox"
                                            checked={!!config.welcomeBonus && config.welcomeBonus > 0}
                                            onChange={(e) => setConfig({ ...config, welcomeBonus: e.target.checked ? 2 : 0 })}
                                            className="w-6 h-6 text-brand-secondary rounded focus:ring-brand-secondary cursor-pointer"
                                        />
                                        <span className="text-gray-800 font-medium">Offrir 2 tampons à l'inscription ?</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {config.type === 'spending' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-base font-bold text-gray-700 mb-3">Palier de dépenses (€)</label>
                                <div className="relative max-w-sm">
                                    <input
                                        type="number"
                                        value={config.targetSpending}
                                        onChange={(e) => setConfig({ ...config, targetSpending: parseInt(e.target.value) })}
                                        className="w-full border-2 border-gray-200 rounded-xl p-4 text-xl font-bold focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary transition-all pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">€</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {config.type === 'missions' && (
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-base font-bold text-gray-700">Missions Actives</label>
                                {(!config.missions || config.missions.length === 0) && (
                                    <div className="text-gray-400 italic text-sm p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                                        Aucune mission configurée. Ajoutez-en une ci-dessous.
                                    </div>
                                )}
                                {config.missions?.map((m, i) => (
                                    <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center text-lg font-bold text-brand-primary">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{m.title}</p>
                                                <p className="text-sm text-gray-500">Objectif: {m.goal} fois • Gain: <span className="text-brand-secondary font-semibold">{m.reward}</span></p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeMission(m.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center"><span className="text-xl mr-2">✨</span> Créer une nouvelle quête</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre de la mission</label>
                                        <input type="text" placeholder="Ex: Manger 3 Burgers" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary" value={newMission.title} onChange={(e) => setNewMission({ ...newMission, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Objectif (Qté)</label>
                                        <input type="number" min="1" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary" value={newMission.goal} onChange={(e) => setNewMission({ ...newMission, goal: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Récompense</label>
                                    <input type="text" placeholder="Ex: 1 Dessert" className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-primary" value={newMission.reward} onChange={(e) => setNewMission({ ...newMission, reward: e.target.value })} />
                                </div>
                                <button onClick={addMission} disabled={!newMission.title || !newMission.reward} className="w-full py-3 bg-brand-secondary text-white font-bold rounded-xl shadow hover:bg-orange-700 disabled:opacity-50 transition-all">Ajouter la mission</button>
                            </div>
                        </div>
                    )}

                    {config.type !== 'missions' && (
                        <div className="pt-6 border-t border-gray-100">
                            <label className="block text-base font-bold text-gray-700 mb-3">Récompense principale</label>
                            <input type="text" value={config.rewardLabel} onChange={(e) => setConfig({ ...config, rewardLabel: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary bg-gray-50 transition-all" placeholder="Ex: Burger Offert..." />
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-end pb-10">
                    <button onClick={handleSave} className="px-10 py-5 bg-brand-primary text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-brand-dark transition-transform hover:scale-105 active:scale-95 flex items-center ring-4 ring-brand-primary/20">
                        <span>Publier le programme</span>
                        <svg className="w-6 h-6 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </div>

            <Modal isOpen={isMigrationModalOpen} onClose={() => setIsMigrationModalOpen(false)} title="Confirmation de changement">
                <div className="p-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <p className="text-sm text-yellow-700 font-bold">Changer de type de programme vers {config.type.toUpperCase()} modifiera l'expérience de vos clients.</p>
                    </div>
                    <p className="text-gray-600 mb-6">Vos clients actuels seront notifiés du nouveau fonctionnement du club.</p>
                    <div className="flex space-x-4">
                        <button onClick={() => setIsMigrationModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">Annuler</button>
                        <button onClick={confirmMigration} disabled={isSaving} className="flex-[2] py-3 bg-brand-secondary text-white font-bold rounded-xl shadow hover:bg-orange-700 flex justify-center items-center">
                            {isSaving ? <SpinnerIcon /> : "Confirmer la mise à jour"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LoyaltyProgram;
