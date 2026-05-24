/** Wird ausgelöst, wenn Admin News speichert/löscht – Dashboard aktualisiert sich. */
export const APP_NEWS_UPDATED = "app-news-updated";

export function notifyAppNewsUpdated() {
  window.dispatchEvent(new CustomEvent(APP_NEWS_UPDATED));
}
