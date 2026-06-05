package com.wapro.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.*;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.*;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.wapro.R;
import com.wapro.model.SessionManager;
import com.wapro.model.SessionModel;
import java.util.List;

public class MainActivity extends AppCompatActivity implements BottomNavigationView.OnNavigationItemSelectedListener {
    private SessionManager sessionManager;
    private LinearLayout contentSessions, contentDashboard, contentTools, contentSettings;
    private RecyclerView rvSessions;
    private SessionAdapter adapter;
    private TextView tvTotalSessions, tvActiveSessions, tvTotalCommands, tvUptime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            setContentView(R.layout.activity_main);
            sessionManager = SessionManager.getInstance(this);

            initViews();
            setupBottomNav();
            loadSessions();
            updateDashboard();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void initViews() {
        rvSessions = findViewById(R.id.rvSessions);
        rvSessions.setLayoutManager(new LinearLayoutManager(this));

        contentSessions = findViewById(R.id.contentSessions);
        contentDashboard = findViewById(R.id.contentDashboard);
        contentTools = findViewById(R.id.contentTools);
        contentSettings = findViewById(R.id.contentSettings);

        tvTotalSessions = findViewById(R.id.tvTotalSessions);
        tvActiveSessions = findViewById(R.id.tvActiveSessions);
        tvTotalCommands = findViewById(R.id.tvTotalCommands);
        tvUptime = findViewById(R.id.tvUptime);

        FloatingActionButton fabAdd = findViewById(R.id.fabAdd);
        fabAdd.setOnClickListener(v -> showAddSessionDialog());

        Button btnAddSession = findViewById(R.id.btnAddSession);
        if (btnAddSession != null) {
            btnAddSession.setOnClickListener(v -> showAddSessionDialog());
        }

        Button btnPairing = findViewById(R.id.btnPairing);
        if (btnPairing != null) {
            btnPairing.setOnClickListener(v ->
                startActivity(new Intent(this, PairingActivity.class)));
        }

        // Tools buttons
        Button btnBlast = findViewById(R.id.btnToolsBlast);
        if (btnBlast != null) {
            btnBlast.setOnClickListener(v ->
                startActivity(new Intent(this, BlastActivity.class)));
        }

        Button btnIvasms = findViewById(R.id.btnToolsIvasms);
        if (btnIvasms != null) {
            btnIvasms.setOnClickListener(v ->
                startActivity(new Intent(this, PairingActivity.class)));
        }
    }

    private void setupBottomNav() {
        BottomNavigationView nav = findViewById(R.id.bottomNav);
        if (nav != null) {
            nav.setOnNavigationItemSelectedListener(this);
            nav.setSelectedItemId(R.id.nav_sessions);
        }
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        contentSessions.setVisibility(id == R.id.nav_sessions ? View.VISIBLE : View.GONE);
        contentDashboard.setVisibility(id == R.id.nav_dashboard ? View.VISIBLE : View.GONE);
        contentTools.setVisibility(id == R.id.nav_tools ? View.VISIBLE : View.GONE);
        contentSettings.setVisibility(id == R.id.nav_settings ? View.VISIBLE : View.GONE);

        if (id == R.id.nav_dashboard) updateDashboard();
        if (id == R.id.nav_sessions) loadSessions();
        return true;
    }

    private void loadSessions() {
        List<SessionModel> sessions = sessionManager.getSessions();
        adapter = new SessionAdapter(sessions);
        rvSessions.setAdapter(adapter);
    }

    private void updateDashboard() {
        if (tvTotalSessions != null)
            tvTotalSessions.setText(String.valueOf(sessionManager.getSessions().size()));
        if (tvActiveSessions != null)
            tvActiveSessions.setText(String.valueOf(sessionManager.getActiveCount()));
        if (tvTotalCommands != null)
            tvTotalCommands.setText(String.valueOf(sessionManager.getTotalCommands()));
        if (tvUptime != null) {
            long hours = System.currentTimeMillis() / 3600000;
            tvUptime.setText(hours + "h");
        }
    }

    private void showAddSessionDialog() {
        EditText input = new EditText(this);
        input.setHint("62812xxxxxx");
        input.setInputType(android.text.InputType.TYPE_CLASS_PHONE);

        new MaterialAlertDialogBuilder(this)
            .setTitle("Add New Session")
            .setMessage("Enter WhatsApp number:")
            .setView(input)
            .setPositiveButton("Add", (d, w) -> {
                String phone = input.getText().toString().trim();
                if (phone.length() >= 10) {
                    sessionManager.addSession(phone);
                    loadSessions();
                    updateDashboard();
                    Toast.makeText(this, "Session added!", Toast.LENGTH_SHORT).show();

                    // Open pairing
                    startActivity(new Intent(this, PairingActivity.class));
                }
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    // Session adapter
    private class SessionAdapter extends RecyclerView.Adapter<SessionAdapter.ViewHolder> {
        private final List<SessionModel> sessions;

        SessionAdapter(List<SessionModel> sessions) { this.sessions = sessions; }

        @NonNull @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            View view = getLayoutInflater().inflate(R.layout.item_session, p, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder h, int i) {
            SessionModel s = sessions.get(i);
            h.tvPhone.setText(s.getPhoneNumber().isEmpty() ? "New Session" : s.getPhoneNumber());
            h.tvStatus.setText(s.getStatus());
            h.tvCommands.setText(s.getCommandsExecuted() + " cmd");

            switch (s.getStatus()) {
                case "connected":
                    h.ivStatus.setBackgroundResource(R.drawable.circle_green);
                    break;
                case "connecting":
                    h.ivStatus.setBackgroundResource(R.drawable.circle_yellow);
                    break;
                default:
                    h.ivStatus.setBackgroundResource(R.drawable.circle_red);
            }

            h.itemView.setOnClickListener(v -> showSessionOptions(s));
        }

        @Override public int getItemCount() { return sessions.size(); }

        class ViewHolder extends RecyclerView.ViewHolder {
            ImageView ivStatus;
            TextView tvPhone, tvStatus, tvCommands;

            ViewHolder(View v) {
                super(v);
                ivStatus = v.findViewById(R.id.ivStatus);
                tvPhone = v.findViewById(R.id.tvPhone);
                tvStatus = v.findViewById(R.id.tvStatus);
                tvCommands = v.findViewById(R.id.tvCommands);
            }
        }
    }

    private void showSessionOptions(SessionModel session) {
        new MaterialAlertDialogBuilder(this)
            .setTitle(session.getPhoneNumber())
            .setItems(new String[]{"Start Bot", "Get Pairing Code", "Delete Session"}, (d, w) -> {
                switch (w) {
                    case 0:
                        session.setStatus("connected");
                        sessionManager.updateSession(session);
                        loadSessions();
                        updateDashboard();
                        Toast.makeText(this, "Bot started!", Toast.LENGTH_SHORT).show();
                        break;
                    case 1:
                        startActivity(new Intent(this, PairingActivity.class));
                        break;
                    case 2:
                        sessionManager.removeSession(session.getId());
                        loadSessions();
                        updateDashboard();
                        break;
                }
            })
            .show();
    }
}
