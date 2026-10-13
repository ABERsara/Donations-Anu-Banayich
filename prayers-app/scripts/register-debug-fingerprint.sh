#!/bin/bash
# register-debug-fingerprint.sh
# -------------------------------------------------------
# הרצה חד-פעמית לכל מפתחת/מחשב חדש (Mac / Linux).
# מחלץ את ה-SHA-1 של debug keystore המקומי,
# מעתיק אותו ל-clipboard ופותח את Firebase Console.
#
# הרצה (מתוך תיקיית prayers-app):
#   chmod +x scripts/register-debug-fingerprint.sh
#   ./scripts/register-debug-fingerprint.sh
# -------------------------------------------------------

set -e

echo ""
echo "=== Google Sign-In — רישום debug fingerprint ==="
echo ""

# ── 1. מציאת debug.keystore ──────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

KEYSTORE=""
if [ -f "$PROJECT_DIR/android/app/debug.keystore" ]; then
    KEYSTORE="$PROJECT_DIR/android/app/debug.keystore"
elif [ -f "$HOME/.android/debug.keystore" ]; then
    KEYSTORE="$HOME/.android/debug.keystore"
fi

if [ -z "$KEYSTORE" ]; then
    echo "שגיאה: debug.keystore לא נמצא."
    echo "הריצי קודם: npx expo run:android (יוצר את ה-keystore אוטומטית)"
    exit 1
fi

echo "נמצא keystore: $KEYSTORE"

# ── 2. חילוץ SHA-1 ───────────────────────────────────────
SHA1=$(keytool -list -v \
    -keystore "$KEYSTORE" \
    -alias androiddebugkey \
    -storepass android \
    -keypass android 2>/dev/null | grep "SHA1:" | awk '{print $2}')

if [ -z "$SHA1" ]; then
    echo "שגיאה: לא הצלחתי לחלץ SHA-1."
    echo "ודאי ש-keytool מותקן (חלק מ-JDK): java -version"
    exit 1
fi

echo ""
echo "ה-SHA-1 שלך:"
echo "  $SHA1"
echo ""

# ── 3. העתקה ל-clipboard ─────────────────────────────────
if command -v pbcopy &>/dev/null; then
    echo "$SHA1" | pbcopy
    echo "הועתק ל-clipboard (pbcopy)"
elif command -v xclip &>/dev/null; then
    echo "$SHA1" | xclip -selection clipboard
    echo "הועתק ל-clipboard (xclip)"
elif command -v xsel &>/dev/null; then
    echo "$SHA1" | xsel --clipboard --input
    echo "הועתק ל-clipboard (xsel)"
else
    echo "העתיקי ידנית את הערך למעלה"
fi

# ── 4. הוראות ─────────────────────────────────────────────
echo ""
echo "השלבים הבאים (ידניים — חד-פעמי):"
echo "  1. Firebase Console נפתח עכשיו בדפדפן"
echo "  2. Project Settings (גלגל שיניים) → General → גללי למטה"
echo "  3. תחת com.abd.prayersapp → לחצי Add fingerprint"
echo "  4. הדביקי את ה-SHA-1 (כבר ב-clipboard) → Save"
echo "  5. לחצי על google-services.json → Download latest config file"
echo "  6. העבירי את הקובץ ל: prayers-app/google-services.json"
echo ""
echo "אחרי זה Google Sign-In יעבוד על המחשב שלך ללא rebuild."
echo ""

# ── 5. פתיחת Firebase Console ────────────────────────────
URL="https://console.firebase.google.com/project/prayers-46c96/settings/general/android:com.abd.prayersapp"
if command -v open &>/dev/null; then
    open "$URL"
elif command -v xdg-open &>/dev/null; then
    xdg-open "$URL"
else
    echo "פתחי ידנית: $URL"
fi
