# Build APK for Android - Complete Guide

## Method 1: EAS Build (Cloud Build - RECOMMENDED)

This builds your app in the cloud and gives you an APK file to download.

### Step 1: Create Expo Account
1. Go to https://expo.dev
2. Sign up for a free account
3. Verify your email

### Step 2: Login to EAS CLI
```bash
cd /Users/jayantakumarpanigrahi/Downloads/daktar.com/pharmacy_app/daktar-pharmacy-mobile
npx eas-cli login
```
Enter your Expo username and password when prompted.

### Step 3: Build the APK
```bash
npx eas-cli build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud (takes 10-20 minutes)
- Give you a download link when complete

### Step 4: Download & Install
1. Once build completes, you'll get a download URL
2. Download the APK file
3. Transfer it to your Android phone (via USB, WhatsApp, email, etc.)
4. On your phone, go to Settings → Security → Enable "Install from Unknown Sources"
5. Open the APK file to install

---

## Method 2: Local Build (Requires Android Studio)

Only use this if you want to build completely on your computer.

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → SDK Manager
4. Install Android SDK (API 34 or higher)

### Step 2: Set Environment Variables
Add to your `~/.zshrc` file:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then run:
```bash
source ~/.zshrc
```

### Step 3: Build APK
```bash
cd /Users/jayantakumarpanigrahi/Downloads/daktar.com/pharmacy_app/daktar-pharmacy-mobile
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Quick Commands

After first-time setup, use these commands:

**Cloud Build (EAS):**
```bash
npx eas-cli build -p android --profile preview
```

**Local Build:**
```bash
cd android && ./gradlew assembleRelease
```

---

## Troubleshooting

**Issue:** "Failed to resolve Android SDK"
- **Solution:** Install Android Studio and set ANDROID_HOME

**Issue:** "Login required"
- **Solution:** Run `npx eas-cli login` first

**Issue:** "App not installing on phone"
- **Solution:** Enable "Install from Unknown Sources" in phone settings

---

## APK Installation on Phone

1. Transfer APK to phone
2. Settings → Security → Enable "Unknown Sources"
3. Use File Manager to find the APK
4. Tap to install
5. Open the app

---

## Recommended: Use EAS Build

For most users, **Method 1 (EAS Build)** is easiest because:
- No need to install Android Studio (3+ GB)
- No environment setup required
- Builds are reproducible
- Just need an Expo account (free)

Start with Method 1 unless you have specific reasons to build locally.
