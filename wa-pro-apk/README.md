# Mesin-WA — Android APK

Mesin-WA - WA Bot Manager dengan Multi-Session.

## Fitur
- 📱 Multi WhatsApp Session (unlimited)
- 🔗 Pairing Code (tanpa scan QR)
- 📊 Dashboard statistik realtime
- 🛠 Tools: Sticker, Download, AI Chat, dll
- 📞 IVASMS Integration (beli nomor + OTP)

## Cara Build APK

### via Android Studio (Rekomendasi)
```bash
# 1. Clone / extract project
# 2. Buka folder ini di Android Studio
# 3. Tunggu Gradle sync selesai
# 4. Build → Build Bundle(s) / APK(s) → Build APK(s)
# 5. APK ada di: app/build/outputs/apk/debug/
```

### via Command Line (PC dengan Java & Gradle)
```bash
# Install Android SDK
# Set ANDROID_HOME
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

### via GitHub Actions (Auto Build)
Bikin file `.github/workflows/build.yml`:
```yaml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK
        uses: actions/setup-java@v3
        with: { java-version: '17', distribution: 'temurin' }
      - name: Build APK
        run: |
          chmod +x gradlew
          ./gradlew assembleRelease
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: Mesin-WA-Pro
          path: app/build/outputs/apk/release/*.apk
```

## Struktur Project
```
wa-pro-apk/
├── app/
│   ├── src/main/
│   │   ├── java/com/wapro/
│   │   │   ├── ui/          # Activity & Fragment
│   │   │   ├── model/       # Data model
│   │   │   ├── service/     # Background service
│   │   │   └── utils/       # Helper
│   │   ├── res/             # Layout & resources
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
└── gradlew
```

## Catatan untuk Developer
- Ubah `applicationId` di `app/build.gradle` sebelum publish
- Generate keystore untuk release build
- Minimal Android 7.0 (API 24)
- Butuh izin: internet, camera (QR), notification
