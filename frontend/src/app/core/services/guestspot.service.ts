import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Guestspot, GuestspotListItem, GuestspotApplication } from '../models/guestspot.model';

@Injectable({
  providedIn: 'root'
})
export class GuestspotService {
  private apiUrl = `${environment.apiUrl}/guestspots`;

  constructor(private http: HttpClient) { }

  /**
   * Get all guestspots with optional filters
   */
  getGuestspots(filters: any = {}): Observable<GuestspotListItem[]> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    
    return this.http.get<GuestspotListItem[]>(this.apiUrl, { params });
  }

  /**
   * Get a specific guestspot by ID
   */
  getGuestspotById(id: string): Observable<Guestspot> {
    return this.http.get<Guestspot>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get guestspots by parlor ID
   */
  getGuestspotsByParlorId(parlorId: string): Observable<GuestspotListItem[]> {
    return this.http.get<GuestspotListItem[]>(`${this.apiUrl}/parlor/${parlorId}`);
  }

  /**
   * Get guestspots by artist ID
   */
  getGuestspotsByArtistId(artistId: string): Observable<GuestspotListItem[]> {
    return this.http.get<GuestspotListItem[]>(`${this.apiUrl}/artist/${artistId}`);
  }

  /**
   * Get upcoming guestspots
   */
  getUpcomingGuestspots(limit: number = 6): Observable<GuestspotListItem[]> {
    return this.http.get<GuestspotListItem[]>(`${this.apiUrl}/upcoming`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Get open guestspots
   */
  getOpenGuestspots(limit: number = 10): Observable<GuestspotListItem[]> {
    return this.http.get<GuestspotListItem[]>(`${this.apiUrl}/open`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Create a new guestspot
   */
  createGuestspot(guestspotData: Partial<Guestspot>): Observable<Guestspot> {
    return this.http.post<Guestspot>(this.apiUrl, guestspotData);
  }

  /**
   * Update an existing guestspot
   */
  updateGuestspot(id: string, updates: Partial<Guestspot>): Observable<Guestspot> {
    return this.http.put<Guestspot>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete a guestspot
   */
  deleteGuestspot(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Apply for a guestspot
   */
  applyForGuestspot(guestspotId: string, application: {
    artistId: string;
    message: string;
    portfolio: string[];
  }): Observable<GuestspotApplication> {
    return this.http.post<GuestspotApplication>(
      `${this.apiUrl}/${guestspotId}/apply`,
      application
    );
  }

  /**
   * Approve a guestspot application
   */
  approveApplication(guestspotId: string, artistId: string): Observable<Guestspot> {
    return this.http.post<Guestspot>(
      `${this.apiUrl}/${guestspotId}/approve`,
      { artistId }
    );
  }

  /**
   * Reject a guestspot application
   */
  rejectApplication(guestspotId: string, artistId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${guestspotId}/reject`,
      { artistId }
    );
  }

  /**
   * Cancel a guestspot
   */
  cancelGuestspot(id: string): Observable<Guestspot> {
    return this.http.post<Guestspot>(`${this.apiUrl}/${id}/cancel`, {});
  }

  /**
   * Complete a guestspot
   */
  completeGuestspot(id: string): Observable<Guestspot> {
    return this.http.post<Guestspot>(`${this.apiUrl}/${id}/complete`, {});
  }
}