/**
 * TODO: לממש — flow תרומה מלא:
 * 1. POST /api/donations/initiate → מקבל clientSecret
 * 2. פתיחת Stripe Payment Sheet
 * 3. POST /api/donations/confirm → שמירה ב-DB
 * 4. עדכון donationStore לSuccess
 *
 * quick donate (כרטיס שמור):
 * POST /api/donations/quick (צריך auth token)
 */
import { useDonationStore, selectFinalAmount } from '@/store/donationStore';
import { openPaymentSheet } from '@/services/stripe';
import { initiateDonation as apiInitiateDonation, confirmDonation } from '@/services/api';
import { PRAYER_NAME_MIN_AMOUNT } from '@/constants/donations';
interface InitiateResponse {
  client_secret: string;
  payment_intent_id: string;
}

export function useDonation() {
  const {
    donorName,
    prayerName,
    isProcessing,
    isSuccess,
    error,
    setProcessing,
    setSuccess,
    setError,
  } = useDonationStore();
  const amount = useDonationStore(selectFinalAmount);

  const initiateDonation = async (prayerId: string) => {
    setProcessing(true);
    setError(null);
    try {
      const data = (await apiInitiateDonation({
        prayer_id: prayerId,
        amount,
        donor_name: donorName,
        prayer_name: amount >= PRAYER_NAME_MIN_AMOUNT ? prayerName : undefined,
      })) as InitiateResponse;

      const succeeded = await openPaymentSheet(data.client_secret);
      if (!succeeded) {
        setError('התשלום בוטל או נכשל');
        setProcessing(false);
        return;
      }

      await confirmDonation({
        payment_intent_id: data.payment_intent_id,
      });

      setSuccess(true);
      setProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'אירעה שגיאה, נסה שוב';
      setError(message);
      setProcessing(false);
    }
  };

  const quickDonate = async (_prayerId: string, _quickButtonSlug: string) => {
    // מחוץ לטווח המשימה הנוכחית
  };
  return {
    initiateDonation,
    quickDonate,
    isProcessing,
    isSuccess,
    error,
  };
}
