import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MenuComponent } from './Pages/Menu/component/menu.component';
import { EmpresasComponent } from './Pages/Empresas/component/empresas.component';
import { ModalEmpresasComponent } from './Pages/Empresas/modales/modal-empresas/modal-empresas.component';
import { CategoriasComponent } from './Pages/Categorias/component/categorias.component';
import { ModalCategoriasComponent } from './Pages/Categorias/modales/modal-categorias/modal-categorias.component';
import { ServiciosComponent } from './Pages/Servicios/component/servicios.component';
import { ModalServiciosComponent } from './Pages/Servicios/modales/modal-servicios/modal-servicios.component';
import { ProductosComponent } from './Pages/Productos/component/productos.component';
import { ModalProductosComponent } from './Pages/Productos/modales/modal-productos/modal-productos.component';

registerLocaleData(es);

@NgModule({
  declarations: [
    AppComponent,
    EmpresasComponent,
    MenuComponent,
    ModalEmpresasComponent,
    CategoriasComponent,
    ModalCategoriasComponent,
    ServiciosComponent,
    ModalServiciosComponent,
    ProductosComponent,
    ModalProductosComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzTableModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzDatePickerModule
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: NZ_I18N, useValue: en_US }
  ]
})
export class AppModule { }
