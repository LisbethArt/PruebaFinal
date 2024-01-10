import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalServiciosComponent } from '../modales/modal-servicios/modal-servicios.component';
import { Servicios } from '../model/servicios';
import { ServiciosService } from '../service/servicios.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit, AfterViewInit {
  @ViewChild(ModalServiciosComponent) modalServicios!: ModalServiciosComponent;

  servicios: Servicios[];
  validateForm: FormGroup;

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarServicios: { id?: string, nombreServicio: string, descripcion: string, fecha: Date, costo: number, iva: string, descripcionServicio: string, duracionServicio: Date, empresa: string }[] = [];
  sortOrderNombreServicio: NzTableSortOrder = 'ascend';

  isVisible = false;
  isOkLoading = false;

  constructor(private serviciosService: ServiciosService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getServicios();
  }

  ngAfterViewInit(): void {
    // Escuchar el evento del componente hijo
    this.modalServicios.childReady.subscribe(() => {
    // Realizar las acciones necesarias cuando el componente hijo esté listo
    // Puedes realizar acciones adicionales después de cerrar el modal, si es necesario
    this.getServicios();
    });
  }

  initForm(): void {
    this.validateForm = new FormGroup({
      nombreServicio: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      fecha: new FormControl(null, Validators.required),  // Cambiado de '' a null
      costo: new FormControl(0),  // Cambiado de '' a 0
      iva: new FormControl('', Validators.required),
      descripcionServicio: new FormControl('', Validators.required),
      duracionServicio: new FormControl(null),  // Cambiado de '' a null
      empresa: new FormControl('', Validators.required),
      fechaCreacion: new FormControl(''),  // Cambiado de '' a null
    });
  }

  getServicios(): void {
    this.serviciosService.getListarServicios().subscribe(data => {
      this.servicios = [];
      data.forEach((element: any) => {
        this.servicios.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data()
        });
      });
      this.listarServicios = this.servicios;
    });
  }

  ordenarNombreServicio(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderNombreServicio = this.sortOrderNombreServicio === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreServicio = sortOrder;
    }
  
    const ascendente = this.sortOrderNombreServicio === 'ascend';
  
    // Obtener una copia de la lista de empresas para no modificar la original
    const serviciosOrdenados = [...this.listarServicios];
  
    serviciosOrdenados.sort((a, b) => {
      const nombreA = a.nombreServicio.toUpperCase();
      const nombreB = b.nombreServicio.toUpperCase();
  
      let comparacion = 0;
      if (nombreA > nombreB) {
        comparacion = 1;
      } else if (nombreA < nombreB) {
        comparacion = -1;
      }
  
      return ascendente ? comparacion : comparacion * -1;
    });
  
    // Asignar la lista ordenada a la propiedad listarEmpresas
    this.listarServicios = serviciosOrdenados;
  }

  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0 && params.sort[0].key === 'nombreServicio') {
      this.ordenarNombreServicio(params.sort[0].value);
    }
    // Agregar lógica para otros parámetros de ordenación si es necesario
  }

  async createServicio(nuevoServicio: Servicios): Promise<void> {
    await this.serviciosService.crearServicio(nuevoServicio);
    this.getServicios(); // Recarga las empresas después de crear una nueva
  }

  reiniciarDatos(): void {
    this.getServicios();
  }

  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  showModal() {
    this.modalServicios.showModal();
  }

  editarServicio(servicio?: Partial<Servicios>): void {
    if (this.modalServicios) {
      console.log('método editarServicio: ', servicio);
  
      // Llama a showModal con la empresa que se está editando (o sin argumentos para un nuevo registro)
      this.modalServicios.showModal(servicio);
    } else {
      console.log('Error: No se proporcionó un objeto ModalEmpresasComponent.');
    }
  }
   
  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }
}