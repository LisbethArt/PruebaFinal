import { Component, OnInit } from '@angular/core';
import { EmpresasService } from '../service/empresas.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Empresas, RedesSociales } from '../model/empresas';
import { NzTableSortOrder } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
  empresas: Empresas[];
  nuevaEmpresa: Empresas = {
    ...new Empresas(),
    redesSociales: {}
  };
  validateForm: FormGroup;

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarEmpresas: { nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: boolean }[] = [];
  sortOrderNombreComercial: NzTableSortOrder = 'ascend';

  isVisible = false;
  isOkLoading = false;

  constructor(private empresasService: EmpresasService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.getEmpresas();
    this.setFormValues();
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

  setFormValues(): void {
    this.validateForm.patchValue({
      nombreComercial: this.nuevaEmpresa.nombreComercial ?? '',
      razonSocial: this.nuevaEmpresa.razonSocial ?? '',
      actividadEconomica: this.nuevaEmpresa.actividadEconomica ?? '',
      estado: this.nuevaEmpresa.estado ?? '',
      imagenes: this.nuevaEmpresa.imagenes ?? '',
      categoria: this.nuevaEmpresa.categoria ?? '',
      direccion: this.nuevaEmpresa.direccion ?? '',
      quienesSomos: this.nuevaEmpresa.quienesSomos ?? '',
      nombreContacto: this.nuevaEmpresa.nombreContacto ?? '',
      telefono: this.nuevaEmpresa.telefono ?? '',
      correo: this.nuevaEmpresa.correo ?? '',
      redesSociales: {
        linkedin: this.nuevaEmpresa.redesSociales.linkedin ?? '',
        twitter: this.nuevaEmpresa.redesSociales.twitter ?? '',
        facebook: this.nuevaEmpresa.redesSociales.facebook ?? '',
        instagram: this.nuevaEmpresa.redesSociales.instagram ?? '',
      },
      fechaCreacion: this.nuevaEmpresa.fechaCreacion ?? '',
    });
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cancela
  }

  /*// Método de ordenamiento por defecto
  async loadEmpresasData(sortField: string = 'nombreComercial', sortOrder: 'ascend' | 'descend' | 'default' = 'default'): Promise<void> {
    this.loading = true;

    if (sortOrder === 'default') {
      // Si sortOrder es 'default', usa ordenarEmpresasPorFechaDescendente
      this.listarEmpresas = await this.empresasService.ordenarEmpresasPorFecha();
    } else {
      // Si sortOrder no es 'default', llama al servicio con parámetros de paginación y ordenación
      this.listarEmpresas = await this.empresasService.ordenarEmpresas(
        this.pageIndex,
        this.pageSize,
        sortField,
        sortOrder
      );
    }

    this.loading = false;
  }*/

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
  
      console.log(this.listarEmpresas);
    });
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
    // Agrega lógica para otros parámetros de ordenación si es necesario
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
  
      // Establece la fecha de creación al momento actual
      this.validateForm.get('fechaCreacion').setValue(new Date());
  
      const nuevaEmpresa = new Empresas(this.validateForm.value);
      await this.createEmpresa(nuevaEmpresa);
  
      // Cierra el modal solo si el formulario es válido
      this.isOkLoading = false; // Detiene la animación de carga
      this.closeModal();
  
      // Limpia el formulario
      this.validateForm.reset();
    }
  }
  
  closeModal(): void {
    this.isVisible = false;
    this.validateForm.reset(); // Limpia el formulario cuando se cierra
  }

  async createEmpresa(nuevaEmpresa: Empresas): Promise<void> {
    await this.empresasService.crearEmpresa(nuevaEmpresa);
    this.getEmpresas(); // Recarga las empresas después de crear una nueva
  }

  reiniciarDatos(): void {
    this.getEmpresas();
  }
}