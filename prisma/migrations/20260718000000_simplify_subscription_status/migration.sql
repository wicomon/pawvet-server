-- Simplifica el modelo de billing: el acceso ya solo depende de
-- Subscription.currentPeriodEnd (ver auth.service.ts / assertActiveSubscription),
-- no de `status`. `status` pasa a distinguir únicamente TRIAL vs FULL.
-- Se elimina Subscription.currentPeriodStart (no gobierna nada y se
-- desincroniza con pagos apilados); SubscriptionPayment.periodStart/periodEnd
-- conservan el historial de qué cubrió cada pago.

ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'FULL');

ALTER TABLE "Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus"
  USING (
    CASE
      WHEN "status"::text = 'TRIALING' THEN 'TRIAL'
      ELSE 'FULL'
    END
  )::"SubscriptionStatus";
ALTER TABLE "Subscription" ALTER COLUMN "status" SET DEFAULT 'TRIAL';

DROP TYPE "SubscriptionStatus_old";

ALTER TABLE "Subscription" DROP COLUMN "currentPeriodStart";
