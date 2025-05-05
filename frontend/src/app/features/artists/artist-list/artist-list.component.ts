import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { ArtistListItem } from '../../../core/models/artist.model';
import { AuthService } from '../../../core/services/auth.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-artist-list',
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.scss']
})
export class ArtistListComponent implements OnInit {
  artists: ArtistListItem[] = [];
  sponsoredArtists: ArtistListItem[] = [];
  loading = true;
  error = false;
  
  // Pagination
  totalArtists = 0;
  pageSize = 12;
  currentPage = 0;
  
  // Filters
  filterOptions = {
    search: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    specialty: '',
    travelWilling: false
  };
  
  // Filtering by parlor
  parlorId: string | null = null;
  parlorName: string = '';

  constructor(
    private artistService: ArtistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Check if filtering by parlor ID
      if (params['parlorId']) {
        this.parlorId = params['parlorId'];
        // In a real app, you would fetch parlor name from a service
        this.parlorName = 'this parlor';
      } else {
        this.parlorId = null;
      }
      
      // Load filter values from URL params
      if (params['search']) {
        this.filterOptions.search = params['search'];
      }
      if (params['city']) {
        this.filterOptions.location.city = params['city'];
      }
      if (params['state']) {
        this.filterOptions.location.state = params['state'];
      }
      if (params['country']) {
        this.filterOptions.location.country = params['country'];
      }
      if (params['specialty']) {
        this.filterOptions.specialty = params['specialty'];
      }
      if (params['travelWilling']) {
        this.filterOptions.travelWilling = params['travelWilling'] === 'true';
      }
      
      // Load artists
      if (this.parlorId) {
        this.loadArtistsByParlor();
      } else {
        this.loadSponsored();
        this.loadArtists();
      }
    });
  }

  loadArtists(): void {
    this.loading = true;
    this.error = false;
    
    const params = {
      ...this.filterOptions,
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize
    };
    
    this.artistService.getArtists(params).subscribe(
      artists => {
        this.artists = artists;
        // In a real app with a proper API, we'd get the total count from the response
        // For now, we'll just assume there are more if we got a full page
        this.totalArtists = Math.max((this.currentPage + 1) * this.pageSize, artists.length);
        this.loading = false;
      },
      error => {
        console.error('Error loading artists', error);
        this.error = true;
        this.loading = false;
      }
    );
  }

  loadArtistsByParlor(): void {
    this.loading = true;
    this.error = false;
    
    if (!this.parlorId) return;
    
    this.artistService.getArtistsByParlorId(this.parlorId).subscribe(
      artists => {
        this.artists = artists;
        this.loading = false;
      },
      error => {
        console.error('Error loading parlor artists', error);
        this.error = true;
        this.loading = false;
      }
    );
  }

  loadSponsored(): void {
    this.artistService.getSponsoredArtists().subscribe(
      artists => {
        this.sponsoredArtists = artists;
      },
      error => {
        console.error('Error loading sponsored artists', error);
      }
    );
  }

  onFilterChange(filterData: any): void {
    this.filterOptions = filterData;
    this.currentPage = 0; // Reset to first page
    
    // Update URL with filters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: filterData.search || null,
        city: filterData.location.city || null,
        state: filterData.location.state || null,
        country: filterData.location.country || null,
        specialty: filterData.specialty || null,
        travelWilling: filterData.travelWilling ? 'true' : null
      },
      queryParamsHandling: 'merge'
    });
    
    this.loadArtists();
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadArtists();
  }
}
