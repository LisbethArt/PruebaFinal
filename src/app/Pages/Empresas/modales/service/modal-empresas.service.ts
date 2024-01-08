import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModalEmpresasService {

  constructor(private firestore: AngularFirestore) { }

  crearEmpresa(empresa: any): Promise<any> {
    return this.firestore.collection('empresas').add(empresa);
  }

  editarEmpresa(id: string, empresa: any): Promise<void> {
    // Utiliza el método update para editar un documento existente
    return this.firestore.collection('empresas').doc(id).update(empresa);
  }

  getCategorias(): Observable<any[]> {
    return this.firestore.collection('categorias', ref => ref.orderBy('nombreCategoria')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as { nombreCategoria: string };
        return data.nombreCategoria;
      }))
    );
  }
}
