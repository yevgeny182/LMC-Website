import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss' ,
})

export class DashboardComponent {
  constructor(private router: Router){}


   toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
    document.getElementById('mainContent')?.classList.toggle('collapsed');
  }

  logout(){
    this.router.navigate(['/'])
    localStorage.removeItem('auth_token');
  }
 
}
