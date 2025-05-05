import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  @Input() filterType: 'artist' | 'parlor' = 'artist';
  @Input() initialFilters: any = {};
  @Output() filterChange = new EventEmitter<any>();
  
  filterForm!: FormGroup;
  
  // Lists for dropdown options
  artistSpecialties: string[] = [
    'Traditional', 
    'Neo-Traditional', 
    'Realism', 
    'Watercolor', 
    'Japanese', 
    'Tribal', 
    'Blackwork', 
    'Dotwork', 
    'New School', 
    'Minimalist'
  ];
  
  parlorAmenities: string[] = [
    'Wheelchair Accessible', 
    'WiFi', 
    'Private Rooms', 
    'Credit Cards Accepted', 
    'Parking', 
    'Custom Design', 
    'Vegan Ink', 
    'Walk-ins Welcome', 
    'TV/Entertainment', 
    'Aftercare Products'
  ];
  
  private destroy$ = new Subject<void>();
  
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.setInitialValues();
    this.listenToFormChanges();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initForm(): void {
    if (this.filterType === 'artist') {
      this.filterForm = this.fb.group({
        searchTerm: [''],
        specialty: [''],
        location: [''],
        featured: [false],
        traveling: [false]
      });
    } else {
      this.filterForm = this.fb.group({
        searchTerm: [''],
        location: [''],
        amenities: [[]],
        featured: [false]
      });
    }
  }
  
  private setInitialValues(): void {
    if (this.initialFilters) {
      Object.keys(this.initialFilters).forEach(key => {
        if (this.filterForm.get(key)) {
          this.filterForm.get(key)?.setValue(this.initialFilters[key]);
        }
      });
    }
  }
  
  private listenToFormChanges(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(values => {
        // Remove empty values
        const filters = Object.entries(values)
          .reduce((acc: any, [key, value]) => {
            // Don't include empty strings, arrays, or false boolean values
            if (
              (typeof value === 'string' && value !== '') || 
              (Array.isArray(value) && value.length > 0) ||
              (typeof value === 'boolean' && value === true)
            ) {
              acc[key] = value;
            }
            return acc;
          }, {});
          
        this.filterChange.emit(filters);
      });
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      location: '',
      specialty: '',
      amenities: [],
      featured: false,
      traveling: false
    });
    
    // Remove properties that don't apply to the current filter type
    if (this.filterType === 'artist') {
      delete this.filterForm.value.amenities;
    } else {
      delete this.filterForm.value.specialty;
      delete this.filterForm.value.traveling;
    }
    
    this.filterChange.emit({});
  }
}