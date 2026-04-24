import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5 p-4">
      <router-outlet />
    </div>
  `
})
export class AuthLayoutComponent {}
