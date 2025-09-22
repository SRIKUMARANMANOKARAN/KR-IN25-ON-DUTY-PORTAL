
import { OnDutyRequest, RequestStatus, StudentUser } from './types';

export const INITIAL_STUDENT_USERS: StudentUser[] = [
  { id: 'user123', password: 'password123', name: 'Sanjay Kumar', rollNo: '7377222IT228' },
  { id: 'student', password: 'pass', name: 'Vimal Raj', rollNo: '7377222IT248' }
];

export const ADMIN_CREDENTIALS: { [key: string]: string } = {
  'admin': 'adminpass'
};

export const SEMESTER_OPTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
export const ACADEMIC_YEAR_OPTIONS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
export const BATCH_OPTIONS = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];


export const INITIAL_FORM_STATE: Omit<OnDutyRequest, 'id' | 'status' | 'jioTagPhoto' | 'approvalLetter' | 'certificate' | 'submittedBy'> = {
    name: '',
    rollNo: '',
    semester: SEMESTER_OPTIONS[0],
    academicYear: ACADEMIC_YEAR_OPTIONS[0],
    batch: BATCH_OPTIONS[0],
    reason: '',
    collegeName: 'KR Institutions',
    period: 'Full Day',
    fromDate: '',
    toDate: '',
};