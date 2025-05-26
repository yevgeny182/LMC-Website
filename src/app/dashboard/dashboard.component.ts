import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Notification } from '../models/notification.model';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../../../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss' ,
})

export class DashboardComponent {
  
 
}
