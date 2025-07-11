import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { UserService } from '../../../user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { supabase } from '../../../supabaseClient';


@Component({
  selector: 'app-announcements',
  imports: [FormsModule, CommonModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss'
})
export class AnnouncementsComponent {
  private api = inject(HttpClient)
  @ViewChild('fileInput') fileInput!: ElementRef <HTMLInputElement>
  constructor(private userService: UserService, private snackBar: MatSnackBar){}

  role: string | null = null
  teachers: any[] = []
  semesters: any[] = []
  selectedSemester: string = ''
  selectedCourseId: string = ''
  selectedCourseIdForViewing: string = ''
  announcementText: string = ''
  announcementTextToUpdate: string = ''
  announcementTextToDelete: any = null
  defaultSemester: any = null
  selectedFiles: File[] = []
  announcements: any[] = []
  filteredAnnouncement: any[] = [];
  isUpdateModal: boolean = false;
  isDeleteModal: boolean = false;
  filteredCourses: any[] = []
  isLoading = true;
  emptyStudentAnnouncement: boolean = false;
  adminHasAnnouncement: boolean = false;

 /*  temporary variable for debugging
  tempPlaceholder: string = '' */

  ngOnInit(): void{
    this.fetchSemesters()
    this.fetchAnnouncement()
    this.role = this.userService.getRole()
  }

  fetchCourse(){
    this.api.get<any[]>('http://localhost:5048/courses/getCourses').subscribe({
      next: (data) =>{
        this.teachers = data
        this.filteredCourses = this.teacherNames()
        this.isLoading = false
      },
      error: (err) => {
        console.log('Error ', err)
        this.isLoading = false
        this.filteredCourses = []
      }
    })
  }
  fetchSemesters(){
    this.api.get(`http://localhost:5048/settings/getSemester`).subscribe({
      next: (data: any) => {
        this.semesters = data
        const defaultSem = this.semesters.find(sem => sem.isDefault);
      if (defaultSem) {
        this.defaultSemester = defaultSem; 
        this.selectedSemester = defaultSem._id;
        this.fetchCourse()
      } else {
        this.defaultSemester = null;
      }
      }
    })
  }
  async createAnnouncement(): Promise<void>{

    if(!this.selectedCourseId || !this.announcementText.trim()){
      //insert toast here
      console.error('error in announcements temporary')
      return;
    }
    const uploadedFilePaths: string[] = []
    const uploadedFileNames: string[] = []
    const uploadedFileUrls: string[] = []

        for (const file of this.selectedFiles) {
        const filePath = `${this.selectedCourseId}/${file.name}`;

        const { data, error } = await supabase
          .storage
          .from('univportal-fileuploads-demo')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error.message);
          continue;
        }

        // push path, name, and URL
        uploadedFilePaths.push(filePath);
        uploadedFileNames.push(file.name);
        const publicUrl = supabase.storage.from('univportal-fileuploads-demo').getPublicUrl(filePath).data.publicUrl;
        uploadedFileUrls.push(publicUrl);
        }

    const payload ={
      courseId: this.selectedCourseId,
      userId: this.userService.getCurrentUser()._id,
      text: this.announcementText,
      fileName: uploadedFileNames,
      url: uploadedFileUrls
    }
    /* console.log(this.userService.getCurrentUser()._id) */
    this.api.post(`http://localhost:5048/announcements/createAnnouncement`, payload).subscribe({
      next: (res: any) => {
        this.fetchAnnouncement()
        this.snackBar.open('Announcement created!', 'Close', {
          duration: 4000,
          panelClass: ['snack-success'],
          verticalPosition: 'top',
          horizontalPosition: 'center',
        })
        this.selectedFiles = []
        if(this.fileInput){
             this.fileInput.nativeElement.value = ''
        }
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
    this.api.get('http://localhost:5048/announcements/getAnnouncement').subscribe({
      next: (data: any) => {
        this.announcements = data
        const userId = this.userService.getCurrentUser()?._id
        if(this.isTrainee()){
          this.filteredAnnouncement = this.announcements.filter((announce: any) => {
            return announce.courseId?.students?.some((stud: any) => stud._id === userId)
          })
          this.emptyStudentAnnouncement = this.filteredAnnouncement.length === 0
          this.selectedCourseIdForViewing = ''
        }else{
        this.filteredAnnouncement = [];          
        this.emptyStudentAnnouncement = false;
        this.adminHasAnnouncement = this.filteredAnnouncement.length === 0
        }
      },
      error: (err) => {
        console.log('Error: ', err)
        this.filteredAnnouncement = [];
        this.emptyStudentAnnouncement = false;
      }
    })
  }

  deleteAnnouncement(announcement: any){
    /* console.log('text to be deleted expecting objectId', text) */
    const filePath: string[] = announcement.fileName.map((file: string) => {
      return `${announcement.courseId._id}/${file}`;
    })
    supabase.storage.from('univportal-fileuploads-demo').remove(filePath).then(() => {
        this.api.delete(`http://localhost:5048/announcements/deleteAnnouncement/${announcement._id}`).subscribe({
          next: () => {
            this.snackBar.open('Announcement deleted',  'Close', {
              duration: 4000,
              panelClass: ['snack-success'],
            })
            this.fetchAnnouncement()
            this.closeDeleteModal()
          },
          error: (err) => {
            console.log(err)
            this.snackBar.open('Error deleting announcement', 'Close', {
              duration: 4000,
              panelClass: ['snack-error'],
            })
          }
        })
    }).catch(err => {
      console.log(err)
      this.snackBar.open('Error deleting the file', 'Close', {
        duration: 4000,
        panelClass: ['snack-error'],
      })
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
 teacherNames(): any{
    const userId = this.userService.getCurrentUser()
    if(!this.selectedSemester || !userId?.name) return[]
    
      if(this.role === 'Trainee'){
        return this.teachers.filter(student => {
          const courseSemester = typeof student.semester === 'string' ? student.semester : student.semester?._id;
          const sameSem = courseSemester === this.selectedSemester;
          const isStudent = student.students?.some((stud: any) =>  stud._id === userId._id);
          return sameSem && isStudent;
        });
      }

    return this.teachers.filter(course => {
      const courseSemester = typeof course.semester === 'string' ? course.semester : course.semester?._id;
      const sameSem = courseSemester === this.selectedSemester
      const isTeacher = course.teacher?.some((t:any) => t.name === userId.name)
    return sameSem && isTeacher;
    })
  }
  //selects the correct course object id
  onCourseSelected(courseId: string) {
  const selectedCourse = this.filteredCourses.find(c => c._id === courseId);
  if (selectedCourse) {
    this.selectedCourseId = selectedCourse._id
    /* console.log(`${selectedCourse.courseCode} = ` , this.selectedCourseId) */
  }
}

//selects the correct course on the second card, View Posted Announcements
onViewCourseSelected(courseId: string) {
    if (!courseId) return

  if (this.isTrainee()) {
    const userId = this.userService.getCurrentUser()?._id;
    this.filteredAnnouncement = this.announcements.filter((announce: any) => {
      const isStudent = announce.courseId?.students?.some((stud: any) => stud._id === userId);
      return isStudent && announce.courseId?._id === courseId;
    });
    this.emptyStudentAnnouncement = this.filteredAnnouncement.length === 0
  } else {
    // admin
    this.selectedCourseIdForViewing = courseId;
    this.filteredAnnouncement = this.announcements.filter(
      announce => announce.courseId?._id === courseId
    );
    this.emptyStudentAnnouncement = this.filteredAnnouncement.length === 0;
  }
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
  async uploadFile(file: File): Promise<void> {
    const {data, error} = await supabase.storage.from('uploads').upload(`user-uploads/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if(error){
      this.snackBar.open('Upload Failed!', 'Close', {
          duration: 4000,
          panelClass: ['snack-error'],
          verticalPosition: 'top',
          horizontalPosition: 'center',
      })
      return;
    }
    console.log('Upload success!', data)
  }
  startUpload(): void{
    if(!this.selectedFiles || this.selectedFiles.length === 0 ){
      console.warn('no files selected!')
      return;
    }
    this.selectedFiles.forEach(file => {
      this.uploadFile(file)
    })
  }
  openUpdateModal(text: any){
    this.announcementTextToUpdate = text
    this.isUpdateModal = true;
  }
  closeUpdateModal(){
    this.isUpdateModal = false;
  }
  openDeleteModal(announcement: any){
    this.announcementTextToDelete = announcement
    this.isDeleteModal = true
  }
  closeDeleteModal(){
    this.isDeleteModal = false;
  }

}
