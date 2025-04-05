import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
 /*  constructor(private router: Router){} */
 @Input() user:any;
 email: string = '';
 password: string = '';
 constructor(private router: Router) {}
 
 ngOnChanges(changes: SimpleChanges) {
  if (changes['user']) {
    console.log('[LayoutComponent] Received user data from AppComponent:', changes['user']?.currentValue);
  }
}

  toggleSidebar() {
   document.getElementById('sidebar')?.classList.toggle('collapsed');
   document.getElementById('mainContent')?.classList.toggle('collapsed');
 }

 ngOnInit() {
  const storedUser = sessionStorage.getItem('user'); // Retrieve from sessionStorage
  if (storedUser) {
    this.user = JSON.parse(storedUser);
    if(this.user.user.status === false){
      this.router.navigate(['/login']);
    }
    /* console.log('[LayoutComponent] User loaded from sessionStorage:', this.user);
    console.log(this.user.user.name) */
  }
}


 onLogout() {
  this.user = null;
  this.router.navigate(['/login']);
}


}
