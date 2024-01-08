import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  constructor(private firestore: AngularFirestore) {}

  crearServicio(servicio: any): Promise<any> {
    return this.firestore.collection('servicios').add(servicio);
  }

  getListarServicios(): Observable<any> {
    return this.firestore.collection('servicios', ref => ref.orderBy('fechaCreacion', 'desc')).snapshotChanges();
  }
}
