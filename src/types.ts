export interface AdminNotification {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paymentMethod: string;
  timestamp: string;
  status: "Pendente" | "Aprovado" | "Rejeitado";
}

export interface AdminToast {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "danger";
  memberId?: string;
}

export interface Member {
  id: string; // UUID / Member ID
  name: string;
  birthDate: string;
  contact: string;
  email: string;
  province: string;
  region: string;
  paymentType: "Individual" | "Regional" | "Contribuição" | "";
  paymentMethod: "M-Pesa" | "e-Mola" | "Mkesh" | "Cartão" | "Transferência" | "";
  paymentStatus: "Não Registado" | "Pendente" | "Ativo" | "Bloqueado";
  receiptNumber: string;
  badgeNumber: string;
  barcode: string;
  photoUrl: string;
  createdAt: string;
  lastAccess: string;
  paymentAmount?: number;
  expiryDate?: string;
  lastExpiryNotificationSent?: string;
  congregation?: string;
  ministry?: string;
  role?: "Membro" | "Diacono" | "Diaconisa" | "Anciao" | "Pastor" | "Bispo" | "Visitante" | "Diácono" | "Ancião";
  baptismDate?: string;
  authorizedMinistries?: string[];
  bloodType?: string;
  specialNeeds?: string;
  chronicConditions?: string;
  allergies?: string;
  medications?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  healthConsent?: boolean;
  healthConsentDate?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberRole: "Membro" | "Diacono" | "Diaconisa" | "Anciao" | "Pastor" | "Bispo" | "Visitante" | "Diácono" | "Ancião";
  congregation: string;
  ministry: string;
  timestamp: string;
  location: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  type: "success" | "info" | "warning" | "danger";
}

export interface WhatsAppReminder {
  id: string;
  memberId: string;
  memberName: string;
  contact: string;
  expiryDate: string;
  daysLeft: number;
  scheduledDate: string; // "YYYY-MM-DD"
  status: "Agendado" | "Enviado" | "Falhado" | "Cancelado";
  message: string;
  sentAt?: string;
}

export interface SmartTemplate {
  id: string;
  name: string;
  triggerType: "Antes_Vencer" | "Apos_Vencer" | "Expirado_Hoje"; // Trigger event types
  message: string;
  daysInterval: number; // Send X days before or after expiry
  isActive: boolean;
  createdAt: string;
}
