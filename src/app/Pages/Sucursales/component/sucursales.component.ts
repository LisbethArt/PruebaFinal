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
  listarSucursales: { id?: string, nombreSucursal: string, tipoSucursal: string, direccion: { latitud: number, longitud: number }, estado: string }[] = [];
  sortOrderNombreSucursal: NzTableSortOrder = 'ascend';

  isVisible = false;
  isOkLoading = false;

  isMapVisible = false;
  direccionSucursal = { latitud: 0, longitud: 0 };

  constructor(private sucursalesService: SucursalesService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getSucursales();
  }

  ngAfterViewInit(): void {
    // Escuchar el evento del componente hijo
    this.modalSucursales.childReady.subscribe(() => {
    // Realizar las acciones necesarias cuando el componente hijo esté listo
    // Puedes realizar acciones adicionales después de cerrar el modal, si es necesario
    this.getSucursales();
    });
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreSucursal: new FormControl('', Validators.required),
      tipoSucursal: new FormControl('', Validators.required),
      direccion: new FormGroup({ // Cambia esto a un FormGroup
        latitud: new FormControl(null, Validators.required),
        longitud: new FormControl(null, Validators.required)
      }),
      estado: new FormControl('Activo', Validators.required),
      nombreResponsable: new FormControl('', Validators.required),
      correo: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.required),
      horariosSucursal: new FormControl([], Validators.required),
    });
  }

  getSucursales() {
    this.sucursalesService.getListarSucursales().subscribe(data => {
      this.sucursales = [];
      data.forEach((element: any) => {
        this.sucursales.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
          direccion: { // Asegúrate de manejar la dirección como un objeto
            latitud: element.payload.doc.data().direccion.latitud,
            longitud: element.payload.doc.data().direccion.longitud
          }
        });
      });
  
      // Asigna los valores a this.listarSucursales
      this.listarSucursales = this.sucursales;
    });
  }

  ordenarNombreSucursal(sortOrder: NzTableSortOrder | null = null) {
    // Si sortOrder no se proporciona, alternar entre ascendente y descendente
    if (!sortOrder) {
      this.sortOrderNombreSucursal = this.sortOrderNombreSucursal === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreSucursal = sortOrder;
    }
  
    const ascendente = this.sortOrderNombreSucursal === 'ascend';
  
    // Obtener una copia de la lista de empresas para no modificar la original
    const sucursalesOrdenadas = [...this.listarSucursales];
  
    sucursalesOrdenadas.sort((a, b) => {
      const nombreA = a.nombreSucursal.toUpperCase();
      const nombreB = b.nombreSucursal.toUpperCase();
  
      let comparacion = 0;
      if (nombreA > nombreB) {
        comparacion = 1;
      } else if (nombreA < nombreB) {
        comparacion = -1;
      }
  
      return ascendente ? comparacion : comparacion * -1;
    });
  
    // Asignar la lista ordenada a la propiedad listarEmpresas
    this.listarSucursales = sucursalesOrdenadas;
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0 && params.sort[0].key === 'nombreSucursal') {
      this.ordenarNombreSucursal(params.sort[0].value);
    }
    // Agregar lógica para otros parámetros de ordenación si es necesario
  }

  async createSucursal(nuevaSucursal: Sucursales): Promise<void> {
    await this.sucursalesService.crearSucursal(nuevaSucursal);
    this.getSucursales(); // Recarga las empresas después de crear una nueva
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

  getDireccion(id: string) {
    // Primero, obtén la lista de sucursales
    this.getSucursales();
  
    // Luego, encuentra la sucursal con el ID especificado
    const sucursal = this.sucursales.find(sucursal => sucursal.id === id);
  
    // Si la sucursal existe, actualiza direccionSucursal con su dirección
    if (sucursal) {
      this.direccionSucursal = sucursal.direccion;
    }
  }
} 