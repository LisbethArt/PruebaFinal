import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModalProductosService {

  constructor(private firestore: AngularFirestore) { }

  crearProducto(producto: any): Promise<any> {
    return this.firestore.collection('productos').add(producto);
  }

  editarProducto(id: string, producto: any): Promise<void> {
    // Utiliza el método update para editar un documento existente
    return this.firestore.collection('productos').doc(id).update(producto);
  }

  getEmpresas(): Observable<any[]> {
    return this.firestore.collection('empresas', ref => ref.orderBy('nombreComercial')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as { nombreComercial: string };
        return data.nombreComercial;
      }))
    );
  }
}
