import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InviteUserModalComponent } from '../invite-user-modal/invite-user-modal.component';
import { UpdateUserModalComponent } from '../update-user-modal/update-user-modal.component';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterModule, InviteUserModalComponent, CommonModule,  UpdateUserModalComponent],
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
  isOpenEditModal: boolean = false;
  currentPage: number = 1
  itemsPerPage: number = 8


  constructor(private router: Router, private snackBar: MatSnackBar, private http: HttpClient) {}

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
    this.http.get<any[]>('http://localhost:5048/users').subscribe(
      (data) => {
        this.users = data;
      },
      (err) => {
        console.error('Error fetching data', err);
      }
    );
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

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(){
    return Math.ceil(this.users.length / this.itemsPerPage)
  }

  get totalArrayPages(){
    return Array(this.totalPages).fill(0).map((_, i) => i + 1)
  }
  goToPage(page: number){
    if(page >= 1 && page <= this.totalPages){
      this.currentPage = page
    }
  }


}
