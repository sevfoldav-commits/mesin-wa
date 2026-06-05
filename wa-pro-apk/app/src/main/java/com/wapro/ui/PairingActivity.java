package com.wapro.ui;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import com.wapro.R;
import com.wapro.model.SessionManager;
import okhttp3.*;
import org.json.JSONObject;

public class PairingActivity extends AppCompatActivity {
    private EditText etPhone;
    private Button btnPair;
    private TextView tvResult, tvStatus;
    private ProgressBar progressBar;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pairing);
        sessionManager = SessionManager.getInstance(this);

        etPhone = findViewById(R.id.etPhone);
        btnPair = findViewById(R.id.btnPair);
        tvResult = findViewById(R.id.tvResult);
        tvStatus = findViewById(R.id.tvStatus);
        progressBar = findViewById(R.id.progressBar);

        btnPair.setOnClickListener(v -> startPairing());
    }

    private void startPairing() {
        String phone = etPhone.getText().toString().trim()
            .replaceAll("[^0-9]", "");

        if (phone.length() < 10) {
            etPhone.setError("Min 10 digit");
            return;
        }
        if (!phone.startsWith("62")) phone = "62" + phone.replaceFirst("^0", "");

        btnPair.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);
        tvStatus.setText("Connecting to WhatsApp server...");
        tvResult.setText("");

        // Simulate pairing - in production, this calls a backend server
        // that runs Baileys and returns the pairing code
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                // Demo pairing code
                final String code = generateDemoCode();

                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    tvStatus.setText("✅ Pairing Code Generated");
                    tvResult.setText(code);

                    // Save session
                    sessionManager.addSession(phone);

                    Toast.makeText(this, "Session added!", Toast.LENGTH_SHORT).show();

                    btnPair.setText("Copy Code");
                    btnPair.setOnClickListener(v -> {
                        android.content.ClipboardManager clipboard =
                            (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                        android.content.ClipData clip =
                            android.content.ClipData.newPlainText("Pairing Code", code);
                        clipboard.setPrimaryClip(clip);
                        Toast.makeText(this, "Code copied!", Toast.LENGTH_SHORT).show();
                    });
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    tvStatus.setText("❌ Error: " + e.getMessage());
                    btnPair.setEnabled(true);
                });
            }
        }).start();
    }

    private String generateDemoCode() {
        // Generate 8-character pairing code
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt((int)(Math.random() * chars.length())));
        }
        return code.substring(0, 4) + " " + code.substring(4);
    }
}
