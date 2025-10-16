import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Update } from './update';

describe('Update', () => {
  let component: Update;
  let fixture: ComponentFixture<Update>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Update]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Update);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
