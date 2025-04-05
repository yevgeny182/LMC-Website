import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invite-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-user-modal.component.html',
  styleUrls: ['./invite-user-modal.component.scss']
})
export class InviteUserModalComponent {
  @Input() isOpenInviteModal: boolean = true;
  @Output() closeModalEvent = new EventEmitter<void>(); 
  @Output() userAddedEvent = new EventEmitter<void>(); 
  @Input() userToEdit: any = null;
  @Output() userUpdatedEvent = new EventEmitter<void>()

  constructor(private snackBar: MatSnackBar) {}
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
      alert('Please fill in all fields.');
      return;
    }

    fetch('http://localhost:5048/RegisterUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      console.log('User added:', data);
      this.resetForm();
      this.userAddedEvent.emit();
      this.closeModal();
      
      this.snackBar.open('User added successfully!', 'Close', {
        duration: 3000, // Duration in milliseconds
        panelClass: ['snack-success'], // Custom class for styling
      });
      
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Something went wrong');
    });
  }

 
}
