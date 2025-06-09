import { Component } from '@angular/core';
import { UserService } from '../../../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  imports: [RouterModule, FormsModule, CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {

  courses: any[] = [];
  semesters: any[] = [];
  selectedSemester: string =''
  role: string | null = null;
  defaultSem: boolean = false
  defaultSemester: any = null

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private userService: UserService){}

   ngOnInit(): void {
    this.fetchCourse();
    this.fetchSemesters()
    this.role = this.userService.getRole()
  }

  fetchCourse() {
    this.http.get<any[]>('http://localhost:5048/courses/getCourses')
      .subscribe({
        next: (data) =>{
            this.courses = data
        },
        error: (err) =>{
          console.log('Error:', err)
        }
      });
  }

  isAdmin(): boolean{
    return this.role === 'Admin'
  }

  fetchSemesters() {
  this.http.get(`http://localhost:5048/settings/getSemester`).subscribe({
    next: (data: any) => {
      this.semesters = data;
      const defaultSem = this.semesters.find(sem => sem.isDefault);
      if (defaultSem) {
        this.defaultSemester = defaultSem; 
        this.selectedSemester = defaultSem._id;
      } else {
        this.defaultSemester = null;
      }
    },
    error: (err) => {
      console.log('Error: ', err);
    }
  });
}

  get isDefaultSem() : boolean{
    return this.semesters.some(sem => sem.isDefault)
  }

  get filteredCourses(){
    const userId = this.userService.getCurrentUser()

    if(!this.selectedSemester || !userId?.name) return []

    return this.courses.filter(course => {
      const courseSemester = typeof course.semester === 'string' ? course.semester : course.semester?._id
      const sameSem = courseSemester === this.selectedSemester
      const isSameTeacher = course.teacher?.some((t:any) => t.name === userId.name)
/*       console.log(`[DEBUG] Course: ${course.courseTitle}`);
      console.log(`  Semester Match: ${sameSem}`);
      console.log(`  Teacher Match: ${isSameTeacher}`); */

    return sameSem && isSameTeacher;
    })
  }

}