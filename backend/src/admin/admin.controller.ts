import { Controller, Delete, Param, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AdminFirebaseService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminFirebaseService) { }

    /**
     * DELETE /admin/users/:uid
     * Supprime un utilisateur Firebase Auth + Firestore
     */
    @Delete('users/:uid')
    async deleteUser(@Param('uid') uid: string) {
        try {
            const result = await this.adminService.deleteUser(uid);
            return result;
        } catch (error: any) {
            throw new HttpException(
                error.message || 'Erreur lors de la suppression',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * DELETE /admin/users/:uid/firestore-only
     * Supprime uniquement le document Firestore (ex: nettoyage après suppression console Firebase)
     */
    @Delete('users/:uid/firestore-only')
    async deleteFirestoreOnly(@Param('uid') uid: string) {
        try {
            await this.adminService.deleteOrphanFirestoreUser(uid);
            return { success: true, message: 'Profil Firestore supprimé' };
        } catch (error: any) {
            throw new HttpException(
                error.message || 'Erreur Firestore',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * POST /admin/sync-users
     * Synchronise Auth et Firestore (nettoyage des orphelins)
     */
    @Post('sync-users')
    async syncUsers() {
        try {
            return await this.adminService.syncUsers();
        } catch (error: any) {
            throw new HttpException(
                error.message || 'Erreur de synchronisation',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
