import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  constructor(private firestore: AngularFirestore) { }

  crearSucursal(sucursal: any): Promise<any> {
    return this.firestore.collection('sucursales').add(sucursal);
  }

  getListarSucursales(): Observable<any> {
    return this.firestore.collection('sucursales', ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
  }

  getDireccion(id: string): Observable<any> {
    return this.firestore.collection('sucursales').doc(id).valueChanges();
  }
}