import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  // Agrega esta línea
import { Menus } from '../model/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(private firestore: AngularFirestore) {}

  // Método para obtener los datos de la colección "menus" en Firestore
  getMenus(): Observable<Menus[]> {
    return this.firestore.collection<Menus>('menus').valueChanges().pipe(
      map((menus: Menus[]) => {
        // Transforma el campo component quitando las comillas
        return menus.map(menu => {
          if (typeof menu.component === 'string' && menu.component.startsWith('"') && menu.component.endsWith('"')) {
            menu.component = eval(menu.component.slice(1, -1)); // Evalúa la cadena como una instancia de Type
          }
          return menu;
        });
      })
    );
  }
}