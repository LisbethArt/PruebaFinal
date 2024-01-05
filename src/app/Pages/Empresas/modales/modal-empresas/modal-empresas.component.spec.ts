import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEmpresasComponent } from './modal-empresas.component';

describe('ModalEmpresasComponent', () => {
  let component: ModalEmpresasComponent;
  let fixture: ComponentFixture<ModalEmpresasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEmpresasComponent]
    });
    fixture = TestBed.createComponent(ModalEmpresasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
