import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Artist, ArtistListItem } from '../models/artist.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = `${environment.apiUrl}/artists`;

  constructor(private http: HttpClient) { }

  /**
   * Get all artists with optional filters
   */
  getArtists(filters: any = {}): Observable<ArtistListItem[]> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    
    return this.http.get<ArtistListItem[]>(this.apiUrl, { params });
  }

  /**
   * Get a specific artist by ID
   */
  getArtistById(id: string): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get artist by user ID
   */
  getArtistByUserId(userId: string): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get featured artists
   */
  getFeaturedArtists(limit: number = 6): Observable<ArtistListItem[]> {
    return this.http.get<ArtistListItem[]>(`${this.apiUrl}/featured`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Get sponsored artists
   */
  getSponsoredArtists(limit: number = 4): Observable<ArtistListItem[]> {
    return this.http.get<ArtistListItem[]>(`${this.apiUrl}/sponsored`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Get traveling artists
   */
  getTravelingArtists(limit: number = 8): Observable<ArtistListItem[]> {
    return this.http.get<ArtistListItem[]>(`${this.apiUrl}/traveling`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }

  /**
   * Search artists by keyword
   */
  searchArtists(searchTerm: string, limit: number = 10): Observable<ArtistListItem[]> {
    return this.http.get<ArtistListItem[]>(`${this.apiUrl}/search`, {
      params: new HttpParams()
        .set('q', searchTerm)
        .set('limit', limit.toString())
    });
  }

  /**
   * Create a new artist profile
   */
  createArtist(artistData: Partial<Artist>): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl, artistData);
  }

  /**
   * Update an existing artist profile
   */
  updateArtist(id: string, updates: Partial<Artist>): Observable<Artist> {
    return this.http.put<Artist>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Delete an artist profile
   */
  deleteArtist(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get artists by parlor ID
   */
  getArtistsByParlorId(parlorId: string): Observable<ArtistListItem[]> {
    return this.http.get<ArtistListItem[]>(`${this.apiUrl}/parlor/${parlorId}`);
  }
}