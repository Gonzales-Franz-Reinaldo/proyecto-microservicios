import { TestBed } from '@angular/core/testing';

import { Compras } from './compras';

describe('Compras', () => {
  let service: Compras;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Compras);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
