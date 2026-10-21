use crate::core::state::app_preferences::app_preferences_manager::AppPreferencesManager;
use log::warn;
use serde_derive::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
pub enum UiLanguage {
  #[default]
  #[serde(rename = "zh-CN")]
  SimplifiedChinese,
  #[serde(rename = "en")]
  English,
}

impl UiLanguage {
  pub fn from_value(value: &str) -> Option<Self> {
    match value {
      "zh-CN" => Some(Self::SimplifiedChinese),
      "en" => Some(Self::English),
      _ => None,
    }
  }

  pub fn window_title(self, label: &str) -> Option<&'static str> {
    match (self, label) {
      (Self::SimplifiedChinese, "grok_login_window") => Some("登录 Grok"),
      (Self::English, "grok_login_window") => Some("Login to Grok"),
      (Self::SimplifiedChinese, "midjourney_login_window") => Some("登录 Midjourney"),
      (Self::English, "midjourney_login_window") => Some("Login to Midjourney"),
      (Self::SimplifiedChinese, "login_window") => Some("登录 OpenAI Sora"),
      (Self::English, "login_window") => Some("Login to OpenAI's Sora"),
      (Self::SimplifiedChinese, "worldlabs_login_window") => Some("登录 WorldLabs"),
      (Self::English, "worldlabs_login_window") => Some("Login to WorldLabs"),
      (Self::SimplifiedChinese, "artcraft_billing_window") => Some("ArtCraft 账单"),
      (Self::English, "artcraft_billing_window") => Some("ArtCraft Billing"),
      _ => None,
    }
  }
}

pub fn localized_window_title(app: &AppHandle, label: &str, fallback: &'static str) -> &'static str {
  app.try_state::<AppPreferencesManager>()
    .and_then(|manager| manager.get_clone().ok())
    .and_then(|prefs| prefs.ui_language.window_title(label))
    .unwrap_or(fallback)
}

pub fn update_window_titles(app: &AppHandle, language: UiLanguage) {
  for (label, window) in app.webview_windows() {
    if let Some(title) = language.window_title(&label) {
      if let Err(err) = window.set_title(title) {
        warn!("Could not update window title: {}", err);
      }
    }
  }
}

#[cfg(test)]
mod tests {
  use super::UiLanguage;

  #[test]
  fn language_values_and_titles_are_stable() {
    assert_eq!(UiLanguage::default(), UiLanguage::SimplifiedChinese);
    assert_eq!(UiLanguage::from_value("en"), Some(UiLanguage::English));
    assert_eq!(UiLanguage::from_value("invalid"), None);
    assert_eq!(UiLanguage::English.window_title("grok_login_window"), Some("Login to Grok"));
    assert_eq!(UiLanguage::SimplifiedChinese.window_title("grok_login_window"), Some("登录 Grok"));
  }
}
