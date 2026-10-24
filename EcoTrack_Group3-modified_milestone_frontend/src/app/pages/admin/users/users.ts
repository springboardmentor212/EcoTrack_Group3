import { FormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { AdminAuthService } from '../../../services/admin-auth.service';
import { ChangeDetectorRef,Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  

  users: any[] = [];

  constructor(private http: HttpClient,
              private adminAuthService:AdminAuthService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const token = this.adminAuthService.getToken();

const headers = new HttpHeaders({
  Authorization: `Bearer ${token}`
});

this.http.get<any>(
  'http://localhost:5000/api/admin/users',
  { headers })
      .subscribe({
        next: (response) => {
          console.log('Admin users response:',response);
          this.users = response.users || [];
          this.cdr.detectChanges();
          console.log('Users after assignment:',this.users.length);
        },
        error: (error) => {
          console.error('Failed to load users:', error);
        }
      });
  }
  searchText = '';
openActionUserId: string | null = null;
selectedUser: any = null;
showDetails = false;

get filteredUsers(): any[] {
  const query = this.searchText.trim().toLowerCase();

  if (!query) {
    return this.users;
  }

  return this.users.filter(user =>
    (user.name || '').toLowerCase().includes(query) ||
    (user.email || '').toLowerCase().includes(query)
  );
}

toggleActions(user: any): void {
  this.openActionUserId =
    this.openActionUserId === user._id ? null : user._id;
}

viewDetails(user: any): void {
  this.selectedUser = user;
  this.showDetails = true;
  this.openActionUserId = null;
}

closeDetails(): void {
  this.showDetails = false;
  this.selectedUser = null;
}

editUser(user: any): void {
  this.openActionUserId = null;
  alert('User editing will be connected to the backend next.');
}
}