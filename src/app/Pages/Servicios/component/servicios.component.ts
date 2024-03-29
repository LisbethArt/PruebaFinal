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
  listarServicios: { id?: string, nombreServicio: string, descripcion: string, fecha: Date, costo: number, iva: string, descripcionServicio: string, duracionServicio: Date[], empresa: string }[] = [];
  sortOrderNombreServicio: NzTableSortOrder = 'ascend';
  sortOrderFechaCreacion: NzTableSortOrder = 'descend'; // Ordena por fechaCreacion en orden descendente por defecto
  nombreServicioClicked: boolean = false;
  nombreServicioClick(): void {
    this.nombreServicioClicked = true;
  }

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
      duracionServicio: new FormControl([null, null]),
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
      // Asigna los valores a this.listarServicios
      this.listarServicios = this.servicios;
    });
  }

  ordenarFechaCreacion(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderFechaCreacion = this.sortOrderFechaCreacion === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderFechaCreacion = sortOrder;
    }
  
    const ascendente = this.sortOrderFechaCreacion === 'ascend';
  
    // Obtener una copia de la lista de servicios para no modificar la original
    const serviciosOrdenados = [...this.listarServicios];
  
    serviciosOrdenados.sort((a: Servicios, b: Servicios) => {
      const fechaA = new Date(a.fechaCreacion);
      const fechaB = new Date(b.fechaCreacion);
    
      return ascendente ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  
    // Asignar la lista ordenada a la propiedad listarServicios
    this.listarServicios = serviciosOrdenados;
  }

  ordenarNombreServicio = (a: Servicios, b: Servicios) => {
    const nombreA = a.nombreServicio.toUpperCase();
    const nombreB = b.nombreServicio.toUpperCase();
  
    let comparacion = 0;
    if (nombreA > nombreB) {
      comparacion = 1;
    } else if (nombreA < nombreB) {
      comparacion = -1;
    }
  
    return this.sortOrderNombreServicio === 'ascend' ? comparacion : comparacion * -1;
  };

  cambiarOrdenNombreServicio(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderNombreServicio = this.sortOrderNombreServicio === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreServicio = sortOrder;
    }
  
    this.listarServicios.sort(this.ordenarNombreServicio);
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0) {
      if (params.sort[0].key === 'nombreServicio' && this.nombreServicioClicked) {
        this.cambiarOrdenNombreServicio(params.sort[0].value);
      } else if (params.sort[0].key === 'fechaCreacion') {
        this.ordenarFechaCreacion(params.sort[0].value);
      }
    }
  }

  async createServicio(nuevoServicio: Servicios): Promise<void> {
    await this.serviciosService.crearServicio(nuevoServicio);
    this.getServicios(); // Recarga los servicios después de crear uno nuevo
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
      // Llama a showModal con el servicio que se está editando (o sin argumentos para un nuevo registro)
      this.modalServicios.showModal(servicio);
    } else {
    }
  }
   
  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

  formatTimestamps(timestamps: any[]): string {
    if (!Array.isArray(timestamps) || timestamps.length !== 2) {
      return '';
    }
  
    const inicio = new Date(((timestamps[0] as any).seconds * 1000) + ((timestamps[0] as any).nanoseconds / 1000000));
    const fin = new Date(((timestamps[1] as any).seconds * 1000) + ((timestamps[1] as any).nanoseconds / 1000000));
  
    return `${inicio.toLocaleDateString()} ${inicio.toLocaleTimeString()} - ${fin.toLocaleDateString()} ${fin.toLocaleTimeString()}`;
  }
}