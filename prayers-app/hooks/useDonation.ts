/**
 * quick donate (כרטיס שמור):
 * POST /api/donations/quick (צריך auth token)
 */
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

      const succeeded = await openPaymentSheet(data.clientSecret);
      if (!succeeded) {
        setError('התשלום בוטל או נכשל');
        setProcessing(false);
        return;
      }

      await confirmDonation({
        paymentIntentId: data.paymentIntentId,
      });

      setSuccess(true);
      setProcessing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'אירעה שגיאה, נסה שוב';
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
