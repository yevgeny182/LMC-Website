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
  originalGrades: any[] = []
  isGraded = false;
  isMidtermGraded: boolean = false;
  isFinalGraded: boolean = false;
  modifiedMidterm: boolean = false;
  modifiedFinal: boolean = false

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
    this.setGradedFlags()
    this.trackGradeChanges()

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

          this.isGraded = this.selectedCourse.students.some((student: any) => {
           return student.midterm !== '' || student.final !== ''
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
      this.originalGrades = students.map(student => ({
        midterm: student.midterm || '',
        final: student.final || '',
        studentId: student._id._id
      }))
      students.forEach((student, index) => {
        group[`midterm_${index}`] = new FormControl(student.midterm || '');
        group[`final_${index}`] = new FormControl(student.final || '');
      });

      this.gradeForm = this.formbuild.group(group)
      this.formReady = true;

      this.gradeForm.valueChanges.subscribe(() => {
        this.isGraded = Object.values(this.gradeForm.value).some(val => val !== '')
      })
    }

    submitGrades(){
      const gradesToDatabaseCollection = this.selectedCourse.students.map((student: any, index: number) => {
          const midterm = this.gradeForm.value[`midterm_${index}`]
          const final = this.gradeForm.value[`final_${index}`]
        return{
        courseId: this.courseId,
        studentId: student._id._id,
        midterm,
        final,
        isMidtermGraded: midterm !=='',
        isFinalGraded: final !== '',
        savedBy: this.currentUser,
        }
      })
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

  updateGrades(){
    const updatedGrades: {
      courseId: string | null;
      studentId: string;
      midterm: string;
      final: string;
      isMidtermGraded: boolean,
      isFinalGraded: boolean,
      submittedBy: string;
    }[] = [];

    this.selectedCourse.students.forEach((student: any, index: number) => {
      const newMidterm = this.gradeForm.value[`midterm_${index}`]
      const newFinal = this.gradeForm.value[`final_${index}`]
      const original = this.originalGrades.find(grade => grade.studentId === student._id._id)

      const midtermChanged = newMidterm !== original.midterm
      const finalChanged = newFinal !== original.final

      const isMidtermGraded = midtermChanged && newMidterm !== ''
      const isFinalGraded = finalChanged && newFinal !== ''

      if(midtermChanged || finalChanged){
        updatedGrades.push({
          courseId: this.courseId,
          studentId: student._id._id,
          midterm: newMidterm,
          final: newFinal,
          isMidtermGraded,
          isFinalGraded,
          submittedBy: this.currentUser
        })
      }
    })

      if(updatedGrades.length === 0){
        this.snackBar.open('No changes to update', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snack-info']
        })
        return
      }
    updatedGrades.forEach((grade) => {
    this.http.put(`http://localhost:5048/grades/studentGrades/${grade.courseId}`, grade).subscribe({
      next: (res) => {
        this.snackBar.open('Grades updated!', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snack-success'],
        });
        console.log('Grade updated:', res);
      },
      error: (err) => {
        this.snackBar.open('Failed to update some grades.', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['snack-error'],
        });
        console.error('Update failed:', err);
      }
    });
    })
  }
  handleButtonAction(){
    const gradeEntered = Object.values(this.gradeForm.value).some(val => val !== '')
    if(!this.isGraded  && gradeEntered){
      this.updateGrades()
    }else if(!this.isGraded && !gradeEntered){
      this.snackBar.open('Please enter at least one grade.', 'Close', {
        duration: 4000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['snack-default'],
      })
    }else{
      this.updateGrades()
    }
  }
  setGradedFlags(){
    const students = this.selectedCourse?.students || []
    
    this.isMidtermGraded = students.some((s: any) => !!s.midterm)
    this.isFinalGraded = students.some((s: any) => !!s.final)
  }
  trackGradeChanges(){
    Object.keys(this.gradeForm.controls).forEach(ctrlName => {
      this.gradeForm.get(ctrlName)?.valueChanges.subscribe(() => {
        if(ctrlName.startsWith('midterm_')){
          this.modifiedMidterm = true;
        }else if(ctrlName.startsWith('final_')){
          this.modifiedFinal = true;
        }
      })
    })
  }
  getSubmitLabel(): string{
    if (this.modifiedMidterm && this.modifiedFinal) return 'Update All Grades';
    if (this.modifiedMidterm) return 'Update Midterm Grades';
    if (this.modifiedFinal) return 'Update Final Grades';

    return (this.isMidtermGraded || this.isFinalGraded) ? 'Update Grades' : 'Submit Grades';
  }
    
  goBack(){
      this.router.navigate(['/reports'])
    }

}
