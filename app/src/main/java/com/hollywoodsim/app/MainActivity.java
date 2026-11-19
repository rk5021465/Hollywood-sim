package com.hollywoodsim.app;

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
        getWindow().setStatusBarColor(Color.parseColor("#0d0b10"));
        getWindow().setNavigationBarColor(Color.parseColor("#0d0b10"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0d0b10"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // game saves use localStorage
        s.setDatabaseEnabled(true);
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
        // Close any open in-game sheet first, otherwise exit.
        web.evaluateJavascript("(function(){var m=document.getElementById('modal');if(m&&m.innerHTML){m.innerHTML='';return 1}return 0})()",
            v -> { if (!"1".equals(v)) MainActivity.super.onBackPressed(); });
    }
}
