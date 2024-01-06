import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Empresas, RedesSociales } from '../../model/empresas';
import { ModalEmpresasService } from '../service/modal-empresas.service';
import { EmpresasComponent } from '../../component/empresas.component';

@Component({
  selector: 'app-modal-empresas',
  templateUrl: './modal-empresas.component.html',
  styleUrls: ['./modal-empresas.component.css']
})
export class ModalEmpresasComponent implements OnInit, AfterViewInit {
  @Input() empresasComponent: EmpresasComponent;
  @Input() empresaEditando: Partial<Empresas>;  // Nueva propiedad para recibir datos de empresa a editar
  @Output() childReady = new EventEmitter<void>();

  titulo = 'Crear nueva empresa';

  validateForm: FormGroup;

  isVisible = false;
  isOkLoading = false;

  constructor(private modalEmpresasService: ModalEmpresasService, private cd: ChangeDetectorRef) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.isVisible = false; // o true, dependiendo de tu lógica
    this.setFormValues();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['empresaEditando'] && changes['empresaEditando'].currentValue) {
      this.setFormValues();
    }
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
    if (this.empresaEditando) {
      console.log('método setFormValues: ', this.empresaEditando);  // Imprime los datos de empresaEditando
  
      // Si hay datos para editar, establece los valores en el formulario
      this.validateForm.patchValue({
        nombreComercial: this.empresaEditando.nombreComercial || '',
        razonSocial: this.empresaEditando.razonSocial || '',
        actividadEconomica: this.empresaEditando.actividadEconomica || '',
        estado: this.empresaEditando.estado || false,
        imagenes: this.empresaEditando.imagenes || [],
        categoria: this.empresaEditando.categoria || '',
        direccion: this.empresaEditando.direccion || '',
        quienesSomos: this.empresaEditando.quienesSomos || '',
        nombreContacto: this.empresaEditando.nombreContacto || '',
        telefono: this.empresaEditando.telefono || '',
        correo: this.empresaEditando.correo || '',
        redesSociales: {
          linkedin: this.empresaEditando.redesSociales?.linkedin || '',
          twitter: this.empresaEditando.redesSociales?.twitter || '',
          facebook: this.empresaEditando.redesSociales?.facebook || '',
          instagram: this.empresaEditando.redesSociales?.instagram || '',
        },
        fechaCreacion: this.empresaEditando.fechaCreacion || '',
      });
      // Forzar una detección de cambios
      this.cd.detectChanges();
      console.log('validateForm value after patch:', this.validateForm.value);  // Imprime los valores del formulario después de la actualización
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
      // Si hay datos para editar, agrega el ID al objeto
      if (this.empresaEditando && this.empresaEditando.id) {
        nuevaEmpresa.id = this.empresaEditando.id;
      }

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

  showModal(empresa?: Partial<Empresas>): void {
    // Reinicia el formulario antes de abrir el modal
    this.validateForm.reset();
  
    if (empresa) {
      // Modo edición
      this.titulo = 'Editar empresa';
      this.empresaEditando = { ...empresa };
    } else {
      // Modo creación
      this.titulo = 'Crear nueva empresa';
      this.empresaEditando = {};
    }
  
    // Muestra el modal después de configurar el estado
    this.isVisible = true;
  
    // Actualiza el formulario con la información de la empresa que se está editando
    if (empresa) {
      this.setFormValues();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

  async createEmpresa(nuevaEmpresa: Empresas): Promise<void> {
    // Convertir el objeto Empresas a un objeto plano
    const empresaData = { ...nuevaEmpresa };
  
    // Eliminar propiedades no deseadas o convertirlas según sea necesario
    delete empresaData.id;  // Si id no debe incluirse en los datos de Firestore
  
    if (nuevaEmpresa.id) {
      // Si hay ID, es una edición
      await this.modalEmpresasService.editarEmpresa(nuevaEmpresa.id, empresaData);
    } else {
      // Si no hay ID, es una creación
      await this.modalEmpresasService.crearEmpresa(empresaData);
    }
  
    // Verifica que this.empresasComponent esté definido antes de llamar al método
    if (this.empresasComponent && this.empresasComponent.getEmpresas) {
      this.empresasComponent.getEmpresas();
    }
  }  
}