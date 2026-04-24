import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { WebsocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, LoadingSpinnerComponent],
  template: `
    <div class="flex min-h-screen bg-main-bg">
      <app-sidebar />
      
      <div class="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <app-topbar />
        
        <main class="flex-1 p-6 overflow-y-auto">
          <div class="max-w-7xl mx-auto">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
    <app-loading-spinner />
  `
})
export class MainLayoutComponent implements OnInit {
  private wsService = inject(WebsocketService);

  ngOnInit(): void {
    this.wsService.connect();
  }
}
