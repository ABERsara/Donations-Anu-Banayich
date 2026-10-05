# register-debug-fingerprint.ps1
# -------------------------------------------------------
# הרצה חד-פעמית לכל מפתחת/מחשב חדש.
# מחלץ את ה-SHA-1 של debug keystore המקומי,
# מעתיק אותו ל-clipboard ופותח את Firebase Console
# בדיוק בדף שבו מוסיפים fingerprint לאפליקציית Android.
#
# הרצה (מתוך תיקיית prayers-app):
#   powershell -ExecutionPolicy Bypass -File scripts\register-debug-fingerprint.ps1
# -------------------------------------------------------

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Google Sign-In — רישום debug fingerprint ===" -ForegroundColor Cyan
Write-Host ""

# ── 1. מציאת debug.keystore ──────────────────────────────
$candidates = @(
    (Join-Path $PSScriptRoot "..\android\app\debug.keystore"),
    (Join-Path $env:USERPROFILE ".android\debug.keystore")
)

$keystore = $candidates | ForEach-Object { (Resolve-Path $_ -ErrorAction SilentlyContinue)?.Path } | Where-Object { $_ } | Select-Object -First 1

if (-not $keystore) {
    Write-Host "שגיאה: debug.keystore לא נמצא." -ForegroundColor Red
    Write-Host "הריצי קודם: npx expo run:android (יוצר את ה-keystore אוטומטית)" -ForegroundColor Yellow
    exit 1
}

Write-Host "נמצא keystore: $keystore" -ForegroundColor Green

# ── 2. חילוץ SHA-1 ───────────────────────────────────────
try {
    $keytoolOut = & keytool -list -v `
        -keystore $keystore `
        -alias androiddebugkey `
        -storepass android `
        -keypass android 2>&1

    $sha1Line = $keytoolOut | Select-String "^\s*SHA1:"
    if (-not $sha1Line) { throw "שורת SHA1 לא נמצאה בפלט keytool" }
    $sha1 = ($sha1Line.ToString().Trim() -replace "^\s*SHA1:\s*", "")
} catch {
    Write-Host "שגיאה בחילוץ SHA-1: $_" -ForegroundColor Red
    Write-Host "ודאי ש-keytool מותקן (חלק מ-JDK/JRE)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "ה-SHA-1 שלך:" -ForegroundColor White
Write-Host "  $sha1" -ForegroundColor Yellow
Write-Host ""

# ── 3. העתקה ל-clipboard ─────────────────────────────────
$sha1 | Set-Clipboard
Write-Host "הועתק ל-clipboard!" -ForegroundColor Green

# ── 4. הוראות ─────────────────────────────────────────────
Write-Host ""
Write-Host "השלבים הבאים (ידניים — חד-פעמי):" -ForegroundColor Cyan
Write-Host "  1. Firebase Console נפתח עכשיו בדפדפן" -ForegroundColor White
Write-Host "  2. Project Settings (גלגל שיניים) ← General ← גללי למטה" -ForegroundColor White
Write-Host "  3. תחת com.abd.prayersapp ← לחצי Add fingerprint" -ForegroundColor White
Write-Host "  4. הדביקי את ה-SHA-1 (כבר ב-clipboard) ← Save" -ForegroundColor White
Write-Host "  5. לחצי על google-services.json ← Download latest config file" -ForegroundColor White
Write-Host "  6. העבירי את הקובץ ל: prayers-app\google-services.json" -ForegroundColor White
Write-Host ""
Write-Host "אחרי זה Google Sign-In יעבוד על המחשב שלך ללא rebuild." -ForegroundColor Green
Write-Host ""

# ── 5. פתיחת Firebase Console ────────────────────────────
Start-Process "https://console.firebase.google.com/project/prayers-46c96/settings/general/android:com.abd.prayersapp"
