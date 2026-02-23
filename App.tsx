
import React, { useState, useEffect } from 'react';
import RestaurateurApp from './src/restaurateur/RestaurateurApp';
import LoyerApp from './src/loyer/LoyerApp';
import AdminApp from './src/admin/AdminApp';
import AuthScreen from './src/auth/AuthScreen';
import { firestoreService } from './src/shared/services/firestoreService';
import { mockBackend } from './src/shared/mockBackend';
import { USE_FIREBASE } from './src/shared/services/apiConfig';
import { SpinnerIcon } from './src/restaurateur/components/icons/SpinnerIcon';
import type { User } from './src/shared/types';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (USE_FIREBASE) {
            // Avec Firebase : attendre que onAuthStateChanged soit résolu
            // firestoreService.subscribe notifie après chaque changement d'auth
            const unsub = firestoreService.subscribe(() => {
                const currentUser = firestoreService.getCurrentUser();
                setUser(currentUser);
                setIsLoading(false);
            });
            return unsub;
        } else {
            // Mode mock
            const currentUser = mockBackend.getCurrentUser();
            setUser(currentUser);
            setIsLoading(false);

            const unsub = mockBackend.subscribe(() => {
                const updatedUser = mockBackend.getCurrentUser();
                setUser(updatedUser);
            });
            return unsub;
        }
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <SpinnerIcon className="w-10 h-10 text-brand-primary" />
            </div>
        );
    }

    if (!user) {
        return <AuthScreen />;
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        return <AdminApp />;
    }

    if (user.role === 'RESTAURATEUR') {
        return <RestaurateurApp />;
    }

    return <LoyerApp />;
};

export default App;
