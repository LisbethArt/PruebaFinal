import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';
import { ServiciosComponent } from '../../component/servicios.component';
import { Servicios } from '../../model/servicios';
import { ModalServiciosService } from '../service/modal-servicios.service';

@Component({
  selector: 'app-modal-servicios',
  templateUrl: './modal-servicios.component.html',
  styleUrls: ['./modal-servicios.component.css']
})
export class ModalServiciosComponent implements OnInit, AfterViewInit {
  @Input() serviciosComponent: ServiciosComponent;
  @Input() servicioEditando: Partial<Servicios>;  // Nueva propiedad para recibir datos de empresa a editar
  @Output() childReady = new EventEmitter<void>();

  titulo = 'Crear nuevo servicio';

  validateForm: FormGroup;

  isVisible = false;
  isOkLoading = false;

  editando = false;
  servicioOriginal: Partial<Servicios>;
  empresas: string[] = [];

  constructor(private modalServiciosService: ModalServiciosService, private cd: ChangeDetectorRef, private storage: AngularFireStorage) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.isVisible = false;  
    this.setFormValues();
    this.modalServiciosService.getEmpresas().subscribe(empresas => {
    this.empresas = empresas;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['servicioEditando'] && changes['servicioEditando'].currentValue) {
      this.setFormValues();
    }
  }

  ngAfterViewInit(): void {
    // Emitir evento cuando el componente esté listo
    this.childReady.emit();
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreServicio: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      fecha: new FormControl(null, Validators.required),  // Cambiado de '' a null
      costo: new FormControl(0),  // Cambiado de '' a 0
      iva: new FormControl('', Validators.required),
      descripcionServicio: new FormControl('', Validators.required),
      duracionServicio: new FormControl(null),
      empresa: new FormControl('', Validators.required),
      fechaCreacion: new FormControl(''),  // Cambiado de '' a null
    });
    // Agrega el listener aquí
    this.validateForm.get('costo').valueChanges.subscribe(value => {
      if (typeof value === 'number') {
        value = value.toFixed(2);
        this.validateForm.get('costo').patchValue(value, {emitEvent: false});
      } else {
        const strValue = value.toString();
        const decimalIndex = strValue.indexOf('.');
        if (decimalIndex !== -1 && strValue.length > decimalIndex + 3) {
          this.validateForm.get('costo').patchValue(parseFloat(strValue.slice(0, decimalIndex + 3)), {emitEvent: false});
        }
      }
    });
  }

  setFormValues(): void {
    if (this.servicioEditando) {
  
      this.validateForm.patchValue({
        nombreServicio: this.servicioEditando.nombreServicio || '',
        descripcion: this.servicioEditando.descripcion || '',
        fecha: this.servicioEditando.fecha || null,
        costo: this.servicioEditando.costo ? Number(this.servicioEditando.costo) : 0,
        iva: this.servicioEditando.iva || '',
        descripcionServicio: this.servicioEditando.descripcionServicio || '',
        duracionServicio: Array.isArray(this.servicioEditando.duracionServicio)
          ? this.servicioEditando.duracionServicio.map(timestamp => new Date(((timestamp as any).seconds * 1000) + ((timestamp as any).nanoseconds / 1000000))) 
          : [null, null],
        empresa: this.servicioEditando.empresa || '',
        fechaCreacion: this.servicioEditando.fechaCreacion || '',
      });
      this.cd.detectChanges();
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
  
      // Establece la fecha de creación al momento actual solo si estamos en modo de creación
      if (!this.editando) {
        this.validateForm.get('fechaCreacion').setValue(new Date());
      }
  
      const nuevoServicio = new Servicios(this.validateForm.value);
      // Si hay datos para editar, agrega el ID al objeto
      if (this.servicioEditando && this.servicioEditando.id) {
        nuevoServicio.id = this.servicioEditando.id;
      }
  
      await this.createServicio(nuevoServicio);
  
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

  showModal(servicio?: Partial<Servicios>): void {
    // Reinicia el formulario antes de abrir el modal
    this.validateForm.reset();
  
    if (servicio) {
      // Modo edición
      this.titulo = 'Editar servicio';
      this.servicioOriginal = { ...servicio };  // Guarda los datos originales
      this.servicioEditando = { ...servicio };

      this.editando = true;  // Estamos en modo de edición
    } else {
      // Modo creación
      this.titulo = 'Crear nuevo servicio';
      this.servicioEditando = {};
      this.editando = false;  // No estamos en modo de edición

      // Restablece el campo duracionServicio a un valor nulo
      this.validateForm.get('duracionServicio').setValue([null, null]);
    }
  
    // Muestra el modal después de configurar el estado
    this.isVisible = true;
  
    // Actualiza el formulario con la información de la empresa que se está editando
    if (servicio) {
      this.setFormValues();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  
    // Si estamos en modo de edición, restaura los datos originales
    if (this.editando) {
      this.servicioEditando = { ...this.servicioOriginal };
    } else {
      // Si estamos en modo de creación, elimina cualquier dato nuevo
      this.validateForm.reset(); // Limpia el formulario cuando se cancela
    }
  }

  async createServicio(nuevoServicio: Servicios): Promise<void> {
    // Convertir el objeto Empresas a un objeto plano
    const servicioData = { ...nuevoServicio };

    // Eliminar propiedades no deseadas o convertirlas según sea necesario
    delete servicioData.id;  // Si id no debe incluirse en los datos de Firestore
  
    if (nuevoServicio.id) {
      // Si hay ID, es una edición
      await this.modalServiciosService.editarServicio(nuevoServicio.id, servicioData);
    } else {
      // Si no hay ID, es una creación
      await this.modalServiciosService.crearServicio(servicioData);
    }
  
    // Verifica que this.serviciosComponent esté definido antes de llamar al método
    if (this.serviciosComponent && this.serviciosComponent.getServicios) {
      this.serviciosComponent.getServicios();
    }
  }

  onCalendarChange(event: any): void {
  }
  
  onOk(event: any): void {
  }
}