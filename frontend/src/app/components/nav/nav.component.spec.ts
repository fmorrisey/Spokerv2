import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NavComponent } from './nav.component';
import { AuthService } from '../../services/auth/auth.service';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof signal<boolean>>;
    currentUser: ReturnType<typeof signal<any>>;
    logout: jasmine.Spy;
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: signal(false),
      currentUser: signal(null),
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
    };

    await TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show sign in and register links when not authenticated', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="/login"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="/register"]')).toBeTruthy();
    expect(compiled.querySelector('.btn-logout')).toBeFalsy();
  });

  it('should show sign out button and user name when authenticated', () => {
    mockAuthService.isAuthenticated.set(true);
    mockAuthService.currentUser.set({ name: 'Jane Smith', email: 'jane@example.com', role: 'customer' as const });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.btn-logout')).toBeTruthy();
    expect(compiled.querySelector('.user-name')?.textContent).toContain('Jane Smith');
    expect(compiled.querySelector('a[href="/login"]')).toBeFalsy();
  });

  it('should call auth.logout when sign out is clicked', () => {
    mockAuthService.isAuthenticated.set(true);
    mockAuthService.currentUser.set({ name: 'Jane', email: 'jane@example.com', role: 'customer' as const });
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector('.btn-logout') as HTMLButtonElement;
    logoutBtn.click();

    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
