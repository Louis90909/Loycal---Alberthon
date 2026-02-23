import React, { useState, useEffect } from 'react';
import { MOCK_CUSTOMER_SEGMENTS } from '../../shared/constants';
import { getBackendService } from '../../shared/services/apiConfig';
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

const CustomerRow: React.FC<{ customer: Customer; onSelect: (id: string | number) => void }> = ({ customer, onSelect }) => {
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


const CustomerSegments: React.FC<{ onSelectCustomer: (id: string | number) => void, showStats?: boolean }> = ({ onSelectCustomer, showStats = true }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setIsLoading(true);
            try {
                const backend = await getBackendService();
                const user = backend.getCurrentUser();
                if (user?.restaurantId && backend.getRestaurantCustomers) {
                    const data = await backend.getRestaurantCustomers(user.restaurantId);
                    if (isMounted) setCustomers(data);
                }
            } catch (error) {
                console.error("Error loading customers", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-medium">Chargement des clients...</div>;
    }

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
                            {customers.length > 0 ? customers.map(customer => (
                                <CustomerRow key={customer.id} customer={customer} onSelect={onSelectCustomer} />
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Aucun client trouvé pour cet établissement.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerSegments;