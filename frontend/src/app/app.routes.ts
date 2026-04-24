import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./layout/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-redirect/dashboard-redirect.component').then(m => m.DashboardRedirectComponent)
      },
      {
        path: 'dashboard/superadmin',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () => import('./features/dashboard/superadmin-dashboard/superadmin-dashboard.component').then(m => m.SuperadminDashboardComponent)
      },
      {
        path: 'dashboard/hr',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/dashboard/hr-dashboard/hr-dashboard.component').then(m => m.HrDashboardComponent)
      },
      {
        path: 'dashboard/employee',
        canActivate: [roleGuard(['EMPLOYEE'])],
        loadComponent: () => import('./features/dashboard/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
      },
      {
        path: 'employees',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
        loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
      },
      {
        path: 'leaves',
        loadComponent: () => import('./features/leaves/leave-list/leave-list.component').then(m => m.LeaveListComponent)
      },
      {
        path: 'leaves/manage',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
        loadComponent: () => import('./features/leaves/leave-manage/leave-manage.component').then(m => m.LeaveManageComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance-checkin/attendance-checkin.component').then(m => m.AttendanceCheckinComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat-shell/chat-shell.component').then(m => m.ChatShellComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-list/notification-list.component').then(m => m.NotificationListComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
