import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DemoBannerComponent } from './demo-banner.component';
import { ConfigService } from '../../services/config.service';
import { DemoService } from '../../services/demo/demo.service';
import { signal } from '@angular/core';

function makeConfigService(demoMode: boolean) {
  return { demoMode: signal(demoMode) };
}

function makeDemoService() {
  return {
    demoRole: signal<'owner' | 'customer'>('owner'),
    setRole: jasmine.createSpy('setRole'),
    resetSessionData: jasmine.createSpy('resetSessionData'),
  };
}

describe('DemoBannerComponent', () => {
  let component: DemoBannerComponent;
  let fixture: ComponentFixture<DemoBannerComponent>;
  let mockConfig: ReturnType<typeof makeConfigService>;
  let mockDemo: ReturnType<typeof makeDemoService>;

  async function setup(demoMode: boolean) {
    mockConfig = makeConfigService(demoMode);
    mockDemo = makeDemoService();

    await TestBed.configureTestingModule({
      imports: [DemoBannerComponent],
      providers: [
        { provide: ConfigService, useValue: mockConfig },
        { provide: DemoService, useValue: mockDemo },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should not render when demo mode is off', async () => {
    await setup(false);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.demo-chip')).toBeNull();
  });

  it('should render the DEMO MODE chip when demo mode is on', async () => {
    await setup(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.demo-chip')).toBeTruthy();
    expect(el.querySelector('.demo-chip')?.textContent?.trim()).toBe('DEMO MODE');
  });

  it('should toggle popover on chip click', async () => {
    await setup(true);
    expect(component.popoverOpen()).toBe(false);
    component.togglePopover();
    expect(component.popoverOpen()).toBe(true);
    component.togglePopover();
    expect(component.popoverOpen()).toBe(false);
  });

  it('should close popover on close button click', async () => {
    await setup(true);
    component.popoverOpen.set(true);
    fixture.detectChanges();
    const closeBtn = (fixture.nativeElement as HTMLElement).querySelector('.popover-close') as HTMLButtonElement;
    closeBtn.click();
    expect(component.popoverOpen()).toBe(false);
  });

  it('should show role toggle buttons in popover', async () => {
    await setup(true);
    component.popoverOpen.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const roleBtns = el.querySelectorAll('.role-btn');
    expect(roleBtns.length).toBe(2);
    expect(roleBtns[0].textContent?.trim()).toBe('Shop Owner');
    expect(roleBtns[1].textContent?.trim()).toBe('Customer');
  });

  it('should call setRole when a role button is clicked', async () => {
    await setup(true);
    component.popoverOpen.set(true);
    fixture.detectChanges();
    const customerBtn = (fixture.nativeElement as HTMLElement).querySelectorAll('.role-btn')[1] as HTMLButtonElement;
    customerBtn.click();
    expect(mockDemo.setRole).toHaveBeenCalledWith('customer');
  });

  it('should call resetSessionData on reset', async () => {
    await setup(true);
    // Call resetData but prevent the real reload from executing
    spyOn(component, 'resetData').and.callFake(() => {
      mockDemo.resetSessionData();
    });
    component.resetData();
    expect(mockDemo.resetSessionData).toHaveBeenCalled();
  });
});
