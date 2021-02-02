import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FeedingComponent } from './feeding.component';

describe('FeedingComponent', () => {
  let component: FeedingComponent;
  let fixture: ComponentFixture<FeedingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
