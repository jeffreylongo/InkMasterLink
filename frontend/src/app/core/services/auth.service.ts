import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }
  
  /**
   * Load authentication data from local storage
   */
  private loadStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
    }
  }
  
  /**
   * Save authentication data to local storage
   */
  private saveAuth(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }
  
  /**
   * Register a new user
   */
  register(userData: {
    email: string;
    username: string;
    password: string;
    role: UserRole;
    name: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(res => this.saveAuth(res.user, res.token)),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }
  
  /**
   * Login a user
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(res => this.saveAuth(res.user, res.token)),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }
  
  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    
    this.router.navigate(['/']);
  }
  
  /**
   * Get current user from server (refresh)
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }),
        catchError(error => {
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error(error.error?.message || 'Failed to get user'));
        })
      );
  }
  
  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, updates)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        })
      );
  }
  
  /**
   * Change password
   */
  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwordData);
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }
  
  /**
   * Get current user synchronously
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  /**
   * Get auth token synchronously
   */
  get token(): string | null {
    return this.tokenSubject.value;
  }
  
  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Check if current user is an artist
   */
  isArtist(): boolean {
    return this.hasRole(UserRole.ARTIST);
  }

  /**
   * Check if current user is a parlor owner
   */
  isParlorOwner(): boolean {
    return this.hasRole(UserRole.PARLOR_OWNER);
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.id || null;
  }
}