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
export function useDonation() {
  // TODO: לממש
  return {
    initiateDonation: async (_prayerId: string) => {},
    quickDonate: async (_prayerId: string, _quickButtonSlug: string) => {},
    isProcessing: false,
    isSuccess: false,
    error: null as string | null,
  };
}
