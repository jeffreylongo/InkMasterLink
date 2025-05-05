import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Parlor, ParlorListItem } from '../models/parlor.model';

@Injectable({
  providedIn: 'root'
})
export class ParlorService {
  private apiUrl = `${environment.apiUrl}/parlors`;

  constructor(private http: HttpClient) { }

  /**
   * Get all parlors with optional filters
   */
  getParlors(filters: any = {}): Observable<ParlorListItem[]> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    
    return this.http.get<ParlorListItem[]>(this.apiUrl, { params });
  }

  /**
   * Get a specific parlor by ID
   */
  getParlorById(id: string): Observable<Parlor> {
    return this.http.get<Parlor>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get parlors by owner ID
   */
  getParlorsByOwnerId(ownerId: string): Observable<ParlorListItem[]> {
    return this.http.get<ParlorListItem[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  /**
   * Get featured parlors
   */
  getFeaturedParlors(limit: number = 6): Observable<ParlorListItem[]> {
    return this.http.get<ParlorListItem[]>(`${this.apiUrl}/featured`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Get sponsored parlors
   */
  getSponsoredParlors(limit: number = 4): Observable<ParlorListItem[]> {
    return this.http.get<ParlorListItem[]>(`${this.apiUrl}/sponsored`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Search parlors by keyword
   */
  searchParlors(searchTerm: string, limit: number = 10): Observable<ParlorListItem[]> {
    return this.http.get<ParlorListItem[]>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('q', searchTerm)
        .set('limit', limit.toString())
    });
  }

  /**
   * Create a new parlor
   */
  createParlor(parlorData: Partial<Parlor>): Observable<Parlor> {
    return this.http.post<Parlor>(this.apiUrl, parlorData);
  }

  /**
   * Update an existing parlor
   */
  updateParlor(id: string, updates: Partial<Parlor>): Observable<Parlor> {
    return this.http.put<Parlor>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete a parlor
   */
  deleteParlor(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}