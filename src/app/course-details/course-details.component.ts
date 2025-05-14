import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../user.service';

interface User{
  _id: string,
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-course-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})

export class CourseDetailsComponent {
    courseId: string | null = null
    selectedCourse: any = null;
    users: User[] = []
    showModal: boolean = false;
    searchTerm: string = ''
    filteredUsers: any[] = []

    constructor(private route: ActivatedRoute, 
      private http: HttpClient, 
      private router: Router, 
      private snackBar: MatSnackBar,
      private userService: UserService){}

    ngOnInit(): void{
      this.route.paramMap.subscribe(params =>{
        const id = params.get('id')
        if(id)
          this.fetchCourseById(id)
        this.courseId = id
      })
    }

    fetchCourseById(id: string){
      this.http.get<any>(`http://localhost:5048/courses/getCourse/${id}`).subscribe({
        next: (data) => {
          this.selectedCourse = data;
          console.log(this.selectedCourse.semester?.schoolYear)
        },
        error: (err) =>{
          console.error('Error: ', err);
        }
      });
    }
    fetchUsers(){
      this.http.get<any>(`http://localhost:5048/users`).subscribe({
        next: (data) => {
          this.users = data.filter((user: any) => user?.role === 'Trainee');
          this.filteredUsers = this.users
        },
        error: (err) =>{
          console.error('Error: ', err);
        }
      });
    }
    isUserEnrolled(userId: string): boolean {
      return this.selectedCourse?.students?.some((stud: any) => (stud._id?._id || stud._id) === userId) ?? false
    }
    
    addUserstoCourse(userId: string) {
      const currUser = this.userService.getCurrentUser()
      const payload = { userId, addedBy: currUser._id };
      if (this.courseId && userId) {
        if(this.selectedCourse?.students?.length === this.selectedCourse?.population || this.selectedCourse?.courseStatus === 'Closed'){
          const isTrue = this.selectedCourse?.students?.length === this.selectedCourse?.population
          isTrue === true ?  this.showToast('Course is full, adjust the course population!', 'error') : this.showToast('Cannot add students in course,\n\n course status is closed!', 'error')
            return;
        }else{
          console.log('Attempting to add user to course UserId:', userId);
          this.http.post(`http://localhost:5048/courses/${this.courseId}/addUser`, payload).subscribe({
            next: (data) => {
              this.showToast('User added successfully!', 'success');
              if (this.courseId) {
                this.fetchCourseById(this.courseId);
                this.fetchUsers()
              }
            },
            error: (err) => {
              this.showToast('Error adding user to course.', 'error');
              console.log('Error:', err);
            }
          });
        }
      }
    }
    deleteUsersFromCourse(userId: string){
     const courseId = this.courseId
     const currUser = this.userService.getCurrentUser();
     const payload = {userId, addedBy: currUser._id}
     this.http.delete(`http://localhost:5048/courses/${courseId}/removeUser`, { body: payload }).subscribe({
      next: (data) =>{
        console.log(data)
        this.showToast(`User has been removed`, 'error');
          this.fetchCourseById(this.courseId!);
      },
      error: (err) =>{
        this.showToast('Error: cannot delete user', 'error')
        console.log(err)
      }
     })
      
    }
    onSearch(){
      if(this.searchTerm.trim() !== ''){
        this.filteredUsers = this.users.filter(user => user.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      }else{
        this.filteredUsers = this.users
      }
    }
       
    openModal(){
      this.fetchUsers()
      this.showModal = true;
    }
    closeModal(){
      this.showModal = false
    }
    showToast(message: string, type: 'success' | 'error'){
      let snackBarClass = type === 'success' ? 'snack-success' : 'snack-error'
      this.snackBar.open(message, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition:'top',
        panelClass: [snackBarClass]
      })
    }
    toggleUserInCourse(user: any) {
      if (this.isUserEnrolled(user._id)) {
        this.deleteUsersFromCourse(user._id)
        if(this.courseId){
          this.fetchCourseById(this.courseId)
        }
      } else {
        this.addUserstoCourse(user._id);
      }
    }
    goBack(){
      this.router.navigate(['/learning-course'])
    }
}
