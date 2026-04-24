import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.isLoading$ | async" class="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-xs">
      <div class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);
}
