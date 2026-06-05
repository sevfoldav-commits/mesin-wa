package com.wapro.ui;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.switchmaterial.SwitchMaterial;
import com.wapro.R;

public class BlastActivity extends AppCompatActivity {
    private EditText etMessage, etDelay, etFile;
    private SwitchMaterial swImage, swSchedule, swAutoReply;
    private Spinner spType, spTarget;
    private Button btnStart, btnStop, btnPreview, btnUploadFile;
    private ProgressBar progressBar;
    private TextView tvStatus, tvSent, tvFailed, tvProgress;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_blast);
        setTitle("📨 Blast / Broadcast");

        initViews();
    }

    private void initViews() {
        spType = findViewById(R.id.spType);
        spTarget = findViewById(R.id.spTarget);
        etMessage = findViewById(R.id.etMessage);
        etDelay = findViewById(R.id.etDelay);
        etFile = findViewById(R.id.etFile);
        swImage = findViewById(R.id.swImage);
        swSchedule = findViewById(R.id.swSchedule);
        swAutoReply = findViewById(R.id.swAutoReply);
        btnStart = findViewById(R.id.btnStart);
        btnStop = findViewById(R.id.btnStop);
        btnPreview = findViewById(R.id.btnPreview);
        btnUploadFile = findViewById(R.id.btnUploadFile);
        progressBar = findViewById(R.id.progressBar);
        tvStatus = findViewById(R.id.tvStatus);
        tvSent = findViewById(R.id.tvSent);
        tvFailed = findViewById(R.id.tvFailed);
        tvProgress = findViewById(R.id.tvProgress);

        // Spinner: Type
        ArrayAdapter<CharSequence> typeAdapter = ArrayAdapter.createFromResource(
            this, R.array.blast_types, android.R.layout.simple_spinner_item);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spType.setAdapter(typeAdapter);

        // Spinner: Target
        ArrayAdapter<CharSequence> targetAdapter = ArrayAdapter.createFromResource(
            this, R.array.blast_targets, android.R.layout.simple_spinner_item);
        targetAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spTarget.setAdapter(targetAdapter);

        btnStart.setOnClickListener(v -> startBlast());
        btnStop.setOnClickListener(v -> stopBlast());
        btnPreview.setOnClickListener(v -> showPreview());
        btnUploadFile.setOnClickListener(v -> uploadFile());

        // Schedule toggle
        swSchedule.setOnCheckedChangeListener((btn, isChecked) -> {
            etDelay.setVisibility(isChecked ? View.VISIBLE : View.GONE);
        });
    }

    private void startBlast() {
        String message = etMessage.getText().toString().trim();
        if (message.isEmpty()) {
            etMessage.setError("Masukkan pesan!");
            return;
        }

        btnStart.setEnabled(false);
        btnStop.setEnabled(true);
        progressBar.setVisibility(View.VISIBLE);
        tvStatus.setText("⏳ Mengirim...");
        tvProgress.setText("0 / ?");

        String type = spType.getSelectedItem().toString();
        String target = spTarget.getSelectedItem().toString();
        boolean withImage = swImage.isChecked();
        String delay = etDelay.getText().toString();

        // TODO: Connect to backend/bot service to execute blast
        new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    Thread.sleep(1000);
                    final int sent = i;
                    runOnUiThread(() -> {
                        tvSent.setText(String.valueOf(sent));
                        tvProgress.setText(sent + " / 10");
                    });
                }
                runOnUiThread(() -> {
                    tvStatus.setText("✅ Selesai! 10 pesan terkirim");
                    progressBar.setVisibility(View.GONE);
                    btnStart.setEnabled(true);
                    btnStop.setEnabled(false);
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    tvStatus.setText("❌ Error: " + e.getMessage());
                    progressBar.setVisibility(View.GONE);
                    btnStart.setEnabled(true);
                    btnStop.setEnabled(false);
                });
            }
        }).start();
    }

    private void stopBlast() {
        btnStop.setEnabled(false);
        tvStatus.setText("⛔ Dihentikan");
        progressBar.setVisibility(View.GONE);
        btnStart.setEnabled(true);
    }

    private void showPreview() {
        String message = etMessage.getText().toString().trim();
        String type = spType.getSelectedItem().toString();

        new MaterialAlertDialogBuilder(this)
            .setTitle("📝 Preview " + type)
            .setMessage(message.isEmpty() ? "(pesan kosong)" : message)
            .setPositiveButton("OK", null)
            .show();
    }

    private void uploadFile() {
        // Open file picker for CSV/txt with phone numbers
        Toast.makeText(this, "Pilih file dengan daftar nomor", Toast.LENGTH_SHORT).show();
    }
}
