import { Component, OnInit } from '@angular/core';
import { EmpresasService } from '../service/empresas.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Empresas, RedesSociales } from '../model/empresas';

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

  isVisible = false;
  isOkLoading = false;

  constructor(private empresasService: EmpresasService) { 
    this.initForm();
  }

  ngOnInit(): void {
    this.loadEmpresasData();
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

  // Método para cargar datos de empresas con ordenación y paginación
  async loadEmpresasData(sortField?: string, sortOrder?: 'ascend' | 'descend'): Promise<void> {
    this.loading = true;
    // Llama al servicio con parámetros de paginación y ordenación
    this.listarEmpresas = await this.empresasService.ordenarEmpresas(
      this.pageIndex,
      this.pageSize,
      sortField,
      sortOrder
    );
    this.loading = false;
  }

  // Método que maneja los cambios en los parámetros de consulta
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;

    // Asegúrate de que sortOrder sea de tipo '"ascend" | "descend"'
    const sortOrder: 'ascend' | 'descend' | null = (currentSort && currentSort.value) as 'ascend' | 'descend' | null;

    this.loadEmpresasData(sortField, sortOrder);
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
    this.loadEmpresasData(); // Recarga las empresas después de crear una nueva
  }

  reiniciarDatos(): void {
    this.loadEmpresasData();
  }
  
}