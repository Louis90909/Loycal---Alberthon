import React, { useState, useEffect } from 'react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { RemiIcon } from './icons/RemiIcon'; 
import { Card, CardHeader, CardContent, KPICard, Skeleton, SkeletonGroup, Tabs } from '../../shared/design';
import { mockBackend } from '../../shared/mockBackend';
import DetailedReport from './DetailedReport';
import { 
    MOCK_REVENUE_FORECAST, 
    MOCK_RETENTION_DATA, 
    MOCK_REWARDS_DATA, 
    MOCK_DEMAND_FORECAST 
} from '../../shared/constants';

const SEGMENT_COLORS = ['#f59e0b', '#0ea5e9', '#6366f1', '#f43f5e'];
const DATA_SEGMENTS = [
    { name: 'Premium', value: 15 },   
    { name: 'Habitués', value: 45 }, 
    { name: 'Occasionnels', value: 30 }, 
    { name: 'À risque', value: 10 },  
];

const FREQUENCY_DATA = [
    { name: '1 visite', value: 400, color: '#94a3b8' },
    { name: '2-3 visites', value: 300, color: '#6366f1' },
    { name: '4+ visites', value: 150, color: '#ff6f00' },
];

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }> = 
({ title, subtitle, children, action }) => (
    <Card padding="lg" className="h-[420px] flex flex-col">
        <CardHeader 
            title={title} 
            subtitle={subtitle}
            action={action}
        />
        <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                {children as any}
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

const LoyaltyAnalytics: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'7j' | '30j' | '90j'>('30j');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [reportModal, setReportModal] = useState<{ open: boolean, type: 'standard' | 'custom' }>({ open: false, type: 'standard' });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const user = mockBackend.getCurrentUser();
                if (!user?.restaurantId) {
                    setIsLoading(false);
                    return;
                }
                
                const data = await mockBackend.getAnalytics(user.restaurantId);
                setStats(data);
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [timeRange]);

    if (isLoading) return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton variant="rectangular" width={300} height={40} />
            <Skeleton variant="rectangular" width={200} height={40} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} padding="md">
                <SkeletonGroup>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="80%" />
                </SkeletonGroup>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} padding="lg">
                <Skeleton variant="rectangular" width="100%" height={300} />
              </Card>
            ))}
          </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header avec période */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Analyses & Rapports</h2>
                    <p className="text-gray-500 mt-1">Données de performance et prévisions intelligentes</p>
                </div>
                <div className="flex bg-white rounded-xl p-1.5 border border-gray-200 shadow-sm">
                    {(['7j', '30j', '90j'] as const).map(r => (
                        <button 
                            key={r} 
                            onClick={() => setTimeRange(r)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                timeRange === r 
                                    ? 'bg-indigo-600 text-white shadow-md' 
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="CA Fidélité" 
                    value={`${stats?.totalRevenue.toFixed(0) || 0} €`}
                    delta={{ value: 12, isPositive: true }}
                    subtitle="Généré par les membres"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <KPICard 
                    title="Taux de retour" 
                    value="68%"
                    delta={{ value: 4, isPositive: true }}
                    subtitle="Membres revenus > 2 fois"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    }
                />
                <KPICard 
                    title="Panier Moyen" 
                    value={`${stats?.averageTicket.toFixed(2) || 0} €`}
                    delta={{ value: 18, isPositive: true }}
                    subtitle="vs 32€ non-membres"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                />
                <KPICard 
                    title="Nouveaux Membres" 
                    value="24"
                    delta={{ value: 5, isPositive: true }}
                    subtitle="Inscriptions cette semaine"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    }
                />
            </div>

            {/* Insight Rémi */}
            <Card padding="none" className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 border-0 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="relative z-10 p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/30">
                                <RemiIcon className="w-full h-full text-white" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase rounded-full">
                                    Conseil Expert
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Analyse de la semaine</h3>
                            <p className="text-indigo-100 leading-relaxed">
                                "Votre taux de rétention a augmenté de 3 points ce mois-ci grâce à la campagne 'Jeudi Soir'. Je recommande de dupliquer cette stratégie pour le samedi midi."
                            </p>
                        </div>
                        <button 
                            onClick={() => setReportModal({ open: true, type: 'standard' })}
                            className="flex-shrink-0 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow-2xl hover:bg-indigo-50 transition-all hover:scale-105"
                        >
                            Rapport détaillé
                        </button>
                    </div>
                </div>
            </Card>

            {/* Tabs Navigation */}
            <Tabs
                tabs={[
                    { id: 'overview', label: 'Vue d\'ensemble', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                    { id: 'revenue', label: 'Chiffre d\'affaires' },
                    { id: 'retention', label: 'Rétention' },
                    { id: 'segments', label: 'Segments' },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Forecast */}
                <ChartCard 
                    title="Prévision Chiffre d'Affaires" 
                    subtitle="Comparaison entre le CA prévu par l'IA et le CA réel"
                >
                    <AreaChart data={MOCK_REVENUE_FORECAST}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip 
                            contentStyle={{
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }} 
                        />
                        <Area type="monotone" dataKey="CA Prévu" stroke="#ff6f00" fill="#ff6f0022" strokeWidth={3} />
                        <Area type="monotone" dataKey="CA Réel" stroke="#1a237e" fill="#1a237e22" strokeWidth={3} />
                        <Legend verticalAlign="top" align="right" height={36}/>
                    </AreaChart>
                </ChartCard>

                {/* Retention Rate */}
                <ChartCard 
                    title="Taux de Rétention Mensuel" 
                    subtitle="Part des clients fidèles revenant chaque mois"
                >
                    <AreaChart data={MOCK_RETENTION_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="rate" stroke="#10b981" fill="#10b98122" strokeWidth={3} />
                    </AreaChart>
                </ChartCard>

                {/* Points Balance */}
                <ChartCard 
                    title="Équilibre Points & Récompenses" 
                    subtitle="Points distribués vs Points consommés"
                >
                    <BarChart data={MOCK_REWARDS_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Legend />
                        <Bar dataKey="gagne" name="Gagnés" fill="#1a237e" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="utilise" name="Utilisés" fill="#ff6f00" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ChartCard>

                {/* Demand Forecast */}
                <ChartCard 
                    title="Affluence par Service" 
                    subtitle="Répartition horaire Déjeuner vs Dîner"
                >
                    <BarChart data={MOCK_DEMAND_FORECAST}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="Déjeuner" fill="#0ea5e9" stackId="a" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="Dîner" fill="#6366f1" stackId="a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ChartCard>

                {/* Client Segments */}
                <ChartCard 
                    title="Structure de la Base Client" 
                    subtitle="Répartition par statut de fidélité"
                >
                    <PieChart>
                        <Pie
                            data={DATA_SEGMENTS}
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {DATA_SEGMENTS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ChartCard>

                {/* Visit Frequency */}
                <ChartCard 
                    title="Fréquence de Visite" 
                    subtitle="Nombre de visites par client sur 30 jours"
                >
                    <PieChart>
                        <Pie
                            data={FREQUENCY_DATA}
                            innerRadius={0}
                            outerRadius={110}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {FREQUENCY_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ChartCard>
            </div>

            {/* CTA Rapport personnalisé */}
            <Card padding="lg" className="text-center bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Besoin d'une analyse spécifique ?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Rémi peut croiser vos données de caisse avec les comportements de fidélité pour vous donner des insights uniques et actionnables.
                </p>
                <button 
                    onClick={() => setReportModal({ open: true, type: 'custom' })}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                >
                    Demander un rapport personnalisé
                </button>
            </Card>

            {/* Modal de Rapport */}
            {reportModal.open && (
                <DetailedReport 
                    type={reportModal.type} 
                    onClose={() => setReportModal({ ...reportModal, open: false })} 
                />
            )}
        </div>
    );
};

export default LoyaltyAnalytics;
