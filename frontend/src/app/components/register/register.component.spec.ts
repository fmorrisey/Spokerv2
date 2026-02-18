import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the register form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Create Account');
    expect(compiled.querySelector('input[name="name"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="password"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="confirmPassword"]')).toBeTruthy();
  });

  it('should show error when fields are empty', async () => {
    component.name = '';
    component.email = '';
    component.password = '';
    component.confirmPassword = '';

    await component.onSubmit();

    expect(component.error()).toBe('All fields are required');
  });

  it('should show error when password is too short', async () => {
    component.name = 'Jane';
    component.email = 'jane@example.com';
    component.password = 'short';
    component.confirmPassword = 'short';

    await component.onSubmit();

    expect(component.error()).toBe('Password must be at least 8 characters');
  });

  it('should show error when passwords do not match', async () => {
    component.name = 'Jane';
    component.email = 'jane@example.com';
    component.password = 'password123';
    component.confirmPassword = 'different123';

    await component.onSubmit();

    expect(component.error()).toBe('Passwords do not match');
  });

  it('should call auth.register with correct data', async () => {
    mockAuthService.register.and.returnValue(Promise.resolve());
    component.name = 'Jane Smith';
    component.email = 'jane@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';

    await component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith('jane@example.com', 'password123', 'Jane Smith');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show error on registration failure', async () => {
    mockAuthService.register.and.returnValue(Promise.reject(new Error('Server error')));
    component.name = 'Jane';
    component.email = 'jane@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password123';

    await component.onSubmit();

    expect(component.error()).toBe('Registration failed. Please try again.');
  });
});
