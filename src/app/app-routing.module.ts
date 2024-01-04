import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './Pages/Menu/component/menu.component';
import { EmpresasComponent } from './Pages/Empresas/component/empresas.component';

const routes: Routes = [
  { 
    path: "", component: MenuComponent
  },
  { 
    path: "Empresas", component: EmpresasComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }