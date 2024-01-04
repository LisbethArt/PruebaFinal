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

  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarEmpresas: { nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: boolean }[] = [];

  isVisible = false;
  isOkLoading = false;

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

  constructor(private empresasService: EmpresasService) { }

  ngOnInit(): void {
    this.loadEmpresasData();
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
;
} }