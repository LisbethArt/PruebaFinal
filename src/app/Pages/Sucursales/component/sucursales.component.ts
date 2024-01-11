import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalSucursalesComponent } from '../modales/modal-sucursales/modal-sucursales.component';
import { Sucursales } from '../model/sucursales';
import { SucursalesService } from '../service/sucursales.service';

@Component({
  selector: 'app-sucursales',
  templateUrl: './sucursales.component.html',
  styleUrls: ['./sucursales.component.css']
})
export class SucursalesComponent  implements OnInit, AfterViewInit {
  @ViewChild(ModalSucursalesComponent) modalSucursales!: ModalSucursalesComponent;

  sucursales: Sucursales[];
  validateForm: FormGroup;

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarSucursales: { id?: string, nombreSucursal: string, tipoSucursal: string, ubicacion: { latitud: number, longitud: number }, estado: string }[] = [];
  sortOrderNombreSucursal: NzTableSortOrder = 'ascend';
  sortOrderFechaCreacion: NzTableSortOrder = 'descend'; // Ordena por fechaCreacion en orden descendente por defecto
  nombreSucursalClicked: boolean = false;
  nombreSucursalClick(): void {
    this.nombreSucursalClicked = true;
  }

  isVisible = false;
  isOkLoading = false;

  isMapVisible = false;
  ubicacionSucursal = { latitud: 0, longitud: 0 };

  constructor(private sucursalesService: SucursalesService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getSucursales();
  }

  ngAfterViewInit(): void {
    // Escuchar el evento del componente hijo
    this.modalSucursales.childReady.subscribe(() => {
    this.getSucursales();
    });
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreSucursal: new FormControl('', Validators.required),
      tipoSucursal: new FormControl('', Validators.required),
      direccion: new FormControl('', Validators.required),
      ubicacion: new FormGroup({ // Cambia esto a un FormGroup
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

  getSucursales() {
    this.sucursalesService.getListarSucursales().subscribe(data => {
      this.sucursales = [];
      data.forEach((element: any) => {
        this.sucursales.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
          ubicacion: { // Asegúrate de manejar la dirección como un objeto
            latitud: element.payload.doc.data().ubicacion.latitud,
            longitud: element.payload.doc.data().ubicacion.longitud
          }
        });
      });
  
      // Asigna los valores a this.listarSucursales
      this.listarSucursales = this.sucursales;
    });
  }

  ordenarFechaCreacion(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderFechaCreacion = this.sortOrderFechaCreacion === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderFechaCreacion = sortOrder;
    }
  
    const ascendente = this.sortOrderFechaCreacion === 'ascend';

    // Obtener una copia de la lista de sucursales para no modificar la original
    const sucursalesOrdenadas = [...this.listarSucursales];
  
    sucursalesOrdenadas.sort((a: Sucursales, b: Sucursales) => {
      const fechaA = new Date(a.fechaCreacion);
      const fechaB = new Date(b.fechaCreacion);
    
      return ascendente ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  
    // Asignar la lista ordenada a la propiedad listarEmpresas
    this.listarSucursales = sucursalesOrdenadas;
  }
    
  ordenarNombreSucursal = (a: Sucursales, b: Sucursales) => {
    const nombreA = a.nombreSucursal.toUpperCase();
    const nombreB = b.nombreSucursal.toUpperCase();
  
    let comparacion = 0;
    if (nombreA > nombreB) {
      comparacion = 1;
    } else if (nombreA < nombreB) {
      comparacion = -1;
    }
  
    return this.sortOrderNombreSucursal === 'ascend' ? comparacion : comparacion * -1;
  };

  cambiarOrdenNombreSucursal(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderNombreSucursal = this.sortOrderNombreSucursal === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreSucursal = sortOrder;
    }
  
    this.listarSucursales.sort(this.ordenarNombreSucursal);
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0) {
      if (params.sort[0].key === 'nombreSucursal' && this.nombreSucursalClicked) {
        this.cambiarOrdenNombreSucursal(params.sort[0].value);
      } else if (params.sort[0].key === 'fechaCreacion') {
        this.ordenarFechaCreacion(params.sort[0].value);
      }
    }
  }

  async createSucursal(nuevaSucursal: Sucursales): Promise<void> {
    await this.sucursalesService.crearSucursal(nuevaSucursal);
    this.getSucursales(); // Recarga las sucursales después de crear una nueva
  }

  reiniciarDatos(): void {
    this.getSucursales();
  }

  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  showModal() {
    this.modalSucursales.showModal();
  }

  editarSucursal(sucursal?: Partial<Sucursales>): void {
    if (this.modalSucursales) {
      console.log('método editarEmpresa: ', sucursal);
  
      // Llama a showModal con la empresa que se está editando (o sin argumentos para un nuevo registro)
      this.modalSucursales.showModal(sucursal);
    } else {
      console.log('Error: No se proporcionó un objeto ModalSucursalesComponent.');
    }
  }
   
  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

  getUbicacion(id: string) {
    // Primero, obtén la lista de sucursales
    this.getSucursales();
  
    // Luego, encuentra la sucursal con el ID especificado
    const sucursal = this.sucursales.find(sucursal => sucursal.id === id);
  
    // Si la sucursal existe, actualiza ubicacionSucursal con su dirección
    if (sucursal) {
      this.ubicacionSucursal = sucursal.ubicacion;
    }
  }
} 