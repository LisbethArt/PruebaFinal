import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresasService {
  constructor(private firestore: AngularFirestore) {}

  crearEmpresa(empresa: any): Promise<any> {
    return this.firestore.collection('empresas').add(empresa);
  }

  getListarEmpresas(): Observable<any> {
    return this.firestore.collection('empresas', ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
  }
}