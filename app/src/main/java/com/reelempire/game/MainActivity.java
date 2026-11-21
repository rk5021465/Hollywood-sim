package com.reelempire.game;

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
        getWindow().setStatusBarColor(Color.parseColor("#0E1320"));
        getWindow().setNavigationBarColor(Color.parseColor("#1A2133"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0E1320"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // keeps your saved game
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
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
        // Back closes an open window in the game first; otherwise it leaves the app.
        web.evaluateJavascript(
            "(function(){var v=document.querySelector('#veil.show'),x=document.querySelector('#modal .x');if(v&&x){x.click();return 'y'}return 'n'})()",
            r -> { if (r == null || !r.contains("y")) MainActivity.super.onBackPressed(); });
    }

    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
}
