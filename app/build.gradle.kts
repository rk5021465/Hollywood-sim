plugins { id("com.android.application") }
android {
    namespace = "com.hollywoodsim.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.hollywoodsim.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 40
        versionName = "19.4"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
