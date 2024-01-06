import { Component, OnInit, AfterViewInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { EmpresasService } from '../service/empresas.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Empresas, RedesSociales } from '../model/empresas';
import { NzTableSortOrder } from 'ng-zorro-antd/table';
import { ModalEmpresasComponent } from '../modales/modal-empresas/modal-empresas.component';
import * as XLSX from 'xlsx';

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
  listarEmpresas: { id?: string, nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: boolean }[] = [];
  sortOrderNombreComercial: NzTableSortOrder = 'ascend';

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
      estado: new FormControl(false, Validators.required),
      imagenes: new FormControl([]),
      categoria: new FormControl('', Validators.required),
      direccion: new FormControl(''),
      quienesSomos: new FormControl('', Validators.required),
      nombreContacto: new FormControl('', Validators.required),
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

  // En algún lugar donde necesites obtener detalles de una empresa por su ID
  getDetallesEmpresaPorId(id: string): void {
    this.empresasService.getEmpresaId(id).subscribe(
      (empresa: any) => {
        // Manipula los datos de la empresa según tus necesidades
        console.log(empresa.payload.data());
        // Puedes llamar a otros métodos o establecer propiedades en tu componente aquí
      },
      (error) => {
        console.error('Error al obtener la empresa por ID:', error);
      }
    );
  }


  ordenarNombreComercial(sortOrder: NzTableSortOrder | null = null) {
    // Si sortOrder no se proporciona, alternar entre ascendente y descendente
    if (!sortOrder) {
      this.sortOrderNombreComercial = this.sortOrderNombreComercial === 'ascend' ? 'descend' : 'ascend';
    } else {
      this.sortOrderNombreComercial = sortOrder;
    }
  
    const ascendente = this.sortOrderNombreComercial === 'ascend';
  
    // Obtener una copia de la lista de empresas para no modificar la original
    const empresasOrdenadas = [...this.listarEmpresas];
  
    empresasOrdenadas.sort((a, b) => {
      const nombreA = a.nombreComercial.toUpperCase();
      const nombreB = b.nombreComercial.toUpperCase();
  
      let comparacion = 0;
      if (nombreA > nombreB) {
        comparacion = 1;
      } else if (nombreA < nombreB) {
        comparacion = -1;
      }
  
      return ascendente ? comparacion : comparacion * -1;
    });
  
    // Asignar la lista ordenada a la propiedad listarEmpresas
    this.listarEmpresas = empresasOrdenadas;
  }
    
  manejarQueryParams(params: NzTableQueryParams): void {
    if (params && params.sort && params.sort.length > 0 && params.sort[0].key === 'nombreComercial') {
      this.ordenarNombreComercial(params.sort[0].value);
    }
    // Agregar lógica para otros parámetros de ordenación si es necesario
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