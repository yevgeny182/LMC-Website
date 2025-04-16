import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { LayoutComponent } from './layout/layout.component';
import { CareerPathComponent } from './career-path/career-path.component';
import { LearningCourseComponent } from './learning-course/learning-course.component';
import { AssessmentsComponent } from './assessments/assessments.component';


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
          { path: 'learning-course', component: LearningCourseComponent},
          { path: 'assessments', component: AssessmentsComponent},
          { path: '**', redirectTo: 'dashboard' }
        ]
      },
    
];


