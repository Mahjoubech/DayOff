import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: '<div class="flex items-center justify-center h-screen"><p>Redirecting...</p></div>'
})
export class DashboardRedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const role = this.authService.getRole();
    
    if (role === 'SUPER_ADMIN') {
      this.router.navigate(['/dashboard/superadmin']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/dashboard/hr']);
    } else {
      this.router.navigate(['/dashboard/employee']);
    }
  }
}
