import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef, OnInit, Type } from '@angular/core';
import { Menus } from '../model/menu';
import { MenuService } from '../service/menu.service';
import { CategoriasComponent } from '../../Categorias/component/categorias.component';
import { EmpresasComponent } from 'src/app/Pages/Empresas/component/empresas.component';
import { ServiciosComponent } from '../../Servicios/component/servicios.component';
import { ProductosComponent } from '../../Productos/component/productos.component';
import { SucursalesComponent } from '../../Sucursales/component/sucursales.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  dynamicComponentContainer: ViewContainerRef;

  showIcon = false;
  isCollapsed = false;
  mode = false;
  dark = false;
  theme = true;
  menus: Menus[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    // Llama al servicio para obtener los menús cuando se inicializa el componente
    this.menuService.getMenus().subscribe(data => {
      this.menus = data;
    });
  }

  navigate(route: string) {
    const menuItem = this.menus.find(menu => menu.route === route);

    if (menuItem && menuItem.component) {
      this.loadComponent(menuItem.component);
    }
  }

  loadComponent(componentName: string) {
    this.dynamicComponentContainer.clear();

    // Convierte el nombre del componente a un tipo Type<any>
    const componentType: Type<any> = this.getComponentType(componentName);

    if (componentType) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      const componentRef = this.dynamicComponentContainer.createComponent(componentFactory);
    } else {
      console.error(`Componente '${componentName}' no encontrado o no es válido.`);
    }
  }

  // Método para convertir el nombre del componente a un tipo Type<any>
  private getComponentType(componentName: string): Type<any> | null {
    switch (componentName) {
      case 'CategoriasComponent':
        return CategoriasComponent;
      case 'EmpresasComponent':
        return EmpresasComponent;
      case 'ServiciosComponent':
        return ServiciosComponent;
      case 'SucursalesComponent':
        return SucursalesComponent
      case 'ProductosComponent':
        return ProductosComponent;
      default:
        return null;
    }
  }
}