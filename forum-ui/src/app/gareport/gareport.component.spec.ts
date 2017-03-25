import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GareportComponent } from './gareport.component';

describe('GareportComponent', () => {
  let component: GareportComponent;
  let fixture: ComponentFixture<GareportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GareportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GareportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
