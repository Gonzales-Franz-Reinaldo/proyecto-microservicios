import { TestBed } from '@angular/core/testing';

import { Eventos } from './eventos';

describe('Eventos', () => {
  let service: Eventos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Eventos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
