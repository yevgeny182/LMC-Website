import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-course-details',
  imports: [CommonModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss'
})
export class CourseDetailsComponent {
    courseId: string | null = null
    selectedCourse: any = null;

    constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router){}
    ngOnInit(): void{
      this.route.paramMap.subscribe(params =>{
        const id = params.get('id')
        if(id)
          this.fetchCourseById(id)
      })
    }

    fetchCourseById(id: String){
      this.http.get<any>(`http://localhost:5048/courses/getCourse/${id}`).subscribe({
        next: (data) => {
          this.selectedCourse = data;
        },
        error: (err) =>{
          console.error('Error: ', err);
        }
      });
    }
    goBack(){
      this.router.navigate(['/learning-course'])
    }
}
