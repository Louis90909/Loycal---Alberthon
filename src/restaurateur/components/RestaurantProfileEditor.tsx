
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../shared/mockBackend';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { MenuItem, Restaurant } from '../../shared/types';

const RestaurantProfileEditor: React.FC = () => {
    const [user, setUser] = useState(mockBackend.getCurrentUser());
    const [activeTab, setActiveTab] = useState<'general' | 'menu'>('general');
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    
    const [info, setInfo] = useState({ 
        name: '', cuisine: '', offer: '', description: '', 
        ambiance: 'Cozy' as any, budget: 2 as any
    });
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsPageLoading(true);
            try {
                const userId = user?.id;
                if (!userId || !user?.restaurantId) {
                    setIsPageLoading(false);
                    return;
                }
                
                // Récupérer le restaurant depuis l'API
                const r = await mockBackend.getRestaurant(user.restaurantId);
                
                if (r) {
                    setRestaurant(r);
                    setInfo({
                        name: r.name || '', 
                        cuisine: r.cuisine || '', 
                        offer: r.offer || '',
                        description: r.description || '', 
                        ambiance: r.ambiance || 'Cozy', 
                        budget: r.budget || 2
                    });
                    setMenu(r.menu || []);
                } else {
                    console.error('Restaurant not found');
                }
            } catch (error: any) {
                console.error('Error loading restaurant:', error);
            } finally {
                setIsPageLoading(false);
            }
        };
        
        if (user) {
            load();
        } else {
            setIsPageLoading(false);
        }
    }, [user]);

    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!user?.restaurantId) {
                throw new Error('Restaurant ID manquant');
            }
            
            await mockBackend.updateRestaurantProfile(user.restaurantId, info);
            alert("Profil mis à jour avec succès !");
            
            // Recharger les données
            const updated = await mockBackend.getRestaurant(user.restaurantId);
            if (updated) {
                setRestaurant(updated);
                setInfo({
                    name: updated.name || '', 
                    cuisine: updated.cuisine || '', 
                    offer: updated.offer || '',
                    description: updated.description || '', 
                    ambiance: updated.ambiance || 'Cozy', 
                    budget: updated.budget || 2
                });
            }
        } catch (error: any) {
            console.error('Error updating restaurant:', error);
            alert(error.message || "Une erreur est survenue lors de la sauvegarde.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveMenu = async () => {
        setIsLoading(true);
        try {
            if (!user?.restaurantId) {
                throw new Error('Restaurant ID manquant');
            }
            
            await mockBackend.updateRestaurantMenu(user.restaurantId, menu);
            alert("La carte a été publiée.");
            
            // Recharger les données
            const updated = await mockBackend.getRestaurant(user.restaurantId);
            if (updated) {
                setRestaurant(updated);
                setMenu(updated.menu || []);
            }
        } catch (error: any) {
            console.error('Error updating menu:', error);
            alert(error.message || "Erreur publication.");
        } finally {
            setIsLoading(false);
        }
    };

    const addOrUpdateMenuItem = () => {
        if (!editingItem) return;
        if (editingItem.id) {
            setMenu(menu.map(m => m.id === editingItem.id ? editingItem : m));
        } else {
            setMenu([...menu, { ...editingItem, id: `item-${Date.now()}` }]);
        }
        setEditingItem(null);
    };

    const deleteMenuItem = (id: string) => {
        if (window.confirm("Supprimer ce plat ?")) {
            setMenu(menu.filter(m => m.id !== id));
        }
    };

    if (isPageLoading) return (
        <div className="h-full flex flex-col items-center justify-center p-12">
            <SpinnerIcon className="w-12 h-12 text-brand-primary mb-4" />
            <p className="text-gray-500 font-medium">Récupération des données établissement...</p>
        </div>
    );

    if (!restaurant) return <div className="p-8 text-center text-red-500 font-bold">Impossible de charger le restaurant.</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Mon Établissement</h1>
                    <p className="text-gray-500">Gérez votre présence et votre offre sur Loycal.</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                    <button onClick={() => setActiveTab('general')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Informations</button>
                    <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'menu' ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Ma Carte</button>
                </div>
            </div>

            {activeTab === 'general' ? (
                <form onSubmit={handleSaveGeneral} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nom du restaurant</label>
                            <input required type="text" value={info.name} onChange={e => setInfo({...info, name: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 border focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cuisine</label>
                            <input required type="text" value={info.cuisine} onChange={e => setInfo({...info, cuisine: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 border focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Offre de bienvenue</label>
                            <input required type="text" value={info.offer} onChange={e => setInfo({...info, offer: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 border focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ambiance</label>
                            <select value={info.ambiance} onChange={e => setInfo({...info, ambiance: e.target.value as any})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 border focus:border-brand-primary outline-none">
                                <option>Cozy</option><option>Festif</option><option>Romantique</option><option>Business</option><option>Chill</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Budget moyen</label>
                            <select value={info.budget} onChange={e => setInfo({...info, budget: parseInt(e.target.value) as any})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 border focus:border-brand-primary outline-none">
                                <option value="1">€</option><option value="2">€€</option><option value="3">€€€</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea rows={4} value={info.description} onChange={e => setInfo({...info, description: e.target.value})} className="w-full bg-gray-50 border-gray-200 rounded-xl p-3 border focus:border-brand-primary outline-none" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isLoading} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg flex items-center min-w-[140px] justify-center transition-all active:scale-95">
                            {isLoading ? <SpinnerIcon className="mr-0" /> : "Enregistrer"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
                        <p className="text-gray-600 font-medium">Gérez les plats disponibles sur votre profil client.</p>
                        <button onClick={() => setEditingItem({ id: '', name: '', price: 10, category: 'Plats', available: true })} className="px-4 py-2 bg-brand-secondary text-white font-bold rounded-lg shadow active:scale-95">+ Ajouter un plat</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menu.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl shadow-inner">🍽️</div>
                                    <div>
                                        <p className="font-bold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-400">{item.category} • {item.price.toFixed(2)}€</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingItem(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">✏️</button>
                                    <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button onClick={handleSaveMenu} disabled={isLoading} className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg flex items-center min-w-[160px] justify-center transition-all active:scale-95">
                            {isLoading ? <SpinnerIcon className="mr-0" /> : "Publier la carte"}
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL EDIT ITEM */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-6 text-gray-800">{editingItem.id ? 'Modifier le plat' : 'Nouveau plat'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom du plat</label>
                                <input type="text" required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prix (€)</label>
                                    <input type="number" step="0.5" required value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Catégorie</label>
                                    <select value={editingItem.category} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary">
                                        <option>Plats</option><option>Entrées</option><option>Desserts</option><option>Boissons</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-8">
                            <button onClick={() => setEditingItem(null)} className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-800">Annuler</button>
                            <button onClick={addOrUpdateMenuItem} className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default RestaurantProfileEditor;
