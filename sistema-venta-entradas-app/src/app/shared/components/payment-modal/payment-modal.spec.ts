import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentModal } from './payment-modal';

describe('PaymentModal', () => {
  let component: PaymentModal;
  let fixture: ComponentFixture<PaymentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
