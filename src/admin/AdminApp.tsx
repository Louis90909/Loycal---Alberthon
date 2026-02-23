
import React, { useState, useEffect } from 'react';
import { firestoreService } from '../shared/services/firestoreService';
import { migrateAllData } from '../shared/services/firebaseMigration';
import { SpinnerIcon } from '../restaurateur/components/icons/SpinnerIcon';
import type { Restaurant, User } from '../shared/types';
import { LogoIcon } from '../restaurateur/components/icons/LogoIcon';
import { USE_FIREBASE } from '../shared/services/apiConfig';

type AdminView = 'dashboard' | 'restaurants' | 'users' | 'create-resto' | 'create-client';

// ─── Modal d'édition Restaurant ─────────────────────────────────────────────
const EditRestoModal: React.FC<{ resto: Restaurant; onClose: () => void; onSave: (data: any) => Promise<void> }> = ({ resto, onClose, onSave }) => {
    const [form, setForm] = React.useState({
        name: resto.name || '',
        cuisine: (resto as any).cuisine || '',
        offer: resto.offer || '',
        budget: resto.budget || 2,
        ambiance: (resto as any).ambiance || 'Cozy',
        address: resto.address || '',
    });
    const [saving, setSaving] = React.useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); onClose(); }
        catch (err: any) { alert(err.message); }
        finally { setSaving(false); }
    };
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="bg-brand-primary p-6 rounded-t-2xl text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Modifier le Restaurant</h2>
                        <p className="text-sm opacity-70 mt-0.5">{resto.name}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Nom</label>
                            <input type="text" required className="w-full border rounded-lg p-2.5 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Cuisine</label>
                            <select className="w-full border rounded-lg p-2.5 text-sm bg-white" value={form.cuisine} onChange={e => setForm({ ...form, cuisine: e.target.value })}>
                                {['Française', 'Italienne', 'Japonaise', 'Américaine', 'Végétarien', 'Indienne', 'Mexicaine', 'Chinoise'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Offre Bienvenue</label>
                        <input type="text" className="w-full border rounded-lg p-2.5 text-sm" value={form.offer} onChange={e => setForm({ ...form, offer: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Adresse</label>
                        <input type="text" className="w-full border rounded-lg p-2.5 text-sm" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="10 Rue de la Paix, Paris" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Ambiance</label>
                            <select className="w-full border rounded-lg p-2.5 text-sm bg-white" value={form.ambiance} onChange={e => setForm({ ...form, ambiance: e.target.value })}>
                                {['Cozy', 'Festif', 'Romantique', 'Business', 'Chill'].map(a => <option key={a}>{a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Budget</label>
                            <select className="w-full border rounded-lg p-2.5 text-sm bg-white" value={form.budget} onChange={e => setForm({ ...form, budget: parseInt(e.target.value) })}>
                                <option value="1">€ Économique</option>
                                <option value="2">€€ Standard</option>
                                <option value="3">€€€ Premium</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark flex items-center gap-2">
                            {saving ? '...' : '✅ Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Modal d'édition Utilisateur ─────────────────────────────────────────────
const EditUserModal: React.FC<{ user: User; onClose: () => void; onSave: (data: any) => Promise<void>; onResetPassword: () => Promise<void> }> = ({ user, onClose, onSave, onResetPassword }) => {
    const [form, setForm] = React.useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'CLIENT',
    });
    const [saving, setSaving] = React.useState(false);
    const [emailSent, setEmailSent] = React.useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); onClose(); }
        catch (err: any) { alert(err.message); }
        finally { setSaving(false); }
    };
    const handleReset = async () => {
        try { await onResetPassword(); setEmailSent(true); }
        catch (err: any) { alert(err.message); }
    };
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="bg-indigo-600 p-6 rounded-t-2xl text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Modifier l'Utilisateur</h2>
                        <p className="text-sm opacity-70 mt-0.5">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Prénom</label>
                            <input type="text" required className="w-full border rounded-lg p-2.5 text-sm" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Nom</label>
                            <input type="text" required className="w-full border rounded-lg p-2.5 text-sm" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Rôle</label>
                        <select className="w-full border rounded-lg p-2.5 text-sm bg-white" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="CLIENT">CLIENT</option>
                            <option value="RESTAURATEUR">RESTAURATEUR</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                    {/* Reset password */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-orange-800">🔑 Réinitialiser le mot de passe</p>
                            <p className="text-xs text-orange-600 mt-0.5">Envoyer un lien à {user.email}</p>
                        </div>
                        <button type="button" onClick={handleReset} disabled={emailSent} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${emailSent ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                            {emailSent ? '✅ Envoyé !' : 'Envoyer'}
                        </button>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Annuler</button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700">
                            {saving ? '...' : '✅ Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminApp: React.FC = () => {
    const [view, setView] = useState<AdminView>('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [editResto, setEditResto] = useState<Restaurant | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number | string; name: string } | null>(null);
    const [deleteUserConfirm, setDeleteUserConfirm] = useState<{ id: string; name: string } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncUsers = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (!confirm('Voulez-vous synchroniser la liste avec Firebase Auth ?\nCela supprimera les profils "orphelins" et ajoutera les comptes manquants.')) return;
        setIsSyncing(true);
        try {
            const result = await firestoreService.syncUsers();
            alert(`✅ Synchronisation terminée.\n\n➕ Ajoutés (manquants) : ${result.addedCount}\n🗑️ Supprimés (orphelins) : ${result.deletedCount}\n👥 Total Auth : ${result.totalAuth}\n📄 Total Firestore : ${result.totalFirestore}`);
        } catch (error: any) {
            console.error('[AdminApp] Erreur de synchronisation attrapée:', error);
            alert('❌ Erreur de synchronisation : \n\n' + error.message + '\n\n➡️ Regardez la console (F12) pour plus de détails.');
        } finally {
            setIsSyncing(false);
        }
    };


    const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [migrationLog, setMigrationLog] = useState<string>('');

    // Subscribe to backend changes
    useEffect(() => {
        const loadData = async () => {
            try {
                const usersData = await firestoreService.getUsersAdmin();
                const restaurantsData = await firestoreService.getAllRestaurantsAdmin();
                setUsers(usersData);
                setRestaurants(restaurantsData);
            } catch (error) {
                console.error('Error loading admin data:', error);
            }
        };
        loadData();
        const unsub = firestoreService.subscribe(loadData);
        return unsub;
    }, []);

    const handleMigrateData = async () => {
        setMigrationStatus('running');
        setMigrationLog('Migration en cours...');
        // Capture console.log
        const originalLog = console.log;
        const logs: string[] = [];
        console.log = (...args) => {
            logs.push(args.join(' '));
            originalLog(...args);
        };
        try {
            await migrateAllData();
            console.log = originalLog;
            setMigrationLog(logs.join('\n'));
            setMigrationStatus('done');
        } catch (e: any) {
            console.log = originalLog;
            setMigrationLog(logs.join('\n') + '\n❌ ' + e.message);
            setMigrationStatus('error');
        }
    };

    const restoUsers = users.filter(u => u.role === 'RESTAURATEUR');
    const clientUsers = users.filter(u => u.role === 'CLIENT');
    const activeRestos = restaurants.filter(r => r.status === 'ACTIVE');

    const handleLogout = () => {
        firestoreService.logout();
        window.location.reload();
    };

    const handleDeleteResto = (id: number | string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const confirmDeleteResto = async () => {
        if (!deleteConfirm) return;
        try {
            await firestoreService.deleteRestaurant(deleteConfirm.id);
            setDeleteConfirm(null);
        } catch (error: any) {
            console.error('Error deleting restaurant:', error);
            alert(error.message || 'Erreur lors de la suppression');
            setDeleteConfirm(null);
        }
    };

    const handleToggleRestoStatus = async (id: number | string) => {
        try {
            await firestoreService.toggleRestaurantStatus(id);
        } catch (error) {
            console.error('Error toggling restaurant status:', error);
        }
    }

    const handleToggleUserStatus = async (id: string) => {
        try {
            await firestoreService.toggleUserStatus(id);
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    }

    // Sub-component for Create Client Form
    const CreateClientForm = () => {
        const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: 'Loycal2024!' });
        const [sendResetEmail, setSendResetEmail] = useState(true);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [successMsg, setSuccessMsg] = useState('');

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
                await firestoreService.createClient({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password || 'Loycal2024!',
                    sendResetEmail,
                });
                setSuccessMsg(`✅ Compte client créé pour ${formData.firstName} ${formData.lastName}${sendResetEmail ? ' — email envoyé !' : ''}`);
                setTimeout(() => setView('users'), 2500);
            } catch (error: any) {
                alert(error.message || 'Erreur lors de la création');
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Nouveau Client</h2>
                        <p className="text-indigo-200 text-sm opacity-80">Créer un compte utilisateur final</p>
                    </div>
                    <LogoIcon className="w-10 h-10 text-white opacity-20" />
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-3 border" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="Marie" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-3 border" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Dupont" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input required type="email" className="w-full border-gray-300 rounded-lg shadow-sm p-3 border" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="marie@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe temporaire</label>
                        <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-3 border font-mono" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength={8} />
                        <p className="text-xs text-gray-400 mt-1">Min. 8 caractères.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <input type="checkbox" id="sendResetEmailClient" checked={sendResetEmail} onChange={e => setSendResetEmail(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                        <label htmlFor="sendResetEmailClient" className="text-sm text-blue-800 cursor-pointer">
                            <span className="font-bold">Envoyer un email de bienvenue</span> — avec lien pour définir son mot de passe
                        </label>
                    </div>
                    {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm font-medium">{successMsg}</div>}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setView('users')} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center shadow-lg">
                            {isSubmitting && <SpinnerIcon />} {isSubmitting ? 'Création...' : 'Créer le compte'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // Sub-component for Create Resto Form
    const CreateRestoForm = () => {
        const [formData, setFormData] = useState({
            firstName: '', lastName: '', email: '',
            password: 'Loycal2024!',
            restoName: '', category: 'Française', address: '',
            offer: 'Café offert', budget: 2, ambiance: 'Cozy'
        });
        const [sendResetEmail, setSendResetEmail] = useState(true);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [successMsg, setSuccessMsg] = useState('');

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
                await firestoreService.createRestaurateur({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password || 'Loycal2024!',
                    restaurantName: formData.restoName,
                    category: formData.category,
                    address: formData.address,
                    offer: formData.offer,
                    budget: Number(formData.budget) as 1 | 2 | 3,
                    ambiance: formData.ambiance,
                    sendResetEmail,
                });
                setSuccessMsg(`✅ Compte créé pour ${formData.firstName} ${formData.lastName}${sendResetEmail ? ' — email de réinitialisation envoyé !' : ''}`);
                setTimeout(() => setView('restaurants'), 2500);
            } catch (error: any) {
                console.error('Error creating restaurateur:', error);
                alert(error.message || 'Erreur lors de la création');
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="bg-brand-primary p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Nouveau Partenaire</h2>
                        <p className="text-brand-light text-sm opacity-80">Ce restaurant apparaîtra immédiatement dans l'application.</p>
                    </div>
                    <LogoIcon className="w-10 h-10 text-white opacity-20" />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* SECTION 1: USER */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <span className="bg-gray-100 p-1.5 rounded-md mr-2 text-xl">👤</span>
                            Le Restaurateur (Accès Dashboard)
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="Jean" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Dupont" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email de connexion</label>
                            <input required type="email" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jean@restaurant.com" />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe temporaire</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border font-mono" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Loycal2024!" minLength={8} />
                            <p className="text-xs text-gray-400 mt-1">Min. 8 caractères. Le restaurateur pourra le changer après connexion.</p>
                        </div>
                        <div className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <input
                                type="checkbox"
                                id="sendResetEmail"
                                checked={sendResetEmail}
                                onChange={e => setSendResetEmail(e.target.checked)}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <label htmlFor="sendResetEmail" className="text-sm text-blue-800 cursor-pointer">
                                <span className="font-bold">Envoyer un email de réinitialisation</span> — le restaurateur recevra un lien pour définir son propre mot de passe
                            </label>
                        </div>
                        {successMsg && (
                            <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm font-medium">{successMsg}</div>
                        )}
                    </div>

                    {/* SECTION 2: RESTAURANT */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                            <span className="bg-gray-100 p-1.5 rounded-md mr-2 text-xl">🍽️</span>
                            L'Établissement (Visible App Client)
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom du Restaurant</label>
                                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border" value={formData.restoName} onChange={e => setFormData({ ...formData, restoName: e.target.value })} placeholder="Chez Jean" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Type de Cuisine</label>
                                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border bg-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option>Française</option>
                                    <option>Italienne</option>
                                    <option>Japonaise</option>
                                    <option>Américaine</option>
                                    <option>Végétarien</option>
                                    <option>Indienne</option>
                                    <option>Mexicaine</option>
                                    <option>Chinoise</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ambiance</label>
                                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border bg-white" value={formData.ambiance} onChange={e => setFormData({ ...formData, ambiance: e.target.value })}>
                                    <option>Cozy</option>
                                    <option>Festif</option>
                                    <option>Romantique</option>
                                    <option>Business</option>
                                    <option>Chill</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Budget (€)</label>
                                <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border bg-white" value={formData.budget} onChange={e => setFormData({ ...formData, budget: parseInt(e.target.value) as any })}>
                                    <option value="1">€ (Économique)</option>
                                    <option value="2">€€ (Standard)</option>
                                    <option value="3">€€€ (Premium)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Offre Bienvenue</label>
                                <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border" value={formData.offer} onChange={e => setFormData({ ...formData, offer: e.target.value })} placeholder="-20% à la carte" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Adresse (Pour GPS)</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-primary focus:border-brand-primary p-3 border" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="10 Rue de la Paix, Paris" />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => setView('restaurants')} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">Annuler</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-dark flex items-center shadow-lg transition-transform active:scale-95">
                            {isSubmitting && <SpinnerIcon />} {isSubmitting ? 'Création...' : 'Confirmer & Créer'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex">
            {/* SIDEBAR */}
            <div className="w-72 bg-gray-900 text-white flex flex-col shadow-2xl z-10 sticky top-0 h-screen">
                <div className="h-24 flex items-center px-8 bg-black/20 font-bold text-2xl space-x-3">
                    <LogoIcon className="w-8 h-8 text-brand-secondary" />
                    <span className="tracking-tight">Loycal <span className="text-gray-500 font-normal">Admin</span></span>
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2">
                    <button onClick={() => setView('dashboard')} className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 flex items-center ${view === 'dashboard' ? 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span className="mr-3">📊</span> Dashboard
                    </button>
                    <button onClick={() => setView('restaurants')} className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 flex items-center ${view === 'restaurants' || view === 'create-resto' ? 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span className="mr-3">🍽️</span> Restaurants
                    </button>
                    <button onClick={() => setView('users')} className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 flex items-center ${view === 'users' ? 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span className="mr-3">👥</span> Utilisateurs
                    </button>
                </nav>
                <div className="p-6 border-t border-gray-800">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-md">SA</div>
                        <div>
                            <p className="text-sm font-bold text-white">Super Admin</p>
                            <p className="text-xs text-gray-500">admin@loycal.com</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">Déconnexion</button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-auto bg-gray-50">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200 h-20 flex items-center px-8 justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 capitalize">
                        {view === 'create-resto' ? 'Création Partenaire' : view === 'dashboard' ? 'Vue d\'ensemble' : view}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                            Système opérationnel
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto">
                    {view === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Bouton de migration Firebase */}
                            {USE_FIREBASE && (
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-orange-800 flex items-center"><span className="mr-2">🔥</span> Migration Firebase</h3>
                                            <p className="text-sm text-orange-600 mt-1">Importer les 6 restaurants et 3 comptes démo dans Firestore</p>
                                            {migrationLog && (
                                                <pre className="mt-3 text-xs bg-white/80 rounded-lg p-3 max-h-32 overflow-auto text-gray-700 border border-orange-100 whitespace-pre-wrap">{migrationLog}</pre>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleMigrateData}
                                            disabled={migrationStatus === 'running' || migrationStatus === 'done'}
                                            className={`ml-4 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow transition-all ${migrationStatus === 'done' ? 'bg-green-100 text-green-700 cursor-default' :
                                                migrationStatus === 'error' ? 'bg-red-100 text-red-700' :
                                                    migrationStatus === 'running' ? 'bg-orange-100 text-orange-500 cursor-wait' :
                                                        'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105'
                                                }`}
                                        >
                                            {migrationStatus === 'running' && <SpinnerIcon />}
                                            {migrationStatus === 'done' ? '✅ Migré !' :
                                                migrationStatus === 'error' ? '❌ Réessayer' :
                                                    migrationStatus === 'running' ? 'Migration...' :
                                                        '🚀 Migrer les données'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('restaurants')}>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Restaurants</p>
                                        <p className="text-4xl font-extrabold text-gray-900 mt-2">{activeRestos.length}</p>
                                        <p className="text-xs text-gray-500 mt-1">sur {restaurants.length} enregistrés</p>
                                    </div>
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🍽️</div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all cursor-pointer" onClick={() => setView('users')}>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Utilisateurs</p>
                                        <p className="text-4xl font-extrabold text-gray-900 mt-2">{clientUsers.length}</p>
                                        <p className="text-xs text-green-600 mt-1 font-bold">+12% ce mois</p>
                                    </div>
                                    <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📱</div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all">
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Revenus Est.</p>
                                        <p className="text-4xl font-extrabold text-gray-900 mt-2">{activeRestos.length * 49} €</p>
                                        <p className="text-xs text-gray-500 mt-1">Mensuel récurrent</p>
                                    </div>
                                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">💰</div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Derniers Restaurants Ajoutés</h3>
                                <div className="space-y-4">
                                    {restaurants.slice(0, 5).map(r => (
                                        <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg bg-cover bg-center shadow-inner" style={{ backgroundImage: `url('https://picsum.photos/seed/${r.id}/100')` }}></div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{r.name}</p>
                                                    <p className="text-xs text-gray-500">{r.cuisine} • Ajouté récemment</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'restaurants' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Liste des Partenaires</h2>
                                    <p className="text-sm text-gray-500">{restaurants.length} établissements enregistrés</p>
                                </div>
                                <button onClick={() => setView('create-resto')} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-dark transition-all transform hover:scale-105 flex items-center">
                                    <span className="mr-2 text-xl">+</span> Ajouter un Restaurant
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Établissement</th>
                                            <th className="px-6 py-4">Catégorie</th>
                                            <th className="px-6 py-4">Propriétaire</th>
                                            <th className="px-6 py-4">Visibilité App</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {restaurants.map(r => {
                                            const owner = users.find(u => u.restaurantId === r.id);
                                            return (
                                                <tr key={r.id} className={`hover:bg-blue-50/30 transition-colors ${r.status === 'INACTIVE' ? 'bg-gray-50 opacity-70' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gray-200 rounded-lg bg-cover bg-center shadow-inner mr-4" style={{ backgroundImage: `url('https://picsum.photos/seed/${r.id}/100')` }}></div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{r.name}</p>
                                                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{r.offer}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{r.cuisine}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {owner ? `${owner.firstName} ${owner.lastName}` : <span className="text-gray-400 italic">Non assigné</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {/* Toggle Switch */}
                                                        <div className="flex items-center cursor-pointer group" onClick={() => handleToggleRestoStatus(r.id)}>
                                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${r.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${r.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
                                                            </div>
                                                            <span className={`ml-3 text-xs font-bold group-hover:underline ${r.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {r.status === 'ACTIVE' ? 'EN LIGNE' : 'HORS LIGNE'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => setEditResto(r)}
                                                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Modifier"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteResto(r.id, r.name)}
                                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Supprimer définitivement"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'create-resto' && <CreateRestoForm />}

                    {view === 'create-client' && <CreateClientForm />}


                    {view === 'users' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Gestion des Utilisateurs</h2>
                                    <p className="text-sm text-gray-500">{users.length} comptes enregistrés</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSyncUsers}
                                        disabled={isSyncing}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-soft transition-all flex items-center ${isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:text-brand-primary border border-gray-200 hover:border-brand-primary'}`}
                                        title="Nettoyer les utilisateurs orphelins"
                                    >
                                        {isSyncing ? (
                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        )}
                                        {isSyncing ? 'Sync...' : 'Synchroniser'}
                                    </button>
                                    <button
                                        onClick={() => setView('create-client')}
                                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-105 flex items-center"
                                    >
                                        <span className="mr-2 text-xl">+</span> Ajouter un Client
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Utilisateur</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Rôle</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-bold text-xs mr-3 shadow-sm">
                                                            {u.firstName[0]}{u.lastName[0]}
                                                        </div>
                                                        <span className="font-bold text-gray-900">{u.firstName} {u.lastName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                        u.role === 'RESTAURATEUR' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>{u.role}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center w-fit ${u.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditUser(u)}
                                                            className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleUserStatus(u.id as string)}
                                                            className={`text-xs font-bold transition-colors border px-3 py-1 rounded ${u.status === 'ACTIVE'
                                                                ? 'border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200'
                                                                : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                                                                }`}
                                                        >
                                                            {u.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteUserConfirm({ id: u.id as string, name: `${u.firstName} ${u.lastName}` })}
                                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Supprimer définitivement"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal édition restaurant */}
            {editResto && (
                <EditRestoModal
                    resto={editResto}
                    onClose={() => setEditResto(null)}
                    onSave={async (data) => { await firestoreService.updateRestaurant(String(editResto.id), data); }}
                />
            )}

            {/* Modal édition utilisateur */}
            {editUser && (
                <EditUserModal
                    user={editUser}
                    onClose={() => setEditUser(null)}
                    onSave={async (data) => { await firestoreService.updateUser(editUser.id as string, data); }}
                    onResetPassword={async () => { await firestoreService.sendResetEmailToUser(editUser.email); }}
                />
            )}

            {/* Modal de confirmation suppression restaurant */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-fade-in-up">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Supprimer le restaurant</h3>
                                <p className="text-sm text-gray-500">Cette action est irréversible</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">Voulez-vous vraiment supprimer <span className="font-bold text-red-600">"{deleteConfirm.name}"</span> ? Il disparaîtra définitivement de l'application client.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">Annuler</button>
                            <button onClick={confirmDeleteResto} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation suppression utilisateur */}
            {deleteUserConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-fade-in-up">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Supprimer le compte</h3>
                                <p className="text-sm text-gray-500">Suppression Firebase Auth + Firestore</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">Voulez-vous vraiment supprimer le compte de <span className="font-bold text-red-600">{deleteUserConfirm.name}</span> ? Il sera déconnecté immédiatement et ne pourra plus se reconnecter.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteUserConfirm(null)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">Annuler</button>
                            <button onClick={async () => { try { await firestoreService.deleteUser(deleteUserConfirm.id); setDeleteUserConfirm(null); } catch (e: any) { alert(e.message); setDeleteUserConfirm(null); } }} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApp;
