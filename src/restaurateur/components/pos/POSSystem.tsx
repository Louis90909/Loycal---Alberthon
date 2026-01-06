
import React, { useState, useEffect } from 'react';
import type { POSOrder, MenuItem, OrderItem, Customer, Reward } from '../../../shared/types';
import { MOCK_MENU, MOCK_CUSTOMERS } from '../../../shared/constants';
import { mockBackend } from '../../../shared/mockBackend';
import { Button, Card, CardHeader, CardContent, KPICard, Badge, Modal, Input, EmptyState } from '../../../shared/design';

type POSScreen = 'home' | 'order' | 'payment' | 'invoice' | 'history' | 'settings';

interface POSSettings {
    darkMode: boolean;
    sound: boolean;
    autoPrint: boolean;
}

// --- SUB-COMPONENTS ---

const POSSidebar: React.FC<{ active: POSScreen, onChange: (s: POSScreen) => void, settings: POSSettings }> = ({ active, onChange, settings }) => (
    <div className={`w-24 flex flex-col items-center py-8 space-y-6 shadow-2xl z-20 transition-all duration-300 ${settings.darkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-gradient-to-b from-indigo-900 to-indigo-800'}`}>
        <div className="mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl font-bold">P</span>
            </div>
        </div>
        <button onClick={() => onChange('home')} className={`relative p-4 rounded-2xl transition-all ${active === 'home' ? 'bg-orange-500 text-white shadow-xl scale-110' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`} title="Accueil">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            {active === 'home' && <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-orange-500 rounded-l-full"></div>}
        </button>
        <button onClick={() => onChange('order')} className={`relative p-4 rounded-2xl transition-all ${active === 'order' ? 'bg-orange-500 text-white shadow-xl scale-110' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`} title="Commande">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            {active === 'order' && <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-orange-500 rounded-l-full"></div>}
        </button>
        <button onClick={() => onChange('history')} className={`relative p-4 rounded-2xl transition-all ${active === 'history' ? 'bg-orange-500 text-white shadow-xl scale-110' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`} title="Historique">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {active === 'history' && <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-orange-500 rounded-l-full"></div>}
        </button>
        <button onClick={() => onChange('settings')} className={`relative mt-auto p-4 rounded-2xl transition-all ${active === 'settings' ? 'bg-orange-500 text-white shadow-xl scale-110' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`} title="Paramètres">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {active === 'settings' && <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-orange-500 rounded-l-full"></div>}
        </button>
    </div>
);

// --- HOME SCREEN ---
const POSHomeScreen: React.FC<{ onNewOrder: () => void, onEditOrder: (order: POSOrder) => void, orders: POSOrder[], settings: POSSettings }> = ({ onNewOrder, onEditOrder, orders, settings }) => {
    const isNoon = new Date().getHours() < 16;
    const activeOrders = orders.filter(o => o.status === 'draft' || o.status === 'pending');
    
    const dailyTotal = orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + (curr.total || 0), 0);
    const coverCount = orders.filter(o => o.status === 'paid').length;

    return (
        <div className={`flex-1 p-8 overflow-y-auto transition-colors duration-300 ${settings.darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-4xl font-bold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>Caisse du Jour</h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <p className={`text-lg ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <Badge variant={isNoon ? 'info' : 'secondary'} size="md">
                        {isNoon ? '🌤️ Service du Midi' : '🌙 Service du Soir'}
                    </Badge>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <KPICard
                    title="Chiffre d'Affaires"
                    value={`${dailyTotal.toFixed(2)} €`}
                    subtitle="Toutes commandes payées"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    className="bg-gradient-to-br from-green-50 to-green-100"
                />
                <KPICard
                    title="Commandes Payées"
                    value={coverCount.toString()}
                    subtitle="Tickets encaissés aujourd'hui"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    }
                    className="bg-gradient-to-br from-blue-50 to-blue-100"
                />
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CTA Nouvelle commande */}
                <button 
                    onClick={onNewOrder}
                    className="col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 min-h-[280px] group"
                >
                    <div className="p-6 bg-white/20 rounded-full mb-6 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <span className="text-3xl font-bold mb-2">Nouvelle Commande</span>
                    <span className="text-orange-100 text-sm">Cliquez pour commencer</span>
                </button>

                {/* Orders in progress */}
                <Card padding="lg" className={`col-span-1 lg:col-span-2 min-h-[420px] flex flex-col ${settings.darkMode ? 'bg-gray-900 border-gray-700' : ''}`}>
                    <CardHeader 
                        title="Commandes en cours / Brouillons"
                        subtitle={`${activeOrders.length} commande(s) active(s)`}
                        icon={
                            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <CardContent className="flex-1 overflow-y-auto space-y-3">
                        {activeOrders.length === 0 && (
                            <EmptyState
                                icon={
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                }
                                title="Aucune commande active"
                                description="Les commandes en cours et brouillons apparaîtront ici"
                            />
                        )}
                        {activeOrders.map(order => (
                            <div 
                                key={order.id} 
                                onClick={() => onEditOrder(order)}
                                className={`flex justify-between items-center p-5 rounded-2xl cursor-pointer border-2 transition-all hover:shadow-lg ${
                                    settings.darkMode 
                                    ? 'bg-gray-800 border-gray-700 hover:border-orange-500' 
                                    : 'bg-white border-gray-200 hover:border-orange-500'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-1 h-16 rounded-full ${order.status === 'draft' ? 'bg-gray-400' : (order.type === 'dine_in' ? 'bg-blue-500' : 'bg-orange-500')}`}></div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className={`font-bold text-xl ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {order.tableNumber ? `Table ${order.tableNumber}` : (order.type === 'takeaway' ? 'À Emporter' : 'Livraison')}
                                            </p>
                                            {order.status === 'draft' && <Badge variant="neutral" size="sm">Brouillon</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-500">{order.items.length} articles • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-2xl text-orange-600">{(order.total || 0).toFixed(2)} €</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- QUIT MODAL ---
const QuitOrderModal: React.FC<{ isOpen: boolean, onSave: () => void, onDiscard: () => void, onClose: () => void }> = ({ isOpen, onSave, onDiscard, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-fade-in-up">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quitter la commande ?</h3>
                <p className="text-gray-600 mb-6">Vous pouvez sauvegarder pour plus tard ou annuler définitivement.</p>
                <div className="space-y-3">
                    <button onClick={onSave} className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark">
                        Sauvegarder en brouillon
                    </button>
                    <button onClick={onDiscard} className="w-full py-3 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200">
                        Annuler la commande
                    </button>
                    <button onClick={onClose} className="w-full py-3 text-gray-500 font-bold hover:text-gray-800">
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CUSTOMER IDENTIFICATION ---
const CustomerSearch: React.FC<{ onSelect: (c: Customer) => void, onCancel: () => void }> = ({ onSelect, onCancel }) => {
    return (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Identification Client Loïcal</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <div className="flex p-4 space-x-2 bg-gray-50">
                    <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-semibold shadow-sm text-brand-primary">📞 Téléphone</button>
                    <button className="flex-1 py-3 bg-gray-200 border border-transparent text-gray-600 rounded-xl font-semibold">📷 Scan QR</button>
                    <button className="flex-1 py-3 bg-gray-200 border border-transparent text-gray-600 rounded-xl font-semibold">🕒 Récents</button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Mock Search Result */}
                    <div className="mb-4">
                        <input type="text" placeholder="Rechercher par nom ou téléphone..." className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" />
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">Clients Récents</p>
                        {MOCK_CUSTOMERS.map(c => (
                            <div key={c.id} onClick={() => onSelect(c)} className="flex items-center p-3 hover:bg-blue-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-200 transition-colors">
                                <img src={c.avatarUrl} alt={c.name} className="w-12 h-12 rounded-full" />
                                <div className="ml-4 flex-1">
                                    <h3 className="font-bold text-gray-800">{c.name}</h3>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>{c.status}</span>
                                        <span>•</span>
                                        <span className="text-brand-secondary font-medium">{c.loyaltyScore} pts</span>
                                    </div>
                                </div>
                                <button className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Sélectionner</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- ORDER SCREEN ---
const POSOrderScreen: React.FC<{ 
    currentOrder: POSOrder, 
    onSaveDraft: (order: POSOrder) => void, 
    onDeleteOrder: (id: string) => void,
    onPayment: (order: POSOrder) => void,
    settings: POSSettings
}> = ({ currentOrder, onSaveDraft, onDeleteOrder, onPayment, settings }) => {
    
    // Local state for editing the order
    const [items, setItems] = useState<OrderItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Plats');
    const [linkedCustomer, setLinkedCustomer] = useState<Customer | undefined>(currentOrder.customer);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState<{desc: string, amount: number} | null>(
        currentOrder.appliedReward ? { desc: currentOrder.appliedReward.description, amount: 5.00 } : null
    );
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>(currentOrder.type === 'takeaway' ? 'takeaway' : 'dine_in');

    const categories = Array.from(new Set(MOCK_MENU.map(i => i.category)));
    const filteredItems = MOCK_MENU.filter(i => i.category === selectedCategory);

    // Sync items if prop changes and sanitize data
    useEffect(() => {
        // Sanitize items to ensure quantity exists and avoid crashes
        if (currentOrder && currentOrder.items) {
            const sanitizedItems = currentOrder.items.map(item => ({
                ...item,
                quantity: (item.quantity && item.quantity > 0) ? item.quantity : 1
            }));
            setItems(sanitizedItems);
            setLinkedCustomer(currentOrder.customer);
        } else {
            setItems([]);
        }
    }, [currentOrder?.id]);

    const addToCart = (item: MenuItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
            }
            return prev.filter(i => i.id !== itemId);
        });
    };

    // Safe calculation of total
    const calculateTotal = () => {
        const itemsTotal = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
        return Math.max(0, itemsTotal - (appliedDiscount?.amount || 0));
    };

    const total = calculateTotal();

    const handleApplyReward = (reward?: Reward) => {
        // Calculate discount dynamically
        let discountAmount = 5.00; // Default fallback
        let description = 'Remise Commerciale';

        if (reward) {
            description = reward.description;
            // Check if it's a percentage reward
            if (reward.description.includes('%')) {
                const percentMatch = reward.description.match(/(\d+)%/);
                if (percentMatch) {
                    const percent = parseInt(percentMatch[1]);
                    const itemsTotal = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
                    discountAmount = itemsTotal * (percent / 100);
                }
            } else if (reward.cost === 0) {
                // Free item? Assume ~8€ value for demo
                discountAmount = 8.00; 
            }
        } else {
            // Manual discount
            discountAmount = 10.00;
        }

        setAppliedDiscount({ desc: description, amount: discountAmount });
    }

    const prepareOrderObject = (status: 'draft' | 'pending' | 'paid'): POSOrder => ({
        ...currentOrder,
        items,
        total,
        status,
        type: orderType,
        customer: linkedCustomer,
        appliedReward: appliedDiscount ? { description: appliedDiscount.desc, cost: 0, id: 'r1', type: 'discount' } : undefined
    });

    return (
        <div className={`flex h-full relative transition-colors duration-300 ${settings.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {/* Left: Catalog */}
            <div className={`flex-1 flex flex-col border-r ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {/* Categories */}
                <div className={`h-20 shadow-sm flex items-center px-4 space-x-3 overflow-x-auto whitespace-nowrap scrollbar-hide ${settings.darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
                                selectedCategory === cat 
                                ? 'bg-brand-secondary text-white shadow-lg' 
                                : settings.darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                {/* Products Grid */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => addToCart(item)}
                                className={`p-4 rounded-2xl shadow-sm border flex flex-col items-center text-center hover:shadow-md transition-shadow active:scale-95 ${
                                    settings.darkMode 
                                    ? 'bg-gray-900 border-gray-700' 
                                    : 'bg-white border-gray-200'
                                }`}
                            >
                                <div className={`w-24 h-24 rounded-full mb-3 flex items-center justify-center overflow-hidden ${settings.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                     {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <span className="text-2xl">🍔</span>}
                                </div>
                                <span className={`font-bold text-lg leading-tight mb-1 ${settings.darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.name}</span>
                                <span className="text-brand-primary font-bold">{item.price.toFixed(2)} €</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart & Ticket */}
            <div className={`w-[400px] flex flex-col shadow-2xl relative border-l ${settings.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                {/* Header Toggle */}
                <div className={`p-4 border-b flex flex-col space-y-3 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                        <h2 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>#{currentOrder.id}</h2>
                    </div>
                    {/* Dine In / Take Away Toggle */}
                    <div className={`flex rounded-lg p-1 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <button 
                            onClick={() => setOrderType('dine_in')}
                            className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${orderType === 'dine_in' ? 'bg-white shadow text-brand-primary' : 'text-gray-500'}`}
                        >
                            🍽️ Sur place
                        </button>
                        <button 
                            onClick={() => setOrderType('takeaway')}
                            className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${orderType === 'takeaway' ? 'bg-white shadow text-brand-primary' : 'text-gray-500'}`}
                        >
                            🛍️ À emporter
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 && <div className="text-center text-gray-400 mt-10">Le panier est vide</div>}
                    {items.map(item => (
                        <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                            <div>
                                <p className={`font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</p>
                                <p className="text-sm text-gray-500">{item.price.toFixed(2)} €</p>
                            </div>
                            <div className={`flex items-center rounded-lg border shadow-sm ${settings.darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                                <button onClick={() => removeFromCart(item.id)} className={`w-8 h-8 flex items-center justify-center font-bold rounded-l-lg hover:bg-opacity-80 ${settings.darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'}`}>-</button>
                                <span className={`w-8 text-center font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className={`w-8 h-8 flex items-center justify-center font-bold rounded-r-lg hover:bg-opacity-80 ${settings.darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'}`}>+</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loyalty Panel (Foldable) */}
                <div className={`${settings.darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-brand-light border-t border-brand-primary/20'}`}>
                     {linkedCustomer ? (
                         <div className="p-4 animate-fade-in-up">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    <div className="relative">
                                        <img src={linkedCustomer.avatarUrl} className="w-10 h-10 rounded-full border-2 border-brand-primary" />
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border border-white"></div>
                                    </div>
                                    <div className="ml-3">
                                        <p className={`font-bold ${settings.darkMode ? 'text-white' : 'text-brand-dark'}`}>{linkedCustomer.name}</p>
                                        <p className="text-xs text-brand-secondary font-bold">{linkedCustomer.loyaltyScore} pts</p>
                                    </div>
                                </div>
                                <button onClick={() => setLinkedCustomer(undefined)} className="text-gray-400 hover:text-red-500">✕</button>
                            </div>
                            
                            {/* Available Rewards Logic */}
                            {!appliedDiscount ? (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Avantages Disponibles</p>
                                    <button 
                                        onClick={() => handleApplyReward()} 
                                        className={`w-full flex justify-between items-center p-2 border rounded-lg transition-colors ${settings.darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-brand-secondary/30 hover:bg-orange-50'}`}
                                    >
                                        <span className="font-bold text-brand-secondary text-sm">Remise Commerciale</span>
                                        <span className="text-xs bg-brand-secondary text-white px-2 py-0.5 rounded">-10.00€</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-2 bg-green-100 rounded-lg p-2 flex justify-between items-center border border-green-200">
                                    <span className="text-green-800 text-sm font-bold">✅ {appliedDiscount.desc}</span>
                                    <button onClick={() => setAppliedDiscount(null)} className="text-xs text-red-500 hover:underline">Retirer</button>
                                </div>
                            )}
                         </div>
                     ) : (
                         <button 
                            onClick={() => setShowCustomerSearch(true)}
                            className="w-full p-4 flex items-center justify-center text-brand-primary font-bold hover:bg-brand-primary/5 transition-colors"
                        >
                             <span className="mr-2 text-xl">🤝</span> Identifier Client Loïcal
                         </button>
                     )}
                </div>

                {/* Footer Total & Actions */}
                <div className={`p-4 border-t shadow-up ${settings.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="space-y-2 mb-4">
                        {appliedDiscount && (
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>{appliedDiscount.desc}</span>
                                <span>-{appliedDiscount.amount.toFixed(2)} €</span>
                            </div>
                        )}
                        <div className={`flex justify-between text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <span>Total</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => setShowQuitModal(true)} className="py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">
                            Quitter
                        </button>
                        <button 
                            onClick={() => onPayment(prepareOrderObject('pending'))}
                            disabled={items.length === 0}
                            className="py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none transition-all"
                        >
                            Encaisser
                        </button>
                    </div>
                </div>
            </div>

            {showCustomerSearch && <CustomerSearch onSelect={(c) => { setLinkedCustomer(c); setShowCustomerSearch(false); }} onCancel={() => setShowCustomerSearch(false)} />}
            
            <QuitOrderModal 
                isOpen={showQuitModal} 
                onClose={() => setShowQuitModal(false)}
                onSave={() => {
                    onSaveDraft(prepareOrderObject('draft'));
                    setShowQuitModal(false);
                }}
                onDiscard={() => {
                    onDeleteOrder(currentOrder.id);
                    setShowQuitModal(false);
                }}
            />
        </div>
    );
};

// --- PAYMENT SCREEN ---
const POSPaymentScreen: React.FC<{ order: POSOrder, onComplete: (method: 'card'|'cash'|'other') => void, onBack: () => void }> = ({ order, onComplete, onBack }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    
    // Use order total safely
    const orderTotal = (order.total || 0).toFixed(2);

    const handlePayment = (method: 'card'|'cash'|'other') => {
        setIsProcessing(true);
        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false);
            // Simulate Payment Success
            setShowSuccessPopup(true);
            // Wait a bit before completing
            setTimeout(() => {
                onComplete(method);
            }, 2000);
        }, 1500);
    };

    return (
        <div className="flex h-full bg-gray-100 p-8">
            {/* Receipt Preview */}
            <div className="w-1/3 bg-white shadow-lg rounded-2xl p-6 flex flex-col h-full border border-gray-200">
                <h2 className="text-center font-bold text-xl border-b pb-4 mb-4 text-gray-800">Récapitulatif</h2>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 border-b border-gray-50 pb-2">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{(item.price * (item.quantity || 1)).toFixed(2)} €</span>
                        </div>
                    ))}
                    {order.appliedReward && (
                        <div className="flex justify-between text-green-600 font-bold border-t border-dashed pt-2 mt-2">
                            <span>{order.appliedReward.description}</span>
                            <span>-5.00 €</span>
                        </div>
                    )}
                </div>
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-3xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>{orderTotal} €</span>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="flex-1 ml-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Paiement</h1>
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium">Retour commande</button>
                </div>

                {order.customer && (
                    <div className="mb-6 bg-brand-light border-l-4 border-brand-primary p-4 rounded-r-lg flex items-center shadow-sm">
                         <span className="text-2xl mr-3">🎉</span>
                         <div>
                             <p className="font-bold text-brand-dark">Client Loïcal identifié : {order.customer.name}</p>
                             <p className="text-sm text-brand-primary">Les avantages fidélité seront appliqués après paiement.</p>
                         </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 mb-8">
                    <button onClick={() => handlePayment('card')} disabled={isProcessing} className="h-32 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-brand-secondary flex flex-col items-center justify-center transition-all hover:shadow-md disabled:opacity-50 group">
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">💳</span>
                        <span className="text-xl font-bold text-gray-700 group-hover:text-brand-secondary">Carte Bancaire</span>
                    </button>
                    <button onClick={() => handlePayment('cash')} disabled={isProcessing} className="h-32 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-brand-secondary flex flex-col items-center justify-center transition-all hover:shadow-md disabled:opacity-50 group">
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">💶</span>
                        <span className="text-xl font-bold text-gray-700 group-hover:text-brand-secondary">Espèces</span>
                    </button>
                    <button className="h-32 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-brand-secondary flex flex-col items-center justify-center transition-all hover:shadow-md disabled:opacity-50 group">
                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🎫</span>
                        <span className="text-xl font-bold text-gray-700 group-hover:text-brand-secondary">Tickets Resto</span>
                    </button>
                    <button className="h-32 bg-gray-200 rounded-2xl shadow-inner flex flex-col items-center justify-center disabled:opacity-50">
                        <span className="text-xl font-bold text-gray-500">Autre</span>
                    </button>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm transform animate-fade-in-up">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Paiement Accepté !</h3>
                        {order.customer && (
                            <p className="text-lg text-gray-600 mb-6">
                                Programme fidélité mis à jour pour {order.customer.name}.
                            </p>
                        )}
                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-500">
                             Génération de la facture...
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- INVOICE SCREEN ---
const POSInvoiceScreen: React.FC<{ order: POSOrder, onFinished: () => void, settings: POSSettings }> = ({ order, onFinished, settings }) => {
    const [isPrinting, setIsPrinting] = useState(settings.autoPrint);

    useEffect(() => {
        if(settings.autoPrint) {
            const timer = setTimeout(() => setIsPrinting(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [settings.autoPrint]);

    if (!order) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>Erreur: Commande introuvable</p>
                <button onClick={onFinished} className="ml-4 text-blue-500">Retour</button>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-100 p-8 items-center justify-center relative">
            
            {/* Auto Print Overlay */}
            {isPrinting && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                        <span className="text-4xl mb-2">🖨️</span>
                        <p className="font-bold text-gray-800">Impression du ticket...</p>
                    </div>
                </div>
            )}

            {/* Actions Left */}
            <div className="mr-8 flex flex-col space-y-4">
                 <button className="bg-white p-4 rounded-xl shadow font-bold text-gray-700 flex items-center space-x-2 hover:bg-gray-50">
                    <span>🖨️</span> <span>Imprimer Ticket</span>
                 </button>
                 <button className="bg-white p-4 rounded-xl shadow font-bold text-gray-700 flex items-center space-x-2 hover:bg-gray-50">
                    <span>📧</span> <span>Envoyer par Email</span>
                 </button>
                 <div className="h-8"></div>
                 <button 
                    onClick={onFinished}
                    className="w-48 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark shadow-lg transition-transform hover:scale-105"
                >
                    Nouvelle Commande
                </button>
            </div>

            {/* Visual Receipt */}
            <div className="bg-white w-[350px] shadow-2xl text-gray-800 font-mono text-sm relative overflow-hidden animate-fade-in-up">
                 {/* Top Jagged Edge */}
                 <div className="absolute top-0 left-0 right-0 h-4 bg-gray-100" style={{maskImage: 'radial-gradient(circle, transparent 5px, black 6px)', maskSize: '15px 15px', maskPosition: 'bottom'}}></div>
                
                <div className="p-8 pt-10">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold uppercase mb-1">Le Bistrot Gourmand</h2>
                        <p className="text-xs">12 Rue de Rivoli, 75001 Paris</p>
                        <p className="text-xs">Tel: 01 23 45 67 89</p>
                        <p className="text-xs mt-2">SIRET: 123 456 789 00012</p>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-300 mb-4 pb-2">
                        <div className="flex justify-between">
                            <span>Date: {new Date().toLocaleDateString()}</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Ticket #: {order.id.replace('#', '')}</span>
                            <span className="uppercase font-bold">{order.type === 'takeaway' ? 'EMPORTER' : 'SUR PLACE'}</span>
                        </div>
                    </div>

                    <table className="w-full mb-4">
                        <tbody className="text-black">
                            {(order.items || []).map((item, i) => (
                                <tr key={i}>
                                    <td className="py-1 w-6">{item.quantity}</td>
                                    <td className="py-1">{item.name}</td>
                                    <td className="py-1 text-right">{(item.price * (item.quantity || 1)).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t-2 border-dashed border-gray-300 pt-2 mb-2">
                        <div className="flex justify-between text-lg">
                            <span>Sous-total</span>
                            <span>{(order.total || 0).toFixed(2)} €</span>
                        </div>
                        {order.appliedReward && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Remise ({order.appliedReward.description})</span>
                                <span>REMIS</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between text-2xl font-bold border-t-2 border-black pt-4 mb-6">
                        <span>TOTAL</span>
                        <span>{(order.total || 0).toFixed(2)} €</span>
                    </div>
                    
                    <div className="text-center text-xs">
                        <p>Moyen de paiement: {order.paymentMethod === 'card' ? 'CARTE BANCAIRE' : 'ESPÈCES'}</p>
                        <p>TVA (10%): {((order.total || 0) * 0.1).toFixed(2)} €</p>
                    </div>

                    {order.customer && (
                        <div className="mt-6 text-center border-2 border-black p-2 rounded">
                            <p className="font-bold">Programme Loycal</p>
                            <p className="uppercase">{order.customer.name}</p>
                            <p className="text-xs mt-1">Points gagnés sur cet achat !</p>
                        </div>
                    )}
                    
                    <div className="mt-8 text-center text-xs">
                        <p>Merci de votre visite !</p>
                        <p>À bientôt</p>
                    </div>
                </div>

                {/* Bottom Jagged Edge */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-100" style={{maskImage: 'radial-gradient(circle, transparent 5px, black 6px)', maskSize: '15px 15px', maskPosition: 'top'}}></div>
            </div>
        </div>
    );
};

// --- SETTINGS SCREEN ---
const POSSettingsScreen: React.FC<{ settings: POSSettings, onToggle: (key: keyof POSSettings) => void }> = ({ settings, onToggle }) => {
    return (
        <div className="flex-1 p-10 bg-gray-50 overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Paramètres POS</h1>
            
            <div className="max-w-2xl space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Général</h3>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer" onClick={() => onToggle('darkMode')}>
                        <span className="text-gray-700 font-medium">Mode Sombre</span>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-brand-secondary' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-transform ${settings.darkMode ? 'left-7' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 cursor-pointer" onClick={() => onToggle('sound')}>
                        <span className="text-gray-700 font-medium">Son des touches (Simulation)</span>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.sound ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-transform ${settings.sound ? 'left-7' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Impression & Tickets</h3>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer" onClick={() => onToggle('autoPrint')}>
                        <span className="text-gray-700 font-medium">Imprimer ticket automatiquement</span>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.autoPrint ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-transform ${settings.autoPrint ? 'left-7' : 'left-1'}`}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <span className="text-gray-700 font-medium">En-tête personnalisé</span>
                         <span className="text-gray-400 text-sm">Le Bistrot Gourmand &gt;</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Périphériques</h3>
                    <div className="flex items-center space-x-3 text-green-600 bg-green-50 p-3 rounded-lg mb-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold">Imprimante Ticket (EPSON TM-T20)</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <span className="h-2 w-2 bg-red-400 rounded-full"></span>
                        <span className="text-sm font-bold">Tiroir Caisse (Déconnecté)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN SYSTEM ORCHESTRATOR ---

const POSSystem: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<POSScreen>('home');
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [orders, setOrders] = useState<POSOrder[]>([]);
    
    // Lifted Settings State
    const [settings, setSettings] = useState<POSSettings>({
        darkMode: false,
        sound: true,
        autoPrint: true
    });

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const user = mockBackend.getCurrentUser();
                if (user?.restaurantId) {
                    const orders = await mockBackend.getPOSOrders(user.restaurantId);
                    setOrders(orders);
                }
            } catch (error) {
                console.error('Error loading POS orders:', error);
            }
        };
        loadOrders();
        const unsub = mockBackend.subscribe(loadOrders);
        return unsub;
    }, []);

    const toggleSetting = (key: keyof POSSettings) => {
        setSettings(prev => ({...prev, [key]: !prev[key]}));
    };

    const handleNewOrder = async () => {
        const user = mockBackend.getCurrentUser();
        const newOrder: POSOrder = {
            id: `#CMD-${Date.now().toString().slice(-4)}`,
            items: [],
            total: 0,
            status: 'draft',
            createdAt: new Date().toISOString(),
            type: 'dine_in',
            restaurantId: user?.restaurantId || 1
        };
        try {
            await mockBackend.savePOSOrder(newOrder);
            setCurrentOrderId(newOrder.id);
            setActiveScreen('order');
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    const handleEditOrder = (order: POSOrder) => {
        setCurrentOrderId(order.id);
        setActiveScreen('order');
    };

    const handleSaveDraft = async (order: POSOrder) => {
        try {
            await mockBackend.savePOSOrder(order);
            setCurrentOrderId(null);
            setActiveScreen('home');
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        try {
            await mockBackend.deletePOSOrder(id);
            setCurrentOrderId(null);
            setActiveScreen('home');
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const handleProceedToPayment = async (order: POSOrder) => {
        try {
            await mockBackend.savePOSOrder({ ...order, status: 'pending' });
            setActiveScreen('payment');
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

    const handlePaymentComplete = async (method: 'card'|'cash'|'other') => {
        if (currentOrderId) {
            try {
                await mockBackend.payOrder(currentOrderId, method);
                setActiveScreen('invoice');
            } catch (error) {
                console.error('Error processing payment:', error);
            }
        }
    };
    
    const handleOrderFinished = () => {
        setCurrentOrderId(null);
        setActiveScreen('home');
    }

    const currentOrder = orders.find(o => o.id === currentOrderId);

    return (
        <div className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${settings.darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
            <POSSidebar active={activeScreen} onChange={setActiveScreen} settings={settings} />
            
            <div className="flex-1 flex flex-col h-full relative">
                {activeScreen === 'home' && <POSHomeScreen onNewOrder={handleNewOrder} onEditOrder={handleEditOrder} orders={orders} settings={settings} />}
                
                {activeScreen === 'order' && currentOrder && (
                    <POSOrderScreen 
                        currentOrder={currentOrder}
                        onSaveDraft={handleSaveDraft}
                        onDeleteOrder={handleDeleteOrder}
                        onPayment={handleProceedToPayment}
                        settings={settings} 
                    />
                )}

                {activeScreen === 'payment' && currentOrder && (
                    <POSPaymentScreen 
                        order={currentOrder} 
                        onComplete={handlePaymentComplete}
                        onBack={() => setActiveScreen('order')}
                    />
                )}

                {activeScreen === 'invoice' && currentOrder && (
                    <POSInvoiceScreen 
                        order={currentOrder}
                        onFinished={handleOrderFinished}
                        settings={settings}
                    />
                )}

                {activeScreen === 'history' && (
                    <div className="flex-1 p-8 bg-gray-50">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Historique des Tickets</h1>
                         <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                             <table className="w-full text-left">
                                 <thead className="bg-gray-100 border-b border-gray-200">
                                     <tr>
                                         <th className="p-4 font-bold text-gray-600">ID</th>
                                         <th className="p-4 font-bold text-gray-600">Heure</th>
                                         <th className="p-4 font-bold text-gray-600">Type</th>
                                         <th className="p-4 font-bold text-gray-600">Client</th>
                                         <th className="p-4 font-bold text-gray-600">Total</th>
                                         <th className="p-4 font-bold text-gray-600">Statut</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {orders.map(o => (
                                         <tr key={o.id} className="hover:bg-gray-50">
                                             <td className="p-4 font-medium text-gray-900">{o.id}</td>
                                             <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleTimeString()}</td>
                                             <td className="p-4 text-gray-500 capitalize">{o.type.replace('_', ' ')}</td>
                                             <td className="p-4">
                                                 {o.customer ? (
                                                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-secondary/10 text-brand-secondary">
                                                         {o.customer.name}
                                                     </span>
                                                 ) : <span className="text-gray-400">-</span>}
                                             </td>
                                             <td className="p-4 font-bold text-gray-800">{(o.total || 0).toFixed(2)} €</td>
                                             <td className="p-4">
                                                 <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                     o.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                     o.status === 'draft' ? 'bg-gray-200 text-gray-700' :
                                                     'bg-yellow-100 text-yellow-800'
                                                 }`}>
                                                     {o.status === 'paid' ? 'Payé' : o.status === 'draft' ? 'Brouillon' : 'En cours'}
                                                 </span>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                )}

                {activeScreen === 'settings' && <POSSettingsScreen settings={settings} onToggle={toggleSetting} />}
            </div>
        </div>
    );
};

export default POSSystem;
