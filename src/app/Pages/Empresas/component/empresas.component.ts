import { Component, OnInit } from '@angular/core';
import { EmpresasService } from '../service/empresas.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {
  loading: boolean = false;
  total: number = 0;
  pageSize: number = 10;
  pageIndex: number = 1;
  listarEmpresas: { nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: boolean }[] = [];

  constructor(private empresasService: EmpresasService) { }

  ngOnInit(): void {
    this.loadEmpresasData();
  }

  // Método para cargar datos de empresas con ordenación y paginación
  loadEmpresasData(sortField?: string, sortOrder?: 'ascend' | 'descend'): void {
    this.loading = true;
    // Llama al servicio con parámetros de paginación y ordenación
    this.listarEmpresas = this.empresasService.ordenarEmpresas(
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
}