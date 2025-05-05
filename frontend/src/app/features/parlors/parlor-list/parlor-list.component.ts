import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParlorService } from '../../../core/services/parlor.service';
import { ParlorListItem } from '../../../core/models/parlor.model';
import { AuthService } from '../../../core/services/auth.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-parlor-list',
  templateUrl: './parlor-list.component.html',
  styleUrls: ['./parlor-list.component.scss']
})
export class ParlorListComponent implements OnInit {
  parlors: ParlorListItem[] = [];
  sponsoredParlors: ParlorListItem[] = [];
  loading = true;
  error = false;
  
  // Pagination
  totalParlors = 0;
  pageSize = 12;
  currentPage = 0;
  
  // Filters
  filterOptions = {
    search: '',
    location: {
      city: '',
      state: '',
      country: ''
    }
  };
  
  // My Parlors filter
  showingMyParlors = false;

  constructor(
    private parlorService: ParlorService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'my-parlors') {
        this.showingMyParlors = true;
        this.loadMyParlors();
      } else {
        this.showingMyParlors = false;
        this.loadSponsored();
        
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
        
        this.loadParlors();
      }
    });
  }

  loadParlors(): void {
    this.loading = true;
    this.error = false;
    
    const params = {
      ...this.filterOptions,
      limit: this.pageSize,
      offset: this.currentPage * this.pageSize
    };
    
    this.parlorService.getParlors(params).subscribe(
      parlors => {
        this.parlors = parlors;
        // In a real app with a proper API, we'd get the total count from the response
        // For now, we'll just assume there are more if we got a full page
        this.totalParlors = Math.max((this.currentPage + 1) * this.pageSize, parlors.length);
        this.loading = false;
      },
      error => {
        console.error('Error loading parlors', error);
        this.error = true;
        this.loading = false;
      }
    );
  }

  loadSponsored(): void {
    this.parlorService.getSponsoredParlors().subscribe(
      parlors => {
        this.sponsoredParlors = parlors;
      },
      error => {
        console.error('Error loading sponsored parlors', error);
      }
    );
  }

  loadMyParlors(): void {
    this.loading = true;
    this.error = false;
    
    const ownerId = this.authService.getCurrentUserId();
    if (!ownerId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.parlorService.getParlorsByOwnerId(ownerId).subscribe(
      parlors => {
        this.parlors = parlors;
        this.loading = false;
      },
      error => {
        console.error('Error loading your parlors', error);
        this.error = true;
        this.loading = false;
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
        country: filterData.location.country || null
      },
      queryParamsHandling: 'merge'
    });
    
    this.loadParlors();
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadParlors();
  }

  createNewParlor(): void {
    // In a real app, navigate to parlor creation form
    alert('Navigate to parlor creation form');
  }
}
