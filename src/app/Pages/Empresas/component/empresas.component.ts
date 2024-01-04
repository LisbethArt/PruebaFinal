import { Component, OnInit } from '@angular/core';
import { EmpresasService } from '../service/empresas.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Empresas } from '../model/empresas';

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

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarEmpresas: { nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: boolean }[] = [];

  isVisible = false;
  isOkLoading = false;

  constructor(private empresasService: EmpresasService) { }

  ngOnInit(): void {
    this.loadEmpresasData();
  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isOkLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isOkLoading = false;
    }, 3000);
  }

  handleCancel(): void {
    this.isVisible = false;
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

  async createEmpresa(): Promise<void> {
    await this.empresasService.crearEmpresa(this.nuevaEmpresa);
    this.loadEmpresasData(); // Recarga las empresas después de crear una nueva
  }
}