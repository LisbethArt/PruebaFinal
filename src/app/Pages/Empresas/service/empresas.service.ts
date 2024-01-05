import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Empresas } from '../model/empresas';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  constructor(private firestore: AngularFirestore) {}

  // Método para obtener los datos de la colección "empresas" en Firestore
  async getListarEmpresas(): Promise<Empresas[]> {
    const snapshot = await this.firestore.collection<Empresas>('empresas').get().toPromise();
    return snapshot.docs.map(doc => doc.data());
  }

  // Método para crear una nueva empresa
  async crearEmpresa(nuevaEmpresa: Empresas): Promise<void> {
    // Añade la nueva empresa a la colección "empresas" en Firestore
    await this.firestore.collection('empresas').add({ ...nuevaEmpresa });
  }

  // Método para obtener datos con ordenación y paginación
  async ordenarEmpresas(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: 'ascend' | 'descend' | null
  ): Promise<Empresas[]> {
    // Obtiene los datos del servidor
    const empresas = await this.getListarEmpresas();
    const empresasCopy = [...empresas];

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

  // Método para ordenar empresas por fecha de creación
  async ordenarEmpresasPorFecha(): Promise<Empresas[]> {
  const snapshot = await this.firestore.collection<Empresas>('empresas', ref => ref.orderBy('fechaCreacion', 'desc')).get().toPromise();
  return snapshot.docs.map(doc => doc.data());
  }
}