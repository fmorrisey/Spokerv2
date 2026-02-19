import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth/auth.service';
import { ConfigService } from './services/config.service';
import { DemoService } from './services/demo/demo.service';
import { ApiClientService } from './services/apiClient/api-client.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let mockAuthService: any;
  let mockConfigService: any;
  let mockDemoService: any;
  let mockApiClientService: any;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: signal(false),
      currentUser: signal(null),
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
    };

    mockConfigService = {
      demoMode: signal(false),
      loadConfig: jasmine.createSpy('loadConfig').and.returnValue(Promise.resolve()),
    };

    mockDemoService = {
      demoRole: signal('owner'),
      setRole: jasmine.createSpy('setRole'),
      resetSessionData: jasmine.createSpy('resetSessionData'),
    };

    mockApiClientService = {
      getClient: jasmine.createSpy('getClient').and.returnValue({
        GET: jasmine.createSpy('GET').and.returnValue(Promise.resolve({ data: null })),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DemoService, useValue: mockDemoService },
        { provide: ApiClientService, useValue: mockApiClientService },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Spoker v2' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Spoker v2');
  });

  it('should render nav', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-nav')).toBeTruthy();
  });

  it('should call loadConfig on init', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.componentInstance.ngOnInit();
    expect(mockConfigService.loadConfig).toHaveBeenCalled();
  });

  it('should render demo banner element', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-demo-banner')).toBeTruthy();
  });
});
