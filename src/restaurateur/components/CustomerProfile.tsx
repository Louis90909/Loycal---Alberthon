import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import type { Customer } from '../../shared/types';
import { StarIcon, DiamondIcon, SyncIcon, ZapOffIcon } from './icons/StatusIcons';

const statusMap: Record<Customer['status'], { icon: React.FC<any>, color: string, label: string, bgColor: string }> = {
    Premium: { icon: DiamondIcon, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Premium' },
    Fidèle: { icon: StarIcon, color: 'text-sky-600', bgColor: 'bg-sky-100', label: 'Fidèle' },
    Habitué: { icon: SyncIcon, color: 'text-emerald-600', bgColor: 'bg-emerald-100', label: 'Habitué' },
    Inactif: { icon: ZapOffIcon, color: 'text-rose-600', bgColor: 'bg-rose-100', label: 'Inactif' },
    Nouveau: { icon: StarIcon, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Nouveau' },
    Occasionnel: { icon: SyncIcon, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Occasionnel' },
    VIP: { icon: DiamondIcon, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'VIP' },
};

const MiniChart: React.FC<{data: any[], dataKey: string, color: string}> = ({data, dataKey, color}) => {
    return (
        <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <Tooltip
                    contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px' }}
                    formatter={(value: number) => [`${value} ${dataKey === 'visits' ? 'visites' : '€'}`, null]}
                    labelFormatter={() => ''}
                />
                <XAxis dataKey="month" hide />
                <Area type="monotone" dataKey={dataKey} stroke={color} fill={`${color}33`} strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

const CustomerProfile: React.FC<{ customer: Customer; onBack: () => void }> = ({ customer, onBack }) => {
    const StatusIcon = statusMap[customer.status].icon;
    const statusInfo = statusMap[customer.status];

    return (
        <div className="max-w-6xl mx-auto animate-fade-in-up">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour à la liste
            </button>

            <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="p-6 md:flex md:items-center md:justify-between bg-gray-50 border-b">
                    <div className="flex items-center">
                        <img className="h-20 w-20 rounded-full" src={customer.avatarUrl} alt={customer.name} />
                        <div className="ml-5">
                            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                            <span className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1.5" />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-center">
                        <div className="text-gray-500 text-sm">Score de Fidélité</div>
                        <div className="text-4xl font-bold text-brand-primary">{customer.loyaltyScore}</div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <p className="text-sm text-gray-500">Dernière visite</p>
                            <p className="mt-1 text-lg font-semibold text-gray-800">{customer.lastVisit}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Panier Moyen</p>
                            <p className="mt-1 text-lg font-semibold text-gray-800">{customer.averageTicket.toFixed(2)} €</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Revenu Total</p>
                            <p className="mt-1 text-lg font-semibold text-gray-800">{customer.totalRevenue.toFixed(2)} €</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">Visites / mois</p>
                            <p className="mt-1 text-lg font-semibold text-gray-800">{customer.visitsPerMonth}</p>
                        </div>
                    </div>

                    {/* Charts & Info */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* AI Insights */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">💡 Insights IA</h3>
                                <div className="space-y-2">
                                    {customer.insights.map((insight, index) => (
                                        <div key={index} className="p-3 bg-brand-light rounded-lg text-sm text-brand-dark flex items-start">
                                            <span className="mr-2">💬</span> {insight}
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-800 mb-2">🍽️ Plats favoris</h3>
                                <div className="flex flex-wrap gap-2">
                                    {customer.favoriteDishes.map(dish => (
                                        <span key={dish} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{dish}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                             <div>
                                <h3 className="font-semibold text-gray-800 mb-2">📈 Historique des visites</h3>
                                <MiniChart data={customer.visitHistory} dataKey="visits" color="#0ea5e9" />
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-800 mb-2">💰 Historique des dépenses</h3>
                                <MiniChart data={customer.spendingHistory} dataKey="spent" color="#10b981" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;