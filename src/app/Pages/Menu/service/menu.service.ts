import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Menus } from '../model/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(private firestore: AngularFirestore) {}

  // Método para obtener los datos de la colección "menus" en Firestore
  getMenus(): Observable<Menus[]> {
    return this.firestore.collection<Menus>('menus').valueChanges();
  }
}