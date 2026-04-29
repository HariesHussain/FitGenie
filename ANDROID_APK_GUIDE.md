# Android APK Build & Download Guide

## What's Fixed (Latest Update)

✅ **Download App Button** — No longer downloads fake/placeholder APK that fails to install.

**What changed:**
- **On Local Networks (localhost, 192.168.x.x)**: When you click "Download App" on Android, it now shows build instructions instead of downloading a placeholder file
- **On Production**: Downloads a real signed APK built via Capacitor
- **Issue Solved**: No more "installation failed" errors from fake APK files

**Development Workflow:**
When testing on local network (e.g., http://192.168.1.5:3001), clicking "Download App" on Android will show:
```
📱 APK Download on Development Network

To test the Android app locally:

1. Build the APK:
   npx cap sync android
   npm run build
   npx cap build android

2. Find the APK at:
   android/app/release/app-release.apk

3. Transfer to your Android device:
   adb install -r android/app/release/app-release.apk

Or use Android Studio to build and deploy directly.
```

**Status:** ✅ Ready for development and production

---

## Overview

FitGenie now has improved "Download App" functionality. Here's how to set it up for production.

---

## For Local/Development Testing (Network: 192.168.x.x)

**Current Status:** ✅ Works as designed

When you click "Download App" on local network:
- **Desktop/Chrome**: Shows PWA installation instructions
- **iOS (Safari)**: Shows "Add to Home Screen" instructions
- **Android**: Shows helpful error messages with next steps (APK not needed locally)

---

## For Production Deployment (Vercel/Firebase)

### Step 1: Build the Android APK

```bash
# 1. Sync Capacitor with your Android project
npx cap sync android

# 2. Build the web assets (Vite)
npm run build

# 3. Build the APK in Android Studio or via CLI
npx cap build android --keystorePath <path-to-keystore> --keystorePassword <password> --keystoreAlias <alias>

# Or open in Android Studio and generate signed APK
npx cap open android
```

### Step 2: Sign the APK

If using Android Studio:
1. Build → Generate Signed Bundle/APK
2. Select "APK"
3. Create or select your keystore (save it securely!)
4. Choose release build
5. Finish (outputs to `/android/app/release/app-release.apk`)

### Step 3: Upload to Hosting

**Option A: Vercel Blob Storage (Recommended)**
```bash
# Upload APK to Vercel
vercel blob upload --access-public ./android/app/release/app-release.apk
# Copy the returned URL
```

**Option B: Firebase Storage**
```bash
firebase storage:upload ./android/app/release/app-release.apk gs://your-project-bucket/fitgenie-release.apk
```

**Option C: Public /public folder**
```bash
# Copy to public folder
cp ./android/app/release/app-release.apk ./public/fitgenie-latest.apk

# Then deploy
firebase deploy
```

### Step 4: Set Environment Variables

On Vercel/Firebase deployment settings, add:

```env
# URL where APK is hosted (from Step 3)
VITE_ANDROID_APK_URL=https://your-storage-url/fitgenie-release.apk

# Optional: Add to Google Play Store
VITE_MOBILE_APP_URL=https://play.google.com/store/apps/details?id=com.fitgenie
```

### Step 5: Test on Real Device

1. Visit your production URL on Android phone
2. Click "Download App"
3. Browser should download the APK
4. Install and verify it works

---

## What Users Will Experience

### Android Devices

**On First Visit:**
- Chrome shows install banner (PWA)
- Or click "Download App" to download APK
- After installation, app runs standalone

**On Subsequent Visits:**
- Option to update app (if new version available)

### iOS Devices

**On First Visit:**
- Click "Download App"
- See instructions: "Open in Safari → Share → Add to Home Screen"
- FitGenie icon appears on home screen
- Works like installed app

### Desktop

**On First Visit:**
- Click "Download App"
- Chrome/Edge shows install button in address bar
- Or see PWA installation instructions

---

## Signing Your APK Securely

⚠️ **Important:** Never commit your keystore to version control!

```bash
# Create keystore (do this once, keep it safe)
keytool -genkey -v -keystore fitgenie-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias fitgenie-release

# Add to .gitignore
echo "*.jks" >> .gitignore
echo "*.keystore" >> .gitignore
```

Store the keystore password and alias in your password manager, not in code!

---

## Troubleshooting

### "APK file not found" Error

**Solution:**
- Ensure `VITE_ANDROID_APK_URL` is set to the correct public URL
- Check that the APK exists at that URL (curl/browser test)
- Verify CORS headers allow access

### "Cannot verify APK on local network"

**Expected:** Local development (192.168.x.x) shows this message
- This is OK! The app works fine in browser
- For testing APK download, deploy to production first

### APK Download Fails on Device

**Check:**
1. Device has internet connection
2. Enough storage space for APK (~50-80 MB typically)
3. Chrome/default browser is up to date
4. Try downloading from Chrome directly (not in-app browser)

---

## Next Steps

1. ✅ Build your APK
2. ✅ Upload to hosting
3. ✅ Set `VITE_ANDROID_APK_URL` environment variable
4. ✅ Deploy to production
5. ✅ Test on real Android device
6. ✅ Monitor downloads and feedback

---

## File References

- **Download Logic:** [App.tsx](App.tsx#L297)
- **Environment Config:** [.env.example](.env.example)
- **Capacitor Config:** [capacitor.config.ts](capacitor.config.ts)
