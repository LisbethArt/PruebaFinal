import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSucursalesComponent } from './modal-sucursales.component';

describe('ModalSucursalesComponent', () => {
  let component: ModalSucursalesComponent;
  let fixture: ComponentFixture<ModalSucursalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalSucursalesComponent]
    });
    fixture = TestBed.createComponent(ModalSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
