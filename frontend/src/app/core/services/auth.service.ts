import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, User, Role } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private storageService = inject(StorageService);
  private http = inject(HttpClient);

  constructor() {
    const stored = this.storageService.getItem('dayoff_user');
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        this.storageService.removeItem('dayoff_user');
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((res) => {
        this.storageService.setItem('dayoff_token', res.token);
        const user: User = {
          id: res.userId,
          nom: res.nom,
          prenom: res.prenom,
          email: res.email,
          telephone: '',
          leaveDaysRemaining: 0,
          role: res.role
        };
        this.storageService.setItem('dayoff_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    this.storageService.removeItem('dayoff_token');
    this.storageService.removeItem('dayoff_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.storageService.getItem('dayoff_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRole(): Role | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Refresh the cached user after a profile update */
  refreshUser(user: User): void {
    this.storageService.setItem('dayoff_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
