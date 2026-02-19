import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  config = inject(ConfigService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error.set('Email and password are required');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email)) {
      this.error.set('Please enter a valid email address');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch {
      this.error.set('Invalid email or password');
    } finally {
      this.loading.set(false);
    }
  }
}
