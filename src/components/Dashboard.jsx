import { useImmo } from "../context/ImmoContext";
import Skeleton from "./Skeleton";
import {
  Home,
  Building2,
  TrendingUp,
  Banknote,
  ArrowUpRight,
  Calendar,
  DollarSign,
  ArrowDown,
  Users,
  Plus,
  FileText,
  Upload,
  Phone,
  Mail,
  Bell,
  AlertCircle,
  Wrench,
  Clock,
  Repeat,
} from "lucide-react";
import {
  isMaintenanceAppointment,
  getAppointmentLabel,
  formatIntervalLabel,
  getNextMaintenanceDate,
  daysUntil,
} from "../utils/maintenance";
import { buildRentReminders } from "../utils/rentReminders";
import { useNotifications } from "../context/NotificationContext";

export default function Dashboard({ onNavigate }) {
  const { houses, vermieter, appointments, loading: immoLoading } = useImmo();
  const { info, warning } = useNotifications();

  const handleQuickAction = (action) => {
    if (!onNavigate) return;

    switch (action) {
      case "new-house":
        onNavigate("houses");
        info("Haus & Wohnung unter „Häuser“ anlegen");
        break;
      case "new-tenant":
        onNavigate("houses");
        info("Mieter in der Wohnung unter „Häuser“ eintragen");
        break;
      case "invoice":
        onNavigate("abrechnung");
        break;
      case "upload":
        onNavigate("documents");
        break;
      default:
        break;
    }
  };

  const handleTenantCall = (phone) => {
    if (!phone) {
      warning("Keine Telefonnummer hinterlegt – in Häuser → Wohnung eintragen");
      return;
    }
    window.open(`tel:${phone}`);
  };

  const handleTenantMail = (email) => {
    if (!email) {
      warning("Keine E-Mail hinterlegt – in Häuser → Wohnung eintragen");
      return;
    }
    window.open(`mailto:${email}`);
  };

  const safeHouses = houses || [];
  const safeAppointments = appointments || [];
  const safeTransactions = transactions || [];

  const maintenanceAppointments = safeAppointments
    .filter(isMaintenanceAppointment)
    .map((appointment) => {
      const nextDate = appointment.maintenance_interval_months
        ? getNextMaintenanceDate(
            appointment.date,
            appointment.maintenance_interval_months
          )
        : null;
      return {
        ...appointment,
        nextDate,
        daysUntilNext: daysUntil(nextDate),
      };
    })
    .sort((a, b) => {
      if (!a.nextDate) return 1;
      if (!b.nextDate) return -1;
      return new Date(a.nextDate) - new Date(b.nextDate);
    });

  const maintenanceWithInterval = maintenanceAppointments.filter(
    (a) => a.maintenance_interval_months
  );
  const overdueMaintenance = maintenanceWithInterval.filter(
    (a) => a.daysUntilNext !== null && a.daysUntilNext <= 0
  );

  const totalHouses = safeHouses.length;
  const totalApartments = safeHouses.reduce(
    (sum, h) => sum + (h.apartments?.length || 0),
    0
  );
  const totalAppointments = safeAppointments.length;

  const totalWarmmieteYearly = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.warmmiete || 0) * 12,
        0
      )
    );
  }, 0);

  const totalKaltmieteYearly = safeHouses.reduce((sum, house) => {
    return (
      sum +
      (house.apartments || []).reduce(
        (aptSum, apt) => aptSum + (apt.kaltmiete || 0) * 12,
        0
      )
    );
  }, 0);

  const totalRealCostsYearly = safeHouses.reduce((sum, house) => {
    const costs = house.costs || {};
    return (
      sum +
      Object.values(costs).reduce((cSum, c) => cSum + (c.year || 0), 0)
    );
  }, 0);

  const difference = totalWarmmieteYearly - totalRealCostsYearly;

  // Nebenkosten-Differenzierung
  const getTotalAdvancePaymentsYearly = () => {
    return safeHouses.reduce((sum, house) => {
      return sum + (house.apartments || []).reduce((aptSum, apt) => {
        const warm = Number(apt.warmmiete) || 0;
        const kalt = Number(apt.kaltmiete) || 0;
        const advance = warm - kalt;
        return aptSum + Math.max(0, advance) * 12;
      }, 0);
    }, 0);
  };

  const totalAdvancePaymentsYearly = getTotalAdvancePaymentsYearly();
  const costDifferenceYearly = totalAdvancePaymentsYearly - totalRealCostsYearly;
  const rentReminders = buildRentReminders(safeHouses);

  if (immoLoading) {
    return (
      <div style={page}>
        <div style={container}>
          <div style={header}>
            <Skeleton width={200} height={32} />
            <Skeleton width={300} height={16} />
          </div>
          <div style={grid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} style={kpiCard}>
                <Skeleton variant="circular" width={56} height={56} />
                <div style={kpiContent}>
                  <Skeleton width={100} height={28} />
                  <Skeleton width={80} height={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={container}>
        {/* Welcome Header */}
        <div style={header}>
          <h1 style={title}>
            Hallo {vermieter?.name ? vermieter.name.split(" ")[0] : "Vermieter"}!
          </h1>
          <p style={subtitle}>Willkommen in deinem ImmoForge Dashboard</p>
        </div>

        {/* KPI Cards – Gradient Design */}
        <div style={grid}>
          <div style={kpiCard}>
            <div style={iconBox}><Home size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalHouses}</div>
              <div style={label}>Häuser</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><Building2 size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalApartments}</div>
              <div style={label}>Wohnungen</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><Users size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{safeHouses.reduce((sum, h) => sum + (h.apartments || []).reduce((s, a) => s + (Number(a.persons) || 0), 0), 0)}</div>
              <div style={label}>Mieter</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><TrendingUp size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalWarmmieteYearly.toFixed(0)} €</div>
              <div style={label}>Warmmiete (jährlich)</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><Banknote size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalKaltmieteYearly.toFixed(0)} €</div>
              <div style={label}>Kaltmiete (jährlich)</div>
            </div>
          </div>

          {/* Nebenkosten Vorauszahlungen */}
          <div style={kpiCard}>
            <div style={iconBox}><DollarSign size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalAdvancePaymentsYearly.toFixed(0)} €</div>
              <div style={label}>Nebenkosten VZ</div>
            </div>
          </div>

          {/* Wirkliche Nebenkosten */}
          <div style={kpiCard}>
            <div style={iconBox}><ArrowDown size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalRealCostsYearly.toFixed(0)} €</div>
              <div style={label}>Wirkliche Kosten</div>
            </div>
          </div>

          {/* Nebenkosten Differenz */}
          <div style={{
            ...kpiCard,
            background: costDifferenceYearly >= 0 ? 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderColor: costDifferenceYearly >= 0 ? '#86efac' : '#fca5a5'
          }}>
            <div style={{
              ...iconBox,
              background: costDifferenceYearly >= 0 ? '#16a34a' : '#dc2626',
              color: 'white'
            }}>
              <ArrowUpRight size={28} />
            </div>
            <div style={kpiContent}>
              <div style={{
                ...bigNumber,
                color: costDifferenceYearly >= 0 ? '#166534' : '#dc2626'
              }}>
                {costDifferenceYearly >= 0 ? '+' : ''}{costDifferenceYearly.toFixed(0)} €
              </div>
              <div style={{
                ...label,
                color: costDifferenceYearly >= 0 ? '#166534' : '#dc2626'
              }}>
                NK Differenz
              </div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={iconBox}><Calendar size={28} /></div>
            <div style={kpiContent}>
              <div style={bigNumber}>{totalAppointments}</div>
              <div style={label}>Termine</div>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={{
              ...iconBox,
              background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
            }}>
              <Repeat size={28} />
            </div>
            <div style={kpiContent}>
              <div style={bigNumber}>{maintenanceWithInterval.length}</div>
              <div style={label}>Wartungs-Intervalle</div>
              {overdueMaintenance.length > 0 && (
                <div style={kpiHint}>{overdueMaintenance.length} überfällig</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Schnellzugriff</h2>
        </div>
        <div style={quickActionsGrid}>
          <button style={quickActionBtn} onClick={() => handleQuickAction('new-house')}>
            <div style={quickActionIcon}>
              <Plus size={24} />
            </div>
            <span style={quickActionLabel}>Neue Wohnung</span>
          </button>

          <button style={quickActionBtn} onClick={() => handleQuickAction('new-tenant')}>
            <div style={quickActionIcon}>
              <Users size={24} />
            </div>
            <span style={quickActionLabel}>Mieter hinzufügen</span>
          </button>

          <button style={quickActionBtn} onClick={() => handleQuickAction('invoice')}>
            <div style={quickActionIcon}>
              <FileText size={24} />
            </div>
            <span style={quickActionLabel}>Rechnung erstellen</span>
          </button>

          <button style={quickActionBtn} onClick={() => handleQuickAction('upload')}>
            <div style={quickActionIcon}>
              <Upload size={24} />
            </div>
            <span style={quickActionLabel}>Dokument hochladen</span>
          </button>
        </div>

        {/* Mieter Übersicht */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Mieter Übersicht</h2>
        </div>
        <div style={tenantsGrid}>
          {safeHouses.map(house => 
            (house.apartments || []).map(apartment => (
              apartment.tenant && (
                <div key={apartment.id} style={tenantCard}>
                  <div style={tenantHeader}>
                    <div style={tenantAvatar}>
                      <Users size={20} />
                    </div>
                    <div style={tenantInfo}>
                      <div style={tenantName}>{apartment.tenant}</div>
                      <div style={tenantApartment}>{apartment.name}</div>
                    </div>
                  </div>
                  <div style={tenantDetails}>
                    <div style={tenantDetail}>
                      <span style={tenantLabel}>Miete:</span>
                      <span style={tenantValue}>{apartment.warmmiete} €</span>
                    </div>
                    <div style={tenantActions}>
                      <button
                        style={{
                          ...tenantActionBtn,
                          opacity: apartment.tenant_phone ? 1 : 0.4,
                        }}
                        onClick={() => handleTenantCall(apartment.tenant_phone)}
                        title={
                          apartment.tenant_phone
                            ? "Mieter anrufen"
                            : "Telefon in Häuser eintragen"
                        }
                      >
                        <Phone size={16} />
                      </button>
                      <button
                        style={{
                          ...tenantActionBtn,
                          opacity: apartment.tenant_email ? 1 : 0.4,
                        }}
                        onClick={() => handleTenantMail(apartment.tenant_email)}
                        title={
                          apartment.tenant_email
                            ? "Mieter per E-Mail"
                            : "E-Mail in Häuser eintragen"
                        }
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))
          )}
          {safeHouses.reduce((count, h) => count + (h.apartments || []).filter(a => a.tenant).length, 0) === 0 && (
            <div style={emptyTenants}>
              <Users size={32} />
              <div style={emptyTenantsText}>Keine Mieter vorhanden</div>
            </div>
          )}
        </div>

        {/* Mietzins Erinnerungen */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Mietzins Erinnerungen</h2>
        </div>
        <div style={remindersCard}>
          <div style={reminderHeader}>
            <div style={reminderIcon}>
              <Bell size={24} />
            </div>
            <div style={reminderInfo}>
              <div style={reminderTitle}>Nächste Mietzahlungen</div>
              <div style={reminderSubtitle}>
                Fällig jeweils am 1. des Monats
              </div>
            </div>
          </div>
          <div style={remindersList}>
            {rentReminders.length === 0 ? (
              <div style={emptyRentReminders}>
                Keine Mieter mit hinterlegter Warmmiete
              </div>
            ) : (
              rentReminders.slice(0, 8).map((reminder) => (
                <div key={reminder.id} style={reminderItem}>
                  <div style={reminderItemIcon}>
                    <AlertCircle size={16} />
                  </div>
                  <div style={reminderItemContent}>
                    <div style={reminderItemTitle}>{reminder.tenant}</div>
                    <div style={reminderItemDate}>
                      {reminder.apartmentName} · {reminder.dueLabel}
                    </div>
                  </div>
                  <div style={reminderItemAmount}>{reminder.amount} €</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wartungs-Verwaltung */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Wartungs-Verwaltung</h2>
        </div>
        <div style={maintenanceCard}>
          <div style={maintenanceHeader}>
            <div style={maintenanceIcon}>
              <Wrench size={24} />
            </div>
            <div style={maintenanceInfo}>
              <div style={maintenanceTitle}>Anstehende Wartungen</div>
              <div style={maintenanceSubtitle}>
                {maintenanceWithInterval.length} mit Intervall
                {overdueMaintenance.length > 0 &&
                  ` · ${overdueMaintenance.length} überfällig`}
              </div>
            </div>
          </div>
          <div style={maintenanceList}>
            {maintenanceAppointments.slice(0, 5).map((appointment) => {
              const houseName =
                safeHouses.find(
                  (h) => String(h.id) === String(appointment.house_id)
                )?.name || "";
              const isOverdue =
                appointment.daysUntilNext !== null &&
                appointment.daysUntilNext <= 0;

              return (
                <div key={appointment.id} style={maintenanceItem}>
                  <div style={maintenanceItemIcon}>
                    <Clock size={16} />
                  </div>
                  <div style={maintenanceItemContent}>
                    <div style={maintenanceItemTitle}>
                      {getAppointmentLabel(appointment)}
                    </div>
                    <div style={maintenanceItemDate}>
                      {houseName && `${houseName} · `}
                      Letzte: {appointment.date}
                      {appointment.maintenance_interval_months && (
                        <>
                          {" "}
                          · Intervall:{" "}
                          {formatIntervalLabel(
                            appointment.maintenance_interval_months
                          )}
                        </>
                      )}
                    </div>
                    {appointment.nextDate && (
                      <div style={maintenanceItemNext}>
                        Nächste fällig: {appointment.nextDate}
                        {appointment.daysUntilNext !== null &&
                          appointment.daysUntilNext <= 30 && (
                            <span style={isOverdue ? overdueText : soonText}>
                              {isOverdue
                                ? ` (${Math.abs(appointment.daysUntilNext)} T. überfällig)`
                                : ` (in ${appointment.daysUntilNext} T.)`}
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      ...maintenanceItemStatus,
                      ...(isOverdue ? maintenanceItemStatusOverdue : {}),
                    }}
                  >
                    {isOverdue ? "Überfällig" : "Geplant"}
                  </div>
                </div>
              );
            })}
            {maintenanceAppointments.length === 0 && (
              <div style={emptyMaintenance}>
                <Wrench size={32} />
                <div style={emptyMaintenanceText}>
                  Keine Wartungen mit Intervall – unter Termine anlegen (Typ: Wartung)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SAAS STYLE – Gradient Design iOS/Android
========================= */
const page = {
  minHeight: "100vh",
  padding: "20px 16px 100px",
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#0f172a"
};

const container = {
  maxWidth: 1200,
  margin: "0 auto"
};

const header = {
  marginBottom: 32,
  textAlign: "center"
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 8,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const subtitle = {
  fontSize: 16,
  color: "#64748b",
  fontWeight: 500
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16
};

const sectionHeader = {
  marginTop: 32,
  marginBottom: 16
};

const sectionTitle = {
  fontSize: 24,
  fontWeight: 800,
  color: "#1e293b",
  marginBottom: 8
};

const quickActionsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12
};

const quickActionBtn = {
  padding: 20,
  borderRadius: 16,
  border: "2px solid rgba(255, 255, 255, 0.3)",
  background: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  cursor: "pointer",
  fontWeight: 700,
  color: "white",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  transition: "all 0.3s ease"
};

const quickActionIcon = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 8px 24px rgba(245, 158, 11, 0.4)"
};

const quickActionLabel = {
  fontSize: 13,
  fontWeight: 700,
  color: "white",
  textAlign: "center"
};

const tenantsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16
};

const tenantCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 20,
  borderRadius: 16,
  border: "2px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
};

const tenantHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16
};

const tenantAvatar = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
};

const tenantInfo = {
  flex: 1
};

const tenantName = {
  fontSize: 16,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 4
};

const tenantApartment = {
  fontSize: 13,
  fontWeight: 500,
  color: "#64748b"
};

const tenantDetails = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const tenantDetail = {
  display: "flex",
  flexDirection: "column",
  gap: 4
};

const tenantLabel = {
  fontSize: 12,
  fontWeight: 500,
  color: "#64748b"
};

const tenantValue = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a"
};

const tenantActions = {
  display: "flex",
  gap: 8
};

const tenantActionBtn = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "2px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  transition: "all 0.2s ease"
};

const emptyTenants = {
  gridColumn: "1 / -1",
  textAlign: "center",
  padding: 40,
  color: "#64748b"
};

const emptyTenantsText = {
  fontSize: 16,
  fontWeight: 500,
  marginTop: 12
};

const remindersCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 16,
  border: "2px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
};

const reminderHeader = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 20
};

const reminderIcon = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
};

const reminderInfo = {
  flex: 1
};

const reminderTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 4
};

const reminderSubtitle = {
  fontSize: 13,
  fontWeight: 500,
  color: "#64748b"
};

const remindersList = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const reminderItem = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 12,
  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
  border: "1px solid #fed7aa"
};

const reminderItemIcon = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "#f59e0b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white"
};

const reminderItemContent = {
  flex: 1
};

const reminderItemTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 2
};

const reminderItemDate = {
  fontSize: 12,
  fontWeight: 500,
  color: "#64748b"
};

const reminderItemAmount = {
  fontSize: 14,
  fontWeight: 800,
  color: "#f59e0b"
};

const emptyRentReminders = {
  padding: 16,
  textAlign: "center",
  color: "#64748b",
  fontSize: 14,
  fontWeight: 500,
};

const maintenanceCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 16,
  border: "2px solid #e2e8f0",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
};

const maintenanceHeader = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 20
};

const maintenanceIcon = {
  width: 56,
  height: 56,
  borderRadius: 16,
  background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
};

const maintenanceInfo = {
  flex: 1
};

const maintenanceTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 4
};

const maintenanceSubtitle = {
  fontSize: 13,
  fontWeight: 500,
  color: "#64748b"
};

const maintenanceList = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const maintenanceItem = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 12,
  background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
  border: "1px solid #ddd6fe"
};

const maintenanceItemIcon = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "#8b5cf6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white"
};

const maintenanceItemContent = {
  flex: 1
};

const maintenanceItemTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 2
};

const maintenanceItemDate = {
  fontSize: 12,
  fontWeight: 500,
  color: "#64748b"
};

const maintenanceItemStatus = {
  fontSize: 12,
  fontWeight: 700,
  color: "#8b5cf6",
  padding: "4px 12px",
  borderRadius: 8,
  background: "#ede9fe"
};

const emptyMaintenance = {
  textAlign: "center",
  padding: 40,
  color: "#64748b"
};

const emptyMaintenanceText = {
  fontSize: 16,
  fontWeight: 500,
  marginTop: 12
};

const kpiCard = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  padding: 24,
  borderRadius: 20,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  transition: "all 0.3s ease"
};

const iconBox = {
  width: 56,
  height: 56,
  borderRadius: 14,
  background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "white",
  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)"
};

const kpiContent = {
  flex: 1
};

const bigNumber = {
  fontSize: 28,
  fontWeight: 800,
  color: "#0f172a",
  lineHeight: 1
};

const kpiHint = {
  fontSize: 12,
  fontWeight: 700,
  color: "#dc2626",
  marginTop: 4,
};

const maintenanceItemNext = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6d28d9",
  marginTop: 4,
};

const soonText = { color: "#d97706", fontWeight: 700 };
const overdueText = { color: "#dc2626", fontWeight: 700 };

const maintenanceItemStatusOverdue = {
  background: "#fee2e2",
  color: "#dc2626",
};

const label = {
  fontSize: 13,
  fontWeight: 600,
  color: "#64748b",
  marginTop: 4,
  textTransform: "uppercase",
  letterSpacing: 0.5
};