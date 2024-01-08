import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalProductosComponent } from '../modales/modal-productos/modal-productos.component';
import { Productos } from '../model/productos';
import { ProductosService } from '../service/productos.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  @ViewChild(ModalProductosComponent) modalProductos!: ModalProductosComponent;

  productos: Productos[];
  validateForm: FormGroup;

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarProductos: { id?: string, nombreProducto: string, descripcion: string, funcionalidades: string }[] = [];
  sortOrderNombreProducto: NzTableSortOrder = 'ascend';

  isVisible = false;
  isOkLoading = false;

  constructor(private productosService: ProductosService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getProductos();
  }

  ngAfterViewInit(): void {
    // Escuchar el evento del componente hijo
    this.modalProductos.childReady.subscribe(() => {
    // Realizar las acciones necesarias cuando el componente hijo esté listo
    // Puedes realizar acciones adicionales después de cerrar el modal, si es necesario
    this.getProductos();
    });
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

  getProductos(): void {
    this.productosService.getListarProductos().subscribe(data => {
      this.productos = [];
      data.forEach((element: any) => {
        this.productos.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data()
        });
      });

      // Asigna los valores a this.listarProductos
      this.listarProductos = this.productos;
    });
  }

  ordenarNombreProducto(sortOrder: NzTableSortOrder | null = null) {
    // Si sortOrder no se proporciona, alternar entre ascendente y descendente
    if (!sortOrder) {
      this.sortOrderNombreProducto = this.sortOrderNombreProducto === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreProducto = sortOrder;
    }
  
    const ascendente = this.sortOrderNombreProducto === 'ascend';
  
    // Obtener una copia de la lista de empresas para no modificar la original
    const productosOrdenados = [...this.listarProductos];
  
    productosOrdenados.sort((a, b) => {
      const nombreA = a.nombreProducto.toUpperCase();
      const nombreB = b.nombreProducto.toUpperCase();
  
      let comparacion = 0;
      if (nombreA > nombreB) {
        comparacion = 1;
      } else if (nombreA < nombreB) {
        comparacion = -1;
      }
  
      return ascendente ? comparacion : comparacion * -1;
    });
  
    // Asignar la lista ordenada a la propiedad listarEmpresas
    this.listarProductos = productosOrdenados;
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0 && params.sort[0].key === 'nombreProducto') {
      this.ordenarNombreProducto(params.sort[0].value);
    }
    // Agregar lógica para otros parámetros de ordenación si es necesario
  }

  async createProducto(nuevoProducto: Productos): Promise<void> {
    await this.productosService.crearProducto(nuevoProducto);
    this.getProductos(); // Recarga las empresas después de crear una nueva
  }

  reiniciarDatos(): void {
    this.getProductos();
  }

  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  showModal() {
    this.modalProductos.showModal();
  }

  editarProducto(producto?: Partial<Productos>): void {
    if (this.modalProductos) {
      console.log('método editarProducto: ', producto);
  
      // Llama a showModal con la empresa que se está editando (o sin argumentos para un nuevo registro)
      this.modalProductos.showModal(producto);
    } else {
      console.log('Error: No se proporcionó un objeto ModalProductoComponent.');
    }
  }
   
  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }
}
