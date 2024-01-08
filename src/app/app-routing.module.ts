import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './Pages/Menu/component/menu.component';
import { EmpresasComponent } from './Pages/Empresas/component/empresas.component';
import { CategoriasComponent } from './Pages/Categorias/component/categorias.component';
import { ServiciosComponent } from './Pages/Servicios/component/servicios.component';
import { ProductosComponent } from './Pages/Productos/component/productos.component';

const routes: Routes = [
  { path: "", component: MenuComponent },
  { path: "Categorias", component: CategoriasComponent },
  { path: "Empresas", component: EmpresasComponent },
  { path: "Servicios", component: ServiciosComponent },
  { path: "Productos", component: ProductosComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }