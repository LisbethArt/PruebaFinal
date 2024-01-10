import { Component, OnInit, AfterViewInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalCategoriasComponent } from '../modales/modal-categorias/modal-categorias.component';
import { Categorias } from '../model/categorias';
import { CategoriasService } from '../service/categorias.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit, AfterViewInit {
  @ViewChild(ModalCategoriasComponent) modalCategorias!: ModalCategoriasComponent;

  categorias: Categorias[];
  validateForm: FormGroup;

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarCategorias: { id?: string, nombreCategoria: string, descripcion: string, estado: string }[] = [];
  sortOrderNombreCategoria: NzTableSortOrder = 'ascend';
  sortOrderFechaCreacion: NzTableSortOrder = 'descend'; // Ordena por fechaCreacion en orden descendente por defecto
  nombreCategoriaClicked: boolean = false;
  nombreCategoriaClick(): void {
    this.nombreCategoriaClicked = true;
  }

  isVisible = false;
  isOkLoading = false;

  constructor(private categoriasService: CategoriasService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getCategorias();
  }

  ngAfterViewInit(): void {
    // Escuchar el evento del componente hijo
    this.modalCategorias.childReady.subscribe(() => {
    // Realizar las acciones necesarias cuando el componente hijo esté listo
    // Puedes realizar acciones adicionales después de cerrar el modal, si es necesario
    this.getCategorias();
    });
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreCategoria: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      estado: new FormControl('Activo', Validators.required),
      fechaCreacion: new FormControl(''),
    });
  }

  getCategorias(): void {
    this.categoriasService.getListarCategorias().subscribe(data => {
      this.categorias = [];
      data.forEach((element: any) => {
        this.categorias.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data()
        });
      });
  
      // Asigna los valores a this.listarCategorias
      this.listarCategorias = this.categorias;
    });
  }

  ordenarFechaCreacion(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderFechaCreacion = this.sortOrderFechaCreacion === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderFechaCreacion = sortOrder;
    }
  
    const ascendente = this.sortOrderFechaCreacion === 'ascend';
  
    // Obtener una copia de la lista de categorias para no modificar la original
    const categoriasOrdenadas = [...this.listarCategorias];
  
    categoriasOrdenadas.sort((a: Categorias, b: Categorias) => {
      const fechaA = new Date(a.fechaCreacion);
      const fechaB = new Date(b.fechaCreacion);
    
      return ascendente ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  
    // Asignar la lista ordenada a la propiedad listarCategorias
    this.listarCategorias = categoriasOrdenadas;
  }

  ordenarNombreCategoria = (a: Categorias, b: Categorias) => {
    const nombreA = a.nombreCategoria.toUpperCase();
    const nombreB = b.nombreCategoria.toUpperCase();
  
    let comparacion = 0;
    if (nombreA > nombreB) {
      comparacion = 1;
    } else if (nombreA < nombreB) {
      comparacion = -1;
    }
  
    return this.sortOrderNombreCategoria === 'ascend' ? comparacion : comparacion * -1;
  };

  cambiarOrdenNombreCategoria(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderNombreCategoria = this.sortOrderNombreCategoria === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreCategoria = sortOrder;
    }
  
    this.listarCategorias.sort(this.ordenarNombreCategoria);
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0) {
      if (params.sort[0].key === 'nombreCategoria' && this.nombreCategoriaClicked) {
        this.cambiarOrdenNombreCategoria(params.sort[0].value);
      } else if (params.sort[0].key === 'fechaCreacion') {
        this.ordenarFechaCreacion(params.sort[0].value);
      }
    }
  }

  async createCategoria(nuevaCategoria: Categorias): Promise<void> {
  await this.categoriasService.crearCategoria(nuevaCategoria);
    this.getCategorias();
  }

  reiniciarDatos(): void {
    this.getCategorias();
  }

  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  showModal() {
    this.modalCategorias.showModal();
  }

  editarCategoria(categoria?: Partial<Categorias>): void {
    if (this.modalCategorias) {
      console.log('método editarCategoria: ', categoria);
  
      // Llama a showModal con la empresa que se está editando (o sin argumentos para un nuevo registro)
      this.modalCategorias.showModal(categoria);
    } else {
      console.log('Error: No se proporcionó un objeto ModalEmpresasComponent.');
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

}