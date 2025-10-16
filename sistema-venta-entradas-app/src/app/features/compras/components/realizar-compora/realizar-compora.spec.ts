import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealizarCompora } from './realizar-compora';

describe('RealizarCompora', () => {
  let component: RealizarCompora;
  let fixture: ComponentFixture<RealizarCompora>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealizarCompora]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealizarCompora);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
