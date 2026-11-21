package com.shaadiinc.game;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#120E16"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#120E16"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // keeps the saved house
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.setWebViewClient(new WebViewClient());
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        // Android 15+ draws edge to edge: keep the game clear of the status and navigation bars.
        root.setOnApplyWindowInsetsListener((v, ins) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = ins.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                l = i.left; t = i.top; r = i.right; b = i.bottom;
            } else {
                l = ins.getSystemWindowInsetLeft(); t = ins.getSystemWindowInsetTop();
                r = ins.getSystemWindowInsetRight(); b = ins.getSystemWindowInsetBottom();
            }
            v.setPadding(l, t, r, b);
            return ins;
        });
        setContentView(root);
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
        // Back closes a sheet, then leaves a sub-screen, and only then exits the app.
        web.evaluateJavascript(
            "(function(){var s=document.querySelector('#sheet');if(s&&!s.dataset.lock){closeSheet();return 'y'}var b=document.querySelector('#back');if(b){b.click();return 'y'}return 'n'})()",
            r -> { if (r == null || !r.contains("y")) MainActivity.super.onBackPressed(); });
    }

    @Override protected void onPause() { super.onPause(); web.onPause(); if (web != null) web.evaluateJavascript("try{save()}catch(e){}", null); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
}
