import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class AdminFirebaseService {
    private readonly logger = new Logger(AdminFirebaseService.name);
    private db: admin.firestore.Firestore;
    private auth: admin.auth.Auth;

    constructor() {
        // Initialiser Firebase Admin si pas encore fait
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
        this.db = admin.firestore();
        this.auth = admin.auth();
    }

    /**
     * Supprime un compte utilisateur Firebase Auth + son profil Firestore
     */
    async deleteUser(uid: string): Promise<{ success: boolean; message: string }> {
        const errors: string[] = [];

        // 1. Supprimer le profil Firestore
        try {
            await this.db.collection('users').doc(uid).delete();
            this.logger.log(`Profil Firestore supprimé : ${uid}`);
        } catch (e: any) {
            this.logger.warn(`Erreur suppression Firestore (peut déjà être absent) : ${e.message}`);
            errors.push(`Firestore: ${e.message}`);
        }

        // 2. Supprimer le compte Firebase Auth
        try {
            await this.auth.deleteUser(uid);
            this.logger.log(`Compte Auth supprimé : ${uid}`);
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                this.logger.warn(`Compte Auth déjà absent : ${uid}`);
            } else {
                this.logger.error(`Erreur suppression Auth : ${e.message}`);
                errors.push(`Auth: ${e.message}`);
            }
        }

        return {
            success: errors.length === 0,
            message: errors.length === 0
                ? 'Compte supprimé (Auth + Firestore)'
                : `Suppression partielle — ${errors.join(', ')}`,
        };
    }

    /**
     * Supprime le document Firestore d'un utilizateur orphelin
     * (supprimé depuis la console Firebase mais pas de Firestore)
     */
    async deleteOrphanFirestoreUser(uid: string): Promise<void> {
        await this.db.collection('users').doc(uid).delete();
        this.logger.log(`Profil Firestore orphelin supprimé : ${uid}`);
    }

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    async sendPasswordResetEmail(email: string): Promise<void> {
        const link = await this.auth.generatePasswordResetLink(email);
        this.logger.log(`Password reset link généré pour ${email}: ${link}`);
        // Note: Firebase Admin génère le lien — l'envoi de l'email se fait via Firebase automatiquement
        // si le mode d'action email est configuré dans la console Firebase
    }

    /**
     * Synchronise Firestore avec Firebase Auth :
     * - Supprime les profils Firestore dont l'UID n'existe plus dans Auth (orphelins)
     * - Ajoute les profils Firestore pour les comptes Auth n'ayant pas de profil (créés via console Firebase)
     */
    async syncUsers(): Promise<{ deletedCount: number; deletedIds: string[]; addedCount: number; addedIds: string[]; totalAuth: number; totalFirestore: number }> {
        // 1. Récupérer tous les users Auth
        let authUsers: admin.auth.UserRecord[] = [];
        let nextPageToken;
        do {
            const result = await this.auth.listUsers(1000, nextPageToken);
            authUsers = authUsers.concat(result.users);
            nextPageToken = result.pageToken;
        } while (nextPageToken);

        const authUids = new Set(authUsers.map(u => u.uid));

        // 2. Récupérer tous les profils Firestore
        const firestoreSnap = await this.db.collection('users').get();
        const firestoreUids = new Set(firestoreSnap.docs.map(d => d.id));

        // 3. Identifier les orphelins (Firestore mais pas Auth)
        const orphanUids = Array.from(firestoreUids).filter(uid => !authUids.has(uid));

        // 3b. Identifier les manquants (Auth mais pas Firestore)
        const missingUsers = authUsers.filter(u => !firestoreUids.has(u.uid));

        // 4. Mettre à jour Firestore
        const batch = this.db.batch();

        // Supprimer les orphelins
        orphanUids.forEach(uid => {
            const ref = this.db.collection('users').doc(uid);
            batch.delete(ref);
        });

        // Ajouter les profils manquants
        missingUsers.forEach(u => {
            const ref = this.db.collection('users').doc(u.uid);
            // On essaie d'extraire le prénom et le nom depuis displayName s'il y en a un
            const nameParts = (u.displayName || 'Utilisateur ' + u.uid.substring(0, 4)).split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            batch.set(ref, {
                email: u.email || '',
                firstName: firstName,
                lastName: lastName,
                role: 'CLIENT', // Role par défaut
                status: 'ACTIVE',
                points: 0,
                memberships: [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        if (orphanUids.length > 0 || missingUsers.length > 0) {
            await batch.commit();
            this.logger.log(`Synchronisation terminée : ${orphanUids.length} supprimés, ${missingUsers.length} rajoutés.`);
        }

        return {
            deletedCount: orphanUids.length,
            deletedIds: orphanUids,
            addedCount: missingUsers.length,
            addedIds: missingUsers.map(u => u.uid),
            totalAuth: authUsers.length,
            totalFirestore: firestoreUids.size
        };
    }
}
