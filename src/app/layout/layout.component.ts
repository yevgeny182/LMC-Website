import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'] // fixed styleUrl -> styleUrls
})
export class LayoutComponent implements OnInit {
  @Input() user: any;
  email: string = '';
  password: string = '';
  isSidebarClosed: boolean = false;

  @ViewChild('sidebarRef') sidebarRef!: ElementRef;
  @ViewChild('mainContentRef') mainContentRef!: ElementRef;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if(typeof window !== 'undefined'){
      const storedUser = sessionStorage.getItem('user')
      if(!storedUser){
        this.router.navigate(['/login'])
        return
      }
      try{
        this.user = JSON.parse(storedUser)
        const name = this.user?.user?.name
        const role = this.user?.user?.role
        const status = this.user?.user?.status
        //user cannot bypass login screen by manipulating URL
        if(!status || !name || !role){
          this.router.navigate(['/login'])
          return
        }
        
      }catch (error) {
        console.error('Error: parsing user data', error)
        this.router.navigate(['/login'])
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      console.log('[LayoutComponent] Received user data from AppComponent:', changes['user']?.currentValue);
    }
  }

  toggleSidebar(): void {
    this.sidebarRef?.nativeElement.classList.toggle('collapsed', this.isSidebarClosed);
    this.mainContentRef?.nativeElement.classList.toggle('collapsed', this.isSidebarClosed);
    this.isSidebarClosed = !this.isSidebarClosed; // toggle the state of the sidebar
  }

  onLogout(): void {
    sessionStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/login']);
  }
}
