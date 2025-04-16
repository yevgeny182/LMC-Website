import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invite-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './invite-user-modal.component.html',
  styleUrls: ['./invite-user-modal.component.scss']
})
export class InviteUserModalComponent {
  @Input() isOpenInviteModal: boolean = true;
  @Output() closeModalEvent = new EventEmitter<void>(); 
  @Output() userAddedEvent = new EventEmitter<void>(); 
  @Input() userToEdit: any = null;
  @Output() userUpdatedEvent = new EventEmitter<void>()

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {}
  name: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  status: boolean | null = null;


  resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.role = '';
    this.status = null;
    this.userToEdit = null;
  }

  closeModal() {
    this.isOpenInviteModal = false;
    this.closeModalEvent.emit();
    this.resetForm();
  }

  ngOnChanges() {
    if (this.userToEdit) {
      this.name = this.userToEdit.name;
      this.email = this.userToEdit.email;
      this.role = this.userToEdit.role;
      this.status = this.userToEdit.status
      this.password = ''; // password is optional in edit
    }
  }
  
  addUser() {
    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role,
    };

    if (!payload.name || !payload.email || !payload.password || !payload.role) {
      this.snackBar.open('Please fill in all fields', 'Close', {
        duration: 4000,
        panelClass: ['snack-error'], 
      });
      return;
    }

   this.http.post('http://localhost:5048/RegisterUser', payload).subscribe({
    next: (data) => {
      this.userAddedEvent.emit()
      this.closeModal()

      this.snackBar.open('User added successfully!', 'Close', {
        duration: 4000,
        panelClass: ['snack-success'],
      });
    },
    error: (err) => {
      console.error('error: ', err)
      this.snackBar.open('Something went wrong', 'Close', {
        duration: 4000,
        panelClass: ['snack-error'],
      })
    }
   })
  }

 
}
