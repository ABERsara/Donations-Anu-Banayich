/**
 * quick donate (כרטיס שמור):
 * POST /api/donations/quick (צריך auth token)
 */
import { useTranslation } from 'react-i18next';

import { useDonationStore, selectFinalAmount } from '@/store/donationStore';
import { openPaymentSheet } from '@/services/stripe';
import { initiateDonation as apiInitiateDonation, confirmDonation } from '@/services/api';
import { PRAYER_NAME_MIN_AMOUNT } from '@/constants/donations';

export function useDonation() {
  const {
    prayerName,
    currency,
    donorName,
    isProcessing,
    isSuccess,
    error,
    setProcessing,
    setSuccess,
    setError,
  } = useDonationStore();
  const amount = useDonationStore(selectFinalAmount);
  const { t } = useTranslation();

  const initiateDonation = async (prayerId: string) => {
    setProcessing(true);
    setError(null);
    try {
      const data = await apiInitiateDonation({
        prayer_id: prayerId,
        amount,
        currency,
        donor_name: donorName,
        prayer_name: amount >= PRAYER_NAME_MIN_AMOUNT ? prayerName : undefined,
      });

      const result = await openPaymentSheet(data.client_secret);
      if (result === 'canceled') {
        setProcessing(false);
        return;
      }

      if (result === 'failed') {
        setError(t('common.error'));
        setProcessing(false);
        return;
      }

      await confirmDonation({
        payment_intent_id: data.payment_intent_id,
      });

      setSuccess(true);
      setProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      setProcessing(false);
    }
  };

  const quickDonate = async (_prayerId: string, _quickButtonSlug: string) => {};
  return {
    initiateDonation,
    quickDonate,
    isProcessing,
    isSuccess,
    error,
  };
}
