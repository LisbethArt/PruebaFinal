import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Sucursales } from '../../model/sucursales';
import { ModalSucursalesService } from '../service/modal-sucursales.service';
import { SucursalesComponent } from '../../component/sucursales.component';
import { Timestamp } from '@firebase/firestore';

@Component({
  selector: 'app-modal-sucursales',
  templateUrl: './modal-sucursales.component.html',
  styleUrls: ['./modal-sucursales.component.css']
})
export class ModalSucursalesComponent implements OnInit, AfterViewInit {
  @Input() sucursalesComponent: SucursalesComponent;
  @Input() sucursalEditando: Partial<Sucursales>;  // Nueva propiedad para recibir datos de empresa a editar
  @Output() childReady = new EventEmitter<void>();

  titulo = 'Crear nueva sucursal';

  validateForm: FormGroup;

  isVisible = false;
  isOkLoading = false;

  editando = false;
  sucursalOriginal: Partial<Sucursales>;
  categorias: string[] = [];

  dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  horarios = [];

  horarioForm = new FormGroup({
    dia: new FormControl('', Validators.required),
    horaInicio: new FormControl(null, Validators.required),
    horaFin: new FormControl(null, Validators.required)
  });

  agregarHorario() {
    if (this.horarioForm.valid) {
      const { dia, horaInicio, horaFin } = this.horarioForm.value;
      const horario = { dia, horaInicio, horaFin };
      this.horarios.push(horario);
      this.validateForm.get('horariosSucursal').setValue([...this.validateForm.get('horariosSucursal').value, horario]);
      this.horarioForm.reset();
    } else {
      // Muestra un mensaje de error
    }
  }
  
  borrarHorario(index: number) {
    this.horarios.splice(index, 1);
    this.validateForm.get('horariosSucursal').setValue(this.horarios);
  }

  diaSeleccionado(dia: string): boolean {
    return this.horarios.some(horario => horario.dia === dia);
  }

  constructor(private modalSucursalesService: ModalSucursalesService, private cd: ChangeDetectorRef) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.isVisible = false; // o true, dependiendo de tu lógica
    this.setFormValues();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sucursalEditando'] && changes['sucursalEditando'].currentValue) {
      this.setFormValues();
    }
  }

  ngAfterViewInit(): void {
    // Emitir evento cuando el componente esté listo
    this.childReady.emit();
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreSucursal: new FormControl('', Validators.required),
      tipoSucursal: new FormControl('', Validators.required),
      direccion: new FormControl('', Validators.required),
      ubicacion: new FormGroup({
        latitud: new FormControl(null, Validators.required),
        longitud: new FormControl(null, Validators.required)
      }),
      estado: new FormControl('Activo', Validators.required),
      nombreResponsable: new FormControl('', Validators.required),
      correo: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.required),
      horariosSucursal: new FormControl([], Validators.required),
      fechaCreacion: new FormControl(''),
    });
  }

  setFormValues(): void {
    if (this.sucursalEditando) {
      console.log('setFormValues Sucursal: ', this.sucursalEditando);
  
      // Convierte los objetos Timestamp a Date
      this.horarios = this.sucursalEditando.horariosSucursal ? (this.sucursalEditando.horariosSucursal as unknown as Array<{ dia: string, horaInicio: Timestamp, horaFin: Timestamp }>).map(horario => {
        return {
          dia: horario.dia,
          horaInicio: horario.horaInicio.toDate(),
          horaFin: horario.horaFin.toDate()
        };
      }) : [];
  
      this.validateForm.patchValue({
        nombreSucursal: this.sucursalEditando.nombreSucursal || '',
        tipoSucursal: this.sucursalEditando.tipoSucursal || '',
        direccion: this.sucursalEditando.direccion || '',
        ubicacion: this.sucursalEditando.ubicacion || { latitud: null, longitud: null },
        estado: this.sucursalEditando.estado || 'Activo',
        nombreResponsable: this.sucursalEditando.nombreResponsable || '',
        correo: this.sucursalEditando.correo || '',
        telefono: this.sucursalEditando.telefono || '',
        horariosSucursal: this.horarios,
        fechaCreacion: this.sucursalEditando.fechaCreacion || '',
      });
      this.cd.detectChanges();
      console.log('validateForm', this.validateForm.value);
    }
  }

  async submitForm(): Promise<void> {
    // Marca todos los controles como 'touched' para que se muestren los mensajes de error
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    console.log('Form status', this.validateForm.status);
    console.log('Form controls', this.validateForm.controls);
  
    // Verifica si el formulario es válido antes de proceder
    if (this.validateForm.valid) {
      this.isOkLoading = true; // Inicia la animación de carga
  
      // Establece la fecha de creación al momento actual solo si estamos en modo de creación
      if (!this.editando) {
        this.validateForm.get('fechaCreacion').setValue(new Date());
      }
  
      const nuevaSucursal = new Sucursales({
        ...this.validateForm.value,
        ubicacion: this.validateForm.value.ubicacion, // No necesitas crear una nueva instancia de Ubicacion
        horariosSucursal: this.horarios // Asegúrate de que los horarios se envíen correctamente
      });
      // Si hay datos para editar, agrega el ID al objeto
      if (this.sucursalEditando && this.sucursalEditando.id) {
        nuevaSucursal.id = this.sucursalEditando.id;
      }
  
      await this.createSucursal(nuevaSucursal);
  
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

  showModal(sucursal?: Partial<Sucursales>): void {
    // Reinicia el formulario antes de establecer cualquier valor
    this.validateForm.reset();
  
    if (sucursal) {
      // Modo edición
      this.titulo = 'Editar sucursal';
      this.sucursalOriginal = { ...sucursal };  // Guarda los datos originales
      this.sucursalEditando = { ...sucursal };

      this.editando = true;  // Estamos en modo de edición
    } else {
      // Modo creación
      this.titulo = 'Crear nueva sucursal';
      this.sucursalEditando = {};
      this.editando = false;  // No estamos en modo de edición

      this.horarioForm.reset();
    }
  
    // Muestra el modal después de configurar el estado
    this.isVisible = true;
  
    // Actualiza el formulario con la información de la sucursal que se está editando
    if (sucursal) {
      this.setFormValues();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  
    // Si estamos en modo de edición, restaura los datos originales
    if (this.editando) {
      this.sucursalEditando = { ...this.sucursalOriginal };
    } else {
      // Si estamos en modo de creación, elimina cualquier dato nuevo
      this.validateForm.reset(); // Limpia el formulario cuando se cancela
    }
  }

  async createSucursal(nuevaSucursal: Sucursales): Promise<void> {
    // Convertir el objeto sucursal a un objeto plano
    const sucursalData = { ...nuevaSucursal };
  
    // Asegurarse de que el estado de la sucursal se guarda correctamente
    sucursalData.estado = this.validateForm.get('estado').value;
  
    // Eliminar propiedades no deseadas o convertirlas según sea necesario
    delete sucursalData.id;  // Si id no debe incluirse en los datos de Firestore
  
    if (nuevaSucursal.id) {
      // Si hay ID, es una edición
      await this.modalSucursalesService.editarSucursal(nuevaSucursal.id, sucursalData);
    } else {
      // Si no hay ID, es una creación
      await this.modalSucursalesService.crearSucursal(sucursalData);
    }
  
    // Verifica que this.sucursalesComponent esté definido antes de llamar al método
    if (this.sucursalesComponent && this.sucursalesComponent.getSucursales) {
      this.sucursalesComponent.getSucursales();
    }
  }

}
