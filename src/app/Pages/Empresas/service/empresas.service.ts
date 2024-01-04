import { Injectable } from '@angular/core';
import { Empresas } from '../model/empresas';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  private empresas: Empresas[] = [
    {
      nombreComercial: 'A Empresa A',
      razonSocial: 'Razón Social A',
      actividadEconomica: 'Actividad A',
      estado: true,
      imagenes: ['imagen1.jpg', 'imagen2.jpg'],
      categoria: 'Categoría 1',
      direccion: 'Dirección A',
      quienesSomos: 'Somos una empresa A',
      nombreContacto: 'Contacto A',
      telefono: '123456789',
      correo: 'correoA@example.com',
      redesSociales: {
        linkedin: 'linkedin.com/empresaA',
        twitter: 'twitter.com/empresaA',
        facebook: 'facebook.com/empresaA',
        instagram: 'instagram.com/empresaA',
      },
      fechaCreacion: new Date(),
    },
    {
      nombreComercial: 'B Empresa B',
      razonSocial: 'Razón Social B',
      actividadEconomica: 'Actividad B',
      estado: false,
      imagenes: ['imagen3.jpg', 'imagen4.jpg'],
      categoria: 'Categoría 2',
      quienesSomos: 'Somos una empresa B',
      nombreContacto: 'Contacto B',
      correo: 'correoB@example.com',
      fechaCreacion: new Date(),
    },
    // Agrega más datos de empresas según sea necesario
  ];

  constructor() { }

  // Método para obtener solo los campos requeridos para el listado
  getListarEmpresas(): { nombreComercial: string, razonSocial: string, actividadEconomica: string, estado: boolean }[] {
    return this.empresas.map(emp => ({
      nombreComercial: emp.nombreComercial,
      razonSocial: emp.razonSocial,
      actividadEconomica: emp.actividadEconomica,
      estado: emp.estado
    }));
  }

  // Método para obtener datos con ordenación y paginación
  ordenarEmpresas(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: 'ascend' | 'descend' | null
  ): Empresas[] {
    // Simula obtener datos del servidor
    const empresasCopy = [...this.empresas];

    // Aplica la ordenación si es necesario
    if (sortField && sortOrder) {
      empresasCopy.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];

        if (sortOrder === 'ascend') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
    }

    // Aplica la paginación
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEmpresas = empresasCopy.slice(startIndex, endIndex);

    return paginatedEmpresas;
  }
}