export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const POSITIONS = {
  RECEPTIONIST: "Lễ tân",
  DOCTOR: "Bác sĩ",
  TECHNICIAN: "Kỹ thuật viên",
  MANAGER: "Quản lý",
} as const;