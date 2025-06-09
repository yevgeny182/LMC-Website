import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../user.service';
/* import { NotificationService } from '../services/notification.service'; */

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
    showModalAdmins: boolean = false
    searchTerm: string = ''
    filteredUsers: any[] = []
    filteredUsersAdmin: any[] = []
    selectedAdminId: string | null = null;
    teacher: any = null;
    role: string | null = null

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
      this.role = this.userService.getRole()
    }

    fetchCourseById(id: string){
      this.http.get<any>(`http://localhost:5048/courses/getCourse/${id}`).subscribe({
        next: (data) => {
          this.selectedCourse = data;
       /* for(let i = 0; i < this.selectedCourse.teacher.length; i++){  
          console.log(this.selectedCourse.teacher[i]?.name)
          } */
        },
        error: (err) =>{
          console.error('Error: ', err);
        }
      });
    }
    get displayedUsers(): User[]{
      if(this.isAdmin()){
        return this.filteredUsers; //show all students as ADMIN
      }else if(this.isStudent()){
        //students will see their own names and can enroll themselves
        return this.filteredUsers.filter(user => user._id === this.userService.getCurrentUser()._id); 
      }
      return [] //return empty array if role is undefined
    }
    fetchUsers(){
      this.http.get<any>(`http://localhost:5048/users`).subscribe({
        next: (data) => {
          this.users = data.filter((user: any) => user?.role === 'Trainee');
          this.filteredUsers = this.users
          this.filteredUsersAdmin = [...this.users]
          if(this.showModalAdmins){
            this.users = data.filter((user: any) => user?.role === 'Admin')
            this.filteredUsersAdmin = this.users
            this.filteredUsers = [...this.users]
          }
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
          /* console.log('Attempting to add user to course UserId:', userId); */
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
        this.showToast(`User has been removed`, 'success');
          this.fetchCourseById(this.courseId!);
      },
      error: (err) =>{
        this.showToast('Error: cannot delete user', 'error')
        console.log(err)
      }
     })
      
    }
    onSearch(){
      const name = this.searchTerm.trim().toLowerCase()
      if(name !== ''){
        if(this.showModalAdmins){
          this.filteredUsersAdmin = this.users.filter(user => user.name.toLowerCase().includes(name))
        }else{
          this.filteredUsers = this.users.filter(user => user.name.toLowerCase().includes(name))
        }
      }else{
        if(this.showModalAdmins){
          this.filteredUsersAdmin = [...this.users]
        }else{
          this.filteredUsers = [...this.users]
        }
      }
    }
    assignAdmin(userId: string){
     const isTeacher = this.selectedCourse?.teacher?.some((teacher: any) => (teacher._id?._id || teacher?._id) === userId )  
     const apiEndpoint = isTeacher ? 
     `http://localhost:5048/courses/${this.courseId}/removeTeacher` : 
     `http://localhost:5048/courses/${this.courseId}/assignTeacher`
     this.http.put(apiEndpoint, {teacherId: userId}).subscribe({
      next: () =>{
        const message = isTeacher ? 'Teacher is now unassigned' : '🎶 She drives me crazy Like no one else, She drives me crazy And I cant help myself🎶' /* Teacher assigned successfully! */ 
        this.showToast(message, 'default')
        this.selectedAdminId = isTeacher ? null : userId
        this.fetchCourseById(this.courseId!)
        /* this.closeModal() */
      },
      error: (err) => {
        this.showToast('Error adding a teacher', 'error')
        console.error('Error in endpoint', err)
      }
     })
    }
    // Checks if the given userId belongs to a teacher assigned to the current course.
    // Since teacher entries might be populated (teacher._id is an object) or just raw IDs (teacher._id is a string),
    // we safely check both cases by trying teacher._id._id first, then fallback to teacher._id.
    // Returns true if the userId matches any teacher in the course, otherwise false.
    isTeacher(userId: string): boolean{
      return this.selectedCourse?.teacher?.some((teacher: any) => (teacher._id._id || teacher._id) === userId) ?? false
    }

    isAdmin(): boolean{
    return this.role === 'Admin'
  }
    isStudent(): boolean{
      return this.role === 'Trainee'
    }
       
    openModal(){
      this.fetchUsers()
      this.showModal = true;
    }
    openModalTeachers(){
      this.showModalAdmins = true;
      this.fetchUsers()
    }
    closeModal(){
      this.showModal = false
      if(this.showModalAdmins)
        this.showModalAdmins = false
    }
    showToast(message: string, type: 'success' | 'error' | 'default'){
      let snackBarClass
      snackBarClass = type === 'success' ? 'snack-success' : 
      snackBarClass = type === 'default' ? 'snack-default' : 'snack-error'
      this.snackBar.open(message, 'Close', {
        duration: 20000,
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
