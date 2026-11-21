# Reel Empire for Android

This folder is a complete Android app project. It wraps the Reel Empire game in a full-screen app with a gold film-reel icon. Your saved game is kept on the phone.

## Get the APK with GitHub (free, no computer software needed)

1. Sign in at github.com and create a new repository called `ReelEmpire`. It can be private.
2. On the repository page, choose **Add file → Upload files**.
3. Upload everything inside this folder, keeping the folder structure. This includes the hidden `.github` folder. On a computer you can drag the whole folder in. On a phone, a file manager that can upload folders works best.
4. Press **Commit changes**. GitHub starts building straight away.
5. Open the **Actions** tab and wait about 5 minutes for the green tick on "Build APK".
6. Open that run and download **ReelEmpire-apk** from the Artifacts section. Unzip it to get `app-debug.apk`.
7. Open `app-debug.apk` on your Android phone. Allow "Install unknown apps" for your browser or file manager when asked.

## Or build it with Android Studio

Open this folder in Android Studio, wait for it to sync, then choose **Build → Build APK(s)**.

## Updating the game

Replace `app/src/main/assets/index.html` with a new version of the game and upload it again. GitHub builds a fresh APK automatically.

## Notes

- This is a debug APK. It installs and plays normally, but the Google Play Store needs a signed release build.
- The game uses Google Fonts when the phone is online. When offline, it falls back to similar built-in fonts.
