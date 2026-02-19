import { Component, inject, signal } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { DemoService } from '../../services/demo/demo.service';

@Component({
  selector: 'app-demo-banner',
  standalone: true,
  templateUrl: './demo-banner.component.html',
  styleUrls: ['./demo-banner.component.scss']
})
export class DemoBannerComponent {
  config = inject(ConfigService);
  demo = inject(DemoService);

  popoverOpen = signal(false);

  togglePopover(): void {
    this.popoverOpen.update(v => !v);
  }

  closePopover(): void {
    this.popoverOpen.set(false);
  }

  resetData(): void {
    this.demo.resetSessionData();
    window.location.reload();
  }
}
