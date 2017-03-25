import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentModerationComponent } from './comment-moderation.component';

describe('CommentModerationComponent', () => {
  let component: CommentModerationComponent;
  let fixture: ComponentFixture<CommentModerationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentModerationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
