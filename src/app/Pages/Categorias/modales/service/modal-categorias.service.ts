import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ModalCategoriasService {

  constructor(private firestore: AngularFirestore) { }

  crearCategoria(categoria: any): Promise<any> {
    return this.firestore.collection('categorias').add(categoria);
  }

  editarCategoria(id: string, categoria: any): Promise<void> {
    // Utiliza el método update para editar un documento existente
    return this.firestore.collection('categorias').doc(id).update(categoria);
  }
}