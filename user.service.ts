import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getCurrentUser(): any {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser)?.user : null;
  }
}
