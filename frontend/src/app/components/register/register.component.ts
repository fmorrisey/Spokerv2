import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');

  private isStrongPassword(password: string): boolean {
    // Require at least 8 characters, with at least one lowercase letter,
    // one uppercase letter, one digit, and one special character.
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return strongPasswordRegex.test(password);
  }

  async onSubmit(): Promise<void> {
    if (!this.name || !this.email || !this.password) {
      this.error.set('All fields are required');
      return;
    }
    if (!this.isStrongPassword(this.password)) {
      this.error.set('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.register(this.email, this.password, this.name);
      this.router.navigate(['/']);
    } catch (err: any) {
      const statusCode = err?.status ?? err?.statusCode;
      if (statusCode === 409) {
        this.error.set('Email is already registered');
      } else {
        this.error.set('Registration failed. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
