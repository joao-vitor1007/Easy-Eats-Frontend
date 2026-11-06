import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NovoPedido } from './novo-pedido';

describe('NovoPedido', () => {
  let component: NovoPedido;
  let fixture: ComponentFixture<NovoPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoPedido],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
