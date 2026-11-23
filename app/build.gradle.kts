plugins { id("com.android.application") }
android {
    namespace = "com.hollywoodsim.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.hollywoodsim.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 54
        versionName = "25.0"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
