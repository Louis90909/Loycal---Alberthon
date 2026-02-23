import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ReservationsModule } from './reservations/reservations.module';
import { POSModule } from './pos/pos.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AIModule } from './ai/ai.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    LoyaltyModule,
    CampaignsModule,
    ReservationsModule,
    POSModule,
    AnalyticsModule,
    AIModule,
    AdminModule,
  ],
})
export class AppModule { }








