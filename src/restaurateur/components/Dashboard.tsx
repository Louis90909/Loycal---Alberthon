import React, { useState, useEffect } from 'react';
import { MOCK_REMI_RECOMMENDATIONS } from '../../shared/constants';
import { RemiIcon } from './icons/RemiIcon';
import type { RestaurateurView } from '../../shared/types';
import { KPICard, Card, CardHeader, CardContent, EmptyState, Skeleton, SkeletonGroup } from '../../shared/design';
import { getBackendService } from '../../shared/services/apiConfig';

interface DashboardProps {
  onNavigate: (view: RestaurateurView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const opportunity = MOCK_REMI_RECOMMENDATIONS.length > 0 ? MOCK_REMI_RECOMMENDATIONS[0] : null;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const backend = await getBackendService();
        const user = backend.getCurrentUser();
        const data = await backend.getAnalytics(user?.restaurantId || 1);
        setAnalytics(data);
      } catch (error) {
        console.error('Erreur chargement analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} padding="md">
              <SkeletonGroup>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={36} />
                <Skeleton variant="text" width="80%" />
              </SkeletonGroup>
            </Card>
          ))}
        </div>
        {/* Hero Skeleton */}
        <Card padding="lg">
          <SkeletonGroup>
            <Skeleton variant="rectangular" width="100%" height={120} />
          </SkeletonGroup>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Bienvenue sur votre Dashboard</h2>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité fidélité</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
          >
            Voir le détail
          </button>
        </div>
      </div>

      {/* 1. KPI Cards (Nouveaux composants) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Taux de Fidélisation"
          value={`${analytics?.loyaltyRate || 32}%`}
          delta={{ value: 2.1, isPositive: true }}
          subtitle="vs le mois dernier"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <KPICard
          title="Panier Moyen Fidèle"
          value={`${(analytics?.averageTicket || 0).toFixed(2)} €`}
          delta={{ value: 18, isPositive: true }}
          subtitle={`+${(analytics?.averageTicket || 0) > 30 ? 6 : 2} € (non-membres)`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Visites (Semaine)"
          value={analytics?.totalVisits || 42}
          delta={{ value: 5, isPositive: true }}
          subtitle="Cumul membres Loycal"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <KPICard
          title="Chiffre d'Affaires Fidélité"
          value={`${(analytics?.totalRevenue || 0).toFixed(0)} €`}
          delta={{ value: 10, isPositive: true }}
          subtitle="Généré par les membres"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          }
        />
      </div>

      {/* 2. REMI EXPERT OPPORTUNITY (Hero Section Amélioré) */}
      {opportunity && (
        <Card padding="none" className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 border-0 shadow-2xl overflow-hidden relative">
          {/* Décorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32"></div>

          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar Rémi */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border-2 border-white/20 shadow-2xl">
                  <RemiIcon className="w-full h-full text-white" />
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold uppercase rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Opportunité de la semaine
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Impact: {opportunity.impact}
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">{opportunity.title}</h2>
                <p className="text-lg text-indigo-100 leading-relaxed max-w-3xl">{opportunity.description}</p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => onNavigate('campaigns')}
                  className="w-full lg:w-auto px-6 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-2xl hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Lancer une campagne</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 3. QUICK ACTIONS (Cards Modernisées) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable padding="lg" onClick={() => onNavigate('loyalty-program')} className="group cursor-pointer">
          <div className="flex flex-col items-start">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">Gérer le Programme</h3>
            <p className="text-sm text-gray-500">Configuration des points, tampons et missions de fidélité</p>
          </div>
        </Card>

        <Card hoverable padding="lg" onClick={() => onNavigate('campaigns')} className="group cursor-pointer">
          <div className="flex flex-col items-start">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.5M11 14.118V7.84a1.76 1.76 0 013.417-.592l2.147 6.15" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">Lancer une Promo</h3>
            <p className="text-sm text-gray-500">Créer des campagnes SMS, push ou offres flash ciblées</p>
          </div>
        </Card>

        <Card hoverable padding="lg" onClick={() => onNavigate('remi-expert')} className="group cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex flex-col items-start">
            <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
              <RemiIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">Parler à Rémi</h3>
            <p className="text-sm text-gray-600">Conseils stratégiques personnalisés par l'IA</p>
          </div>
        </Card>
      </div>

      {/* 4. REMI INSIGHTS LIST (Améliorée) */}
      <Card padding="none">
        <CardHeader
          title="Dernières analyses de Rémi"
          subtitle="Insights et recommandations basées sur vos données"
          icon={<RemiIcon className="w-6 h-6 text-orange-500" />}
          action={
            <button
              onClick={() => onNavigate('remi-expert')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Tout voir
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          }
        />
        <CardContent className="divide-y divide-gray-100">
          {MOCK_REMI_RECOMMENDATIONS.length > 0 ? (
            MOCK_REMI_RECOMMENDATIONS.map(rec => (
              <div key={rec.id} className="p-5 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => onNavigate(rec.type === 'opportunity' ? 'campaigns' : 'loyalty-program')}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${rec.type === 'alert' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                    {rec.type === 'alert' ? '⚠️' : '💡'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{rec.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{rec.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Impact: {rec.impact}
                      </span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-all">
                    {rec.actionLabel}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Aucune analyse disponible"
              description="Rémi analyse vos données en temps réel. Les premières recommandations apparaîtront ici très bientôt."
              action={{
                label: "Parler à Rémi",
                onClick: () => onNavigate('remi-expert')
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
