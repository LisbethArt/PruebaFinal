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
}