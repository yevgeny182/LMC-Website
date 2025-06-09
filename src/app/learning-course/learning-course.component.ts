import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ✅ Needed for ngForm
import { CommonModule } from '@angular/common'; 
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-learning-course',
  standalone: true, 
  imports: [RouterModule, FormsModule, CommonModule, HttpClientModule], 
  templateUrl: './learning-course.component.html',
  styleUrls: ['./learning-course.component.scss'] // typo fixed: styleUrl -> styleUrls
})
export class LearningCourseComponent {
  constructor(private http: HttpClient, private snackBar: MatSnackBar, private userService: UserService) {}

  course: {
    courseCode: string;
    courseTitle: string;
    population: number | null;
    courseUnits: number | null;
    courseStatus: string;
    students: any[];
    semester: string
  } = {
    courseCode: '',
    courseTitle: '',
    population: null,
    courseUnits: null,
    courseStatus: '',
    students: [],
    semester: ''
  };

  courses: any[] = [];
  semesters: any[] = [];
  selectedSemester: string =''

  viewCourseDetailsOpen: boolean = false;
  viewCourseFormOpen: boolean = false;
  selectedCourse: any = null;
  viewUpdateCourseModalOpen: boolean = false;
  viewDeleteCourseModalOpen: boolean = false;
  defaultSem: boolean = false;
  role: string | null = null;
  filterCourse: any[] = []


  ngOnInit(): void {
    this.fetchCourse();
    this.fetchSemesters()
    this.role = this.userService.getRole()
    this.onSemesterChange()
  }


  fetchCourse() {
    this.http.get<any[]>('http://localhost:5048/courses/getCourses')
      .subscribe({
        next: (data) =>{
            this.courses = data
            this.courses.forEach((course) =>{
            if(course.population === course.students.length){
              this.http.put(`http://localhost:5048/courses/updateCourse/${course._id}`, { courseStatus: 'Closed' })
              .subscribe({ 
                error: (err) =>{
                  console.log('Error', err)
                }
              })
            }else{
              if(course.courseStatus !== 'Closed'){
              this.http.put(`http://localhost:5048/courses/updateCourse/${course._id}`, { courseStatus: 'Open' })
              .subscribe({ 
                error: (err) =>{
                  console.log('Error', err)
                }
              })
              }
            }
            })
        },
        error: (err) =>{
          console.log('Error:', err)
        }
      });
  }

  addCourse() {
    this.course.courseUnits = parseFloat(this.course.courseUnits as any)
    this.course.semester = this.selectedSemester
    if (
      !this.course.courseCode ||
      !this.course.courseTitle ||
      this.course.population === null ||
      isNaN(this.course.courseUnits) ||
      !this.course.courseStatus ||
      !this.course.semester
    ) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', {
        duration: 4000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snack-error'],
      });
      return;
    }
    this.http.post('http://localhost:5048/courses/addCourse', this.course)
      .subscribe({
        next: (res: any) => {
          this.fetchCourse();
          this.snackBar.open('Course added successfully', 'Close', {
            duration: 4000,
            panelClass: ['snack-success'],
          });
          this.closeAddCourseModal()
          this.course = {
            courseCode: '',
            courseTitle: '',
            population: null,
            courseUnits: null,
            courseStatus: '',
            students: [],
            semester: ''
          }; 
        },
        error: (err) => {
          this.snackBar.open('Cannot add course', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
          });
          this.closeAddCourseModal()
        }
      });
  }
  updateCourse(course: any){
    const updatedCourse ={...course, courseUnits: parseFloat(course.courseUnits)};
    if(!updatedCourse.courseCode ||
      !updatedCourse.courseTitle ||
      updatedCourse.population === null ||
      isNaN(updatedCourse.courseUnits) ||
      !updatedCourse.courseStatus
    ){
      this.snackBar.open('Please fill in all fields correctly', 'Close', {
        duration: 4000,
        panelClass: ['snack-error'],
      });
      return;
    } 
    this.http.put<any[]>(`http://localhost:5048/courses/updateCourse/${course._id}`, updatedCourse)
    .subscribe({
      next: () => {
        this.fetchCourse()
        this.snackBar.open('Course updated successfully', 'Close', {
          duration: 4000,
          panelClass: ['snack-success'],
        });
        this.closeUpdateCourseModal();
      },
      error: (err) =>{
        console.error('error:', err)
        this.snackBar.open('Failed to update course', 'Close', {
          duration: 4000,
          panelClass: ['snack-error'],
        })
      }
    })
  }
  deleteCourse(course: any){
    this.http.delete(`http://localhost:5048/courses/deleteCourse/${course._id}`).subscribe({
      next: () => {
        this.fetchCourse();
        this.snackBar.open('Course deleted successfully', 'Close', {
          duration: 4000,
          panelClass: ['snack-success'],
        });
        this.closeDeleteCourseModal();
      },
      error: () => {
        this.snackBar.open('Failed to delete course', 'Close', {
          duration: 4000,
          panelClass: ['snack-error'],
        });
      }
    });
  }
  fetchSemesters(){
    this.http.get(`http://localhost:5048/settings/getSemester`).subscribe({
      next: (data: any) =>{
        this.semesters = data;
        const defaultSem = this.semesters.find(sem => sem.isDefault)

        if(defaultSem){
          this.selectedSemester = defaultSem._id
          this.course.semester = defaultSem._id
          this.defaultSem = true
        }else{
          this.selectedSemester = ''
          this.course.semester = ''
          this.defaultSem = false
        }
      },
      error: (err) =>{
        console.log('Error: ', err)
      }
    })
  }
  get isDefaultSem() : boolean{
    return this.semesters.some(sem => sem.isDefault)
  }
  get filteredCourses(){

    if(!this.selectedSemester || this.selectedSemester === ''){
      return this.courses
    }
    return this.courses.filter(course =>{
      const courseSemId = typeof course.semester === 'string' ? course.semester : course.semester?._id
      return courseSemId === this.selectedSemester
      
    })
  }
  isAdmin(): boolean{
    return this.role === 'Admin'
  }
  onSemesterChange(): void{
    const semId = this.selectedSemester
    if(semId){
      this.filterCourse = this.courses.filter(course => course.semester === semId)
    }else{
      this.filterCourse = this.courses
    }
  }
  closeModal() {
    this.viewCourseDetailsOpen = false;
    this.selectedCourse = null;
  }
  viewCourse(course : any){
    this.selectedCourse = course;
    this.viewCourseDetailsOpen = true;
  }
  openAddCourseModal(){
    this.viewCourseFormOpen = true;
  }
  closeAddCourseModal(){
    this.viewCourseFormOpen = false;
  }
  updateModal(course: any) {
    this.selectedCourse = { ...course }; // clone to avoid live-binding
    this.viewUpdateCourseModalOpen = true;
  }
  
  closeUpdateCourseModal() {
    this.viewUpdateCourseModalOpen = false;
    this.selectedCourse = null;
  }
  deleteModal(course: any) {
    this.selectedCourse = course;
    this.viewDeleteCourseModalOpen = true;
  }
  
  closeDeleteCourseModal() {
    this.viewDeleteCourseModalOpen = false;
    this.selectedCourse = null;
  }
  
}
