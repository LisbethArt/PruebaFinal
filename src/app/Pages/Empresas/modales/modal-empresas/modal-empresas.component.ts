import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Empresas, RedesSociales } from '../../model/empresas';
import { ModalEmpresasService } from '../service/modal-empresas.service';
import { EmpresasComponent } from '../../component/empresas.component';

@Component({
  selector: 'app-modal-empresas',
  templateUrl: './modal-empresas.component.html',
  styleUrls: ['./modal-empresas.component.css']
})
export class ModalEmpresasComponent implements OnInit {
  @Input() empresasComponent: EmpresasComponent;
  @Output() childReady = new EventEmitter<void>();

  empresas: Empresas[];
  nuevaEmpresa: Empresas = {
    ...new Empresas(),
    redesSociales: {}
  };
  validateForm: FormGroup;

  isVisible = false;
  isOkLoading = false;

  constructor(private modalEmpresasService: ModalEmpresasService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.isVisible = false; // o true, dependiendo de tu lógica
    this.setFormValues();
  }

  ngAfterViewInit(): void {
    // Emitir evento cuando el componente esté listo
    this.childReady.emit();
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreComercial: new FormControl('', Validators.required),
      razonSocial: new FormControl('', Validators.required),
      actividadEconomica: new FormControl('', Validators.required),
      estado: new FormControl(false, Validators.required),
      imagenes: new FormControl([]),
      categoria: new FormControl('', Validators.required),
      direccion: new FormControl(''),
      quienesSomos: new FormControl('', Validators.required),
      nombreContacto: new FormControl('', Validators.required),
      telefono: new FormControl(''),
      correo: new FormControl('', [Validators.required, Validators.email]),
      redesSociales: new FormGroup({
        linkedin: new FormControl(''),
        twitter: new FormControl(''),
        facebook: new FormControl(''),
        instagram: new FormControl(''),
      }),
      fechaCreacion: new FormControl(''),
    });
  }

  setFormValues(): void {
    this.validateForm.patchValue({
      nombreComercial: this.nuevaEmpresa.nombreComercial ?? '',
      razonSocial: this.nuevaEmpresa.razonSocial ?? '',
      actividadEconomica: this.nuevaEmpresa.actividadEconomica ?? '',
      estado: this.nuevaEmpresa.estado ?? '',
      imagenes: this.nuevaEmpresa.imagenes ?? '',
      categoria: this.nuevaEmpresa.categoria ?? '',
      direccion: this.nuevaEmpresa.direccion ?? '',
      quienesSomos: this.nuevaEmpresa.quienesSomos ?? '',
      nombreContacto: this.nuevaEmpresa.nombreContacto ?? '',
      telefono: this.nuevaEmpresa.telefono ?? '',
      correo: this.nuevaEmpresa.correo ?? '',
      redesSociales: {
        linkedin: this.nuevaEmpresa.redesSociales.linkedin ?? '',
        twitter: this.nuevaEmpresa.redesSociales.twitter ?? '',
        facebook: this.nuevaEmpresa.redesSociales.facebook ?? '',
        instagram: this.nuevaEmpresa.redesSociales.instagram ?? '',
      },
      fechaCreacion: this.nuevaEmpresa.fechaCreacion ?? '',
    });
  }

  async createEmpresa(nuevaEmpresa: Empresas): Promise<void> {
    // Convertir el objeto Empresas a un objeto plano
    const empresaData = { ...nuevaEmpresa };
  
    // Eliminar propiedades no deseadas o convertirlas según sea necesario
    delete empresaData.id;  // Si id no debe incluirse en los datos de Firestore
  
    await this.modalEmpresasService.crearEmpresa(empresaData);
    
    // Verifica que this.empresasComponent esté definido antes de llamar al método
    if (this.empresasComponent && this.empresasComponent.getEmpresas) {
      this.empresasComponent.getEmpresas();
    }
  }
  
  async submitForm(): Promise<void> {
    // Marca todos los controles como 'touched' para que se muestren los mensajes de error
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  
    // Verifica si el formulario es válido antes de proceder
    if (this.validateForm.valid) {
      this.isOkLoading = true; // Inicia la animación de carga
  
      // Establece la fecha de creación al momento actual
      this.validateForm.get('fechaCreacion').setValue(new Date());
  
      const nuevaEmpresa = new Empresas(this.validateForm.value);
      await this.createEmpresa(nuevaEmpresa);
  
      // Cierra el modal solo si el formulario es válido
      this.isOkLoading = false; // Detiene la animación de carga
      this.closeModal();
  
      // Limpia el formulario
      this.validateForm.reset();
    }
  }
  
  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

}