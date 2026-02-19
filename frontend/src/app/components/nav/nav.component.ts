import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ConfigService } from '../../services/config.service';
import { DemoService } from '../../services/demo/demo.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  auth = inject(AuthService);
  config = inject(ConfigService);
  demo = inject(DemoService);

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
