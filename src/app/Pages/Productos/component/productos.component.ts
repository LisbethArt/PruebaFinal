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
  sortOrderFechaCreacion: NzTableSortOrder = 'descend'; // Ordena por fechaCreacion en orden descendente por defecto
  nombreProductoClicked: boolean = false;
  nombreProductoClick(): void {
    this.nombreProductoClicked = true;
  }

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

  ordenarFechaCreacion(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderFechaCreacion = this.sortOrderFechaCreacion === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderFechaCreacion = sortOrder;
    }
  
    const ascendente = this.sortOrderFechaCreacion === 'ascend';
  
    // Obtener una copia de la lista de productos para no modificar la original
    const productosOrdenados = [...this.listarProductos];
  
    productosOrdenados.sort((a: Productos, b: Productos) => {
      const fechaA = new Date(a.fechaCreacion);
      const fechaB = new Date(b.fechaCreacion);
    
      return ascendente ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  
    // Asignar la lista ordenada a la propiedad listarProductos
    this.listarProductos = productosOrdenados;
  }

  ordenarNombreProducto = (a: Productos, b: Productos) => {
    const nombreA = a.nombreProducto.toUpperCase();
    const nombreB = b.nombreProducto.toUpperCase();
  
    let comparacion = 0;
    if (nombreA > nombreB) {
      comparacion = 1;
    } else if (nombreA < nombreB) {
      comparacion = -1;
    }
  
    return this.sortOrderNombreProducto === 'ascend' ? comparacion : comparacion * -1;
  };

  cambiarOrdenNombreProducto(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderNombreProducto = this.sortOrderNombreProducto === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreProducto = sortOrder;
    }
  
    this.listarProductos.sort(this.ordenarNombreProducto);
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0) {
      if (params.sort[0].key === 'nombreProducto' && this.nombreProductoClicked) {
        this.cambiarOrdenNombreProducto(params.sort[0].value);
      } else if (params.sort[0].key === 'fechaCreacion') {
        this.ordenarFechaCreacion(params.sort[0].value);
      }
    }
  }

  async createProducto(nuevoProducto: Productos): Promise<void> {
    await this.productosService.crearProducto(nuevoProducto);
    this.getProductos(); // Recarga los productos después de crear uno nuevo
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
      // Llama a showModal con el producto que se está editando (o sin argumentos para un nuevo registro)
      this.modalProductos.showModal(producto);
    } else {
    }
  }
   
  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }
}
