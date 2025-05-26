import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InviteUserModalComponent } from '../invite-user-modal/invite-user-modal.component';
import { UpdateUserModalComponent } from '../update-user-modal/update-user-modal.component';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterModule, InviteUserModalComponent, CommonModule,  UpdateUserModalComponent, FormsModule],
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
  searchUser: string = ''
  filteredUsers: any[] = []
  selectedFilter: string = 'name'


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
        this.filteredUsers = data
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

  openConfirmViewModal(user: any){
    this.userToView = user;
    this.isOpenViewModal = true;
  }
  closeConfirmViewModal(){
    this.isOpenViewModal = false;
  }

  openUpdateModal(user: any) {

    this.userToEdit = user;
    this.isOpenEditModal = true; 
    console.log(this.isOpenEditModal)
  }

  closeUpdateModal() {
    this.isOpenEditModal = false; 
    this.userToEdit = null; 
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
        
        return response.json().then(data => {
            console.log('Response data:', data); 
        });
    })
    .then(() => {
        console.log('User deleted successfully');
        this.loadUsers(); 
        this.closeConfirmDeleteModal(); 
        this.snackBar.open('User deleted successfully!', 'Close', {
          duration: 3000, 
          panelClass: ['snack-success'], 
      });
    })
    .catch(err => {
        console.error('Error deleting user:', err);
        this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['snack-error'], 
      });
    });
}

  get paginatedUsers() {
    const filtered = this.searchUser.trim()
    ? this.users.filter(user => {
        const value = user[this.selectedFilter]?.toLowerCase?.() || '';
        return value.includes(this.searchUser.toLowerCase());
      })
    : this.users;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage)
  }

  get totalPages(){
    const filtered = this.searchUser.trim()
    ? this.users.filter(user => {
        const value = user[this.selectedFilter]?.toLowerCase?.() || '';
        return value.includes(this.searchUser.toLowerCase());
      })
    : this.users;

  return Math.ceil(filtered.length / this.itemsPerPage);
  }

  get totalArrayPages(){
    return Array(this.totalPages).fill(0).map((_, i) => i + 1)
  }
  goToPage(page: number){
    if(page >= 1 && page <= this.totalPages){
      this.currentPage = page
    }
  }

  onSearch() {
    this.currentPage = 1
  }



}
