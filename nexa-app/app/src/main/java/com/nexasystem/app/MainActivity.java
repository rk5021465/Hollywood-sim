package com.nexasystem.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#04060D"));
        getWindow().setNavigationBarColor(Color.parseColor("#04060D"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#04060D"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // game saves use localStorage
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient());
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        // Close an open System menu (Status, Cards, Shop...) first, otherwise exit.
        web.evaluateJavascript("(function(){var b=document.getElementById('pclose');if(b){b.click();return 1}return 0})()",
            v -> { if (!"1".equals(v)) MainActivity.super.onBackPressed(); });
    }
}
