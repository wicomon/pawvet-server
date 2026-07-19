import { registerEnumType } from '@nestjs/graphql';
import {
  PlanInterval,
  SubscriptionStatus,
  PaymentStatus,
} from '@prisma/client';

registerEnumType(PlanInterval, { name: 'PlanInterval' });
registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

export { PlanInterval, SubscriptionStatus, PaymentStatus };
