import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface InstagramMediaItem {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  thumbnail_url?: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
  profile_picture_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private apiUrl = `${environment.apiUrl}/instagram`;

  constructor(private http: HttpClient) { }

  /**
   * Get Instagram authentication URL
   */
  getAuthUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/auth-url`);
  }

  /**
   * Connect Instagram account using authorization code
   */
  connectInstagram(code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/connect`, { code });
  }

  /**
   * Disconnect Instagram account
   */
  disconnectInstagram(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/disconnect`, {});
  }

  /**
   * Get user's Instagram feed
   */
  getUserFeed(limit: number = 6): Observable<InstagramMediaItem[]> {
    return this.http.get<InstagramMediaItem[]>(`${this.apiUrl}/user-feed`, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      catchError(error => {
        console.error('Error fetching Instagram feed:', error);
        return of([]);
      })
    );
  }

  /**
   * Get artist's Instagram feed
   */
  getArtistFeed(artistId: string, limit: number = 6): Observable<InstagramMediaItem[]> {
    return this.http.get<InstagramMediaItem[]>(`${this.apiUrl}/artist/${artistId}`, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      catchError(error => {
        console.error(`Error fetching artist Instagram feed:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get parlor's Instagram feed
   */
  getParlorFeed(parlorId: string, limit: number = 6): Observable<InstagramMediaItem[]> {
    return this.http.get<InstagramMediaItem[]>(`${this.apiUrl}/parlor/${parlorId}`, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      catchError(error => {
        console.error(`Error fetching parlor Instagram feed:`, error);
        return of([]);
      })
    );
  }

  /**
   * Check if user has connected Instagram
   */
  isInstagramConnected(): Observable<{ connected: boolean }> {
    return this.http.get<{ connected: boolean }>(`${this.apiUrl}/connected`).pipe(
      catchError(error => {
        console.error('Error checking Instagram connection:', error);
        return of({ connected: false });
      })
    );
  }

  /**
   * Handle Instagram callback
   */
  handleCallback(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/callback`, {
      params: new HttpParams().set('code', code)
    });
  }
}