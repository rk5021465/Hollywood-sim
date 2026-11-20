plugins { id("com.android.application") }
android {
    namespace = "com.nexasystem.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.nexasystem.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    // The game itself lives in ../../nexa-system/index.html — one copy, shared with the web version.
    sourceSets["main"].assets.srcDirs("../../nexa-system")
}
