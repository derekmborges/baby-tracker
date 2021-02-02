import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SleepComponent } from './sleep.component';

describe('SleepTrackerComponent', () => {
  let component: SleepComponent;
  let fixture: ComponentFixture<SleepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SleepComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SleepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
