export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
