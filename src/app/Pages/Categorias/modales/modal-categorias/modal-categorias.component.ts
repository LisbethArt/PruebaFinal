import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CategoriasComponent } from '../../component/categorias.component';
import { Categorias } from '../../model/categorias';
import { ModalCategoriasService } from '../service/modal-categorias.service';

@Component({
  selector: 'app-modal-categorias',
  templateUrl: './modal-categorias.component.html',
  styleUrls: ['./modal-categorias.component.css']
})
export class ModalCategoriasComponent implements OnInit, AfterViewInit {
  @Input() categoriasComponent: CategoriasComponent;
  @Input() categoriaEditando: Partial<Categorias>;  // Nueva propiedad para recibir datos de empresa a editar
  @Output() childReady = new EventEmitter<void>();

  titulo = 'Crear nueva categoría';

  validateForm: FormGroup;

  isVisible = false;
  isOkLoading = false;

  editando = false;
  categoriaOriginal: Partial<Categorias>;

  constructor(private modalCategoriasService: ModalCategoriasService, private cd: ChangeDetectorRef, private storage: AngularFireStorage) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.isVisible = false;  
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
      nombreCategoria: new FormControl('', Validators.required),
      descripcion: new FormControl(''),
      estado: new FormControl('Activo', Validators.required),
      fechaCreacion: new FormControl(''),
    });
  }

  setFormValues(): void {
    if (this.categoriaEditando) {
      console.log('Método setFormValues Categorias: ', this.categoriaEditando);

      this.validateForm.patchValue({
        nombreCategoria: this.categoriaEditando.nombreCategoria,
        descripcion: this.categoriaEditando.descripcion || '',
        estado: this.categoriaEditando.estado || 'Activo', // Asegura que el estado se establece correctamente
        fechaCreacion: this.categoriaEditando.fechaCreacion,
      });

      this.cd.detectChanges();
      console.log('Categorias validateForm value after patch:', this.validateForm.value);  // Imprime los valores del formulario después de la actualización
    }
  }

  async submitForm(): Promise<void> {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
  
    // Verifica si el formulario es válido antes de proceder
    if (this.validateForm.valid) {
      this.isOkLoading = true; // Inicia la animación de carga
  
      // Establece la fecha de creación al momento actual solo si no estamos en modo de edición
      if (!this.editando) {
        this.validateForm.get('fechaCreacion').setValue(new Date());
      }
  
      const nuevaCategoria = new Categorias(this.validateForm.value);
      // Si hay datos para editar, agrega el ID al objeto
      if (this.categoriaEditando && this.categoriaEditando.id) {
        nuevaCategoria.id = this.categoriaEditando.id;
      }
  
      await this.createCategoria(nuevaCategoria);
  
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

  showModal(categoria?: Partial<Categorias>): void {
    // Reinicia el formulario antes de abrir el modal
    this.validateForm.reset();
  
    if (categoria) {
      // Modo edición
      this.titulo = 'Editar categoría';
      this.categoriaOriginal = { ...categoria };  // Guarda los datos originales
      this.categoriaEditando = { ...categoria };

      this.editando = true;  // Estamos en modo de edición
    } else {
      // Modo creación
      this.titulo = 'Crear nueva categoría';
      this.categoriaEditando = {};
      this.editando = false;  // No estamos en modo de edición
    }
  
    // Muestra el modal después de configurar el estado
    this.isVisible = true;
  
    // Actualiza el formulario con la información de la empresa que se está editando
    if (categoria) {
      this.setFormValues();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  
    // Si estamos en modo de edición, restaura los datos originales
    if (this.editando) {
      this.categoriaEditando = { ...this.categoriaOriginal };
    } else {
      // Si estamos en modo de creación, elimina cualquier dato nuevo
      this.validateForm.reset(); // Limpia el formulario cuando se cancela
    }
  }

  async createCategoria(nuevaCategoria: Categorias): Promise<void> {
    // Convertir el objeto Empresas a un objeto plano
    const categoriaData = { ...nuevaCategoria };

    // Eliminar propiedades no deseadas o convertirlas según sea necesario
    delete categoriaData.id;  // Si id no debe incluirse en los datos de Firestore
  
    if (nuevaCategoria.id) {
      // Si hay ID, es una edición
      await this.modalCategoriasService.editarCategoria(nuevaCategoria.id, categoriaData);
    } else {
      // Si no hay ID, es una creación
      await this.modalCategoriasService.crearCategoria(categoriaData);
    }
  
    // Verifica que this.categoriasComponent esté definido antes de llamar al método
    if (this.categoriasComponent && this.categoriasComponent.getCategorias) {
      this.categoriasComponent.getCategorias();
    }
  }
}