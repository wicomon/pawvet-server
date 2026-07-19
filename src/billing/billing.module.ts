import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PlanResolver } from './plan/plan.resolver';
import { PlanService } from './plan/plan.service';
import { SubscriptionResolver } from './subscription/subscription.resolver';
import { SubscriptionService } from './subscription/subscription.service';

@Module({
  imports: [AuthModule],
  providers: [
    PlanResolver,
    PlanService,
    SubscriptionResolver,
    SubscriptionService,
  ],
})
export class BillingModule {}
