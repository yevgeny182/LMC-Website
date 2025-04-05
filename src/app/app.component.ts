import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from './layout/layout.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, LayoutComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  passwordFieldType: string = 'password';
  isModalOpen: boolean = false;
  name: string = '';
  email: string = '';
  password: string = '';
  user: any;

  constructor(private router: Router, private snackBar: MatSnackBar) {}

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
          this.openToast('Login failed: Your account is inactive.');
          this.password = '' // Show a message if the status is false
          return;
        }else{
          console.log('[AppComponent] Logged in user:', user);
          this.user = user;
          sessionStorage.setItem('user', JSON.stringify(user));
          this.router.navigate(['/dashboard']);
        }
        
      })
      .catch(err => {
        console.error('Login failed:', err);
        this.openToast('Login Failed: Username and password are incorrect.');
        this.password = '';
      });
  }

  onLogout() {
    this.user = null;
    this.router.navigate(['/login']);
  }

  openToast(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right'
    });
  }
}
