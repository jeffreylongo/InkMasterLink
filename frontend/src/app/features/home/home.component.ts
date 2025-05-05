import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ArtistService } from '../../core/services/artist.service';
import { ParlorService } from '../../core/services/parlor.service';
import { GuestspotService } from '../../core/services/guestspot.service';
import { Artist, ArtistListItem } from '../../core/models/artist.model';
import { Parlor, ParlorListItem } from '../../core/models/parlor.model';
import { GuestspotListItem } from '../../core/models/guestspot.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredArtists: ArtistListItem[] = [];
  featuredParlors: ParlorListItem[] = [];
  upcomingGuestspots: GuestspotListItem[] = [];
  searchTerm: string = '';
  loading = {
    artists: true,
    parlors: true,
    guestspots: true
  };
  
  constructor(
    private artistService: ArtistService,
    private parlorService: ParlorService,
    private guestspotService: GuestspotService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFeaturedArtists();
    this.loadFeaturedParlors();
    this.loadUpcomingGuestspots();
  }
  
  private loadFeaturedArtists(): void {
    this.loading.artists = true;
    this.artistService.getFeaturedArtists().subscribe({
      next: (artists) => {
        this.featuredArtists = artists;
        this.loading.artists = false;
      },
      error: (error) => {
        console.error('Error loading featured artists:', error);
        this.loading.artists = false;
      }
    });
  }
  
  private loadFeaturedParlors(): void {
    this.loading.parlors = true;
    this.parlorService.getFeaturedParlors().subscribe({
      next: (parlors) => {
        this.featuredParlors = parlors;
        this.loading.parlors = false;
      },
      error: (error) => {
        console.error('Error loading featured parlors:', error);
        this.loading.parlors = false;
      }
    });
  }
  
  private loadUpcomingGuestspots(): void {
    this.loading.guestspots = true;
    this.guestspotService.getUpcomingGuestspots().subscribe({
      next: (guestspots) => {
        this.upcomingGuestspots = guestspots;
        this.loading.guestspots = false;
      },
      error: (error) => {
        console.error('Error loading upcoming guestspots:', error);
        this.loading.guestspots = false;
      }
    });
  }
  
  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/artists'], { 
        queryParams: { searchTerm: this.searchTerm.trim() } 
      });
    }
  }
}