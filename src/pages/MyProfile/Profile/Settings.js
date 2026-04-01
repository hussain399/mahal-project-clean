import React, { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    /* Preferences */
    language: "English",
    timezone: "IST",
    currency: "INR",

    /* Notifications */
    emailNotify: true,
    smsNotify: false,
    whatsappNotify: true,
    orderUpdates: true,
    promoAlerts: false,

    /* Visibility */
    profileVisible: true,
    showContact: false,

    /* Security */
    twoFactor: false,
    loginAlerts: true,
    deviceVerification: true,
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Settings Saved:", settings);
    alert("Settings saved successfully ✅");
  };

  return (
    <div className="profile-card">
      <h3 className="profile-title">Account Settings</h3>

      <form onSubmit={handleSubmit}>

        {/* ================= PREFERENCES ================= */}
        <h4 className="section-title">Preferences</h4>

        <div className="form-row">

          <div className="form-group">
            <label>Language</label>
            <select name="language" value={settings.language} onChange={handleChange}>
              <option>English</option>
              <option>Arabic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select name="timezone" value={settings.timezone} onChange={handleChange}>
              <option>IST</option>
              <option>GST</option>
              <option>UTC</option>
            </select>
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={settings.currency} onChange={handleChange}>
              <option>INR</option>
              <option>AED</option>
              <option>USD</option>
            </select>
          </div>

        </div>

        {/* ================= NOTIFICATIONS ================= */}
        <h4 className="section-title">Notifications</h4>

        <div className="form-row">

          <Toggle
            label="Email Notifications"
            checked={settings.emailNotify}
            onChange={() => handleToggle("emailNotify")}
          />

          <Toggle
            label="SMS Notifications"
            checked={settings.smsNotify}
            onChange={() => handleToggle("smsNotify")}
          />

          <Toggle
            label="WhatsApp Notifications"
            checked={settings.whatsappNotify}
            onChange={() => handleToggle("whatsappNotify")}
          />

        </div>

        <div className="form-row">

          <Toggle
            label="Order Status Updates"
            checked={settings.orderUpdates}
            onChange={() => handleToggle("orderUpdates")}
          />

          <Toggle
            label="Promotional Alerts"
            checked={settings.promoAlerts}
            onChange={() => handleToggle("promoAlerts")}
          />

        </div>

        {/* ================= VISIBILITY ================= */}
        <h4 className="section-title">Profile Visibility</h4>

        <div className="form-row">

          <Toggle
            label="Public Supplier Profile"
            checked={settings.profileVisible}
            onChange={() => handleToggle("profileVisible")}
          />

          <Toggle
            label="Show Contact Details"
            checked={settings.showContact}
            onChange={() => handleToggle("showContact")}
          />

        </div>

        {/* ================= SECURITY ================= */}
        <h4 className="section-title">Security</h4>

        <div className="form-row">

          <Toggle
            label="Two-Factor Authentication (2FA)"
            checked={settings.twoFactor}
            onChange={() => handleToggle("twoFactor")}
          />

          <Toggle
            label="Login Alerts"
            checked={settings.loginAlerts}
            onChange={() => handleToggle("loginAlerts")}
          />

          <Toggle
            label="New Device Verification"
            checked={settings.deviceVerification}
            onChange={() => handleToggle("deviceVerification")}
          />

        </div>

        {/* ================= ACTION ================= */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
};

/* ================= REUSABLE TOGGLE COMPONENT ================= */
const Toggle = ({ label, checked, onChange }) => {
  return (
    <div className="toggle-group">
      <label>{label}</label>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default Settings;
