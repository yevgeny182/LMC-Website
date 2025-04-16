import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Needed for ngForm
import { CommonModule } from '@angular/common'; // ✅ Good practice for standalone

@Component({
  selector: 'app-learning-course',
  standalone: true, 
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule], 
  templateUrl: './learning-course.component.html',
  styleUrls: ['./learning-course.component.scss'] // typo fixed: styleUrl -> styleUrls
})
export class LearningCourseComponent {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  course: {
    courseCode: string;
    courseTitle: string;
    population: number | null;
    courseUnits: number | null;
    courseStatus: string;
    students: any[];
  } = {
    courseCode: '',
    courseTitle: '',
    population: null,
    courseUnits: null,
    courseStatus: '',
    students: []
  };

  courses: any[] = [];

  ngOnInit(): void {
    this.fetchCourse();
  }

  fetchCourse() {
    this.http.get<any[]>('http://localhost:5048/courses/getCourses')
      .subscribe(data => this.courses = data);
  }

  addCourse() {
    this.course.courseUnits = parseFloat(this.course.courseUnits as any)
    
    this.http.post('http://localhost:5048/courses/addCourse', this.course)
      .subscribe({
        next: (res: any) => {
          this.fetchCourse();
          this.snackBar.open('Course added successfully', 'Close', {
            duration: 4000,
            panelClass: ['snack-success'],
          });
          this.course = {
            courseCode: '',
            courseTitle: '',
            population: null,
            courseUnits: null,
            courseStatus: '',
            students: []
          };
        },
        error: (err) => {
          this.snackBar.open('Cannot add course', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
          });
        }
      });
  }
}
