package com.wapro.model;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SessionManager {
    private static final String PREFS_NAME = "wa_sessions";
    private static final String KEY_SESSIONS = "sessions_list";
    private static SessionManager instance;
    private final SharedPreferences prefs;
    private final Gson gson;
    private List<SessionModel> sessions;

    private SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
        sessions = loadSessions();
    }

    public static synchronized SessionManager getInstance(Context context) {
        if (instance == null) instance = new SessionManager(context.getApplicationContext());
        return instance;
    }

    private List<SessionModel> loadSessions() {
        String json = prefs.getString(KEY_SESSIONS, "[]");
        Type type = new TypeToken<List<SessionModel>>() {}.getType();
        List<SessionModel> list = gson.fromJson(json, type);
        return list != null ? list : new ArrayList<>();
    }

    private void saveSessions() {
        prefs.edit().putString(KEY_SESSIONS, gson.toJson(sessions)).apply();
    }

    public List<SessionModel> getSessions() { return sessions; }

    public SessionModel addSession(String phoneNumber) {
        String id = UUID.randomUUID().toString().substring(0, 8);
        SessionModel session = new SessionModel(id, phoneNumber);
        sessions.add(session);
        saveSessions();
        return session;
    }

    public void removeSession(String id) {
        sessions.removeIf(s -> s.getId().equals(id));
        saveSessions();
    }

    public SessionModel getSession(String id) {
        for (SessionModel s : sessions) {
            if (s.getId().equals(id)) return s;
        }
        return null;
    }

    public void updateSession(SessionModel session) {
        for (int i = 0; i < sessions.size(); i++) {
            if (sessions.get(i).getId().equals(session.getId())) {
                sessions.set(i, session);
                break;
            }
        }
        saveSessions();
    }

    public int getActiveCount() {
        int count = 0;
        for (SessionModel s : sessions) {
            if (s.isConnected()) count++;
        }
        return count;
    }

    public long getTotalCommands() {
        long total = 0;
        for (SessionModel s : sessions) total += s.getCommandsExecuted();
        return total;
    }

    public String getFirstConnectedPhone() {
        for (SessionModel s : sessions) {
            if (s.isConnected()) return s.getPhoneNumber();
        }
        return sessions.isEmpty() ? "" : sessions.get(0).getPhoneNumber();
    }
}
