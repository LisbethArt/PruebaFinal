import { Component, OnInit, AfterViewInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';
import { Productos } from '../../model/productos';
import { ModalProductosService } from '../service/modal-productos.service';
import { ProductosComponent } from '../../component/productos.component';

@Component({
  selector: 'app-modal-productos',
  templateUrl: './modal-productos.component.html',
  styleUrls: ['./modal-productos.component.css']
})
export class ModalProductosComponent  implements OnInit, AfterViewInit {
  @Input() productosComponent: ProductosComponent;
  @Input() productoEditando: Partial<Productos>;  // Nueva propiedad para recibir datos de empresa a editar
  @Output() childReady = new EventEmitter<void>();

  titulo = 'Crear nuevo producto';

  validateForm: FormGroup;

  isVisible = false;
  isOkLoading = false;

  multimedia: string[] = [];
  multimediaRefs: AngularFireStorageReference[] = [];
  editando = false;
  productoOriginal: Partial<Productos>;
  empresas: string[] = [];
  private imageCount = 0;
  private videoCount = 0;

  constructor(private modalProductosService: ModalProductosService, private cd: ChangeDetectorRef, private storage: AngularFireStorage) { 
    this.initForm();
    this.multimedia = [];
  }

  ngOnInit(): void {
    this.isVisible = false;  
    this.setFormValues();
    this.modalProductosService.getEmpresas().subscribe(empresas => {
    this.empresas = empresas;
  });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoEditando'] && changes['productoEditando'].currentValue) {
      this.setFormValues();
    }
  }

  ngAfterViewInit(): void {
    // Emitir evento cuando el componente esté listo
    this.childReady.emit();
  }

  initForm(): void { 
    this.validateForm = new FormGroup({
      nombreProducto: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      funcionalidades: new FormControl('', Validators.required),
      multimedia: new FormControl([]),
      texto: new FormControl('', Validators.required),
      descripcionCaracteristica: new FormControl('', Validators.required),
      empresa: new FormControl('', Validators.required),
      fechaCreacion: new FormControl(''),
    });
  }

  setFormValues(): void {
    if (this.productoEditando) {
  
      // Si hay datos para editar, establece los valores en el formulario
      this.validateForm.patchValue({
        nombreProducto: this.productoEditando.nombreProducto || '',
        descripcion: this.productoEditando.descripcion || '',
        funcionalidades: this.productoEditando.funcionalidades || '',
        multimedia: this.productoEditando.multimedia || [],
        texto: this.productoEditando.texto || '',
        descripcionCaracteristica: this.productoEditando.descripcionCaracteristica || '',
        empresa: this.productoEditando.empresa || '',
        fechaCreacion: this.productoEditando.fechaCreacion || '',
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
  
      const nuevoProducto = new Productos(this.validateForm.value);
      // Si hay datos para editar, agrega el ID al objeto
      if (this.productoEditando && this.productoEditando.id) {
        nuevoProducto.id = this.productoEditando.id;
      }
  
      await this.createProducto(nuevoProducto);
  
      // Cierra el modal solo si el formulario es válido
      this.isOkLoading = false; // Detiene la animación de carga
      this.closeModal();
  
      // Limpia el formulario
      this.validateForm.reset();
      this.resetCounters();
    }
  }

  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
    this.resetCounters();
  }

  showModal(producto?: Partial<Productos>): void {
    // Reinicia el formulario antes de establecer cualquier valor
    this.validateForm.reset();
  
    // Reinicia el array de imágenes
    this.multimedia = [];
  
    if (producto) {
      // Modo edición
      this.titulo = 'Editar producto';
      this.productoOriginal = { ...producto };  // Guarda los datos originales
      this.productoEditando = { ...producto };
      // Asigna las imágenes de la empresa a editar al array 'imagenes'
      this.multimedia = producto.multimedia || [];
      this.editando = true;  // Estamos en modo de edición
    } else {
      // Modo creación
      this.titulo = 'Crear nuevo producto';
      this.productoEditando = {};
      this.editando = false;  // No estamos en modo de edición
    }
  
    // Muestra el modal después de configurar el estado
    this.isVisible = true;
  
    // Actualiza el formulario con la información de la empresa que se está editando
    if (producto) {
      this.setFormValues();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  
    // Si estamos en modo de edición, restaura los datos originales
    if (this.editando) {
      this.productoEditando = { ...this.productoOriginal };
      this.multimedia = this.productoOriginal.multimedia || [];
    } else {
      // Si estamos en modo de creación, elimina cualquier dato nuevo
      this.validateForm.reset(); // Limpia el formulario cuando se cancela
  
      // Eliminar todas las imágenes subidas
      this.multimediaRefs.forEach(ref => {
        ref.delete().subscribe(() => {
        }, error => {
        });
      });
  
      // Limpiar el array de referencias a imágenes
      this.multimediaRefs = [];
      this.resetCounters();
    }
  }

  async createProducto(nuevoProducto: Productos): Promise<void> {
    // Convertir el objeto Empresas a un objeto plano
    const productoData = { ...nuevoProducto };
  
    // Agregar las URLs de las imágenes al objeto de datos de la empresa
    productoData.multimedia = this.multimedia;

    // Eliminar propiedades no deseadas o convertirlas según sea necesario
    delete productoData.id;  // Si id no debe incluirse en los datos de Firestore
  
    if (nuevoProducto.id) {
      // Si hay ID, es una edición
      await this.modalProductosService.editarProducto(nuevoProducto.id, productoData);
    } else {
      // Si no hay ID, es una creación
      await this.modalProductosService.crearProducto(productoData);
    }
  
    // Verifica que this.productosComponent esté definido antes de llamar al método
    if (this.productosComponent && this.productosComponent.getProductos) {
      this.productosComponent.getProductos();
    }
  }
  
  subirMultimedia($event: any) {
    const file = $event.target.files[0];
  
    // Validar el tipo de archivo
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi'];
    const validFileTypes = [...validImageTypes, ...validVideoTypes];
  
    if (!validFileTypes.includes(file.type)) {
      alert('Solo se permiten archivos jpg, jpeg, png y videos mp4, mov, avi.');
      return;
    }
  
    // Validar el tamaño del archivo (6MB max para imágenes, 50MB max para videos)
    let maxSizeMB;
    if (validImageTypes.includes(file.type)) {
      maxSizeMB = 6;
      if (this.imageCount >= 3) {
        alert('Solo puedes subir un máximo de 3 imágenes.');
        return;
      }
      this.imageCount++;
    } else if (validVideoTypes.includes(file.type)) {
      maxSizeMB = 50;
      if (this.videoCount >= 1) {
        alert('Solo puedes subir un máximo de 1 video.');
        return;
      }
      this.videoCount++;
      }
  
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`El tamaño del archivo no debe superar los ${maxSizeMB}MB.`);
      return;
    }
  
    const multiRef = this.storage.ref(`productos/${file.name}`);
  
    // Guardar la referencia a la imagen subida
    this.multimediaRefs.push(multiRef);
  
    const uploadTask = this.storage.upload(`productos/${file.name}`, file);
  
    uploadTask.then(response => {
      // Obtén la URL de la imagen subida y agrégala al array de imágenes
      response.ref.getDownloadURL().then(url => {
        this.multimedia.push(url);
      });
    }).catch();
  }

  resetCounters() {
    this.imageCount = 0;
    this.videoCount = 0;
  }

  eliminarMultimedia(event: Event, multimediaUrl: string) {
    event.preventDefault();
    event.stopImmediatePropagation();
  
    // Extraer el nombre del archivo de la URL de la imagen
    const fileRef = this.storage.refFromURL(multimediaUrl);
  
    // Intenta descargar la imagen
    fileRef.getDownloadURL().subscribe(() => {
      // Si la imagen existe, elimínala
      fileRef.delete().subscribe(() => {
        // Crea un nuevo array sin la imagen eliminada
        this.multimedia = this.multimedia.filter(img => img !== multimediaUrl);
  
        // Forzar la actualización de la vista
        this.cd.detectChanges();
      }, error => {
      });
    }, () => {
      // Si la imagen no existe, simplemente elimínala del array
      this.multimedia = this.multimedia.filter(img => img !== multimediaUrl);
  
      // Forzar la actualización de la vista
      this.cd.detectChanges();
    });
  }
}