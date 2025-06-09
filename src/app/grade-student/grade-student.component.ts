import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-grade-student',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './grade-student.component.html',
  styleUrl: './grade-student.component.scss'
})
export class GradeStudentComponent {
  selectedCourse: any = null;
  courseId: string | null = null;
  gradeForm: FormGroup = new FormGroup({})
  savedBy = ''
  currentUser: string = ''
  formReady = false;

  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute, 
    private formbuild: FormBuilder, private snackBar: MatSnackBar, private userService: UserService){}

  ngOnInit(){
       this.route.paramMap.subscribe(params =>{
        const id = params.get('id')
        if(id){
          this.fetchCourseById(id)
          this.courseId = id
          this.currentUser = this.userService.getCurrentUser()
        }

      })
      
  }

    fetchCourseById(id: string) {
  this.http.get<any>(`http://localhost:5048/courses/getCourse/${id}`).subscribe({
    next: (courseData) => {
      this.selectedCourse = courseData;

      // Step 1: Fetch grades
      this.http.get<any[]>(`http://localhost:5048/grades/studentGrades/${id}`).subscribe({
        next: (grades) => {
          console.log('Fetched Grades:', grades);

          // Step 2: Attach grades to students
          this.selectedCourse.students.forEach((student: any) => {
            const match = grades.find((grades: any) => grades.studentId === student._id._id);
            student.midterm = match?.midterm || ''
            student.final = match?.final || ''
          })

          // Step 3: Only now build the form
          this.buildForm(this.selectedCourse.students);
        },
        error: (err) => {
          console.error('Error fetching grades', err);
        }
      });
    },
    error: (err) => {
      console.error('Error fetching course', err);
    }
  });
}
    buildForm(students: any[]){
      const group: any = {};
      students.forEach((student, index) => {
        group[`midterm_${index}`] = new FormControl(student.midterm || '');
        group[`final_${index}`] = new FormControl(student.final || '');
      });
      /* this.gradeForm = this.formbuild.group(group); */
      this.gradeForm = this.formbuild.group(group)
      this.formReady = true;
    }

    submitGrades(){
      const gradesToDatabaseCollection = this.selectedCourse.students.map((student: any, index: number) => ({
        courseId: this.courseId,
        studentId: student._id._id,
        midterm: this.gradeForm.value[`midterm_${index}`],
        final: this.gradeForm.value[`final_${index}`],
        savedBy: this.currentUser,
      }))
      const payload ={
        submittedBy: this.currentUser,
        grades: gradesToDatabaseCollection
      }

      console.log(payload)
      this.http.post('http://localhost:5048/grades/saveGrades', payload).subscribe({
        next: (res) => {
            this.snackBar.open('Grade submission success!', 'Close', {
            duration: 4000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snack-success'],
          })
          console.log('Grades submitted successfully:', res);
        },
        error: (err) => {
          this.snackBar.open('Failed to submit grades', 'Close', {
            duration: 4000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['snack-error'],
          })
          console.error('Failed to submit grades:', err);
        }
      });
    }
    
  goBack(){
      this.router.navigate(['/reports'])
    }
}
