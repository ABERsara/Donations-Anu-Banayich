/**
 * quick donate (כרטיס שמור):
 * POST /api/donations/quick (צריך auth token)
 */
import { useTranslation } from 'react-i18next';

import { useDonationStore, selectFinalAmount } from '@/store/donationStore';
import { useAuthStore } from '@/store/authStore';
import { openPaymentSheet } from '@/services/stripe';
import {
  initiateDonation as apiInitiateDonation,
  confirmDonation,
  quickDonate as apiQuickDonate,
} from '@/services/api';
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
  const token = useAuthStore((s) => s.firebaseToken);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const handleFailure = (err?: unknown) => {
    const message = err instanceof Error ? err.message : t('common.error');
    setError(message);
    setProcessing(false);
  };

  const finalizeSuccess = async (paymentIntentId: string, saveCard: boolean = false) => {
    try {
      await confirmDonation(
        {
          payment_intent_id: paymentIntentId,
          save_card: saveCard,
        },
        token ?? undefined
      );
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
      const data = await apiInitiateDonation(
        {
          prayer_id: prayerId,
          amount,
          currency,
          donor_name: donorName,
          prayer_name: amount >= PRAYER_NAME_MIN_AMOUNT ? prayerName : undefined,
        },
        token ?? undefined
      );

      const result = await openPaymentSheet(data.client_secret);
      if (result === 'canceled') {
        setProcessing(false);
        return;
      }

      if (result === 'failed') {
        handleFailure();
        return;
      }
      const NATIVE_SAVE_CARD = false;
      // TODO(native-save-card): כרגע save_card=false קבוע ב-native.
      // ל-native Stripe Payment Sheet יש תמיכה מובנית ב"שמור כרטיס", אבל זה
      // דורש אתחול עם customerId + customerEphemeralKeySecret (Stripe Customer).
      // openPaymentSheet הנוכחי מקבל רק client_secret — צריך תוספת בבקאנד:
      // (1) יצירת Stripe Customer למשתמש אם אין, (2) endpoint שמנפיק ephemeral key,
      // (3) initiate response צריך להחזיר גם אותם. ראו PR description.

      await finalizeSuccess(data.payment_intent_id, NATIVE_SAVE_CARD);
    } catch (err) {
      handleFailure(err);
    }
  };

  const initiateWebPayment = async (prayerId: string): Promise<string | null> => {
    setProcessing(true);
    setError(null);
    try {
      const data = await apiInitiateDonation(
        {
          prayer_id: prayerId,
          amount,
          currency,
          donor_name: donorName,
          prayer_name: amount >= PRAYER_NAME_MIN_AMOUNT ? prayerName : undefined,
        },
        token ?? undefined
      );

      setProcessing(false);
      return data.client_secret;
    } catch (err) {
      handleFailure(err);
      return null;
    }
  };

  const handleWebPaymentResult = async (
    result: 'success' | 'canceled' | 'failed',
    paymentIntentId?: string,
    saveCard: boolean = false
  ) => {
    if (result === 'canceled') {
      setProcessing(false);
      return;
    }

    if (result === 'failed' || !paymentIntentId) {
      handleFailure();
      return;
    }

    await finalizeSuccess(paymentIntentId, saveCard);
  };

  const quickDonate = async (prayerId: string) => {
    if (!token) {
      handleFailure(new Error(t('common.error')));
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const quickDonorName = user?.displayName || t('donation.default_donor_name');

      await apiQuickDonate(
        {
          prayer_id: prayerId,
          amount,
          currency,
          donor_name: quickDonorName,
        },
        token
      );

      setSuccess(true);
      setProcessing(false);
    } catch (err) {
      handleFailure(err);
    }
  };
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
