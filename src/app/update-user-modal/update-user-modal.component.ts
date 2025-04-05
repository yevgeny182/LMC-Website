import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-update-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-user-modal.component.html',
  styleUrl: './update-user-modal.component.scss'
})
export class UpdateUserModalComponent {
  @Input() isOpenUpdateModal: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>(); 
  @Output() userUpdatedEvent = new EventEmitter<void>(); 
  @Input() userToEdit: any = null;

  name: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  status: boolean | null = null;

  constructor(private snackBar: MatSnackBar) {} 

  private resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.role = '';
    this.status = null; 
    this.userToEdit = null;
  }

  ngOnChanges() {
    if (this.userToEdit) {
      this.name = this.userToEdit.name;
      this.email = this.userToEdit.email;
      this.role = this.userToEdit.role;
      this.status = this.userToEdit.status; 
      this.password = ''; // Do not show the password
    } else {
      this.resetForm();
    }
  }

  closeModal() {
    this.isOpenUpdateModal = false;
    this.closeModalEvent.emit();
    this.resetForm();
  }

  updateUser() {
    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role,
      status: this.status
    };

    const endpoint = `http://localhost:5048/users/${this.userToEdit._id}`;
    fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    })
    .then(() => {
      this.userUpdatedEvent.emit(); // Notify parent to refresh table

      this.closeModal(); // Close the modal
      
      this.snackBar.open('User updated successfully!', 'Close', {
        duration: 3000, // Duration in milliseconds
        panelClass: ['snack-success'], // Custom class for styling
      });
    })
    .catch(err => console.error('Error updating user:', err));
  }
  
}
