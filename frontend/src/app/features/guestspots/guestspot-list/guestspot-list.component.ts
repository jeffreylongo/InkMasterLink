import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestspotService } from '../../../core/services/guestspot.service';
import { GuestspotListItem, GuestspotStatus } from '../../../core/models/guestspot.model';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-guestspot-list',
  templateUrl: './guestspot-list.component.html',
  styleUrls: ['./guestspot-list.component.scss']
})
export class GuestspotListComponent implements OnInit {
  guestspots: GuestspotListItem[] = [];
  filteredGuestspots: GuestspotListItem[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Filters
  statusFilter: GuestspotStatus | 'all' = 'all';
  locationFilter: string = '';
  dateFilter: 'upcoming' | 'all' = 'upcoming';
  searchTerm: string = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 9;
  totalSpots = 0;
  
  // For quick reference
  GuestspotStatus = GuestspotStatus;
  
  get totalPages(): number {
    return Math.ceil(this.totalSpots / this.pageSize);
  }
  
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }
  
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize - 1, this.totalSpots - 1);
  }
  
  get paginatedGuestspots(): GuestspotListItem[] {
    return this.filteredGuestspots.slice(this.startIndex, this.startIndex + this.pageSize);
  }

  constructor(
    private guestspotService: GuestspotService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadGuestspots();
    this.handleQueryParams();
  }
  
  private handleQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.statusFilter = params['status'];
      }
      
      if (params['location']) {
        this.locationFilter = params['location'];
      }
      
      if (params['date']) {
        this.dateFilter = params['date'];
      }
      
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      
      if (params['page']) {
        this.currentPage = parseInt(params['page'], 10) || 1;
      }
      
      this.applyFilters();
    });
  }
  
  private loadGuestspots(): void {
    this.isLoading = true;
    this.error = null;
    
    // Check if we need open spots or upcoming spots based on status filter
    if (this.statusFilter === GuestspotStatus.OPEN) {
      this.guestspotService.getOpenGuestspots(100).subscribe({
        next: this.handleGuestspotsLoaded.bind(this),
        error: this.handleError.bind(this)
      });
    } else {
      this.guestspotService.getGuestspots().subscribe({
        next: this.handleGuestspotsLoaded.bind(this),
        error: this.handleError.bind(this)
      });
    }
  }
  
  private handleGuestspotsLoaded(guestspots: GuestspotListItem[]): void {
    this.guestspots = guestspots;
    this.applyFilters();
    this.isLoading = false;
  }
  
  private handleError(error: any): void {
    console.error('Error loading guestspots:', error);
    this.error = 'Failed to load guest spots. Please try again later.';
    this.isLoading = false;
  }
  
  applyFilters(): void {
    // Start with all guestspots
    let filtered = [...this.guestspots];
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(spot => spot.status === this.statusFilter);
    }
    
    // Filter by location
    if (this.locationFilter) {
      const location = this.locationFilter.toLowerCase();
      filtered = filtered.filter(spot => 
        spot.parlorLocation.city.toLowerCase().includes(location) ||
        spot.parlorLocation.state.toLowerCase().includes(location) ||
        spot.parlorLocation.country.toLowerCase().includes(location)
      );
    }
    
    // Filter by date
    if (this.dateFilter === 'upcoming') {
      const today = new Date();
      filtered = filtered.filter(spot => new Date(spot.dateEnd) >= today);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(spot => 
        spot.parlorName.toLowerCase().includes(term) ||
        (spot.artistName && spot.artistName.toLowerCase().includes(term))
      );
    }
    
    this.filteredGuestspots = filtered;
    this.totalSpots = filtered.length;
    
    // Adjust current page if it's now out of bounds
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    // Update URL with filter parameters
    this.updateQueryParams();
  }
  
  private updateQueryParams(): void {
    const queryParams: any = {};
    
    if (this.statusFilter !== 'all') {
      queryParams.status = this.statusFilter;
    }
    
    if (this.locationFilter) {
      queryParams.location = this.locationFilter;
    }
    
    if (this.dateFilter !== 'upcoming') {
      queryParams.date = this.dateFilter;
    }
    
    if (this.searchTerm) {
      queryParams.search = this.searchTerm;
    }
    
    if (this.currentPage > 1) {
      queryParams.page = this.currentPage;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }
  
  resetFilters(): void {
    this.statusFilter = 'all';
    this.locationFilter = '';
    this.dateFilter = 'upcoming';
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateQueryParams();
    }
  }
  
  canCreateGuestspot(): boolean {
    return this.authService.isAuthenticated() && 
           this.authService.hasRole(UserRole.PARLOR_OWNER);
  }
  
  canApplyForGuestspot(): boolean {
    return this.authService.isAuthenticated() && 
           this.authService.hasRole(UserRole.ARTIST);
  }
  
  openConfirmationDialog(guestspotId: string, action: 'apply' | 'cancel'): void {
    let title = '';
    let message = '';
    
    if (action === 'apply') {
      title = 'Apply for Guest Spot';
      message = 'Are you sure you want to apply for this guest spot? You will need to provide portfolio examples and other information on the next screen.';
    } else if (action === 'cancel') {
      title = 'Cancel Guest Spot';
      message = 'Are you sure you want to cancel this guest spot? This action cannot be undone.';
    }
    
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { title, message }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (action === 'apply') {
          this.router.navigate(['/guestspots', guestspotId, 'apply']);
        } else if (action === 'cancel') {
          this.cancelGuestspot(guestspotId);
        }
      }
    });
  }
  
  private cancelGuestspot(id: string): void {
    this.guestspotService.cancelGuestspot(id).subscribe({
      next: () => {
        this.snackBar.open('Guest spot cancelled successfully', 'Close', { duration: 3000 });
        this.loadGuestspots();
      },
      error: (error) => {
        console.error('Error cancelling guestspot:', error);
        this.snackBar.open('Failed to cancel guest spot', 'Close', { duration: 3000 });
      }
    });
  }
}