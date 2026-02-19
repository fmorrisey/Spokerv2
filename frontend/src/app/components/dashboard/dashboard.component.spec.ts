import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ConfigService } from '../../services/config.service';
import { DemoService } from '../../services/demo/demo.service';
import { ApiClientService } from '../../services/apiClient/api-client.service';
import { signal } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const mockConfigService = { demoMode: signal(false) };
    const mockDemoService = {
      demoRole: signal('owner'),
      initSessionData: jasmine.createSpy('initSessionData'),
      getAll: jasmine.createSpy('getAll').and.returnValue([]),
    };
    const mockApiClientService = {
      getClient: jasmine.createSpy('getClient').and.returnValue({
        GET: jasmine.createSpy('GET').and.returnValue(Promise.resolve({ data: [], error: null })),
        POST: jasmine.createSpy('POST').and.returnValue(Promise.resolve({ data: null, error: null })),
        PUT: jasmine.createSpy('PUT').and.returnValue(Promise.resolve({ data: null, error: null })),
        DELETE: jasmine.createSpy('DELETE').and.returnValue(Promise.resolve({ error: null })),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DemoService, useValue: mockDemoService },
        { provide: ApiClientService, useValue: mockApiClientService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
