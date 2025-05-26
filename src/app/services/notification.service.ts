import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = 'http://localhost:5048/notify'
  constructor(private http: HttpClient) { }
  
  getNotification(userId: string): Observable<Notification[]>{
    return this.http.get<Notification[]>(`${this.api}/${userId}`);
  }

  sendNotification(payload: {recipient: string, message: string}) : Observable<Notification>{
    return this.http.post<Notification>(`${this.api}`, payload)
  }

  markAsRead(notifId: string): Observable<any> {
  return this.http.patch(`${this.api}/${notifId}/read`, {}, {responseType: 'text'});
  }


 /*  deleteNotificationsByRecipientAndMessage(recipient: string, messageContains?: string): Observable<any> {
  let url = `${this.api}?recipient=${recipient}`;
  if (messageContains) {
    url += `&message=${encodeURIComponent(messageContains)}`;
  }
  return this.http.delete(url);
} */

}
