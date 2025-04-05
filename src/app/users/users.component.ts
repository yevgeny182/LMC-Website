import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InviteUserModalComponent } from '../invite-user-modal/invite-user-modal.component';
import { UpdateUserModalComponent } from '../update-user-modal/update-user-modal.component';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  imports: [RouterModule, InviteUserModalComponent, CommonModule,  UpdateUserModalComponent ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  users: any[] = [];
  userToDelete: any = null;
  userToView: any = null;
  userToEdit: any = null;
  isOpenDeleteModal: boolean = false;
  isOpenViewModal: boolean = false;
  isOpenInviteModal: boolean = false;
  isOpenUpdateModal: boolean = false;
  isOpenEditModal: boolean = false;


  constructor(private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadUsers();
  }

  openInviteModal() {
    this.isOpenInviteModal = true;
    console.log(this.isOpenInviteModal)
  }

  closeInviteModal() {
    this.isOpenInviteModal = false;
  }


  loadUsers() {
    fetch('http://localhost:5048/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network error');
        }
        return response.json();
      })
      .then(data => {
        this.users = data;
      })
      .catch(err => {
        console.error('Error fetching data', err);
      });
  }

  //deleting trash icon
  openConfirmDeleteModal(user: any) {
    this.userToDelete = user; 
    this.isOpenDeleteModal = true; 
  }

  closeConfirmDeleteModal() {
    this.isOpenDeleteModal = false; 
    this.userToDelete = null; 
  }

  //viewing eye icon
  openConfirmViewModal(user: any){
    this.userToView = user;
    this.isOpenViewModal = true;
  }
  closeConfirmViewModal(){
    this.isOpenViewModal = false;
  }

  //updating
  openUpdateModal(user: any) {
    console.log('Editing user:', user);
    this.userToEdit = user;
    this.isOpenEditModal = true; 
    console.log(this.isOpenEditModal)
  }

  closeUpdateModal() {
    this.isOpenEditModal = false; // Close the update modal
    this.userToEdit = null; // Clear the user to edit
  }


  deleteUsers() {
    if (!this.userToDelete) return; 
    fetch(`http://localhost:5048/users/${this.userToDelete._id}`, {
        method: 'DELETE',
    })
    .then(response => {
 
        if (!response.ok) {
            throw new Error(`Failed to delete user. Status code: ${response.status}`);
        }
        
        // Check if response returns any body
        return response.json().then(data => {
            console.log('Response data:', data); // Log any response data
        });
    })
    .then(() => {
        console.log('User deleted successfully');
        this.loadUsers(); // Refresh the user list
        this.closeConfirmDeleteModal(); // Close the confirmation modal
        this.snackBar.open('User deleted successfully!', 'Close', {
          duration: 3000, // Duration in milliseconds
          panelClass: ['snack-success'], // Custom class for styling
      });
    })
    .catch(err => {
        console.error('Error deleting user:', err);
        this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['snack-error'], // Optional: create a different class for error styling
      });
    });
}

}
