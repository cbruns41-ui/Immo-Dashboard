import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { dataService } from "../services/dataService";
import { useNotifications } from "../context/NotificationContext";
import { notifyAppNewsUpdated } from "../utils/newsEvents";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsAdmin() {
  const { success, error: notifyError } = useNotifications();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const loadNews = async () => {
    setLoading(true);
    try {
      const news = await dataService.getAppNews();
      setItems(news);
    } catch {
      notifyError("News konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      notifyError("Titel und Text sind Pflicht");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await dataService.updateAppNews(editingId, {
          title: title.trim(),
          body: body.trim(),
        });
        success("News aktualisiert");
      } else {
        await dataService.createAppNews({
          title: title.trim(),
          body: body.trim(),
        });
        success("News veröffentlicht");
      }
      resetForm();
      await loadNews();
      notifyAppNewsUpdated();
    } catch (err) {
      console.error(err);
      notifyError("Speichern fehlgeschlagen – bist du als Admin eingetragen?");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Diese News wirklich löschen?")) return;

    try {
      await dataService.deleteAppNews(id);
      success("News gelöscht");
      if (editingId === id) resetForm();
      await loadNews();
      notifyAppNewsUpdated();
    } catch (err) {
      console.error(err);
      notifyError("Löschen fehlgeschlagen");
    }
  };

  return (
    <div>
      <h3 style={sectionTitle}>
        <Megaphone size={20} />
        Newsfeed verwalten
      </h3>
      <p style={hint}>
        Beiträge erscheinen für alle Nutzer auf dem Dashboard. Nur dein Admin-Account kann sie bearbeiten.
      </p>

      <form onSubmit={handleSubmit} style={form}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel"
          style={input}
          maxLength={120}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Nachricht (wird allen Nutzern angezeigt)"
          style={textarea}
          rows={4}
        />
        <div style={formActions}>
          <button type="submit" style={primaryBtn} disabled={saving}>
            <Plus size={16} />
            {saving ? "Speichern…" : editingId ? "Aktualisieren" : "News veröffentlichen"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={secondaryBtn}>
              Abbrechen
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p style={hint}>Lade Einträge…</p>
      ) : items.length === 0 ? (
        <p style={hint}>Noch keine News veröffentlicht.</p>
      ) : (
        <div style={list}>
          {items.map((item) => (
            <div key={item.id} style={listItem}>
              <div style={{ flex: 1 }}>
                <strong style={listTitle}>{item.title}</strong>
                <p style={listBody}>{item.body}</p>
                <span style={listMeta}>{formatDate(item.created_at)}</span>
              </div>
              <div style={itemActions}>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  style={iconBtn}
                  title="Bearbeiten"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  style={{ ...iconBtn, color: "#dc2626" }}
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const sectionTitle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const hint = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 16,
  lineHeight: 1.5,
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginBottom: 24,
};

const input = {
  padding: 12,
  borderRadius: 10,
  border: "2px solid #e2e8f0",
  fontSize: 14,
};

const textarea = {
  padding: 12,
  borderRadius: 10,
  border: "2px solid #e2e8f0",
  fontSize: 14,
  resize: "vertical",
  fontFamily: "inherit",
};

const formActions = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  background: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const list = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const listItem = {
  display: "flex",
  gap: 12,
  padding: 14,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const listTitle = {
  display: "block",
  fontSize: 15,
  color: "#0f172a",
  marginBottom: 6,
};

const listBody = {
  margin: "0 0 8px",
  fontSize: 14,
  color: "#475569",
  whiteSpace: "pre-wrap",
};

const listMeta = {
  fontSize: 12,
  color: "#94a3b8",
};

const itemActions = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const iconBtn = {
  padding: 8,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  background: "white",
  cursor: "pointer",
  color: "#3b82f6",
};
