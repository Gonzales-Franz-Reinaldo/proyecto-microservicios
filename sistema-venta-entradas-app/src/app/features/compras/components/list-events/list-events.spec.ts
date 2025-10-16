import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEvents } from './list-events';

describe('ListEvents', () => {
  let component: ListEvents;
  let fixture: ComponentFixture<ListEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
