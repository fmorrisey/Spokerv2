import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the sign in form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Sign In');
    expect(compiled.querySelector('input[name="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="password"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should show error when fields are empty on submit', async () => {
    component.email = '';
    component.password = '';

    await component.onSubmit();

    expect(component.error()).toBe('Email and password are required');
  });

  it('should call auth.login with correct credentials', async () => {
    mockAuthService.login.and.returnValue(Promise.resolve());
    component.email = 'test@example.com';
    component.password = 'password123';

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show error on login failure', async () => {
    mockAuthService.login.and.returnValue(Promise.reject(new Error('Unauthorized')));
    component.email = 'test@example.com';
    component.password = 'wrong';

    await component.onSubmit();

    expect(component.error()).toBe('Invalid email or password');
  });

  it('should set loading to false after submit completes', async () => {
    mockAuthService.login.and.returnValue(Promise.resolve());
    component.email = 'test@example.com';
    component.password = 'password123';

    await component.onSubmit();

    expect(component.loading()).toBe(false);
  });
});
