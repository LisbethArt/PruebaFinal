import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalServiciosComponent } from './modal-servicios.component';

describe('ModalServiciosComponent', () => {
  let component: ModalServiciosComponent;
  let fixture: ComponentFixture<ModalServiciosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalServiciosComponent]
    });
    fixture = TestBed.createComponent(ModalServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
