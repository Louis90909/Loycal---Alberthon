import React from 'react';
import { MOCK_CUSTOMER_SEGMENTS, MOCK_CUSTOMERS } from '../../shared/constants';
import type { Customer } from '../../shared/types';
import { StarIcon, DiamondIcon, SyncIcon, ZapOffIcon } from './icons/StatusIcons';

const statusMap: Record<Customer['status'], { icon: React.FC<any>, color: string, label: string }> = {
    Premium: { icon: DiamondIcon, color: 'text-amber-500', label: 'Premium' },
    Fidèle: { icon: StarIcon, color: 'text-sky-500', label: 'Fidèle' },
    Habitué: { icon: SyncIcon, color: 'text-emerald-500', label: 'Habitué' },
    Inactif: { icon: ZapOffIcon, color: 'text-rose-500', label: 'Inactif' },
    Nouveau: { icon: StarIcon, color: 'text-green-500', label: 'Nouveau' },
    Occasionnel: { icon: SyncIcon, color: 'text-blue-500', label: 'Occasionnel' },
    VIP: { icon: DiamondIcon, color: 'text-purple-500', label: 'VIP' },
};

const CustomerRow: React.FC<{ customer: Customer; onSelect: (id: number) => void }> = ({ customer, onSelect }) => {
    const StatusIcon = statusMap[customer.status].icon;
    const statusColor = statusMap[customer.status].color;

    return (
        <tr onClick={() => onSelect(customer.id)} className="hover:bg-gray-50 cursor-pointer animate-fade-in-up">
            <td className="p-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={customer.avatarUrl} alt={customer.name} />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </div>
                </div>
            </td>
            <td className="p-4 whitespace-nowrap">
                <div className={`flex items-center text-sm ${statusColor}`}>
                    <StatusIcon className="w-5 h-5 mr-1.5" />
                    {customer.status}
                </div>
            </td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{customer.loyaltyScore} / 100</td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{customer.totalRevenue.toFixed(2)} €</td>
            <td className="p-4 whitespace-nowrap text-sm text-gray-500">{customer.lastVisit}</td>
        </tr>
    );
};


const CustomerSegments: React.FC<{onSelectCustomer: (id: number) => void, showStats?: boolean}> = ({ onSelectCustomer, showStats = true }) => {
    return (
        <div className="space-y-8">
            {showStats && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Segments de Clientèle</h2>
                    <p className="mt-1 text-gray-600">
                        Aperçu des groupes de clients identifiés par Loycal AI.
                    </p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {MOCK_CUSTOMER_SEGMENTS.map((segment) => (
                            <div key={segment.name} className={`rounded-lg shadow p-6 flex flex-col ${segment.bgColor}`}>
                                <h3 className={`text-xl font-bold ${segment.color}`}>{segment.name}</h3>
                                <p className="mt-2 text-4xl font-extrabold text-gray-800">{segment.count}</p>
                                <p className="mt-2 text-sm text-gray-600 flex-grow">{segment.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-surface rounded-lg shadow-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800">Liste des Clients</h2>
                    <p className="mt-1 text-gray-600">Cliquez sur un client pour voir son profil détaillé.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Fidélité</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenu Total</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Visite</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {MOCK_CUSTOMERS.map(customer => (
                                <CustomerRow key={customer.id} customer={customer} onSelect={onSelectCustomer} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerSegments;