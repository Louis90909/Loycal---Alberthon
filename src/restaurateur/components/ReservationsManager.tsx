import React, { useState, useEffect } from 'react';
import { getBackendService } from '../../shared/services/apiConfig';

interface ReservationItem {
    id: string;
    type: 'table' | 'flash';
    customerName: string;
    customerEmail: string;
    date: string;
    time: string;
    guests?: number;
    itemName?: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
}

const ReservationsManager: React.FC = () => {
    const [reservations, setReservations] = useState<ReservationItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'table' | 'flash'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'completed'>('all');

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        let isMounted = true;

        const loadReservations = async () => {
            try {
                const backend = await getBackendService();
                const user = backend.getCurrentUser();
                if (!user || !user.restaurantId || !isMounted) return;

                const allReservations = await (backend as any).getRestaurantReservations?.(user.restaurantId) || await (backend as any).getReservations(user.restaurantId);

                if (!isMounted) return;

                // Transform to ReservationItem format
                const transformedReservations: ReservationItem[] = await Promise.all(allReservations.map(async (res: any) => {
                    let customer = res.user;
                    if (!customer && (backend as any).getUserById) {
                        try { customer = await (backend as any).getUserById(res.userId); } catch (e) { }
                    }

                    return {
                        id: res.id,
                        type: res.flashPromoId ? 'flash' : 'table',
                        customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Client inconnu',
                        customerEmail: customer?.email || '',
                        date: res.date,
                        time: res.time,
                        guests: res.guests,
                        status: res.status,
                        createdAt: res.createdAt,
                        itemName: res.flashPromo?.itemName || 'Vente Flash'
                    };
                }));

                setReservations(transformedReservations);

                if (backend.subscribe && !unsubscribe) {
                    unsubscribe = backend.subscribe(loadReservations);
                }
            } catch (error) {
                console.error("Erreur de chargement des réservations", error);
            }
        };

        loadReservations();
        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleStatusChange = (id: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
        setReservations(prev =>
            prev.map(res => res.id === id ? { ...res, status: newStatus } : res)
        );
    };

    const filteredReservations = reservations.filter(res => {
        if (filter !== 'all' && res.type !== filter) return false;
        if (statusFilter !== 'all' && res.status !== statusFilter) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmée';
            case 'cancelled': return 'Annulée';
            case 'completed': return 'Terminée';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Réservations</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez vos réservations de tables et offres flash
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Toutes
                            </button>
                            <button
                                onClick={() => setFilter('table')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'table'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Tables
                            </button>
                            <button
                                onClick={() => setFilter('flash')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'flash'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Offres Flash
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Tous
                            </button>
                            <button
                                onClick={() => setStatusFilter('confirmed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'confirmed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Confirmées
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'completed'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Terminées
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservations List */}
            <div className="space-y-3">
                {filteredReservations.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">Aucune réservation trouvée</p>
                        <p className="text-sm text-gray-400 mt-1">Les réservations apparaîtront ici</p>
                    </div>
                ) : (
                    filteredReservations.map(reservation => (
                        <div key={reservation.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${reservation.type === 'flash'
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {reservation.type === 'flash' ? '⚡ Offre Flash' : '🍽️ Table'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                                            {getStatusLabel(reservation.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Client</p>
                                            <p className="font-semibold text-gray-900">{reservation.customerName}</p>
                                            <p className="text-xs text-gray-400">{reservation.customerEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Date & Heure</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}
                                            </p>
                                        </div>
                                        {reservation.type === 'table' && reservation.guests && (
                                            <div>
                                                <p className="text-sm text-gray-500">Nombre de personnes</p>
                                                <p className="font-semibold text-gray-900">{reservation.guests} personne{reservation.guests > 1 ? 's' : ''}</p>
                                            </div>
                                        )}
                                        {reservation.type === 'flash' && reservation.itemName && (
                                            <div>
                                                <p className="text-sm text-gray-500">Plat réservé</p>
                                                <p className="font-semibold text-gray-900">{reservation.itemName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {reservation.status === 'confirmed' && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleStatusChange(reservation.id, 'completed')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                        >
                                            Terminée
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReservationsManager;
