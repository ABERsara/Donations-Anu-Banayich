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

  const handleFailure = (err?: unknown) => {
    const message = err instanceof Error ? err.message : t('common.error');
    setError(message);
    setProcessing(false);
  };

  const finalizeSuccess = async (paymentIntentId: string) => {
    try {
      await confirmDonation({
        payment_intent_id: paymentIntentId,
      });
      setSuccess(true);
      setProcessing(false);
    } catch (err) {
      handleFailure(err);
    }
  };

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
        handleFailure();
        return;
      }

      await finalizeSuccess(data.payment_intent_id);
    } catch (err) {
      handleFailure(err);
    }
  };

  const initiateWebPayment = async (prayerId: string): Promise<string | null> => {
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

      return data.client_secret;
    } catch (err) {
      handleFailure(err);
      return null;
    }
  };

  const handleWebPaymentResult = async (
    result: 'success' | 'canceled' | 'failed',
    paymentIntentId?: string
  ) => {
    if (result === 'canceled') {
      setProcessing(false);
      return;
    }

    if (result === 'failed' || !paymentIntentId) {
      handleFailure();
      return;
    }

    await finalizeSuccess(paymentIntentId);
  };

  const quickDonate = async (_prayerId: string, _quickButtonSlug: string) => {};

  return {
    initiateDonation,
    initiateWebPayment,
    handleWebPaymentResult,
    quickDonate,
    isProcessing,
    isSuccess,
    error,
  };
}
