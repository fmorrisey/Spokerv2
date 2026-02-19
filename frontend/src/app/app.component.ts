import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { DemoBannerComponent } from './components/demo-banner/demo-banner.component';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, DemoBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Spoker v2';
  private config = inject(ConfigService);

  async ngOnInit(): Promise<void> {
    await this.config.loadConfig();
  }
}
