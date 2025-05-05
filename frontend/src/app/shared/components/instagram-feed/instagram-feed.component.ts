import { Component, OnInit, Input } from '@angular/core';
import { InstagramService } from '../../../core/services/instagram.service';

export interface InstagramMedia {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

@Component({
  selector: 'app-instagram-feed',
  templateUrl: './instagram-feed.component.html',
  styleUrls: ['./instagram-feed.component.scss']
})
export class InstagramFeedComponent implements OnInit {
  @Input() artistId?: string;
  @Input() parlorId?: string;
  @Input() limit: number = 6;
  
  media: InstagramMedia[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private instagramService: InstagramService) { }

  ngOnInit(): void {
    this.loadInstagramFeed();
  }

  loadInstagramFeed(): void {
    this.loading = true;
    this.error = null;

    if (this.artistId) {
      this.instagramService.getArtistFeed(this.artistId, this.limit).subscribe({
        next: (result) => {
          this.media = result;
          this.loading = false;
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else if (this.parlorId) {
      this.instagramService.getParlorFeed(this.parlorId, this.limit).subscribe({
        next: (result) => {
          this.media = result;
          this.loading = false;
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else {
      this.error = 'No artist or parlor ID provided';
      this.loading = false;
    }
  }

  private handleError(error: any): void {
    console.error('Instagram feed error:', error);
    this.error = 'Unable to load Instagram feed. Please try again later.';
    this.loading = false;
  }
}