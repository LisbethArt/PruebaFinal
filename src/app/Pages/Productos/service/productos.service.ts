import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  constructor(private firestore: AngularFirestore) {}

  crearProducto(producto: any): Promise<any> {
    return this.firestore.collection('productos').add(producto);
  }

  getListarProductos(): Observable<any> {
    return this.firestore.collection('productos', ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
  }
}