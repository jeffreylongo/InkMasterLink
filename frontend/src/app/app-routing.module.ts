import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'artists', 
    loadChildren: () => import('./features/artists/artists.module').then(m => m.ArtistsModule) 
  },
  { 
    path: 'parlors', 
    loadChildren: () => import('./features/parlors/parlors.module').then(m => m.ParlorsModule) 
  },
  { 
    path: 'guestspots', 
    loadChildren: () => import('./features/guestspots/guestspots.module').then(m => m.GuestspotsModule) 
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'profile', 
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }