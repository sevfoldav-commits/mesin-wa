package com.wapro.model;

public class SessionModel {
    private String id;
    private String phoneNumber;
    private String status; // connected, disconnected, connecting, expired
    private long commandsExecuted;
    private long lastActive;
    private String pushName;

    public SessionModel(String id, String phoneNumber) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.status = "disconnected";
        this.commandsExecuted = 0;
        this.lastActive = System.currentTimeMillis();
        this.pushName = "";
    }

    // Getters
    public String getId() { return id; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getStatus() { return status; }
    public long getCommandsExecuted() { return commandsExecuted; }
    public long getLastActive() { return lastActive; }
    public String getPushName() { return pushName; }

    // Setters
    public void setStatus(String status) { this.status = status; }
    public void setCommandsExecuted(long c) { this.commandsExecuted = c; }
    public void setLastActive(long t) { this.lastActive = t; }
    public void setPushName(String name) { this.pushName = name; }

    public void incrementCommands() { this.commandsExecuted++; }

    public boolean isConnected() { return "connected".equals(status); }
    public boolean isConnecting() { return "connecting".equals(status); }
}
