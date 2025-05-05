import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParlorService } from '../../../core/services/parlor.service';
import { ArtistService } from '../../../core/services/artist.service';
import { GuestspotService } from '../../../core/services/guestspot.service';
import { InstagramService } from '../../../core/services/instagram.service';
import { Parlor } from '../../../core/models/parlor.model';
import { ArtistListItem } from '../../../core/models/artist.model';
import { GuestspotListItem } from '../../../core/models/guestspot.model';
import { InstagramFeed } from '../../../core/services/instagram.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewTargetType } from '../../../core/models/review.model';

@Component({
  selector: 'app-parlor-detail',
  templateUrl: './parlor-detail.component.html',
  styleUrls: ['./parlor-detail.component.scss']
})
export class ParlorDetailComponent implements OnInit {
  parlorId: string = '';
  parlor: Parlor | null = null;
  artists: ArtistListItem[] = [];
  guestspots: GuestspotListItem[] = [];
  instagramFeed: InstagramFeed | null = null;
  reviewTargetType = ReviewTargetType.PARLOR;
  loading = {
    parlor: true,
    artists: true,
    guestspots: true,
    instagram: true
  };
  error = {
    parlor: false,
    artists: false,
    guestspots: false,
    instagram: false
  };
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private parlorService: ParlorService,
    private artistService: ArtistService,
    private guestspotService: GuestspotService,
    private instagramService: InstagramService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.parlorId = params['id'];
      this.loadParlorData();
    });
  }

  loadParlorData(): void {
    // Load parlor details
    this.loading.parlor = true;
    this.parlorService.getParlorById(this.parlorId).subscribe(
      parlor => {
        this.parlor = parlor;
        this.loading.parlor = false;
        
        // Check if current user is owner
        const currentUserId = this.authService.getCurrentUserId();
        this.isOwner = currentUserId === parlor.ownerId;
        
        // Load other related data
        this.loadArtists();
        this.loadGuestspots();
        this.loadInstagramFeed();
      },
      error => {
        console.error('Error loading parlor details', error);
        this.error.parlor = true;
        this.loading.parlor = false;
      }
    );
  }

  loadArtists(): void {
    this.loading.artists = true;
    this.artistService.getArtistsByParlorId(this.parlorId).subscribe(
      artists => {
        this.artists = artists;
        this.loading.artists = false;
      },
      error => {
        console.error('Error loading parlor artists', error);
        this.error.artists = true;
        this.loading.artists = false;
      }
    );
  }

  loadGuestspots(): void {
    this.loading.guestspots = true;
    this.guestspotService.getGuestspotsByParlorId(this.parlorId).subscribe(
      guestspots => {
        this.guestspots = guestspots;
        this.loading.guestspots = false;
      },
      error => {
        console.error('Error loading parlor guestspots', error);
        this.error.guestspots = true;
        this.loading.guestspots = false;
      }
    );
  }

  loadInstagramFeed(): void {
    if (this.parlor && this.parlor.social && this.parlor.social.instagram) {
      this.loading.instagram = true;
      this.instagramService.getParlorFeed(this.parlorId).subscribe(
        feed => {
          this.instagramFeed = feed;
          this.loading.instagram = false;
        },
        error => {
          console.error('Error loading Instagram feed', error);
          this.error.instagram = true;
          this.loading.instagram = false;
        }
      );
    } else {
      this.loading.instagram = false;
    }
  }

  openContactInfo(): void {
    // In a real app, this might open a dialog
    if (this.parlor) {
      alert(`Contact ${this.parlor.name}:\nPhone: ${this.parlor.contact.phone}\nEmail: ${this.parlor.contact.email}`);
    }
  }

  createGuestspot(): void {
    this.router.navigate(['/guestspots/create'], { queryParams: { parlorId: this.parlorId } });
  }

  editParlor(): void {
    // In a real app, navigate to edit form
    alert('Navigate to parlor edit form');
  }

  getDirections(): void {
    if (this.parlor) {
      const address = encodeURIComponent(
        `${this.parlor.location.address}, ${this.parlor.location.city}, ${this.parlor.location.state}, ${this.parlor.location.postalCode}`
      );
      window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
    }
  }
}
