import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeStudentComponent } from './grade-student.component';

describe('GradeStudentComponent', () => {
  let component: GradeStudentComponent;
  let fixture: ComponentFixture<GradeStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
