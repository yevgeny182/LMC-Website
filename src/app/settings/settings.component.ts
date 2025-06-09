import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CommonModule, NgClass],
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  gradingSystem: string = 'gpa';  
  startDate: string = ''
  endDate: string = ''
  schoolYear: string = ''
  isAddedBy: string = ''
  semesters: any[] = []
  selectedSemester: any = null
  isSemesterModalOpen: boolean = false
  isEditSemesterModalOpen: boolean = false
  editSemester: any = {}
  isDeleteSemesterModalOpen: boolean = false
  semestertoDeleteId: string | null = null
  role: string | null = null

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private userService: UserService){
    const user = this.userService.getCurrentUser()
    this.role = this.userService.getRole()
    if(user && user._id){
      this.isAddedBy = user._id;
    }
  }
  
  ngOnInit(): void{
    this.fetchSemesters()
  }  

  onGradingSystemChange() {
    // You can handle any additional logic when the grading system is changed
    console.log("Grading system changed to:", this.gradingSystem);
  }

  saveSettings() {
    // You can save the settings here, for example by calling a service
    const semesterData = {
      startDate: this.startDate,
      endDate: this.endDate,
      schoolYear: this.schoolYear,
      isAddedBy: this.isAddedBy
    };
    this.http.post('http://localhost:5048/settings/createSemester', semesterData).subscribe({
      next: (response) =>{
        this.snackBar.open('Semester settings saved successfully!', 'Close', {
           duration: 4000,
           panelClass: ['snack-success'],
          });
        this.startDate = ''
        this.endDate = ''
        this.schoolYear = ''
      },
      error: (err) =>{
        console.log('Error: ', err)
        this.snackBar.open('Cannot save settings', 'Close', {
            duration: 4000,
            panelClass: ['snack-error'],
          });
      }
    })
    console.log("Settings saved", this.gradingSystem);
  }

  async fetchSemesters(): Promise<void> {
    try {
      this.http.get(`http://localhost:5048/settings/getSemester`).subscribe({
        next: (data: any) => {
          this.semesters = data;
          if (this.semesters && this.semesters.length > 0) {
            const defaultSemester = this.semesters.find(sem => sem.isDefault === true);
            if (defaultSemester) {
              this.editSemester = defaultSemester;
              this.startDate = this.formatDate(defaultSemester.startDate);
              this.endDate = this.formatDate(defaultSemester.endDate);
              this.schoolYear = defaultSemester.schoolYear;
            }
          }
        },
        error: (err) => {
          console.log('Error', err);
        }
      });
    } catch (error) {
      console.error('Error fetching semester data:', error);
    }
  }
  deleteSem(semesterId: any){
    this.http.delete(`http://localhost:5048/settings/deleteSemester/${semesterId}`).subscribe({
      next: (res: any) =>{
        this.snackBar.open('Semester deletion successfull', 'Close', {
          duration: 4000,
          panelClass: ['snack-success'],
        });
        this.closeEditModal()
        this.fetchSemesters()
      },
      error: (err) => {
        console.error('Error deleting semester:', err)
        this.snackBar.open('Semester deletion failed', 'Close', {
          duration: 4000,
          panelClass: ['snack-error'],
        });
      }
    })
  }
  editSem(semesterId: string){
    const semToEdit = this.semesters.find((s: any) => s._id === semesterId);
    if (semToEdit) {
      this.editSemester = { ...semToEdit, 
      
        isAddedBy: {...semToEdit.isAddedBy}
      } 
      if (this.editSemester.startDate) {
        this.editSemester.startDate = this.formatDate(this.editSemester.startDate);
      }
      if (this.editSemester.endDate) {
        this.editSemester.endDate = this.formatDate(this.editSemester.endDate);
      }
  
      this.isEditSemesterModalOpen = true;  
    }
  }
  formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0'); 
    return `${year}-${month}-${day}`;
  }
  saveUpdatedSem(){
    this.http.put(`http://localhost:5048/settings/updateSemester/${this.editSemester._id}`, this.editSemester).subscribe({
      next: (res: any) =>{
        this.snackBar.open('Update semester success!', 'Close', {
          duration: 4000,
          panelClass: ['snack-success'],
        })
        this.startDate = ''
        this.endDate = ''
        this.schoolYear = ''
        this.isEditSemesterModalOpen = false;
        this.fetchSemesters()
      },
      error: (err) =>{
        this.snackBar.open('Semester cannot be updated', 'Close',{
          duration: 4000,
          panelClass:['snack-error'],
        })
      }
    })
  }
   isAdmin(): boolean{
    return this.role === 'Admin'
  }
    isStudent(): boolean{
      return this.role === 'Trainee'
    }

  openEditSemester(){
    this.isEditSemesterModalOpen = true
  }

  openDeleteSemester(id: string){
    this.isDeleteSemesterModalOpen = true
    this.semestertoDeleteId = id 
  }

  openSemesterModal(){
    this.isSemesterModalOpen = true
    this.fetchSemesters()
  }
  closeSemesterModal(){
    this.isSemesterModalOpen = false
  }
  closeEditModal(){
    this.isEditSemesterModalOpen = false
    this.editSemester = {}
  }
  closeDeleteModal(){
    this.isDeleteSemesterModalOpen = false
  }
  confirmDelete(){
    if(this.semestertoDeleteId){
      this.deleteSem(this.semestertoDeleteId)
    }
   this.closeDeleteModal()
  }
  cancelChanges() {
    // Reset or handle cancellation here
    console.log("Changes canceled");
  }
  
}
