import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './Pages/Menu/component/menu.component';
import { EmpresasComponent } from './Pages/Empresas/component/empresas.component';
import { CategoriasComponent } from './Pages/Categorias/component/categorias.component';

const routes: Routes = [
  { 
    path: "", component: MenuComponent
  },
  { 
    path: "Empresas", component: EmpresasComponent
  },
  { 
    path: "Categorias", component: CategoriasComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }