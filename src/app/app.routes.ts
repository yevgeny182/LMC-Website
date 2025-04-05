import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { LayoutComponent } from './layout/layout.component';
import { CareerPathComponent } from './career-path/career-path.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 

     { path: 'login', component: AppComponent },
    {
        path: '',
        component: LayoutComponent,
        children: [
         /*  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, */
          { path: 'dashboard', component: DashboardComponent },
          { path: 'users', component: UsersComponent },
          { path: 'career', component: CareerPathComponent },
          { path: '**', redirectTo: 'dashboard' }
        ]
      },
    
];


