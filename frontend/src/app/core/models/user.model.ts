export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  leaveDaysRemaining: number;
  role: Role;
  hrManagerId?: number;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: Role;
  nom: string;
  prenom: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  password: string;
  hrManagerId?: number;
}
