
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../shared/mockBackend';
import { RemiIcon } from './icons/RemiIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { Campaign, MenuItem, Restaurant } from '../../shared/types';

const MarketingCampaigns: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isFlashOpen, setIsFlashOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    const [formData, setFormData] = useState({
        name: '', type: 'Push' as any, description: '', 
        targetSegment: 'Tous les membres'
    });

    // Flash Promo state
    const [flashData, setFlashData] = useState({
        menuItemId: '', discountPrice: 0, quantityTotal: 20,
        startTime: '19:00', endTime: '22:00', targetSegment: 'Clients du jeudi'
    });

    useEffect(() => {
        const load = async () => {
            try {
                const user = mockBackend.getCurrentUser();
                if (!user?.restaurantId) return;

                const r = await mockBackend.getRestaurant(user.restaurantId);
                if (r) {
                    setRestaurant(r);
                }

                const campaigns = await mockBackend.getCampaigns(user.restaurantId);
                setCampaigns(campaigns);
            } catch (error) {
                console.error('Error loading campaigns:', error);
            }
        };

        load();
        const unsub = mockBackend.subscribe(load);
        return unsub;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!restaurant?.id) {
                throw new Error('Restaurant non trouvé');
            }
            await mockBackend.createCampaign({ 
                ...formData, 
                restaurantId: restaurant.id, 
                status: 'active' 
            });
            setIsWizardOpen(false);
            
            // Recharger les campagnes
            const updatedCampaigns = await mockBackend.getCampaigns(restaurant.id);
            setCampaigns(updatedCampaigns);
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            alert(error.message || 'Erreur lors de la création de la campagne');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFlashSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const item = restaurant?.menu?.find(m => m.id === flashData.menuItemId);
        if (!item) {
            alert('Veuillez sélectionner un plat');
            return;
        }

        if (!restaurant?.id) {
            alert('Restaurant non trouvé');
            return;
        }

        setIsSubmitting(true);
        try {
            await mockBackend.createFlashPromotion({
                restaurantId: restaurant.id,
                menuItemId: item.id,
                itemName: item.name,
                originalPrice: Number(item.price),
                discountPrice: flashData.discountPrice,
                quantityTotal: flashData.quantityTotal,
                quantityRemaining: flashData.quantityTotal,
                startTime: flashData.startTime,
                endTime: flashData.endTime,
                active: true,
                targetSegment: flashData.targetSegment
            } as any);
            setIsFlashOpen(false);
            alert("Vente Flash lancée et notifications envoyées !");
            
            // Recharger les campagnes et promotions
            const updatedCampaigns = await mockBackend.getCampaigns(restaurant.id);
            setCampaigns(updatedCampaigns);
        } catch (error: any) {
            console.error('Error creating flash promotion:', error);
            alert(error.message || 'Erreur lors de la création de la promotion flash');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Campagnes & Promos</h2>
                    <p className="text-gray-500">Engagez votre base clients par segment.</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => setIsFlashOpen(true)} className="px-6 py-3 bg-brand-secondary text-white font-bold rounded-xl shadow-lg flex items-center animate-pulse">
                        ⚡ Vente Flash
                    </button>
                    <button onClick={() => setIsWizardOpen(true)} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg flex items-center">
                        + Nouvelle Campagne
                    </button>
                </div>
            </div>

            {/* LISTE DES CAMPAGNES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 text-sm font-semibold text-gray-600">Campagne</th>
                            <th className="p-5 text-sm font-semibold text-gray-600">Canal / Type</th>
                            <th className="p-5 text-sm font-semibold text-gray-600">Cible</th>
                            <th className="p-5 text-sm font-semibold text-gray-600 text-right">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {campaigns.map(camp => (
                            <tr key={camp.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-5">
                                    <p className="font-bold text-gray-900">{camp.name}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs">{camp.description}</p>
                                </td>
                                <td className="p-5">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${camp.type === 'flash' ? 'bg-orange-100 text-orange-700' : 'bg-brand-light text-brand-primary'}`}>{camp.type}</span>
                                </td>
                                <td className="p-5 text-sm text-gray-600 font-medium">{camp.targetSegment}</td>
                                <td className="p-5 text-right">
                                    <span className="text-sm font-bold text-green-600">+{camp.stats.revenue}€</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL CLASSIQUE */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Nouvelle campagne ciblée</h3>
                            <button onClick={() => setIsWizardOpen(false)} className="text-gray-400">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom</label>
                                <input required type="text" className="w-full border-gray-300 rounded-lg p-3 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Offre Weekend" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ciblage intelligent</label>
                                    <select className="w-full border-gray-300 rounded-lg p-3 border" value={formData.targetSegment} onChange={e => setFormData({...formData, targetSegment: e.target.value})}>
                                        <option>Tous les membres</option>
                                        <option>Clients du jeudi soir</option>
                                         <option>Gros paniers (&gt;40€)</option>
                                        <option>Inactifs depuis 30j</option>
                                        <option>VIP Gold</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Canal</label>
                                    <select className="w-full border-gray-300 rounded-lg p-3 border" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                        <option value="Push">Push App</option><option value="SMS">SMS</option><option value="Email">Email</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Message</label>
                                <textarea required className="w-full border-gray-300 rounded-lg p-3 border" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg flex justify-center items-center">
                                {isSubmitting ? <SpinnerIcon /> : "Lancer la campagne"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL FLASH PROMO (NOUVEAU) */}
            {isFlashOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-orange-100 bg-orange-50 flex justify-between items-center text-orange-800">
                            <h3 className="font-extrabold text-xl flex items-center">⚡ Créer une Vente Flash</h3>
                            <button onClick={() => setIsFlashOpen(false)} className="text-orange-400">✕</button>
                        </div>
                        <form onSubmit={handleFlashSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Choisir un plat de votre carte</label>
                                <select required className="w-full border-gray-300 rounded-lg p-3 border bg-white" value={flashData.menuItemId} onChange={e => setFlashData({...flashData, menuItemId: e.target.value})}>
                                    <option value="">-- Sélectionner un plat --</option>
                                    {restaurant?.menu?.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} ({item.price}€)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prix Promo (€)</label>
                                    <input type="number" step="0.5" className="w-full border-gray-300 rounded-lg p-3 border" value={flashData.discountPrice} onChange={e => setFlashData({...flashData, discountPrice: parseFloat(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Quantité Max</label>
                                    <input type="number" className="w-full border-gray-300 rounded-lg p-3 border" value={flashData.quantityTotal} onChange={e => setFlashData({...flashData, quantityTotal: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ciblage</label>
                                    <select className="w-full border-gray-300 rounded-lg p-3 border" value={flashData.targetSegment} onChange={e => setFlashData({...flashData, targetSegment: e.target.value})}>
                                        <option>Clients du jeudi soir</option>
                                        <option>Gros paniers</option>
                                        <option>Tous les membres</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Horaires (Début - Fin)</label>
                                    <div className="flex items-center space-x-2">
                                        <input type="time" className="w-full border-gray-300 rounded-lg p-2 border text-xs" value={flashData.startTime} onChange={e => setFlashData({...flashData, startTime: e.target.value})} />
                                        <span>-</span>
                                        <input type="time" className="w-full border-gray-300 rounded-lg p-2 border text-xs" value={flashData.endTime} onChange={e => setFlashData({...flashData, endTime: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-3">
                                <RemiIcon className="w-8 h-8 flex-shrink-0" />
                                <p className="text-xs text-blue-700 italic">"Lancer cette vente flash auprès des clients du jeudi stimulera votre service le plus calme de la semaine."</p>
                            </div>
                            <button type="submit" disabled={isSubmitting || !flashData.menuItemId} className="w-full py-4 bg-brand-secondary text-white font-extrabold rounded-xl shadow-lg flex justify-center items-center uppercase tracking-widest">
                                {isSubmitting ? <SpinnerIcon /> : "Lancer l'alerte Flash !"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MarketingCampaigns;
