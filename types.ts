
export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface FileData {
  name: string;
  type: string;
  dataUrl: string;
}

export interface OnDutyRequest {
  id: string;
  name: string;
  rollNo: string;
  semester: string;
  academicYear: string;
  batch: string;
  reason: string;
  collegeName: string;
  period: 'Half Day' | 'Full Day';
  fromDate: string;
  toDate: string;
  jioTagPhoto: FileData | null;
  approvalLetter: FileData | null;
  certificate: FileData | null;
  status: RequestStatus;
  submittedBy: string; // user ID
}

export type UserType = 'user' | 'admin';

export interface StudentUser {
  id: string;
  password: string;
  name: string;
  rollNo: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  adminId: string;
  action: string;
}