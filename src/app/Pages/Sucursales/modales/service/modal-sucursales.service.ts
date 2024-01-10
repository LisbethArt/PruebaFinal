import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModalSucursalesService {

  constructor(private firestore: AngularFirestore) { }

  crearSucursal(sucursal: any): Promise<any> {
    return this.firestore.collection('sucursales').add(sucursal);
  }

  editarSucursal(id: string, sucursal: any): Promise<void> {
    // Utiliza el método update para editar un documento existente
    return this.firestore.collection('sucursales').doc(id).update(sucursal);
  }
}
