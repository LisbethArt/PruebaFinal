import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalEmpresasService {

  constructor(private firestore: AngularFirestore) { }

  crearEmpresa(empresa: any): Promise<any> {
    return this.firestore.collection('empresas').add(empresa);
  }
}
