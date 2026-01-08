import React, { useState } from 'react';
import { mockBackend } from '../shared/mockBackend';
import { LogoIcon } from '../restaurateur/components/icons/LogoIcon';
import { Button, Input, Badge } from '../shared/design';

const AuthScreen: React.FC = () => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Demo credentials
    const DEMO_CREDENTIALS = [
        { email: 'alexandre@gmail.com', role: 'Client', icon: '👤', color: 'primary' as const },
        { email: 'resto@bistrot.com', role: 'Restaurateur', icon: '🍴', color: 'secondary' as const },
        { email: 'admin@loycal.com', role: 'Admin', icon: '⚙️', color: 'info' as const },
    ];

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await mockBackend.login(email);
        } catch (err: any) {
            setError(err.message || 'Erreur de connexion');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const [first, last] = name.split(' ');
            await mockBackend.registerClient(email, first || name, last || '');
        } catch (err: any) {
            setError(err.message || 'Erreur d\'inscription');
            setIsLoading(false);
        }
    };

    const fillDemo = (emailStr: string) => {
        setEmail(emailStr);
        setPassword('password');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo & Title */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl">
                        <LogoIcon className="w-12 h-12 text-white" />
                    </div>
                </div>
                
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {view === 'login' ? 'Bienvenue sur Loycal' : 'Créer un compte'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {view === 'login' ? 'Connectez-vous à votre espace' : 'Rejoignez la révolution fidélité'}
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl rounded-3xl border border-gray-200">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
                        <button
                            onClick={() => setView('login')}
                            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                                view === 'login' 
                                    ? 'bg-white text-gray-900 shadow-md' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => setView('register')}
                            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                                view === 'register' 
                                    ? 'bg-white text-gray-900 shadow-md' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Inscription
                        </button>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={view === 'login' ? handleLogin : handleRegister}>
                        {view === 'register' && (
                            <Input
                                label="Nom complet"
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Jean Dupont"
                                fullWidth
                                leftIcon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />
                        )}

                        <Input
                            label="Adresse email"
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="vous@exemple.com"
                            fullWidth
                            leftIcon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            fullWidth
                            leftIcon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={isLoading}
                        >
                            {view === 'login' ? 'Se connecter' : "S'inscrire"}
                        </Button>
                    </form>

                    {/* Quick Access Demo */}
                    {view === 'login' && (
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">Accès Rapide</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 space-y-3">
                                {DEMO_CREDENTIALS.map((cred) => (
                                    <button
                                        key={cred.email}
                                        onClick={() => fillDemo(cred.email)}
                                        className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                {cred.icon}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">{cred.role}</p>
                                                <p className="text-xs text-gray-500">{cred.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant={cred.color} size="sm">Démo</Badge>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    En vous connectant, vous acceptez nos{' '}
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Conditions d'utilisation</a>
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
