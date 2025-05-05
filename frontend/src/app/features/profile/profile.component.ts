import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ArtistService } from '../../core/services/artist.service';
import { ParlorService } from '../../core/services/parlor.service';
import { InstagramService } from '../../core/services/instagram.service';
import { User, UserRole } from '../../core/models/user.model';
import { Artist } from '../../core/models/artist.model';
import { Parlor } from '../../core/models/parlor.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  artistForm: FormGroup | null = null;
  parlorForm: FormGroup | null = null;
  
  userProfile: User | null = null;
  artistProfile: Artist | null = null;
  parlors: Parlor[] = [];
  
  loading = {
    user: true,
    artist: false,
    parlors: false,
    saving: false,
    instagram: false
  };
  
  error = {
    user: false,
    artist: false,
    parlors: false,
    instagram: false
  };
  
  isNewUser = false;
  activeTab = 0;
  
  specialties = [
    'Traditional',
    'Neo-traditional',
    'Realism',
    'Watercolor',
    'Japanese',
    'Blackwork',
    'Tribal',
    'New School',
    'Dotwork',
    'Geometric',
    'Illustrative',
    'Minimalist',
    'Portrait',
    'Lettering',
    'Biomechanical'
  ];
  
  selectedSpecialties: string[] = [];
  
  amenities = [
    'WiFi',
    'Parking',
    'Credit Cards Accepted',
    'Private Rooms',
    'Wheelchair Accessible',
    'Custom Designs',
    'Walk-ins Welcome',
    'Aftercare Products',
    'LGBT Friendly',
    'Piercings',
    'Vegan Inks Available',
    'TV/Entertainment',
    'Consultations',
    'Gift Certificates'
  ];
  
  selectedAmenities: string[] = [];
  
  instagramConnected = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private artistService: ArtistService,
    private parlorService: ParlorService,
    private instagramService: InstagramService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Initialize base profile form
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      bio: [''],
      location: this.fb.group({
        city: [''],
        state: [''],
        country: ['']
      }),
      social: this.fb.group({
        instagram: [''],
        website: [''],
        facebook: ['']
      })
    });
  }

  ngOnInit(): void {
    // Check if this is new user setup
    this.route.queryParams.subscribe(params => {
      if (params['setup'] === 'new') {
        this.isNewUser = true;
      }
      
      // Check if we should create a parlor
      if (params['createParlor']) {
        this.activeTab = 1; // Switch to parlor tab
      }
    });
    
    // Get current user and load profiles
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile();
        
        // Initialize appropriate forms based on user role
        if (user.role === UserRole.ARTIST) {
          this.initArtistForm();
          this.loadArtistProfile();
        } else if (user.role === UserRole.PARLOR_OWNER) {
          this.initParlorForm();
          this.loadParlors();
        }
      } else {
        this.loading.user = false;
      }
    });
  }

  loadUserProfile(): void {
    if (!this.currentUser) return;
    
    this.userProfile = this.currentUser;
    
    // Populate basic profile form
    this.profileForm.patchValue({
      name: this.userProfile.profile.name,
      bio: this.userProfile.profile.bio || '',
      location: {
        city: this.userProfile.profile.location?.city || '',
        state: this.userProfile.profile.location?.state || '',
        country: this.userProfile.profile.location?.country || ''
      },
      social: {
        instagram: this.userProfile.profile.social?.instagram || '',
        website: this.userProfile.profile.social?.website || '',
        facebook: this.userProfile.profile.social?.facebook || ''
      }
    });
    
    this.loading.user = false;
  }

  initArtistForm(): void {
    this.artistForm = this.fb.group({
      specialty: [[]],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      availability: this.fb.group({
        travelWilling: [false],
        travelPreferences: this.fb.group({
          distance: [0],
          cities: [[]],
          states: [[]],
          countries: [[]]
        })
      })
    });
  }

  initParlorForm(): void {
    this.parlorForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        postalCode: ['', Validators.required]
      }),
      contact: this.fb.group({
        phone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        website: ['']
      }),
      hours: this.fb.group({
        monday: ['Closed'],
        tuesday: ['Closed'],
        wednesday: ['Closed'],
        thursday: ['Closed'],
        friday: ['Closed'],
        saturday: ['Closed'],
        sunday: ['Closed']
      }),
      amenities: [[]]
    });
  }

  loadArtistProfile(): void {
    if (!this.currentUser || !this.artistForm) return;
    
    this.loading.artist = true;
    
    this.artistService.getArtistByUserId(this.currentUser.id).subscribe(
      artist => {
        this.artistProfile = artist;
        this.selectedSpecialties = artist.specialty || [];
        
        this.artistForm?.patchValue({
          specialty: artist.specialty,
          experienceYears: artist.experienceYears,
          availability: {
            travelWilling: artist.availability?.travelWilling || false,
            travelPreferences: {
              distance: artist.availability?.travelPreferences?.distance || 0,
              cities: artist.availability?.travelPreferences?.cities || [],
              states: artist.availability?.travelPreferences?.states || [],
              countries: artist.availability?.travelPreferences?.countries || []
            }
          }
        });
        
        this.loading.artist = false;
      },
      error => {
        // If 404, it means the artist profile doesn't exist yet
        if (error.status !== 404) {
          console.error('Error loading artist profile', error);
          this.error.artist = true;
        }
        this.loading.artist = false;
      }
    );
  }

  loadParlors(): void {
    if (!this.currentUser) return;
    
    this.loading.parlors = true;
    
    this.parlorService.getParlorsByOwnerId(this.currentUser.id).subscribe(
      parlors => {
        // Get full parlor details for each parlor
        const parlorPromises = parlors.map(parlor => 
          this.parlorService.getParlorById(parlor.id).toPromise()
        );
        
        Promise.all(parlorPromises)
          .then(detailedParlors => {
            this.parlors = detailedParlors.filter(p => p !== undefined) as Parlor[];
            this.loading.parlors = false;
          })
          .catch(error => {
            console.error('Error loading detailed parlor info', error);
            this.error.parlors = true;
            this.loading.parlors = false;
          });
      },
      error => {
        console.error('Error loading parlors', error);
        this.error.parlors = true;
        this.loading.parlors = false;
      }
    );
  }

  saveUserProfile(): void {
    if (!this.currentUser || this.profileForm.invalid) return;
    
    this.loading.saving = true;
    
    const profileData = {
      profile: {
        ...this.currentUser.profile,
        ...this.profileForm.value
      }
    };
    
    this.authService.updateProfile(this.currentUser.id, profileData).subscribe(
      updatedUser => {
        this.loading.saving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000
        });
      },
      error => {
        console.error('Error updating profile', error);
        this.loading.saving = false;
        this.snackBar.open('Failed to update profile. Please try again.', 'Dismiss', {
          duration: 5000
        });
      }
    );
  }

  saveArtistProfile(): void {
    if (!this.currentUser || !this.artistForm || this.artistForm.invalid) return;
    
    this.loading.saving = true;
    
    const artistData: Partial<Artist> = {
      ...this.artistForm.value,
      userId: this.currentUser.id,
      name: this.profileForm.value.name,
      bio: this.profileForm.value.bio,
      location: this.profileForm.value.location,
      social: this.profileForm.value.social
    };
    
    if (this.artistProfile) {
      // Update existing profile
      this.artistService.updateArtist(this.artistProfile.id, artistData).subscribe(
        updatedArtist => {
          this.artistProfile = updatedArtist;
          this.loading.saving = false;
          this.snackBar.open('Artist profile updated successfully!', 'Close', {
            duration: 3000
          });
        },
        error => {
          console.error('Error updating artist profile', error);
          this.loading.saving = false;
          this.snackBar.open('Failed to update artist profile. Please try again.', 'Dismiss', {
            duration: 5000
          });
        }
      );
    } else {
      // Create new profile
      this.artistService.createArtist(artistData).subscribe(
        newArtist => {
          this.artistProfile = newArtist;
          this.loading.saving = false;
          this.snackBar.open('Artist profile created successfully!', 'Close', {
            duration: 3000
          });
        },
        error => {
          console.error('Error creating artist profile', error);
          this.loading.saving = false;
          this.snackBar.open('Failed to create artist profile. Please try again.', 'Dismiss', {
            duration: 5000
          });
        }
      );
    }
  }

  createParlor(): void {
    if (!this.currentUser || !this.parlorForm || this.parlorForm.invalid) return;
    
    this.loading.saving = true;
    
    const parlorData: Partial<Parlor> = {
      ...this.parlorForm.value,
      ownerId: this.currentUser.id,
      images: [],
      social: this.profileForm.value.social
    };
    
    this.parlorService.createParlor(parlorData).subscribe(
      newParlor => {
        this.loading.saving = false;
        this.parlors.push(newParlor);
        this.snackBar.open('Parlor created successfully!', 'Close', {
          duration: 3000
        });
        
        // Reset form for new parlor
        this.parlorForm?.reset({
          hours: {
            monday: 'Closed',
            tuesday: 'Closed',
            wednesday: 'Closed',
            thursday: 'Closed',
            friday: 'Closed',
            saturday: 'Closed',
            sunday: 'Closed'
          },
          amenities: []
        });
        this.selectedAmenities = [];
      },
      error => {
        console.error('Error creating parlor', error);
        this.loading.saving = false;
        this.snackBar.open('Failed to create parlor. Please try again.', 'Dismiss', {
          duration: 5000
        });
      }
    );
  }

  onSpecialtyChange(specialties: string[]): void {
    this.selectedSpecialties = specialties;
    if (this.artistForm) {
      this.artistForm.patchValue({ specialty: specialties });
    }
  }

  onAmenityChange(amenities: string[]): void {
    this.selectedAmenities = amenities;
    if (this.parlorForm) {
      this.parlorForm.patchValue({ amenities: amenities });
    }
  }

  connectInstagram(): void {
    // In a real app, this would redirect to Instagram auth
    this.snackBar.open('Instagram connection would be initiated here. This is a mock implementation.', 'Close', {
      duration: 5000
    });
  }

  disconnectInstagram(): void {
    if (!this.currentUser) return;
    
    this.loading.instagram = true;
    
    this.instagramService.disconnectInstagram(this.currentUser.id).subscribe(
      () => {
        this.instagramConnected = false;
        this.loading.instagram = false;
        this.snackBar.open('Instagram disconnected successfully', 'Close', {
          duration: 3000
        });
      },
      error => {
        console.error('Error disconnecting Instagram', error);
        this.loading.instagram = false;
        this.snackBar.open('Failed to disconnect Instagram. Please try again.', 'Dismiss', {
          duration: 5000
        });
      }
    );
  }

  // Helper to switch between tabs
  selectTab(index: number): void {
    this.activeTab = index;
  }
}
