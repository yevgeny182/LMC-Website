import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../../../user.service';


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
  role: string = '';
  isSidebarClosed: boolean = false;
  userId: string | null = null;
  showNotifications: boolean = false;
  notifications: any[] = []
  readNotification: any[] = []
  showReadNotification: boolean = false;

  @ViewChild('notificationPopup') notificationPopup!: ElementRef;
  @ViewChild('notificationBellWrapper') notificationBellWrapper!: ElementRef;
  @ViewChild('sidebarRef') sidebarRef!: ElementRef;
  @ViewChild('mainContentRef') mainContentRef!: ElementRef;

  constructor(private router: Router, private notifService: NotificationService, private userService: UserService) {}

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
        const userId = this.user?.user?._id
        //user cannot bypass login screen by manipulating URL
        if(!status || !name || !role){
          this.router.navigate(['/login'])
          return
        }

        this.role = role
        this.userId = userId 
        this.loadNotifications()
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsidePopup = this.notificationPopup?.nativeElement.contains(target);
    const clickedBell = this.notificationBellWrapper?.nativeElement.contains(target);

    if (!clickedInsidePopup && !clickedBell) {
      this.showNotifications = false;
    }
  }

  loadNotifications(): void{
    if(!this.userId) 
      return;
    this.notifService.getNotification(this.userId).subscribe({
      next: (data) =>{
        /* console.log('data here', data) */
        this.notifications = data.filter((seen: any) => !seen.read)
      },
      error: (err) => console.error('Notification error', err)
    })
  }
  markAsRead(notificationId: string): void {
  this.notifService.markAsRead(notificationId).subscribe({
    next: () => {
      this.notifications = this.notifications.filter(n => n._id !== notificationId);
      if(this.showReadNotification && this.readNotification){
          const read = this.notifications.find(n => n._id === notificationId)
          if(read) this.readNotification.push(read) 
      }
    },
    error: (err) => console.error('Error marking notification as read', err)
  });
}
  loadReadNotifications(): void{
    if(!this.userId) return

    this.notifService.getNotification(this.userId).subscribe({
      next: (data) => {
        this.readNotification = data.filter((notif: any) => notif.read)
      },
      error: (err) => {
        console.error('Error loading read notifications')
      }
    })
  }

  toggleNotifications(): void{
    this.showNotifications = !this.showNotifications
    if(this.showNotifications){
      this.loadNotifications()
    }
  }
  viewReadNotifications(): void{
    this.showReadNotification = !this.showReadNotification
    this.showReadNotification ? this.loadReadNotifications() : this.loadNotifications()
  }
  onLogout(): void {
    sessionStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/login']);
  }
}
