// TODO: לאתחל Firebase Analytics — דורש @react-native-firebase/analytics
// import analytics from '@react-native-firebase/analytics';

/** אירוע: פתיחת עמוד תפילה */
export async function logPrayerView(slug: string, lang: string) {
  // TODO: await analytics().logEvent('prayer_view', { slug, lang });
  console.log('[analytics] prayer_view', { slug, lang });
}

/** אירוע: תרומה הצליחה */
export async function logDonationSuccess(amount: number, currency: string) {
  // TODO: await analytics().logPurchase({ value: amount / 100, currency });
  console.log('[analytics] donation_success', { amount, currency });
}

/** אירוע: לחיצה על Quick Button */
export async function logQuickButtonTap(slug: string) {
  // TODO: await analytics().logEvent('quick_button_tap', { slug });
  console.log('[analytics] quick_button_tap', { slug });
}
