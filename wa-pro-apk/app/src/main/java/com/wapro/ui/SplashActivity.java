package com.wapro.ui;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import androidx.appcompat.app.AppCompatActivity;
import com.wapro.R;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler().postDelayed(() -> {
            try {
                startActivity(new Intent(this, MainActivity.class));
                finish();
            } catch (Exception e) {
                // Fallback
                finish();
            }
        }, 2000);
    }
}
