import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { ParlorService } from '../../../core/services/parlor.service';
import { GuestspotService } from '../../../core/services/guestspot.service';
import { InstagramService } from '../../../core/services/instagram.service';
import { Artist } from '../../../core/models/artist.model';
import { ParlorListItem } from '../../../core/models/parlor.model';
import { GuestspotListItem } from '../../../core/models/guestspot.model';
import { InstagramFeed } from '../../../core/services/instagram.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewTargetType } from '../../../core/models/review.model';

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.scss']
})
export class ArtistDetailComponent implements OnInit {
  artistId: string = '';
  artist: Artist | null = null;
  homeParlor: ParlorListItem | null = null;
  guestspots: GuestspotListItem[] = [];
  instagramFeed: InstagramFeed | null = null;
  reviewTargetType = ReviewTargetType.ARTIST;
  loading = {
    artist: true,
    homeParlor: false,
    guestspots: true,
    instagram: true
  };
  error = {
    artist: false,
    homeParlor: false,
    guestspots: false,
    instagram: false
  };
  isCurrentUser = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private artistService: ArtistService,
    private parlorService: ParlorService,
    private guestspotService: GuestspotService,
    private instagramService: InstagramService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.artistId = params['id'];
      this.loadArtistData();
    });
  }

  loadArtistData(): void {
    // Load artist details
    this.loading.artist = true;
    this.artistService.getArtistById(this.artistId).subscribe(
      artist => {
        this.artist = artist;
        this.loading.artist = false;
        
        // Check if current user is the artist
        const currentUserId = this.authService.getCurrentUserId();
        this.isCurrentUser = currentUserId === artist.userId;
        
        // Load other related data
        this.loadHomeParlor();
        this.loadGuestspots();
        this.loadInstagramFeed();
      },
      error => {
        console.error('Error loading artist details', error);
        this.error.artist = true;
        this.loading.artist = false;
      }
    );
  }

  loadHomeParlor(): void {
    if (this.artist && this.artist.availability && this.artist.availability.homeParlorId) {
      this.loading.homeParlor = true;
      this.parlorService.getParlorById(this.artist.availability.homeParlorId).subscribe(
        parlor => {
          this.homeParlor = {
            id: parlor.id,
            name: parlor.name,
            featuredImage: parlor.images[0] || '',
            location: {
              city: parlor.location.city,
              state: parlor.location.state,
              country: parlor.location.country
            },
            rating: parlor.rating,
            featured: parlor.featured,
            sponsored: parlor.sponsored
          };
          this.loading.homeParlor = false;
        },
        error => {
          console.error('Error loading home parlor', error);
          this.error.homeParlor = true;
          this.loading.homeParlor = false;
        }
      );
    }
  }

  loadGuestspots(): void {
    this.loading.guestspots = true;
    this.guestspotService.getGuestspotsByArtistId(this.artistId).subscribe(
      guestspots => {
        this.guestspots = guestspots;
        this.loading.guestspots = false;
      },
      error => {
        console.error('Error loading artist guestspots', error);
        this.error.guestspots = true;
        this.loading.guestspots = false;
      }
    );
  }

  loadInstagramFeed(): void {
    if (this.artist && this.artist.social && this.artist.social.instagram) {
      this.loading.instagram = true;
      this.instagramService.getArtistFeed(this.artistId).subscribe(
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

  contactArtist(): void {
    // In a real app, this might open a dialog or message form
    if (this.artist) {
      alert(`Contact ${this.artist.name} via email or through their social media accounts.`);
    }
  }

  editProfile(): void {
    // In a real app, navigate to edit form
    this.router.navigate(['/profile'], { queryParams: { edit: 'artist' } });
  }

  viewGuestspots(): void {
    this.router.navigate(['/guestspots'], { queryParams: { artistId: this.artistId } });
  }

  applyForGuestspot(): void {
    this.router.navigate(['/guestspots'], { queryParams: { status: 'open' } });
  }
}
