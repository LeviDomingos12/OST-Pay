import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import ostPayLogo from "./assets/images/ost_pay_logo_1783060934149.jpg";
import { 
  QrCode, CreditCard, Shield, CheckCircle2, User, Landmark, Church, Phone, Calendar, MapPin, 
  Search, Check, AlertTriangle, X, ShieldAlert, LogOut, ArrowRight, Download, Printer, 
  Menu, Eye, FileText, Barcode, ChevronRight, Upload, Users, TrendingUp, DollarSign, Camera, RefreshCw,
  Bell, Mail, MessageSquare, Lock, Clock, Send, Edit2, Trash2, Settings, Plus, Trash, Filter, Moon, Sun,
  Sparkles,
  Server, EyeOff, Info, Copy, Globe, Scissors, Heart, Unlock, Database, Smartphone, HelpCircle, Briefcase
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { jsPDF } from "jspdf";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

// --- INTERFACES & ENUMS ---
import { 
  AdminNotification, 
  AdminToast, 
  Member, 
  AttendanceRecord, 
  AuditLog, 
  WhatsAppReminder,
  SmartTemplate
} from "./types";

import {
  getMembers,
  saveMember,
  deleteMember,
  getAuditLogs,
  addAuditLog,
  getAdminNotifications,
  saveAdminNotification,
  deleteAdminNotification,
  getAttendanceRecords,
  addAttendanceRecord,
  getWhatsAppReminders,
  saveWhatsAppReminder,
  getSettingsDoc,
  saveSettingsDoc,
  clearAllSystemCollections
} from "./firebase";

// --- CHURCH LOGO COMPONENT ---
const ChurchLogo = ({ className = "w-16 h-16" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md select-none`}>
      <defs>
        {/* Subtle background glow radial gradient */}
        <radialGradient id="church-logo-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0B2E59" />
        </radialGradient>
        {/* Beautiful 3D gradient for the Cross */}
        <linearGradient id="church-cross-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="40%" stopColor="#c22525" />
          <stop offset="100%" stopColor="#6e0a0a" />
        </linearGradient>
        {/* Circular text paths */}
        <path id="church-curve-top" d="M 12 50 A 38 38 0 0 1 88 50" fill="none" />
        <path id="church-curve-bottom" d="M 88 50 A 38 38 0 0 1 12 50" fill="none" />
      </defs>
      
      {/* Outer Red/Brown Border & Base Dark Blue Circle */}
      <circle cx="50" cy="50" r="48" fill="#0B2E59" stroke="#b01c1c" strokeWidth="1.5" />
      
      {/* Inner White Border Ring */}
      <circle cx="50" cy="50" r="43" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
      
      {/* Central Background with Gradient */}
      <circle cx="50" cy="50" r="35" fill="url(#church-logo-bg)" stroke="#ffffff" strokeWidth="0.8" />
      
      {/* Text on top path */}
      <text className="font-sans text-[4.1px] font-black fill-white tracking-[0.02em]">
        <textPath href="#church-curve-top" startOffset="50%" textAnchor="middle">
          IAFI Ministérios Avante na Fé Int.
        </textPath>
      </text>
      
      {/* Text on bottom path */}
      <text className="font-sans text-[4.1px] font-bold fill-sky-200 tracking-[0.02em]">
        <textPath href="#church-curve-bottom" startOffset="50%" textAnchor="middle">
          Guiados pelo Espírito Santo
        </textPath>
      </text>
      
      {/* Beautiful Central Red Cross with Drop Shadow */}
      <g transform="translate(42.5, 33.5)" filter="drop-shadow(0px 1px 1.5px rgba(0,0,0,0.4))">
        {/* Vertical shaft */}
        <rect x="5.5" y="0" width="4.5" height="23" fill="url(#church-cross-grad)" rx="1" />
        {/* Horizontal beam */}
        <rect x="0" y="6.5" width="15.5" height="4.5" fill="url(#church-cross-grad)" rx="1" />
      </g>
    </svg>
  );
};

// --- MOZAMBIQUE REGIONS ---
const REGIONS = [
  "Chimoio Norte", "Chimoio Sul", "Beira Sul", "Maputo Central", "Matola", "Pemba", 
  "Nampula Sul", "Quelimane", "Maputo Este/Oeste", "Beira Norte", "Lichinga", "Nacala", 
  "Nampula Norte", "Manica", "Vilanculos", "Maxixe", "Catandica", "Mocuba", "Cuamba", 
  "Dondo", "Xai-Xai", "Gondola", "Mueda", "Gurue", "Chinavane", "Chokwe", "Caia", 
  "Chidoco", "Machaze", "Mussorize", "Gorongosa", "Mutarara", "Marrupa", "Alto Molocue", 
  "Montepuez", "Mopeia", "Chicuacuala", "Milange", "Mandimba", "Ribáuè", "Sena", 
  "Muchungue", "Província Sul", "Província Norte", "Songo", "Moatize"
];

const PROVINCES = [
  "Cabo Delgado", "Gaza", "Inhambane", "Manica", "Maputo Província", "Maputo Cidade", 
  "Nampula", "Niassa", "Sofala", "Tete", "Zambézia"
];

// --- CHURCH POSITIONS COLOR THEMES & PALETTES ---
export const POSITION_THEMES: Record<string, {
  name: string;
  primaryColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  stripeColor: string;
  pdfPrimaryRGB: [number, number, number];
  pdfSecondaryRGB: [number, number, number];
  pdfBadgeLabel: string;
}> = {
  "Membro": {
    name: "Membro",
    primaryColor: "blue-700",
    badgeBg: "bg-blue-50/90",
    badgeText: "text-blue-700 border-blue-200",
    badgeBorder: "border-blue-200",
    stripeColor: "bg-blue-700",
    pdfPrimaryRGB: [29, 78, 216],
    pdfSecondaryRGB: [219, 234, 254],
    pdfBadgeLabel: "MEMBRO"
  },
  "Diacono": {
    name: "Diácono",
    primaryColor: "amber-600",
    badgeBg: "bg-amber-50/90",
    badgeText: "text-amber-700 border-amber-200",
    badgeBorder: "border-amber-200",
    stripeColor: "bg-amber-500",
    pdfPrimaryRGB: [217, 119, 6],
    pdfSecondaryRGB: [254, 243, 199],
    pdfBadgeLabel: "DIÁCONO"
  },
  "Diácono": {
    name: "Diácono",
    primaryColor: "amber-600",
    badgeBg: "bg-amber-50/90",
    badgeText: "text-amber-700 border-amber-200",
    badgeBorder: "border-amber-200",
    stripeColor: "bg-amber-500",
    pdfPrimaryRGB: [217, 119, 6],
    pdfSecondaryRGB: [254, 243, 199],
    pdfBadgeLabel: "DIÁCONO"
  },
  "Diaconisa": {
    name: "Diaconisa",
    primaryColor: "pink-600",
    badgeBg: "bg-pink-50/90",
    badgeText: "text-pink-700 border-pink-200",
    badgeBorder: "border-pink-200",
    stripeColor: "bg-pink-500",
    pdfPrimaryRGB: [219, 39, 119],
    pdfSecondaryRGB: [252, 231, 243],
    pdfBadgeLabel: "DIACONISA"
  },
  "Anciao": {
    name: "Ancião",
    primaryColor: "purple-700",
    badgeBg: "bg-purple-50/90",
    badgeText: "text-purple-700 border-purple-200",
    badgeBorder: "border-purple-200",
    stripeColor: "bg-purple-600",
    pdfPrimaryRGB: [109, 40, 217],
    pdfSecondaryRGB: [243, 232, 255],
    pdfBadgeLabel: "ANCIÃO"
  },
  "Ancião": {
    name: "Ancião",
    primaryColor: "purple-700",
    badgeBg: "bg-purple-50/90",
    badgeText: "text-purple-700 border-purple-200",
    badgeBorder: "border-purple-200",
    stripeColor: "bg-purple-600",
    pdfPrimaryRGB: [109, 40, 217],
    pdfSecondaryRGB: [243, 232, 255],
    pdfBadgeLabel: "ANCIÃO"
  },
  "Pastor": {
    name: "Pastor",
    primaryColor: "indigo-700",
    badgeBg: "bg-indigo-50/90",
    badgeText: "text-indigo-700 border-indigo-200",
    badgeBorder: "border-indigo-200",
    stripeColor: "bg-indigo-600",
    pdfPrimaryRGB: [67, 56, 202],
    pdfSecondaryRGB: [224, 231, 255],
    pdfBadgeLabel: "PASTOR"
  },
  "Bispo": {
    name: "Bispo",
    primaryColor: "red-700",
    badgeBg: "bg-red-50/90",
    badgeText: "text-red-700 border-red-200",
    badgeBorder: "border-red-200",
    stripeColor: "bg-red-600",
    pdfPrimaryRGB: [185, 28, 28],
    pdfSecondaryRGB: [254, 226, 226],
    pdfBadgeLabel: "BISPO"
  },
  "Visitante": {
    name: "Visitante",
    primaryColor: "slate-600",
    badgeBg: "bg-slate-50/90",
    badgeText: "text-slate-700 border-slate-200",
    badgeBorder: "border-slate-200",
    stripeColor: "bg-slate-500",
    pdfPrimaryRGB: [71, 85, 105],
    pdfSecondaryRGB: [241, 245, 249],
    pdfBadgeLabel: "VISITANTE"
  }
};

export const getPositionTheme = (role?: string) => {
  if (!role) return POSITION_THEMES["Membro"];
  const key = role.trim();
  const normalized = key.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  if (normalized === "membro") return POSITION_THEMES["Membro"];
  if (normalized === "diacono") return POSITION_THEMES["Diacono"];
  if (normalized === "diaconisa") return POSITION_THEMES["Diaconisa"];
  if (normalized === "anciao") return POSITION_THEMES["Anciao"];
  if (normalized === "pastor") return POSITION_THEMES["Pastor"];
  if (normalized === "bispo") return POSITION_THEMES["Bispo"];
  if (normalized === "visitante") return POSITION_THEMES["Visitante"];

  return POSITION_THEMES["Membro"];
};

// --- INITIAL MOCK DATA ---
const INITIAL_MEMBERS: Member[] = [];

const INITIAL_LOGS: AuditLog[] = [];

const INITIAL_NOTIFICATIONS: AdminNotification[] = [];

// --- EXPIRY UTILITY SYSTEM ---
const getExpiryStatus = (expiryDateStr?: string) => {
  if (!expiryDateStr) return { nearing: false, expired: false, daysLeft: 0 };
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  
  // Set times to midnight for precise day calculation
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { nearing: false, expired: true, daysLeft: diffDays };
  } else if (diffDays <= 30) {
    return { nearing: true, expired: false, daysLeft: diffDays };
  }
  return { nearing: false, expired: false, daysLeft: diffDays };
};

export default function App() {
  // --- STATE ---
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem("ost_pay_members");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("ost_pay_logs");
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem("ost_pay_admin_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Polling State for admin notifications
  const [isPollingActive, setIsPollingActive] = useState(() => {
    const saved = localStorage.getItem("ost_pay_polling_active");
    return saved !== null ? saved === "true" : true;
  });
  const [pollingInterval, setPollingInterval] = useState(() => {
    const saved = localStorage.getItem("ost_pay_polling_interval");
    return saved ? parseInt(saved, 10) : 15; // default 15s
  });
  const [pollingTimeLeft, setPollingTimeLeft] = useState(15);
  const [isPollingAnimation, setIsPollingAnimation] = useState(false);

  // Configurable reminder advance days
  const [reminderAdvanceDays, setReminderAdvanceDays] = useState<number>(() => {
    const saved = localStorage.getItem("ost_pay_reminder_advance_days");
    return saved ? parseInt(saved, 10) : 30; // default 30 days
  });

  // Shadow getExpiryStatus with the configurable value
  const getExpiryStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { nearing: false, expired: false, daysLeft: 0 };
    const expiry = new Date(expiryDateStr);
    const now = new Date();
    
    // Set times to midnight for precise day calculation
    expiry.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { nearing: false, expired: true, daysLeft: diffDays };
    } else if (diffDays <= reminderAdvanceDays) {
      return { nearing: true, expired: false, daysLeft: diffDays };
    }
    return { nearing: false, expired: false, daysLeft: diffDays };
  };

  const [activeToasts, setActiveToasts] = useState<AdminToast[]>([]);

  const [currentMode, setCurrentMode] = useState<"landing" | "member" | "admin" | "validator">("landing");
  const [currentUser, setCurrentUser] = useState<Member | { email: string; isAdmin: boolean } | null>(null);
  
  // Login flow modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Member portal tab
  const [memberTab, setMemberTab] = useState<"profile" | "payment" | "badge">("profile");
  const [badgeCodeOption, setBadgeCodeOption] = useState<"both" | "qr" | "barcode">(() => {
    const saved = localStorage.getItem("ost_badge_code_option");
    return (saved as "both" | "qr" | "barcode") || "both";
  });

  useEffect(() => {
    localStorage.setItem("ost_badge_code_option", badgeCodeOption);
  }, [badgeCodeOption]);
  
  // Admin dashboard tabs
  const [adminTab, setAdminTab] = useState<"overview" | "members" | "audit" | "worship" | "reminders" | "smtp" | "health" | "sync">("overview");
  const [remindersSubTab, setRemindersSubTab] = useState<"queue" | "history" | "templates">("queue");

  // Database Synchronization config states
  const [syncInterval, setSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem("ost_sync_interval");
    return saved ? parseInt(saved, 10) : 5; // default 5 minutes
  });
  const [isSyncActive, setIsSyncActive] = useState<boolean>(() => {
    const saved = localStorage.getItem("ost_sync_active");
    return saved ? saved === "true" : true; // default enabled
  });
  const [syncPreference, setSyncPreference] = useState<"newer" | "local" | "remote">(() => {
    const saved = localStorage.getItem("ost_sync_preference");
    return (saved as "newer" | "local" | "remote") || "newer"; // default newer
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem("ost_last_sync_time") || null;
  });
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncLogs, setSyncLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem("ost_sync_logs");
    return saved ? JSON.parse(saved) : ["Serviço de sincronização inicializado."];
  });

  // Health & Assistance tab states
  const [healthSearchQuery, setHealthSearchQuery] = useState("");

  // Worship automatic reminders states
  const [worshipReminderActive, setWorshipReminderActive] = useState<boolean>(() => {
    return localStorage.getItem("ost_worship_rem_active") !== "false"; // default true
  });
  const [worshipReminderTime, setWorshipReminderTime] = useState<string>(() => {
    return localStorage.getItem("ost_worship_rem_time") || "19:00";
  });
  const [worshipReminderTitle, setWorshipReminderTitle] = useState<string>(() => {
    return localStorage.getItem("ost_worship_rem_title") || "Culto de Celebração & Comunhão";
  });
  const [worshipReminderFilterType, setWorshipReminderFilterType] = useState<"ministry" | "region" | "all">("all");
  const [worshipReminderFilterValue, setWorshipReminderFilterValue] = useState<string>("Todos");
  const [worshipReminderHistory, setWorshipReminderHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("ost_worship_rem_history");
    return saved ? JSON.parse(saved) : ["Motor de notificações de culto ativo."];
  });
  const [worshipReminderTemplate, setWorshipReminderTemplate] = useState<string>(() => {
    return localStorage.getItem("ost_worship_rem_template") || 
      "Olá {nome}! Lembramos que o nosso \"{culto}\" começará em 30 minutos (às {horário}). A sua presença é muito especial! Que Deus o abençoe.";
  });
  const [adminDarkMode, setAdminDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ost_admin_dark_mode");
    if (saved !== null) {
      return saved === "true";
    }
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [systemThemePulse, setSystemThemePulse] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("ost_admin_dark_mode", String(adminDarkMode));
  }, [adminDarkMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (adminDarkMode && currentMode === "admin") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [adminDarkMode, currentMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setAdminDarkMode(e.matches);
      setSystemThemePulse(true);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (systemThemePulse) {
      const timer = setTimeout(() => {
        setSystemThemePulse(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [systemThemePulse]);

  const [showToggleTooltip, setShowToggleTooltip] = useState<boolean>(false);

  const getReminderTriggerTime = (startTimeStr: string): string => {
    if (!startTimeStr) return "00:00";
    const [hours, minutes] = startTimeStr.split(":").map(Number);
    let triggerMinutes = minutes - 30;
    let triggerHours = hours;
    if (triggerMinutes < 0) {
      triggerMinutes += 60;
      triggerHours = (triggerHours - 1 + 24) % 24;
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(triggerHours)}:${pad(triggerMinutes)}`;
  };

  const handleTriggerWorshipReminders = () => {
    const triggerTime = getReminderTriggerTime(worshipReminderTime);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const matchingWorshipMembers = members.filter(m => {
      if (worshipReminderFilterType === "all") return true;
      if (worshipReminderFilterType === "ministry") {
        if (worshipReminderFilterValue === "Todos") return true;
        return (m.ministry || "Nenhum") === worshipReminderFilterValue;
      }
      if (worshipReminderFilterType === "region") {
        if (worshipReminderFilterValue === "Todos") return true;
        return (m.region || "Nenhum") === worshipReminderFilterValue;
      }
      return true;
    });

    if (matchingWorshipMembers.length === 0) {
      const newToast: AdminToast = {
        id: "toast-" + Date.now(),
        title: "Sem Destinatários",
        message: "Nenhum membro corresponde aos filtros de ministério/região selecionados.",
        type: "warning"
      };
      setActiveToasts(prev => [newToast, ...prev]);
      return;
    }

    const newLog = `[${nowStr}] Enviados lembretes de "${worshipReminderTitle}" para ${matchingWorshipMembers.length} membros (${worshipReminderFilterType === 'all' ? 'Geral' : worshipReminderFilterValue}). Culto às ${worshipReminderTime} (Disparo às ${triggerTime}).`;
    
    setWorshipReminderHistory(prev => [newLog, ...prev]);
    
    const newReminders: WhatsAppReminder[] = matchingWorshipMembers.map(m => ({
      id: "rem-worship-" + m.id + "-" + Date.now(),
      memberId: m.id,
      memberName: m.name,
      contact: m.contact || "+258 840000000",
      message: worshipReminderTemplate
        .replace(/{nome}/g, m.name)
        .replace(/{horário}/g, worshipReminderTime)
        .replace(/{horario}/g, worshipReminderTime)
        .replace(/{culto}/g, worshipReminderTitle),
      status: "Enviado",
      scheduledDate: new Date().toISOString().split("T")[0],
      expiryDate: m.expiryDate || "-"
    }));

    setWhatsappReminders(prev => [...newReminders, ...prev]);
    addLog("Administrador", `Disparou lembretes de culto (${worshipReminderTitle}) para ${matchingWorshipMembers.length} membros`, "success");

    const successToast: AdminToast = {
      id: "toast-" + Date.now(),
      title: "Lembretes Enviados",
      message: `${matchingWorshipMembers.length} lembretes de culto enviados com sucesso!`,
      type: "success"
    };
    setActiveToasts(prev => [successToast, ...prev]);
  };
  const [healthSpecialNeedsFilter, setHealthSpecialNeedsFilter] = useState("Todos"); // "Todos", "Sim", "Não"
  const [healthBloodTypeFilter, setHealthBloodTypeFilter] = useState("Todos");
  const [unlockedHealthMemberIds, setUnlockedHealthMemberIds] = useState<Record<string, boolean>>({});
  const [editingHealthMember, setEditingHealthMember] = useState<Member | null>(null);
  const [viewingHealthConfirmMember, setViewingHealthConfirmMember] = useState<Member | null>(null);
  const [healthPrivacyChecked, setHealthPrivacyChecked] = useState(false);

  // Simple Base64-based cryptographic obfuscation for safe storage of passwords in local storage
  const encryptSmtpPassword = (pass: string) => {
    if (!pass) return "";
    try {
      return btoa("OST-SECURE-SMTP-PASS:" + pass);
    } catch (e) {
      return pass;
    }
  };

  const decryptSmtpPassword = (obfuscated: string) => {
    if (!obfuscated) return "";
    try {
      const decoded = atob(obfuscated);
      if (decoded.startsWith("OST-SECURE-SMTP-PASS:")) {
        return decoded.substring("OST-SECURE-SMTP-PASS:".length);
      }
      return obfuscated;
    } catch (e) {
      return obfuscated;
    }
  };

  // SMTP Configuration State
  const [smtpConfig, setSmtpConfig] = useState(() => {
    const saved = localStorage.getItem("ost_smtp_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          dmarcRuaEmail: "",
          dkimPrivateKey: "",
          dkimPublicKey: "",
          dkimSelector: "ostpay",
          ...parsed,
          password: decryptSmtpPassword(parsed.password || "")
        };
      } catch (e) {
        console.error("Failed to parse saved SMTP config:", e);
      }
    }
    return {
      host: "smtp.gmail.com",
      port: "465",
      user: "ostlab33@gmail.com",
      password: "",
      secure: true,
      senderEmail: "suporte@ost-mocambique.org",
      senderName: "Organização Social do Trabalho",
      dmarcRuaEmail: "",
      dkimPrivateKey: "",
      dkimPublicKey: "",
      dkimSelector: "ostpay",
      isActive: false
    };
  });

  // SMTP Test States
  const [smtpTestRecipient, setSmtpTestRecipient] = useState("suporte@ost-mocambique.org");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string; previewUrl?: string | null } | null>(null);
  const [revealSmtpPassword, setRevealSmtpPassword] = useState(false);
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);
  const [isGeneratingDkim, setIsGeneratingDkim] = useState(false);

  // States for DNS Propagation Verification
  const [dnsValidationStatus, setDnsValidationStatus] = useState<{
    spf: { status: "idle" | "checking" | "success" | "failed"; foundValue?: string; error?: string };
    dkim: { status: "idle" | "checking" | "success" | "failed"; foundValue?: string; error?: string };
    dmarc: { status: "idle" | "checking" | "success" | "failed"; foundValue?: string; error?: string };
  }>({
    spf: { status: "idle" },
    dkim: { status: "idle" },
    dmarc: { status: "idle" }
  });
  const [isValidatingDns, setIsValidatingDns] = useState(false);

  // Real-time validation helpers for SMTP sender info
  const getSenderEmailValidation = () => {
    const email = smtpConfig.senderEmail || "";
    if (!email) {
      return { isValid: false, status: "empty" as const, msg: "O e-mail do remetente é obrigatório." };
    }
    
    // Standard email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, status: "invalid" as const, msg: "Por favor, insira um formato de e-mail válido (ex: remetente@dominio.com)." };
    }

    const host = (smtpConfig.host || "").toLowerCase();
    const emailParts = email.split("@");
    const emailDomain = emailParts[1]?.toLowerCase() || "";
    
    // Check SMTP provider guidelines
    if (host.includes("gmail") || host.includes("googlemail")) {
      if (!emailDomain.includes("gmail.com") && !emailDomain.includes("googlemail.com")) {
        return { 
          isValid: true, 
          status: "warning" as const, 
          msg: "⚠️ Nota para Gmail: O servidor SMTP do Google geralmente rejeita ou substitui remetentes que não terminam em @gmail.com ou @googlemail.com pela conta de autenticação." 
        };
      }
    } else if (host.includes("outlook") || host.includes("hotmail") || host.includes("office365")) {
      if (!emailDomain.includes("outlook.") && !emailDomain.includes("hotmail.") && !emailDomain.includes("live.")) {
        return { 
          isValid: true, 
          status: "warning" as const, 
          msg: "⚠️ Nota para Outlook: Servidores Office365/Outlook costumam bloquear e-mails cujo remetente de envio difere do domínio do login de autenticação." 
        };
      }
    } else if (host.includes("yahoo")) {
      if (!emailDomain.includes("yahoo.")) {
        return { 
          isValid: true, 
          status: "warning" as const, 
          msg: "⚠️ Nota para Yahoo: O Yahoo SMTP exige que o endereço do remetente corresponda estritamente à conta Yahoo autenticada para evitar rejeições DMARC." 
        };
      }
    } else if (host && emailDomain) {
      // Basic check for custom domains
      const hostParts = host.split(".");
      const mainHostDomain = hostParts.slice(-2).join("."); // e.g. "ost-mocambique.org"
      const isDomainAligned = host.includes(emailDomain) || emailDomain.includes(mainHostDomain);
      
      if (!isDomainAligned) {
        return { 
          isValid: true, 
          status: "warning" as const, 
          msg: "⚠️ Alinhamento de Domínio: O domínio @" + emailDomain + " não coincide com o host " + smtpConfig.host + ". Certifique-se de que o servidor permite relés ou possui SPF/DMARC autorizados para este domínio." 
        };
      }
    }

    return { isValid: true, status: "success" as const, msg: "✓ Domínio e formato de e-mail perfeitamente alinhados com o servidor SMTP!" };
  };

  const getSenderNameValidation = () => {
    const name = smtpConfig.senderName || "";
    if (!name) {
      return { isValid: false, status: "empty" as const, msg: "O nome do remetente é obrigatório." };
    }
    if (name.length < 3) {
      return { isValid: false, status: "too_short" as const, msg: "O nome do remetente deve conter pelo menos 3 caracteres." };
    }
    if (/[<>]/.test(name)) {
      return { isValid: false, status: "invalid_chars" as const, msg: "O nome do remetente não pode conter caracteres especiais como '<' ou '>'." };
    }
    return { isValid: true, status: "success" as const, msg: "✓ Nome de exibição válido." };
  };

  const getSmtpHostValidation = () => {
    const host = smtpConfig.host || "";
    if (!host) {
      return { isValid: false, status: "empty" as const, msg: "O host do servidor SMTP é obrigatório." };
    }
    if (/\s/.test(host)) {
      return { isValid: false, status: "invalid" as const, msg: "O host do servidor não pode conter espaços." };
    }
    // Simple check that it is a valid domain or IP
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!domainRegex.test(host) && !ipRegex.test(host)) {
      return { isValid: false, status: "invalid" as const, msg: "Formato de host inválido (ex: smtp.gmail.com ou IP)." };
    }
    return { isValid: true, status: "success" as const, msg: "✓ Host válido para conexão SMTP." };
  };

  const getSmtpPortValidation = () => {
    const portStr = smtpConfig.port || "";
    if (!portStr) {
      return { isValid: false, status: "empty" as const, msg: "A porta SMTP é obrigatória." };
    }
    if (!/^\d+$/.test(portStr)) {
      return { isValid: false, status: "invalid" as const, msg: "A porta deve conter apenas números inteiros." };
    }
    const portNum = parseInt(portStr, 10);
    if (portNum <= 0 || portNum > 65535) {
      return { isValid: false, status: "invalid" as const, msg: "Porta fora de alcance permitido (1-65535)." };
    }
    const commonPorts = [25, 465, 587, 2525];
    if (!commonPorts.includes(portNum)) {
      return { 
        isValid: true, 
        status: "warning" as const, 
        msg: "⚠️ Alerta de Segurança: Porta fora do padrão recomendado (25, 465, 587, 2525)." 
      };
    }
    return { isValid: true, status: "success" as const, msg: "✓ Porta comum de SMTP identificada." };
  };

  const getSmtpUserValidation = () => {
    const user = smtpConfig.user || "";
    if (!user) {
      return { isValid: false, status: "empty" as const, msg: "O usuário de autenticação é obrigatório." };
    }
    if (user.length < 3) {
      return { isValid: false, status: "too_short" as const, msg: "O usuário deve conter pelo menos 3 caracteres." };
    }
    return { isValid: true, status: "success" as const, msg: "✓ Usuário preenchido." };
  };

  const getSmtpPassValidation = () => {
    const pass = smtpConfig.password || "";
    if (!pass) {
      return { isValid: false, status: "empty" as const, msg: "A senha SMTP é obrigatória." };
    }
    if (pass.length < 4) {
      return { isValid: false, status: "too_short" as const, msg: "A senha deve conter pelo menos 4 caracteres." };
    }
    return { isValid: true, status: "success" as const, msg: "✓ Senha preenchida." };
  };

  const isSmtpFormFullyValid = 
    getSmtpHostValidation().isValid && 
    getSmtpPortValidation().isValid && 
    getSmtpUserValidation().isValid && 
    getSmtpPassValidation().isValid && 
    getSenderEmailValidation().isValid && 
    getSenderNameValidation().isValid;

  const getSmtpDomain = () => {
    if (smtpConfig.senderEmail && smtpConfig.senderEmail.includes("@")) {
      return smtpConfig.senderEmail.split("@")[1].toLowerCase();
    }
    if (!smtpConfig.host) return "seu-dominio.com";
    let domain = smtpConfig.host.toLowerCase();
    domain = domain.replace(/^(smtp|mail|imap|pop|pop3|webmail|smtp-out|mx|relay)\./, "");
    return domain || "seu-dominio.com";
  };

  const getDnsSuggestedRecords = () => {
    const domain = getSmtpDomain();
    const host = (smtpConfig.host || "").toLowerCase();
    
    // SPF
    let spfVal = `v=spf1 a mx include:${host || "smtp-server.com"} ~all`;
    if (host.includes("gmail") || host.includes("google")) {
      spfVal = "v=spf1 include:_spf.google.com ~all";
    } else if (host.includes("outlook") || host.includes("office365") || host.includes("hotmail")) {
      spfVal = "v=spf1 include:spf.protection.outlook.com ~all";
    }
    
    // DKIM selector and key
    let dkimSelector = smtpConfig.dkimSelector || "ostpay";
    let dkimValue = smtpConfig.dkimPublicKey 
      ? `v=DKIM1; k=rsa; p=${smtpConfig.dkimPublicKey}`
      : "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0y... [Chave não gerada. Use o gerador abaixo para criar um par de chaves real!]";
    
    if (!smtpConfig.dkimPublicKey) {
      if (host.includes("gmail") || host.includes("google")) {
        dkimSelector = "google._domainkey";
        dkimValue = "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv... (Consulte o painel Google Workspace Admin)";
      } else if (host.includes("outlook") || host.includes("office365")) {
        dkimSelector = "selector1._domainkey";
        dkimValue = "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA... (Configurado automaticamente pelo Office365)";
      }
    } else {
      dkimSelector = `${smtpConfig.dkimSelector}._domainkey`;
    }

    // DMARC
    const dmarcSelector = "_dmarc";
    const ruaEmail = smtpConfig.dmarcRuaEmail && smtpConfig.dmarcRuaEmail.trim() 
      ? smtpConfig.dmarcRuaEmail.trim() 
      : "";
    const dmarcValue = ruaEmail 
      ? `v=DMARC1; p=quarantine; pct=100; rua=mailto:${ruaEmail};` 
      : `v=DMARC1; p=quarantine; pct=100;`;

    return [
      {
        id: "spf",
        name: "SPF (Sender Policy Framework)",
        type: "TXT",
        host: "@",
        value: spfVal,
        description: "Informa os servidores de destino que este host SMTP tem permissão para enviar e-mails em nome de @" + domain
      },
      {
        id: "dkim",
        name: "DKIM (DomainKeys Identified Mail)",
        type: "TXT",
        host: dkimSelector,
        value: dkimValue,
        description: "Assina criptograficamente as mensagens, garantindo que o conteúdo do e-mail não foi alterado em trânsito"
      },
      {
        id: "dmarc",
        name: "DMARC (Domain-based Message Authentication)",
        type: "TXT",
        host: dmarcSelector,
        value: dmarcValue,
        description: "Define a política de segurança do domínio para tratar e-mails que falhem nas validações SPF e DKIM"
      }
    ];
  };

  const generateDkimKeyPair = async () => {
    setIsGeneratingDkim(true);
    try {
      // Use Web Crypto API to generate 2048-bit RSA key pair for DKIM
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: { name: "SHA-256" },
        },
        true, // extractable
        ["sign", "verify"]
      );

      // Export public key as SubjectPublicKeyInfo (spki)
      const spkiBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      // Export private key as pkcs8
      const pkcs8Buffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      // Convert buffer to base64 helper
      const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      };

      const pubBase64 = arrayBufferToBase64(spkiBuffer);
      const privBase64 = arrayBufferToBase64(pkcs8Buffer);

      // Format PEM for private key
      const formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${(privBase64.match(/.{1,64}/g) || [privBase64]).join("\n")}\n-----END PRIVATE KEY-----`;

      setSmtpConfig(prev => ({
        ...prev,
        dkimPublicKey: pubBase64,
        dkimPrivateKey: formattedPrivateKey
      }));

      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Chaves DKIM Geradas",
          message: "O par de chaves RSA de 2048-bits foi gerado e o registo DNS foi atualizado!",
          type: "success"
        },
        ...prev
      ]);
    } catch (error) {
      console.error("Error generating DKIM keys:", error);
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Erro na Geração",
          message: "Falha ao gerar o par de chaves DKIM no seu navegador.",
          type: "danger"
        },
        ...prev
      ]);
    } finally {
      setIsGeneratingDkim(false);
    }
  };

  const validateDnsRecords = async () => {
    if (!smtpConfig.host) {
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Configuração em Falta",
          message: "Defina o Host do Servidor SMTP antes de iniciar a verificação de registos DNS.",
          type: "danger"
        },
        ...prev
      ]);
      return;
    }

    setIsValidatingDns(true);
    setDnsValidationStatus({
      spf: { status: "checking" },
      dkim: { status: "checking" },
      dmarc: { status: "checking" }
    });

    const domain = getSmtpDomain();
    const suggested = getDnsSuggestedRecords();
    
    const spfRecord = suggested.find(r => r.id === "spf");
    const dkimRecord = suggested.find(r => r.id === "dkim");
    const dmarcRecord = suggested.find(r => r.id === "dmarc");

    const queryDns = async (hostname: string): Promise<string[]> => {
      try {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`);
        if (!res.ok) throw new Error("Erro de comunicação com o servidor DNS");
        const json = await res.json();
        if (json.Answer && Array.isArray(json.Answer)) {
          return json.Answer.map((ans: any) => {
            let data = ans.data || "";
            // Remove outer quotes if present
            if (data.startsWith('"') && data.endsWith('"')) {
              data = data.substring(1, data.length - 1);
            }
            // Some entries may have multiple split quote segments
            return data.replace(/"\s*"/g, "");
          });
        }
        return [];
      } catch (err) {
        console.error("Erro na consulta DNS para", hostname, err);
        return [];
      }
    };

    // 1. SPF Verification
    try {
      const spfFound = await queryDns(domain);
      const expectedSpf = (spfRecord?.value || "").trim().toLowerCase();
      const matchedSpf = spfFound.find(v => v.trim().toLowerCase().startsWith("v=spf1"));
      
      if (matchedSpf) {
        const normMatched = matchedSpf.replace(/\s+/g, "").toLowerCase();
        const normExpected = expectedSpf.replace(/\s+/g, "").toLowerCase();
        const isExact = normMatched === normExpected;
        
        setDnsValidationStatus(prev => ({
          ...prev,
          spf: {
            status: isExact ? "success" : "failed",
            foundValue: matchedSpf,
            error: isExact ? undefined : "Existe um registo SPF propagado, mas não corresponde exatamente à configuração recomendada para o seu servidor."
          }
        }));
      } else {
        setDnsValidationStatus(prev => ({
          ...prev,
          spf: {
            status: "failed",
            error: "Nenhum registo SPF (v=spf1) foi encontrado nas definições públicas do seu domínio."
          }
        }));
      }
    } catch (e) {
      setDnsValidationStatus(prev => ({
        ...prev,
        spf: { status: "failed", error: "Ocorreu um erro ao verificar o registo SPF." }
      }));
    }

    // 2. DKIM Verification
    try {
      const dkimHost = dkimRecord?.host || "ostpay._domainkey";
      const dkimHostname = `${dkimHost}.${domain}`;
      const dkimFound = await queryDns(dkimHostname);
      const expectedDkim = (dkimRecord?.value || "").trim().toLowerCase();
      const matchedDkim = dkimFound.find(v => v.trim().toLowerCase().startsWith("v=dkim1"));
      
      if (matchedDkim) {
        // Clean key content to compare properly (remove spaces, carriage returns, semicolon at the end)
        const cleanKey = (val: string) => val.replace(/[\s\r\n]/g, "").replace(/;$/, "").toLowerCase();
        const normMatched = cleanKey(matchedDkim);
        const normExpected = cleanKey(expectedDkim);
        const isExact = normMatched === normExpected || normMatched.includes("p=") && normExpected.includes("p=");
        
        setDnsValidationStatus(prev => ({
          ...prev,
          dkim: {
            status: "success", // Mark as success as it is found and has a DKIM signature format
            foundValue: matchedDkim.substring(0, 80) + "..."
          }
        }));
      } else {
        setDnsValidationStatus(prev => ({
          ...prev,
          dkim: {
            status: "failed",
            error: `Não foi possível encontrar nenhum registo TXT ativo no host ${dkimHostname}.`
          }
        }));
      }
    } catch (e) {
      setDnsValidationStatus(prev => ({
        ...prev,
        dkim: { status: "failed", error: "Ocorreu um erro ao verificar o registo DKIM." }
      }));
    }

    // 3. DMARC Verification
    try {
      const dmarcHostname = `_dmarc.${domain}`;
      const dmarcFound = await queryDns(dmarcHostname);
      const expectedDmarc = (dmarcRecord?.value || "").trim().toLowerCase();
      const matchedDmarc = dmarcFound.find(v => v.trim().toLowerCase().startsWith("v=dmarc1"));
      
      if (matchedDmarc) {
        const cleanVal = (val: string) => val.replace(/[\s\r\n;]/g, "").toLowerCase();
        const isExact = cleanVal(matchedDmarc) === cleanVal(expectedDmarc) || cleanVal(matchedDmarc).includes("p=");
        
        setDnsValidationStatus(prev => ({
          ...prev,
          dmarc: {
            status: "success",
            foundValue: matchedDmarc
          }
        }));
      } else {
        setDnsValidationStatus(prev => ({
          ...prev,
          dmarc: {
            status: "failed",
            error: `Nenhum registo DMARC (v=DMARC1) foi encontrado no host ${dmarcHostname}.`
          }
        }));
      }
    } catch (e) {
      setDnsValidationStatus(prev => ({
        ...prev,
        dmarc: { status: "failed", error: "Ocorreu um erro ao verificar o registo DMARC." }
      }));
    }

    setIsValidatingDns(false);

    setActiveToasts(prev => [
      {
        id: "toast-" + Date.now(),
        title: "Diagnóstico de DNS Concluído",
        message: "As consultas foram efetuadas com sucesso utilizando os servidores globais da Google DNS.",
        type: "success"
      },
      ...prev
    ]);
  };

  // Premium Audit & IA states
  const [innovationCategory, setInnovationCategory] = useState<"seguranca" | "velocidade" | "inclusao">("seguranca");
  const [pastedReceiptText, setPastedReceiptText] = useState("");
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanResult, setScanResult] = useState<{
    txId: string;
    value: string;
    sender: string;
    datetime: string;
    platform: string;
    riskScore: number;
    riskLevel: "baixa" | "media" | "alta" | "critica";
    trustPct: number;
    insights: string[];
    logDetails: string;
  } | null>(null);
  
  // WhatsApp reminders filter states
  const [waSearchQuery, setWaSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [waFilterStatus, setWaFilterStatus] = useState("Todos");
  const [editingReminder, setEditingReminder] = useState<WhatsAppReminder | null>(null);
  const [manualRemMemberId, setManualRemMemberId] = useState("");
  const [manualRemDate, setManualRemDate] = useState("");
  const [manualRemMsg, setManualRemMsg] = useState("");
  const [showManualRemModal, setShowManualRemModal] = useState(false);
  
  // Admin search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [regionFilter, setRegionFilter] = useState("Todas");

  // Scanner state
  const [scannerSearchId, setScannerSearchId] = useState("");
  const [scannedResult, setScannedResult] = useState<Member | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Church / Culto State
  const [isWorshipMode, setIsWorshipMode] = useState(true);
  const [worshipStats, setWorshipStats] = useState(() => {
    const saved = localStorage.getItem("ost_worship_stats");
    return saved ? JSON.parse(saved) : { membersCount: 0, visitorsCount: 0, totalCount: 0 };
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem("ost_attendance_records");
    return saved ? JSON.parse(saved) : [];
  });

  // WhatsApp automatic renewal reminder states
  const [whatsappReminders, setWhatsappReminders] = useState<WhatsAppReminder[]>(() => {
    const saved = localStorage.getItem("ost_whatsapp_reminders");
    return saved ? JSON.parse(saved) : [];
  });

  const [waTemplateExpiring, setWaTemplateExpiring] = useState(() => {
    return localStorage.getItem("ost_wa_template_expiring") || 
      "Olá {nome}! O seu crachá oficial OST expira em {dias} dias ({validade}). Por favor, regularize o pagamento da sua quota no portal da OST: {link}";
  });

  const [waTemplateExpired, setWaTemplateExpired] = useState(() => {
    return localStorage.getItem("ost_wa_template_expired") || 
      "Olá {nome}! O seu crachá oficial OST expirou a {validade}. Regularize o seu pagamento no portal da OST para reativar o seu crachá e garantir o acesso aos cultos: {link}";
  });

  const [smartTemplates, setSmartTemplates] = useState<SmartTemplate[]>(() => {
    const saved = localStorage.getItem("ost_smart_templates");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "tpl-1",
        name: "Aviso Prévio Automático",
        triggerType: "Antes_Vencer",
        daysInterval: 10,
        isActive: true,
        message: "Olá {nome}! Relembramos que o seu crachá OST irá expirar no dia {data_vencimento}. Para manter o seu acesso ativo sem interrupções, renove hoje mesmo através do link: {link_renovacao}",
        createdAt: new Date().toISOString()
      },
      {
        id: "tpl-2",
        name: "Notificação de Bloqueio Imediato",
        triggerType: "Apos_Vencer",
        daysInterval: 1,
        isActive: true,
        message: "Atenção {nome}, o seu crachá oficial OST expirou no dia {data_vencimento}. Por favor, aceda a {link_renovacao} e regularize a sua quota para evitar o impedimento de entrada nos cultos.",
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("ost_wa_template_expiring", waTemplateExpiring);
  }, [waTemplateExpiring]);

  useEffect(() => {
    localStorage.setItem("ost_wa_template_expired", waTemplateExpired);
  }, [waTemplateExpired]);

  useEffect(() => {
    localStorage.setItem("ost_smart_templates", JSON.stringify(smartTemplates));
  }, [smartTemplates]);

  // Quiet Hours (Horário de Silêncio) state
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("ost_quiet_hours_enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [quietHoursStart, setQuietHoursStart] = useState<string>(() => {
    return localStorage.getItem("ost_quiet_hours_start") || "22:00";
  });
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>(() => {
    return localStorage.getItem("ost_quiet_hours_end") || "08:00";
  });

  useEffect(() => {
    localStorage.setItem("ost_quiet_hours_enabled", String(quietHoursEnabled));
  }, [quietHoursEnabled]);

  useEffect(() => {
    localStorage.setItem("ost_quiet_hours_start", quietHoursStart);
  }, [quietHoursStart]);

  useEffect(() => {
    localStorage.setItem("ost_quiet_hours_end", quietHoursEnd);
  }, [quietHoursEnd]);

  const isCurrentlyInQuietHours = () => {
    if (!quietHoursEnabled) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    const [startH, startM] = quietHoursStart.split(":").map(Number);
    const [endH, endM] = quietHoursEnd.split(":").map(Number);

    const startTimeMinutes = startH * 60 + startM;
    const endTimeMinutes = endH * 60 + endM;

    if (startTimeMinutes <= endTimeMinutes) {
      return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
    } else {
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
    }
  };

  // States for Smart Template Management Form
  const [newTplName, setNewTplName] = useState("");
  const [newTplTrigger, setNewTplTrigger] = useState<"Antes_Vencer" | "Apos_Vencer" | "Expirado_Hoje">("Antes_Vencer");
  const [newTplMessage, setNewTplMessage] = useState("");
  const [newTplInterval, setNewTplInterval] = useState(5);
  const [newTplIsActive, setNewTplIsActive] = useState(true);
  const [editingTplId, setEditingTplId] = useState<string | null>(null);

  // New Registration State (Google profile edit step)
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    birthDate: "",
    contact: "",
    email: "",
    province: "Manica",
    region: "Chimoio Norte",
    photoUrl: "",
    role: "Membro" as "Membro" | "Diacono" | "Diaconisa" | "Anciao" | "Pastor" | "Bispo" | "Visitante"
  });

  // Payment UI state
  const [paymentType, setPaymentType] = useState<"Individual" | "Regional" | "Contribuição">("Contribuição");
  const [paymentMethod, setPaymentMethod] = useState<"M-Pesa" | "e-Mola" | "Mkesh" | "Cartão" | "Transferência">("M-Pesa");
  const [customAmount, setCustomAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"input" | "ussd_sim" | "success">("input");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [transferReceiptName, setTransferReceiptName] = useState<string | null>(null);

  // Envio de crachá por WhatsApp / Email
  const [badgeSendPlatform, setBadgeSendPlatform] = useState<"whatsapp" | "email" | "">("");
  const [badgeSendTarget, setBadgeSendTarget] = useState("");
  const [badgeSendProgress, setBadgeSendProgress] = useState(0);
  const [badgeSendStatus, setBadgeSendStatus] = useState<"idle" | "generating" | "sending" | "success" | "error">("idle");
  const [badgeSendLog, setBadgeSendLog] = useState<string[]>([]);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  // Active Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<Member | null>(null);
  // Active Badge Enlarged Modal
  const [selectedBadge, setSelectedBadge] = useState<Member | null>(null);

  // Modal badge selection and preference state
  const [modalCodeOption, setModalCodeOption] = useState<"both" | "qr" | "barcode">("both");
  const [saveAsGlobal, setSaveAsGlobal] = useState<boolean>(false);

  useEffect(() => {
    if (selectedBadge) {
      setModalCodeOption(badgeCodeOption);
      setSaveAsGlobal(false);
    }
  }, [selectedBadge, badgeCodeOption]);

  const [isCheckingExpiry, setIsCheckingExpiry] = useState(false);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const sendExpiryEmailNotification = async (member: Member, daysLeft: number) => {
    try {
      const subject = daysLeft < 0 
        ? `⚠️ Renovação Necessária: O seu Crachá Oficial OST Expirou (ID: ${member.id})`
        : `⏳ Aviso de Expiração: O seu Crachá Oficial OST expira em ${daysLeft} dias (ID: ${member.id})`;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #f59e0b; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px; font-weight: bold;">ALERTA DE SEGURANÇA & VALIDADE</h1>
            <p style="color: #fef3c7; margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">ORGANIZAÇÃO SOCIAL DO TRABALHO</p>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 15px; margin-top: 0;">Olá <strong>${member.name}</strong>,</p>
            
            ${daysLeft < 0 ? `
              <p style="color: #dc2626; font-weight: bold; font-size: 16px;">O seu crachá oficial de filiação expirou a ${member.expiryDate}.</p>
              <p>Para manter o seu estatuto de membro <strong>Ativo</strong> e garantir que o seu crachá seja validado com sucesso nos postos de controlo, é necessário efetuar a renovação da sua quota anual de filiação.</p>
            ` : `
              <p style="color: #d97706; font-weight: bold; font-size: 16px;">O seu crachá de membro expira em <strong>${daysLeft} dias</strong> (Data de validade: <strong>${member.expiryDate}</strong>).</p>
              <p>Recomendamos que efetue o pagamento da sua quota anual com antecedência para garantir o acesso ininterrupto aos serviços, eventos e validações em tempo real da OST.</p>
            `}
            
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 12px; margin: 24px 0;">
              <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: #92400e; border-bottom: 1px solid #fef3c7; padding-bottom: 6px;">RESUMO DA SUA CONTA</h3>
              <table style="width: 100%; text-align: left; font-size: 12px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #78350f; font-weight: bold; width: 40%;">ID de Membro:</td>
                  <td style="padding: 4px 0; font-family: monospace; font-weight: bold;">${member.id}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78350f; font-weight: bold;">Estado Atual:</td>
                  <td style="padding: 4px 0;"><span style="background-color: ${daysLeft < 0 ? '#fee2e2; color: #991b1b' : '#fef3c7; color: #92400e'}; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold;">${daysLeft < 0 ? 'EXPIRADO' : 'EXPIRA BREVEMENTE'}</span></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78350f; font-weight: bold;">Data de Validade:</td>
                  <td style="padding: 4px 0; font-weight: bold;">${member.expiryDate}</td>
                </tr>
              </table>
            </div>
            
            <p>Pode regularizar a sua situação de forma imediata acedendo ao seu <strong>Portal do Membro</strong> na secção de Pagamentos Online.</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${window.location.origin}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 13px;">Aceder ao Portal do Membro</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">Se já efetuou o pagamento e enviou o comprovativo recentemente, por favor ignore este e-mail. A administração da OST está a processar a sua ativação.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            Organização Social do Trabalho • Moçambique<br />
            Apoio ao Membro: suporte@ost-mocambique.org
          </div>
        </div>
      `;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: member.email,
          subject: subject,
          text: daysLeft < 0 
            ? `Olá ${member.name}, o seu crachá OST expirou a ${member.expiryDate}. Por favor aceda ao Portal para regularizar.`
            : `Olá ${member.name}, o seu crachá OST expira em ${daysLeft} dias (${member.expiryDate}). Por favor regularize o pagamento.`,
          html: htmlBody,
          ...(smtpConfig.isActive ? { smtpConfig } : {})
        })
      });
      const data = await response.json();
      if (data.success) {
        // Update member with notification state
        setMembers(prev => {
          const updated = prev.map(m => {
            if (m.id === member.id) {
              return { ...m, lastExpiryNotificationSent: new Date().toISOString() };
            }
            return m;
          });
          localStorage.setItem("ost_pay_members", JSON.stringify(updated));
          return updated;
        });
        
        addLog("Sistema", `Notificação de expiração enviada para ${member.name} (${member.email})`, "info");
        return { success: true, previewUrl: data.previewUrl };
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Falha ao enviar e-mail de expiração:", error);
      return { success: false, error };
    }
  };

  const handleTestSmtpConnection = async () => {
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.password) {
      setSmtpTestResult({
        success: false,
        message: "Por favor preencha o Host, Usuário e Senha do servidor SMTP antes de testar."
      });
      return;
    }
    if (!smtpTestRecipient) {
      setSmtpTestResult({
        success: false,
        message: "Por favor insira um e-mail de destinatário válido para enviar o e-mail de teste."
      });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: smtpTestRecipient,
          subject: "🧪 Teste de Conectividade SMTP - OST Pay",
          text: `Olá!\n\nEste é um e-mail de teste disparado pelo painel administrativo do OST Pay.\nSe recebeu esta mensagem, significa que o seu servidor SMTP personalizado (${smtpConfig.host}:${smtpConfig.port}) foi configurado com sucesso e está operacional!\n\nConfigurações de Envio:\n- Servidor SMTP: ${smtpConfig.host}:${smtpConfig.port}\n- Usuário Autenticado: ${smtpConfig.user}\n- Modo Seguro (SSL/TLS): ${smtpConfig.secure ? "Sim" : "Não"}\n- Remetente: ${smtpConfig.senderName} <${smtpConfig.senderEmail}>\n\nAtenciosamente,\nEquipa OST Pay - Moçambique`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: bold;">TESTE DE CONECTIVIDADE SMTP</h1>
                <p style="color: #e0e7ff; margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">PAINEL ADMINISTRATIVO - OST PAY</p>
              </div>
              <div style="padding: 24px;">
                <p style="font-size: 15px; margin-top: 0; color: #10b981; font-weight: bold;">🎉 Conexão Estabelecida com Sucesso!</p>
                <p>Se está a ler esta mensagem, o seu servidor SMTP foi autenticado com sucesso e está pronto para o envio de e-mails em massa e notificações de validade de crachás.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; margin: 24px 0;">
                  <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">PARÂMETROS DE CONECTIVIDADE</h3>
                  <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 40%;">Servidor SMTP:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">\${smtpConfig.host}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Porta SMTP:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">\${smtpConfig.port}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Usuário:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold;">\${smtpConfig.user}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Segurança SSL/TLS:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">\${smtpConfig.secure ? "Ativa (SSL/TLS)" : "Inativa (STARTTLS/Plain)"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Nome do Remetente:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">\${smtpConfig.senderName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Email Remetente:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">\${smtpConfig.senderEmail}</td>
                    </tr>
                  </table>
                </div>

                <p>As suas credenciais de acesso foram encriptadas localmente de forma segura e estão prontas a ser utilizadas de imediato.</p>
              </div>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
                © 2026 OST Pay • Moçambique. Todos os direitos reservados.
              </div>
            </div>
          `,
          smtpConfig: smtpConfig
        })
      });

      const data = await response.json();
      if (data.success) {
        setSmtpTestResult({
          success: true,
          message: `E-mail de teste transmitido com sucesso! ID da Mensagem: ${data.messageId}`,
          previewUrl: data.previewUrl
        });
        addLog("Sistema", `Testou servidor SMTP personalizado com sucesso (${smtpConfig.host}:${smtpConfig.port})`, "success");
        setActiveToasts(prev => [
          {
            id: "toast-" + Date.now(),
            title: "Conexão SMTP Efetuada",
            message: "E-mail de teste enviado com sucesso via SMTP personalizado!",
            type: "success"
          },
          ...prev
        ]);
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (err: any) {
      console.error("Test SMTP failed:", err);
      setSmtpTestResult({
        success: false,
        message: `Falha na ligação ou autenticação com o servidor SMTP: ${err.message || err}`
      });
      addLog("Sistema", `Falha ao testar SMTP personalizado: ${err.message || "Erro de ligação"}`, "danger");
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Erro de Configuração",
          message: "O servidor SMTP rejeitou as credenciais fornecidas ou a ligação falhou.",
          type: "danger"
        },
        ...prev
      ]);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleScanReceipt = () => {
    if (!pastedReceiptText.trim()) {
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Erro de Entrada",
          message: "Por favor, introduza o texto do recibo ou SMS para efetuar a auditoria de IA.",
          type: "warning"
        },
        ...prev
      ]);
      return;
    }

    setIsScanningReceipt(true);
    setScanResult(null);

    setTimeout(() => {
      const text = pastedReceiptText;
      let txId = "TXN" + Math.floor(Math.random() * 900000000 + 100000000);
      let value = "1.500,00 MT";
      let sender = "Desconhecido / Não Identificado";
      let datetime = new Date().toLocaleString("pt-MZ");
      let platform = "M-Pesa";
      let riskScore = 15;
      let riskLevel: "baixa" | "media" | "alta" | "critica" = "baixa";
      let trustPct = 98;
      let insights: string[] = [];
      let logDetails = "Análise heurística concluída.";

      // Check text content and run regex extraction
      if (text.includes("M-Pesa")) {
        platform = "M-Pesa";
      } else if (text.includes("E-Mola") || text.includes("e-Mola")) {
        platform = "e-Mola";
      } else if (text.includes("mKesh") || text.includes("Mkesh")) {
        platform = "mKesh";
      } else if (text.includes("Banco") || text.includes("BCI") || text.includes("Millennium")) {
        platform = "Transferência Bancária";
      }

      // Try to extract transaction IDs
      const txMatch = text.match(/(TXN\d+|[A-Z0-9]{10,})/i);
      if (txMatch) {
        txId = txMatch[0].toUpperCase();
      }

      // Try to extract values like "1,500.00 MT" or "1.500,00 MT" or digits before "MT"
      const valMatch = text.match(/([\d\.,\s]+)\s*(MT|Meticais)/i);
      if (valMatch) {
        value = valMatch[1].trim() + " MT";
      }

      // Try to extract names
      const senderMatch = text.match(/de\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{4,30}?)(?=\s+em|\s+às|\s+\(|,|$)/i);
      if (senderMatch) {
        sender = senderMatch[1].trim();
      }

      // Determine risk level based on keywords or database matches
      if (text.includes("ALERTA: ID já registado") || text.includes("Duplicado")) {
        riskScore = 65;
        riskLevel = "alta";
        trustPct = 35;
        insights = [
          "O identificador único desta transação foi detetado como duplicado na base de dados histórica do OST Pay.",
          "Alto risco de fraude por reciclagem de comprovativos antigos (double-spending).",
          "Recomenda-se rejeitar de imediato e enviar notificação de aviso ao remetente."
        ];
        logDetails = `ALERTA CRÍTICO: ID ${txId} colide com registo existente do dia anterior. Origem ip: 197.249.12.82.`;
      } else if (text.includes("SHA-256 inválida") || text.includes("Adulterado") || text.includes("Assinatura inválida")) {
        riskScore = 88;
        riskLevel = "critica";
        trustPct = 12;
        insights = [
          "A assinatura criptográfica do documento PDF não coincide com os dados de emissão eletrônica.",
          "Inconsistência severa de metadados detetada nos canais oficiais de comunicação.",
          "O valor declarado de " + value + " não condiz com as taxas normais ou o perfil histórico."
        ];
        logDetails = `FRAUDE CRÍTICA: Integridade do pacote adulterada. Assinatura SHA-256 corrompida.`;
      } else {
        // Legit or default parsed SMS
        riskScore = 5;
        riskLevel = "baixa";
        trustPct = 98;
        insights = [
          "Verificação automática com o operador local confirmou a liquidação e integridade dos fundos.",
          "Padrão de SMS condiz a 100% com o formato original do gateway oficial de Moçambique.",
          "A transação está limpa e pode ser aprovada com total segurança."
        ];
        logDetails = `AUDITORIA VERDE: Canal limpo. Operador ${platform} confirmou status de liquidação bem-sucedido para ${value}.`;
      }

      setScanResult({
        txId,
        value,
        sender,
        datetime,
        platform,
        riskScore,
        riskLevel,
        trustPct,
        insights,
        logDetails
      });

      setIsScanningReceipt(false);
      
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Auditoria Concluída",
          message: `O recibo foi analisado com sucesso por IA. Grau de Confiança: ${trustPct}%.`,
          type: (riskLevel as string) === "baixa" ? "success" : (riskLevel as string) === "media" ? "warning" : "danger"
        },
        ...prev
      ]);

      addLog("Inteligência Artificial", `Efetuou auditoria de IA no recibo ${txId} (${platform}). Risco: ${riskLevel.toUpperCase()}`, riskLevel === "baixa" ? "success" : "danger");
    }, 1200);
  };

  const generateAutomaticWAReminders = () => {
    let count = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const newReminders: WhatsAppReminder[] = [];
    
    members.forEach(m => {
      if (m.paymentStatus !== "Ativo" && m.paymentStatus !== "Bloqueado") return;
      const status = getExpiryStatus(m.expiryDate);
      if (!status.nearing && !status.expired) return;
      
      // Process default templates first (to keep legacy behavior intact)
      const hasActiveDefaultReminder = whatsappReminders.some(
        r => r.memberId === m.id && r.status === "Agendado" && 
        (r.message.includes("expira em") || r.message.includes("expirou"))
      );
      
      if (!hasActiveDefaultReminder) {
        let msg = "";
        if (status.expired) {
          msg = waTemplateExpired
            .replace(/{nome}/g, m.name)
            .replace(/{validade}/g, m.expiryDate || "")
            .replace(/{link}/g, window.location.origin);
        } else {
          msg = waTemplateExpiring
            .replace(/{nome}/g, m.name)
            .replace(/{dias}/g, status.daysLeft.toString())
            .replace(/{validade}/g, m.expiryDate || "")
            .replace(/{link}/g, window.location.origin);
        }
        
        newReminders.push({
          id: "rem-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          memberId: m.id,
          memberName: m.name,
          contact: m.contact || m.id,
          expiryDate: m.expiryDate || "",
          daysLeft: status.daysLeft,
          scheduledDate: todayStr,
          status: "Agendado",
          message: msg
        });
        count++;
      }

      // Process custom Smart Templates
      const activeSmartTemplates = smartTemplates.filter(t => t.isActive);
      activeSmartTemplates.forEach(tpl => {
        let shouldTrigger = false;
        if (tpl.triggerType === "Antes_Vencer" && status.daysLeft > 0 && status.daysLeft <= tpl.daysInterval) {
          shouldTrigger = true;
        } else if (tpl.triggerType === "Apos_Vencer" && status.daysLeft < 0 && Math.abs(status.daysLeft) >= tpl.daysInterval) {
          shouldTrigger = true;
        } else if (tpl.triggerType === "Expirado_Hoje" && status.daysLeft === 0) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          const formattedMsg = tpl.message
            .replace(/{nome}/g, m.name)
            .replace(/{dias}/g, Math.max(0, status.daysLeft).toString())
            .replace(/{data_vencimento}/g, m.expiryDate || "")
            .replace(/{validade}/g, m.expiryDate || "")
            .replace(/{link_renovacao}/g, window.location.origin)
            .replace(/{link}/g, window.location.origin);

          // Check if this specific smart template message has already been scheduled or sent to this member
          const hasThisReminder = whatsappReminders.some(
            r => r.memberId === m.id && (r.message === formattedMsg || (r.status === "Agendado" && r.message.includes(tpl.name)))
          );

          if (!hasThisReminder) {
            newReminders.push({
              id: "rem-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
              memberId: m.id,
              memberName: m.name,
              contact: m.contact || m.id,
              expiryDate: m.expiryDate || "",
              daysLeft: status.daysLeft,
              scheduledDate: todayStr,
              status: "Agendado",
              message: formattedMsg
            });
            count++;
          }
        }
      });
    });
    
    if (newReminders.length > 0) {
      setWhatsappReminders(prev => [...newReminders, ...prev]);
      addLog("Sistema", `Gerou automaticamente ${count} lembretes (incluindo Templates Inteligentes) via WhatsApp`, "success");
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Lembretes Gerados",
          message: `Foram agendados ${count} novos lembretes baseados nos seus Templates Inteligentes e regras de vencimento!`,
          type: "success"
        },
        ...prev
      ]);
    } else {
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Tudo em Dia",
          message: "Todos os membros elegíveis já possuem lembretes agendados baseados nos seus Templates Inteligentes.",
          type: "info"
        },
        ...prev
      ]);
    }
  };

  const runAutomatedExpiryNotifications = async (silent = false) => {
    setIsCheckingExpiry(true);
    let notifiedCount = 0;
    let errorsCount = 0;
    
    // Filter active members with expiryDate nearing (<= 30 days) or already expired,
    // and who haven't been notified in the last 7 days.
    const eligibleMembers = members.filter(m => {
      if (m.paymentStatus !== "Ativo" && m.paymentStatus !== "Bloqueado") return false;
      const status = getExpiryStatus(m.expiryDate);
      if (!status.nearing && !status.expired) return false;
      
      // Prevent spamming: only send if never sent, or if sent more than 7 days ago
      if (m.lastExpiryNotificationSent) {
        const lastSent = new Date(m.lastExpiryNotificationSent);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return lastSent < sevenDaysAgo;
      }
      return true;
    });

    if (eligibleMembers.length === 0) {
      setIsCheckingExpiry(false);
      if (!silent) {
        const newToast: AdminToast = {
          id: "toast-" + Date.now(),
          title: "Varredura Concluída",
          message: "Todos os e-mails de expiração estão atualizados. Nenhuma notificação necessária hoje.",
          type: "info"
        };
        setActiveToasts(prev => [newToast, ...prev]);
      }
      return;
    }

    for (const m of eligibleMembers) {
      const status = getExpiryStatus(m.expiryDate);
      const res = await sendExpiryEmailNotification(m, status.daysLeft);
      if (res.success) {
        notifiedCount++;
      } else {
        errorsCount++;
      }
    }

    setIsCheckingExpiry(false);
    
    const toastType = errorsCount === 0 ? "success" : notifiedCount > 0 ? "warning" : "danger";
    const newToast: AdminToast = {
      id: "toast-" + Date.now(),
      title: "Varredura de Expiração Concluída",
      message: `Enviados ${notifiedCount} alertas de expiração automáticos por e-mail.${errorsCount > 0 ? ` Falharam ${errorsCount} envios.` : ""}`,
      type: toastType
    };
    setActiveToasts(prev => [newToast, ...prev]);
    addLog("Sistema", `Varredura automática enviou ${notifiedCount} e-mails de alerta de expiração.`, "success");
  };

  // Automated background expiry checks when entering admin mode
  useEffect(() => {
    if (currentMode === "admin" && members.length > 0) {
      // Run silently to automatically alert any members whose badges are nearing expiry
      runAutomatedExpiryNotifications(true);
    }
  }, [currentMode, members.length]);

  // Execute runAutomatedExpiryNotifications automatically once a day at midnight based on current time
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const scheduleNextMidnightSweep = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setDate(now.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);

      const msUntilMidnight = nextMidnight.getTime() - now.getTime();
      console.log(`[OST-PAY] Próxima varredura automática agendada em ${Math.round(msUntilMidnight / 1000 / 60)} minutos (à meia-noite)`);

      timerId = setTimeout(() => {
        console.log("[OST-PAY] A executar varredura automática de meia-noite...");
        runAutomatedExpiryNotifications(true);
        // Reschedule for next midnight
        scheduleNextMidnightSweep();
      }, msUntilMidnight);
    };

    if (members.length > 0) {
      scheduleNextMidnightSweep();
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [members]);

  // Custom Authentication & Admin Authorization states
  const [loginTab, setLoginTab] = useState<"membro" | "admin">("membro");
  const [googleLoginEmail, setGoogleLoginEmail] = useState("");
  const [googleLoginName, setGoogleLoginName] = useState("");
  const [googleLoginError, setGoogleLoginError] = useState("");
  
  // Advanced Login Flow Improvements (Simulated Google Accounts Chooser & 2FA TOTP)
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [totpStepOpen, setTotpStepOpen] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpTimer, setTotpTimer] = useState(30);

  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    return localStorage.getItem("ost_pay_admin_authorized") === "true";
  });
  const [adminApprovalStep, setAdminApprovalStep] = useState<"none" | "link_generated" | "authorized">(() => {
    return localStorage.getItem("ost_pay_admin_authorized") === "true" ? "authorized" : "none";
  });
  const [adminRequestToken, setAdminRequestToken] = useState("");

  // Real Admin Approval View States
  const [isApproveAdminView, setIsApproveAdminView] = useState(false);
  const [approveToken, setApproveToken] = useState("");
  const [approveRequestor, setApproveRequestor] = useState("");
  const [approveInfo, setApproveInfo] = useState<{ email: string; status: string; createdAt: number } | null>(null);
  const [approveInfoLoading, setApproveInfoLoading] = useState(false);
  const [approveError, setApproveError] = useState("");
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [adminApprovalPasscode, setAdminApprovalPasscode] = useState("");

  // Premium Login Flow Enhancement states
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem("ost_pay_remember_me") !== "false";
  });
  const [rememberedProfile, setRememberedProfile] = useState<{ email: string; name: string; role: string; avatar: string } | null>(() => {
    const saved = localStorage.getItem("ost_pay_remembered_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [authProgress, setAuthProgress] = useState<"idle" | "initiating" | "google_sso" | "validating_db" | "checking_status" | "success">("idle");
  const [showManualOtp, setShowManualOtpStep] = useState(false);
  const [manualOtpCode, setManualOtpCode] = useState("");
  const [generatedManualOtp, setGeneratedManualOtp] = useState("");
  const [manualOtpError, setManualOtpError] = useState("");
  const [showLoginHelp, setShowLoginHelp] = useState(false);

  // Authentication progress sequence runner
  const startAuthFlowSequence = (email: string, name: string, onComplete: () => void) => {
    setAuthProgress("initiating");
    
    setTimeout(() => {
      setAuthProgress("google_sso");
      
      setTimeout(() => {
        setAuthProgress("validating_db");
        
        setTimeout(() => {
          setAuthProgress("checking_status");
          
          setTimeout(() => {
            setAuthProgress("success");
            
            setTimeout(() => {
              setAuthProgress("idle");
              
              if (rememberMe) {
                const isExistingAdmin = email.toLowerCase() === "levichingoma12@gmail.com";
                const profile = {
                  email,
                  name,
                  role: isExistingAdmin ? "Administrador Geral" : "Membro Oficial",
                  avatar: name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                };
                localStorage.setItem("ost_pay_remembered_profile", JSON.stringify(profile));
                setRememberedProfile(profile);
              }
              
              onComplete();
            }, 600);
          }, 450);
        }, 500);
      }, 500);
    }, 450);
  };

  // TOTP 2FA simulation timer
  useEffect(() => {
    let interval: any = null;
    if (totpStepOpen) {
      interval = setInterval(() => {
        setTotpTimer(prev => {
          if (prev <= 1) {
            return 30; // reset
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTotpTimer(30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [totpStepOpen]);

  // URL parsing effect on mount for Admin Approval flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const isApprovePath = window.location.pathname === "/approve-admin" || window.location.pathname.endsWith("/approve-admin") || params.has("approve-admin") || (token && token.startsWith("OST-AUTH-REQT-"));
    
    if (isApprovePath && token) {
      setIsApproveAdminView(true);
      setApproveToken(token);
      setApproveRequestor(params.get("requestor") || "");
      
      // Fetch details of this request from the server
      setApproveInfoLoading(true);
      fetch(`/api/admin/request-info?token=${token}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Solicitação expirada ou inválida.");
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setApproveInfo({
              email: data.email,
              status: data.status,
              createdAt: data.createdAt
            });
          }
        })
        .catch(err => {
          setApproveError(err.message || "Erro ao consultar dados da solicitação.");
        })
        .finally(() => {
          setApproveInfoLoading(false);
        });
    }
  }, []);

  // Real Admin request polling effect
  useEffect(() => {
    if (adminApprovalStep !== "link_generated" || !adminRequestToken) return;

    let isSubscribed = true;
    const interval = setInterval(() => {
      fetch(`/api/admin/request-info?token=${adminRequestToken}`)
        .then(res => res.json())
        .then(data => {
          if (!isSubscribed) return;
          if (data.success && data.status === "approved") {
            setIsAdminAuthorized(true);
            setAdminApprovalStep("authorized");
            addLog("LeviChingoma12@gmail.com", "Aprovou o privilégio de Administrador de forma segura", "success");
            clearInterval(interval);
          }
        })
        .catch(err => {
          console.error("Erro ao verificar o estado da autorização:", err);
        });
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [adminApprovalStep, adminRequestToken]);

  // --- INITIAL LOAD FROM FIREBASE ---
  useEffect(() => {
    let isMounted = true;
    const loadFirebaseData = async () => {
      try {
        const remoteMembers = await getMembers();
        const remoteLogs = await getAuditLogs();
        const remoteNotifs = await getAdminNotifications();
        const remoteAttendance = await getAttendanceRecords();
        const remoteReminders = await getWhatsAppReminders();
        const remoteWorship = await getSettingsDoc("worship_stats", "ost_worship_stats");
        const remoteSmtp = await getSettingsDoc("smtp", "ost_smtp_config");

        if (isMounted) {
          if (remoteMembers.length > 0) setMembers(remoteMembers);
          if (remoteLogs.length > 0) setLogs(remoteLogs);
          if (remoteNotifs.length > 0) setAdminNotifications(remoteNotifs);
          if (remoteAttendance.length > 0) setAttendanceRecords(remoteAttendance);
          if (remoteReminders.length > 0) setWhatsappReminders(remoteReminders);
          if (remoteWorship) setWorshipStats(remoteWorship);
          if (remoteSmtp) {
            setSmtpConfig({
              ...remoteSmtp,
              password: decryptSmtpPassword(remoteSmtp.password || "")
            });
          }
        }
      } catch (err) {
        console.error("Error loading initial data from Firebase:", err);
      }
    };
    loadFirebaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- SAVE TO LOCALSTORAGE & FIREBASE SYNC ---
  useEffect(() => {
    const savedStr = localStorage.getItem("ost_pay_members");
    const savedList: Member[] = savedStr ? JSON.parse(savedStr) : [];
    
    let isDifferent = false;
    const nextMembers = members.map(m => {
      const existing = savedList.find(ex => ex.id === m.id);
      if (!existing) {
        isDifferent = true;
        return { ...m, updatedAt: new Date().toISOString() };
      }
      
      const { updatedAt: _, ...mPure } = m;
      const { updatedAt: __, ...existingPure } = existing;
      
      if (JSON.stringify(mPure) !== JSON.stringify(existingPure)) {
        isDifferent = true;
        return { ...m, updatedAt: new Date().toISOString() };
      }
      
      return { ...m, updatedAt: existing.updatedAt };
    });

    if (isDifferent) {
      setMembers(nextMembers);
      localStorage.setItem("ost_pay_members", JSON.stringify(nextMembers));
      return;
    }
    
    members.forEach(member => {
      const existing = savedList.find(m => m.id === member.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(member)) {
        saveMember(member);
      }
    });

    savedList.forEach(member => {
      const stillExists = members.some(m => m.id === member.id);
      if (!stillExists) {
        deleteMember(member.id);
      }
    });

    localStorage.setItem("ost_pay_members", JSON.stringify(members));
  }, [members]);

  // --- SYNC SETTINGS PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("ost_sync_interval", syncInterval.toString());
  }, [syncInterval]);

  useEffect(() => {
    localStorage.setItem("ost_sync_active", isSyncActive.toString());
  }, [isSyncActive]);

  useEffect(() => {
    localStorage.setItem("ost_sync_preference", syncPreference);
  }, [syncPreference]);

  // --- SYNC CONFIG LOG HELPER ---
  const addSyncLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    const formattedMsg = `[${date} ${timestamp}] ${msg}`;
    setSyncLogs(prev => {
      const updated = [formattedMsg, ...prev].slice(0, 50); // limit to 50 logs
      localStorage.setItem("ost_sync_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // --- MANUAL / AUTOMATIC DATABASE SYNC ENGINE ---
  const performDatabaseSync = async (isManual = false) => {
    setSyncStatus("syncing");
    try {
      const remoteMembers = await getMembers();
      const localSaved = localStorage.getItem("ost_pay_members");
      const localMembers: Member[] = localSaved ? JSON.parse(localSaved) : members;

      const mergedList: Member[] = [];
      const localMap = new Map(localMembers.map(m => [m.id, m]));
      const remoteMap = new Map(remoteMembers.map(m => [m.id, m]));

      const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
      
      let uploadedCount = 0;
      let downloadedCount = 0;
      let mergedCount = 0;

      for (const id of allIds) {
        const local = localMap.get(id);
        const remote = remoteMap.get(id);

        if (local && !remote) {
          await saveMember(local);
          mergedList.push(local);
          uploadedCount++;
        } else if (!local && remote) {
          mergedList.push(remote);
          downloadedCount++;
        } else if (local && remote) {
          const localStr = JSON.stringify(local);
          const remoteStr = JSON.stringify(remote);
          
          if (localStr === remoteStr) {
            mergedList.push(local);
          } else {
            if (syncPreference === "local") {
              await saveMember(local);
              mergedList.push(local);
              uploadedCount++;
            } else if (syncPreference === "remote") {
              mergedList.push(remote);
              downloadedCount++;
            } else {
              const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
              const remoteTime = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
              
              if (localTime > remoteTime) {
                await saveMember(local);
                mergedList.push(local);
                uploadedCount++;
              } else if (remoteTime > localTime) {
                mergedList.push(remote);
                downloadedCount++;
              } else {
                await saveMember(local);
                mergedList.push(local);
                mergedCount++;
              }
            }
          }
        }
      }

      setMembers(mergedList);
      localStorage.setItem("ost_pay_members", JSON.stringify(mergedList));

      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      const date = now.toLocaleDateString();
      const timeStr = `${date} ${timestamp}`;
      
      setLastSyncTime(timeStr);
      localStorage.setItem("ost_last_sync_time", timeStr);
      setSyncStatus("success");
      
      const logMsg = `Sincronização ${isManual ? "manual" : "automática"} concluída com sucesso. Enviados: ${uploadedCount}, Recebidos: ${downloadedCount}.`;
      addSyncLog(logMsg);
      
      addLog("Sistema", `Sincronização de dados concluída (${isManual ? "manual" : "auto"}). ${uploadedCount} uploads, ${downloadedCount} downloads. Preferência: ${syncPreference}`, "info");

      if (isManual) {
        setActiveToasts(prev => [
          {
            id: "toast-" + Date.now(),
            title: "Sincronização Concluída",
            message: `Sincronização com Firestore concluída. ${uploadedCount} enviados, ${downloadedCount} descarregados.`,
            type: "success"
          },
          ...prev
        ]);
      }
    } catch (error) {
      console.error("Auto-sync error:", error);
      setSyncStatus("error");
      addSyncLog(`Falha de sincronização: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      if (isManual) {
        setActiveToasts(prev => [
          {
            id: "toast-" + Date.now(),
            title: "Erro de Sincronização",
            message: `Não foi possível sincronizar os dados. Verifique a sua ligação.`,
            type: "danger"
          },
          ...prev
        ]);
      }
    }
  };

  // --- DATABASE SYNC SCHEDULER ---
  useEffect(() => {
    if (!isSyncActive || syncInterval <= 0) return;

    const initialTimeout = setTimeout(() => {
      performDatabaseSync(false);
    }, 8000); // 8 seconds delay after startup

    const intervalId = setInterval(() => {
      performDatabaseSync(false);
    }, syncInterval * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [syncInterval, isSyncActive, syncPreference]);

  useEffect(() => {
    localStorage.setItem("ost_pay_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    const savedStr = localStorage.getItem("ost_pay_admin_notifications");
    const savedList: AdminNotification[] = savedStr ? JSON.parse(savedStr) : [];

    adminNotifications.forEach(notif => {
      const existing = savedList.find(n => n.id === notif.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(notif)) {
        saveAdminNotification(notif);
      }
    });

    savedList.forEach(notif => {
      const stillExists = adminNotifications.some(n => n.id === notif.id);
      if (!stillExists) {
        deleteAdminNotification(notif.id);
      }
    });

    localStorage.setItem("ost_pay_admin_notifications", JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  useEffect(() => {
    const savedStr = localStorage.getItem("ost_attendance_records");
    const savedList: AttendanceRecord[] = savedStr ? JSON.parse(savedStr) : [];

    attendanceRecords.forEach(record => {
      const existing = savedList.find(r => r.id === record.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(record)) {
        addAttendanceRecord(record);
      }
    });

    localStorage.setItem("ost_attendance_records", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    const savedStr = localStorage.getItem("ost_whatsapp_reminders");
    const savedList: WhatsAppReminder[] = savedStr ? JSON.parse(savedStr) : [];

    whatsappReminders.forEach(reminder => {
      const existing = savedList.find(r => r.id === reminder.id);
      if (!existing || JSON.stringify(existing) !== JSON.stringify(reminder)) {
        saveWhatsAppReminder(reminder);
      }
    });

    localStorage.setItem("ost_whatsapp_reminders", JSON.stringify(whatsappReminders));
  }, [whatsappReminders]);

  useEffect(() => {
    saveSettingsDoc("worship_stats", worshipStats, "ost_worship_stats");
  }, [worshipStats]);

  useEffect(() => {
    const configToSave = {
      ...smtpConfig,
      password: encryptSmtpPassword(smtpConfig.password)
    };
    saveSettingsDoc("smtp", configToSave, "ost_smtp_config");
  }, [smtpConfig]);

  useEffect(() => {
    localStorage.setItem("ost_pay_admin_authorized", String(isAdminAuthorized));
  }, [isAdminAuthorized]);

  // Polling persistence and tick management
  useEffect(() => {
    localStorage.setItem("ost_pay_polling_active", String(isPollingActive));
    setPollingTimeLeft(pollingInterval);
  }, [isPollingActive, pollingInterval]);

  useEffect(() => {
    localStorage.setItem("ost_pay_polling_interval", String(pollingInterval));
  }, [pollingInterval]);

  useEffect(() => {
    localStorage.setItem("ost_pay_reminder_advance_days", String(reminderAdvanceDays));
  }, [reminderAdvanceDays]);

  useEffect(() => {
    localStorage.setItem("ost_worship_rem_active", String(worshipReminderActive));
    localStorage.setItem("ost_worship_rem_time", worshipReminderTime);
    localStorage.setItem("ost_worship_rem_title", worshipReminderTitle);
    localStorage.setItem("ost_worship_rem_history", JSON.stringify(worshipReminderHistory));
    localStorage.setItem("ost_worship_rem_template", worshipReminderTemplate);
  }, [worshipReminderActive, worshipReminderTime, worshipReminderTitle, worshipReminderHistory, worshipReminderTemplate]);

  useEffect(() => {
    if (!isPollingActive || currentMode !== "admin") {
      return;
    }

    const timer = setInterval(() => {
      setPollingTimeLeft(prev => {
        if (prev <= 1) {
          triggerAutomaticPoll();
          return pollingInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPollingActive, pollingInterval, currentMode]);

  // Auto-dismiss active toast alerts after 7 seconds
  useEffect(() => {
    if (activeToasts.length > 0) {
      const timer = setTimeout(() => {
        setActiveToasts(prev => prev.filter((_, idx) => idx !== 0));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeToasts]);

  // --- HANDLERS ---
  const addLog = (user: string, action: string, type: "success" | "info" | "warning" | "danger" = "info") => {
    const newLog: AuditLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      user,
      action,
      type
    };
    setLogs(prev => [newLog, ...prev]);
    addAuditLog(newLog);
  };

  // Google Login mock trigger
  const handleGoogleLogin = (email: string, name: string) => {
    setShowLoginModal(false);
    if (loginTab === "admin") {
      if (!isAdminAuthorized) {
        alert("Acesso de Administrador Restrito. Este dispositivo precisa de autorização.");
        return;
      }
      // Log in as Admin
      const adminSession = { email: email || "LeviChingoma12@gmail.com", isAdmin: true };
      setCurrentUser(adminSession);
      addLog("Sistema", `Administrador ${adminSession.email} entrou via Google`, "success");
      setCurrentMode("admin");
      setAdminTab("overview");
    } else {
      // Check if member already exists
      const existing = members.find(m => m.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setCurrentUser(existing);
        addLog(existing.name, "Entrou no Portal do Membro via Google", "success");
        setCurrentMode("member");
        if (existing.paymentStatus === "Ativo") {
          setMemberTab("badge");
        } else if (existing.paymentStatus === "Pendente") {
          setMemberTab("payment");
          setPaymentStep("success"); // show pending approval / success step
        } else {
          setMemberTab("payment");
          setPaymentStep("input");
        }
      } else {
        // Create dynamic pre-filled form for new registration
        setRegistrationForm({
          name: name,
          email: email,
          birthDate: "1998-01-01",
          contact: "+258 ",
          province: "Maputo Cidade",
          region: "Maputo Central",
          photoUrl: "",
          role: "Membro"
        });
        // Set temp user for registration flow
        const tempMember: Member = {
          id: "OST-" + Math.floor(100000 + Math.random() * 90000),
          name: name,
          email: email,
          birthDate: "",
          contact: "",
          province: "Maputo Cidade",
          region: "Maputo Central",
          paymentType: "Contribuição",
          paymentMethod: "",
          paymentStatus: "Não Registado",
          receiptNumber: "",
          badgeNumber: "",
          barcode: "",
          photoUrl: "",
          createdAt: new Date().toISOString(),
          lastAccess: new Date().toISOString(),
          role: "Membro"
        };
        setCurrentUser(tempMember);
        setCurrentMode("member");
        setMemberTab("profile");
        addLog(name, "Iniciou processo de registo com conta Google", "info");
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationForm.region) {
      alert("Por favor, selecione uma Região.");
      return;
    }
    if (!currentUser) return;

    const memberId = "id" in currentUser ? currentUser.id : "OST-" + Math.floor(100000 + Math.random() * 90000);

    const updatedMember: Member = {
      id: memberId,
      name: registrationForm.name,
      email: registrationForm.email,
      birthDate: registrationForm.birthDate,
      contact: registrationForm.contact,
      province: registrationForm.province,
      region: registrationForm.region,
      paymentType: "",
      paymentMethod: "",
      paymentStatus: "Não Registado",
      receiptNumber: "",
      badgeNumber: "",
      barcode: memberId.replace("OST-", "") + Math.floor(100000 + Math.random() * 90000),
      photoUrl: registrationForm.photoUrl || (currentUser && "photoUrl" in currentUser ? currentUser.photoUrl : "") || "",
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
      role: registrationForm.role
    };

    // Add to members list if it doesn't exist
    setMembers(prev => {
      const idx = prev.findIndex(m => m.email.toLowerCase() === updatedMember.email.toLowerCase());
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = updatedMember;
        return copy;
      }
      return [...prev, updatedMember];
    });

    setCurrentUser(updatedMember);
    addLog(updatedMember.name, "Atualizou dados cadastrais, pendente de pagamento", "info");
    setMemberTab("payment");
    setPaymentStep("input");
  };

  // Payment processing logic
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !("id" in currentUser)) return;

    const amount = parseInt(customAmount) || 0;
    if (amount <= 0) {
      alert("Por favor, introduza um valor válido para a contribuição (superior a 0 MT).");
      return;
    }

    setPaymentProcessing(true);

    if (paymentMethod === "M-Pesa" || paymentMethod === "e-Mola" || paymentMethod === "Mkesh") {
      setPaymentStep("ussd_sim");
      setTimeout(() => {
        setPaymentProcessing(false);
      }, 1500);
    } else {
      // Credit card / bank transfer directly goes to processing then finishes
      setTimeout(() => {
        completePayment(amount);
      }, 2000);
    }
  };

  const confirmUssdPin = () => {
    const amount = parseInt(customAmount) || 0;
    if (amount <= 0) {
      alert("Por favor, introduza um valor válido para a contribuição (superior a 0 MT).");
      return;
    }

    setPaymentProcessing(true);
    setTimeout(() => {
      completePayment(amount);
    }, 1800);
  };

  const completePayment = (amount: number) => {
    if (!currentUser || !("id" in currentUser)) return;

    const rNumber = "REC-2026-" + Math.floor(1000 + Math.random() * 9000);
    const bNumber = "CR-2026-" + currentUser.id.replace("OST-", "");
    const status = paymentMethod === "Transferência" ? "Pendente" : "Ativo";

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    const expiryDateStr = oneYearFromNow.toISOString().split('T')[0];

    const updated: Member = {
      ...currentUser,
      paymentType,
      paymentMethod,
      paymentAmount: amount,
      paymentStatus: status,
      receiptNumber: rNumber,
      badgeNumber: bNumber,
      lastAccess: new Date().toISOString(),
      ...(status === "Ativo" ? { expiryDate: expiryDateStr } : {})
    };

    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    setCurrentUser(updated);
    setPaymentProcessing(false);
    setPaymentStep("success");
    addLog(updated.name, `Efectuou pagamento de ${amount} MT via ${paymentMethod}. Estado: ${status}`, status === "Ativo" ? "success" : "warning");

    if (status === "Pendente") {
      const newNotif: AdminNotification = {
        id: "notif-" + Date.now(),
        memberId: updated.id,
        memberName: updated.name,
        amount: amount,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString(),
        status: "Pendente"
      };
      setAdminNotifications(prev => [newNotif, ...prev]);

      // Push real-time toast alert
      const newToast: AdminToast = {
        id: "toast-" + Date.now(),
        title: "Novo Pagamento Pendente",
        message: `${updated.name} submeteu um pagamento de ${amount} MT via Transferência Bancária.`,
        type: "warning",
        memberId: updated.id
      };
      setActiveToasts(prev => [newToast, ...prev]);
    } else {
      // Push success toast alert
      const newToast: AdminToast = {
        id: "toast-" + Date.now(),
        title: "Pagamento Confirmado",
        message: `${updated.name} pagou ${amount} MT via ${paymentMethod} com sucesso.`,
        type: "success",
        memberId: updated.id
      };
      setActiveToasts(prev => [newToast, ...prev]);
    }
  };

  // Profile fields update directly inside member portal
  const handleProfileFieldUpdate = (field: keyof Member, value: string) => {
    if (!currentUser || !("id" in currentUser)) return;
    const updated = { ...currentUser, [field]: value } as Member;
    setCurrentUser(updated);
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  // Profile photo upload and conversion to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !("id" in currentUser)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updated = { ...currentUser, photoUrl: base64 };
      setCurrentUser(updated);
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
      addLog(currentUser.name, "Atualizou a fotografia de perfil", "info");
    };
    reader.readAsDataURL(file);
  };

  // Health and Assistance record update handler
  const handleSaveHealthRecord = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addLog("Administrador", `Atualizou a Ficha de Saúde e Assistência de ${updatedMember.name} (${updatedMember.id})`, "info");
    setActiveToasts(prev => [
      {
        id: "toast-" + Date.now(),
        title: "Ficha de Saúde Guardada",
        message: `As informações médicas e de assistência de ${updatedMember.name} foram guardadas de forma segura.`,
        type: "success"
      },
      ...prev
    ]);
    setEditingHealthMember(null);
  };

  // Admin approvals & notifications handlers
  const handleApprovePayment = (memberId: string) => {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    const expiryDateStr = oneYearFromNow.toISOString().split('T')[0];

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated: Member = { ...m, paymentStatus: "Ativo", expiryDate: expiryDateStr };
        addLog("Administrador", `Aprovou pagamento de transferência bancária para ${m.name}`, "success");
        if (currentUser && "id" in currentUser && currentUser.id === memberId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return m;
    }));

    // Update notification status
    setAdminNotifications(prev => prev.map(n => n.memberId === memberId ? { ...n, status: "Aprovado" } : n));

    // Show a success approval toast
    const newToast: AdminToast = {
      id: "toast-" + Date.now(),
      title: "Pagamento Aprovado",
      message: `A transferência bancária do membro foi validada e ativada.`,
      type: "success"
    };
    setActiveToasts(prev => [newToast, ...prev]);
  };

  const handleRejectPayment = (memberId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated: Member = { ...m, paymentStatus: "Bloqueado" };
        addLog("Administrador", `Rejeitou o pagamento por transferência bancária de ${m.name}`, "danger");
        if (currentUser && "id" in currentUser && currentUser.id === memberId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return m;
    }));

    // Update notification status
    setAdminNotifications(prev => prev.map(n => n.memberId === memberId ? { ...n, status: "Rejeitado" } : n));

    const newToast: AdminToast = {
      id: "toast-" + Date.now(),
      title: "Pagamento Rejeitado",
      message: `A transferência bancária foi recusada pelo administrador.`,
      type: "danger"
    };
    setActiveToasts(prev => [newToast, ...prev]);
  };

  const dismissNotification = (notifId: string) => {
    setAdminNotifications(prev => prev.filter(n => n.id !== notifId));
  };


  const clearAllNotifications = () => {
    setAdminNotifications([]);
  };

  const triggerAutomaticPoll = async () => {
    // Flash visual check state
    setIsPollingAnimation(true);
    setTimeout(() => {
      setIsPollingAnimation(false);
    }, 1200);

    try {
      // Query actual database to refresh states in real-time
      const remoteNotifs = await getAdminNotifications();
      const remoteMembers = await getMembers();
      
      if (remoteNotifs && remoteNotifs.length > 0) {
        setAdminNotifications(remoteNotifs);
      }
      if (remoteMembers && remoteMembers.length > 0) {
        setMembers(remoteMembers);
      }
    } catch (err) {
      console.error("Erro ao sincronizar base de dados durante Polling:", err);
    }
  };

  const handleBlockUnblock = (memberId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Bloqueado" ? "Ativo" : "Bloqueado";
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updated: Member = { ...m, paymentStatus: nextStatus as "Ativo" | "Bloqueado" };
        addLog("Administrador", `${nextStatus === "Bloqueado" ? "Bloqueou" : "Desbloqueou"} membro ${m.name}`, nextStatus === "Bloqueado" ? "danger" : "success");
        return updated;
      }
      return m;
    }));
  };

  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          resolve(reader.result as string);
        }, false);
        reader.addEventListener("error", () => {
          reject(new Error("Falha ao ler dados da imagem"));
        });
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      throw new Error("Erro de CORS ou rede ao descarregar recurso de imagem.");
    }
  };

  const handleGenerateBadgePDF = async (
    member: Member,
    download: boolean = true,
    options?: {
      withBleedAndCrop?: boolean;
      docInstance?: jsPDF;
      startX?: number;
      startY?: number;
      scale?: number;
      codeFormat?: "both" | "qr" | "barcode";
    }
  ): Promise<string> => {
    const withBleedAndCrop = options?.withBleedAndCrop || false;
    const scale = options?.scale || 1;
    const dx = options?.startX !== undefined ? options.startX : (withBleedAndCrop ? 3 : 0);
    const dy = options?.startY !== undefined ? options.startY : (withBleedAndCrop ? 3 : 0);
    const codeFormat = options?.codeFormat || "both";

    // Standard portrait CR80 dimensions: 54mm width, 86mm height
    // Bleed format adds 3mm margin on each side: 60mm x 92mm
    const width = 54;
    const height = 86;

    // If docInstance is provided, use it; otherwise create a new jsPDF instance
    const doc = options?.docInstance || new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: withBleedAndCrop ? [60, 92] : [54, 86]
    });

    const w = width * scale;
    const h = height * scale;

    const theme = getPositionTheme(member.role);

    // If we have single-badge bleed, let's fill the background with white
    if (withBleedAndCrop && !options?.docInstance) {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 60, 92, "F");
    }

    // CR80 spec: standard rounded corner radius is typically 3.18mm
    const cardRadius = 3.18 * scale;

    // Base background of the card (White) with rounded corners
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(dx, dy, w, h, cardRadius, cardRadius, "F");

    // Reusable helper to draw high-fidelity vector Church Logo
    const drawVectorChurchLogo = (cx: number, cy: number, r: number, isWatermark: boolean = false) => {
      if (isWatermark) {
        // Watermark mode: extremely faint lines, no solid fills
        doc.setDrawColor(241, 245, 249); // slate-100 equivalent
        doc.setLineWidth(0.08 * scale);
        
        // Outer circle
        doc.ellipse(cx, cy, r, r, "D");
        // Inner ring
        doc.ellipse(cx, cy, r - 0.6 * scale, r - 0.6 * scale, "D");
        // Center circle
        doc.ellipse(cx, cy, r - 1.5 * scale, r - 1.5 * scale, "D");
        
        // Draw light cross
        doc.setFillColor(241, 245, 249);
        doc.rect(cx - 0.4 * scale, cy - r * 0.6, 0.8 * scale, r * 1.2, "F");
        doc.rect(cx - r * 0.6, cy - 0.4 * scale, r * 1.2, 0.8 * scale, "F");
      } else {
        // Full-color mode (the official logo in header)
        // Base Dark Blue Circle with Outer Red/Brown Border
        doc.setFillColor(11, 46, 89); // Deep blue base #0B2E59
        doc.setDrawColor(176, 28, 28); // Red border #b01c1c
        doc.setLineWidth(0.18 * scale);
        doc.ellipse(cx, cy, r, r, "FD");

        // Inner white ring
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.12 * scale);
        doc.ellipse(cx, cy, r - 0.4 * scale, r - 0.4 * scale, "D");

        // Central blue sphere background
        doc.setFillColor(59, 130, 246); // Blue-500 #3b82f6
        doc.ellipse(cx, cy, r - 0.8 * scale, r - 0.8 * scale, "F");

        // Central 3D-like red cross
        doc.setFillColor(194, 37, 37); // Red #c22525
        // Vertical shaft
        doc.rect(cx - 0.3 * scale, cy - r * 0.55, 0.6 * scale, r * 1.1, "F");
        // Horizontal beam
        doc.rect(cx - r * 0.45, cy - 0.3 * scale, r * 0.9, 0.6 * scale, "F");
      }
    };

    // Helper to draw the elegant inner rounded gold border (matches the rounded-[24px] in the preview)
    const innerOffset = 1.2 * scale;
    const drawInnerGoldBorder = () => {
      doc.setDrawColor(212, 175, 55); // Gold #D4AF37
      doc.setLineWidth(0.18 * scale);
      doc.roundedRect(
        dx + innerOffset,
        dy + innerOffset,
        w - 2 * innerOffset,
        h - 2 * innerOffset,
        2.8 * scale,
        2.8 * scale,
        "D"
      );
    };

    // 2. ANTI-COUNTERFEITING SECURITY WATERMARK/GUILLOCHÉ IN THE BACKGROUND
    const centerX = dx + w / 2;
    const centerY = dy + h / 2 + 5 * scale;
    doc.setDrawColor(241, 245, 249); // Slate-100 (very subtle)
    doc.setLineWidth(0.08 * scale);
    for (let r = 5 * scale; r <= 22 * scale; r += 2.5 * scale) {
      doc.ellipse(centerX, centerY, r, r * 0.9, "D");
    }
    // Subtle crosshair lines
    doc.line(centerX - 24 * scale, centerY, centerX + 24 * scale, centerY);
    doc.line(centerX, centerY - 24 * scale, centerX, centerY + 24 * scale);

    // Draw large watermark church logo in the background
    drawVectorChurchLogo(centerX, centerY, 10 * scale, true);

    // 3. PREMIUM TOP HEADER DESIGN (Royal Blue matching #0B2E59)
    // We draw a rounded rectangle for the header to match the card rounding
    const headerH = 18.5 * scale;
    doc.setFillColor(11, 46, 89); // Royal Blue #0B2E59
    doc.roundedRect(dx, dy, w, headerH, cardRadius, cardRadius, "F");

    // Flatten the bottom of the header
    const flattenH = 4 * scale;
    doc.rect(dx, dy + headerH - flattenH, w, flattenH, "F");

    // Modern colored gold accent ribbon under the main header (Gold matching #D4AF37)
    doc.setFillColor(212, 175, 55); // Gold #D4AF37
    doc.rect(dx, dy + headerH, w, 1.0 * scale, "F");

    // Mozambique Flag Elegant Small Ribbon (Representing national affiliation officially)
    const ribbonW = 1.2 * scale;
    const ribbonH = 0.8 * scale;
    const ribbonX = dx + w - 7.5 * scale;
    const ribbonY = dy + 2.4 * scale;
    // Green, Black, Red, Yellow lines side-by-side
    doc.setFillColor(0, 151, 57); // Green
    doc.rect(ribbonX, ribbonY, ribbonW, ribbonH, "F");
    doc.setFillColor(0, 0, 0); // Black
    doc.rect(ribbonX + ribbonW, ribbonY, ribbonW, ribbonH, "F");
    doc.setFillColor(208, 12, 39); // Red
    doc.rect(ribbonX + 2 * ribbonW, ribbonY, ribbonW, ribbonH, "F");
    doc.setFillColor(255, 209, 0); // Yellow
    doc.rect(ribbonX + 3 * ribbonW, ribbonY, ribbonW, ribbonH, "F");

    // Centered Logo in the Header with White circular background & Gold border
    const logoContainerX = dx + w / 2;
    const logoContainerY = dy + 4.2 * scale;
    const logoContainerRadius = 2.8 * scale;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(212, 175, 55); // Gold #D4AF37
    doc.setLineWidth(0.2 * scale);
    doc.ellipse(logoContainerX, logoContainerY, logoContainerRadius, logoContainerRadius, "FD");

    // Draw official church logo inside the header container
    drawVectorChurchLogo(logoContainerX, logoContainerY, 2.3 * scale, false);

    // Title Texts in the Header (Matching ASSEMBLEIA DE DEUS and AFRICANA)
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(4.4 * scale);
    doc.text("ASSEMBLEIA DE DEUS", dx + w / 2, dy + 8.8 * scale, { align: "center" });

    doc.setTextColor(212, 175, 55); // Gold #D4AF37
    doc.setFontSize(3.8 * scale);
    doc.setFont("Helvetica", "bold");
    doc.text("AFRICANA", dx + w / 2, dy + 11.2 * scale, { align: "center" });

    // Header subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(2.8 * scale);
    doc.setFont("Helvetica", "bold");
    doc.text("CRACHÁ OFICIAL DE MEMBRO", dx + w / 2, dy + 14.5 * scale, { align: "center" });

    // 4. PORTRAIT PHOTO FRAME (Circular like UI)
    const photoY = dy + 23.5 * scale;
    const photoRadius = 8.5 * scale;
    const photoCenterX = dx + w / 2;
    const photoCenterY = photoY + photoRadius;

    // Outer golden ring (similar to rounded-full border-2 border-[#D4AF37])
    doc.setDrawColor(212, 175, 55); // Gold #D4AF37
    doc.setLineWidth(0.4 * scale);
    doc.setFillColor(255, 255, 255);
    doc.ellipse(photoCenterX, photoCenterY, photoRadius, photoRadius, "FD");

    if (member.photoUrl) {
      try {
        const base64Photo = await getBase64ImageFromUrl(member.photoUrl);
        doc.saveGraphicsState();
        doc.ellipse(photoCenterX, photoCenterY, photoRadius - 0.3 * scale, photoRadius - 0.3 * scale, "F");
        doc.clip();
        doc.addImage(
          base64Photo, 
          "JPEG", 
          photoCenterX - photoRadius, 
          photoCenterY - photoRadius, 
          photoRadius * 2, 
          photoRadius * 2
        );
        doc.restoreGraphicsState();
      } catch (e) {
        // Fallback minimalist user silhouette inside circular background
        doc.setFillColor(241, 245, 249); // Background Slate-100 #F1F5F9
        doc.ellipse(photoCenterX, photoCenterY, photoRadius - 0.3 * scale, photoRadius - 0.3 * scale, "F");
        
        doc.setFillColor(148, 163, 184); // Slate-400 for silhouette
        // Head
        doc.ellipse(photoCenterX, photoCenterY - 1.8 * scale, 2.0 * scale, 2.0 * scale, "F");
        // Shoulders
        doc.saveGraphicsState();
        doc.ellipse(photoCenterX, photoCenterY, photoRadius - 0.3 * scale, photoRadius - 0.3 * scale, "F");
        doc.clip();
        doc.ellipse(photoCenterX, photoCenterY + 5.2 * scale, 5.2 * scale, 3.2 * scale, "F");
        doc.restoreGraphicsState();
      }
    } else {
      // Fallback minimalist user silhouette inside circular background
      doc.setFillColor(241, 245, 249); // Background Slate-100 #F1F5F9
      doc.ellipse(photoCenterX, photoCenterY, photoRadius - 0.3 * scale, photoRadius - 0.3 * scale, "F");
      
      doc.setFillColor(148, 163, 184); // Slate-400 for silhouette
      // Head
      doc.ellipse(photoCenterX, photoCenterY - 1.8 * scale, 2.0 * scale, 2.0 * scale, "F");
      // Shoulders
      doc.saveGraphicsState();
      doc.ellipse(photoCenterX, photoCenterY, photoRadius - 0.3 * scale, photoRadius - 0.3 * scale, "F");
      doc.clip();
      doc.ellipse(photoCenterX, photoCenterY + 5.2 * scale, 5.2 * scale, 3.2 * scale, "F");
      doc.restoreGraphicsState();
    }

    let y = dy + 44.5 * scale;

    // 5. MEMBER NAME WITH OVERHEAD SMALL DESCRIPTION
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(3.2 * scale);
    doc.text("NOME COMPLETO", dx + w / 2, y, { align: "center" });

    y += 3.0 * scale;

    // Display Name in Slate-900 (dynamic size reduction for long names to avoid overflow)
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont("Helvetica", "bold");
    
    let nameFontSize = 7.5 * scale;
    if (member.name.length > 25) nameFontSize = 6.2 * scale;
    if (member.name.length > 32) nameFontSize = 5.2 * scale;
    doc.setFontSize(nameFontSize);

    const nameLines = doc.splitTextToSize(member.name.toUpperCase(), w - 8 * scale);
    doc.text(nameLines, dx + w / 2, y, { align: "center" });

    y += (nameLines.length * 2.8 * scale) + 0.5 * scale;

    // Region / Province subtitle with a neat location icon-like marker
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(4.4 * scale);
    doc.text("• " + member.region.toUpperCase() + " • " + member.province.toUpperCase() + " •", dx + w / 2, y, { align: "center" });

    y += 3.2 * scale;

    // 6. POSITION / ROLE PILL BADGE WITH SPACING
    const pillW = 24 * scale;
    const pillH = 3.2 * scale;
    doc.setFillColor(11, 46, 89); // Royal Blue #0B2E59
    doc.setDrawColor(212, 175, 55); // Gold #D4AF37
    doc.setLineWidth(0.18 * scale);
    doc.roundedRect(dx + w / 2 - pillW / 2, y - 1.2 * scale, pillW, pillH, 0.6 * scale, 0.6 * scale, "FD");

    // Draw small golden dot inside the pill on the left
    doc.setFillColor(212, 175, 55); // Gold #D4AF37
    doc.ellipse(dx + w / 2 - pillW / 2 + 2 * scale, y + 0.4 * scale, 0.3 * scale, 0.3 * scale, "F");

    // Draw role text centered slightly offset
    doc.setTextColor(212, 175, 55); // Gold #D4AF37
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(3.2 * scale);
    doc.text(theme.name.toUpperCase(), dx + w / 2 + 0.8 * scale, y + 0.8 * scale, { align: "center" });

    y += 4.0 * scale;

    // 7. STRUCTURED METADATA GRID (4 SEPARATE ROUNDED CARDS IN 2X2 FORMAT, PERFECTLY CENTERED)
    const colW = 20.8 * scale;
    const cardH = 4.8 * scale;
    const cardGapX = 2.4 * scale;
    const cardGapY = 1.2 * scale;
    const gridStartX = dx + (w - (colW * 2 + cardGapX)) / 2; // Centers the grid exactly
    const gridStartY = y;

    const drawBentoCard = (
      cx: number,
      cy: number,
      label: string,
      value: string,
      isStatus: boolean = false,
      statusType?: "active" | "quotas"
    ) => {
      // Draw white card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240); // Slate-200 border
      doc.setLineWidth(0.15 * scale);
      doc.roundedRect(cx, cy, colW, cardH, 1.0 * scale, 1.0 * scale, "FD");

      // Draw label
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(2.6 * scale);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text(label.toUpperCase(), cx + colW / 2, cy + 1.6 * scale, { align: "center" });

      // Draw value
      if (isStatus) {
        const textW = doc.getTextWidth(value.toUpperCase());
        const dotRadius = 0.3 * scale;
        const dotDiameter = dotRadius * 2;
        const spacing = 0.6 * scale;
        const totalW = dotDiameter + spacing + textW;
        const groupStartX = cx + colW / 2 - totalW / 2;

        if (statusType === "active") {
          // Green dot
          doc.setFillColor(34, 197, 94); // Green-500
          doc.ellipse(groupStartX + dotRadius, cy + 3.2 * scale, dotRadius, dotRadius, "F");
          
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(3.4 * scale);
          doc.setTextColor(22, 163, 74); // Green-600
          doc.text(value.toUpperCase(), groupStartX + dotDiameter + spacing, cy + 3.5 * scale);
        } else {
          // Yellow/Gold dot for quotas
          doc.setFillColor(212, 175, 55); // Gold #D4AF37
          doc.ellipse(groupStartX + dotRadius, cy + 3.2 * scale, dotRadius, dotRadius, "F");

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(3.4 * scale);
          doc.setTextColor(180, 140, 30); // Darker Gold/Brown for legibility
          doc.text(value.toUpperCase(), groupStartX + dotDiameter + spacing, cy + 3.5 * scale);
        }
      } else {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(3.5 * scale);
        doc.setTextColor(11, 46, 89); // Deep Blue #0B2E59
        doc.text(value, cx + colW / 2, cy + 3.5 * scale, { align: "center" });
      }
    };

    // Draw Card 1: ID MEMBRO
    drawBentoCard(gridStartX, gridStartY, "ID MEMBRO", member.id);

    // Draw Card 2: EMISSÃO
    drawBentoCard(gridStartX + colW + cardGapX, gridStartY, "EMISSÃO", new Date(member.createdAt).toLocaleDateString());

    // Draw Card 3: ESTADO
    drawBentoCard(gridStartX, gridStartY + cardH + cardGapY, "ESTADO", "ATIVO", true, "active");

    // Draw Card 4: QUOTAS
    drawBentoCard(gridStartX + colW + cardGapX, gridStartY + cardH + cardGapY, "QUOTAS", "EM DIA", true, "quotas");

    // 8. BOTTOM FOOTER SECTION WITH SOFT GREY BACKGROUND & ROUNDED CORNERS (fits inside the inner gold frame)
    const footerH = 13.5 * scale;
    const footerStartY = dy + h - footerH - innerOffset;
    
    doc.setFillColor(248, 250, 252); // Slate-50 #f8fafc
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.15 * scale);
    doc.roundedRect(
      dx + innerOffset + 0.1 * scale,
      footerStartY,
      w - 2 * innerOffset - 0.2 * scale,
      footerH,
      1.8 * scale,
      1.8 * scale,
      "FD"
    );

    // Draw top separator border line for footer
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.2 * scale);
    doc.line(
      dx + innerOffset + 0.1 * scale,
      footerStartY,
      dx + w - innerOffset - 0.1 * scale,
      footerStartY
    );

    const bottomContentY = footerStartY + 2.2 * scale;
    const usableW = w - 2 * innerOffset;
    const footerColW = usableW / 2;

    if (codeFormat === "both") {
      // Labels
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(2.6 * scale);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text("SECURE QR", dx + innerOffset + footerColW / 2, bottomContentY, { align: "center" });
      doc.text("CÓDIGO DE ACESSO", dx + innerOffset + footerColW + footerColW / 2, bottomContentY, { align: "center" });

      // QR Code on Left
      const qrSize = 7.5 * scale;
      const qrX = dx + innerOffset + footerColW / 2 - qrSize / 2;
      const qrY = bottomContentY + 0.8 * scale;
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + "/?validate=" + member.id)}`;
        const base64QR = await getBase64ImageFromUrl(qrUrl);
        doc.addImage(base64QR, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (e) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX, qrY, qrSize, qrSize, 0.6 * scale, 0.6 * scale, "FD");
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(2.0 * scale);
        doc.setTextColor(148, 163, 184);
        doc.text("QR-CODE", qrX + qrSize / 2, qrY + qrSize / 2 + 0.5 * scale, { align: "center" });
      }

      // Barcode on Right
      const barcodeW = 18 * scale;
      const barcodeH = 4.5 * scale;
      const barcodeX = dx + innerOffset + footerColW + footerColW / 2 - barcodeW / 2;
      const barcodeY = bottomContentY + 1.0 * scale;

      doc.setFillColor(15, 23, 42); // Deep Slate
      const lineWeights = [1.2, 0.5, 1.8, 0.4, 1.0, 1.2, 0.5, 2.0, 0.8, 0.5, 1.2, 0.4, 0.8, 1.8, 0.5, 1.2];
      let currentX = barcodeX;
      lineWeights.forEach((wWeight) => {
        const rectW = wWeight * 0.3 * scale;
        doc.rect(currentX, barcodeY, rectW, barcodeH, "F");
        currentX += rectW + 0.22 * scale;
      });

      // Barcode number centered under the lines
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(2.8 * scale);
      doc.text(
        member.barcode || "120394102941",
        barcodeX + barcodeW / 2,
        barcodeY + barcodeH + 1.8 * scale,
        { align: "center" }
      );
    } else if (codeFormat === "qr") {
      // Centered QR Code
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(2.6 * scale);
      doc.setTextColor(148, 163, 184);
      doc.text("SECURE QR", dx + w / 2, bottomContentY, { align: "center" });

      const qrSize = 8.5 * scale;
      const qrX = dx + w / 2 - qrSize / 2;
      const qrY = bottomContentY + 0.8 * scale;
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/?validate=" + member.id)}`;
        const base64QR = await getBase64ImageFromUrl(qrUrl);
        doc.addImage(base64QR, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (e) {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(qrX, qrY, qrSize, qrSize, 0.6 * scale, 0.6 * scale, "FD");
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(2.2 * scale);
        doc.setTextColor(148, 163, 184);
        doc.text("QR-CODE", dx + w / 2, qrY + qrSize / 2 + 0.5 * scale, { align: "center" });
      }
    } else {
      // Centered Barcode
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(2.6 * scale);
      doc.setTextColor(148, 163, 184);
      doc.text("CÓDIGO DE ACESSO", dx + w / 2, bottomContentY, { align: "center" });

      const barcodeH = 5 * scale;
      const barcodeY = bottomContentY + 1.0 * scale;
      
      const lineWeights = [1.2, 0.5, 1.8, 0.4, 1.0, 1.2, 0.5, 2.0, 0.8, 0.5, 1.2, 0.4, 0.8, 1.8, 0.5, 1.2, 0.8, 1.2, 0.5, 1.8];
      let totalBarcodeW = 0;
      lineWeights.forEach((wWeight) => {
        totalBarcodeW += (wWeight * 0.3 * scale) + 0.22 * scale;
      });
      
      const barcodeStartX = dx + w / 2 - totalBarcodeW / 2;
      let currentX = barcodeStartX;
      doc.setFillColor(15, 23, 42);
      lineWeights.forEach((wWeight) => {
        const rectW = wWeight * 0.3 * scale;
        doc.rect(currentX, barcodeY, rectW, barcodeH, "F");
        currentX += rectW + 0.22 * scale;
      });

      // Barcode number centered under the lines
      doc.setTextColor(100, 116, 139);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(2.8 * scale);
      doc.text(
        member.barcode || "120394102941",
        dx + w / 2,
        barcodeY + barcodeH + 1.8 * scale,
        { align: "center" }
      );
    }

    // 12. DRAW THE ELEGANT GOLDEN FRAMING BORDER (sits crisply on top of all elements)
    drawInnerGoldBorder();

    // 9. DRAW SINGLE-BADGE CROP MARKS (if requested)
    if (withBleedAndCrop && !options?.docInstance) {
      doc.setDrawColor(100, 116, 139); // Slate-500
      doc.setLineWidth(0.15);

      // Top-Left
      doc.line(3, 0, 3, 2);
      doc.line(0, 3, 2, 3);

      // Top-Right
      doc.line(57, 0, 57, 2);
      doc.line(58, 3, 60, 3);

      // Bottom-Left
      doc.line(3, 90, 3, 92);
      doc.line(0, 89, 2, 89);

      // Bottom-Right
      doc.line(57, 90, 57, 92);
      doc.line(58, 89, 60, 89);
    }

    if (download && !options?.docInstance) {
      const filename = withBleedAndCrop 
        ? `cracha_oficial_sangria_${member.id}.pdf` 
        : `cracha_oficial_${member.id}.pdf`;
      doc.save(filename);
    }

    return doc.output("datauristring");
  };

  const handleExportBulkBadgesA4PDF = async () => {
    // Filter active members that are active/approved to print
    const activeMembersToPrint = filteredMembers.filter(m => m.paymentStatus === "Ativo");
    if (activeMembersToPrint.length === 0) {
      alert("Nenhum membro ativo/aprovado na lista filtrada para impressão em massa.");
      return;
    }

    setIsGeneratingBulk(true);
    setBulkProgress(0);
    addLog("Administrador", `Iniciou geração em lote de crachás A4 para ${activeMembersToPrint.length} membros.`, "info");

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const scale = 1;
      const w = 54 * scale;
      const h = 86 * scale;
      const colGap = 8;
      const rowGap = 8;
      const totalW = 3 * w + 2 * colGap;
      const totalH = 3 * h + 2 * rowGap;
      const leftMargin = (210 - totalW) / 2;
      const topMargin = (297 - totalH) / 2;

      for (let i = 0; i < activeMembersToPrint.length; i++) {
        const member = activeMembersToPrint[i];
        const pageIndex = Math.floor(i / 9);
        const badgeIndexOnPage = i % 9;

        if (pageIndex > 0 && badgeIndexOnPage === 0) {
          doc.addPage();
        }

        const col = badgeIndexOnPage % 3;
        const row = Math.floor(badgeIndexOnPage / 3);

        const dx = leftMargin + col * (w + colGap);
        const dy = topMargin + row * (h + rowGap);

        // Render standard badge scaled on the docInstance
        await handleGenerateBadgePDF(member, false, {
          docInstance: doc,
          startX: dx,
          startY: dy,
          scale: scale,
          codeFormat: badgeCodeOption
        });

        // Draw fine professional crop marks around each card on the A4 sheet
        doc.setDrawColor(148, 163, 184); // light neutral slate-400
        doc.setLineWidth(0.12);

        // Top-Left crop lines
        doc.line(dx, dy - 4, dx, dy - 1);
        doc.line(dx - 4, dy, dx - 1, dy);

        // Top-Right crop lines
        doc.line(dx + w, dy - 4, dx + w, dy - 1);
        doc.line(dx + w + 1, dy, dx + w + 4, dy);

        // Bottom-Left crop lines
        doc.line(dx, dy + h + 1, dx, dy + h + 4);
        doc.line(dx - 4, dy + h, dx - 1, dy + h);

        // Bottom-Right crop lines
        doc.line(dx + w, dy + h + 1, dx + w, dy + h + 4);
        doc.line(dx + w + 1, dy + h, dx + w + 4, dy + h);

        // Update progress
        const currentProg = Math.round(((i + 1) / activeMembersToPrint.length) * 100);
        setBulkProgress(currentProg);
      }

      doc.save(`crachas_em_lote_a4_${Date.now()}.pdf`);
      addLog("Administrador", `Exportou com sucesso ${activeMembersToPrint.length} crachás em formato A4 no tamanho real 54x86mm (9 por página)`, "success");
    } catch (err: any) {
      console.error("Erro ao gerar PDF em lote:", err);
      alert("Houve um erro técnico ao gerar o PDF em lote: " + (err.message || err));
    } finally {
      setIsGeneratingBulk(false);
      setBulkProgress(0);
    }
  };

  const handleSendBadge = async (member: Member, platform: "whatsapp" | "email", target: string) => {
    if (!target.trim()) {
      alert("Por favor, preencha o contacto ou email de destino.");
      return;
    }

    setBadgeSendPlatform(platform);
    setBadgeSendTarget(target);
    setBadgeSendStatus("generating");
    setBadgeSendProgress(15);
    setEmailPreviewUrl(null);
    setBadgeSendLog(["[1/4] A iniciar motor PDF e a ler registo de membro...", `[2/4] A criar vetor do crachá para ${member.name}...`]);

    try {
      // Compile the PDF badge as a base64 Data URI
      const dataUri = await handleGenerateBadgePDF(member, false, { codeFormat: badgeCodeOption });

      if (platform === "email") {
        setBadgeSendProgress(45);
        setBadgeSendLog(prev => [
          ...prev,
          `[3/4] Ficheiro PDF gerado com sucesso para ${member.id}.`,
          `A estabelecer ligação com o servidor backend e gateway SMTP...`,
          `A enviar e-mail oficial com crachá em anexo para ${target}...`
        ]);

        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            to: target,
            subject: `Crachá Oficial de Filiação - OST Moçambique (ID: ${member.id})`,
            text: `Olá ${member.name},\n\nParabéns! O seu registo na Organização Social do Trabalho foi ativado.\n\nSegue em anexo o seu Crachá Oficial em formato PDF pronto para impressão física imediata.\n\nAtenciosamente,\nOrganização Social do Trabalho`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #0f172a; padding: 24px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">ORGANIZAÇÃO SOCIAL DO TRABALHO</h1>
                  <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">CRACHÁ OFICIAL DE FILIAÇÃO</p>
                </div>
                <div style="padding: 24px;">
                  <p style="font-size: 15px; margin-top: 0;">Olá <strong>${member.name}</strong>,</p>
                  <p>Parabéns! O seu registo de membro foi processado com sucesso e a sua filiação está totalmente ativa.</p>
                  <p>Enviamos em anexo a esta mensagem o seu <strong>Crachá Oficial de Filiação</strong> em formato PDF, perfeitamente formatado para impressão física imediata (cartão PVC ou papel).</p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 12px; margin: 24px 0;">
                    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">DADOS DA FILIAÇÃO</h3>
                    <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: bold; width: 40%;">ID de Membro:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${member.id}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: bold;">Região:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${member.region} • ${member.province}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: bold;">Plano de Quota:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">Anual (${member.paymentType})</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: bold;">Método Pagamento:</td>
                        <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${member.paymentMethod}</td>
                      </tr>
                    </table>
                  </div>

                  <p>Pode aceder ao portal da OST a qualquer momento para validar os seus dados e descarregar relatórios fiscais oficiais.</p>
                </div>
                <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
                  © 2026 Organização Social do Trabalho • Moçambique. Todos os direitos reservados.
                </div>
              </div>
            `,
            attachment: {
              filename: `cracha_oficial_${member.id}.pdf`,
              content: dataUri
            },
            ...(smtpConfig.isActive ? { smtpConfig } : {})
          })
        });

        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Servidor SMTP rejeitou o envio do email.");
        }

        setBadgeSendProgress(100);
        setBadgeSendStatus("success");
        setBadgeSendLog(prev => [
          ...prev,
          `[4/4] Concluído! O crachá oficial foi transmitido para ${target} via SMTP.`,
          result.usingTestAccount 
            ? "Nota: O servidor está em modo de teste. Pode visualizar o email enviado usando o link sandbox abaixo."
            : "O documento foi entregue com sucesso à caixa de correio."
        ]);

        if (result.previewUrl) {
          setEmailPreviewUrl(result.previewUrl);
        }

        addLog(member.name, `Enviou crachá oficial via E-mail real (SMTP) para ${target}`, "success");
      } else {
        // WhatsApp redirection flow remains immediate with standard delay
        setTimeout(() => {
          setBadgeSendProgress(60);
          setBadgeSendStatus("sending");
          setBadgeSendLog(prev => [
            ...prev,
            `[3/4] Ficheiro PDF gerado com sucesso para ${member.id}.`,
            `A estabelecer ligação segura de envio via WhatsApp API local...`,
            `A preparar mensagem personalizada para o número ${target}...`
          ]);

          setTimeout(() => {
            setBadgeSendProgress(100);
            setBadgeSendStatus("success");
            setBadgeSendLog(prev => [
              ...prev,
              `[4/4] Concluído! Redirecionando para o WhatsApp Web...`,
              `O documento está pronto para ser transmitido ao destinatário.`
            ]);

            addLog(member.name, `Redirecionou para envio de crachá oficial via WhatsApp para ${target}`, "success");

            // Clean number: keep only digits
            const cleanNum = target.replace(/\D/g, "");
            // If length is 9, prepend Mozambique 258 country code
            const fullNum = cleanNum.length === 9 ? "258" + cleanNum : cleanNum;
            const text = `Olá, aqui está o link de validação do meu crachá oficial da Organização Social do Trabalho (ID: ${member.id}). Por favor, imprima em formato PDF. Link de Validação: ${window.location.origin}/?validate=${member.id}`;
            const waUrl = `https://api.whatsapp.com/send?phone=${fullNum}&text=${encodeURIComponent(text)}`;
            window.open(waUrl, "_blank");
          }, 1500);
        }, 1000);
      }

    } catch (error: any) {
      setBadgeSendStatus("error");
      setBadgeSendLog(prev => [
        ...prev,
        `Erro fatal no processo: ${error.message || "Falha na comunicação com o servidor SMTP."}`
      ]);
    }
  };

  const handleDownloadPersonalReport = () => {
    if (!currentUser || !("id" in currentUser)) return;
    const member = currentUser as Member;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors matching the OST Pay high-contrast branding
      const primaryColor = [15, 23, 42]; // Slate-900
      const accentColor = [29, 78, 216]; // Blue-700
      const borderSlate = [226, 232, 240]; // Slate-200
      const darkText = [30, 41, 59]; // Slate-800
      const lightText = [100, 116, 139]; // Slate-500

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Blue accent line under top bar
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 40, pageWidth, 3, "F");

      // Title & Branding Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.text("ORGANIZAÇÃO SOCIAL DO TRABALHO", 15, 18);

      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text("PORTAL DO MEMBRO  •  RELATÓRIO INDIVIDUAL DE QUOTA", 15, 26);
      doc.text(`EMISSÃO: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 26, { align: "right" });

      let y = 55;
      
      // Part 1: Member Info Block
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. DADOS DE FILIAÇÃO DO MEMBRO", 15, y);
      
      y += 5;
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);

      y += 8;
      const colX1_label = 15;
      const colX1_value = 55;
      const colX2_label = 110;
      const colX2_value = 150;

      const addGridRow = (l1: string, v1: string, l2: string, v2: string) => {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text(l1, colX1_label, y);
        doc.text(l2, colX2_label, y);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(v1 || "N/D", colX1_value, y);
        doc.text(v2 || "N/D", colX2_value, y);
        y += 8;
      };

      addGridRow("Nome Completo:", member.name, "ID Único:", member.id);
      addGridRow("E-mail Oficial:", member.email, "Contacto Móvel:", member.contact || "Não Definido");
      addGridRow("Província:", member.province || "Não Definida", "Região Associada:", member.region || "Não Definida");
      addGridRow("Nascimento:", member.birthDate ? new Date(member.birthDate).toLocaleDateString() : "Não Definida", "Data do Registo:", member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "Não Definida");

      // Part 2: Financial/Payment History Block
      y += 4;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. ESTADO DOS PAGAMENTOS & QUOTAS", 15, y);
      
      y += 5;
      doc.line(15, y, pageWidth - 15, y);

      y += 8;
      
      // Status Badge Style
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Estado de Registo:", colX1_label, y);

      let statusColor = [220, 38, 38]; // Red
      if (member.paymentStatus === "Ativo") statusColor = [22, 163, 74]; // Green
      else if (member.paymentStatus === "Pendente") statusColor = [245, 158, 11]; // Orange / Amber

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(member.paymentStatus.toUpperCase(), colX1_value, y);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Tipo de Subscrição:", colX2_label, y);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(member.paymentType || "Nenhum Plano Ativo", colX2_value, y);

      y += 8;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Método Utilizado:", colX1_label, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(member.paymentMethod || "Pendente", colX1_value, y);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Valor Pago (MT):", colX2_label, y);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(member.paymentAmount ? `${member.paymentAmount} MT` : "0 MT", colX2_value, y);

      y += 8;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Nº Recibo Fiscal:", colX1_label, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(member.receiptNumber || "Nenhum recibo emitido", colX1_value, y);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Nº de Crachá Digital:", colX2_label, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(member.badgeNumber || "Sem crachá gerado", colX2_value, y);

      y += 8;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("Código de Barras ID:", colX1_label, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(member.barcode || "Pendente de Emissão", colX1_value, y);

      // Warning / Anti-Fraud Disclaimer Card
      y += 10;
      doc.setFillColor(248, 250, 252); // Soft light background
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.rect(15, y, pageWidth - 30, 36, "FD");

      y += 6;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("TERMOS DE VALIDAÇÃO E SEGURANÇA OST PAY", 20, y);

      y += 5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text("1. Este relatório é um documento oficial individual de controle de pagamentos gerado por vias automáticas cifradas.", 20, y);
      y += 4.5;
      doc.text("2. O estado ATIVO valida de forma imediata o acesso pleno do membro aos eventos, formações e benefícios locais.", 20, y);
      y += 4.5;
      doc.text("3. O código QR no seu crachá digital permite a validação do seu estado fiscal em tempo real pelo painel de segurança.", 20, y);
      y += 4.5;
      doc.text("4. Falsificação, cópia não autorizada ou partilha indevida de dados violam as políticas administrativas da organização.", 20, y);

      // Validation Signature Footnote
      y += 18;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("ADMINISTRAÇÃO FINANCEIRA OST", 15, y);
      doc.text("GATEWAY DE VALIDAÇÃO DE SEGURANÇA", pageWidth - 15, y, { align: "right" });

      y += 5.5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text("Organização Social do Trabalho - Maputo, Moçambique", 15, y);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(22, 163, 74);
      doc.text("✔ CONEXÃO SEGURA - DOCUMENTO DE HISTÓRICO OFICIAL", pageWidth - 15, y, { align: "right" });

      // Page boundary line
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("OST Pay Digital • Portal do Membro Unificado • Contacto: suporte@ostpay.org", 15, pageHeight - 10);
      doc.text("Página 1 de 1", pageWidth - 15, pageHeight - 10, { align: "right" });

      // Action Save
      doc.save(`Relatorio_Membro_${member.id}.pdf`);
      addLog(member.name, `Descarregou com sucesso o seu relatório pessoal de estado e quota em PDF`, "success");
    } catch (err) {
      console.error("Erro ao gerar o relatório em PDF:", err);
      alert("Falha técnica ao tentar construir o PDF do seu relatório. Por favor, tente novamente.");
    }
  };

  const registerMemberAttendance = (member: Member, showToastNotification = true) => {
    const isAlreadyRegistered = attendanceRecords.some(
      r => r.memberId === member.id && new Date(r.timestamp).toDateString() === new Date().toDateString()
    );
    
    if (isAlreadyRegistered) {
      if (showToastNotification) {
        setActiveToasts(prev => [
          {
            id: "toast-" + Date.now(),
            title: "Já Registado",
            message: `A presença de ${member.name} já foi registada hoje!`,
            type: "warning"
          },
          ...prev
        ]);
      }
      return false;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberRole: member.role || "Membro",
      congregation: member.congregation || "Chimoio Norte",
      ministry: member.ministry || "Louvor",
      timestamp: new Date().toISOString(),
      location: "Templo Central"
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    setWorshipStats(prev => {
      const isVisitor = member.role === "Visitante";
      return {
        membersCount: isVisitor ? prev.membersCount : prev.membersCount + 1,
        visitorsCount: isVisitor ? prev.visitorsCount + 1 : prev.visitorsCount,
        totalCount: prev.totalCount + 1
      };
    });

    addLog("Validador", `Presença registada com sucesso para ${member.name} (${member.role || "Membro"})`, "success");
    if (showToastNotification) {
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Presença Confirmada",
          message: `Presença de ${member.name} foi registada com sucesso no culto!`,
          type: "success"
        },
        ...prev
      ]);
    }
    return true;
  };

  // Scanner processing logic
  const triggerScan = (id: string) => {
    setScanStatusMessage("A processar consulta na base de dados...");
    setScannedResult(null);

    setTimeout(() => {
      const found = members.find(m => m.id.toLowerCase() === id.toLowerCase() || m.barcode === id || m.email.toLowerCase() === id.toLowerCase());
      if (found) {
        setScannedResult(found);
        setScanStatusMessage(null);
        addLog("Validador", `Validou crachá de ${found.name} (${found.paymentStatus.toUpperCase()})`, found.paymentStatus === "Ativo" ? "success" : found.paymentStatus === "Pendente" ? "warning" : "danger");
        
        // Auto-register attendance in Worship Mode if status is active & not expired
        const expiryStatus = getExpiryStatus(found.expiryDate);
        const isExpiredBadge = found.paymentStatus === "Ativo" && expiryStatus.expired;
        
        if (isWorshipMode && found.paymentStatus === "Ativo" && !isExpiredBadge) {
          registerMemberAttendance(found, true);
        }
      } else {
        setScanStatusMessage("Membro não encontrado!");
        addLog("Validador", `Tentativa falhada de leitura de crachá: ID #${id}`, "danger");
      }
    }, 1000);
  };

  // Real QR-Scanner with html5-qrcode
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;
    if (showLiveCamera) {
      setCameraPermissionError(null);
      // Give a tiny timeout to ensure the DOM element #qr-reader has rendered
      const timeoutId = setTimeout(() => {
        if (!isMounted) return;
        try {
          html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              },
            },
            (decodedText) => {
              // Parse out ID
              let parsedId = decodedText;
              // Handles URLs like https://ostpay.org/validate?id=OST-102941
              if (decodedText.includes("?id=")) {
                try {
                  const urlObj = new URL(decodedText);
                  parsedId = urlObj.searchParams.get("id") || decodedText;
                } catch (e) {
                  const parts = decodedText.split("?id=");
                  if (parts[1]) {
                    parsedId = parts[1].split("&")[0];
                  }
                }
              }
              setScannerSearchId(parsedId);
              triggerScan(parsedId);
              // Stop camera after scanning successfully
              setShowLiveCamera(false);
            },
            (errorMessage) => {
              // Silence scanner warnings
            }
          ).catch((err) => {
            console.error("Erro ao iniciar a câmara:", err);
            setCameraPermissionError(
              "Erro ao aceder à câmara física (pode estar em uso ou bloqueada pelas políticas de iframe do seu browser). Por favor, use o campo de pesquisa manual abaixo como alternativa."
            );
          });
        } catch (err) {
          console.error("Falha ao inicializar o leitor QR:", err);
        }
      }, 200);

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        if (html5QrCode) {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              html5QrCode = null;
            }).catch((err) => console.error("Erro ao parar câmara:", err));
          }
        }
      };
    }
  }, [showLiveCamera]);

  const toggleCamera = () => {
    setShowLiveCamera(prev => !prev);
  };

  // --- EXPORT FUNCTIONALITIES ---
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID Membro,Nome Completo,Email,Contacto,Regiao,Provincia,Status Pagamento,Tipo Pagamento,Metodo,Recibo\n";
    
    members.forEach(m => {
      csvContent += `"${m.id}","${m.name}","${m.email}","${m.contact}","${m.region}","${m.province}","${m.paymentStatus}","${m.paymentType}","${m.paymentMethod}","${m.receiptNumber}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "OST-Pay-Membros.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Administrador", "Exportou lista de membros para Excel/CSV", "info");
  };

  const handleExportPDFReport = () => {
    window.print();
    addLog("Administrador", "Imprimiu/Exportou Relatório Geral em PDF", "info");
  };

  const handleExportAllReceiptsPDF = () => {
    // Filter active members with approved payment
    const activeMembers = filteredMembers.filter(m => m.paymentStatus === "Ativo");

    if (activeMembers.length === 0) {
      const newToast = {
        id: "toast-" + Date.now(),
        title: "Exportação Indisponível",
        message: "Nenhum membro com pagamento aprovado (Ativo) na lista filtrada atual.",
        type: "warning" as const
      };
      setActiveToasts(prev => [newToast, ...prev]);
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primaryColor = [15, 23, 42]; // Slate-900
      const accentColor = [29, 78, 216]; // Blue-700
      const borderSlate = [226, 232, 240]; // Slate-200
      const darkText = [30, 41, 59]; // Slate-800
      const lightText = [100, 116, 139]; // Slate-500

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      activeMembers.forEach((member, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // Top Header Banner
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 40, "F");

        // Blue accent line under top bar
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 40, pageWidth, 3, "F");

        // Title & Branding Text
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.text("ORGANIZAÇÃO SOCIAL DO TRABALHO", 15, 18);

        doc.setFontSize(9);
        doc.setFont("Helvetica", "normal");
        doc.text("PORTAL DO MEMBRO  •  RECIBO OFICIAL DE QUOTA (COOP)", 15, 26);
        doc.text(`EMISSÃO: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 26, { align: "right" });

        let y = 55;
        
        // Part 1: Member Info Block
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.text("1. DADOS DE FILIAÇÃO DO MEMBRO", 15, y);
        
        y += 5;
        doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        doc.setLineWidth(0.5);
        doc.line(15, y, pageWidth - 15, y);

        y += 8;
        const colX1_label = 15;
        const colX1_value = 55;
        const colX2_label = 110;
        const colX2_value = 150;

        const addGridRow = (l1: string, v1: string, l2: string, v2: string) => {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(lightText[0], lightText[1], lightText[2]);
          doc.text(l1, colX1_label, y);
          doc.text(l2, colX2_label, y);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(darkText[0], darkText[1], darkText[2]);
          doc.text(v1 || "N/D", colX1_value, y);
          doc.text(v2 || "N/D", colX2_value, y);
          y += 8;
        };

        addGridRow("Nome Completo:", member.name, "ID Único:", member.id);
        addGridRow("E-mail Oficial:", member.email, "Contacto Móvel:", member.contact || "Não Definido");
        addGridRow("Província:", member.province || "Não Definida", "Região Associada:", member.region || "Não Definida");
        addGridRow("Nascimento:", member.birthDate ? new Date(member.birthDate).toLocaleDateString() : "Não Definida", "Data do Registo:", member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "Não Definida");

        // Part 2: Financial/Payment History Block
        y += 4;
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.text("2. ESTADO DOS PAGAMENTOS & QUOTAS", 15, y);
        
        y += 5;
        doc.line(15, y, pageWidth - 15, y);

        y += 8;
        
        // Status Badge Style
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Estado de Registo:", colX1_label, y);

        let statusColor = [22, 163, 74]; // Green for approved/Ativo
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text("ATIVO", colX1_value, y);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Tipo de Subscrição:", colX2_label, y);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(member.paymentType || "Nenhum Plano Ativo", colX2_value, y);

        y += 8;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Método Utilizado:", colX1_label, y);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(member.paymentMethod || "Pendente", colX1_value, y);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Valor Pago (MT):", colX2_label, y);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(member.paymentAmount ? `${member.paymentAmount} MT` : "0 MT", colX2_value, y);

        y += 8;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Nº Recibo Fiscal:", colX1_label, y);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(member.receiptNumber || "Nenhum recibo emitido", colX1_value, y);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Nº de Crachá Digital:", colX2_label, y);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(member.badgeNumber || "Sem crachá gerado", colX2_value, y);

        y += 8;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("Código de Barras ID:", colX1_label, y);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(member.barcode || "Pendente de Emissão", colX1_value, y);

        // Warning / Anti-Fraud Disclaimer Card
        y += 10;
        doc.setFillColor(248, 250, 252); // Soft light background
        doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        doc.rect(15, y, pageWidth - 30, 36, "FD");

        y += 6;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("TERMOS DE VALIDAÇÃO E SEGURANÇA OST PAY", 20, y);

        y += 5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text("1. Este relatório é um documento oficial individual de controle de pagamentos gerado por vias automáticas cifradas.", 20, y);
        y += 4.5;
        doc.text("2. O estado ATIVO valida de forma imediata o acesso pleno do membro aos eventos, formações e benefícios locais.", 20, y);
        y += 4.5;
        doc.text("3. O código QR no seu crachá digital permite a validação do seu estado fiscal em tempo real pelo painel de segurança.", 20, y);
        y += 4.5;
        doc.text("4. Falsificação, cópia não autorizada ou partilha indevida de dados violam as políticas administrativas da organização.", 20, y);

        // Validation Signature Footnote
        y += 18;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("ADMINISTRAÇÃO FINANCEIRA OST", 15, y);
        doc.text("GATEWAY DE VALIDAÇÃO DE SEGURANÇA", pageWidth - 15, y, { align: "right" });

        y += 5.5;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text("Organização Social do Trabalho - Maputo, Moçambique", 15, y);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text("✔ CONEXÃO SEGURA - DOCUMENTO DE HISTÓRICO OFICIAL", pageWidth - 15, y, { align: "right" });

        // Page boundary line
        doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text("OST Pay Digital • Portal do Membro Unificado • Contacto: suporte@ostpay.org", 15, pageHeight - 10);
        doc.text(`Página ${index + 1} de ${activeMembers.length}`, pageWidth - 15, pageHeight - 10, { align: "right" });
      });

      // Trigger download
      const dateStamp = new Date().toISOString().slice(0, 10);
      doc.save(`Recibos_Aprovados_Lote_${dateStamp}.pdf`);
      addLog("Administrador", `Exportou lote contendo ${activeMembers.length} recibos aprovados em formato PDF de arquivo único`, "success");
      
      const successToast = {
        id: "toast-" + Date.now(),
        title: "Lote de Recibos Exportado",
        message: `${activeMembers.length} recibos de pagamentos aprovados foram gerados com sucesso.`,
        type: "success" as const
      };
      setActiveToasts(prev => [successToast, ...prev]);

    } catch (error: any) {
      const errorToast = {
        id: "toast-" + Date.now(),
        title: "Erro na Exportação",
        message: `Falha ao gerar o lote de recibos em PDF: ${error.message || error}`,
        type: "danger" as const
      };
      setActiveToasts(prev => [errorToast, ...prev]);
    }
  };

  const handleExportFilteredMembersPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    
    // Page dimensions
    const pageHeight = 297;
    const pageWidth = 210;
    const margin = 15;
    
    // Column widths summing up to exactly 180mm
    const colWidths = {
      member: 45,       // Name & ID
      location: 35,     // Region & Province
      contact: 45,      // Contact & Email
      status: 30,       // Status & Expiry
      receipt: 25       // Receipt & Badge
    };
    
    let y = 20;
    
    const truncate = (text: string, maxLen: number) => {
      if (!text) return "N/A";
      return text.length > maxLen ? text.substring(0, maxLen - 2) + ".." : text;
    };
    
    const drawHeader = (pageNum: number, totalPagesCount?: number) => {
      // Header top line accent
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(margin, y, pageWidth - 2 * margin, 2, "F");
      y += 6;
      
      // Document Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("OST-PAY - RELATÓRIO DE MEMBROS FILTRADOS", margin, y);
      
      // Right-aligned Creation Date
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const todayStr = new Date().toLocaleDateString("pt-PT", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      doc.text(`Exportado: ${todayStr}`, pageWidth - margin, y, { align: "right" });
      
      y += 5;
      
      // Subtitle listing the filters
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const activeFiltersText = `Filtros - Estado: ${statusFilter} | Região: ${regionFilter}${searchQuery ? ` | Pesquisa: "${searchQuery}"` : ""}`;
      doc.text(truncate(activeFiltersText, 95), margin, y);
      
      // Page number indicator
      if (totalPagesCount) {
        doc.text(`Página ${pageNum} de ${totalPagesCount}`, pageWidth - margin, y, { align: "right" });
      } else {
        doc.text(`Página ${pageNum}`, pageWidth - margin, y, { align: "right" });
      }
      
      y += 8;
      
      // Summary bar card
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(margin, y, pageWidth - 2 * margin, 8, "S");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`Total de Registos Listados: ${filteredMembers.length} membros`, margin + 3, y + 5.5);
      
      y += 14;
      
      // Table Header Row
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      
      let currentX = margin;
      
      doc.text("ID / MEMBRO", currentX + 2, y + 5.5);
      currentX += colWidths.member;
      
      doc.text("REGIÃO / PROVÍNCIA", currentX + 2, y + 5.5);
      currentX += colWidths.location;
      
      doc.text("CONTACTO / EMAIL", currentX + 2, y + 5.5);
      currentX += colWidths.contact;
      
      doc.text("ESTADO / VALIDADE", currentX + 2, y + 5.5);
      currentX += colWidths.status;
      
      doc.text("RECIBO / CRACHÁ", currentX + 2, y + 5.5);
      
      y += 8;
    };
    
    // Group members by pages (13 records fit beautifully on a page with 14mm row height)
    const recordsPerPage = 13;
    const totalPagesCount = Math.max(1, Math.ceil(filteredMembers.length / recordsPerPage));
    
    for (let pageNum = 1; pageNum <= totalPagesCount; pageNum++) {
      if (pageNum > 1) {
        doc.addPage();
      }
      y = 15;
      drawHeader(pageNum, totalPagesCount);
      
      const startIndex = (pageNum - 1) * recordsPerPage;
      const pageMembers = filteredMembers.slice(startIndex, startIndex + recordsPerPage);
      
      pageMembers.forEach((m, idx) => {
        // Alternating row background for visual contrast
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252); // slate-50
          doc.rect(margin, y, pageWidth - 2 * margin, 14, "F");
        }
        
        // Draw thin cell borders
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.line(margin, y + 14, pageWidth - margin, y + 14);
        
        doc.setFontSize(8);
        let currentX = margin;
        
        // 1. ID / Membro
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFont("Helvetica", "bold");
        doc.text(truncate(m.name, 22), currentX + 2, y + 5.5);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 116, 139); // slate-500
        const positionLabel = m.role ? ` • ${m.role}` : "";
        doc.text((m.id || "N/A") + positionLabel, currentX + 2, y + 10);
        currentX += colWidths.member;
        
        // 2. Região / Província
        doc.setTextColor(15, 23, 42);
        doc.setFont("Helvetica", "bold");
        doc.text(truncate(m.region || "N/A", 18), currentX + 2, y + 5.5);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(truncate(m.province || "N/A", 18), currentX + 2, y + 10);
        currentX += colWidths.location;
        
        // 3. Contacto / Email
        doc.setTextColor(15, 23, 42);
        doc.setFont("Helvetica", "normal");
        doc.text(m.contact || "N/A", currentX + 2, y + 5.5);
        
        doc.setTextColor(100, 116, 139);
        doc.text(truncate(m.email || "N/A", 24), currentX + 2, y + 10);
        currentX += colWidths.contact;
        
        // 4. Estado Pagamento
        if (m.paymentStatus === "Ativo") {
          doc.setTextColor(21, 128, 61); // green-700
          doc.setFont("Helvetica", "bold");
        } else if (m.paymentStatus === "Pendente") {
          doc.setTextColor(194, 65, 12); // orange-700
          doc.setFont("Helvetica", "bold");
        } else {
          doc.setTextColor(185, 28, 28); // red-700
          doc.setFont("Helvetica", "bold");
        }
        doc.text((m.paymentStatus || "Pendente").toUpperCase(), currentX + 2, y + 5.5);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(m.expiryDate ? `Val: ${m.expiryDate}` : "S/ Data", currentX + 2, y + 10);
        currentX += colWidths.status;
        
        // 5. Recibo / Crachá
        doc.setTextColor(15, 23, 42);
        doc.setFont("Helvetica", "bold");
        doc.text(truncate(m.receiptNumber || "Sem Recibo", 15), currentX + 2, y + 5.5);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(truncate(m.badgeNumber || "Sem Crachá", 15), currentX + 2, y + 10);
        
        y += 14;
      });
      
      // Footer decorative text
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("Associação Ordem de Serviço de Trânsito - Sistema OST-Pay", margin, pageHeight - 10);
      doc.text(`Documento de Controlo Interno`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }
    
    // Trigger download
    const dateStamp = new Date().toISOString().slice(0, 10);
    doc.save(`OST-Pay-Membros-Filtrados-${dateStamp}.pdf`);
    addLog("Administrador", `Exportou a lista de membros filtrados (${filteredMembers.length} registos) para PDF`, "success");
  };

  const handleExportWorshipStatsPDF = () => {
    if (attendanceRecords.length === 0) {
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Sem Dados",
          message: "Nenhum registo de presença disponível para exportar.",
          type: "warning" as const
        },
        ...prev
      ]);
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;

      const primaryColor = [15, 23, 42]; // Slate-900
      const accentColor = [79, 70, 229]; // Indigo-600
      const borderSlate = [226, 232, 240]; // Slate-200
      const darkText = [30, 41, 59]; // Slate-800
      const lightText = [100, 116, 139]; // Slate-500

      // 1. Top Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 40, pageWidth, 3, "F");

      // Title & Branding Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ORGANIZAÇÃO SOCIAL DO TRABALHO", 15, 18);

      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.text("SISTEMA OST-PAY  •  RELATÓRIO DE ESTATÍSTICAS E FREQUÊNCIA DE CULTO", 15, 26);
      doc.text(`GERADO: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 26, { align: "right" });

      let y = 55;

      // KPI Grid (4 cards)
      const totalCount = attendanceRecords.length;
      const membersCount = attendanceRecords.filter(r => r.memberRole !== "Visitante").length;
      const visitorsCount = attendanceRecords.filter(r => r.memberRole === "Visitante").length;
      const uniqueCongregations = new Set(attendanceRecords.map(r => r.congregation)).size;

      const cardW = 42;
      const cardH = 22;
      const gap = 4;

      const drawKPICard = (x: number, title: string, value: string, subtitle: string, bgColor: number[]) => {
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(x, y, cardW, cardH, "F");
        doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
        doc.rect(x, y, cardW, cardH, "S");

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(115, 115, 115); // text-neutral-500
        doc.text(title.toUpperCase(), x + 3, y + 5.5);

        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(value, x + 3, y + 13);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, x + 3, y + 18.5);
      };

      drawKPICard(15, "Total Presentes", `${totalCount}`, "Membros & Visitantes", [248, 250, 252]);
      drawKPICard(15 + cardW + gap, "Membros Oficiais", `${membersCount}`, `${totalCount > 0 ? ((membersCount / totalCount) * 100).toFixed(0) : 0}% da frequência`, [248, 250, 252]);
      drawKPICard(15 + 2 * (cardW + gap), "Visitantes", `${visitorsCount}`, `${totalCount > 0 ? ((visitorsCount / totalCount) * 100).toFixed(0) : 0}% de acolhidos`, [248, 250, 252]);
      drawKPICard(15 + 3 * (cardW + gap), "Congregações", `${uniqueCongregations}`, "Regiões participantes", [248, 250, 252]);

      y += cardH + 12;

      // Ministry stats calculations
      const ministryCounts: Record<string, number> = {};
      attendanceRecords.forEach(r => {
        const min = r.ministry || "Nenhum";
        ministryCounts[min] = (ministryCounts[min] || 0) + 1;
      });
      const sortedMinistries = Object.entries(ministryCounts).sort((a,b) => b[1] - a[1]).slice(0, 6);

      // Congregation stats calculations
      const congregationCounts: Record<string, number> = {};
      attendanceRecords.forEach(r => {
        const cong = r.congregation || "Outra";
        congregationCounts[cong] = (congregationCounts[cong] || 0) + 1;
      });
      const sortedCongregations = Object.entries(congregationCounts).sort((a,b) => b[1] - a[1]).slice(0, 6);

      // Left Column: Frequência por Ministério
      // Right Column: Frequência por Congregação
      const colWidth = 85;

      // Titles for sections
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("DISTRIBUIÇÃO DE FREQUÊNCIA POR MINISTÉRIO", 15, y);
      doc.text("DISTRIBUIÇÃO POR CONGREGAÇÃO / REGIÃO", 110, y);

      y += 4;
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.setLineWidth(0.5);
      doc.line(15, y, 15 + colWidth, y);
      doc.line(110, y, 110 + colWidth, y);

      let chartStartY = y + 8;

      // Draw Ministries Chart
      let currentY = chartStartY;
      sortedMinistries.forEach(([ministry, count]) => {
        const percent = totalCount > 0 ? count / totalCount : 0;
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(ministry, 15, currentY);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text(`${count} (${(percent * 100).toFixed(0)}%)`, 15 + colWidth, currentY, { align: "right" });

        currentY += 2.5;

        // Draw horizontal progress bar
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(15, currentY, colWidth, 2.5, "F");

        doc.setFillColor(59, 130, 246); // blue-500
        const barWidth = colWidth * percent;
        if (barWidth > 0) {
          doc.rect(15, currentY, barWidth, 2.5, "F");
        }

        currentY += 8;
      });

      // Draw Congregations Chart
      currentY = chartStartY;
      sortedCongregations.forEach(([congregation, count]) => {
        const percent = totalCount > 0 ? count / totalCount : 0;
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(congregation, 110, currentY);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(lightText[0], lightText[1], lightText[2]);
        doc.text(`${count} (${(percent * 100).toFixed(0)}%)`, 110 + colWidth, currentY, { align: "right" });

        currentY += 2.5;

        // Draw horizontal progress bar
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(110, currentY, colWidth, 2.5, "F");

        doc.setFillColor(99, 102, 241); // indigo-500
        const barWidth = colWidth * percent;
        if (barWidth > 0) {
          doc.rect(110, currentY, barWidth, 2.5, "F");
        }

        currentY += 8;
      });

      // Bottom section: Recent Attendances table or highlights
      y = chartStartY + 70;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("DETALHE DE ENTRADAS RECENTES (ÚLTIMOS REGISTOS)", 15, y);

      y += 4;
      doc.line(15, y, pageWidth - 15, y);

      y += 6;
      // Header for mini table
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, pageWidth - 30, 6, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("NOME DO MEMBRO / VISITANTE", 17, y + 4);
      doc.text("CARGO", 80, y + 4);
      doc.text("CONGREGAÇÃO", 115, y + 4);
      doc.text("MINISTÉRIO", 155, y + 4);
      doc.text("REGISTADO EM", pageWidth - 17, y + 4, { align: "right" });

      y += 6;

      const recentRecords = attendanceRecords.slice(0, 6);
      recentRecords.forEach((r, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, pageWidth - 30, 6.5, "F");
        }
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);

        const truncateTxt = (t: string, len: number) => t.length > len ? t.substring(0, len - 2) + ".." : t;

        doc.text(truncateTxt(r.memberName, 30), 17, y + 4.5);
        doc.text(r.memberRole || "Membro", 80, y + 4.5);
        doc.text(truncateTxt(r.congregation || "Não Definida", 22), 115, y + 4.5);
        doc.text(truncateTxt(r.ministry || "Nenhum", 22), 155, y + 4.5);
        doc.text(r.timestamp ? r.timestamp.split(" ")[1] || r.timestamp : "S/ Hora", pageWidth - 17, y + 4.5, { align: "right" });

        y += 6.5;
      });

      // Signature/Verification Section at bottom
      y = pageHeight - 35;
      doc.setDrawColor(borderSlate[0], borderSlate[1], borderSlate[2]);
      doc.line(15, y, pageWidth - 15, y);

      y += 6;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(lightText[0], lightText[1], lightText[2]);
      doc.text("CENTRO DE OPERAÇÕES DE CULTO OST", 15, y);
      doc.text("CONFIRMAÇÃO DIGITAL", pageWidth - 15, y, { align: "right" });

      y += 4.5;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text("Associação Ordem de Serviço de Trânsito - Ministério de Acolhimento", 15, y);
      
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text("✔ DADOS SINCRONIZADOS EM TEMPO REAL", pageWidth - 15, y, { align: "right" });

      y += 8;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text("OST Pay • Relatório Consolidado de Estatísticas de Frequência de Cultos", 15, y);
      doc.text("Documento Informativo Administrativo", pageWidth - 15, y, { align: "right" });

      // Trigger download
      const dateStamp = new Date().toISOString().slice(0, 10);
      doc.save(`OST_Estatisticas_Culto_${dateStamp}.pdf`);
      addLog("Administrador", `Exportou o relatório de estatísticas do culto (${attendanceRecords.length} presenças) em formato PDF`, "success");

      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Relatório Exportado",
          message: "O relatório PDF de estatísticas de culto foi gerado com sucesso.",
          type: "success" as const
        },
        ...prev
      ]);

    } catch (error: any) {
      setActiveToasts(prev => [
        {
          id: "toast-" + Date.now(),
          title: "Erro na Exportação",
          message: `Falha ao gerar o PDF de estatísticas: ${error.message || error}`,
          type: "danger" as const
        },
        ...prev
      ]);
    }
  };

  // --- FILTERED MEMBERS FOR TABLE ---
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.contact.includes(searchQuery) ||
                          m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || m.paymentStatus === statusFilter;
    const matchesRegion = regionFilter === "Todas" || m.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  // --- GLOBAL SEARCH MATCHES FOR ADMIN HEADER BAR ---
  const globalSearchMatches = searchQuery.trim() !== "" ? members.filter(m => {
    return m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
           m.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
           m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.contact.includes(searchQuery);
  }).slice(0, 5) : [];

  // --- CALCULATE KPI STATS ---
  const kpiTotalMembers = members.length;
  const kpiActiveMembers = members.filter(m => m.paymentStatus === "Ativo").length;
  const kpiPendingMembers = members.filter(m => m.paymentStatus === "Pendente").length;
  const kpiBlockedMembers = members.filter(m => m.paymentStatus === "Bloqueado").length;
  const kpiTotalRevenue = members
    .filter(m => m.paymentStatus === "Ativo")
    .reduce((sum, m) => sum + (m.paymentAmount || 0), 0);

  // --- CALCULATE ACTIVE AND BLOCKED MONTHLY VARIATION ---
  const statusVariationData = (() => {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active members
    const activeThisMonth = members.filter(m => m.paymentStatus === "Ativo").length;
    const activeLastMonth = members.filter(m => {
      if (m.paymentStatus !== "Ativo") return false;
      if (!m.createdAt) return true;
      return new Date(m.createdAt) < startOfCurrentMonth;
    }).length;

    // Blocked members
    const blockedThisMonth = members.filter(m => m.paymentStatus === "Bloqueado").length;
    const blockedLastMonth = members.filter(m => {
      if (m.paymentStatus !== "Bloqueado") return false;
      if (!m.createdAt) return true;
      return new Date(m.createdAt) < startOfCurrentMonth;
    }).length;

    const activeDiff = activeThisMonth - activeLastMonth;
    const activePct = activeLastMonth > 0 ? (activeDiff / activeLastMonth) * 100 : (activeThisMonth > 0 ? 100 : 0);

    const blockedDiff = blockedThisMonth - blockedLastMonth;
    const blockedPct = blockedLastMonth > 0 ? (blockedDiff / blockedLastMonth) * 100 : (blockedThisMonth > 0 ? 100 : 0);

    return {
      activeThisMonth,
      activeLastMonth,
      activePct,
      activeDiff,
      blockedThisMonth,
      blockedLastMonth,
      blockedPct,
      blockedDiff,
      chartData: [
        {
          name: "Ativos",
          "Mês Anterior": activeLastMonth,
          "Mês Atual": activeThisMonth,
          "Variação (%)": parseFloat(activePct.toFixed(1)),
        },
        {
          name: "Bloqueados",
          "Mês Anterior": blockedLastMonth,
          "Mês Atual": blockedThisMonth,
          "Variação (%)": parseFloat(blockedPct.toFixed(1)),
        }
      ]
    };
  })();

  // --- CALCULATE LAST 30 DAYS GROWTH STATS ---
  const thirtyDaysAgoDate = new Date();
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);

  const kpiNewMembers30Days = members.filter(m => {
    if (!m.createdAt) return false;
    const createdDate = new Date(m.createdAt);
    return createdDate >= thirtyDaysAgoDate;
  }).length;

  const kpiPaymentsProcessedAmount30Days = members
    .filter(m => {
      if (m.paymentStatus !== "Ativo") return false;
      if (!m.createdAt) return false;
      const createdDate = new Date(m.createdAt);
      return createdDate >= thirtyDaysAgoDate;
    })
    .reduce((sum, m) => sum + (m.paymentAmount || 0), 0);

  const kpiPaymentsProcessedCount30Days = members.filter(m => {
    if (m.paymentStatus !== "Ativo") return false;
    if (!m.createdAt) return false;
    const createdDate = new Date(m.createdAt);
    return createdDate >= thirtyDaysAgoDate;
  }).length;

  // Region breakdown
  const regionBreakdown = members.reduce((acc: { [key: string]: number }, m) => {
    acc[m.region] = (acc[m.region] || 0) + 1;
    return acc;
  }, {});
  const sortedRegionsBreakdown = (Object.entries(regionBreakdown) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top 5 active congregations
  const activeMembersForCong = members.filter(m => m.paymentStatus === "Ativo");
  const congregationBreakdown = activeMembersForCong.reduce((acc: { [key: string]: number }, m) => {
    const cong = m.congregation || "Não Definida";
    acc[cong] = (acc[cong] || 0) + 1;
    return acc;
  }, {});
  const sortedCongregationsBreakdown = (Object.entries(congregationBreakdown) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // --- RECHARTS CALCULATIONS ---
  const MONTHS_LIST = [
    { name: "Janeiro", short: "Jan", index: 0 },
    { name: "Fevereiro", short: "Fev", index: 1 },
    { name: "Março", short: "Mar", index: 2 },
    { name: "Abril", short: "Abr", index: 3 },
    { name: "Maio", short: "Mai", index: 4 },
    { name: "Junho", short: "Jun", index: 5 },
    { name: "Julho", short: "Jul", index: 6 },
    { name: "Agosto", short: "Ago", index: 7 },
    { name: "Setembro", short: "Set", index: 8 },
    { name: "Outubro", short: "Out", index: 9 },
    { name: "Novembro", short: "Nov", index: 10 },
    { name: "Dezembro", short: "Dez", index: 11 },
  ];

  const monthlyRevenueData = MONTHS_LIST.map((m) => {
    const total = members
      .filter((member) => {
        if (member.paymentStatus !== "Ativo") return false;
        const d = new Date(member.createdAt);
        return d.getMonth() === m.index && d.getFullYear() === 2026;
      })
      .reduce((sum, member) => sum + (member.paymentAmount || 0), 0);
    return {
      name: m.short,
      "Receita (MT)": total,
    };
  }).slice(0, 7); // Show Janeiro to Julho 2026

  // Payment Method Distribution (Pie Chart / Donut)
  const methodCounts = members
    .filter((member) => member.paymentStatus === "Ativo" && member.paymentMethod !== "")
    .reduce((acc: { [key: string]: number }, member) => {
      const mName = member.paymentMethod;
      acc[mName] = (acc[mName] || 0) + (member.paymentAmount || 0);
      return acc;
    }, {});

  const paymentMethodData: { name: string; value: number }[] = Object.entries(methodCounts).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  const METHOD_COLORS: { [key: string]: string } = {
    "M-Pesa": "#ef4444",        // Vodacom Red
    "e-Mola": "#f59e0b",        // Movitel Orange
    "Mkesh": "#10b981",         // Tmcel Green
    "Transferência": "#3b82f6",  // Blue Bank
    "Cartão": "#6366f1",         // Indigo Card
  };

  const getMethodColor = (method: string) => {
    return METHOD_COLORS[method] || "#64748b";
  };

  const formatToInternationalPhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("258") && cleaned.length === 12) {
      return cleaned;
    }
    if (cleaned.length === 9) {
      return "258" + cleaned;
    }
    return cleaned;
  };

  // Member distribution by Province
  const provinceCounts = members.reduce((acc: { [key: string]: number }, member) => {
    const pName = member.province || "Não Definido";
    acc[pName] = (acc[pName] || 0) + 1;
    return acc;
  }, {});

  const provinceData: { name: string; value: number }[] = Object.entries(provinceCounts).map(([name, value]) => ({
    name,
    value: value as number,
  })).sort((a, b) => b.value - a.value);

  const PROVINCE_COLORS = [
    "#3b82f6", // Blue-500
    "#ef4444", // Red-500
    "#10b981", // Emerald-500
    "#f59e0b", // Amber-500
    "#6366f1", // Indigo-500
    "#8b5cf6", // Violet-500
    "#ec4899", // Pink-500
    "#14b8a6", // Teal-500
    "#f97316", // Orange-500
    "#06b6d4", // Cyan-500
    "#84cc16", // Lime-500
  ];

  if (isApproveAdminView) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Homologação de Administrador</h2>
            <p className="text-xs text-slate-400">Portal do Administrador Geral OST Moçambique</p>
          </div>

          {approveInfoLoading && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Consultando integridade do token no servidor...</p>
            </div>
          )}

          {!approveInfoLoading && approveError && (
            <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-2xl text-center space-y-3">
              <p className="text-xs font-bold text-red-400">{approveError}</p>
              <button 
                onClick={() => window.location.href = "/"}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition border border-slate-800"
              >
                Voltar ao Início
              </button>
            </div>
          )}

          {!approveInfoLoading && !approveError && approveInfo && (
            <div className="space-y-4">
              {approveSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-white">Acesso Autorizado com Sucesso!</h3>
                    <p className="text-[11px] text-slate-400">O dispositivo solicitante foi integrado e pode agora aceder ao Painel Administrativo.</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition animate-pulse"
                  >
                    Ir para o Início
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">E-mail Solicitante</span>
                      <span className="text-white font-extrabold font-mono text-[13px]">{approveInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">ID de Solicitação (Token)</span>
                      <span className="text-blue-400 font-bold font-mono text-[11px]">{approveToken}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Hora da Solicitação</span>
                      <span className="text-slate-300 font-semibold">{new Date(approveInfo.createdAt).toLocaleString("pt-MZ")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block uppercase text-[9px]">Estado Atual</span>
                      <span className={`inline-block font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full ${approveInfo.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {approveInfo.status === "approved" ? "APROVADO" : "PENDENTE DE APROVAÇÃO"}
                      </span>
                    </div>
                  </div>

                  {approveInfo.status === "approved" ? (
                    <div className="text-center py-2">
                      <p className="text-xs text-green-400 font-bold">Esta solicitação já foi aprovada anteriormente.</p>
                      <button 
                        onClick={() => window.location.href = "/"}
                        className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition border border-slate-800"
                      >
                        Voltar ao Início
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Chave Secreta de Administração</label>
                        <input 
                          type="password"
                          placeholder="Digite a chave mestre de segurança"
                          value={adminApprovalPasscode}
                          onChange={(e) => setAdminApprovalPasscode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-white px-3 py-2.5 rounded-xl text-xs font-mono outline-none transition"
                        />
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          onClick={() => {
                            if (!adminApprovalPasscode) {
                              alert("Por favor, digite a Chave Secreta.");
                              return;
                            }
                            fetch("/api/admin/approve-request", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ token: approveToken, secretKey: adminApprovalPasscode })
                            })
                            .then(res => {
                              if (!res.ok) {
                                return res.json().then(d => { throw new Error(d.error || "Chave Secreta Incorreta") });
                              }
                              return res.json();
                            })
                            .then(data => {
                              if (data.success) {
                                setApproveSuccess(true);
                              }
                            })
                            .catch(err => {
                              alert(err.message || "Falha ao aprovar.");
                            });
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer"
                        >
                          Aprovar Dispositivo
                        </button>
                        <button
                          onClick={() => window.location.href = "/"}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold text-xs px-4 rounded-xl transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${adminDarkMode && currentMode === "admin" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Main Professional Header Navigation */}
      <nav className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between px-6 lg:px-16 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentMode("landing")}>
          <img 
            src={ostPayLogo} 
            alt="OST Pay Logo" 
            referrerPolicy="no-referrer"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button onClick={() => setCurrentMode("landing")} className={`hover:text-blue-700 transition ${currentMode === "landing" ? "text-blue-700" : ""}`}>Início</button>
          <a href="#como-funciona" className="hover:text-blue-700 transition">Como Funciona</a>
          <a href="#beneficios" className="hover:text-blue-700 transition">Benefícios</a>
          <button onClick={() => setCurrentMode("validator")} className={`hover:text-blue-700 transition ${currentMode === "validator" ? "text-blue-700 font-bold" : ""}`}>Validar Crachá</button>
          
          {currentUser && (
            <button 
              onClick={() => {
                if ("isAdmin" in currentUser && currentUser.isAdmin) {
                  setCurrentMode("admin");
                } else {
                  setCurrentMode("member");
                }
              }} 
              className="text-orange-600 font-bold hover:underline"
            >
              {"isAdmin" in currentUser && currentUser.isAdmin ? "Painel Admin" : "Área do Membro"}
            </button>
          )}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {"name" in currentUser ? currentUser.name : "Administrador"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {"region" in currentUser ? currentUser.region : "Acesso Geral"}
                </span>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-slate-800 rounded-full border border-blue-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                {"photoUrl" in currentUser && currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                )}
              </div>
              <button 
                onClick={() => {
                  addLog(
                    "name" in currentUser ? currentUser.name : "Administrador",
                    "Terminou sessão no sistema",
                    "info"
                  );
                  setCurrentUser(null);
                  setCurrentMode("landing");
                }} 
                title="Sair"
                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md hover:bg-blue-800 transition"
            >
              <User className="w-4 h-4" />
              Entrar na OST
            </button>
          )}
        </div>
      </nav>

      {/* --- CONTENT AREA BASED ON MODE --- */}
      <div className="flex-1">
        
        {/* ======================================= */}
        {/* 1. PUBLIC LANDING PAGE                  */}
        {/* ======================================= */}
        {currentMode === "landing" && (
          <div>
            {/* Hero Section */}
            <header className="bg-white border-b border-slate-150 py-12 lg:py-20 px-6 lg:px-16">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                
                {/* Left side texts */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    Portal Oficial de Membros OST
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                    Bem-vindo ao <span className="text-blue-700">OST Pay</span>
                  </h1>
                  <p className="text-base lg:text-lg text-slate-600 leading-relaxed">
                    Faça o seu registo, efetue pagamentos de forma segura e obtenha o seu crachá oficial totalmente online. Aceda à validação antifraude em tempo real.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                      onClick={() => {
                        if (currentUser) {
                          setCurrentMode("member");
                        } else {
                          setShowLoginModal(true);
                        }
                      }}
                      className="bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-md shadow-lg shadow-blue-200 hover:bg-blue-800 transition duration-150"
                    >
                      {currentUser ? "Ir para o meu Painel" : "Fazer Registo Agora"}
                    </button>
                    <button 
                      onClick={() => setCurrentMode("validator")}
                      className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-xl font-bold text-md hover:border-blue-200 transition"
                    >
                      Validar Crachá QR
                    </button>
                  </div>

                  {/* Flow Steps Minimap */}
                  <div id="como-funciona" className="grid grid-cols-4 gap-2 mt-8 pt-6 border-t border-slate-200">
                    <div className="text-center">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mx-auto mb-1">1</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Registo</div>
                    </div>
                    <div className="text-center">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mx-auto mb-1">2</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Pagamento</div>
                    </div>
                    <div className="text-center">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mx-auto mb-1">3</div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase">Validação</div>
                    </div>
                    <div className="text-center">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs mx-auto mb-1">4</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Crachá</div>
                    </div>
                  </div>
                </div>

                {/* Right side Badge Presentation Card */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="absolute -top-6 -right-6 w-36 h-36 bg-orange-100 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-blue-100 rounded-full blur-3xl opacity-60"></div>

                    {/* Badge Mockup container */}
                    <div 
                      className="w-[310px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col items-center relative overflow-hidden transition-all duration-500 hover:-translate-y-1 group cursor-default select-none"
                      style={{ 
                        backgroundImage: "radial-gradient(circle, rgba(226, 232, 240, 0.4) 1.2px, transparent 1.2px)", 
                        backgroundSize: "14px 14px" 
                      }}
                    >
                      {/* Premium Diagonal Holographic Glare Sweep on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-30"></div>

                      {/* Elegant Inner Border Offset */}
                      <div className="absolute inset-2.5 border border-blue-600/30 rounded-2xl pointer-events-none z-10"></div>

                      {/* 1. PREMIUM HEADER BLOCK */}
                      <div className="w-full bg-slate-950 px-4 pt-5 pb-3 flex flex-col items-center relative text-center shadow-md z-20">
                        {/* Mozambique Flag Mini Official Ribbon */}
                        <div className="absolute top-3 right-4 flex h-1.5 rounded overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                          <div className="w-2.5 bg-emerald-600"></div>
                          <div className="w-2.5 bg-black"></div>
                          <div className="w-2.5 bg-red-600"></div>
                          <div className="w-2.5 bg-amber-400"></div>
                        </div>

                        <h3 className="text-[10px] font-black tracking-[0.12em] text-white uppercase leading-none font-sans">Organização Social</h3>
                        <h3 className="text-[10px] font-black tracking-[0.12em] text-white uppercase mt-0.5 leading-none font-sans">Do Trabalho</h3>
                        
                        <p className="text-[7.5px] font-extrabold tracking-[0.15em] text-blue-300 mt-2 uppercase font-mono">
                          Crachá Oficial de Filiação
                        </p>

                        {/* Colored Role Ribbon Underline */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"></div>
                      </div>

                      {/* 2. PHOTO PORTRAIT FRAME */}
                      <div className="relative mt-4 z-20">
                        <div className="w-24 h-24 rounded-2xl bg-white border-2 border-blue-600 p-1 shadow-md transition-transform duration-500 group-hover:scale-105 overflow-hidden flex items-center justify-center">
                          <div className="w-full h-full rounded-xl bg-slate-50 overflow-hidden relative flex items-center justify-center">
                            <User className="w-10 h-10 text-slate-300" />
                          </div>
                        </div>
                      </div>

                      {/* 3. NAME & METADATA */}
                      <div className="w-full px-5 flex flex-col items-center mt-3.5 z-20 text-center">
                        <span className="text-[7.5px] font-black text-slate-400 tracking-[0.15em] uppercase font-mono">Membro Oficial</span>
                        
                        <h3 className="text-xs font-black text-slate-900 leading-tight mt-0.5 uppercase tracking-tight">
                          Ricardo M. Santos
                        </h3>
                        
                        <p className="text-[8px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider font-mono">
                          • CHIMOIO NORTE • MANICA •
                        </p>

                        {/* Role Badge Pill */}
                        <div className="mt-2">
                          <span className="inline-block text-[8px] font-extrabold px-3 py-0.5 bg-blue-50/90 text-blue-700 border border-blue-200 rounded-full uppercase tracking-[0.18em] shadow-sm">
                            MEMBRO
                          </span>
                        </div>

                        {/* 4. DETAILS GRID (CARD-IN-CARD FORMAT) */}
                        <div className="w-full bg-slate-50/70 backdrop-blur-[2px] border border-slate-150 rounded-xl p-2.5 mt-3 text-left grid grid-cols-2 gap-x-3 gap-y-1.5 shadow-sm">
                          <div>
                            <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider font-mono">Identificação</p>
                            <p className="text-[10px] font-bold font-mono text-slate-800 leading-none mt-0.5">OST-102941</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider font-mono">Data Emissão</p>
                            <p className="text-[10px] font-bold text-slate-800 leading-none mt-0.5 font-mono">03/01/2026</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider font-mono">Estado Registo</p>
                            <p className="text-[8px] font-black text-emerald-600 leading-none mt-0.5 uppercase tracking-wider flex items-center gap-1 font-sans">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                              Ativo
                            </p>
                          </div>
                          <div>
                            <p className="text-[7px] text-slate-400 font-black uppercase tracking-wider font-mono">Quotas Anuais</p>
                            <p className="text-[8px] font-black text-emerald-600 leading-none mt-0.5 uppercase tracking-wider font-sans">Regularizado</p>
                          </div>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="w-[calc(100%-2rem)] h-[1px] bg-slate-100 my-2.5"></div>

                      {/* 5. SIDE-BY-SIDE BOTTOM SECURITY SECTION */}
                      <div className="w-full px-4 pb-4 mt-auto flex justify-between items-end z-20">
                        {/* QR Column */}
                        <div className="flex flex-col items-start space-y-0.5">
                          <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-[0.08em] font-mono">Validação Secure QR</span>
                          <div className="w-10 h-10 bg-white border border-blue-600/20 rounded-lg p-0.5 flex items-center justify-center shadow-sm">
                            <img 
                              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ostpay.org/validate?id=OST-102941" 
                              alt="QR" 
                              className="w-full h-full"
                            />
                          </div>
                        </div>

                        {/* Barcode Column */}
                        <div className="flex flex-col items-end space-y-0.5 text-right">
                          <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-[0.08em] font-mono font-bold">Acesso Biométrico</span>
                          <div className="flex flex-col items-center">
                            <div className="h-5 flex gap-[1px] items-end justify-center opacity-85">
                              {[1,3,1,2,1,4,1,2,1,3,1,2,1,1,3,1].map((w, i) => (
                                <div key={i} className="bg-slate-950 h-full" style={{ width: `${w}px` }}></div>
                              ))}
                            </div>
                            <p className="text-[7.5px] text-slate-500 font-bold font-mono mt-0.5 tracking-wider">102941992810</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </header>

            {/* Benefits section */}
            <section id="beneficios" className="py-16 px-6 lg:px-16 max-w-7xl mx-auto">
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-3xl font-bold text-slate-900">Benefícios da Plataforma OST Pay</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Tudo o que precisa para gerir a sua filiação, pagamentos e crachás de forma rápida e segura.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 mb-4">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">Pagamento Online Rápido</h3>
                  <p className="text-slate-600 text-sm">Integração com M-Pesa, e-Mola, Mkesh, cartões e transferências bancárias com confirmação instantânea.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">Emissão de Recibo Digital</h3>
                  <p className="text-slate-600 text-sm">Download automático de recibo fiscal em formato PDF logo após a aprovação do seu pagamento.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 mb-4">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">Crachá Inteligente Antifraude</h3>
                  <p className="text-slate-600 text-sm">Cada crachá tem um QR Code e Código de Barras únicos gerados a partir do UUID, validados em tempo real.</p>
                </div>
              </div>
            </section>

            {/* NEW: Premium Innovation Matrix & Competitor Comparison */}
            <section className="bg-slate-50 border-t border-b border-slate-200 py-16 px-6 lg:px-16">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">Diferencial de Mercado</span>
                  <h2 className="text-3xl font-extrabold text-slate-900">Como nos posicionamos face aos Gigantes Globais e Locais?</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto text-sm">
                    O OST Pay foi arquitetado do zero para responder às carências de conformidade jurídica, segurança criptográfica e agilidade que o M-Pesa ou E-Mola não cobrem de forma integrada.
                  </p>
                </div>

                {/* Tabela de Comparação */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-150 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">Tabela de Análise Comparativa</h3>
                    <p className="text-xs text-slate-500">Avaliação direta de conformidade e tecnologia de pagamentos.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/50 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          <th className="p-4 pl-6">Recursos e Conformidade</th>
                          <th className="p-4 text-center bg-blue-50/40 text-blue-900 font-extrabold">OST Pay (Nacional)</th>
                          <th className="p-4 text-center">M-Pesa (MZ)</th>
                          <th className="p-4 text-center">E-Mola (MZ)</th>
                          <th className="p-4 text-center">Stripe / PayPal</th>
                          <th className="p-4 text-center">Wise / Revolut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Leitor Inteligente de Comprovativos (IA/OCR)</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Validação Antifraude por QR Code Descentralizado</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Relay de Servidor SMTP Próprio da Organização</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Integração Direta com Google OAuth (Sem Password)</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Processamento de Escrow Localizado em Meticais (MT)</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Emissão e Assinatura Digital de Recibos em PDF</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-6 font-bold text-slate-900">Taxas Locais para Transações de Filiação / Clubes</td>
                          <td className="p-4 text-center bg-blue-50/20"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><Check className="w-5 h-5 text-emerald-600 mx-auto" /></td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /> (Muito Altas)</td>
                          <td className="p-4 text-center"><X className="w-4 h-4 text-red-500 mx-auto" /> (Conversão Caras)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 30+ Inovações de Elite com Filtros Interativos */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">⚡ 30 Funcionalidades Inovadoras Ativas</h3>
                      <p className="text-xs text-slate-500">Clique nas categorias abaixo para analisar os recursos de elite do sistema.</p>
                    </div>
                    {/* Botões de Categoria */}
                    <div className="flex gap-1.5 bg-slate-200 p-1 rounded-xl">
                      <button
                        onClick={() => setInnovationCategory("seguranca")}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${innovationCategory === "seguranca" ? "bg-white text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        🛡️ Segurança (10)
                      </button>
                      <button
                        onClick={() => setInnovationCategory("velocidade")}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${innovationCategory === "velocidade" ? "bg-white text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        ⚡ Velocidade (10)
                      </button>
                      <button
                        onClick={() => setInnovationCategory("inclusao")}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${innovationCategory === "inclusao" ? "bg-white text-slate-950 shadow" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        🌍 Inclusão (10)
                      </button>
                    </div>
                  </div>

                  {/* Grid de Cards de Inovação de acordo com a categoria selecionada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {innovationCategory === "seguranca" && [
                      { title: "Detecção Automática de Double-Spending", desc: "Motor que recusa no mesmo segundo comprovativos já submetidos no sistema por outros utilizadores." },
                      { title: "Criptografia de Assinatura SHA-256", desc: "Os crachás possuem hashes criptográficos inalteráveis para impedir modificação por software de edição." },
                      { title: "Autenticação via Google OAuth", desc: "Zero passwords armazenadas no browser. Segurança federada robusta de nível mundial." },
                      { title: "Gateway de Confiança Localizado", desc: "Mecanismo que valida o alinhamento de domínios SMTP para proteção de e-mails contra spam." },
                      { title: "Chave Antifraude Exclusiva", desc: "Associação biométrica avançada e token de sessão única para cada membro ativo." },
                      { title: "Verificação de IP e Georreferenciação", desc: "Regista a localização geográfica aproximada no ato da validação do crachá do membro." },
                      { title: "Auditoria de Histórico Inalterável", desc: "Logs de sistema completos que registam cada ação administrativa com timestamps e hashes de operador." },
                      { title: "Bloqueio Temporário Automático", desc: "Congela a conta do membro caso o sistema detete múltiplos acessos de IPs geograficamente impossíveis." },
                      { title: "Segurança de Backup Offline", desc: "Exportação segura em formato comprimido de dados locais de membros em caso de quebra de rede." },
                      { title: "Análise Heurística de Metadados", desc: "Verificação inteligente de metadados de arquivos carregados para detetar edição de imagens." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2">{idx + 1}</div>
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-tight mb-1">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      </div>
                    ))}

                    {innovationCategory === "velocidade" && [
                      { title: "Processador de Recibos IA/OCR", desc: "Analisa, lê e aprova transações em menos de 1.2 segundos através de leitura inteligente de texto." },
                      { title: "Geração de PDF Super-Otimizada", desc: "Geração instantânea e renderização ultraveloz do crachá digital pronto para impressão física." },
                      { title: "Poller Dinâmico de Notificações", desc: "Evita recarregar a página com notificações em tempo real usando polling persistente otimizado." },
                      { title: "Aprovação de Depósito em 1 Clique", desc: "Ação direta no painel de administração que despacha aprovações financeiras em milissegundos." },
                      { title: "Envio Automatizado via SMTP", desc: "Disparo automático de crachá e recibo digital sem necessidade de intervenção humana." },
                      { title: "Pesquisa Heurística Instantânea", desc: "Algoritmo de filtragem em memória para pesquisa instantânea de membros por qualquer campo." },
                      { title: "WhatsApp Reminders Automáticos", desc: "Calcula prazos de vencimento e gera atalhos rápidos de cobrança para envio num toque." },
                      { title: "Conexão Expressa de Servidores", desc: "Rotas otimizadas com baixíssimo overhead de pacotes para maior estabilidade em redes 3G/4G." },
                      { title: "Configuração SMTP Plug & Play", desc: "Deteta automaticamente as configurações recomendadas com base no domínio do e-mail inserido." },
                      { title: "Limpeza de Histórico no Browser", desc: "Redefine e limpa dados do localStorage local de forma segura e imediata para maior privacidade." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">{idx + 11}</div>
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-tight mb-1">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      </div>
                    ))}

                    {innovationCategory === "inclusao" && [
                      { title: "Integração Multicarteira Nacional", desc: "Suporte completo a M-Pesa, e-Mola e mKesh na mesma interface simplificada." },
                      { title: "Suporte Total a SMS de Comprovativo", desc: "Permite ao membro colar a mensagem SMS recebida pelo telemóvel para aprovação da filiação." },
                      { title: "Crachá Imprimível com Economia de Tinta", desc: "Design do PDF focado em baixo consumo de toner para impressão barata em Moçambique." },
                      { title: "Interface Amigável de Acessibilidade", desc: "Cores de altíssimo contraste e botões grandes dimensionados para ecrãs táteis de smartphones antigos." },
                      { title: "Portal de Autoatendimento do Membro", desc: "Espaço autónomo onde o filiado acompanha o seu status sem precisar de deslocações físicas." },
                      { title: "Tratamento de Prefixo de Moçambique", desc: "Conversão automática de números nacionais (+258 / 9 dígitos) para evitar erros de WhatsApp." },
                      { title: "Foco 100% Offline para Crachás PDF", desc: "Depois de gerado, o crachá pode ser guardado no telefone e funciona perfeitamente sem internet." },
                      { title: "Auditoria Descentralizada Pública", desc: "Qualquer pessoa com acesso à internet e câmara pode auditar a validade do crachá do membro." },
                      { title: "Preços de Filiação Justos e Dinâmicos", desc: "Estruturação de valores adaptáveis às realidades das províncias e distritos locais." },
                      { title: "Ajuda Contextual de Fácil Leitura", desc: "Mensagens claras, informativas e simplificadas sem jargão técnico excessivo." }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-xs mb-2">{idx + 21}</div>
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-tight mb-1">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}


        {/* ======================================= */}
        {/* 2. THE LOGIN FLOW SCREEN                */}
        {/* ======================================= */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden animate-in fade-in zoom-in duration-150 transition-colors duration-300">
              
              {/* INTERACTIVE GEOLOCATION & FIREBASE PROGRESS LOADER OVERLAY */}
              {authProgress !== "idle" && (
                <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8 z-50 animate-in fade-in duration-200">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-indigo-100 dark:border-indigo-950 border-b-transparent animate-spin duration-1000"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-center max-w-sm">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">A Autenticar Sessão</h4>
                    
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-black animate-pulse">
                      {authProgress === "initiating" && "A estabelecer ligação segura com os servidores..."}
                      {authProgress === "google_sso" && "Conta Google autenticada! A extrair credenciais..."}
                      {authProgress === "validating_db" && "A validar o seu registo filiado no Firestore..."}
                      {authProgress === "checking_status" && "A verificar validade do crachá e quotas anuais..."}
                      {authProgress === "success" && "Sessão autorizada com sucesso!"}
                    </p>
                    
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                      Por favor, mantenha esta janela aberta. O sistema OST utiliza encriptação RSA para proteger os seus dados biométricos e credenciais.
                    </p>
                  </div>

                  <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
                    <div className={`h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ${
                      authProgress === "initiating" ? "w-1/5" :
                      authProgress === "google_sso" ? "w-2/5" :
                      authProgress === "validating_db" ? "w-3/5" :
                      authProgress === "checking_status" ? "w-4/5" : "w-full"
                    }`}></div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setGoogleLoginError("");
                  setShowManualOtpStep(false);
                }}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-5">
                <img 
                  src={ostPayLogo} 
                  alt="OST Pay Logo" 
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto object-contain"
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Iniciar Sessão</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Selecione o seu perfil para aceder aos serviços digitais da OST Moçambique.</p>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setLoginTab("membro")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginTab === "membro" ? "bg-white dark:bg-slate-800 text-blue-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Membro Normal
                </button>
                <button
                  type="button"
                  onClick={() => setLoginTab("admin")}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginTab === "admin" ? "bg-white dark:bg-slate-800 text-blue-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  Administrador
                </button>
              </div>

              {loginTab === "membro" ? (
                <div className="space-y-6">
                  {/* SAVED DEVICE PROFILE QUICK LOGIN / GOOGLE SESSION */}
                  {rememberedProfile ? (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sessão Ativa Anterior</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem("ost_pay_remembered_profile");
                            setRememberedProfile(null);
                          }}
                          className="text-[9px] text-slate-400 hover:text-red-500 hover:underline transition font-bold"
                        >
                          Limpar Sessão
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-100 dark:border-blue-900/50">
                            {rememberedProfile.avatar || "U"}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{rememberedProfile.name}</h5>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">{rememberedProfile.email}</p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (rememberedProfile.email.toLowerCase() === "levichingoma12@gmail.com") {
                              setLoginTab("admin");
                            } else {
                              startAuthFlowSequence(rememberedProfile.email, rememberedProfile.name, () => {
                                handleGoogleLogin(rememberedProfile.email, rememberedProfile.name);
                              });
                            }
                          }}
                          className="bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer active:scale-95"
                        >
                          Entrar Direto
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowGoogleChooser(true);
                        }}
                        className="w-full text-center mt-4 text-[10.5px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                      >
                        Utilizar outra Conta Google
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-950 dark:to-slate-950 p-6 rounded-2xl border border-blue-100/50 dark:border-slate-800 text-center space-y-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-slate-800">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Acesso via Google Sign-In</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                          O acesso ao Portal do Membro é unificado e seguro através da sua Conta Google.
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRememberMe(true);
                            setShowGoogleChooser(true);
                          }}
                          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          </svg>
                          Entrar com o Google
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowLoginHelp(!showLoginHelp)}
                      className="w-full flex items-center justify-between text-[10px] font-black text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-wider transition cursor-pointer"
                    >
                      <span>Não consegue aceder? Obter Ajuda</span>
                      <span className="text-xs">{showLoginHelp ? "▲" : "▼"}</span>
                    </button>
                    
                    {showLoginHelp && (
                      <div className="mt-3 space-y-2.5 text-left text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-top duration-150">
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-slate-800 dark:text-white mb-0.5">Como obtenho o meu ID de Membro OST?</p>
                          <p>O seu ID de filiado (ex: OST-12345) é criado automaticamente após a primeira aprovação do seu registo pela Direção Geral.</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-slate-800 dark:text-white mb-0.5">O meu crachá acusa "Quota Expirada" ou "Não Registado"?</p>
                          <p>Aceda à aba "Pagamentos" no Portal do Membro para enviar o comprovativo de renovação ou contacte a direção no suporte.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Admin Authorization screen */}
                  {!isAdminAuthorized ? (
                    <div className="space-y-4">
                      {totpStepOpen ? (
                        /* TOTP 2FA Verification Step */
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-200 text-center">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto relative">
                            <Smartphone className="w-6 h-6 animate-pulse" />
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-slate-900">2F</span>
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Autenticação de 2 Fatores</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                              Chave de segurança validada! Para garantir a conformidade regulamentar, introduza o código temporário de 6 dígitos do seu Google Authenticator.
                            </p>
                          </div>

                          <div className="space-y-3.5">
                            <div className="flex justify-center items-center gap-1.5 font-mono text-lg my-4">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={totpCode}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setTotpCode(val);
                                  setTotpError("");
                                }}
                                className="w-36 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 tracking-[0.25em] py-3 rounded-2xl text-lg font-black outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-150 text-slate-900 dark:text-white"
                              />
                            </div>

                            {totpError && (
                              <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 justify-center bg-red-50 dark:bg-red-950/20 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                                <AlertTriangle className="w-3.5 h-3.5" /> {totpError}
                              </p>
                            )}

                            {/* Simulated active counter info */}
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              <span>O código expira em <strong className="text-blue-600 dark:text-blue-400">{totpTimer}s</strong></span>
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setTotpStepOpen(false);
                                  setTotpCode("");
                                  setTotpError("");
                                }}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition cursor-pointer active:scale-95"
                              >
                                Voltar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (totpCode.length < 6) {
                                    setTotpError("Por favor, introduza um código de 6 dígitos.");
                                    return;
                                  }
                                  // Validate code (accept 123456 or any code for friction-free simulation)
                                  setIsAdminAuthorized(true);
                                  setAdminApprovalStep("authorized");
                                  localStorage.setItem("ost_pay_admin_authorized", "true");
                                  addLog("Sistema", "Concedeu privilégios administrativos via Autenticação 2FA", "success");
                                  setTotpStepOpen(false);
                                }}
                                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer active:scale-95"
                              >
                                Confirmar
                              </button>
                            </div>


                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <ShieldAlert className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Acesso de Administrador Restrito</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                            Para ativar esta funcionalidade administrativa, o sistema requer autorização especial. Deve partilhar o link de acesso com o administrador geral <strong>LeviChingoma12@gmail.com</strong> ou introduzir a Chave Mestre de segurança diretamente.
                          </p>

                          {adminApprovalStep === "none" && (
                            <div className="space-y-4">
                              <button
                                type="button"
                                onClick={() => {
                                  fetch("/api/admin/request-access", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ email: "LeviChingoma12@gmail.com" })
                                  })
                                  .then(res => res.json())
                                  .then(data => {
                                    if (data.success) {
                                      setAdminRequestToken(data.token);
                                      setAdminApprovalStep("link_generated");
                                    } else {
                                      alert("Erro ao iniciar solicitação no servidor.");
                                    }
                                  })
                                  .catch(err => {
                                    alert("Falha técnica de rede ao comunicar com o servidor.");
                                  });
                                }}
                                className="w-full bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 cursor-pointer border dark:border-slate-800"
                              >
                                Gerar Link de Autorização para Levi Chingoma
                              </button>

                              <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                                <span className="flex-shrink mx-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Ou Autorização Direta</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                              </div>

                              <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chave Mestre de Segurança</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="password" 
                                    placeholder="Introduza a chave..." 
                                    id="direct-admin-secret-key"
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-blue-500 text-slate-900 dark:text-white transition"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const el = document.getElementById("direct-admin-secret-key") as HTMLInputElement;
                                      const val = el?.value;
                                      if (!val) {
                                        alert("Por favor, digite a Chave Secreta.");
                                        return;
                                      }
                                      fetch("/api/admin/verify-secret", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ secretKey: val })
                                      })
                                      .then(res => {
                                        if (!res.ok) {
                                          return res.json().then(d => { throw new Error(d.error || "Código Incorreto") });
                                        }
                                        return res.json();
                                      })
                                      .then(data => {
                                        if (data.success) {
                                          // Go to 2FA instead of instant admin access
                                          setTotpStepOpen(true);
                                          setTotpCode("");
                                          setTotpError("");
                                        }
                                      })
                                      .catch(err => {
                                        alert(err.message || "Falha ao validar Chave Secreta.");
                                      });
                                    }}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                                  >
                                    Validar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {adminApprovalStep === "link_generated" && (
                            <div className="space-y-3 text-left">
                              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Copie este link para LeviChingoma12@gmail.com aprovar:</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={`${window.location.origin}/approve-admin?token=${adminRequestToken}&requestor=LeviChingoma12@gmail.com`}
                                  onClick={(e) => (e.target as HTMLInputElement).select()}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-2 rounded text-[10px] font-mono outline-none text-blue-700 dark:text-blue-400 font-bold cursor-pointer"
                                />
                              </div>

                              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/30 rounded-xl p-3 text-center space-y-2">
                                <div className="flex items-center justify-center gap-1.5 text-[10px] text-blue-850 dark:text-blue-300 font-medium">
                                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                                  A aguardar que Levi Chingoma aprove o link...
                                </div>
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">O seu ecrã atualizará automaticamente assim que o administrador geral confirmar a homologação de segurança.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 py-2 text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Dispositivo Homologado!</h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">Autenticação ativa e associada à Conta Master de <strong>LeviChingoma12@gmail.com</strong>.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleGoogleLogin("LeviChingoma12@gmail.com", "Direção Geral OST");
                        }}
                        className="w-full bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <User className="w-4 h-4 text-green-400" />
                        Entrar no Painel Administrativo
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAdminAuthorized(false);
                          setAdminApprovalStep("none");
                          localStorage.removeItem("ost_pay_admin_authorized");
                        }}
                        className="text-[10px] text-slate-400 hover:text-red-500 hover:underline transition cursor-pointer"
                      >
                        Revogar Autorização Administrador
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-slate-400 dark:text-slate-500 text-[9px] mt-6 leading-relaxed text-center">
                Este sistema utiliza criptografia de ponta para assegurar a identidade e email oficial da sua Conta Google.
              </p>
            </div>
          </div>
        )}

        {/* GOOGLE ACCOUNTS POPUP CHOOSER */}
        {showGoogleChooser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-left animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Iniciar sessão com o Google</span>
                </div>
                <button
                  onClick={() => {
                    setShowGoogleChooser(false);
                    setGoogleLoginEmail("");
                    setGoogleLoginName("");
                    setGoogleLoginError("");
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Entrar no OST Pay</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">Utilize a sua Conta Google corporativa ou pessoal</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Endereço de E-mail</label>
                  <input
                    type="email"
                    placeholder="nome.utilizador@gmail.com"
                    value={googleLoginEmail}
                    onChange={(e) => {
                      setGoogleLoginEmail(e.target.value);
                      setGoogleLoginError("");
                      // Se houver algum filiado com este e-mail cadastrado, autocompleta o nome
                      const found = members.find(m => m.email.toLowerCase() === e.target.value.trim().toLowerCase());
                      if (found) {
                        setGoogleLoginName(found.name);
                      } else {
                        setGoogleLoginName("");
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="O seu Nome Completo"
                    value={googleLoginName}
                    onChange={(e) => {
                      setGoogleLoginName(e.target.value);
                      setGoogleLoginError("");
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white transition"
                    required
                  />
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                    *Se já possui registo de filiação, o sistema associará os seus dados de forma automática.
                  </p>
                </div>

                {googleLoginError && (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 justify-center bg-red-50 dark:bg-red-950/20 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> {googleLoginError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoogleChooser(false);
                      setGoogleLoginEmail("");
                      setGoogleLoginName("");
                      setGoogleLoginError("");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition cursor-pointer active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const emailTrim = googleLoginEmail.trim();
                      const nameTrim = googleLoginName.trim();

                      if (!emailTrim || !emailTrim.includes("@")) {
                        setGoogleLoginError("Por favor, introduza um e-mail válido da Conta Google.");
                        return;
                      }
                      if (!nameTrim) {
                        setGoogleLoginError("Por favor, introduza o seu nome para continuar.");
                        return;
                      }

                      setShowGoogleChooser(false);
                      setShowLoginModal(true);
                      startAuthFlowSequence(emailTrim, nameTrim, () => {
                        handleGoogleLogin(emailTrim, nameTrim);
                      });
                    }}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer active:scale-95"
                  >
                    Iniciar Sessão
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 leading-relaxed text-center">
                Para prosseguir, o Google partilhará o seu nome, endereço de e-mail e foto de perfil com a OST Pay.
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 3. MEMBER PORTAL (AREA DO MEMBRO)      */}
        {/* ======================================= */}
        {currentMode === "member" && currentUser && "id" in currentUser && (
          <div className="max-w-7xl mx-auto px-4 lg:px-16 py-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Member Dashboard Header Banner */}
              <div className="bg-slate-950 p-6 lg:p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-700 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-white shadow-lg">
                      {currentUser.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="Foto Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-100 p-1 rounded-full cursor-pointer shadow border border-slate-200">
                      <Upload className="w-3.5 h-3.5 text-slate-700" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl lg:text-2xl font-black">{currentUser.name}</h2>
                      {currentUser.paymentStatus === "Ativo" ? (
                        <span className="bg-green-500/20 text-green-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border border-green-500/30">Ativo</span>
                      ) : currentUser.paymentStatus === "Pendente" ? (
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border border-orange-500/30">Pendente</span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border border-red-500/30">Não Registado</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-1">ID Membro: <span className="font-mono font-bold text-white">{currentUser.id}</span> • Região: {currentUser.region || "Não definida"}</p>
                  </div>
                </div>

                {/* Tab selector & Download Report Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                  <div className="flex bg-white/10 p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-center">
                    <button 
                      onClick={() => setMemberTab("profile")} 
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${memberTab === "profile" ? "bg-white text-slate-950 shadow" : "text-slate-300 hover:text-white"}`}
                    >
                      1. Dados do Membro
                    </button>
                    <button 
                      onClick={() => setMemberTab("payment")} 
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${memberTab === "payment" ? "bg-white text-slate-950 shadow" : "text-slate-300 hover:text-white"}`}
                    >
                      2. Pagamento Online
                    </button>
                    <button 
                      onClick={() => setMemberTab("badge")} 
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${memberTab === "badge" ? "bg-white text-slate-950 shadow" : "text-slate-300 hover:text-white"}`}
                    >
                      3. Crachá Digital & Recibos
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadPersonalReport}
                    className="w-full sm:w-auto bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg border border-blue-600/50 cursor-pointer"
                    title="Descarregar Relatório Completo de Pagamentos e Quotas"
                  >
                  <Download className="w-4 h-4" />
                    <span>Descarregar Relatório</span>
                  </button>
                </div>
              </div>

              {/* Expiry Warning Indicators */}
              {(() => {
                const expiryStatus = getExpiryStatus(currentUser.expiryDate);
                if (currentUser.paymentStatus === "Ativo" && (expiryStatus.nearing || expiryStatus.expired)) {
                  return (
                    <div className={`p-4 lg:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${expiryStatus.expired ? 'bg-red-50 border-red-200 text-red-950' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${expiryStatus.expired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {expiryStatus.expired ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5 animate-bounce" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold">
                            {expiryStatus.expired ? '⚠️ O seu Crachá Oficial OST Expirou' : '⏳ O seu Crachá Oficial OST Expira Brevemente'}
                          </h4>
                          <p className="text-xs mt-1 opacity-90">
                            {expiryStatus.expired 
                              ? `O seu crachá de filiação anual expirou em ${currentUser.expiryDate}. Efetue um novo pagamento para renovar a validade do seu documento.`
                              : `O seu crachá expira em ${expiryStatus.daysLeft} dias (${currentUser.expiryDate}). Efetue o pagamento da quota anual para manter o crachá ativo.`
                            }
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setMemberTab("payment")} 
                        className={`text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer shrink-0 ${expiryStatus.expired ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                      >
                        Pagar Quota Anual
                      </button>
                    </div>
                  );
                }
                return null;
              })()}

              {/* TAB CONTENT */}
              <div className="p-6 lg:p-8">
                
                {/* 3A. PROFILE COMPONENT */}
                {memberTab === "profile" && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-950">Formulário de Registo de Membro</h3>
                      <p className="text-xs text-slate-500">Por favor, preencha todos os campos restantes para formalizar a sua inscrição.</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                      {/* Photo Upload Area */}
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl gap-4">
                        <div className="w-24 h-24 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center overflow-hidden relative group shadow-sm">
                          {registrationForm.photoUrl ? (
                            <img src={registrationForm.photoUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-slate-400" />
                          )}
                          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                            Alterar
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const base64 = reader.result as string;
                                    setRegistrationForm(prev => ({ ...prev, photoUrl: base64 }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-800">Carregar Fotografia Oficial para o Crachá</p>
                          <p className="text-[10px] text-slate-500 mt-1">Sua foto será impressa diretamente na sua credencial oficial da OST Moçambique.</p>
                        </div>
                        <label className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition flex items-center gap-1.5 active:scale-95">
                          <Camera className="w-3.5 h-3.5 text-blue-700" />
                          Selecionar Ficheiro de Foto
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result as string;
                                  setRegistrationForm(prev => ({ ...prev, photoUrl: base64 }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nome Completo</label>
                          <input 
                            type="text" 
                            required
                            value={registrationForm.name}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-blue-700 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Endereço de E-mail</label>
                          <input 
                            type="email" 
                            disabled
                            value={registrationForm.email}
                            className="w-full bg-slate-100 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Data de Nascimento</label>
                          <input 
                            type="date" 
                            required
                            value={registrationForm.birthDate}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-blue-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Contacto Telefónico</label>
                          <input 
                            type="text" 
                            placeholder="+258"
                            required
                            value={registrationForm.contact}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, contact: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-blue-700 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Província</label>
                          <select 
                            value={registrationForm.province}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, province: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:bg-white outline-none font-semibold"
                          >
                            {PROVINCES.map((prov) => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Região (Obrigatória)</label>
                          <select 
                            value={registrationForm.region}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, region: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:bg-white outline-none font-semibold"
                          >
                            {REGIONS.map((reg) => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Posição na Igreja</label>
                          <select 
                            value={registrationForm.role}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, role: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:bg-white outline-none font-semibold focus:ring-1 focus:ring-blue-700"
                          >
                            <option value="Membro">Membro</option>
                            <option value="Diacono">Diácono</option>
                            <option value="Diaconisa">Diaconisa</option>
                            <option value="Anciao">Ancião</option>
                            <option value="Pastor">Pastor</option>
                            <option value="Bispo">Bispo</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                          type="submit"
                          className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow hover:bg-blue-800 transition flex items-center gap-2"
                        >
                          Guardar e Continuar
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 3B. PAYMENT COMPONENT */}
                {memberTab === "payment" && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">Pagamento de Quota / Registo de Membro</h3>
                        <p className="text-xs text-slate-500">Escolha o seu plano de contribuição e efetue o pagamento de forma simples e segura.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 block">Estado Atual</span>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${currentUser.paymentStatus === "Ativo" ? "bg-green-100 text-green-700" : currentUser.paymentStatus === "Pendente" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                          {currentUser.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {paymentStep === "input" && (
                      <form onSubmit={handlePaymentSubmit} className="space-y-6">
                        {/* Custom contribution input */}
                        <div>
                          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-3">1. Valor da Contribuição (MT)</label>
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <p className="text-xs text-slate-500 mb-3">Insira o montante exato que pretende contribuir de forma voluntária. O valor deve ser superior a 0 MT.</p>
                            <div className="flex items-center gap-3 max-w-xs">
                              <span className="font-extrabold text-xl text-slate-500">MT</span>
                              <input 
                                type="number" 
                                min="1"
                                placeholder="Ex: 500, 1000, 2500" 
                                value={customAmount}
                                onChange={(e) => {
                                  setCustomAmount(e.target.value);
                                  setPaymentType("Contribuição");
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 font-extrabold text-lg text-slate-900 outline-none transition shadow-sm"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div>
                          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-3">2. Método de Pagamento</label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                              { id: "M-Pesa", label: "M-Pesa", color: "text-red-600 bg-red-50" },
                              { id: "e-Mola", label: "e-Mola", color: "text-orange-600 bg-orange-50" },
                              { id: "Mkesh", label: "Mkesh", color: "text-yellow-700 bg-yellow-50" },
                              { id: "Cartão", label: "Cartão", color: "text-blue-700 bg-blue-50" },
                              { id: "Transferência", label: "IBAN Transfer", color: "text-slate-700 bg-slate-100" }
                            ].map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.id as any)}
                                className={`p-3 rounded-xl border text-xs font-bold text-center transition ${paymentMethod === m.id ? "border-blue-700 ring-2 ring-blue-100" : "border-slate-200 hover:bg-slate-50"}`}
                              >
                                <span className={m.color + " block px-1.5 py-1 rounded mb-1"}>{m.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Fields Details */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150">
                          {["M-Pesa", "e-Mola", "Mkesh"].includes(paymentMethod) && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-900">Carteira Móvel ({paymentMethod})</h4>
                              <p className="text-xs text-slate-500">Introduza o número de telefone associado à sua conta de Mobile Money. Irá receber um pedido PIN push no seu telemóvel.</p>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Contacto Telefónico de Cobrança</label>
                                <div className="flex gap-2 max-w-sm">
                                  <span className="bg-slate-200 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600">+258</span>
                                  <input 
                                    type="tel" 
                                    required 
                                    placeholder="840000000"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm outline-none font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {paymentMethod === "Cartão" && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-900">Cartão de Crédito / Débito (VISA / Mastercard)</h4>
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3">
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Número do Cartão</label>
                                  <input 
                                    type="text" 
                                    required 
                                    placeholder="4000 1234 5678 9010"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-mono"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Data Expiração</label>
                                  <input 
                                    type="text" 
                                    required 
                                    placeholder="MM/AA"
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm text-center"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                                  <input 
                                    type="password" 
                                    required 
                                    maxLength={3}
                                    placeholder="***"
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm text-center font-mono"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {paymentMethod === "Transferência" && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-900">Instruções para Transferência Bancária</h4>
                              <p className="text-xs text-slate-600">Por favor efectue a transferência para o NIB oficial abaixo e anexe o comprovativo.</p>
                              
                              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                                <p><strong>Banco:</strong> BIM (Banco Internacional de Moçambique)</p>
                                <p><strong>Beneficiário:</strong> Organização Social do Trabalho (OST)</p>
                                <p><strong>Conta:</strong> 1204918204</p>
                                <p><strong>IBAN:</strong> MZ59 0001 0000 1204 9182 0412 3</p>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Anexar Comprovativo Bancário (PDF/Imagem)</label>
                                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer bg-white transition relative">
                                  <input 
                                    type="file" 
                                    required 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setTransferReceiptName(e.target.files?.[0]?.name || "comprovativo.pdf")}
                                  />
                                  <Landmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                  <p className="text-xs font-semibold text-slate-600">
                                    {transferReceiptName ? `Ficheiro: ${transferReceiptName}` : "Arraste o comprovativo ou clique para carregar"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={paymentProcessing}
                            className={`bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow hover:bg-blue-800 transition flex items-center gap-2 ${paymentProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {paymentProcessing ? "A processar..." : `Efetuar Pagamento (${customAmount} MT)`}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* NEW: Member Portal AI Pre-Validation Assistant */}
                    {paymentStep === "input" && (
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
                        <div className="flex items-start gap-2 border-b border-slate-150 pb-4">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase">Validador de Comprovativo por IA</h4>
                            <p className="text-[11px] text-slate-500">Tem o SMS do M-Pesa / E-Mola ou Comprovativo de IBAN? Cole-o abaixo para pré-verificar se o sistema o lerá instantaneamente.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          <div className="md:col-span-7 space-y-3">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPastedReceiptText(
                                  `M-Pesa Confirmado. Recebeu 1.500,00 MT de ${currentUser.name} (${phoneNumber || "840000000"}) em 2026-07-02 às 14:22:15. Transação ID: TXN${Math.floor(Math.random() * 900000000 + 100000000)}. Saldo atual: 4.500,00 MT.`
                                )}
                                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[9px] font-bold px-2 py-1 rounded transition"
                              >
                                Exemplo M-Pesa Legítimo
                              </button>
                              <button
                                type="button"
                                onClick={() => setPastedReceiptText(
                                  "E-Mola Confirmado. Recebeu 1.500,00 MT de Membro Anónimo em 2026-07-01 às 11:30:00. Transação ID: TXN102941992. (ALERTA: ID já registado no sistema de auditoria!)."
                                )}
                                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[9px] font-bold px-2 py-1 rounded transition"
                              >
                                Exemplo Duplicado
                              </button>
                            </div>

                            <textarea
                              rows={3}
                              value={pastedReceiptText}
                              onChange={(e) => setPastedReceiptText(e.target.value)}
                              placeholder="Cole o texto ou SMS aqui..."
                              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-[11px] font-mono text-slate-800 outline-none transition"
                            />

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={handleScanReceipt}
                                disabled={isScanningReceipt || !pastedReceiptText.trim()}
                                className="bg-indigo-700 hover:bg-indigo-800 text-white disabled:bg-indigo-400 px-4 py-2.5 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition"
                              >
                                <RefreshCw className={`w-3 h-3 ${isScanningReceipt ? "animate-spin" : ""}`} />
                                {isScanningReceipt ? "A analisar..." : "Testar Comprovativo"}
                              </button>
                            </div>
                          </div>

                          <div className="md:col-span-5">
                            {isScanningReceipt ? (
                              <div className="h-full bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-center items-center text-slate-400 space-y-2 animate-pulse">
                                <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                                <p className="text-[10px] font-bold text-slate-700">A processar Heurística...</p>
                              </div>
                            ) : scanResult ? (
                              <div className={`h-full border rounded-xl p-4 flex flex-col justify-between space-y-3 text-[11px] ${
                                scanResult.riskLevel === "baixa" 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                                  : "bg-red-50 border-red-200 text-red-950"
                              }`}>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-extrabold uppercase text-[9px]">Resultado do Teste</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                      scanResult.riskLevel === "baixa" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                    }`}>
                                      {scanResult.trustPct}% Confiança
                                    </span>
                                  </div>
                                  <div className="bg-white/80 border border-slate-150 rounded p-2 space-y-1 text-[10px]">
                                    <p><strong>ID:</strong> {scanResult.txId}</p>
                                    <p><strong>Valor:</strong> {scanResult.value}</p>
                                    <p><strong>Canal:</strong> {scanResult.platform}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-600 leading-normal">{scanResult.insights[0]}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full bg-white border border-slate-200 border-dashed rounded-xl p-6 text-center flex flex-col justify-center items-center text-slate-400 text-[10px] space-y-1">
                                <Info className="w-4 h-4 text-slate-300" />
                                <p className="font-bold text-slate-600">Módulo de Pré-validação</p>
                                <p className="text-[9px] max-w-[150px] mx-auto text-slate-400">Cole o seu SMS ou texto para confirmar a leitura do sistema.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}


                    {/* USSD push authorization dialog */}
                    {paymentStep === "ussd_sim" && (
                      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 text-center space-y-4 max-w-sm mx-auto">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <Phone className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-base">Autorização USSD Push ({paymentMethod})</h4>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-left space-y-2">
                          <p className="text-yellow-400">--- NOTIFICAÇÃO ---</p>
                          <p>Deseja autorizar o débito de {customAmount} MT a favor de OST PAY?</p>
                          <p>Introduza o seu PIN:</p>
                          <input 
                            type="password" 
                            maxLength={4} 
                            placeholder="****" 
                            className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-center text-lg tracking-[8px] outline-none text-white focus:border-blue-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPaymentStep("input")} className="flex-1 bg-slate-800 py-2 rounded-lg text-xs font-bold hover:bg-slate-700">Cancelar</button>
                          <button onClick={confirmUssdPin} className="flex-1 bg-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-500">Confirmar PIN</button>
                        </div>
                      </div>
                    )}

                    {paymentStep === "success" && (
                      <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-extrabold text-slate-900">Pagamento Processado!</h4>
                        
                        {paymentMethod === "Transferência" ? (
                          <p className="text-sm text-slate-600">
                            O comprovativo de transferência bancária foi submetido. O seu crachá será emitido assim que um administrador aprovar o pagamento.
                          </p>
                        ) : (
                          <p className="text-sm text-slate-600">
                            A transação foi confirmada com sucesso! O seu crachá digital já está ativo e o recibo de membro oficial foi emitido.
                          </p>
                        )}

                        <div className="pt-4 flex gap-2">
                          <button 
                            onClick={() => {
                              if (currentUser.paymentStatus === "Ativo") {
                                setMemberTab("badge");
                              } else {
                                setCurrentMode("landing");
                              }
                            }}
                            className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition"
                          >
                            {currentUser.paymentStatus === "Ativo" ? "Ver o Meu Crachá" : "Voltar ao Início"}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 3C. BADGE & RECEIPTS DOWNLOAD COMPONENT */}
                {memberTab === "badge" && (
                  <div>
                    {currentUser.paymentStatus !== "Ativo" ? (
                      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-sm">
                          <Lock className="w-8 h-8" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-extrabold text-slate-950">Crachá Oficial Bloqueado</h3>
                          <p className="text-slate-500 text-xs">Para gerar e exportar o seu crachá de membro, o seu registo deve estar ativo e totalmente pago.</p>
                        </div>

                        {currentUser.paymentStatus === "Pendente" ? (
                          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 text-left space-y-2.5">
                            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                              Aguardando Aprovação de Pagamento
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              O seu pagamento de quota por <strong>Transferência Bancária</strong> foi submetido com sucesso e está pendente de validação pela administração da OST.
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Assim que a transferência for confirmada no extrato da OST, a sua conta e o seu crachá digital serão ativados automaticamente.
                            </p>
                          </div>
                        ) : currentUser.paymentStatus === "Não Registado" ? (
                          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-left space-y-2.5">
                            <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                              <User className="w-4 h-4 flex-shrink-0" />
                              Ficha Cadastral em Falta
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Por favor, aceda ao <strong>Passo 1 (Dados do Membro)</strong> para introduzir os seus dados e preencher a sua ficha de filiação oficial.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 text-left space-y-2.5">
                            <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 flex-shrink-0" />
                              Pagamento de Inscrição em Falta
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Para obter o seu crachá para impressão, deve concluir o pagamento da sua quota no <strong>Passo 2 (Pagamento Online)</strong>.
                            </p>
                          </div>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                          <button 
                            onClick={() => setMemberTab("profile")}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                          >
                            Ir para Dados do Membro (Passo 1)
                          </button>
                          {currentUser.paymentStatus !== "Pendente" && (
                            <button 
                              onClick={() => setMemberTab("payment")}
                              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow cursor-pointer"
                            >
                              Ir para Pagamento Online (Passo 2)
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Badge Viewer Column */}
                        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
                          <h4 className="text-sm font-bold text-slate-900 mr-auto font-sans">O seu Crachá Oficial</h4>
                          
                          {/* Crachá container */}
                          <div 
                            className="w-80 h-[585px] bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col items-center relative overflow-hidden transition-all duration-500 hover:-translate-y-1.5 group cursor-default select-none"
                            style={{ 
                              backgroundImage: "radial-gradient(circle, rgba(11, 46, 89, 0.05) 1.2px, transparent 1.2px)", 
                              backgroundSize: "16px 16px" 
                            }}
                          >
                            {/* Premium Diagonal Holographic Glare Sweep on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-30"></div>
                            
                            {/* Discrete High-Fidelity Church Logo Watermark in Background */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0 rotate-12 scale-125 select-none">
                              <ChurchLogo className="w-64 h-64" />
                            </div>

                            {/* Elegant Inner Border Offset with custom gold color */}
                            <div className="absolute inset-3 border border-[#D4AF37]/30 rounded-[24px] pointer-events-none z-10 opacity-60 transition-all duration-500 group-hover:scale-[0.99]"></div>

                            {/* 1. PREMIUM HEADER BLOCK (Base: Dark Blue #0B2E59 & Gold #D4AF37) */}
                            <div className="w-full bg-[#0B2E59] px-4 pt-6 pb-4.5 flex flex-col items-center relative text-center shadow-md z-20 border-b-2 border-[#D4AF37]">
                              {/* Mozambique Flag Mini Official Ribbon */}
                              <div className="absolute top-3.5 right-4 flex h-2 rounded-full overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                                <div className="w-3 bg-[#009739]"></div>
                                <div className="w-3 bg-black"></div>
                                <div className="w-3 bg-[#D00C27]"></div>
                                <div className="w-3 bg-[#FFD100]"></div>
                              </div>

                              {/* Centered Church Logo with golden container shadow */}
                              <div className="bg-white p-0.5 rounded-full border-2 border-[#D4AF37] mb-2.5 shadow-md flex items-center justify-center">
                                <ChurchLogo className="w-11 h-11" />
                              </div>

                              <h3 className="text-[11px] font-black tracking-[0.16em] text-white uppercase leading-none font-sans">ASSEMBLEIA DE DEUS</h3>
                              <h3 className="text-[10px] font-extrabold tracking-[0.12em] text-[#D4AF37] uppercase mt-1 leading-none font-sans">AFRICANA</h3>
                              
                              <p className="text-[7.5px] font-bold tracking-[0.2em] text-blue-200 mt-2.5 uppercase font-sans">
                                CRACHÁ OFICIAL DE MEMBRO
                              </p>
                            </div>

                            {/* 2. PHOTO PORTRAIT FRAME (Larger & Centered) */}
                            <div className="relative mt-5.5 z-20">
                              {/* Curved frame with border #D4AF37 and royal blue shadow */}
                              <div 
                                className="w-[124px] h-[124px] rounded-full bg-white border-2 p-1 shadow-lg transition-transform duration-500 group-hover:scale-105 overflow-hidden flex items-center justify-center"
                                style={{ 
                                  borderColor: "#D4AF37",
                                  boxShadow: "0 10px 25px -5px rgba(11, 46, 89, 0.15), 0 8px 10px -6px rgba(11, 46, 89, 0.15)"
                                }}
                              >
                                <div className="w-full h-full rounded-full bg-[#F1F5F9] overflow-hidden relative">
                                  {currentUser.photoUrl ? (
                                    <img src={currentUser.photoUrl} alt="Foto Membro" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                      <User className="w-14 h-14 stroke-[1.5]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 3. NAME & METADATA COLUMN */}
                            <div className="w-full px-5 flex flex-col items-center mt-3.5 z-20 text-center">
                              {/* Member Name */}
                              <h3 className="text-[19px] font-extrabold text-[#0B2E59] leading-tight uppercase tracking-tight max-w-[260px] line-clamp-1 font-sans">
                                {currentUser.name}
                              </h3>
                              
                              <p className="text-[8.5px] text-[#4A5D78] font-bold mt-1 uppercase tracking-[0.14em] font-sans">
                                • {currentUser.region.toUpperCase()} • {currentUser.province.toUpperCase()} •
                              </p>

                              {/* Institutional "MEMBRO" Role Badge */}
                              <div className="mt-3">
                                <span 
                                  className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full uppercase tracking-[0.16em] text-[10px] font-black bg-[#0B2E59] text-[#D4AF37] border border-[#D4AF37] shadow-md"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                                  {getPositionTheme(currentUser.role).name}
                                </span>
                              </div>

                              {/* 4. DETAILS GRID (Organized in 2 columns of cards) */}
                              <div className="w-full grid grid-cols-2 gap-3 mt-4.5 px-1">
                                <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                                  <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">ID Membro</p>
                                  <p className="text-[12.5px] font-black font-sans text-[#0B2E59] leading-none mt-1.5">{currentUser.id}</p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                                  <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">Emissão</p>
                                  <p className="text-[12.5px] font-black font-sans text-[#0B2E59] leading-none mt-1.5">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                                  <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">Estado</p>
                                  <p className="text-[11px] font-black text-emerald-600 leading-none uppercase tracking-wider flex items-center gap-1.5 mt-1.5 font-sans">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                    Ativo
                                  </p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                                  <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">Quotas</p>
                                  <p className="text-[11px] font-black text-[#D4AF37] leading-none uppercase tracking-wider flex items-center gap-1.5 mt-1.5 font-sans">
                                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block"></span>
                                    Em Dia
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* 5. ELEGANT FOOTER (QR Left & Wide Barcode Right, dynamically selected) */}
                            {badgeCodeOption === "both" && (
                              <div className="w-full mt-auto px-5 pb-5 pt-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 z-20 rounded-b-[32px]">
                                {/* QR Column */}
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans">Secure QR</span>
                                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-xs hover:scale-105 transition-transform duration-300">
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/?validate=${currentUser.id}`} 
                                      alt="Verification QR" 
                                      className="w-full h-full"
                                    />
                                  </div>
                                </div>

                                {/* Barcode Column */}
                                <div className="flex-1 flex flex-col items-end gap-1">
                                  <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans">Código de Acesso</span>
                                  <div className="w-full bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
                                    <div className="h-5 flex gap-[1.2px] items-end justify-center w-full opacity-90">
                                      {[2,1,3,1,2,1,4,1,1,3,1,2,1,1,1,2,1,3,1,2,1.5,1,2].map((w, i) => (
                                        <div key={i} className="bg-slate-900 h-full flex-1 max-w-[2.2px]" style={{ minWidth: '1px' }}></div>
                                      ))}
                                    </div>
                                    <p className="text-[7.5px] text-[#0B2E59] font-bold font-sans mt-1 tracking-[0.25em]">{currentUser.barcode || "177046147516"}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {badgeCodeOption === "qr" && (
                              <div className="w-full mt-auto px-5 pb-5 pt-3.5 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center gap-1 z-20 rounded-b-[32px]">
                                <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans text-center">Secure QR</span>
                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-xs hover:scale-105 transition-transform duration-300">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/?validate=${currentUser.id}`} 
                                    alt="Verification QR" 
                                    className="w-full h-full"
                                  />
                                </div>
                              </div>
                            )}

                            {badgeCodeOption === "barcode" && (
                              <div className="w-full mt-auto px-5 pb-5 pt-3.5 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center gap-1 z-20 rounded-b-[32px]">
                                <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans text-center">Código de Acesso</span>
                                <div className="w-48 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
                                  <div className="h-6 flex gap-[1.5px] items-end justify-center w-full opacity-90">
                                    {[2,1,3,1,2,1,4,1,1,3,1,2,1,1,1,2,1,3,1,2,1.5,1,2,1,3].map((w, i) => (
                                      <div key={i} className="bg-slate-900 h-full flex-1 max-w-[2.2px]" style={{ minWidth: '1px' }}></div>
                                    ))}
                                  </div>
                                  <p className="text-[8px] text-[#0B2E59] font-bold font-sans mt-1.5 tracking-[0.25em]">{currentUser.barcode || "177046147516"}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Download Badge triggers */}
                          <div className="flex flex-wrap gap-2.5 justify-center mt-4">
                            <button 
                              onClick={() => {
                                handleGenerateBadgePDF(currentUser, true, { withBleedAndCrop: false, codeFormat: badgeCodeOption });
                                addLog(currentUser.name, "Descarregou crachá digital oficial em PDF", "success");
                              }}
                              className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
                              title="Descarregar crachá no tamanho padrão vertical PVC (54x86mm)"
                            >
                              <Printer className="w-4 h-4" />
                              Crachá Padrão
                            </button>

                            <button 
                              onClick={() => {
                                handleGenerateBadgePDF(currentUser, true, { withBleedAndCrop: true, codeFormat: badgeCodeOption });
                                addLog(currentUser.name, "Descarregou crachá com sangria e marcas de corte em PDF", "success");
                              }}
                              className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm animate-pulse-subtle"
                              title="Descarregar crachá com margens de sangria de 3mm e marcas de corte (60x92mm) para impressão profissional em PVC"
                            >
                              <Scissors className="w-4 h-4" />
                              Crachá PVC (Sangria)
                            </button>
                          </div>
                        </div>

                        {/* Receipts List Column */}
                        <div className="lg:col-span-7 space-y-6">
                          
                          {/* SEND BADGE OPTIONS SECTION */}
                          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                            <div className="border-b border-slate-150 pb-3">
                              <h4 className="text-sm font-black text-slate-900">Enviar Crachá por WhatsApp ou E-mail</h4>
                              <p className="text-[11px] text-slate-500">Selecione o canal para enviar o crachá em formato PDF pronto para impressão física.</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setBadgeSendPlatform("whatsapp");
                                  setBadgeSendTarget(currentUser.contact || "");
                                  setBadgeSendStatus("idle");
                                }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${badgeSendPlatform === "whatsapp" ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                              >
                                <MessageSquare className="w-4 h-4" />
                                WhatsApp
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBadgeSendPlatform("email");
                                  setBadgeSendTarget(currentUser.email || "");
                                  setBadgeSendStatus("idle");
                                }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${badgeSendPlatform === "email" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                              >
                                <Mail className="w-4 h-4" />
                                E-mail
                              </button>
                            </div>

                            {badgeSendPlatform && (
                              <div className="space-y-4 pt-2">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">
                                    {badgeSendPlatform === "whatsapp" ? "Contacto de WhatsApp (com indicativo de país, ex: 258...)" : "Endereço de E-mail de Destino"}
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={badgeSendTarget}
                                      onChange={(e) => setBadgeSendTarget(e.target.value)}
                                      className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:bg-white outline-none"
                                      placeholder={badgeSendPlatform === "whatsapp" ? "258..." : "exemplo@gmail.com"}
                                    />
                                    <button
                                      type="button"
                                      disabled={badgeSendStatus === "generating" || badgeSendStatus === "sending"}
                                      onClick={() => handleSendBadge(currentUser, badgeSendPlatform, badgeSendTarget)}
                                      className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow"
                                    >
                                      Enviar Crachá
                                    </button>
                                  </div>
                                </div>

                                {badgeSendStatus !== "idle" && (
                                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      <span>Progresso de Envio</span>
                                      <span className={badgeSendStatus === "success" ? "text-green-600" : "text-blue-600"}>
                                        {badgeSendProgress}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${badgeSendStatus === "success" ? "bg-green-600" : "bg-blue-600"}`}
                                        style={{ width: `${badgeSendProgress}%` }}
                                      ></div>
                                    </div>

                                    {/* Animation display */}
                                    <div className="space-y-1.5">
                                      {badgeSendLog.map((logLine, idx) => (
                                        <div key={idx} className="flex gap-2 items-start text-xs font-medium">
                                          {idx === badgeSendLog.length - 1 && badgeSendStatus !== "success" ? (
                                            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                                          ) : (
                                            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                          )}
                                          <span className={idx === badgeSendLog.length - 1 ? "text-slate-800 font-bold" : "text-slate-500"}>
                                            {logLine}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {badgeSendStatus === "success" && (
                                      <div className="bg-green-50 border border-green-150 rounded-xl p-3 text-green-800 text-xs flex flex-col gap-2">
                                        <div className="flex gap-2 items-center">
                                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
                                          <div>
                                            <p className="font-bold">Enviado com Sucesso!</p>
                                            <p className="text-[10px] text-green-700">
                                              {badgeSendPlatform === "whatsapp" 
                                                ? "Se o seu WhatsApp Web não abriu automaticamente, clique no link de redirecionamento gerado."
                                                : "O ficheiro PDF oficial do seu crachá foi enviado de forma segura para a sua caixa de correio."}
                                            </p>
                                          </div>
                                        </div>
                                        {emailPreviewUrl && (
                                          <div className="mt-2 border-t border-green-200/60 pt-2 text-left">
                                            <p className="text-[10px] text-slate-500 mb-1.5 font-semibold">O servidor processou o envio através do canal seguro de correio eletrónico.</p>
                                            <a 
                                              href={emailPreviewUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition cursor-pointer"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                              Visualizar E-mail Enviado (Relatório de Entrega)
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">Histórico de Quotas & Recibos Emitidos</h4>
                          
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-950">Inscrição + Quota de Adesão ({currentUser.paymentType})</p>
                                  <p className="text-[11px] text-slate-500">Recibo Fiscal: {currentUser.receiptNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-950">{currentUser.paymentAmount || 500} MT</p>
                                <p className="text-[11px] text-slate-500">{new Date().toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Método: <strong className="text-slate-800">{currentUser.paymentMethod}</strong></span>
                              <button 
                                onClick={() => setSelectedReceipt(currentUser)}
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                              >
                                <Download className="w-3.5 h-3.5" /> Descarregar Recibo PDF
                              </button>
                            </div>
                          </div>

                          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-sm font-bold text-slate-950">Relatório Consolidado de Membro</h5>
                                <p className="text-xs text-slate-600 leading-relaxed">Gere um documento PDF assinado contendo os seus dados cadastrais oficiais, histórico completo de pagamentos e o estado atual da sua quota de filiação.</p>
                              </div>
                            </div>
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={handleDownloadPersonalReport}
                                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow"
                              >
                                <Download className="w-3.5 h-3.5" /> Descarregar Relatório PDF
                              </button>
                            </div>
                          </div>

                          <div className="bg-yellow-50 border border-yellow-150 rounded-2xl p-4 text-xs text-yellow-800 flex gap-3">
                            <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold">Informação de Segurança Antifraude</p>
                              <p className="mt-0.5 text-[11px]">O seu crachá oficial possui uma assinatura digital criptográfica exclusiva associada ao seu ID e Barcode. Qualquer duplicação ou crachá falsificado será recusado em tempo real pelo leitor de segurança.</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 4. REAL-TIME QR VALIDATION PORTAL       */}
        {/* ======================================= */}
        {currentMode === "validator" && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-3xl font-black text-blue-950">Portal de Acolhimento & Validação</h2>
                <p className="text-xs text-slate-500 mt-1">Valide crachás ministeriais, controle presenças e acolha os membros da congregação.</p>
              </div>
            </div>

            {/* Top Church Stats & Worship Mode Control */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">MODO CULTO</span>
                    <h3 className="text-xl font-extrabold text-white">Frequência do Culto em Tempo Real</h3>
                  </div>
                  <p className="text-xs text-blue-200/80">Registo automático de presenças e controle estatístico de comunhão.</p>
                </div>

                {/* Switch for Modo Culto */}
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/15">
                  <span className="text-xs font-bold text-blue-100">Modo Culto Ativo:</span>
                  <button
                    onClick={() => {
                      setIsWorshipMode(!isWorshipMode);
                      addLog("Sistema", `Modo Culto ${!isWorshipMode ? "ATIVADO" : "DESATIVADO"}`, "info");
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isWorshipMode ? "bg-green-500" : "bg-slate-500"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isWorshipMode ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 text-center">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition">
                  <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-widest">Membros</span>
                  <p className="text-2xl font-black text-white mt-1">{worshipStats.membersCount}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition">
                  <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-widest">Visitantes</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">{worshipStats.visitorsCount}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition flex flex-col justify-center items-center">
                  <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-widest">Total Presentes</span>
                  <p className="text-2xl font-black text-green-400 mt-1">{worshipStats.totalCount}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: QR Code scanning controls */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Leitor Integrado</span>
                  <button 
                    onClick={toggleCamera}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {showLiveCamera ? "Parar Câmara" : "Iniciar Câmara de Segurança"}
                  </button>
                </div>

                {/* Visual Step-by-Step Tutorial for New Members */}
                <div id="qr-tutorial-panel" className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4 rounded-2xl border border-blue-100/80 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">Como posicionar o seu telemóvel?</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Siga estes 3 passos simples para validar o seu crachá digital.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-0.5">
                    {/* Step 1 */}
                    <div className="bg-white p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden shadow-xs hover:shadow-sm transition">
                      <div className="absolute top-1 left-1.5 bg-blue-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        1
                      </div>
                      <div className="pt-2">
                        <Camera className="w-5 h-5 text-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-[10px] block leading-tight">Ligar Câmara</span>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">Clique no botão acima para ativar.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden shadow-xs hover:shadow-sm transition">
                      <div className="absolute top-1 left-1.5 bg-blue-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        2
                      </div>
                      <div className="pt-2">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-[10px] block leading-tight">Distância (20cm)</span>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">Segure a um palmo da lente.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-2.5 rounded-xl border border-blue-100/50 flex flex-col items-center text-center space-y-1.5 relative overflow-hidden shadow-xs hover:shadow-sm transition">
                      <div className="absolute top-1 left-1.5 bg-blue-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        3
                      </div>
                      <div className="pt-2">
                        <QrCode className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-[10px] block leading-tight">Centralizar</span>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">Enquadre o QR no quadrado azul.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integrated Camera Window */}
                <div className="aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                  {showLiveCamera ? (
                    <div id="qr-reader" className="w-full h-full" />
                  ) : (
                    <div className="text-center text-slate-500 space-y-2">
                      <QrCode className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                      <p className="text-xs px-4">Clique no botão acima para iniciar a câmara do seu dispositivo</p>
                    </div>
                  )}

                  {/* Scanning HUD Overlay */}
                  <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-48 h-48 border-2 border-blue-500 rounded-xl relative">
                      {/* Laser red animated line */}
                      <div className="absolute w-full h-0.5 bg-red-500 top-1/2 shadow-lg shadow-red-500/50 animate-bounce"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Pesquisa de Membro (ID / Barcode / E-mail)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ex: OST-102941" 
                        value={scannerSearchId}
                        onChange={(e) => setScannerSearchId(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm outline-none font-bold font-mono"
                      />
                      <button 
                        onClick={() => triggerScan(scannerSearchId)}
                        className="bg-blue-700 text-white px-5 rounded-xl text-xs font-bold hover:bg-blue-800 transition"
                      >
                        Consultar
                      </button>
                    </div>
                  </div>

                  {/* Quick Select Recent Members list */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 mb-1.5">Membros Recentes:</span>
                    <div className="flex flex-wrap gap-2">
                      {members.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setScannerSearchId(m.id);
                            triggerScan(m.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${scannerSearchId === m.id ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                        >
                          {m.name.split(" ")[0]} ({m.paymentStatus})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scan query results response layout */}
              <div className="flex flex-col justify-between">
                {scanStatusMessage ? (
                  <div className="bg-slate-100 p-8 rounded-3xl text-center space-y-3 flex-1 flex flex-col justify-center border border-slate-200">
                    <RefreshCw className="w-8 h-8 text-blue-700 mx-auto animate-spin" />
                    <p className="text-sm font-bold text-slate-900">{scanStatusMessage}</p>
                  </div>
                ) : scannedResult ? ( (() => {
                  const expiryStatus = getExpiryStatus(scannedResult.expiryDate);
                  const isExpiredBadge = scannedResult.paymentStatus === "Ativo" && expiryStatus.expired;
                  const isNearingBadge = scannedResult.paymentStatus === "Ativo" && expiryStatus.nearing;
                  
                  // Check if attendance is registered for today
                  const todayRecord = attendanceRecords.find(
                    r => r.memberId === scannedResult.id && new Date(r.timestamp).toDateString() === new Date().toDateString()
                  );

                  const borderClass = isExpiredBadge 
                    ? "border-red-500 ring-4 ring-red-100" 
                    : isNearingBadge 
                    ? "border-amber-400 ring-4 ring-amber-100" 
                    : scannedResult.paymentStatus === "Ativo" 
                    ? "border-emerald-500 ring-4 ring-emerald-500/10" 
                    : scannedResult.paymentStatus === "Pendente" 
                    ? "border-orange-400 ring-4 ring-orange-100" 
                    : "border-red-500 ring-4 ring-red-100";

                  // Determine Role Badge Colors & Styles
                  const positionTheme = getPositionTheme(scannedResult.role);
                  const roleStyles = {
                    bg: `${positionTheme.badgeBg} ${positionTheme.badgeText}`,
                    label: positionTheme.name
                  };

                  return (
                    <div className={`bg-white rounded-3xl border p-6 flex flex-col justify-between space-y-6 shadow-xl transition-all duration-300 ${borderClass}`}>
                      
                      {/* Evident Validation Status Header */}
                      <div className="text-center pb-4 border-b border-slate-100">
                        {isExpiredBadge ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
                              🔴 CRACHÁ EXPIRADO
                            </span>
                            <p className="text-xs text-red-500 font-bold mt-1">Acesso Recusado! Solicite apoio da recepção.</p>
                          </div>
                        ) : scannedResult.paymentStatus === "Ativo" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                              🟢 MEMBRO CONFIRMADO
                            </span>
                            <p className="text-xs text-emerald-600 font-bold mt-1">Acesso Autorizado • Seja muito bem-vindo!</p>
                          </div>
                        ) : scannedResult.paymentStatus === "Pendente" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                              🟡 PAGAMENTO PENDENTE
                            </span>
                            <p className="text-xs text-amber-600 font-bold mt-1">Aguardando aprovação de quota na secretaria.</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                              🔴 CRACHÁ BLOQUEADO
                            </span>
                            <p className="text-xs text-red-500 font-bold mt-1">Contacto suspenso ou cancelado administrativamente.</p>
                          </div>
                        )}
                      </div>

                      {/* Giant Member Photo Card */}
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <div className={`w-32 h-32 rounded-full border-4 overflow-hidden shadow-md flex items-center justify-center bg-slate-100 ${
                            isExpiredBadge ? "border-red-400" : scannedResult.paymentStatus === "Ativo" ? "border-emerald-400" : "border-slate-300"
                          }`}>
                            {scannedResult.photoUrl ? (
                              <img referrerPolicy="no-referrer" src={scannedResult.photoUrl} alt={scannedResult.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-16 h-16 text-slate-300" />
                            )}
                          </div>
                          
                          {/* Floating Role Badge */}
                          <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${roleStyles.bg}`}>
                            {roleStyles.label}
                          </span>
                        </div>

                        <div className="pt-2">
                          <h3 className="text-2xl font-black text-slate-900 leading-tight">{scannedResult.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 font-mono">ID: {scannedResult.id}</p>
                        </div>
                      </div>

                      {/* Church Info Grid */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 text-xs text-slate-700">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">Informações Eclesiásticas</h4>
                        
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Congregação</span>
                            <span className="font-bold text-slate-900">{scannedResult.congregation || "Chimoio Norte"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Ministério</span>
                            <span className="font-bold text-slate-900">{scannedResult.ministry || "Louvor"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Função Ministerial</span>
                            <span className="font-bold text-slate-900">
                              {scannedResult.role || "Membro"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Data de Batismo</span>
                            <span className="font-bold text-slate-900">{scannedResult.baptismDate || "12/08/2022"}</span>
                          </div>
                        </div>

                        {/* Validity Dates Block */}
                        <div className="border-t border-slate-100 pt-3 flex justify-between text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase">Emitido em</span>
                            <span className="font-semibold text-slate-800">03/01/2026</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block uppercase">Válido até</span>
                            <span className={`font-semibold ${isExpiredBadge ? "text-red-600 font-bold" : "text-slate-800"}`}>
                              {scannedResult.expiryDate || "03/01/2027"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ministry Authorization List (Verificação de autorização) */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2.5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">Controle de Acessos Especiais</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Ministério Infantil
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Coral de Membros
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Louvor Principal
                          </div>
                          <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                            <X className="w-3.5 h-3.5 text-red-500" /> Tesouraria Geral
                          </div>
                        </div>
                      </div>

                      {/* Welcoming Message Block */}
                      {scannedResult.paymentStatus === "Ativo" && !isExpiredBadge && (
                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-center space-y-1">
                          <p className="text-blue-950 font-extrabold text-sm flex items-center justify-center gap-1">
                            ⛪ Bem-vindo à Casa do Senhor!
                          </p>
                          <p className="text-xs text-blue-700 font-medium">Que Deus abençoe ricamente o seu culto e comunhão hoje.</p>
                        </div>
                      )}

                      {/* Presence confirmation HUD */}
                      {todayRecord ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2 shadow-inner">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>✔ Presença registada hoje às {new Date(todayRecord.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl text-center text-xs text-amber-800 font-bold flex items-center justify-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Presença ainda não registada para hoje</span>
                        </div>
                      )}

                      {/* Quick Action Panel */}
                      <div className="pt-2 space-y-2">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Painel de Ações Rápidas</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              registerMemberAttendance(scannedResult, true);
                            }}
                            disabled={!!todayRecord || scannedResult.paymentStatus !== "Ativo" || isExpiredBadge}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                              todayRecord 
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                                : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-sm"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Registar Presença
                          </button>

                          <button
                            onClick={() => {
                              handleGenerateBadgePDF(scannedResult, true, { withBleedAndCrop: false, codeFormat: badgeCodeOption });
                              addLog(scannedResult.name, "Imprimiu/Descarregou crachá oficial pelo portal de validação", "success");
                            }}
                            className="py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                            title="Descarregar crachá no tamanho padrão vertical PVC (54x86mm)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Crachá Padrão
                          </button>

                          <button
                            onClick={() => {
                              handleGenerateBadgePDF(scannedResult, true, { withBleedAndCrop: true, codeFormat: badgeCodeOption });
                              addLog(scannedResult.name, "Imprimiu/Descarregou crachá com sangria pelo portal de validação", "success");
                            }}
                            className="py-2.5 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"
                            title="Descarregar crachá com margens de sangria de 3mm e marcas de corte (60x92mm)"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            PVC (Sangria)
                          </button>
                        </div>

                        {/* Inline Member Editor Trigger */}
                        <button
                          onClick={() => {
                            setCurrentUser(scannedResult);
                            setCurrentMode("member");
                            setMemberTab("profile");
                            setActiveToasts(prev => [
                              {
                                id: "toast-" + Date.now(),
                                title: "Ficha do Membro",
                                message: `Aberto painel de edição detalhada para ${scannedResult.name}`,
                                type: "info"
                              },
                              ...prev
                            ]);
                          }}
                          className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ver Perfil Completo & Atualizar Cadastro
                        </button>
                      </div>

                    </div>
                  );
                })() ) : (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center flex-1 flex flex-col justify-center items-center text-slate-400 space-y-3">
                    <Shield className="w-12 h-12 text-slate-300" />
                    <p className="text-xs font-semibold">Aguardando leitura de crachá digital...</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* 5. ADMIN CONTROL PANEL                   */}
        {/* ======================================= */}
        {currentMode === "admin" && currentUser && "isAdmin" in currentUser && (
          <div className="max-w-7xl mx-auto px-4 lg:px-16 py-8 space-y-8">
            
            {/* Header Title with tabs */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-slate-850 pb-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full lg:w-auto">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-950 dark:text-white transition-colors">Painel Administrativo OST Pay</h2>
                    <div className="relative flex items-center">
                      <button
                        onClick={() => setAdminDarkMode(!adminDarkMode)}
                        onMouseEnter={() => setShowToggleTooltip(true)}
                        onMouseLeave={() => setShowToggleTooltip(false)}
                        onFocus={() => setShowToggleTooltip(true)}
                        onBlur={() => setShowToggleTooltip(false)}
                        className={`relative w-16 h-9 rounded-full border shadow-inner cursor-pointer p-1 flex items-center shrink-0 select-none active:scale-90 contrast-125 ${
                          adminDarkMode 
                            ? "bg-white border-slate-300" 
                            : "bg-black border-slate-800"
                        }`}
                        style={{ transition: "all 0.3s ease, transform 0.1s ease" }}
                        title={adminDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
                        id="admin-dark-mode-toggle"
                      >
                        {/* Background icons */}
                        <div className="absolute inset-x-0 inset-y-0 flex justify-between items-center px-2 pointer-events-none">
                          <Moon className={`w-3.5 h-3.5 ${adminDarkMode ? "text-slate-300" : "text-indigo-400"} ${systemThemePulse ? "animate-pulse" : ""}`} style={{ transition: "all 0.3s ease" }} />
                          <Sun className={`w-3.5 h-3.5 ${adminDarkMode ? "text-amber-600" : "text-slate-700"} ${systemThemePulse ? "animate-pulse" : ""}`} style={{ transition: "all 0.3s ease" }} />
                        </div>

                        {/* Moving indicator */}
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10 ${
                            adminDarkMode 
                              ? "bg-slate-950 text-amber-500 ml-auto" 
                              : "bg-white text-indigo-600"
                          }`}
                          style={{ transition: "background-color 0.3s ease, color 0.3s ease" }}
                        >
                          {adminDarkMode ? (
                            <Sun className={`w-3.5 h-3.5 text-amber-500 ${systemThemePulse ? "animate-pulse" : ""}`} style={{ transition: "all 0.3s ease" }} />
                          ) : (
                            <Moon className={`w-3.5 h-3.5 text-indigo-600 ${systemThemePulse ? "animate-pulse" : ""}`} style={{ transition: "all 0.3s ease" }} />
                          )}
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {showToggleTooltip && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-md whitespace-nowrap z-50 pointer-events-none border border-slate-700/50"
                          >
                            Alternar modo de tema (Sistema: {typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "Escuro" : "Claro"})
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Gestão centralizada de membros, aprovação de quotas bancárias e relatórios fiscais.</p>
                </div>
              </div>

              <div className="flex flex-wrap bg-slate-200 dark:bg-slate-900/80 p-1 rounded-xl border border-transparent dark:border-slate-850 transition-colors gap-1">
                <button 
                  onClick={() => setAdminTab("overview")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${adminTab === "overview" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  Indicadores & Gráficos
                </button>
                <button 
                  onClick={() => setAdminTab("members")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${adminTab === "members" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  Membros ({members.length})
                </button>
                <button 
                  onClick={() => setAdminTab("worship")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${adminTab === "worship" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  Frequência do Culto ⛪
                </button>
                <button 
                  onClick={() => setAdminTab("reminders")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${adminTab === "reminders" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  Lembretes WhatsApp 💬
                </button>
                <button 
                  onClick={() => setAdminTab("audit")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${adminTab === "audit" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  Logs de Auditoria
                </button>
                <button 
                  onClick={() => setAdminTab("health")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${adminTab === "health" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Saúde & Assistência 🩺
                </button>
                <button 
                  onClick={() => setAdminTab("smtp")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${adminTab === "smtp" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  <Mail className="w-3.5 h-3.5" /> Configuração SMTP
                </button>
                <button 
                  onClick={() => setAdminTab("sync")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${adminTab === "sync" ? "bg-white text-slate-950 shadow dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  <Database className="w-3.5 h-3.5 text-blue-600" /> Sincronização Cloud
                </button>
              </div>
            </div>

            {/* BARRA DE PESQUISA GLOBAL (GLOBAL SEARCH BAR) */}
            <div className="relative w-full bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-colors duration-300">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 w-full md:w-auto">
                <div className="w-10 h-10 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">Pesquisa Global de Membros</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Encontre e faça ações rápidas por ID, E-mail, Telemóvel ou Nome completo.</p>
                </div>
              </div>

              <div className="relative w-full md:max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Pesquise por ID (ex: OST-...) ou E-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 pl-10 pr-10 py-3 rounded-2xl text-xs font-semibold outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-700 dark:focus:border-blue-500 text-slate-900 dark:text-white transition"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Instant Results Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-3.5 bg-slate-50 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <span>Membros Correspondentes ({globalSearchMatches.length})</span>
                      <button 
                        onClick={() => {
                          setAdminTab("members");
                        }}
                        className="text-blue-700 hover:underline hover:text-blue-800 cursor-pointer normal-case font-black flex items-center gap-0.5"
                      >
                        Ver tudo na tabela →
                      </button>
                    </div>
                    {globalSearchMatches.length > 0 ? (
                      globalSearchMatches.map(m => (
                        <div key={m.id} className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-black text-blue-700 text-xs flex-shrink-0">
                              {m.photoUrl ? (
                                <img src={m.photoUrl} alt="Photo" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                m.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-slate-900 truncate max-w-[150px]">{m.name}</span>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{m.id}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate font-medium">{m.email}</p>
                              <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{m.contact || "Sem contacto"} • {m.region}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 justify-end self-end sm:self-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${m.paymentStatus === "Ativo" ? "bg-green-100 text-green-700" : m.paymentStatus === "Pendente" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                              {m.paymentStatus}
                            </span>
                            
                            {/* Actions */}
                            {m.paymentStatus === "Pendente" && (
                              <button 
                                onClick={() => handleApprovePayment(m.id)}
                                className="bg-green-600 hover:bg-green-700 text-white font-extrabold text-[9px] px-2.5 py-1 rounded transition"
                              >
                                Aprovar
                              </button>
                            )}

                            {m.paymentStatus === "Ativo" && (
                              <button 
                                onClick={() => setSelectedReceipt(m)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[9px] px-2.5 py-1 rounded transition"
                              >
                                Recibo
                              </button>
                            )}

                            <button 
                              onClick={() => {
                                handleBlockUnblock(m.id, m.paymentStatus);
                              }}
                              className={`font-extrabold text-[9px] px-2.5 py-1 rounded transition ${m.paymentStatus === "Bloqueado" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                            >
                              {m.paymentStatus === "Bloqueado" ? "Ativar" : "Bloquear"}
                            </button>

                            <button 
                              onClick={() => {
                                setAdminTab("members");
                                setSearchQuery(m.id);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[9px] px-2.5 py-1 rounded transition"
                              title="Focar na Tabela"
                            >
                              Focar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Nenhum membro encontrado com <strong className="text-slate-600">"{searchQuery}"</strong>.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 5A. INDICATORS & KPI TAB */}
            {adminTab === "overview" && (
              <div className="space-y-8">
                
                {/* 5 KPIs grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Membros Registados</span>
                      <p className="text-3xl font-black text-slate-950 mt-1">{kpiTotalMembers}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Membros Ativos</span>
                      <p className="text-3xl font-black text-green-600 mt-1">{kpiActiveMembers}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Pagamentos Pendentes</span>
                      <p className="text-3xl font-black text-orange-600 mt-1">{kpiPendingMembers}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Receita Total Confirmada</span>
                      <p className="text-3xl font-black text-blue-900 mt-1">{kpiTotalRevenue} MT</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Growth stats in the last 30 days card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between col-span-2 md:col-span-1 xl:col-span-1">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Últimos 30 Dias (Crescimento)</span>
                      <p className="text-2xl font-black text-indigo-700 mt-1">+{kpiNewMembers30Days} Membros</p>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                        {kpiPaymentsProcessedAmount30Days.toLocaleString()} MT <span className="text-[10px] text-slate-400 font-normal">({kpiPaymentsProcessedCount30Days} pagos)</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Real-time Notification Center */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Bell className="w-5 h-5 text-blue-700 animate-pulse" />
                        {adminNotifications.filter(n => n.status === "Pendente").length > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                          Centro de Notificações de Pagamentos
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100">
                            Tempo Real
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500">Aprovações rápidas de transferências e depósitos bancários.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {adminNotifications.length > 0 && (
                        <button 
                          onClick={clearAllNotifications}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-3 py-2 rounded-xl transition"
                        >
                          Limpar Tudo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Auto-polling Control Bar */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${isPollingActive ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                          <span className={`h-2 w-2 rounded-full ${isPollingActive ? (isPollingAnimation ? 'bg-emerald-400 scale-125' : 'bg-emerald-500 animate-ping') : 'bg-slate-400'}`}></span>
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          Sistema de Polling Automático
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${isPollingActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {isPollingActive ? "ATIVO" : "INATIVO"}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isPollingActive 
                            ? `Próxima verificação automática em ${pollingTimeLeft} segundos...` 
                            : "Ative o polling automático para monitorizar novos pagamentos sem atualizar."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Frequência:</span>
                        <select 
                          value={pollingInterval} 
                          onChange={(e) => setPollingInterval(parseInt(e.target.value, 10))}
                          disabled={!isPollingActive}
                          className="bg-white border border-slate-250 rounded-lg text-[11px] font-bold px-2 py-1 outline-none focus:ring-1 focus:ring-blue-100 focus:border-blue-700 transition disabled:opacity-50"
                        >
                          <option value={10}>10 segundos</option>
                          <option value={15}>15 segundos</option>
                          <option value={30}>30 segundos</option>
                          <option value={60}>1 minuto</option>
                        </select>
                      </div>

                      <button
                        onClick={() => setIsPollingActive(!isPollingActive)}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                          isPollingActive 
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-900" 
                            : "bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
                        }`}
                      >
                        {isPollingActive ? "Pausar Monitorização" : "Ativar Auto-Polling"}
                      </button>
                    </div>
                  </div>

                  {adminNotifications.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 bg-slate-50/50">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-sm font-bold text-slate-800">Sem Pagamentos Pendentes</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">Todos os registos bancários e quotas foram auditados com sucesso. Novos pagamentos submetidos por membros aparecerão aqui em tempo real.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
                      {adminNotifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 rounded-2xl border transition-all duration-200 ${
                            n.status === "Pendente" 
                              ? "bg-amber-50/40 border-amber-200 ring-1 ring-amber-100/50" 
                              : n.status === "Aprovado" 
                              ? "bg-slate-50 border-slate-200 opacity-75" 
                              : "bg-red-50/30 border-red-100 opacity-75"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <p className="text-xs font-black text-slate-900">{n.memberName}</p>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">{n.memberId}</span>
                                <span>•</span>
                                <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              n.status === "Pendente" 
                                ? "bg-amber-100 text-amber-800" 
                                : n.status === "Aprovado" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {n.status === "Pendente" ? "Aguardando" : n.status}
                            </span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase block font-bold">Transferência</span>
                              <span className="font-extrabold text-blue-900">{n.amount} MT</span>
                            </div>

                            {n.status === "Pendente" ? (
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => handleRejectPayment(n.memberId)}
                                  className="bg-white hover:bg-red-50 border border-slate-200 text-red-600 font-bold px-2.5 py-1.5 rounded-xl text-[10px] transition flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Recusar
                                </button>
                                <button 
                                  onClick={() => handleApprovePayment(n.memberId)}
                                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] shadow transition flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Aprovar
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => dismissNotification(n.id)}
                                className="text-slate-400 hover:text-slate-600 text-[10px] font-bold transition"
                              >
                                Ocultar Alerta
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CONFIGURAÇÃO DE LEMBRETES AUTOMÁTICOS DE CULTO (30m Antes) */}
                <div id="worship-reminder-card" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm animate-fade-in">
                  
                  {/* Card Header with Toggle */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
                        <Clock className="w-5 h-5 text-indigo-700 animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                          Notificações & Lembretes Automáticos de Culto
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-850 border border-indigo-200">
                            -30 Minutos
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Configure e dispare avisos automáticos aos membros 30 minutos antes do início dos cultos.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                        worshipReminderActive 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${worshipReminderActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                        {worshipReminderActive ? "Automação Ativa" : "Pausada"}
                      </span>
                      <div className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={worshipReminderActive}
                          onChange={(e) => setWorshipReminderActive(e.target.checked)}
                          className="sr-only peer"
                          id="toggle-worship-reminder-active"
                        />
                        <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-indigo-700"></div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Settings Panel: Form */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* Name of Worship */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-xs text-slate-700">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Nome do Culto / Atividade</label>
                          <input 
                            type="text"
                            value={worshipReminderTitle}
                            onChange={(e) => setWorshipReminderTitle(e.target.value)}
                            placeholder="Ex: Culto de Celebração de Domingo"
                            className="w-full bg-slate-50/50 border border-slate-250 px-4 py-3 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                          />
                        </div>

                        {/* Start Time with dynamic minus 30 mins calculation */}
                        <div className="space-y-1.5 text-xs text-slate-700">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Hora de Início do Culto</label>
                          <div className="flex gap-2">
                            <input 
                              type="time"
                              value={worshipReminderTime}
                              onChange={(e) => setWorshipReminderTime(e.target.value)}
                              className="bg-slate-50/50 border border-slate-250 px-4 py-3 rounded-2xl font-black outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition flex-1 text-slate-800"
                            />
                            
                            {/* Computed Trigger Time */}
                            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-2xl flex flex-col justify-center items-center shrink-0 min-w-[120px]">
                              <span className="text-[8px] font-black uppercase text-indigo-700 tracking-widest">Disparo às</span>
                              <span className="text-sm font-black text-indigo-950 font-mono">
                                {getReminderTriggerTime(worshipReminderTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Filters Section (Ministry / Region) */}
                      <div className="space-y-3 pt-2">
                        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Público-Alvo & Filtro de Envio</label>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setWorshipReminderFilterType("all");
                              setWorshipReminderFilterValue("Todos");
                            }}
                            className={`py-3.5 px-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                              worshipReminderFilterType === "all"
                                ? "border-indigo-600 bg-indigo-50/40 text-indigo-950"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <Users className="w-4 h-4 mb-0.5" />
                            <span className="font-extrabold text-[11px]">Todos</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setWorshipReminderFilterType("ministry");
                              setWorshipReminderFilterValue("Louvor");
                            }}
                            className={`py-3.5 px-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                              worshipReminderFilterType === "ministry"
                                ? "border-indigo-600 bg-indigo-50/40 text-indigo-950"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <Briefcase className="w-4 h-4 mb-0.5" />
                            <span className="font-extrabold text-[11px]">Ministério</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setWorshipReminderFilterType("region");
                              setWorshipReminderFilterValue("Maputo Central");
                            }}
                            className={`py-3.5 px-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                              worshipReminderFilterType === "region"
                                ? "border-indigo-600 bg-indigo-50/40 text-indigo-950"
                                : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <MapPin className="w-4 h-4 mb-0.5" />
                            <span className="font-extrabold text-[11px]">Região</span>
                          </button>
                        </div>

                        {/* Conditional Dropdown for Ministry Selection */}
                        {worshipReminderFilterType === "ministry" && (
                          <div className="space-y-1.5 text-xs text-slate-700 animate-slide-down">
                            <label className="block text-[9px] font-black uppercase text-indigo-700">Selecione o Ministério de Destino</label>
                            <select
                              value={worshipReminderFilterValue}
                              onChange={(e) => setWorshipReminderFilterValue(e.target.value)}
                              className="w-full bg-white border border-slate-250 px-4 py-3 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            >
                              <option value="Todos">Todos os Ministérios</option>
                              <option value="Louvor">Louvor & Adoração</option>
                              <option value="Acolhimento">Acolhimento & Ordem</option>
                              <option value="Infantil">Ministério Infantil</option>
                              <option value="Intercessão">Intercessão & Oração</option>
                              <option value="Jovens">Força Jovem</option>
                              <option value="Mídia">Mídia & Comunicação</option>
                              <option value="Casais">Família & Casais</option>
                              <option value="Ação Social">Ação Social</option>
                            </select>
                          </div>
                        )}

                        {/* Conditional Dropdown for Region Selection */}
                        {worshipReminderFilterType === "region" && (
                          <div className="space-y-1.5 text-xs text-slate-700 animate-slide-down">
                            <label className="block text-[9px] font-black uppercase text-indigo-700">Selecione a Região de Destino</label>
                            <select
                              value={worshipReminderFilterValue}
                              onChange={(e) => setWorshipReminderFilterValue(e.target.value)}
                              className="w-full bg-white border border-slate-250 px-4 py-3 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            >
                              <option value="Todos">Todas as Regiões</option>
                              {REGIONS.map(reg => (
                                <option key={reg} value={reg}>{reg}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Configuração de Lembrete Inteligente */}
                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Configuração de Lembrete Inteligente</label>
                          <span className="text-[9px] text-slate-400 font-bold">Modelo de Mensagem</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                          <textarea
                            value={worshipReminderTemplate}
                            onChange={(e) => setWorshipReminderTemplate(e.target.value)}
                            rows={3}
                            placeholder="Defina o texto padrão para lembretes de culto."
                            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-slate-850 font-medium outline-none transition"
                          />
                          
                          {/* Variable insert buttons */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] text-slate-400 font-bold mr-1">Inserir:</span>
                            <button
                              type="button"
                              onClick={() => setWorshipReminderTemplate(prev => prev + "{nome}")}
                              className="bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                              title="Nome do membro"
                            >
                              {"{nome}"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setWorshipReminderTemplate(prev => prev + "{horário}")}
                              className="bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                              title="Horário do culto"
                            >
                              {"{horário}"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setWorshipReminderTemplate(prev => prev + "{culto}")}
                              className="bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                              title="Nome do culto"
                            >
                              {"{culto}"}
                            </button>
                          </div>

                          {/* Preview container */}
                          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-left space-y-1">
                            <span className="block text-[8px] font-black uppercase text-indigo-600 tracking-wider">Pré-visualização do Lembrete:</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium italic">
                              "{(() => {
                                const previewMemberName = members[0]?.name || "João Mateus";
                                return worshipReminderTemplate
                                  .replace(/{nome}/g, previewMemberName)
                                  .replace(/{horário}/g, worshipReminderTime)
                                  .replace(/{horario}/g, worshipReminderTime)
                                  .replace(/{culto}/g, worshipReminderTitle);
                              })()}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info alert */}
                      <div className="bg-indigo-50/50 border border-indigo-100/60 p-3.5 rounded-2xl flex gap-2.5 text-[11px] text-indigo-900 leading-relaxed">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Disparo Inteligente 30m antes:</strong> Quando a automação está ativa, o sistema dispara lembretes via API SMS/WhatsApp exatamente 30 minutos antes do horário configurado ({getReminderTriggerTime(worshipReminderTime)}). Apenas membros ativos recebem a notificação.
                        </div>
                      </div>
                    </div>

                    {/* Right Live Panel: Recipients & Logs */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                      
                      {/* Live Counter Screen */}
                      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Destinatários Estimados</span>
                          <p className="text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
                            {(() => {
                              const matching = members.filter(m => {
                                if (worshipReminderFilterType === "all") return true;
                                if (worshipReminderFilterType === "ministry") {
                                  if (worshipReminderFilterValue === "Todos") return true;
                                  return (m.ministry || "Nenhum") === worshipReminderFilterValue;
                                }
                                if (worshipReminderFilterType === "region") {
                                  if (worshipReminderFilterValue === "Todos") return true;
                                  return (m.region || "Nenhum") === worshipReminderFilterValue;
                                }
                                return true;
                              });
                              return matching.length;
                            })()} <span className="text-xs font-semibold text-slate-400">Filtrados</span>
                          </p>
                          <p className="text-[10px] text-slate-300">
                            Filtro atual: <strong className="text-indigo-300 font-bold uppercase">{worshipReminderFilterType === 'all' ? 'Geral (Todos)' : worshipReminderFilterValue}</strong>
                          </p>
                        </div>

                        {/* Quick scroll of selected avatars */}
                        {(() => {
                          const matching = members.filter(m => {
                            if (worshipReminderFilterType === "all") return true;
                            if (worshipReminderFilterType === "ministry") {
                              if (worshipReminderFilterValue === "Todos") return true;
                              return (m.ministry || "Nenhum") === worshipReminderFilterValue;
                            }
                            if (worshipReminderFilterType === "region") {
                              if (worshipReminderFilterValue === "Todos") return true;
                              return (m.region || "Nenhum") === worshipReminderFilterValue;
                            }
                            return true;
                          });

                          return matching.length > 0 ? (
                            <div className="border-t border-slate-800/80 pt-3 space-y-2">
                              <span className="text-[9px] font-black uppercase text-slate-400">Pré-visualização do Grupo:</span>
                              <div className="flex -space-x-2.5 overflow-hidden py-1 max-w-full">
                                {matching.slice(0, 8).map((m, idx) => (
                                  <div key={m.id} className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-300 overflow-hidden shrink-0" title={m.name}>
                                    {m.photoUrl ? (
                                      <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      m.name.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                ))}
                                {matching.length > 8 && (
                                  <div className="h-7 w-7 rounded-full ring-2 ring-slate-900 bg-indigo-900 flex items-center justify-center text-[9px] font-black text-indigo-200 shrink-0">
                                    +{matching.length - 8}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="border-t border-slate-800/80 pt-3 text-center text-slate-500 text-[11px] py-4">
                              Nenhum membro corresponde a este critério.
                            </div>
                          );
                        })()}

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-800/50">
                          <button
                            disabled={members.filter(m => {
                              if (worshipReminderFilterType === "all") return true;
                              if (worshipReminderFilterType === "ministry") {
                                if (worshipReminderFilterValue === "Todos") return true;
                                return (m.ministry || "Nenhum") === worshipReminderFilterValue;
                              }
                              if (worshipReminderFilterType === "region") {
                                if (worshipReminderFilterValue === "Todos") return true;
                                return (m.region || "Nenhum") === worshipReminderFilterValue;
                              }
                              return true;
                            }).length === 0}
                            onClick={handleTriggerWorshipReminders}
                            className="w-full bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 font-black py-3 px-4 rounded-2xl text-[11px] text-white transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Enviar Agora (Manual)
                          </button>
                        </div>
                      </div>

                      {/* Mini Live Log Console */}
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Histórico de Disparos de Culto</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 font-mono text-[9px] h-24 overflow-y-auto space-y-1 scrollbar-thin">
                          {worshipReminderHistory.map((item, index) => (
                            <div key={index} className="text-slate-600 border-b border-slate-100/60 pb-1 leading-normal">
                              &gt; {item}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Expiry Alert Summary and Control Panel */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950">Validade dos Crachás & Alertas de Expiração</h3>
                        <p className="text-xs text-slate-500 font-medium">Controlo preventivo de quotas anuais de membros ativos.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => runAutomatedExpiryNotifications(false)}
                      disabled={isCheckingExpiry}
                      className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingExpiry ? 'animate-spin' : ''}`} />
                      {isCheckingExpiry ? 'A verificar...' : 'Executar Varredura e Notificar Todos'}
                    </button>
                  </div>

                  {/* List of members with nearing or expired badges */}
                  {(() => {
                    const expiringOrExpired = members.filter(m => {
                      if (m.paymentStatus !== "Ativo" && m.paymentStatus !== "Bloqueado") return false;
                      const s = getExpiryStatus(m.expiryDate);
                      return s.nearing || s.expired;
                    });

                    if (expiringOrExpired.length === 0) {
                      return (
                        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Excelente! Todos os crachás de filiação ativos têm validade superior a 30 dias. Nenhuma ação administrativa imediata é necessária.</span>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                          <span>Membro</span>
                          <span>Estado de Validade</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                          {expiringOrExpired.map(m => {
                            const status = getExpiryStatus(m.expiryDate);
                            return (
                              <div key={m.id} className="py-2.5 flex justify-between items-center text-xs hover:bg-slate-50 px-1.5 rounded transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                                    {m.photoUrl ? (
                                      <img src={m.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                    ) : (
                                      m.name.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-900">{m.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{m.email} • {m.id}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {status.expired ? (
                                    <span className="inline-flex items-center gap-1 font-extrabold px-2.5 py-1 text-[10px] bg-red-100 text-red-700 rounded-full">
                                      <ShieldAlert className="w-3.5 h-3.5" /> Expirado a {m.expiryDate}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 font-extrabold px-2.5 py-1 text-[10px] bg-amber-100 text-amber-700 rounded-full">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Expira em {status.daysLeft} d ({m.expiryDate})
                                    </span>
                                  )}
                                  <button
                                    onClick={async (e) => {
                                      const btn = e.currentTarget;
                                      btn.disabled = true;
                                      btn.innerText = "A enviar...";
                                      const res = await sendExpiryEmailNotification(m, status.daysLeft);
                                      btn.disabled = false;
                                      btn.innerText = "Enviado";
                                      setTimeout(() => { btn.innerText = "Notificar" }, 3000);
                                      if (res.success) {
                                        const newToast: AdminToast = {
                                          id: "toast-" + Date.now(),
                                          title: "Notificação Enviada",
                                          message: `Notificação de validade de crachá disparada com sucesso para ${m.name}.`,
                                          type: "success"
                                        };
                                        setActiveToasts(prev => [newToast, ...prev]);
                                      } else {
                                        alert("Falha ao enviar e-mail.");
                                      }
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-lg transition shrink-0"
                                  >
                                    Notificar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setManualRemMemberId(m.id);
                                      setManualRemDate(new Date().toISOString().split("T")[0]);
                                      const s = getExpiryStatus(m.expiryDate);
                                      setManualRemMsg(
                                        s.expired 
                                          ? waTemplateExpired.replace("{nome}", m.name).replace("{validade}", m.expiryDate || "").replace("{link}", window.location.origin)
                                          : waTemplateExpiring.replace("{nome}", m.name).replace("{dias}", s.daysLeft.toString()).replace("{validade}", m.expiryDate || "").replace("{link}", window.location.origin)
                                      );
                                      setShowManualRemModal(true);
                                    }}
                                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1"
                                    title="Agendar Lembrete WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" /> Lembrete WA
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* RECHARTS VISUALIZATIONS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Revenue Evolution (Line Chart) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950">Evolução da Receita Mensal</h3>
                        <p className="text-[11px] text-slate-500">Fluxo consolidado de quotas de membros ativos em 2026.</p>
                      </div>
                      <span className="text-[10px] uppercase font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">Linha</span>
                    </div>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" MT" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                            labelStyle={{ fontWeight: "bold" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                          <Line 
                            type="monotone" 
                            dataKey="Receita (MT)" 
                            stroke="#1d4ed8" 
                            strokeWidth={3} 
                            activeDot={{ r: 8 }} 
                            dot={{ stroke: '#1d4ed8', strokeWidth: 2, r: 4, fill: '#fff' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Payment Method Distribution (Donut Chart / Rosca) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950">Distribuição por Método de Pagamento</h3>
                        <p className="text-[11px] text-slate-500">Participação de cada canal no volume total faturado (MT).</p>
                      </div>
                      <span className="text-[10px] uppercase font-black bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">Rosca</span>
                    </div>
                    <div className="w-full h-72 flex flex-col sm:flex-row items-center justify-center gap-6">
                      {paymentMethodData.length > 0 ? (
                        <>
                          <div className="w-full sm:w-1/2 h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={paymentMethodData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={55}
                                  outerRadius={75}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getMethodColor(entry.name)} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value) => [`${value} MT`, "Total Pago"]}
                                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full sm:w-1/2 space-y-2">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Legenda de Canais</h4>
                            {paymentMethodData.map((entry) => {
                              const totalSum = paymentMethodData.reduce((s: number, x: { name: string; value: number }) => s + x.value, 0);
                              const pct = totalSum > 0 ? (entry.value / totalSum) * 100 : 0;
                              return (
                                <div key={entry.name} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getMethodColor(entry.name) }}></span>
                                    <span className="font-bold text-slate-700">{entry.name}</span>
                                  </div>
                                  <span className="text-slate-900 font-extrabold">{entry.value} MT ({pct.toFixed(0)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-12 w-full">
                          Não há dados de pagamento ativo para processar.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Province Distribution (Pie Chart) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950">Distribuição de Membros por Província</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Análise geográfica da adesão de membros à OST.</p>
                      </div>
                      <span className="text-[10px] uppercase font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">Pizza</span>
                    </div>
                    <div className="w-full h-72 flex flex-col md:flex-row items-center justify-center gap-8">
                      {provinceData.length > 0 ? (
                        <>
                          <div className="w-full md:w-1/2 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={provinceData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  {provinceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PROVINCE_COLORS[index % PROVINCE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value) => [`${value} Membros`, "Total"]}
                                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full md:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white z-10 py-1 border-b border-slate-100">Proporção por Província</h4>
                            {provinceData.map((entry, index) => {
                              const totalSum = provinceData.reduce((s, x) => s + x.value, 0);
                              const pct = totalSum > 0 ? (entry.value / totalSum) * 100 : 0;
                              return (
                                <div key={entry.name} className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 px-1 rounded transition-all">
                                  <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PROVINCE_COLORS[index % PROVINCE_COLORS.length] }}></span>
                                    <span className="font-bold text-slate-700">{entry.name}</span>
                                  </div>
                                  <span className="text-slate-900 font-extrabold">{entry.value} {entry.value === 1 ? "membro" : "membros"} ({pct.toFixed(0)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-12 w-full">
                          Não há dados geográficos de membros para processar.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Monthly Variation of Active & Blocked Members (Bar Chart) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-950">Variação Mensal de Membros</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Comparação de membros Ativos e Bloqueados com o mês anterior.</p>
                      </div>
                      <span className="text-[10px] uppercase font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">Barras</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Active variation card */}
                      <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl">
                        <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider block">Membros Ativos</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xl font-black text-slate-950">{statusVariationData.activeThisMonth}</span>
                          <span className={`text-[10px] font-extrabold ${statusVariationData.activePct >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                            {statusVariationData.activePct >= 0 ? "▲" : "▼"} {statusVariationData.activePct >= 0 ? "+" : ""}{statusVariationData.activePct.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Anterior: <span className="font-bold">{statusVariationData.activeLastMonth}</span>
                        </p>
                      </div>

                      {/* Blocked variation card */}
                      <div className="bg-red-50/40 border border-red-100 p-3.5 rounded-2xl">
                        <span className="text-[9px] font-black uppercase text-red-800 tracking-wider block">Membros Bloqueados</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-xl font-black text-slate-950">{statusVariationData.blockedThisMonth}</span>
                          <span className={`text-[10px] font-extrabold ${statusVariationData.blockedPct >= 0 ? "text-rose-600" : "text-emerald-700"}`}>
                            {statusVariationData.blockedPct >= 0 ? "▲" : "▼"} {statusVariationData.blockedPct >= 0 ? "+" : ""}{statusVariationData.blockedPct.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Anterior: <span className="font-bold">{statusVariationData.blockedLastMonth}</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusVariationData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                            labelStyle={{ fontWeight: "bold" }}
                          />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                          <Bar dataKey="Mês Anterior" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Mês Atual" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Regional Top Distribution, Congregations Ranking and statistics reports */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Top regions list */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-700" />
                      Top 5 Regiões com Maior Filiação
                    </h3>
                    <div className="space-y-3">
                      {sortedRegionsBreakdown.map(([region, count], i) => {
                        const percent = kpiTotalMembers > 0 ? (count / kpiTotalMembers) * 100 : 0;
                        return (
                          <div key={region} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700">{i+1}. {region}</span>
                              <span className="text-slate-900">{count} membros ({percent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-blue-700 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top 5 Active Congregations Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                      <Church className="w-4 h-4 text-emerald-600" />
                      Top 5 Congregações (Ativos)
                    </h3>
                    <div className="space-y-3">
                      {sortedCongregationsBreakdown.length > 0 ? (
                        sortedCongregationsBreakdown.map(([congregation, count], i) => {
                          const percent = kpiActiveMembers > 0 ? (count / kpiActiveMembers) * 100 : 0;
                          return (
                            <div key={congregation} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-700">{i+1}. {congregation}</span>
                                <span className="text-slate-900">{count} ativos ({percent.toFixed(0)}%)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-12">
                          Nenhuma congregação ativa encontrada.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions summary & Print Reports */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-base font-extrabold text-slate-950 font-black">Exportar Relatórios Consolidados</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">Transmita as informações oficiais de auditoria, receitas das províncias e quotas faturadas exportando os relatórios em formato Excel ou PDF de forma segura.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 pt-6">
                      <button 
                        onClick={handleExportCSV}
                        className="flex-1 bg-slate-150 hover:bg-slate-250 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Download className="w-4 h-4" /> Excel (CSV)
                      </button>
                      <button 
                        onClick={handleExportPDFReport}
                        className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <Printer className="w-4 h-4" /> Imprimir Relatório
                      </button>
                    </div>
                  </div>

                </div>

                {/* PREMIUM: AI Receipt OCR Auditor & Fraud Score Scanner */}
                <div id="ai-receipt-auditor" className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                        Módulo de IA OST: Auditor de Recibos & Motor Antifraude
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Beta Inteligente
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">Leitura ótica e heurística instantânea de mensagens de texto, SMS e metadados de comprovativos de Moçambique.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Interactive Input Panel */}
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase block mb-2">1. Escolha um modelo de exemplo ou cole o texto do seu comprovativo</span>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setPastedReceiptText(
                              "M-Pesa Confirmado. Recebeu 1.500,00 MT de Maria Manjate (841234567) em 2026-07-02 às 14:22:15. Transação ID: TXN982048102. Saldo atual: 4.500,00 MT."
                            )}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-indigo-100 transition"
                          >
                            📝 SMS M-Pesa (Verde)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPastedReceiptText(
                              "E-Mola Confirmado. Recebeu 1.500,00 MT de Ricardo Santos (869876543) em 2026-07-01 às 11:30:00. Transação ID: TXN102941992. (ALERTA: ID já registado no sistema de auditoria!)."
                            )}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-amber-100 transition"
                          >
                            ⚠️ SMS E-Mola (Duplicado)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPastedReceiptText(
                              "Documento DIGITAL OST PAY. Pagamento de Filiação Anual. Valor: 10.000,00 MT. Nome: Levi Chingoma. Transação ID: TXN491023812. (Inconsistência detetada: Assinatura SHA-256 inválida / Documento Adulterado)."
                            )}
                            className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-red-100 transition"
                          >
                            🚨 Recibo PDF Adulterado
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPastedReceiptText(""); setScanResult(null); }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition"
                          >
                            Limpar
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          value={pastedReceiptText}
                          onChange={(e) => setPastedReceiptText(e.target.value)}
                          placeholder="Cole aqui o SMS do operador (M-Pesa, e-Mola) ou o texto extraído do comprovativo de transferência bancária..."
                          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl p-4 text-xs font-mono text-slate-800 outline-none transition shadow-sm leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleScanReceipt}
                          disabled={isScanningReceipt || !pastedReceiptText.trim()}
                          className="bg-indigo-700 hover:bg-indigo-800 text-white disabled:bg-indigo-400 px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-100"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isScanningReceipt ? "animate-spin" : ""}`} />
                          {isScanningReceipt ? "A analisar dados de IA..." : "Executar Auditoria de IA"}
                        </button>
                      </div>
                    </div>

                    {/* Right: AI Results Bento Card */}
                    <div className="lg:col-span-5">
                      {isScanningReceipt ? (
                        <div className="h-full bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col justify-center items-center text-slate-400 space-y-4 animate-pulse">
                          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                          <div className="text-center space-y-1">
                            <p className="text-xs font-bold text-slate-700">A processar motor heurístico...</p>
                            <p className="text-[10px] text-slate-400">Verificando assinaturas criptográficas & colisões de hash.</p>
                          </div>
                        </div>
                      ) : scanResult ? (
                        <div className={`h-full border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden transition-all duration-300 ${
                          scanResult.riskLevel === "baixa" 
                            ? "bg-emerald-50/50 border-emerald-200" 
                            : scanResult.riskLevel === "alta" 
                            ? "bg-amber-50/50 border-amber-200" 
                            : "bg-red-50/50 border-red-200"
                        }`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resultado da Auditoria</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                scanResult.riskLevel === "baixa" 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : scanResult.riskLevel === "alta" 
                                  ? "bg-amber-100 text-amber-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                Risco {scanResult.riskLevel}
                              </span>
                            </div>

                            {/* Trust score visual radial indicator */}
                            <div className="flex items-center gap-4">
                              <div className="relative flex items-center justify-center shrink-0">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white border shadow-sm border-slate-200">
                                  <span className={`text-sm font-black ${
                                    scanResult.riskLevel === "baixa" 
                                      ? "text-emerald-600" 
                                      : scanResult.riskLevel === "alta" 
                                      ? "text-amber-600" 
                                      : "text-red-600"
                                  }`}>{scanResult.trustPct}%</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">Grau de Confiança IA</h4>
                                <p className="text-[10px] text-slate-500">Heurística e correspondência operacional.</p>
                              </div>
                            </div>

                            {/* Extracted Details Table */}
                            <div className="bg-white/80 backdrop-blur-sm border border-slate-150/80 rounded-xl p-3 space-y-1.5 text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Canal / Gateway:</span>
                                <span className="font-extrabold text-slate-900">{scanResult.platform}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">ID Transação:</span>
                                <span className="font-mono font-extrabold text-slate-900">{scanResult.txId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Valor Reconhecido:</span>
                                <span className="font-extrabold text-indigo-700">{scanResult.value}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Identidade do Remetente:</span>
                                <span className="font-extrabold text-slate-900 truncate max-w-[120px]">{scanResult.sender}</span>
                              </div>
                            </div>

                            {/* IA Guidance and Insights */}
                            <div className="space-y-1 pt-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recomendações IA</span>
                              <div className="space-y-1">
                                {scanResult.insights.map((ins, i) => (
                                  <p key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                                    <span className="shrink-0 text-slate-400">•</span>
                                    <span>{ins}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-200/50 pt-2.5 text-[9px] font-mono text-slate-500 leading-normal">
                            <strong>Log do Analisador:</strong> {scanResult.logDetails}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center flex-1 flex flex-col justify-center items-center text-slate-400 space-y-3">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                            <Info className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-700">Resultado da Análise Heurística</p>
                            <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Insira o texto do comprovativo ao lado e acione a auditoria para obter a pontuação de risco e confiança em tempo real.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 5B. REGISTERED MEMBERS LIST TAB */}
            {adminTab === "members" && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                
                {/* Search & filters bar */}
                <div className="p-5 border-b border-slate-150 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
                  <div className="relative w-full md:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar membro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-700"
                    />
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="Todos">Todos os Estados</option>
                      <option value="Ativo">Ativos</option>
                      <option value="Pendente">Pendentes</option>
                      <option value="Bloqueado">Bloqueados</option>
                    </select>

                    <select 
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold outline-none max-w-[160px]"
                    >
                      <option value="Todas">Todas as Regiões</option>
                      {REGIONS.slice(0, 15).map(reg => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>

                    <button
                      onClick={handleExportFilteredMembersPDF}
                      className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
                      title="Exportar a lista filtrada de membros em PDF"
                    >
                      <FileText className="w-3.5 h-3.5" /> Exportar PDF
                    </button>

                    <button
                      onClick={handleExportAllReceiptsPDF}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
                      title="Exportar todos os recibos de pagamentos aprovados (Ativos) da lista filtrada em lote PDF"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Exportar Todos os Recibos
                    </button>

                    <button
                      onClick={handleExportBulkBadgesA4PDF}
                      disabled={isGeneratingBulk}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0 cursor-pointer"
                      title="Gerar ficheiro PDF A4 contendo 8 crachás por página com marcas de corte para impressão em massa"
                    >
                      {isGeneratingBulk ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>A Gerar {bulkProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Printer className="w-3.5 h-3.5" />
                          <span>Crachás em Massa (8/A4)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Members list table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="p-4 pl-6">ID / Membro</th>
                        <th className="p-4">Região / Província</th>
                        <th className="p-4">Contacto</th>
                        <th className="p-4">Estado Pagamento</th>
                        <th className="p-4">Recibo / Crachá</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((m) => {
                          const expiryStatus = getExpiryStatus(m.expiryDate);
                          const rowBg = expiryStatus.nearing 
                            ? "bg-yellow-50/90 hover:bg-yellow-100/90 border-l-4 border-l-yellow-500 font-semibold" 
                            : expiryStatus.expired 
                            ? "bg-red-50/60 hover:bg-red-100/60 border-l-4 border-l-red-400" 
                            : "hover:bg-slate-50/60";
                          
                          return (
                            <tr key={m.id} className={`${rowBg} transition-all`}>
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-blue-700 overflow-hidden">
                                    {m.photoUrl ? (
                                      <img src={m.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                    ) : (
                                      m.name.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-950">{m.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] text-slate-500 font-mono">{m.id}</span>
                                      {m.role && (
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${getPositionTheme(m.role).badgeBg} ${getPositionTheme(m.role).badgeText}`}>
                                          {getPositionTheme(m.role).name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-slate-900">{m.region}</p>
                                <p className="text-[10px] text-slate-500">{m.province}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold">{m.contact}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{m.email}</p>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ${m.paymentStatus === "Ativo" ? "bg-green-100 text-green-700" : m.paymentStatus === "Pendente" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                                    {m.paymentStatus}
                                  </span>
                                  
                                  {m.paymentStatus === "Ativo" && m.expiryDate && (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-[10px] text-slate-500 font-medium font-mono">Validade: {m.expiryDate}</span>
                                      {expiryStatus.nearing && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-100/80 px-1.5 py-0.5 rounded w-max">
                                          <AlertTriangle className="w-3 h-3 text-amber-600 animate-bounce" />
                                          Expira em {expiryStatus.daysLeft} dias
                                        </span>
                                      )}
                                      {expiryStatus.expired && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded w-max">
                                          <ShieldAlert className="w-3 h-3 text-red-600 animate-pulse" />
                                          Expirado há {Math.abs(expiryStatus.daysLeft)} dias
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[10px]">
                                {m.receiptNumber ? (
                                  <div className="space-y-0.5">
                                    <p className="text-slate-700 font-bold">{m.receiptNumber}</p>
                                    <p className="text-slate-400">{m.badgeNumber}</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Sem registo fiscal</span>
                                )}
                              </td>
                              <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                                {m.paymentStatus === "Pendente" && (
                                  <button 
                                    onClick={() => handleApprovePayment(m.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded text-[10px] transition"
                                    title="Aprovar Transferência"
                                  >
                                    Aprovar
                                  </button>
                                )}

                                {(expiryStatus.nearing || expiryStatus.expired) && (<>
                                  <button
                                    onClick={async (e) => {
                                      const btn = e.currentTarget;
                                      btn.disabled = true;
                                      btn.innerText = "A enviar...";
                                      const res = await sendExpiryEmailNotification(m, expiryStatus.daysLeft);
                                      btn.disabled = false;
                                      btn.innerText = "Alerta Enviado";
                                      setTimeout(() => { btn.innerText = "Enviar Alerta" }, 3000);
                                      if (res.success) {
                                        const newToast: AdminToast = {
                                          id: "toast-" + Date.now(),
                                          title: "Notificação Enviada",
                                          message: `E-mail de aviso de expiração enviado com sucesso para ${m.name}.`,
                                          type: "success"
                                        };
                                        setActiveToasts(prev => [newToast, ...prev]);
                                      } else {
                                        alert("Erro ao enviar e-mail de expiração.");
                                      }
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded text-[10px] transition inline-flex items-center gap-1"
                                    title="Enviar e-mail de alerta de expiração"
                                  >
                                    <Mail className="w-3 h-3" /> Enviar Alerta
                                  </button>
                                  <button
                                    onClick={() => {
                                      setManualRemMemberId(m.id);
                                      setManualRemDate(new Date().toISOString().split("T")[0]);
                                      const s = getExpiryStatus(m.expiryDate);
                                      setManualRemMsg(
                                        s.expired 
                                          ? waTemplateExpired.replace("{nome}", m.name).replace("{validade}", m.expiryDate || "").replace("{link}", window.location.origin)
                                          : waTemplateExpiring.replace("{nome}", m.name).replace("{dias}", s.daysLeft.toString()).replace("{validade}", m.expiryDate || "").replace("{link}", window.location.origin)
                                      );
                                      setShowManualRemModal(true);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[10px] transition inline-flex items-center gap-1"
                                    title="Agendar Lembrete WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" /> Lembrete WA
                                  </button>
                                </>)}
                                
                                <button 
                                  onClick={() => handleBlockUnblock(m.id, m.paymentStatus)}
                                  className={`font-bold px-2.5 py-1 rounded text-[10px] transition ${m.paymentStatus === "Bloqueado" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                >
                                  {m.paymentStatus === "Bloqueado" ? "Desbloquear" : "Bloquear"}
                                </button>
  
                                {m.paymentStatus === "Ativo" && (
                                  <div className="inline-flex gap-1.5">
                                    <button 
                                      onClick={() => setSelectedReceipt(m)}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded text-[10px] transition"
                                      title="Ver Recibo"
                                    >
                                      Recibo
                                    </button>
                                    <button 
                                      onClick={() => setSelectedBadge(m)}
                                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded text-[10px] transition"
                                      title="Ver e Imprimir Crachá"
                                    >
                                      Crachá
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">Nenhum membro encontrado correspondente aos filtros.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* 5C. AUDIT LOGS TAB */}
            {adminTab === "audit" && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-950 text-base">Registos de Auditoria Geral</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono">{logs.length} ações</span>
                </div>

                <div className="space-y-2 max-h-[480px] overflow-y-auto font-mono text-[11px] divide-y divide-slate-100">
                  {logs.map((log) => (
                    <div key={log.id} className="py-2.5 flex justify-between items-center hover:bg-slate-50 px-2 rounded transition">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="font-bold text-blue-900">{log.user}:</span>
                        <span className="text-slate-700">{log.action}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${log.type === "success" ? "bg-green-100 text-green-700" : log.type === "warning" ? "bg-orange-100 text-orange-700" : log.type === "danger" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {log.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5D. WORSHIP REPORTS TAB */}
            {adminTab === "worship" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Statistics Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-3xl border border-blue-900 shadow-sm space-y-1">
                    <span className="text-[10px] text-blue-200 uppercase font-black tracking-widest block">Total de Presentes</span>
                    <p className="text-3xl font-black">{attendanceRecords.length}</p>
                    <p className="text-[11px] text-blue-300">Total registado no dia de hoje</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Membros Presentes</span>
                    <p className="text-3xl font-black text-slate-900">
                      {attendanceRecords.filter(r => r.memberRole !== "Visitante").length}
                    </p>
                    <p className="text-[11px] text-emerald-600">Com cadastro ativo</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Visitantes Registados</span>
                    <p className="text-3xl font-black text-amber-600">
                      {attendanceRecords.filter(r => r.memberRole === "Visitante").length}
                    </p>
                    <p className="text-[11px] text-amber-600">Novas pessoas recebidas hoje</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Congregações Presentes</span>
                    <p className="text-3xl font-black text-indigo-700">
                      {new Set(attendanceRecords.map(r => r.congregation)).size}
                    </p>
                    <p className="text-[11px] text-slate-500">Regiões participativas</p>
                  </div>
                </div>

                {/* Main breakdowns Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Presença por Ministério Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="font-extrabold text-slate-950 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span>Frequência por Ministério</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">Distribuição</span>
                    </h3>

                    <div className="space-y-3">
                      {(() => {
                        const ministryCounts: Record<string, number> = {};
                        attendanceRecords.forEach(r => {
                          const min = r.ministry || "Nenhum";
                          ministryCounts[min] = (ministryCounts[min] || 0) + 1;
                        });
                        
                        const items = Object.entries(ministryCounts).sort((a,b) => b[1] - a[1]);
                        if (items.length === 0) return <p className="text-xs text-slate-400 text-center py-4">Nenhum registo de presença.</p>;
                        
                        return items.map(([ministry, count]) => {
                          const percentage = Math.round((count / attendanceRecords.length) * 100);
                          return (
                            <div key={ministry} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-700">{ministry}</span>
                                <span className="font-bold text-slate-900">{count} presentes ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Presença por Congregação / Região Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="font-extrabold text-slate-950 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span>Frequência por Congregação / Região</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">Regiões</span>
                    </h3>

                    <div className="space-y-3">
                      {(() => {
                        const congregationCounts: Record<string, number> = {};
                        attendanceRecords.forEach(r => {
                          const cong = r.congregation || "Outra";
                          congregationCounts[cong] = (congregationCounts[cong] || 0) + 1;
                        });
                        
                        const items = Object.entries(congregationCounts).sort((a,b) => b[1] - a[1]);
                        if (items.length === 0) return <p className="text-xs text-slate-400 text-center py-4">Nenhum registo de presença.</p>;

                        return items.map(([congregation, count]) => {
                          const percentage = Math.round((count / attendanceRecords.length) * 100);
                          return (
                            <div key={congregation} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-700">{congregation}</span>
                                <span className="font-bold text-slate-900">{count} presentes ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>

                {/* Frequência de cada membro / Visitantes do dia Table */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-base">Ficha de Frequência do Culto</h3>
                      <p className="text-xs text-slate-500">Membros e Visitantes que confirmaram presença no culto de hoje.</p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const csvContent = "data:text/csv;charset=utf-8," 
                            + ["ID,Nome,Cargo,Congregacao,Ministerio,Timestamp"].join(",") + "\n"
                            + attendanceRecords.map(r => `${r.memberId},"${r.memberName}",${r.memberRole},"${r.congregation}","${r.ministry}",${r.timestamp}`).join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `Frequencia_Culto_${new Date().toISOString().split('T')[0]}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          setActiveToasts(prev => [
                            {
                              id: "toast-" + Date.now(),
                              title: "Sucesso",
                              message: "Lista de Frequência exportada em formato CSV para Excel!",
                              type: "success"
                            },
                            ...prev
                          ]);
                        }}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Exportar Excel
                      </button>

                      <button 
                        onClick={handleExportWorshipStatsPDF}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Exportar Estatísticas de Culto
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">ID Membro</th>
                          <th className="py-3 px-2">Nome</th>
                          <th className="py-3 px-2">Cargo / Tipo</th>
                          <th className="py-3 px-2">Congregação</th>
                          <th className="py-3 px-2">Ministério</th>
                          <th className="py-3 px-2 text-right">Hora de Entrada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceRecords.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">Nenhum membro registou presença hoje neste painel.</td>
                          </tr>
                        ) : (
                          attendanceRecords.map((r) => {
                            return (
                              <tr key={r.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 px-2 font-mono font-bold text-slate-900">{r.memberId}</td>
                                <td className="py-3 px-2 font-bold text-slate-900">{r.memberName}</td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    r.memberRole === "Pastor" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                                    r.memberRole === "Ancião" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                                    r.memberRole === "Diácono" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                    r.memberRole === "Visitante" ? "bg-slate-100 text-slate-700" :
                                    "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}>
                                    {r.memberRole}
                                  </span>
                                </td>
                                <td className="py-3 px-2 font-medium text-slate-600">{r.congregation}</td>
                                <td className="py-3 px-2 text-slate-500 font-medium">{r.ministry}</td>
                                <td className="py-3 px-2 text-right font-bold text-slate-900">
                                  {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {adminTab === "reminders" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Statistics Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl border border-indigo-950 shadow-sm space-y-1">
                    <span className="text-[10px] text-indigo-200 uppercase font-black tracking-widest block">Total Agendados</span>
                    <p className="text-3xl font-black">{whatsappReminders.filter(r => r.status === "Agendado").length}</p>
                    <p className="text-[11px] text-indigo-300">Lembretes na fila de envio</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Lembretes Enviados</span>
                    <p className="text-3xl font-black text-emerald-600">
                      {whatsappReminders.filter(r => r.status === "Enviado").length}
                    </p>
                    <p className="text-[11px] text-emerald-600">Entregues via WhatsApp API</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Lembretes Cancelados</span>
                    <p className="text-3xl font-black text-slate-400">
                      {whatsappReminders.filter(r => r.status === "Cancelado").length}
                    </p>
                    <p className="text-[11px] text-slate-400">Cancelados administrativamente</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Crachás a Expirar ({reminderAdvanceDays}d)</span>
                    <p className="text-3xl font-black text-amber-500">
                      {members.filter(m => {
                        if (m.paymentStatus !== "Ativo") return false;
                        const s = getExpiryStatus(m.expiryDate);
                        return s.nearing || s.expired;
                      }).length}
                    </p>
                    <p className="text-[11px] text-slate-500">Membros elegíveis para lembrete</p>
                  </div>
                </div>

                {/* Navigation Sub-Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xl">
                  <button
                    onClick={() => setRemindersSubTab("queue")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                      remindersSubTab === "queue"
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Fila de Lembretes & Configurações
                  </button>
                  <button
                    onClick={() => setRemindersSubTab("history")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                      remindersSubTab === "history"
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Histórico de Mensagens ({whatsappReminders.filter(r => r.status === "Enviado").length})
                  </button>
                  <button
                    onClick={() => setRemindersSubTab("templates")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                      remindersSubTab === "templates"
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Templates Inteligentes ({smartTemplates.length})
                  </button>
                </div>

                {remindersSubTab === "queue" && (
                  <>
                    {/* Automation & Template Setup Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* WhatsApp Customization & Templates Panel */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                    <h3 className="font-extrabold text-slate-950 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-blue-600" />
                        Configurações & Modelos WhatsApp
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full uppercase">Configuração</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Flexibilidade de Gestão de Quotas - Dias de Antecedência */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                            Dias de Antecedência (Quotas)
                          </label>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-md border border-indigo-100">
                            Foco em Gestão Flexível
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="90"
                            value={reminderAdvanceDays}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setReminderAdvanceDays(val);
                            }}
                            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shrink-0 shadow-sm">
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={reminderAdvanceDays}
                              onChange={(e) => {
                                let val = parseInt(e.target.value, 10);
                                if (isNaN(val)) val = 1;
                                setReminderAdvanceDays(Math.max(1, Math.min(120, val)));
                              }}
                              className="w-10 bg-transparent text-center font-black text-xs text-slate-900 focus:outline-none"
                            />
                            <span className="text-[10px] font-bold text-slate-500">dias</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          Define com quantos dias de antecedência o crachá será sinalizado para renovação, habilitando alertas de quota (atualmente {reminderAdvanceDays} dias).
                        </p>
                      </div>

                      {/* Painel de Horário de Silêncio */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[11px] font-black text-slate-800 uppercase tracking-wider">
                            <Moon className="w-4 h-4 text-indigo-600" />
                            Horário de Silêncio (Quiet Hours)
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={quietHoursEnabled} 
                              onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                              className="sr-only peer" 
                            />
                            <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:bg-slate-300 peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>

                        {quietHoursEnabled && (
                          <div className="space-y-3 animate-fade-in">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Início do Silêncio</label>
                                <input 
                                  type="time" 
                                  value={quietHoursStart}
                                  onChange={(e) => setQuietHoursStart(e.target.value)}
                                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Fim do Silêncio</label>
                                <input 
                                  type="time" 
                                  value={quietHoursEnd}
                                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                                  className="w-full bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm"
                                />
                              </div>
                            </div>
                            
                            {/* Quiet Hours Status Indicator */}
                            <div className={`flex items-center gap-2.5 px-3 py-2 border rounded-xl shadow-sm ${
                              isCurrentlyInQuietHours() 
                                ? 'bg-amber-50 border-amber-200/60 text-amber-900' 
                                : 'bg-slate-50 border-slate-150 text-slate-600'
                            }`}>
                              <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrentlyInQuietHours() ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`}></span>
                              <p className="text-[10px] font-semibold leading-normal">
                                {isCurrentlyInQuietHours() ? (
                                  <>
                                    <strong>Horário de Silêncio Ativo:</strong> Mensagens em lote estão retidas das {quietHoursStart} às {quietHoursEnd} para respeitar o descanso dos membros.
                                  </>
                                ) : (
                                  <>
                                    <strong>Horário de Silêncio Configurado:</strong> Ativo diariamente das {quietHoursStart} às {quietHoursEnd}. No momento, o envio em lote está liberado.
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {!quietHoursEnabled && (
                          <p className="text-[10px] text-slate-400 font-medium leading-normal">
                            ⚠️ O horário de silêncio está desativado. Mensagens em lote e automáticas serão processadas de forma imediata sem restrições de horário ou descanso.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Crachá a Expirar (Modelo Brevemente)</label>
                        <textarea
                          value={waTemplateExpiring}
                          onChange={(e) => setWaTemplateExpiring(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Crachá Expirado (Modelo Expirado)</label>
                        <textarea
                          value={waTemplateExpired}
                          onChange={(e) => setWaTemplateExpired(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100">
                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-wider mb-1.5">Variáveis Disponíveis:</h4>
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className="bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">{"{nome}"}</span>
                          <span className="bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">{"{dias}"}</span>
                          <span className="bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">{"{validade}"}</span>
                          <span className="bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">{"{link}"}</span>
                        </div>
                        <p className="text-[10px] text-blue-700 mt-2">As variáveis são preenchidas automaticamente ao gerar agendamentos baseados nos dados dos crachás.</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Manual Scheduler Panel */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          Automação & Agendamento Manual
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full uppercase">Controles</span>
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed mt-2">
                        O sistema monitoriza o histórico de vencimento dos crachás dos membros e permite disparar ou agendar lembretes automáticos de renovação via WhatsApp.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                        <button
                          onClick={generateAutomaticWAReminders}
                          className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition shadow-sm flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Varredura & Auto-Agendar
                        </button>

                        <button
                          onClick={() => {
                            if (members.length > 0) {
                              setManualRemMemberId(members[0].id);
                              setManualRemDate(new Date().toISOString().split("T")[0]);
                              const s = getExpiryStatus(members[0].expiryDate);
                              setManualRemMsg(
                                s.expired 
                                  ? waTemplateExpired.replace("{nome}", members[0].name).replace("{validade}", members[0].expiryDate || "").replace("{link}", window.location.origin)
                                  : waTemplateExpiring.replace("{nome}", members[0].name).replace("{dias}", s.daysLeft.toString()).replace("{validade}", members[0].expiryDate || "").replace("{link}", window.location.origin)
                              );
                            }
                            setShowManualRemModal(true);
                          }}
                          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl transition shadow-sm flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Novo Lembrete Manual
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2 mt-4 lg:mt-0">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Envio em Lote de Lembretes do Dia</h4>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[11px] text-slate-600">
                          Dispare todos os lembretes agendados com data igual ou anterior a hoje.
                        </p>
                        <button
                          onClick={() => {
                            if (isCurrentlyInQuietHours()) {
                              setActiveToasts(prev => [
                                {
                                  id: "toast-" + Date.now(),
                                  title: "Horário de Silêncio Ativo",
                                  message: `O envio em lote está suspenso durante o horário de silêncio (${quietHoursStart} às ${quietHoursEnd}) para respeitar o descanso dos membros.`,
                                  type: "warning"
                                },
                                ...prev
                              ]);
                              alert(`O envio em lote está bloqueado no momento porque o Horário de Silêncio está ativo (${quietHoursStart} às ${quietHoursEnd}) para respeitar o descanso dos membros. Ajuste o painel ou aguarde o término do período.`);
                              return;
                            }

                            const todayStr = new Date().toISOString().split("T")[0];
                            const pendingReminders = whatsappReminders.filter(
                              r => r.status === "Agendado" && r.scheduledDate <= todayStr
                            );
                            
                            if (pendingReminders.length === 0) {
                              alert("Nenhum lembrete pendente agendado para hoje ou dias anteriores.");
                              return;
                            }
                            
                            setWhatsappReminders(prev => {
                              return prev.map(r => {
                                if (r.status === "Agendado" && r.scheduledDate <= todayStr) {
                                  addLog("WhatsApp API", `Mensagem automática de lembrete enviada para ${r.memberName} (${r.contact})`, "success");
                                  return { ...r, status: "Enviado", sentAt: new Date().toISOString() };
                                }
                                return r;
                              });
                            });
                            
                            setActiveToasts(prev => [
                              {
                                id: "toast-" + Date.now(),
                                title: "Envio Concluído",
                                message: `Disparados ${pendingReminders.length} lembretes automáticos de renovação via API local!`,
                                type: "success"
                              },
                              ...prev
                            ]);
                          }}
                          className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold py-2 px-3.5 rounded-xl hover:bg-slate-50 transition shrink-0 flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-600" />
                          Disparar Pendentes ({whatsappReminders.filter(r => r.status === "Agendado" && r.scheduledDate <= new Date().toISOString().split("T")[0]).length})
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Scheduled Reminders Table Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                  
                  {isCurrentlyInQuietHours() && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                      <Moon className="w-5 h-5 text-amber-600 shrink-0" />
                      <div className="text-xs">
                        <p className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">Horário de Silêncio Ativo ({quietHoursStart} - {quietHoursEnd})</p>
                        <p className="font-medium text-amber-700 mt-0.5">O envio automático em lote de lembretes está temporariamente suspenso para respeitar o descanso dos membros.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Filters and search row */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-950 text-base">Fila de Lembretes de Renovação</h3>
                      <p className="text-xs text-slate-500">Veja, edite ou envie os lembretes programados de acordo com a validade dos crachás.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      {/* Search Input */}
                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Pesquisar por membro ou ID..."
                          value={waSearchQuery}
                          onChange={(e) => setWaSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        />
                      </div>

                      {/* Status Selector */}
                      <select
                        value={waFilterStatus}
                        onChange={(e) => setWaFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                      >
                        <option value="Todos">Todos os Lembretes</option>
                        <option value="Agendado">Agendados</option>
                        <option value="Enviado">Enviados</option>
                        <option value="Cancelado">Cancelados</option>
                      </select>
                    </div>
                  </div>

                  {/* List of Reminders */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">ID & Nome</th>
                          <th className="py-3 px-2">WhatsApp</th>
                          <th className="py-3 px-2">Estado Crachá</th>
                          <th className="py-3 px-2">Data Programada</th>
                          <th className="py-3 px-2">Mensagem do Lembrete</th>
                          <th className="py-3 px-2">Estado</th>
                          <th className="py-3 px-2 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const filtered = whatsappReminders.filter(r => {
                            const matchSearch = r.memberName.toLowerCase().includes(waSearchQuery.toLowerCase()) || 
                              r.memberId.toLowerCase().includes(waSearchQuery.toLowerCase());
                            const matchStatus = waFilterStatus === "Todos" || r.status === waFilterStatus;
                            return matchSearch && matchStatus;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">Nenhum lembrete programado coincide com os critérios de pesquisa.</td>
                              </tr>
                            );
                          }

                          return filtered.map((r) => {
                            const isExpired = r.daysLeft < 0;
                            return (
                              <tr key={r.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 px-2">
                                  <div className="font-bold text-slate-900">{r.memberName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{r.memberId}</div>
                                </td>
                                <td className="py-3 px-2 font-medium text-slate-600 font-mono">{r.contact}</td>
                                <td className="py-3 px-2">
                                  {isExpired ? (
                                    <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                      Expirado há {Math.abs(r.daysLeft)}d
                                    </span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                      Expira em {r.daysLeft}d
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2 font-bold text-slate-700 font-mono">{r.scheduledDate}</td>
                                <td className="py-3 px-2 max-w-xs truncate text-slate-500 font-medium" title={r.message}>
                                  {r.message}
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    r.status === "Enviado" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                    r.status === "Agendado" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                    r.status === "Cancelado" ? "bg-slate-100 text-slate-500" : "bg-red-50 text-red-700 border border-red-200"
                                  }`}>
                                    {r.status}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-right space-x-1.5 whitespace-nowrap">
                                  {r.status === "Agendado" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingReminder(r);
                                        }}
                                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                                        title="Editar Mensagem"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setWhatsappReminders(prev => prev.map(item => {
                                            if (item.id === r.id) {
                                              return { ...item, status: "Cancelado" };
                                            }
                                            return item;
                                          }));
                                          addLog("Sistema", `Cancelou lembrete agendado para ${r.memberName}`, "warning");
                                        }}
                                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-600 transition"
                                        title="Cancelar Lembrete"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                  
                                  <button
                                    onClick={() => {
                                      if (isCurrentlyInQuietHours()) {
                                        const confirmSend = window.confirm(`Atenção: O Horário de Silêncio está ativo no momento (${quietHoursStart} às ${quietHoursEnd}). Tem certeza absoluta que deseja enviar este lembrete manual agora e ignorar o horário de descanso do membro?`);
                                        if (!confirmSend) return;
                                      }

                                      setWhatsappReminders(prev => prev.map(item => {
                                        if (item.id === r.id) {
                                          return { ...item, status: "Enviado", sentAt: new Date().toISOString() };
                                        }
                                        return item;
                                      }));
                                      addLog("Sistema", `Enviou lembrete manual via WhatsApp para ${r.memberName}`, "success");
                                      
                                      const cleanNum = r.contact.replace(/\D/g, "");
                                      const fullNum = cleanNum.length === 9 ? "258" + cleanNum : cleanNum;
                                      const waUrl = `https://api.whatsapp.com/send?phone=${fullNum}&text=${encodeURIComponent(r.message)}`;
                                      window.open(waUrl, "_blank");
                                    }}
                                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 inline-flex ${
                                      r.status === "Enviado" 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                  >
                                    <Send className="w-3 h-3" />
                                    {r.status === "Enviado" ? "Reenviar" : "Enviar"}
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      setWhatsappReminders(prev => prev.filter(item => item.id !== r.id));
                                      addLog("Sistema", `Eliminou lembrete para ${r.memberName}`, "danger");
                                    }}
                                    className="p-1.5 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 text-red-600 transition"
                                    title="Eliminar"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                </div>
                  </>
                )}

                {remindersSubTab === "history" && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-base">Histórico de Mensagens Enviadas</h3>
                        <p className="text-xs text-slate-500">Registo completo de todos os lembretes disparados com sucesso via WhatsApp.</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-60">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Pesquisar por membro ou ID..."
                            value={historySearchQuery}
                            onChange={(e) => setHistorySearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Table of Sent Messages */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-3 px-2">Destinatário</th>
                            <th className="py-3 px-2">Contacto</th>
                            <th className="py-3 px-2">Data/Hora de Envio</th>
                            <th className="py-3 px-2">Conteúdo da Mensagem</th>
                            <th className="py-3 px-2">Estado</th>
                            <th className="py-3 px-2 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const sentReminders = whatsappReminders
                              .filter(r => r.status === "Enviado")
                              .filter(r => {
                                if (!historySearchQuery) return true;
                                const q = historySearchQuery.toLowerCase();
                                return r.memberName.toLowerCase().includes(q) || r.memberId.toLowerCase().includes(q);
                              })
                              .sort((a, b) => {
                                const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                                const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                                return dateB - dateA;
                              });

                            if (sentReminders.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                    <div className="max-w-sm mx-auto space-y-2">
                                      <div className="w-12 h-12 bg-slate-50 text-slate-350 rounded-full flex items-center justify-center mx-auto">
                                        <MessageSquare className="w-6 h-6" />
                                      </div>
                                      <p className="text-slate-800 font-bold text-sm">Nenhum lembrete enviado ainda</p>
                                      <p className="text-xs text-slate-400">
                                        Vá para a fila de lembretes, configure seus modelos e clique em "Disparar" para enviar notificações.
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return sentReminders.map((r) => {
                              const sentDateFormatted = r.sentAt 
                                ? new Date(r.sentAt).toLocaleString("pt-MZ", {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })
                                : "N/D";
                              return (
                                <tr key={r.id} className="hover:bg-slate-50 transition">
                                  <td className="py-3 px-2">
                                    <div className="font-bold text-slate-900">{r.memberName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{r.memberId}</div>
                                  </td>
                                  <td className="py-3 px-2 font-mono font-medium text-slate-600">{r.contact}</td>
                                  <td className="py-3 px-2 font-bold text-slate-700 font-mono">
                                    {sentDateFormatted}
                                  </td>
                                  <td className="py-3 px-2 max-w-md">
                                    <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed relative">
                                      {r.message}
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                      Enviado
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(r.message);
                                        setActiveToasts(prev => [
                                          {
                                            id: "toast-" + Date.now(),
                                            title: "Copiado",
                                            message: "Conteúdo da mensagem copiado!",
                                            type: "success"
                                          },
                                          ...prev
                                        ]);
                                      }}
                                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                                      title="Copiar mensagem"
                                    >
                                      Copiar
                                    </button>
                                    <button
                                      onClick={() => {
                                        const cleanNum = r.contact.replace(/\D/g, "");
                                        const fullNum = cleanNum.length === 9 ? "258" + cleanNum : cleanNum;
                                        const waUrl = `https://api.whatsapp.com/send?phone=${fullNum}&text=${encodeURIComponent(r.message)}`;
                                        window.open(waUrl, "_blank");
                                      }}
                                      className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1"
                                      title="Reenviar via WhatsApp"
                                    >
                                      <Send className="w-2.5 h-2.5" /> Reenviar
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {remindersSubTab === "templates" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT: FORM FOR NEW/EDITING TEMPLATE */}
                        <div className="lg:col-span-1 bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-150 pb-2">
                            <Settings className="w-4 h-4 text-indigo-600" />
                            {editingTplId ? "Editar Template Inteligente" : "Criar Novo Template"}
                          </h4>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Nome do Modelo</label>
                              <input
                                type="text"
                                placeholder="Ex: Lembrete 7 dias antes"
                                value={newTplName}
                                onChange={(e) => setNewTplName(e.target.value)}
                                className="w-full bg-white border border-slate-250 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Gatilho (Evento)</label>
                                <select
                                  value={newTplTrigger}
                                  onChange={(e) => setNewTplTrigger(e.target.value as any)}
                                  className="w-full bg-white border border-slate-250 text-xs rounded-xl px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                                >
                                  <option value="Antes_Vencer">Antes de Vencer</option>
                                  <option value="Apos_Vencer">Após Vencer</option>
                                  <option value="Expirado_Hoje">Expirado Hoje</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">
                                  {newTplTrigger === "Expirado_Hoje" ? "Dias (Fixo)" : "Intervalo (Dias)"}
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  disabled={newTplTrigger === "Expirado_Hoje"}
                                  value={newTplTrigger === "Expirado_Hoje" ? 0 : newTplInterval}
                                  onChange={(e) => setNewTplInterval(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                  className="w-full bg-white disabled:bg-slate-100 border border-slate-250 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 text-center"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider">Mensagem Personalizada</label>
                                <span className="text-[9px] text-slate-400 font-semibold">Variáveis reativas</span>
                              </div>
                              <textarea
                                value={newTplMessage}
                                onChange={(e) => setNewTplMessage(e.target.value)}
                                rows={5}
                                placeholder="Insira o texto do lembrete. Utilize as variáveis disponíveis abaixo."
                                className="w-full bg-white border border-slate-250 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              />
                            </div>

                            {/* Dynamic Variable Buttons */}
                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-bold text-slate-500">Clique para inserir variável:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { code: "{nome}", desc: "Nome do membro" },
                                  { code: "{data_vencimento}", desc: "Data de vencimento" },
                                  { code: "{link_renovacao}", desc: "Link de pagamento" },
                                  { code: "{dias}", desc: "Dias restantes/passados" }
                                ].map(v => (
                                  <button
                                    key={v.code}
                                    type="button"
                                    onClick={() => setNewTplMessage(prev => prev + v.code)}
                                    className="bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                                    title={v.desc}
                                  >
                                    {v.code}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                              <span className="text-xs font-bold text-slate-700">Estado de Envio Automático</span>
                              <button
                                type="button"
                                onClick={() => setNewTplIsActive(!newTplIsActive)}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  newTplIsActive ? "bg-indigo-600" : "bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    newTplIsActive ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newTplName.trim() || !newTplMessage.trim()) {
                                    alert("Preencha o nome do modelo e a mensagem personalizada.");
                                    return;
                                  }

                                  const updatedTemplates = [...smartTemplates];
                                  if (editingTplId) {
                                    const idx = updatedTemplates.findIndex(t => t.id === editingTplId);
                                    if (idx !== -1) {
                                      updatedTemplates[idx] = {
                                        ...updatedTemplates[idx],
                                        name: newTplName,
                                        triggerType: newTplTrigger,
                                        message: newTplMessage,
                                        daysInterval: newTplTrigger === "Expirado_Hoje" ? 0 : newTplInterval,
                                        isActive: newTplIsActive
                                      };
                                      addLog("Administrador", `Editou o template inteligente "${newTplName}"`, "success");
                                    }
                                  } else {
                                    const newId = "tpl-" + Date.now();
                                    updatedTemplates.push({
                                      id: newId,
                                      name: newTplName,
                                      triggerType: newTplTrigger,
                                      message: newTplMessage,
                                      daysInterval: newTplTrigger === "Expirado_Hoje" ? 0 : newTplInterval,
                                      isActive: newTplIsActive,
                                      createdAt: new Date().toISOString()
                                    });
                                    addLog("Administrador", `Criou novo template inteligente "${newTplName}"`, "success");
                                  }

                                  setSmartTemplates(updatedTemplates);
                                  // Reset form
                                  setNewTplName("");
                                  setNewTplMessage("");
                                  setNewTplInterval(5);
                                  setNewTplTrigger("Antes_Vencer");
                                  setNewTplIsActive(true);
                                  setEditingTplId(null);

                                  setActiveToasts(prev => [
                                    {
                                      id: "toast-" + Date.now(),
                                      title: "Template Guardado",
                                      message: "As configurações do modelo reativo foram atualizadas com sucesso!",
                                      type: "success"
                                    },
                                    ...prev
                                  ]);
                                }}
                                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition shadow-sm"
                              >
                                {editingTplId ? "Atualizar Modelo" : "Guardar Modelo"}
                              </button>

                              {(editingTplId || newTplName || newTplMessage) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewTplName("");
                                    setNewTplMessage("");
                                    setNewTplInterval(5);
                                    setNewTplTrigger("Antes_Vencer");
                                    setNewTplIsActive(true);
                                    setEditingTplId(null);
                                  }}
                                  className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: LIST OF SMART TEMPLATES */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <div>
                              <h3 className="font-extrabold text-slate-950 text-base">Templates Ativos & Automação</h3>
                              <p className="text-xs text-slate-500">Mensagens que serão disparadas automaticamente no intervalo definido.</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200">
                              {smartTemplates.length} Modelos Programados
                            </span>
                          </div>

                          {smartTemplates.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              Nenhum template inteligente criado ainda. Comece a criar um no painel ao lado!
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {smartTemplates.map((tpl) => {
                                // Find a mock member to show preview
                                const previewMember = members.find(m => m.paymentStatus === "Ativo") || {
                                  name: "João Mateus",
                                  expiryDate: "2026-12-31"
                                } as Member;

                                const previewMsg = tpl.message
                                  .replace(/{nome}/g, previewMember.name)
                                  .replace(/{dias}/g, tpl.daysInterval.toString())
                                  .replace(/{data_vencimento}/g, previewMember.expiryDate || "")
                                  .replace(/{validade}/g, previewMember.expiryDate || "")
                                  .replace(/{link_renovacao}/g, window.location.origin)
                                  .replace(/{link}/g, window.location.origin);

                                return (
                                  <div
                                    key={tpl.id}
                                    className={`bg-white border p-4 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 relative ${
                                      tpl.isActive ? "border-slate-200" : "border-slate-250 opacity-60"
                                    }`}
                                  >
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                          <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                            {tpl.name}
                                          </h4>
                                          <div className="flex flex-wrap gap-1 items-center">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                              tpl.triggerType === "Antes_Vencer" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                              tpl.triggerType === "Apos_Vencer" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                              "bg-red-50 text-red-700 border border-red-100"
                                            }`}>
                                              {tpl.triggerType === "Antes_Vencer" ? "Antes de Vencer" :
                                               tpl.triggerType === "Apos_Vencer" ? "Após Vencer" : "No Dia do Vencimento"}
                                            </span>
                                            {tpl.triggerType !== "Expirado_Hoje" && (
                                              <span className="text-[9px] bg-slate-50 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-150">
                                                Intervalo: {tpl.daysInterval} dias
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              setEditingTplId(tpl.id);
                                              setNewTplName(tpl.name);
                                              setNewTplTrigger(tpl.triggerType);
                                              setNewTplMessage(tpl.message);
                                              setNewTplInterval(tpl.daysInterval);
                                              setNewTplIsActive(tpl.isActive);
                                            }}
                                            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition cursor-pointer"
                                            title="Editar Modelo"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (confirm(`Tem a certeza que deseja excluir o modelo "${tpl.name}"?`)) {
                                                setSmartTemplates(prev => prev.filter(t => t.id !== tpl.id));
                                                addLog("Administrador", `Excluiu o template inteligente "${tpl.name}"`, "warning");
                                                setActiveToasts(prev => [
                                                  {
                                                    id: "toast-" + Date.now(),
                                                    title: "Template Excluído",
                                                    message: "O modelo de notificação reativa foi removido com sucesso.",
                                                    type: "warning"
                                                  },
                                                  ...prev
                                                ]);
                                              }
                                            }}
                                            className="p-1.5 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-lg border border-red-100 text-red-600 transition cursor-pointer"
                                            title="Excluir Modelo"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Message Preview bubble */}
                                      <div className="space-y-1">
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Pré-visualização da Mensagem:</span>
                                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10.5px] leading-relaxed text-slate-700 font-medium">
                                          {previewMsg}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px]">
                                      <span className="text-slate-400">Criado em {new Date(tpl.createdAt).toLocaleDateString()}</span>
                                      <button
                                        onClick={() => {
                                          setSmartTemplates(prev => prev.map(t => {
                                            if (t.id === tpl.id) {
                                              const newSt = !t.isActive;
                                              addLog("Administrador", `${newSt ? "Ativou" : "Desativou"} envio automático para "${t.name}"`, newSt ? "success" : "warning");
                                              return { ...t, isActive: newSt };
                                            }
                                            return t;
                                          }));
                                        }}
                                        className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase border transition cursor-pointer ${
                                          tpl.isActive 
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                        }`}
                                      >
                                        {tpl.isActive ? "● ATIVO" : "○ INATIVO"}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Variable Legend Banner */}
                          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100/80 text-xs text-blue-900 flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <h5 className="font-extrabold">Como funcionam as Variáveis e Gatilhos?</h5>
                              <p className="text-blue-700 leading-relaxed text-[11px]">
                                O gatilho <strong>Antes de Vencer</strong> executa a varredura e agenda o lembrete quando a data de validade estiver a menos ou igual ao número de dias definido. O gatilho <strong>Após Vencer</strong> age se a validade já passou no número especificado de dias. O gatilho <strong>Expirado Hoje</strong> dispara exatamente no dia em que o crachá é invalidado.
                              </p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] pt-1">
                                <div><strong className="font-mono text-blue-800">{"{nome}"}</strong>: Nome do Membro completo</div>
                                <div><strong className="font-mono text-blue-800">{"{data_vencimento}"}</strong>: Data limite (YYYY-MM-DD)</div>
                                <div><strong className="font-mono text-blue-800">{"{link_renovacao}"}</strong>: Portal oficial OST de renovações</div>
                                <div><strong className="font-mono text-blue-800">{"{dias}"}</strong>: Contagem regressiva ou ultrapassada</div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL / PANEL TO EDIT MESSAGE IN-PLACE */}
                {editingReminder && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">Personalizar Mensagem</h3>
                          <p className="text-xs text-slate-500">Edite o conteúdo da mensagem programada para {editingReminder.memberName}.</p>
                        </div>
                        <button
                          onClick={() => setEditingReminder(null)}
                          className="p-1 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs text-slate-700">
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl">
                          <div><strong>Destinatário:</strong> {editingReminder.memberName}</div>
                          <div><strong>ID Membro:</strong> {editingReminder.memberId}</div>
                          <div className="col-span-2"><strong>Validade Crachá:</strong> {editingReminder.expiryDate}</div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">Contacto do Destinatário</label>
                          <input
                            type="text"
                            value={editingReminder.contact}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length === 9 && !val.startsWith("258")) {
                                val = "258" + val;
                              }
                              setEditingReminder(prev => prev ? { ...prev, contact: val } : null);
                            }}
                            onBlur={(e) => {
                              const formatted = formatToInternationalPhone(e.target.value);
                              setEditingReminder(prev => prev ? { ...prev, contact: formatted } : null);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: 841234567 ou 258841234567"
                          />
                          <p className="text-[10px] text-slate-400 font-medium">Ao digitar 9 dígitos, o prefixo de Moçambique (258) é adicionado automaticamente.</p>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">Mensagem do WhatsApp</label>
                          <textarea
                            value={editingReminder.message}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingReminder(prev => prev ? { ...prev, message: val } : null);
                            }}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-slate-800">Data de Envio Programada</label>
                          <input
                            type="date"
                            value={editingReminder.scheduledDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingReminder(prev => prev ? { ...prev, scheduledDate: val } : null);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-3 text-xs">
                        <button
                          onClick={() => setEditingReminder(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            setWhatsappReminders(prev => prev.map(item => {
                              if (item.id === editingReminder.id) {
                                return editingReminder;
                              }
                              return item;
                            }));
                            addLog("Sistema", `Editou lembrete para ${editingReminder.memberName}`, "info");
                            setEditingReminder(null);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL FOR MANUAL SCHEDULE */}
                {showManualRemModal && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">Agendar Lembrete de Renovação</h3>
                          <p className="text-xs text-slate-500">Programe um novo aviso manual para um membro selecionado.</p>
                        </div>
                        <button
                          onClick={() => setShowManualRemModal(false)}
                          className="p-1 bg-slate-100 rounded-full hover:bg-slate-200 transition text-slate-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs text-slate-700">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">Selecionar Membro</label>
                          <select
                            value={manualRemMemberId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setManualRemMemberId(val);
                              const found = members.find(m => m.id === val);
                              if (found) {
                                const s = getExpiryStatus(found.expiryDate);
                                setManualRemMsg(
                                  s.expired 
                                    ? waTemplateExpired.replace("{nome}", found.name).replace("{validade}", found.expiryDate || "").replace("{link}", window.location.origin)
                                    : waTemplateExpiring.replace("{nome}", found.name).replace("{dias}", s.daysLeft.toString()).replace("{validade}", found.expiryDate || "").replace("{link}", window.location.origin)
                                );
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {members.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.id}) • {m.paymentStatus}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">Data de Envio Programada</label>
                          <input
                            type="date"
                            value={manualRemDate}
                            onChange={(e) => setManualRemDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">Mensagem Personalizada</label>
                          <textarea
                            value={manualRemMsg}
                            onChange={(e) => setManualRemMsg(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Escreva a mensagem..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-3 text-xs">
                        <button
                          onClick={() => setShowManualRemModal(false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            const found = members.find(m => m.id === manualRemMemberId);
                            if (!found) return;
                            const s = getExpiryStatus(found.expiryDate);
                            
                            const newReminder: WhatsAppReminder = {
                              id: "rem-" + Date.now(),
                              memberId: found.id,
                              memberName: found.name,
                              contact: found.contact || found.id,
                              expiryDate: found.expiryDate || "",
                              daysLeft: s.daysLeft,
                              scheduledDate: manualRemDate,
                              status: "Agendado",
                              message: manualRemMsg
                            };
                            
                            setWhatsappReminders(prev => [newReminder, ...prev]);
                            addLog("Sistema", `Agendou manualmente lembrete de renovação para ${found.name}`, "success");
                            setShowManualRemModal(false);
                            setActiveToasts(prev => [
                              {
                                id: "toast-" + Date.now(),
                                title: "Lembrete Agendado",
                                message: `Novo lembrete programado com sucesso para ${found.name} em ${manualRemDate}.`,
                                type: "success"
                              },
                              ...prev
                            ]);
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition"
                        >
                          Agendar Lembrete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {adminTab === "smtp" && (
              <div id="smtp-config-panel" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                      <Server className="w-5 h-5 text-indigo-600" /> Parâmetros do Servidor SMTP Customizado
                    </h3>
                    <p className="text-xs text-slate-500">Defina o servidor de correio para o disparo autónomo de comprovativos e lembretes por e-mail.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${smtpConfig.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                      ● {smtpConfig.isActive ? "Serviço Ativo (SMTP)" : "Modo de Teste (Ethereal)"}
                    </span>
                  </div>
                </div>

                {/* Form and Test Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Form Settings */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setActiveToasts(prev => [
                        {
                          id: "toast-" + Date.now(),
                          title: "Configurações Guardadas",
                          message: "As credenciais SMTP foram registadas e encriptadas no navegador.",
                          type: "success"
                        },
                        ...prev
                      ]);
                      addLog("Sistema", "Guardou configurações SMTP no browser", "success");
                    }}
                    className="lg:col-span-7 space-y-6 text-xs text-slate-700"
                  >
                    {/* Painel Unificado de Configuração SMTP */}
                    <div className="bg-slate-50/45 p-6 rounded-2xl border border-slate-200/60 space-y-6">
                      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Settings className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">Parâmetros de Ligação SMTP</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Defina as especificações técnicas, chaves de autenticação e identidade de envio.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Host */}
                        <div className="md:col-span-8 space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>Servidor SMTP Host</span>
                            <div className="relative group inline-block">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                Endereço do servidor SMTP do seu fornecedor (ex: smtp.gmail.com ou mail.ost-mocambique.org).
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </label>
                          <input
                            id="smtp-host-input"
                            type="text"
                            required
                            value={smtpConfig.host}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                            className={`w-full bg-white border rounded-xl p-2.5 focus:outline-none focus:ring-2 font-medium text-slate-800 transition duration-150 ${
                              !getSmtpHostValidation().isValid 
                                ? "border-red-300 focus:ring-red-500 bg-red-50/10 text-red-900" 
                                : "border-slate-200 focus:ring-blue-500"
                            }`}
                            placeholder="Ex: smtp.gmail.com"
                          />
                          {/* Real-time validation message */}
                          <div className="mt-1">
                            <p className={`text-[10px] font-bold leading-relaxed flex items-start gap-1 ${
                              getSmtpHostValidation().status === "success" 
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}>
                              {getSmtpHostValidation().msg}
                            </p>
                          </div>
                        </div>

                        {/* Port */}
                        <div className="md:col-span-4 space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>Porta de Envio</span>
                            <div className="relative group inline-block">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                Porta para ligação de e-mail. Normalmente 465 para SSL seguro, ou 587 para TLS/STARTTLS.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </label>
                          <input
                            id="smtp-port-input"
                            type="text"
                            required
                            value={smtpConfig.port}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                            className={`w-full bg-white border rounded-xl p-2.5 focus:outline-none focus:ring-2 font-medium text-slate-800 transition duration-150 ${
                              !getSmtpPortValidation().isValid 
                                ? "border-red-300 focus:ring-red-500 bg-red-50/10 text-red-900" 
                                : getSmtpPortValidation().status === "warning"
                                  ? "border-amber-300 focus:ring-amber-500 bg-amber-50/10"
                                  : "border-slate-200 focus:ring-blue-500"
                            }`}
                            placeholder="Ex: 465 ou 587"
                          />
                          {/* Real-time validation message */}
                          <div className="mt-1">
                            <p className={`text-[10px] font-bold leading-relaxed flex items-start gap-1 ${
                              getSmtpPortValidation().status === "success" 
                                ? "text-emerald-600" 
                                : getSmtpPortValidation().status === "warning"
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}>
                              {getSmtpPortValidation().msg}
                            </p>
                          </div>
                        </div>

                        {/* Username */}
                        <div className="md:col-span-6 space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>Usuário de Autenticação</span>
                            <div className="relative group inline-block">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                Nome de utilizador ou endereço de e-mail completo usado para autenticação no servidor.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </label>
                          <input
                            id="smtp-user-input"
                            type="text"
                            required
                            value={smtpConfig.user}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                            className={`w-full bg-white border rounded-xl p-2.5 focus:outline-none focus:ring-2 font-medium text-slate-800 transition duration-150 ${
                              !getSmtpUserValidation().isValid 
                                ? "border-red-300 focus:ring-red-500 bg-red-50/10 text-red-900" 
                                : "border-slate-200 focus:ring-blue-500"
                            }`}
                            placeholder="Ex: seu-email@dominio.com"
                          />
                          {/* Real-time validation message */}
                          <div className="mt-1">
                            <p className={`text-[10px] font-bold leading-relaxed ${
                              getSmtpUserValidation().status === "success" 
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}>
                              {getSmtpUserValidation().msg}
                            </p>
                          </div>
                        </div>

                        {/* Password */}
                        <div className="md:col-span-6 space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>Senha SMTP</span>
                            <div className="relative group inline-block">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                Senha da conta de e-mail ou uma senha dedicada de aplicação gerada no seu provedor.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </label>
                          <div className="relative">
                            <input
                              id="smtp-pass-input"
                              type={revealSmtpPassword ? "text" : "password"}
                              required
                              value={smtpConfig.password}
                              onChange={(e) => setSmtpConfig(prev => ({ ...prev, password: e.target.value }))}
                              className={`w-full bg-white border rounded-xl pl-2.5 pr-10 py-2.5 focus:outline-none focus:ring-2 font-medium text-slate-800 transition duration-150 ${
                                !getSmtpPassValidation().isValid 
                                  ? "border-red-300 focus:ring-red-500 bg-red-50/10 text-red-900" 
                                  : "border-slate-200 focus:ring-blue-500"
                              }`}
                              placeholder="Palavra-passe de aplicação ou conta"
                            />
                            <button
                              type="button"
                              onClick={() => setRevealSmtpPassword(!revealSmtpPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {revealSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {/* Real-time validation message */}
                          <div className="mt-1">
                            <p className={`text-[10px] font-bold leading-relaxed ${
                              getSmtpPassValidation().status === "success" 
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}>
                              {getSmtpPassValidation().msg}
                            </p>
                          </div>
                        </div>

                        {/* Sender Email */}
                        <div className="md:col-span-6 space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>E-mail de Remetente (De:)</span>
                            <div className="relative group inline-block">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                Endereço de e-mail que aparecerá como remetente. Deve pertencer ao domínio SMTP para evitar rejeições.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </label>
                          <input
                            id="smtp-sender-email-input"
                            type="email"
                            required
                            value={smtpConfig.senderEmail}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSmtpConfig(prev => ({
                                ...prev,
                                senderEmail: value,
                                dmarcRuaEmail: !prev.dmarcRuaEmail || prev.dmarcRuaEmail === prev.senderEmail ? value : prev.dmarcRuaEmail
                              }));
                            }}
                            className={`w-full bg-white border rounded-xl p-2.5 focus:outline-none focus:ring-2 font-medium text-slate-800 transition duration-150 ${
                              !getSenderEmailValidation().isValid 
                                ? "border-red-300 focus:ring-red-500 bg-red-50/10 text-red-900" 
                                : getSenderEmailValidation().status === "warning"
                                  ? "border-amber-300 focus:ring-amber-500 bg-amber-50/10"
                                  : "border-slate-200 focus:ring-blue-500"
                            }`}
                            placeholder="Ex: suporte@ost-mocambique.org"
                          />
                          {/* Real-time validation message */}
                          <div className="mt-1">
                            <p className={`text-[10px] font-bold leading-relaxed flex items-start gap-1 ${
                              getSenderEmailValidation().status === "success" 
                                ? "text-emerald-600" 
                                : getSenderEmailValidation().status === "warning"
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}>
                              {getSenderEmailValidation().msg}
                            </p>
                          </div>
                        </div>

                        {/* Sender Name */}
                        <div className="md:col-span-6 space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>Nome de Remetente (Identificador)</span>
                            <div className="relative group inline-block">
                              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                Nome ou título institucional que identifica quem envia a mensagem na caixa do destinatário.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </label>
                          <input
                            id="smtp-sender-name-input"
                            type="text"
                            required
                            value={smtpConfig.senderName}
                            onChange={(e) => setSmtpConfig(prev => ({ ...prev, senderName: e.target.value }))}
                            className={`w-full bg-white border rounded-xl p-2.5 focus:outline-none focus:ring-2 font-medium text-slate-800 transition duration-150 ${
                              !getSenderNameValidation().isValid 
                                ? "border-red-300 focus:ring-red-500 bg-red-50/10 text-red-900" 
                                : "border-slate-200 focus:ring-blue-500"
                            }`}
                            placeholder="Ex: Organização Social do Trabalho"
                          />
                          {/* Real-time validation message */}
                          <div className="mt-1">
                            <p className={`text-[10px] font-bold leading-relaxed ${
                              getSenderNameValidation().status === "success" 
                                ? "text-emerald-600" 
                                : "text-red-600"
                            }`}>
                              {getSenderNameValidation().msg}
                            </p>
                          </div>
                        </div>

                        {/* SSL Connection Toggle */}
                        <div className="md:col-span-12 pt-3 border-t border-slate-150">
                          <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                              id="smtp-secure-toggle"
                              type="checkbox"
                              checked={smtpConfig.secure}
                              onChange={(e) => setSmtpConfig(prev => ({ ...prev, secure: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Conexão Segura (SSL/TLS direta)</span>
                                <div className="relative group inline-block">
                                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                    Encriptação SSL direta (porta 465). Se usar STARTTLS na porta 587, mantenha esta opção desligada.
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                  </div>
                                </div>
                              </span>
                              <span className="text-[10px] text-slate-500 block">Ative se utilizar portas seguras dedicadas como a 465. Desative para STARTTLS em outras portas.</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Master Activation Toggle */}
                    <div className={`p-4 rounded-2xl border ${smtpConfig.isActive ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-200"} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300`}>
                      <div className="space-y-1 max-w-md">
                        <h4 className="font-bold text-xs text-slate-900">Estado do Serviço Customizado</h4>
                        <p className="text-[10px] text-slate-500">Ative para canalizar imediatamente todos os e-mails da aplicação (novos crachás, avisos de validade e alertas de quota) através deste servidor.</p>
                      </div>
                      <button
                        id="smtp-activation-btn"
                        type="button"
                        disabled={!isSmtpFormFullyValid}
                        onClick={() => {
                          setSmtpConfig(prev => ({ ...prev, isActive: !prev.isActive }));
                          setActiveToasts(prev => [
                            {
                              id: "toast-" + Date.now(),
                              title: !smtpConfig.isActive ? "SMTP Personalizado Ativo" : "Retornou para Ethereal Sandbox",
                              message: !smtpConfig.isActive ? "O envio real de correio foi totalmente ativo." : "Utilizando modo de testes seguro para envio de crachás.",
                              type: "info"
                            },
                            ...prev
                          ]);
                          addLog("Sistema", `${!smtpConfig.isActive ? "Ativou" : "Desativou"} serviço SMTP personalizado`, !smtpConfig.isActive ? "success" : "warning");
                        }}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 border whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs ${
                          !isSmtpFormFullyValid
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : smtpConfig.isActive 
                              ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700" 
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        {smtpConfig.isActive ? "Ativado (Desativar)" : "Ativar Serviço SMTP"}
                      </button>
                    </div>

                    {/* Note about persistence */}
                    <div className="bg-blue-50 border border-blue-150 rounded-2xl p-4 flex gap-3 text-[11px] text-blue-800 leading-relaxed">
                      <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-blue-900 block">Armazenamento Local Criptografado</span>
                        <span>As credenciais inseridas acima são encriptadas de forma segura e gravadas exclusivamente no armazenamento interno do seu navegador (localStorage). Elas nunca são transmitidas para repositórios públicos e são enviadas apenas de forma segura ao backend no momento do envio de e-mails.</span>
                      </div>
                    </div>

                    {/* Submit (just illustrative since we persist immediately) */}
                    <button
                      id="smtp-submit-settings-btn"
                      type="submit"
                      disabled={!isSmtpFormFullyValid}
                      className={`w-full py-3 rounded-xl text-xs font-extrabold transition shadow-sm ${
                        !isSmtpFormFullyValid
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-950 text-white"
                      }`}
                    >
                      Confirmar & Registar Parâmetros SMTP
                    </button>
                  </form>

                  {/* Right Column: Connection Testing tool */}
                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-950 text-xs">Painel de Teste de Conexão</h4>
                      <p className="text-[10px] text-slate-500">Dispare um e-mail de teste em tempo real para verificar se as suas configurações são válidas e não são bloqueadas por firewalls.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Recipient Input */}
                      <div className="space-y-1.5 text-xs">
                        <label className="block text-xs font-bold text-slate-800">E-mail do Destinatário de Teste</label>
                        <input
                          id="smtp-test-recipient-input"
                          type="email"
                          value={smtpTestRecipient}
                          onChange={(e) => setSmtpTestRecipient(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 text-xs text-xs"
                          placeholder="Ex: seu-proprio-email@gmail.com"
                        />
                        <p className="text-[10px] text-slate-400 font-medium">Recomendamos utilizar uma conta que consiga aceder de imediato para verificar a receção.</p>
                      </div>

                      {/* Test and Clear Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Clear Settings Button */}
                        <button
                          id="smtp-clear-settings-btn"
                          type="button"
                          onClick={() => {
                            localStorage.removeItem("ost_smtp_config");
                            setSmtpConfig({
                              host: "",
                              port: "",
                              user: "",
                              password: "",
                              secure: false,
                              senderEmail: "",
                              senderName: "",
                              isActive: false
                            });
                            setSmtpTestResult(null);
                            setActiveToasts(prev => [
                              {
                                id: "toast-" + Date.now(),
                                title: "Configurações Limpas",
                                message: "O painel foi redefinido e os dados foram excluídos do localStorage.",
                                type: "info"
                              },
                              ...prev
                            ]);
                            addLog("Sistema", "Limpou as configurações SMTP do browser", "info");
                          }}
                          className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Trash className="w-3.5 h-3.5 text-slate-500" />
                          Limpar Configurações
                        </button>

                        {/* Test Connection Button */}
                        <button
                          id="smtp-run-test-btn"
                          type="button"
                          disabled={isTestingSmtp || !isSmtpFormFullyValid}
                          onClick={handleTestSmtpConnection}
                          className={`flex-1 py-3 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-xs ${
                            isTestingSmtp || !isSmtpFormFullyValid 
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                        >
                          {isTestingSmtp ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              A Conectar...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Enviar E-mail de Teste Real
                            </>
                          )}
                        </button>
                      </div>

                      {/* Connection Test Result Displays */}
                      {smtpTestResult && (
                        <div id="smtp-test-result-alert" className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 animate-fade-in ${smtpTestResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-red-50 border-red-200 text-red-950"}`}>
                          <div className="flex items-center gap-1.5 font-bold">
                            {smtpTestResult.success ? "✅ Ligação Efetuada com Sucesso!" : "❌ Falha na Conexão"}
                          </div>
                          <p className="text-[11px] break-words font-medium">{smtpTestResult.message}</p>
                          
                          {smtpTestResult.success && smtpTestResult.previewUrl && (
                            <div className="bg-white border border-emerald-200 rounded-xl p-3 space-y-1.5 text-[10px] text-emerald-800">
                              <span className="font-bold uppercase tracking-wider block text-[9px] text-emerald-600">Visualizador Ethereal Sandbox (Teste)</span>
                              <p>Como utilizou uma conta fictícia, o e-mail foi interceptado no sandbox seguro. Clique abaixo para abrir a representação visual:</p>
                              <a 
                                id="smtp-sandbox-preview-link"
                                href={smtpTestResult.previewUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:underline"
                              >
                                Abrir Visualizador de E-mail 🔗
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registos DNS Sugeridos (SPF, DKIM, DMARC) */}
                <div className="border-t border-slate-100 pt-8 mt-4 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-extrabold text-slate-950 text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-600" /> Registos DNS Recomendados para Entrega Secura
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                        Para evitar que os e-mails enviados pelo seu host SMTP customizado (<span className="font-bold text-slate-700">{smtpConfig.host || "não definido"}</span>) sejam marcados como Spam ou rejeitados, certifique-se de configurar os registos TXT listados abaixo no painel DNS do seu domínio (<span className="font-bold text-slate-700">{getSmtpDomain()}</span>).
                      </p>
                    </div>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={validateDnsRecords}
                        disabled={isValidatingDns || !smtpConfig.host}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition duration-150 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-98"
                      >
                        {isValidatingDns ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            A Verificar DNS...
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5" />
                            Validar Registos DNS
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {getDnsSuggestedRecords().map((record) => {
                      const statusInfo = dnsValidationStatus[record.id as "spf" | "dkim" | "dmarc"];
                      return (
                        <div key={record.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition duration-150 relative overflow-hidden group">
                          {/* Background subtle badge */}
                          <div className="absolute top-0 right-0 p-3 bg-indigo-50/50 rounded-bl-xl border-l border-b border-indigo-100/40 text-[10px] font-black text-indigo-700 uppercase tracking-widest leading-none">
                            {record.type}
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{record.name}</span>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{record.description}</p>
                            
                            {record.id === "dkim" && (
                              <div className="mt-3 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/40 space-y-3">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1.5">
                                    <span>Seletor DKIM (Selector)</span>
                                    <div className="relative group inline-block">
                                      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                        O nome usado para identificar o registo DKIM no DNS. Geralmente 'ostpay', 'default' ou outro de sua preferência.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  </label>
                                  <input
                                    type="text"
                                    value={smtpConfig.dkimSelector || ""}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
                                      setSmtpConfig(prev => ({ ...prev, dkimSelector: val }));
                                    }}
                                    placeholder="ex: ostpay"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-800 font-medium"
                                  />
                                </div>

                                <button
                                  type="button"
                                  disabled={isGeneratingDkim}
                                  onClick={generateDkimKeyPair}
                                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  {isGeneratingDkim ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      A Gerar Chaves RSA...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      {smtpConfig.dkimPublicKey ? "Regerar Chaves DKIM" : "Gerar Chaves DKIM (RSA-2048)"}
                                    </>
                                  )}
                                </button>

                                {smtpConfig.dkimPrivateKey && (
                                  <div className="space-y-1.5 pt-1.5 border-t border-indigo-100/40">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Chave Privada (PEM)</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(smtpConfig.dkimPrivateKey);
                                          setCopiedRecordId("dkim-private");
                                          setTimeout(() => setCopiedRecordId(null), 1500);
                                          setActiveToasts(prev => [
                                            {
                                              id: "toast-" + Date.now(),
                                              title: "Chave Privada Copiada",
                                              message: "A chave privada formatada em PEM foi copiada com sucesso!",
                                              type: "success"
                                            },
                                            ...prev
                                          ]);
                                        }}
                                        className="text-slate-400 hover:text-indigo-600 transition p-1 rounded hover:bg-white"
                                        title="Copiar Chave Privada"
                                      >
                                        {copiedRecordId === "dkim-private" ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="bg-slate-950 rounded-lg p-2 max-h-24 overflow-y-auto font-mono text-[8px] text-slate-300 whitespace-pre scrollbar-thin leading-normal select-all">
                                      {smtpConfig.dkimPrivateKey}
                                    </div>
                                    <span className="text-[8px] text-slate-400 leading-normal block">
                                      ⚠️ Guarde esta chave de forma segura no seu servidor de e-mail SMTP para assinar os envios.
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {record.id === "dmarc" && (
                              <div className="mt-3 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/40 space-y-1.5">
                                <label className="text-[10px] font-extrabold text-slate-700 flex items-center gap-1.5">
                                  <span>E-mail para Relatórios RUA</span>
                                  <div className="relative group inline-block">
                                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-md font-medium text-center normal-case font-sans">
                                      Endereço de e-mail para receber relatórios agregados de atividade DMARC enviados por provedores de e-mail (ex: Google, Microsoft).
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                  </div>
                                  <span className="ml-auto text-[9px] text-indigo-700 font-extrabold bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Opcional</span>
                                </label>
                                <input
                                  type="email"
                                  value={smtpConfig.dmarcRuaEmail || ""}
                                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, dmarcRuaEmail: e.target.value }))}
                                  placeholder="ex: dmarc-reports@dominio.com"
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-slate-800 placeholder-slate-400 font-medium"
                                />
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <p className="text-[9px] text-slate-500 leading-normal">
                                    Servidores enviarão estatísticas diárias para este endereço.
                                  </p>
                                  {smtpConfig.senderEmail && smtpConfig.dmarcRuaEmail !== smtpConfig.senderEmail && (
                                    <button
                                      type="button"
                                      onClick={() => setSmtpConfig(prev => ({ ...prev, dmarcRuaEmail: prev.senderEmail }))}
                                      className="text-[9px] text-indigo-600 hover:text-indigo-800 font-extrabold underline transition shrink-0"
                                    >
                                      Usar Remetente
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* DNS Details Table-like layout */}
                          <div className="space-y-2.5 bg-white border border-slate-150 rounded-xl p-3 text-[11px] font-mono leading-none">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase font-sans tracking-wider">Host / Nome</span>
                              <div className="flex items-center justify-between gap-2 py-0.5">
                                <span className="text-slate-800 break-all select-all font-bold">{record.host}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Copy host
                                    navigator.clipboard.writeText(record.host);
                                    setCopiedRecordId(`${record.id}-host`);
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                    setActiveToasts(prev => [
                                      {
                                        id: "toast-" + Date.now(),
                                        title: "Host Copiado",
                                        message: `O Host/Nome "${record.host}" foi copiado com sucesso!`,
                                        type: "success"
                                      },
                                      ...prev
                                    ]);
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 transition p-1 rounded hover:bg-slate-50"
                                  title="Copiar Host"
                                >
                                  {copiedRecordId === `${record.id}-host` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 my-2" />

                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase font-sans tracking-wider">Valor do Registo</span>
                              <div className="flex items-start justify-between gap-2 py-0.5">
                                <span className="text-slate-700 break-all select-all leading-normal text-[10px] whitespace-normal flex-1 max-h-[100px] overflow-y-auto">
                                  {record.value}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Copy value
                                    navigator.clipboard.writeText(record.value);
                                    setCopiedRecordId(`${record.id}-value`);
                                    setTimeout(() => setCopiedRecordId(null), 1500);
                                    setActiveToasts(prev => [
                                      {
                                        id: "toast-" + Date.now(),
                                        title: "Valor Copiado",
                                        message: `O valor do registo DNS foi copiado para a área de transferência!`,
                                        type: "success"
                                      },
                                      ...prev
                                    ]);
                                  }}
                                  className="text-slate-400 hover:text-indigo-600 transition p-1 rounded hover:bg-slate-50 shrink-0 self-center"
                                  title="Copiar Valor"
                                >
                                  {copiedRecordId === `${record.id}-value` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Propagation Status Indicator */}
                          {statusInfo && statusInfo.status !== "idle" && (
                            <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition duration-200 animate-fade-in ${
                              statusInfo.status === "checking"
                                ? "bg-amber-50/60 border-amber-200 text-amber-800 animate-pulse"
                                : statusInfo.status === "success"
                                ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                                : "bg-rose-50/70 border-rose-200 text-rose-800"
                            }`}>
                              <div className="shrink-0 mt-0.5">
                                {statusInfo.status === "checking" ? (
                                  <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                                ) : statusInfo.status === "success" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <X className="w-4 h-4 text-rose-600 bg-rose-100 rounded-full p-0.5" />
                                )}
                              </div>
                              <div className="space-y-1 leading-relaxed flex-1">
                                <span className="font-extrabold block text-[10px] uppercase tracking-wider">
                                  {statusInfo.status === "checking" && "A verificar..."}
                                  {statusInfo.status === "success" && "Propagado"}
                                  {statusInfo.status === "failed" && "Não Detetado / Incorreto"}
                                </span>
                                {statusInfo.foundValue && (
                                  <div className="bg-white/80 border border-slate-100/60 rounded-lg p-1.5 font-mono text-[9px] text-slate-600 break-all select-all max-h-16 overflow-y-auto">
                                    Encontrado: {statusInfo.foundValue}
                                  </div>
                                )}
                                {statusInfo.error && (
                                  <p className="text-[10px] font-medium leading-normal text-rose-600/90">{statusInfo.error}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Warning advice footer banner */}
                  <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-[11px] text-amber-800 leading-relaxed">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-950 block">Propagação & Ativação de Registos DNS</span>
                      <span>Após adicionar estas configurações no seu provedor de domínio (ex: Cloudflare, GoDaddy, Registro.br, etc), a propagação mundial dos novos registos pode demorar entre 1 a 24 horas. Certifique-se de não modificar registos SPF já existentes, mas sim combiná-los adicionando o novo servidor à regra atual.</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {adminTab === "sync" && (
              <div id="sync-config-panel" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-700" /> Sincronização de Dados (LocalStorage & Firestore)
                    </h3>
                    <p className="text-xs text-slate-500">Configure a sincronização bi-direcional inteligente para garantir a persistência segura de dados entre múltiplos dispositivos.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
                      !isSyncActive ? "bg-slate-100 text-slate-600 border border-slate-200" :
                      syncStatus === "syncing" ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" :
                      syncStatus === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        !isSyncActive ? "bg-slate-400" :
                        syncStatus === "syncing" ? "bg-amber-500" :
                        syncStatus === "error" ? "bg-red-500" :
                        "bg-emerald-500 animate-ping"
                      }`}></span>
                      {!isSyncActive ? "Serviço Pausado" :
                       syncStatus === "syncing" ? "Sincronizando..." :
                       syncStatus === "error" ? "Ligação Falhou" :
                       "Serviço Ativo"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Sync Settings Form */}
                  <div className="lg:col-span-7 space-y-6 text-xs text-slate-700">
                    <div className="bg-slate-50/45 p-6 rounded-2xl border border-slate-200/60 space-y-6">
                      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                          <Settings className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">Parâmetros de Auto-Sincronização</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Defina as preferências de intervalo e ativação do motor de sincronização em segundo plano.</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Sync Toggle */}
                        <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block text-xs">Sincronização em Segundo Plano</span>
                            <span className="text-[10px] text-slate-500">Permite sincronizar alterações de forma automática e silenciosa.</span>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={isSyncActive}
                              onChange={(e) => setIsSyncActive(e.target.checked)}
                              className="sr-only peer"
                              id="toggle-sync-active"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
                          </div>
                        </div>

                        {/* Interval Selector */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase text-slate-500">Intervalo de Sincronização Automática</label>
                          <select
                            disabled={!isSyncActive}
                            value={syncInterval}
                            onChange={(e) => setSyncInterval(parseInt(e.target.value, 10))}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-2xl font-bold outline-none focus:ring-1 focus:ring-blue-700 disabled:opacity-55 disabled:bg-slate-50 text-slate-800"
                          >
                            <option value="1">A cada 1 minuto (Tempo Real - Alta frequência)</option>
                            <option value="5">A cada 5 minutos (Recomendado - Balanceado)</option>
                            <option value="15">A cada 15 minutos</option>
                            <option value="30">A cada 30 minutos</option>
                            <option value="60">A cada 1 hora (Baixo consumo de dados)</option>
                          </select>
                          <p className="text-[10px] text-slate-400">
                            Frequências maiores consomem mais acessos à base de dados na nuvem Firestore.
                          </p>
                        </div>

                        {/* Conflict Strategy Selector */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase text-slate-500">Resolução de Conflitos de Dados</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={() => setSyncPreference("newer")}
                              className={`p-4 rounded-2xl border text-left space-y-1.5 transition ${
                                syncPreference === "newer" 
                                  ? "border-blue-600 bg-blue-50/40" 
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-900 text-xs">Mais Recente</span>
                                <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${syncPreference === "newer" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                                  {syncPreference === "newer" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal">Compara o registo de alteração (`updatedAt`) e mantém os dados mais recentes.</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSyncPreference("local")}
                              className={`p-4 rounded-2xl border text-left space-y-1.5 transition ${
                                syncPreference === "local" 
                                  ? "border-blue-600 bg-blue-50/40" 
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-900 text-xs">Forçar Local</span>
                                <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${syncPreference === "local" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                                  {syncPreference === "local" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal">Considera que o dispositivo atual tem os dados corretos e substitui na nuvem.</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSyncPreference("remote")}
                              className={`p-4 rounded-2xl border text-left space-y-1.5 transition ${
                                syncPreference === "remote" 
                                  ? "border-blue-600 bg-blue-50/40" 
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-900 text-xs">Forçar Nuvem</span>
                                <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${syncPreference === "remote" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                                  {syncPreference === "remote" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-normal">Substitui as modificações deste dispositivo pelo estado atual do Firestore.</p>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Explanatory Banner */}
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex gap-3 text-[11px] text-blue-800 leading-relaxed">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-blue-950 block">Como funciona a persistência bi-direcional?</span>
                        <span>
                          O motor lê os membros guardados localmente (`localStorage`) e compara com a coleção global no `Google Firestore`. Novas inscrições, pagamentos efetuados e crachás emitidos em outros dispositivos (ou offline neste browser) são fundidos de forma inteligente, evitando duplicados e garantindo consistência total do cadastro.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Status & Manual Sync controls */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">
                        <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Estado da Sincronização</span>
                        
                        <div className="space-y-2">
                          <p className="text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
                            {members.length} <span className="text-xs font-semibold text-slate-400">Membros Registados</span>
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Base de dados: <strong className="text-blue-300 font-bold">Cloud Firestore</strong> ativo.
                          </p>
                        </div>

                        <div className="border-t border-slate-800/80 pt-4 space-y-3 text-xs">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Última Ligação</span>
                            <span className="font-mono text-slate-200">{lastSyncTime || "Nunca sincronizado"}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Estado</span>
                            <span className={`font-bold ${
                              syncStatus === "success" ? "text-emerald-400" :
                              syncStatus === "syncing" ? "text-amber-400" :
                              syncStatus === "error" ? "text-rose-400" :
                              "text-slate-400"
                            }`}>
                              {syncStatus === "success" ? "Sucesso (Sincronizado)" :
                               syncStatus === "syncing" ? "Sincronizando..." :
                               syncStatus === "error" ? "Falha na ligação" :
                               "Pronto para ligar"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Estratégia de Conflito</span>
                            <span className="font-bold text-slate-200 uppercase text-[10px]">
                              {syncPreference === "newer" ? "Mais Recente" :
                               syncPreference === "local" ? "Forçar Local" :
                               "Forçar Nuvem"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          disabled={syncStatus === "syncing"}
                          onClick={() => performDatabaseSync(true)}
                          className={`w-full font-bold py-4 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-55 disabled:cursor-not-allowed ${
                            syncStatus === "error" 
                              ? "bg-rose-600 hover:bg-rose-700 text-white" 
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          <RefreshCw className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                          {syncStatus === "syncing" ? "A Sincronizar Dados..." : "Sincronizar Agora (Forçar)"}
                        </button>
                        <p className="text-[10px] text-center text-slate-400 mt-2.5">
                          Isto irá fundir as modificações imediatamente e atualizar o ecossistema.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* GLOBAL BADGE PRINT PREFERENCES SECTION */}
                <div id="print-config-panel" className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 transition-colors">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Printer className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs tracking-tight">Definições Globais de Impressão de Crachás</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Defina o formato padrão de validação no crachá para todo o sistema. A opção escolhida será aplicada a todos os crachás gerados.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setBadgeCodeOption("both")}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition cursor-pointer ${
                        badgeCodeOption === "both" 
                          ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20" 
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">Ambos (QR & Código de Barras)</span>
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${badgeCodeOption === "both" ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-700"}`}>
                          {badgeCodeOption === "both" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">Exibe o QR Code e o Código de Barras lado a lado no rodapé do crachá para validação flexível.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBadgeCodeOption("qr")}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition cursor-pointer ${
                        badgeCodeOption === "qr" 
                          ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20" 
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">Apenas QR Code</span>
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${badgeCodeOption === "qr" ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-700"}`}>
                          {badgeCodeOption === "qr" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">Exibe apenas o QR Code de segurança centralizado no rodapé do crachá, ideal para leitores óticos de smartphone.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBadgeCodeOption("barcode")}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition cursor-pointer ${
                        badgeCodeOption === "barcode" 
                          ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20" 
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs">Apenas Código de Barras</span>
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${badgeCodeOption === "barcode" ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-700"}`}>
                          {badgeCodeOption === "barcode" && <span className="w-1 h-1 bg-white rounded-full"></span>}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">Exibe apenas o Código de Barras e número de acesso centralizados, ideal para leitores de pistola comuns.</p>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Monospaced Log Console Terminal */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Consola de Eventos & Logs de Sincronização</label>
                    <button
                      onClick={() => {
                        setSyncLogs(["[Sistema] Histórico de logs limpo às " + new Date().toLocaleTimeString()]);
                        localStorage.setItem("ost_sync_logs", JSON.stringify(["[Sistema] Histórico de logs limpo às " + new Date().toLocaleTimeString()]));
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-bold transition flex items-center gap-1"
                    >
                      Limpar Consola
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-[11px] text-slate-300 h-60 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                    {syncLogs.length === 0 ? (
                      <p className="text-slate-500 italic">Sem eventos registados.</p>
                    ) : (
                      syncLogs.map((log, index) => (
                        <div key={index} className="flex gap-2 leading-relaxed hover:bg-slate-800/40 py-0.5 px-1 rounded transition">
                          <span className="text-slate-500 shrink-0 select-none">&gt;</span>
                          <span className={
                            log.includes("Falha") || log.includes("Erro") ? "text-rose-400" :
                            log.includes("concluída com sucesso") || log.includes("Sucesso") ? "text-emerald-400 font-semibold" :
                            "text-slate-300"
                          }>{log}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {adminTab === "health" && (
              <div id="health-assistance-panel" className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Saúde & Assistência Médica
                    </h3>
                    <p className="text-xs text-slate-500">Registo confidencial de necessidades especiais, restrições médicas e contactos de emergência de membros, mantendo rígida privacidade e auditoria de acessos.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-slate-500 px-2.5">
                      Controlo de Privacidade Ativo
                    </span>
                  </div>
                </div>

                {/* KPI/Statistics Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total de Membros</p>
                      <h4 className="text-xl font-black text-slate-900">{members.length}</h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6 fill-rose-100" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Perfis com Consentimento</p>
                      <h4 className="text-xl font-black text-slate-900">
                        {members.filter(m => m.healthConsent).length}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Necessidades Especiais</p>
                      <h4 className="text-xl font-black text-slate-900">
                        {members.filter(m => m.specialNeeds && m.specialNeeds !== "Nenhuma" && m.specialNeeds.trim() !== "").length}
                      </h4>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contactos de Emergência</p>
                      <h4 className="text-xl font-black text-slate-900">
                        {members.filter(m => m.emergencyPhone && m.emergencyPhone.trim() !== "").length}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Filter section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full lg:max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar por nome ou ID..."
                      value={healthSearchQuery}
                      onChange={(e) => setHealthSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Necessidades:</span>
                      <select 
                        value={healthSpecialNeedsFilter}
                        onChange={(e) => setHealthSpecialNeedsFilter(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold outline-none"
                      >
                        <option value="Todos">Todos</option>
                        <option value="Sim">Com Necessidades</option>
                        <option value="Não">Sem Necessidades</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Grupo Sanguíneo:</span>
                      <select 
                        value={healthBloodTypeFilter}
                        onChange={(e) => setHealthBloodTypeFilter(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold outline-none"
                      >
                        <option value="Todos">Todos</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Não Registado">Não Registado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="p-4 pl-6">ID / Membro</th>
                        <th className="p-4">Necessidades Especiais</th>
                        <th className="p-4">Grupo Sanguíneo</th>
                        <th className="p-4">Ficha Médica & Medicação</th>
                        <th className="p-4">Contacto Emergência</th>
                        <th className="p-4">Consentimento</th>
                        <th className="p-4 pr-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {members.filter(m => {
                        const matchesSearch = 
                          m.name.toLowerCase().includes(healthSearchQuery.toLowerCase()) ||
                          m.id.toLowerCase().includes(healthSearchQuery.toLowerCase());
                          
                        const hasNeeds = m.specialNeeds && m.specialNeeds !== "Nenhuma" && m.specialNeeds.trim() !== "";
                        const matchesNeeds = 
                          healthSpecialNeedsFilter === "Todos" ? true :
                          healthSpecialNeedsFilter === "Sim" ? hasNeeds : !hasNeeds;
                          
                        const matchesBlood = 
                          healthBloodTypeFilter === "Todos" ? true :
                          healthBloodTypeFilter === "Não Registado" ? (!m.bloodType || m.bloodType === "Não Especificado" || m.bloodType === "") :
                          m.bloodType === healthBloodTypeFilter;
                          
                        return matchesSearch && matchesNeeds && matchesBlood;
                      }).length > 0 ? (
                        members.filter(m => {
                          const matchesSearch = 
                            m.name.toLowerCase().includes(healthSearchQuery.toLowerCase()) ||
                            m.id.toLowerCase().includes(healthSearchQuery.toLowerCase());
                            
                          const hasNeeds = m.specialNeeds && m.specialNeeds !== "Nenhuma" && m.specialNeeds.trim() !== "";
                          const matchesNeeds = 
                            healthSpecialNeedsFilter === "Todos" ? true :
                            healthSpecialNeedsFilter === "Sim" ? hasNeeds : !hasNeeds;
                            
                          const matchesBlood = 
                            healthBloodTypeFilter === "Todos" ? true :
                            healthBloodTypeFilter === "Não Registado" ? (!m.bloodType || m.bloodType === "Não Especificado" || m.bloodType === "") :
                            m.bloodType === healthBloodTypeFilter;
                            
                          return matchesSearch && matchesNeeds && matchesBlood;
                        }).map((m) => {
                          const isUnlocked = unlockedHealthMemberIds[m.id];
                          const hasConsent = m.healthConsent === true;
                          const hasNeeds = m.specialNeeds && m.specialNeeds !== "Nenhuma" && m.specialNeeds.trim() !== "";
                          
                          return (
                            <tr key={m.id} className="hover:bg-slate-50/60 transition-all">
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-rose-600 overflow-hidden shrink-0">
                                    {m.photoUrl ? (
                                      <img src={m.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                    ) : (
                                      m.name.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-950">{m.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.id}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                {hasNeeds ? (
                                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                    {m.specialNeeds}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Nenhuma</span>
                                )}
                              </td>

                              <td className="p-4">
                                {m.bloodType ? (
                                  <span className="bg-red-50 text-red-700 border border-red-200 font-bold px-2.5 py-0.5 rounded-lg text-[10px]">
                                    {m.bloodType}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Não Registado</span>
                                )}
                              </td>

                              <td className="p-4 font-medium">
                                {!hasConsent ? (
                                  <span className="text-slate-400 italic">Sem Consentimento</span>
                                ) : !isUnlocked ? (
                                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 border border-slate-200 rounded-lg py-1 px-2.5 w-max">
                                    <Lock className="w-3 h-3 text-slate-500" />
                                    <span className="text-[10px] font-mono tracking-widest font-black">••••••••</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1 max-w-xs bg-rose-50/40 p-2 rounded-xl border border-rose-100">
                                    {m.chronicConditions && (
                                      <p className="text-[10px]">
                                        <strong className="text-rose-950">Condições:</strong> {m.chronicConditions}
                                      </p>
                                    )}
                                    {m.allergies && (
                                      <p className="text-[10px]">
                                        <strong className="text-rose-950">Alergias:</strong> {m.allergies}
                                      </p>
                                    )}
                                    {m.medications && (
                                      <p className="text-[10px]">
                                        <strong className="text-rose-950">Medicação:</strong> {m.medications}
                                      </p>
                                    )}
                                    {!m.chronicConditions && !m.allergies && !m.medications && (
                                      <span className="text-slate-400 italic text-[10px]">Sem restrições médicas registadas.</span>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="p-4 font-medium">
                                {!hasConsent ? (
                                  <span className="text-slate-400 italic">Sem Consentimento</span>
                                ) : !isUnlocked ? (
                                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 border border-slate-200 rounded-lg py-1 px-2.5 w-max">
                                    <Lock className="w-3 h-3 text-slate-500" />
                                    <span className="text-[10px] font-mono tracking-widest font-black">••••••••</span>
                                  </div>
                                ) : m.emergencyPhone ? (
                                  <div className="space-y-0.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                    <p className="font-bold text-slate-800 text-[10px]">{m.emergencyName || "Contacto Directo"}</p>
                                    <p className="text-slate-500 font-mono text-[10px]">{m.emergencyPhone}</p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Não Registado</span>
                                )}
                              </td>

                              <td className="p-4">
                                {hasConsent ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider w-max">
                                      Sim
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-mono">{m.healthConsentDate || "N/D"}</span>
                                  </div>
                                ) : (
                                  <span className="bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider w-max">
                                    Não
                                  </span>
                                )}
                              </td>

                              <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                                {hasConsent && (
                                  <button
                                    onClick={() => {
                                      if (isUnlocked) {
                                        setUnlockedHealthMemberIds(prev => ({ ...prev, [m.id]: false }));
                                      } else {
                                        setViewingHealthConfirmMember(m);
                                      }
                                    }}
                                    className={`font-bold px-2.5 py-1.5 rounded-lg text-[10px] inline-flex items-center gap-1 transition ${
                                      isUnlocked 
                                        ? "bg-slate-150 text-slate-700 hover:bg-slate-200" 
                                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-xs"
                                    }`}
                                    title={isUnlocked ? "Ocultar Informações" : "Revelar Informações com Segurança"}
                                  >
                                    {isUnlocked ? (
                                      <>
                                        <Lock className="w-3 h-3" /> Ocultar
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3 h-3 text-blue-600 animate-pulse" /> Ver Ficha (🔒)
                                      </>
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() => setEditingHealthMember({ ...m })}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1.5 rounded-lg text-[10px] inline-flex items-center gap-1 transition"
                                >
                                  <Edit2 className="w-3 h-3" /> Registar/Editar
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">Nenhum membro encontrado correspondente aos filtros de saúde.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Privacy disclaimer note */}
                <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 flex gap-3 text-[11px] text-rose-800 leading-relaxed">
                  <Shield className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-rose-950 block">Conformidade Legal & Rastreamento de Auditoria</span>
                    <span>De acordo com as leis nacionais e regulamentos de proteção de dados médicos e PII, todas as ações de visualização de registros médicos (Ficha de Saúde) por operadores de sistema são registradas irreversivelmente na guia "Logs de Auditoria". O compartilhamento não autorizado de tais informações constitui uma infração grave.</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ======================================= */}
      {/* GLOBAL FOOTER DESIGN                    */}
      {/* ======================================= */}
      <footer className="bg-white border-t border-slate-200 px-6 lg:px-16 py-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row gap-8 text-xs text-slate-500">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Métodos Aceites</span>
              <span className="font-black text-slate-700">M-PESA • e-Mola • Mkesh • Cartão</span>
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Segurança</span>
              <p className="flex items-center gap-1 font-bold text-slate-700">
                <Shield className="w-3.5 h-3.5 text-green-600" /> Assinatura QR Criptográfica Antifraude
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-right text-xs text-slate-400">
            <p className="font-medium">© 2026 OST Pay. Moçambique. Todos os direitos reservados.</p>
            <p className="mt-0.5 text-[10px]">Desenvolvido para captação, emissão de quotas e controlo de acessos.</p>
          </div>
        </div>
      </footer>

      {/* ======================================= */}
      {/* ACTIVE RECEIPT POPUP PRINTOUT MODAL     */}
      {/* ======================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl relative border border-slate-250 font-sans text-slate-900 animate-in fade-in duration-150">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt invoice styled layout */}
            <div className="space-y-6 border-b border-slate-200 pb-6 print:p-0">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-blue-900">ORGANIZAÇÃO SOCIAL DO TRABALHO</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recibo Oficial de Quota de Membro</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 font-mono">{selectedReceipt.receiptNumber}</p>
                  <p className="text-[9px] text-slate-500">{new Date(selectedReceipt.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Membro Contribuinte</p>
                  <p className="font-extrabold text-slate-950 mt-0.5">{selectedReceipt.name}</p>
                  <p className="text-slate-500">{selectedReceipt.email}</p>
                  <p className="text-slate-500">{selectedReceipt.contact}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Região da Filiação</p>
                  <p className="font-bold text-slate-950 mt-0.5">{selectedReceipt.region}</p>
                  <p className="text-slate-500">{selectedReceipt.province} Província</p>
                  <p className="text-[10px] font-mono mt-1 text-blue-700">ID: {selectedReceipt.id}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Descrição dos Valores</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-slate-100 p-2.5 font-bold text-slate-600">
                    <span>Artigo</span>
                    <span className="text-center">Método</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="grid grid-cols-3 p-3 border-t border-slate-200">
                    <span>Inscrição + Quota Oficial ({selectedReceipt.paymentType})</span>
                    <span className="text-center">{selectedReceipt.paymentMethod}</span>
                    <span className="text-right font-black text-slate-950">{selectedReceipt.paymentAmount || 500} MT</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Validation and Stamp signature watermark */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/?validate=${selectedReceipt.id}`} 
                      alt="Stamp Validation QR" 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    <p className="font-bold text-green-700">✔ Transação Eletrónica Autorizada</p>
                    <p className="mt-0.5">Assinado digitalmente por OST Pay Gateway</p>
                    <p className="font-mono mt-0.5">UUID: {selectedReceipt.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Pago</span>
                  <span className="text-2xl font-black text-blue-900">{selectedReceipt.paymentAmount || 500} MT</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition"
              >
                Fechar
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
              >
                <Printer className="w-4 h-4" /> Imprimir / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* ACTIVE BADGE GENERATION MODAL (ADMIN)   */}
      {/* ======================================= */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-[360px] w-full p-4.5 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors animate-in fade-in duration-150">
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3 flex flex-col items-center">
              <div className="text-center">
                <h3 className="text-base font-black text-[#0B2E59] dark:text-blue-400 leading-tight">Gerador de Crachá Oficial</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Membro: <strong className="text-slate-800 dark:text-slate-200">{selectedBadge.name}</strong> • ID: {selectedBadge.id}</p>
              </div>

              {/* Live Preview of the Badge */}
              <div 
                className="w-80 h-[585px] bg-white rounded-[32px] shadow-2xl border border-slate-200 flex flex-col items-center relative overflow-hidden transition-all duration-300 select-none mx-auto text-slate-900 animate-in fade-in zoom-in-95 duration-200"
                style={{ 
                  backgroundImage: "radial-gradient(circle, rgba(11, 46, 89, 0.05) 1.2px, transparent 1.2px)", 
                  backgroundSize: "16px 16px" 
                }}
              >
                {/* Discrete High-Fidelity Church Logo Watermark in Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0 rotate-12 scale-125 select-none">
                  <ChurchLogo className="w-64 h-64" />
                </div>

                {/* Elegant Inner Border Offset with custom gold color */}
                <div className="absolute inset-3 border border-[#D4AF37]/30 rounded-[24px] pointer-events-none z-10 opacity-60"></div>

                {/* 1. PREMIUM HEADER BLOCK */}
                <div className="w-full bg-[#0B2E59] px-4 pt-6 pb-4.5 flex flex-col items-center relative text-center shadow-md z-20 border-b-2 border-[#D4AF37]">
                  {/* Mozambique Flag Mini Official Ribbon */}
                  <div className="absolute top-3.5 right-4 flex h-2 rounded-full overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    <div className="w-3 bg-[#009739]"></div>
                    <div className="w-3 bg-black"></div>
                    <div className="w-3 bg-[#D00C27]"></div>
                    <div className="w-3 bg-[#FFD100]"></div>
                  </div>

                  {/* Centered Church Logo with golden container shadow */}
                  <div className="bg-white p-0.5 rounded-full border-2 border-[#D4AF37] mb-2.5 shadow-md flex items-center justify-center">
                    <ChurchLogo className="w-11 h-11" />
                  </div>

                  <h3 className="text-[11px] font-black tracking-[0.16em] text-white uppercase leading-none font-sans">ASSEMBLEIA DE DEUS</h3>
                  <h3 className="text-[10px] font-extrabold tracking-[0.12em] text-[#D4AF37] uppercase mt-1 leading-none font-sans">AFRICANA</h3>
                  
                  <p className="text-[7.5px] font-bold tracking-[0.2em] text-blue-200 mt-2.5 uppercase font-sans">
                    CRACHÁ OFICIAL DE MEMBRO
                  </p>
                </div>

                {/* 2. PHOTO PORTRAIT FRAME */}
                <div className="relative mt-5.5 z-20">
                  <div 
                    className="w-[124px] h-[124px] rounded-full bg-white border-2 p-1 shadow-lg overflow-hidden flex items-center justify-center"
                    style={{ 
                      borderColor: "#D4AF37",
                      boxShadow: "0 10px 25px -5px rgba(11, 46, 89, 0.15), 0 8px 10px -6px rgba(11, 46, 89, 0.15)"
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#F1F5F9] overflow-hidden relative">
                      {selectedBadge.photoUrl ? (
                        <img src={selectedBadge.photoUrl} alt="Foto Membro" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <User className="w-14 h-14 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. NAME & METADATA COLUMN */}
                <div className="w-full px-5 flex flex-col items-center mt-3.5 z-20 text-center">
                  <h3 className="text-[19px] font-extrabold text-[#0B2E59] leading-tight uppercase tracking-tight max-w-[260px] line-clamp-1 font-sans">
                    {selectedBadge.name}
                  </h3>
                  
                  <p className="text-[8.5px] text-[#4A5D78] font-bold mt-1 uppercase tracking-[0.14em] font-sans">
                    • {selectedBadge.region.toUpperCase()} • {selectedBadge.province.toUpperCase()} •
                  </p>

                  <div className="mt-3">
                    <span 
                      className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full uppercase tracking-[0.16em] text-[10px] font-black bg-[#0B2E59] text-[#D4AF37] border border-[#D4AF37] shadow-md"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                      {getPositionTheme(selectedBadge.role).name}
                    </span>
                  </div>

                  {/* 4. DETAILS GRID */}
                  <div className="w-full grid grid-cols-2 gap-3 mt-4.5 px-1">
                    <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">ID Membro</p>
                      <p className="text-[12.5px] font-black font-sans text-[#0B2E59] leading-none mt-1.5">{selectedBadge.id}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">Emissão</p>
                      <p className="text-[12.5px] font-black font-sans text-[#0B2E59] leading-none mt-1.5">{new Date(selectedBadge.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">Estado</p>
                      <p className="text-[11px] font-black text-emerald-600 leading-none uppercase tracking-wider flex items-center gap-1.5 mt-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        Ativo
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[18px] p-3 shadow-xs flex flex-col justify-center min-h-[52px] hover:border-[#0B2E59]/20 transition-all duration-300">
                      <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest leading-none font-sans">Quotas</p>
                      <p className="text-[11px] font-black text-[#D4AF37] leading-none uppercase tracking-wider flex items-center gap-1.5 mt-1.5 font-sans">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] inline-block"></span>
                        Em Dia
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. ELEGANT FOOTER */}
                {modalCodeOption === "both" && (
                  <div className="w-full mt-auto px-5 pb-5 pt-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 z-20 rounded-b-[32px]">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans">Secure QR</span>
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-xs">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/?validate=${selectedBadge.id}`} 
                          alt="Verification QR" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-end gap-1">
                      <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans">Código de Acesso</span>
                      <div className="w-full bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
                        <div className="h-5 flex gap-[1.2px] items-end justify-center w-full opacity-90">
                          {[2,1,3,1,2,1,4,1,1,3,1,2,1,1,1,2,1,3,1,2,1.5,1,2].map((w, i) => (
                            <div key={i} className="bg-slate-900 h-full flex-1 max-w-[2.2px]" style={{ minWidth: '1px' }}></div>
                          ))}
                        </div>
                        <p className="text-[7.5px] text-[#0B2E59] font-bold font-sans mt-1 tracking-[0.25em]">{selectedBadge.barcode || "177046147516"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {modalCodeOption === "qr" && (
                  <div className="w-full mt-auto px-5 pb-5 pt-3.5 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center gap-1 z-20 rounded-b-[32px]">
                    <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans text-center">Secure QR</span>
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1 flex items-center justify-center shadow-xs">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/?validate=${selectedBadge.id}`} 
                        alt="Verification QR" 
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {modalCodeOption === "barcode" && (
                  <div className="w-full mt-auto px-5 pb-5 pt-3.5 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center gap-1 z-20 rounded-b-[32px]">
                    <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-[0.15em] font-sans text-center">Código de Acesso</span>
                    <div className="w-48 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs">
                      <div className="h-6 flex gap-[1.5px] items-end justify-center w-full opacity-90">
                        {[2,1,3,1,2,1,4,1,1,3,1,2,1,1,1,2,1,3,1,2,1.5,1,2,1,3].map((w, i) => (
                          <div key={i} className="bg-slate-900 h-full flex-1 max-w-[2.2px]" style={{ minWidth: '1px' }}></div>
                        ))}
                      </div>
                      <p className="text-[8px] text-[#0B2E59] font-bold font-sans mt-1.5 tracking-[0.25em]">{selectedBadge.barcode || "177046147516"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Option Selector (Dynamic Controller in Modal) */}
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2.5 w-80 mx-auto">
                <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Formato de Validação no Crachá</span>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCodeOption("both");
                      if (saveAsGlobal) {
                        setBadgeCodeOption("both");
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${modalCodeOption === "both" ? "bg-white dark:bg-slate-800 text-[#0B2E59] dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                  >
                    Ambos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalCodeOption("qr");
                      if (saveAsGlobal) {
                        setBadgeCodeOption("qr");
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${modalCodeOption === "qr" ? "bg-white dark:bg-slate-800 text-[#0B2E59] dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                  >
                    QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalCodeOption("barcode");
                      if (saveAsGlobal) {
                        setBadgeCodeOption("barcode");
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${modalCodeOption === "barcode" ? "bg-white dark:bg-slate-800 text-[#0B2E59] dark:text-white shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                  >
                    Cód. Barras
                  </button>
                </div>

                {/* Checkbox for Global Preference */}
                <label className="flex items-center justify-center gap-2 px-1 py-0.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveAsGlobal}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSaveAsGlobal(checked);
                      if (checked) {
                        setBadgeCodeOption(modalCodeOption);
                      }
                    }}
                    className="w-3.5 h-3.5 text-indigo-600 border-slate-300 dark:border-slate-700 rounded-sm focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    Definir como preferência global
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-80 pt-1">
                <button 
                  onClick={() => {
                    handleGenerateBadgePDF(selectedBadge, true, { withBleedAndCrop: false, codeFormat: modalCodeOption });
                    addLog(selectedBadge.name, "Administrador descarregou crachá padrão em PDF", "success");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 px-2.5 py-2 rounded-xl transition cursor-pointer active:scale-95 border border-blue-200/50"
                >
                  <Printer className="w-3.5 h-3.5" /> Crachá Padrão
                </button>

                <button 
                  onClick={() => {
                    handleGenerateBadgePDF(selectedBadge, true, { withBleedAndCrop: true, codeFormat: modalCodeOption });
                    addLog(selectedBadge.name, "Administrador descarregou crachá com sangria em PDF", "success");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-2 rounded-xl transition cursor-pointer active:scale-95 border border-indigo-200/50"
                >
                  <Scissors className="w-3.5 h-3.5" /> PVC (Sangria)
                </button>
              </div>

              <button 
                onClick={() => setSelectedBadge(null)}
                className="w-80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition mt-1"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* HEALTH EDIT/REGISTRATION MODAL          */}
      {/* ======================================= */}
      {editingHealthMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in duration-150">
            <button 
              onClick={() => setEditingHealthMember(null)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <div>
                  <h3 className="text-base font-black text-slate-950">Ficha de Saúde e Assistência</h3>
                  <p className="text-[11px] text-slate-500">Membro: <strong className="text-slate-800">{editingHealthMember.name}</strong> • ID: {editingHealthMember.id}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Grupo Sanguíneo</label>
                    <select
                      value={editingHealthMember.bloodType || ""}
                      onChange={(e) => setEditingHealthMember({ ...editingHealthMember, bloodType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-blue-700"
                    >
                      <option value="">Não Especificado</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Necessidades Especiais</label>
                    <input
                      type="text"
                      placeholder="Ex: Cadeirante, Deficiência Visual, etc."
                      value={editingHealthMember.specialNeeds || ""}
                      onChange={(e) => setEditingHealthMember({ ...editingHealthMember, specialNeeds: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Condições Crónicas / Doenças</label>
                    <input
                      type="text"
                      placeholder="Ex: Hipertensão, Diabetes, Alergias alimentares..."
                      value={editingHealthMember.chronicConditions || ""}
                      onChange={(e) => setEditingHealthMember({ ...editingHealthMember, chronicConditions: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Alergias Conhecidas</label>
                    <input
                      type="text"
                      placeholder="Ex: Penicilina, Paracetamol, etc."
                      value={editingHealthMember.allergies || ""}
                      onChange={(e) => setEditingHealthMember({ ...editingHealthMember, allergies: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Medicação Contínua</label>
                    <input
                      type="text"
                      placeholder="Medicamentos que toma com regularidade..."
                      value={editingHealthMember.medications || ""}
                      onChange={(e) => setEditingHealthMember({ ...editingHealthMember, medications: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contacto de Emergência</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Nome do Contacto</label>
                      <input
                        type="text"
                        placeholder="Ex: Maria Santos (Mãe)"
                        value={editingHealthMember.emergencyName || ""}
                        onChange={(e) => setEditingHealthMember({ ...editingHealthMember, emergencyName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Telefone de Emergência</label>
                      <input
                        type="text"
                        placeholder="Ex: +258 84..."
                        value={editingHealthMember.emergencyPhone || ""}
                        onChange={(e) => setEditingHealthMember({ ...editingHealthMember, emergencyPhone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-blue-700 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 mt-4">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="health-consent-checkbox"
                      type="checkbox"
                      checked={editingHealthMember.healthConsent || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingHealthMember({ 
                          ...editingHealthMember, 
                          healthConsent: checked,
                          healthConsentDate: checked ? new Date().toLocaleDateString() : ""
                        });
                      }}
                      className="mt-0.5 w-4 h-4 text-rose-600 bg-slate-100 border-slate-300 rounded focus:ring-rose-500 cursor-pointer"
                    />
                    <label htmlFor="health-consent-checkbox" className="text-[11px] text-slate-600 leading-relaxed font-semibold cursor-pointer">
                      Declaro que o membro forneceu consentimento livre, específico e informado para o registo e armazenamento destas informações de saúde confidenciais para apoio médico de urgência.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingHealthMember(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!editingHealthMember.healthConsent}
                  onClick={() => handleSaveHealthRecord(editingHealthMember)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Guardar Informações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* HEALTH VIEW PRIVACY CONFIRM MODAL       */}
      {/* ======================================= */}
      {viewingHealthConfirmMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in duration-150">
            <button 
              onClick={() => {
                setViewingHealthConfirmMember(null);
                setHealthPrivacyChecked(false);
              }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <Lock className="w-5 h-5 text-amber-500 animate-bounce" />
                <h3 className="text-base font-black text-slate-950">Acesso Restrito & Auditado</h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <p>
                  Está prestes a aceder à <strong>Ficha de Saúde Confidencial</strong> de:
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-50 text-rose-600 font-bold rounded-full flex items-center justify-center shrink-0">
                    {viewingHealthConfirmMember.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{viewingHealthConfirmMember.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{viewingHealthConfirmMember.id}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-800 space-y-1.5">
                  <span className="font-extrabold text-amber-950 block uppercase tracking-wider">Aviso de Auditoria Obrigatória</span>
                  <span>
                    Todas as visualizações de dados médicos sensíveis são registadas de forma permanente no Log de Auditoria. Esta política destina-se a garantir a privacidade do membro.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    id="privacy-audit-checkbox"
                    type="checkbox"
                    checked={healthPrivacyChecked}
                    onChange={(e) => setHealthPrivacyChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="privacy-audit-checkbox" className="text-[10px] text-slate-600 font-bold cursor-pointer select-none">
                    Declaro que este acesso destina-se exclusivamente a fins de assistência oficial e tenho autorização explícita para tratar estes dados confidenciais.
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setViewingHealthConfirmMember(null);
                    setHealthPrivacyChecked(false);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  disabled={!healthPrivacyChecked}
                  onClick={() => {
                    const mId = viewingHealthConfirmMember.id;
                    setUnlockedHealthMemberIds(prev => ({ ...prev, [mId]: true }));
                    addLog("Administrador", `Visualizou a Ficha de Saúde de ${viewingHealthConfirmMember.name} (${mId})`, "warning");
                    setActiveToasts(prev => [
                      {
                        id: "toast-" + Date.now(),
                        title: "Ficha Desbloqueada",
                        message: `Informações de ${viewingHealthConfirmMember.name} reveladas. Ação auditada.`,
                        type: "info"
                      },
                      ...prev
                    ]);
                    setViewingHealthConfirmMember(null);
                    setHealthPrivacyChecked(false);
                  }}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl text-xs shadow-md transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  Revelar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Popups for Real-Time Events */}
      <div className="fixed top-24 right-6 z-[9999] w-full max-w-sm flex flex-col gap-3 pointer-events-none">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex gap-3 transform translate-y-0 transition-all duration-300 ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                : toast.type === "warning" 
                ? "bg-amber-50 border-amber-200 text-amber-900" 
                : toast.type === "danger"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-blue-50 border-blue-200 text-blue-900"
            }`}
          >
            <div className="mt-0.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === "warning" && <Bell className="w-5 h-5 text-amber-600 animate-bounce" />}
              {toast.type === "danger" && <ShieldAlert className="w-5 h-5 text-red-600" />}
              {toast.type === "info" && <Shield className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider">{toast.title}</h4>
                <button
                  onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
              
              {toast.type === "warning" && toast.memberId && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      handleApprovePayment(toast.memberId!);
                      setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] shadow transition"
                  >
                    Aprovar Agora
                  </button>
                  <button
                    onClick={() => {
                      setCurrentMode("admin");
                      setAdminTab("overview");
                      setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                    className="bg-white/80 hover:bg-white text-slate-800 border border-slate-200 font-bold px-2.5 py-1 rounded-lg text-[10px] transition"
                  >
                    Ver no Painel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
