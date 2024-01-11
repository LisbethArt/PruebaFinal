import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ModalEmpresasComponent } from '../modales/modal-empresas/modal-empresas.component';
import { Empresas } from '../model/empresas';
import { EmpresasService } from '../service/empresas.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit, AfterViewInit {
  @ViewChild(ModalEmpresasComponent) modalEmpresas!: ModalEmpresasComponent;

  empresas: Empresas[];
  validateForm: FormGroup;

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarEmpresas: { id?: string, nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: string }[] = [];
  sortOrderNombreComercial: NzTableSortOrder = 'ascend';
  sortOrderFechaCreacion: NzTableSortOrder = 'descend'; // Ordena por fechaCreacion en orden descendente por defecto
  nombreComercialClicked: boolean = false;
  nombreComercialClick(): void {
    this.nombreComercialClicked = true;
  }

  isVisible = false;
  isOkLoading = false;

  constructor(private empresasService: EmpresasService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getEmpresas();
  }

  ngAfterViewInit(): void {
    // Escuchar el evento del componente hijo
    this.modalEmpresas.childReady.subscribe(() => {
    // Realizar las acciones necesarias cuando el componente hijo esté listo
    // Puedes realizar acciones adicionales después de cerrar el modal, si es necesario
    this.getEmpresas();
    });
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
      telefono: new FormControl(''),
      correo: new FormControl('', [Validators.required, Validators.email]),
      redesSociales: new FormGroup({
        linkedin: new FormControl(''),
        twitter: new FormControl(''),
        facebook: new FormControl(''),
        instagram: new FormControl(''),
      }),
      fechaCreacion: new FormControl(''),
    });
  }

  getEmpresas() {
    this.empresasService.getListarEmpresas().subscribe(data => {
      this.empresas = [];
      data.forEach((element: any) => {
        this.empresas.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data()
        });
      });
  
      // Asigna los valores a this.listarEmpresas
      this.listarEmpresas = this.empresas;
  
      //console.log(this.listarEmpresas);
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
    const empresasOrdenadas = [...this.listarEmpresas];
  
    empresasOrdenadas.sort((a: Empresas, b: Empresas) => {
      const fechaA = new Date(a.fechaCreacion);
      const fechaB = new Date(b.fechaCreacion);
    
      return ascendente ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  
    // Asignar la lista ordenada a la propiedad listarEmpresas
    this.listarEmpresas = empresasOrdenadas;
  }

  ordenarNombreComercial = (a: Empresas, b: Empresas) => {
    const nombreA = a.nombreComercial.toUpperCase();
    const nombreB = b.nombreComercial.toUpperCase();
  
    let comparacion = 0;
    if (nombreA > nombreB) {
      comparacion = 1;
    } else if (nombreA < nombreB) {
      comparacion = -1;
    }
  
    return this.sortOrderNombreComercial === 'ascend' ? comparacion : comparacion * -1;
  };
    
  cambiarOrdenNombreComercial(sortOrder: NzTableSortOrder | null = null) {
    if (!sortOrder) {
      this.sortOrderNombreComercial = this.sortOrderNombreComercial === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreComercial = sortOrder;
    }
  
    this.listarEmpresas.sort(this.ordenarNombreComercial);
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0) {
      if (params.sort[0].key === 'nombreComercial' && this.nombreComercialClicked) {
        this.cambiarOrdenNombreComercial(params.sort[0].value);
      } else if (params.sort[0].key === 'fechaCreacion') {
        this.ordenarFechaCreacion(params.sort[0].value);
      }
    }
  }

  async createEmpresa(nuevaEmpresa: Empresas): Promise<void> {
    await this.empresasService.crearEmpresa(nuevaEmpresa);
    this.getEmpresas(); // Recarga las empresas después de crear una nueva
  }

  reiniciarDatos(): void {
    this.getEmpresas();
  }

  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  showModal() {
    this.modalEmpresas.showModal();
  }

  editarEmpresa(empresa?: Partial<Empresas>): void {
    if (this.modalEmpresas) {
      console.log('método editarEmpresa: ', empresa);
  
      // Llama a showModal con la empresa que se está editando (o sin argumentos para un nuevo registro)
      this.modalEmpresas.showModal(empresa);
    } else {
      console.log('Error: No se proporcionó un objeto ModalEmpresasComponent.');
    }
  }
   
  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

  exportarAExcel(): void {
    this.empresasService.getListarEmpresas().subscribe(todasLasEmpresas => {
      const empresasParaExcel = todasLasEmpresas.map(empresa => {
        // Aquí puedes excluir o transformar los campos que necesites
        const { id, fechaCreacion, imagenes, ...restoDeCampos } = empresa.payload.doc.data();
        const redesSociales = restoDeCampos.redesSociales;
        const ordenRedesSociales = ['linkedin', 'twitter', 'facebook', 'instagram'];
        const redesSocialesCadena = ordenRedesSociales
          .map(red => redesSociales[red] ? `${red}: ${redesSociales[red]}` : null)
          .filter(Boolean)
          .join(', ');
  
        return {
          nombreComercial: restoDeCampos.nombreComercial,
          razonSocial: restoDeCampos.razonSocial,
          actividadEconomica: restoDeCampos.actividadEconomica,
          estado: restoDeCampos.estado,
          categoria: restoDeCampos.categoria,
          direccion: restoDeCampos.direccion,
          quienesSomos: restoDeCampos.quienesSomos,
          nombreContacto: restoDeCampos.nombreContacto,
          telefono: restoDeCampos.telefono,
          correo: restoDeCampos.correo,
          redesSociales: redesSocialesCadena
        };
      });
  
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(empresasParaExcel);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Empresas');
  
      /* save to file */
      XLSX.writeFile(wb, 'Empresas.xlsx');
    });
  }
}