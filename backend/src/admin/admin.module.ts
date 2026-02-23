import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminFirebaseService } from './admin.service';

@Module({
    controllers: [AdminController],
    providers: [AdminFirebaseService],
    exports: [AdminFirebaseService],
})
export class AdminModule { }
