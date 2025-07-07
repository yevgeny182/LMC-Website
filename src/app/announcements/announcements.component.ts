import { Component } from '@angular/core';
import { UserService } from '../../../user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-announcements',
  imports: [FormsModule, CommonModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent {

  constructor(private http: HttpClient, private userService: UserService, private snackBar: MatSnackBar){}

  role: string | null = null
  teachers: any[] = []
  semesters: any[] = []
  selectedSemester: string = ''
  selectedCourseId: string = ''
  selectedCourseIdForViewing: string = ''
  announcementText: string = ''
  defaultSemester: any = null
  selectedFiles: File[] = []
  announcements: any[] = []
  filteredAnnouncement: any[] = [];
  isUpdateModal: boolean = false;
  isDeleteModal: boolean = false;

  ngOnInit(): void{
    this.fetchCourse()
    this.fetchSemesters()
    this.fetchAnnouncement()
    this.role = this.userService.getRole()
  }

  fetchCourse(){
    this.http.get<any[]>('http://localhost:5048/courses/getCourses').subscribe({
      next: (data) =>{
        this.teachers = data
      },
      error: (err) => {
        console.log('Error ', err)
      }
    })
  }
  fetchSemesters(){
    this.http.get(`http://localhost:5048/settings/getSemester`).subscribe({
      next: (data: any) => {
        this.semesters = data
        const defaultSem = this.semesters.find(sem => sem.isDefault);
      if (defaultSem) {
        this.defaultSemester = defaultSem; 
        this.selectedSemester = defaultSem._id;
      } else {
        this.defaultSemester = null;
      }
      }
    })
  }
  createAnnouncement(){
    if(!this.announcementText.trim()){
      //insert toast here
      console.error('error in announcements temporary')
      return;
    }
    const payload ={
      courseId: this.selectedCourseId,
      userId: this.userService.getCurrentUser()._id,
      text: this.announcementText
    }
    console.log(this.userService.getCurrentUser()._id)
    this.http.post(`http://localhost:5048/announcements/createAnnouncement`, payload).subscribe({
      next: (res: any) => {
        this.fetchAnnouncement()
        this.snackBar.open('Announcement created!', 'Close', {
          duration: 4000,
          panelClass: ['snack-success'],
          verticalPosition: 'top',
          horizontalPosition: 'center',
        })
        this.announcementText = ''
        this.selectedCourseId = ''
      },
      error: (err) =>{
        console.log('Error: ', err)
         this.snackBar.open('Error, something went wrong', 'Close', {
          duration: 4000,
          panelClass: ['snack-error'],
          verticalPosition: 'top',
          horizontalPosition: 'center',
        })
      }
    })
  }
  fetchAnnouncement(){
    this.http.get('http://localhost:5048/announcements/getAnnouncement').subscribe({
      next: (data: any) => {
        this.announcements = data
        /* console.log(this.announcements) */
      },
      error: (err) => {
        console.log('Error: ', err)
      }
    })
  }

/*   get filteredAnnouncements(){
    return this.announcements.filter(announce => announce.courseId?._id === this.selectedCourseIdForViewing)
  }
 */
    isAdmin(): boolean{
    return this.role === 'Admin'
  }
    isTrainee(): boolean{
      return this.role === 'Trainee'
    }

  get isDefaultSem(): boolean{
    return this.semesters.some(sem => sem.isDefault)
  }

  //this shows courses in the default semester assigned to the teacher
  get teacherNames(){
    const userId = this.userService.getCurrentUser()
    if(!this.selectedSemester || !userId?.name) return []

    return this.teachers.filter(course => {
      const courseSemester = typeof course.semester === 'string' ? course.semester : course.semester?._id;
      const sameSem = courseSemester === this.selectedSemester
      const isSameTeacher = course.teacher?.some((t:any) => t.name === userId.name)
    return sameSem && isSameTeacher;
    })
  }
  //selects the correct course object id
  onCourseSelected(courseId: string) {
  const selectedCourse = this.teacherNames.find(c => c._id === courseId);
  if (selectedCourse) {
    this.selectedCourseId = selectedCourse._id
    /* console.log(`${selectedCourse.courseCode} = ` , this.selectedCourseId) */
  } else {

  }
}
//selects the correct course on the second card, View Posted Announcements
  onViewCourseSelected(courseId: string){
  this.selectedCourseIdForViewing = courseId;
  this.filteredAnnouncement = this.announcements.filter(announce => announce.courseId?._id === courseId);

  }

  //handle file input, showing a pop up option
  onFileSelected(event: Event) : void {
    const input = event.target as HTMLInputElement
    if(input.files && input.files.length > 0){
      this.selectedFiles = Array.from(input.files) 
    }
  }
  removeFile(index: number): void{
    this.selectedFiles.splice(index, 1)
    console.log('removed')
    const file = document.getElementById('fileInput') as HTMLInputElement
    if(file)
      file.value = ''
  }
  openUpdateModal(text: any){
    this.announcementText = text
    this.isUpdateModal = true;
    console.log('modal opened')
  }
  closeUpdateModal(){
    this.isUpdateModal = false;
  }
  openDeleteModal(text: any){
    this.announcementText = text;
    this.isDeleteModal = true
  }
  closeDeleteModal(){
    this.isDeleteModal = false;
  }

}
