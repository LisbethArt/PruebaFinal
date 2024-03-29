import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';
import { Empresas } from '../../model/empresas';
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

  imagenes: string[] = [];
  imagenesRefs: AngularFireStorageReference[] = [];
  editando = false;
  empresaOriginal: Partial<Empresas>;
  categorias: string[] = [];

  constructor(private modalEmpresasService: ModalEmpresasService, private cd: ChangeDetectorRef, private storage: AngularFireStorage) { 
    this.initForm();
    this.imagenes = [];
  }

  ngOnInit(): void {
    this.isVisible = false;  
    this.setFormValues();
    this.modalEmpresasService.getCategorias().subscribe(categorias => {
    this.categorias = categorias;
  });
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

  telefonoValidador(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const valid = /^\d{4}-\d{4}$/.test(control.value);
      return valid ? null : {invalidNumber: {value: control.value}};
    };
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreComercial: new FormControl('', Validators.required),
      razonSocial: new FormControl('', Validators.required),
      actividadEconomica: new FormControl('', Validators.required),
      estado: new FormControl('Activo', Validators.required),
      imagenes: new FormControl([], Validators.required),
      categoria: new FormControl('', Validators.required),
      direccion: new FormControl(''),
      quienesSomos: new FormControl('', Validators.required),
      nombreContacto: new FormControl(''),
      telefono: new FormControl('', [Validators.required, this.telefonoValidador()]),
      correo: new FormControl('', [Validators.required, Validators.email]),
      redesSociales: new FormGroup({
        linkedin: new FormControl(''),
        twitter: new FormControl(''),
        facebook: new FormControl(''),
        instagram: new FormControl(''),
      }),
      fechaCreacion: new FormControl(''),
    });
    // Agrega el listener aquí
    this.validateForm.get('telefono').valueChanges.subscribe(value => {
      if (value.length === 4 && !value.includes('-')) {
        this.validateForm.get('telefono').setValue(value + '-');
      }
    });
  }

  setFormValues(): void {
    if (this.empresaEditando) {
  
      // Si hay datos para editar, establece los valores en el formulario
      this.validateForm.patchValue({
        nombreComercial: this.empresaEditando.nombreComercial || '',
        razonSocial: this.empresaEditando.razonSocial || '',
        actividadEconomica: this.empresaEditando.actividadEconomica || '',
        estado: this.empresaEditando.estado || 'Activo', // Asegura que el estado se establece correctamente
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
    // Reinicia el formulario antes de establecer cualquier valor
    this.validateForm.reset();
  
    // Reinicia el array de imágenes
    this.imagenes = [];
  
    if (empresa) {
      // Modo edición
      this.titulo = 'Editar empresa';
      this.empresaOriginal = { ...empresa };  // Guarda los datos originales
      this.empresaEditando = { ...empresa };
      // Asigna las imágenes de la empresa a editar al array 'imagenes'
      this.imagenes = empresa.imagenes || [];
      this.editando = true;  // Estamos en modo de edición
    } else {
      // Modo creación
      this.titulo = 'Crear nueva empresa';
      this.empresaEditando = {};
      this.editando = false;  // No estamos en modo de edición
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
  
    // Si estamos en modo de edición, restaura los datos originales
    if (this.editando) {
      this.empresaEditando = { ...this.empresaOriginal };
      this.imagenes = this.empresaOriginal.imagenes || [];
    } else {
      // Si estamos en modo de creación, elimina cualquier dato nuevo
      this.validateForm.reset(); // Limpia el formulario cuando se cancela
  
      // Eliminar todas las imágenes subidas
      this.imagenesRefs.forEach(ref => {
        ref.delete().subscribe(() => {
        }, error => {
        });
      });
  
      // Limpiar el array de referencias a imágenes
      this.imagenesRefs = [];
    }
  }

  async createEmpresa(nuevaEmpresa: Empresas): Promise<void> {
    // Convertir el objeto Empresas a un objeto plano
    const empresaData = { ...nuevaEmpresa };
  
    // Agregar las URLs de las imágenes al objeto de datos de la empresa
    empresaData.imagenes = this.imagenes;
  
    // Asegurarse de que el estado de la empresa se guarda correctamente
    empresaData.estado = this.validateForm.get('estado').value;
  
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
  
  subirImagenes($event: any) {
  const file = $event.target.files[0];

  // Validar el tipo de archivo
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validFileTypes.includes(file.type)) {
    alert('Solo se permiten archivos jpg, jpeg y png.');
    return;
  }

  // Validar el tamaño del archivo (6MB max)
  const maxSizeMB = 6;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    alert(`El tamaño del archivo no debe superar los ${maxSizeMB}MB.`);
    return;
  }

  const imgRef = this.storage.ref(`empresas/${file.name}`);

  // Guardar la referencia a la imagen subida
  this.imagenesRefs.push(imgRef);

  const uploadTask = this.storage.upload(`empresas/${file.name}`, file);

  uploadTask.then(response => {
    // Obtén la URL de la imagen subida y agrégala al array de imágenes
    response.ref.getDownloadURL().then(url => {
      this.imagenes.push(url);
    });
  }).catch();
}

  eliminarImagen(event: Event, imagenUrl: string) {
    event.preventDefault();
    event.stopImmediatePropagation();
  
    // Extraer el nombre del archivo de la URL de la imagen
    const fileRef = this.storage.refFromURL(imagenUrl);
  
    // Intenta descargar la imagen
    fileRef.getDownloadURL().subscribe(() => {
      // Si la imagen existe, elimínala
      fileRef.delete().subscribe(() => {
        // Crea un nuevo array sin la imagen eliminada
        this.imagenes = this.imagenes.filter(img => img !== imagenUrl);
  
        // Forzar la actualización de la vista
        this.cd.detectChanges();
      }, error => {
      });
    }, () => {
      // Si la imagen no existe, simplemente elimínala del array
      this.imagenes = this.imagenes.filter(img => img !== imagenUrl);
  
      // Forzar la actualización de la vista
      this.cd.detectChanges();
    });
  }
}