import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  constructor(private firestore: AngularFirestore) {}

  crearCategoria(categoria: any): Promise<any> {
    return this.firestore.collection('categorias').add(categoria);
  }

  getListarCategorias(): Observable<any> {
    return this.firestore.collection('categorias', ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
  }

  getNombreCategoria(): Observable<any> {
    return this.firestore.collection('categorias', ref => ref.orderBy('nombreCategoria', 'asc')).snapshotChanges();
  }

  getCategoriaId(id: string): Observable<any> {
    return this.firestore.collection('categorias').doc(id).snapshotChanges();
  }
}