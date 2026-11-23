package com.hollywoodsim.app;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.view.HapticFeedbackConstants;
import android.os.Build;
import java.util.Locale;
import java.util.Set;

public class MainActivity extends Activity {
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsOk = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.parseColor("#0d0b10"));
        getWindow().setNavigationBarColor(Color.parseColor("#0d0b10"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0d0b10"));
        WebSettings s = web.getSettings();
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // game saves use localStorage
        s.setDatabaseEnabled(true);
        web.setWebViewClient(new WebViewClient());

        // Device text-to-speech, so directors can read their pitches aloud (works offline).
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                try { tts.setLanguage(Locale.US); } catch (Exception e) { }
                ttsOk = true;
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { js("tts38on('" + id + "')"); }
                    @Override public void onDone(String id) { js("tts38done('" + id + "')"); }
                    @Override public void onError(String id) { js("tts38done('" + id + "')"); }
                });
            }
        });

        web.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void haptic(String kind) {
                // Clear, short system haptics (no permission needed)
                final int c;
                boolean r = Build.VERSION.SDK_INT >= 30;
                if (r && "confirm".equals(kind)) c = 16; // CONFIRM (API 30)
                else if (r && "reject".equals(kind)) c = 17; // REJECT (API 30)
                else if ("long".equals(kind)) c = HapticFeedbackConstants.LONG_PRESS;
                else c = HapticFeedbackConstants.KEYBOARD_TAP;
                web.post(() -> web.performHapticFeedback(c));
            }

            @JavascriptInterface
            public boolean ttsReady() { return ttsOk; }

            /** Names of installed English voices that work offline, comma-separated. */
            @JavascriptInterface
            public String ttsVoices() {
                if (!ttsOk) return "";
                StringBuilder b = new StringBuilder();
                try {
                    Set<Voice> vs = tts.getVoices();
                    if (vs != null) for (Voice v : vs) {
                        Locale l = v.getLocale();
                        if (l == null || !"en".equals(l.getLanguage())) continue;
                        if (v.isNetworkConnectionRequired()) continue;
                        if (b.length() > 0) b.append(',');
                        b.append(v.getName());
                    }
                } catch (Exception e) { }
                return b.toString();
            }

            /** Speak one chunk. flush=true starts fresh; voice may be "" for the default voice. */
            @JavascriptInterface
            public void ttsSpeak(String text, String voice, float pitch, float rate, String id, boolean flush) {
                if (!ttsOk || text == null) return;
                try {
                    if (voice != null && voice.length() > 0) {
                        Set<Voice> vs = tts.getVoices();
                        if (vs != null) for (Voice v : vs) if (voice.equals(v.getName())) { tts.setVoice(v); break; }
                    } else {
                        tts.setLanguage(Locale.US);
                    }
                    tts.setPitch(pitch <= 0 ? 1f : pitch);
                    tts.setSpeechRate(rate <= 0 ? 1f : rate);
                    tts.speak(text, flush ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, null, id);
                } catch (Exception e) { }
            }

            @JavascriptInterface
            public void ttsStop() { try { if (tts != null) tts.stop(); } catch (Exception e) { } }
        }, "HSNative");
        setContentView(web);
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    private void js(String code) {
        if (web == null) return;
        web.post(() -> { try { web.evaluateJavascript("try{" + code + "}catch(e){}", null); } catch (Exception e) { } });
    }

    @Override
    protected void onPause() {
        super.onPause();
        try { if (tts != null) tts.stop(); } catch (Exception e) { }
    }

    @Override
    protected void onDestroy() {
        try { if (tts != null) { tts.stop(); tts.shutdown(); } } catch (Exception e) { }
        super.onDestroy();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        // Close any open in-game sheet first, otherwise exit.
        web.evaluateJavascript("(function(){var m=document.getElementById('modal');if(m&&m.innerHTML){m.innerHTML='';try{tts38stop()}catch(e){}return 1}return 0})()",
            v -> { if (!"1".equals(v)) MainActivity.super.onBackPressed(); });
    }
}
