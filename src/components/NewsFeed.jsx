import { useEffect, useState, useCallback } from "react";
import { Megaphone, Calendar, Sparkles, AlertCircle } from "lucide-react";
import { dataService } from "../services/dataService";
import { demoAppNews } from "../data/demoData";
import { APP_NEWS_UPDATED } from "../utils/newsEvents";

const NEW_DAYS = 7;

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isRecent(iso) {
  if (!iso) return false;
  const age = Date.now() - new Date(iso).getTime();
  return age < NEW_DAYS * 24 * 60 * 60 * 1000;
}

export default function NewsFeed({ isDemo = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    if (isDemo) {
      setItems(demoAppNews);
      setLoadError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const news = await dataService.getAppNews();
      setItems(news);
    } catch (err) {
      console.error(err);
      setItems([]);
      setLoadError(
        err?.message?.includes("app_news")
          ? "News-Tabelle fehlt in Supabase. Bitte Migration app_news.sql ausführen."
          : "Neuigkeiten konnten nicht geladen werden."
      );
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onUpdate = () => load();
    window.addEventListener(APP_NEWS_UPDATED, onUpdate);
    return () => window.removeEventListener(APP_NEWS_UPDATED, onUpdate);
  }, [load]);

  const hasRecent = items.some((item) => isRecent(item.created_at));

  return (
    <div style={card}>
      <div style={cardHeader}>
        <div style={cardHeaderLeft}>
          <div style={iconCircle}>
            <Megaphone size={20} color="#fff" />
          </div>
          <div>
            <span style={cardTitle}>Neuigkeiten</span>
            {hasRecent && (
              <span style={headerBadge}>
                <Sparkles size={12} />
                Neu
              </span>
            )}
          </div>
        </div>
        {items.length > 0 && <span style={countBadge}>{items.length}</span>}
      </div>

      {loading && <p style={muted}>Lade Neuigkeiten…</p>}

      {!loading && loadError && (
        <div style={errorBox}>
          <AlertCircle size={18} />
          <span>{loadError}</span>
        </div>
      )}

      {!loading && !loadError && items.length === 0 && (
        <p style={muted}>Aktuell keine Neuigkeiten. Schau bald wieder vorbei.</p>
      )}

      {!loading && items.length > 0 && (
        <div style={list}>
          {items.map((item, index) => {
            const recent = isRecent(item.created_at);
            const isLatest = index === 0;

            return (
              <article
                key={item.id}
                style={{
                  ...newsItem,
                  ...(isLatest ? newsItemHighlight : {}),
                }}
              >
                <div style={titleRow}>
                  <h3 style={newsTitle}>{item.title}</h3>
                  {recent && <span style={newBadge}>Neu</span>}
                </div>
                <p style={newsBody}>{item.body}</p>
                <div style={newsMeta}>
                  <Calendar size={14} />
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

const card = {
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%)",
  borderRadius: 18,
  padding: 20,
  marginBottom: 0,
  boxShadow: "0 8px 28px rgba(37, 99, 235, 0.12)",
  border: "1px solid rgba(59, 130, 246, 0.25)",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const cardHeaderLeft = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const iconCircle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
};

const cardTitle = {
  display: "block",
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
};

const headerBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  marginTop: 4,
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  color: "#1d4ed8",
  background: "rgba(37, 99, 235, 0.12)",
};

const countBadge = {
  fontSize: 13,
  fontWeight: 700,
  color: "#64748b",
  background: "rgba(255,255,255,0.9)",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid #e2e8f0",
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const newsItem = {
  padding: 14,
  borderRadius: 12,
  background: "rgba(255, 255, 255, 0.85)",
  border: "1px solid #e2e8f0",
};

const newsItemHighlight = {
  border: "1px solid rgba(59, 130, 246, 0.45)",
  boxShadow: "0 2px 12px rgba(59, 130, 246, 0.1)",
};

const titleRow = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 8,
};

const newsTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
  flex: 1,
};

const newBadge = {
  flexShrink: 0,
  padding: "3px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
};

const newsBody = {
  margin: "0 0 10px",
  fontSize: 14,
  lineHeight: 1.55,
  color: "#475569",
  whiteSpace: "pre-wrap",
};

const newsMeta = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "#94a3b8",
  fontWeight: 500,
};

const muted = {
  margin: 0,
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.5,
};

const errorBox = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: 12,
  borderRadius: 10,
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  fontSize: 13,
  lineHeight: 1.45,
};
