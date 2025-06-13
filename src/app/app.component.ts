import { ChangeDetectorRef, Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from './layout/layout.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, LayoutComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  passwordFieldType: string = 'password';
  isModalOpen: boolean = false;
  name: string = '';
  email: string = '';
  password: string = '';
  user: any;
  progressSubscritption?: Subscription;
  routeSubscription?: Subscription;
  progress: number = 0
  paused: boolean = false;
  manualPause: boolean = false
  isUrl: boolean = false;
  enableAnimation = false;
  currentIndex = 0

    images = [
      { src: 'assets/teachingimage_1.svg', location: 'Insert Location Here', showLocation: true },
      { src: 'assets/teachingimage_2.svg', location: 'Insert Location Here', showLocation: true },
      { src: 'assets/teachingimage_3.svg', location: '', showLocation: false },
      { src: 'assets/teachingimage_4.svg', location: '', showLocation: false},
      { src: 'assets/santamonicapier.jpg', location: 'Santa Monica, CA, USA', showLocation: true},
    ];

  imageIndex: number = 0;
  currentImage = this.images[0].src;

private animateSlideChange() {
  this.enableAnimation = true;
  setTimeout(() => {
    this.enableAnimation = false;
  }, 500); // match CSS transition time
}

  constructor(
    private router: Router, 
    private snackBar: MatSnackBar, 
    private ngZone: NgZone,
  ) {}

    ngOnInit(): void {
        this.routeSubscription = this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
          const url = event.urlAfterRedirects;
          this.endSlideShow();
          this.isUrl = url.includes('/login');
          if (this.isUrl) {
            this.startSlideShow();
          }
        });

        
  // Handle initial load
      const initialUrl = this.router.url;
      this.isUrl = initialUrl.includes('/login');
      if (initialUrl.includes('/login')) {
        this.startSlideShow();
      }
    }


  startSlideShow() {
    if (this.progressSubscritption){
      return;
    } 
    this.progress = 0
    this.ngZone.runOutsideAngular(() => {
      this.progressSubscritption = interval(50).subscribe(() => {
        if (this.paused) return;
        this.ngZone.run(() => {
          this.progress += 1;
          if (this.progress >= 100) {
            this.progress = 0;
            this.nextImage();
          }
        });
      });
    });
  }
  endSlideShow() {
    this.progressSubscritption?.unsubscribe();
    this.progressSubscritption = undefined;
    this.progress = 0;
  }


  nextImage(){
    this.imageIndex = (this.imageIndex + 1) % this.images.length
    this.currentImage = this.images[this.imageIndex].src
    this.animateSlideChange();
    this.progress = 0
    /* console.log(this.currentImage) */
  }
  togglePause(){
    this.manualPause = !this.manualPause
    this.paused = this.manualPause
  }

  ngOnDestroy(): void {
    this.progressSubscritption?.unsubscribe()
    this.endSlideShow()
  }

  nextSlide() {
  if (this.imageIndex < this.images.length - 1) {
    this.imageIndex++;
  }else{
    this.imageIndex = 0
  }
    this.currentImage = this.images[this.imageIndex].src;
    this.animateSlideChange();
    this.progress = 0;
}

prevSlide() {
  if (this.imageIndex > 0) {
    this.imageIndex--;
  }else{
    this.imageIndex = this.images.length - 1
  }
  this.currentImage = this.images[this.imageIndex].src;
    this.animateSlideChange();
    this.progress = 0;
}


  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  openModal() {
    this.isModalOpen = true;
    console.log('Modal opened:', this.isModalOpen);
  }

  closeModal() {
    this.isModalOpen = false;
    console.log('Modal closed:', this.isModalOpen);
  }

  onLogin() {
    fetch('http://localhost:5048/LoginUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: this.email, password: this.password })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed: ' + response.statusText);
        }
        return response.json();
      })
      .then(user => {
        if(user.user.status === false){
          this.snackBar.open('Login failed: Your account is inactive.', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
          });
          this.password = '';
          return;
        } else {
          this.user = user;
          sessionStorage.setItem('user', JSON.stringify(user));
          if(user.user.role === 'Admin'){
            this.snackBar.open(`Welcome admin!  [${user.user.name}]`, 'Close', {
              duration: 4000,
              panelClass: ['snack-success'],
            });
            this.router.navigate(['/dashboard']);
          } else {
            this.snackBar.open(`Welcome student!  [${user.user.name}]`, 'Close', {
              duration: 4000,
              panelClass: ['snack-success'],
            });
            this.router.navigate(['/dashboard']);
          }
        }
      })
      .catch(err => {
        if (!this.email && !this.password) {
          this.snackBar.open('Email and password fields must be filled!', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        } else if (!this.email) {
          this.snackBar.open('Email field must be filled!', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        } else if (!this.password) {
          this.snackBar.open('Password field must be filled!', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        } else {
          console.error('Login failed:', err);
          this.snackBar.open('Login failed: Enter your correct username and password!', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
          });
        }
        this.password = '';
      });
  }

  onLogout() {
    this.user = null;
    this.router.navigate(['/login']);
  }
}
