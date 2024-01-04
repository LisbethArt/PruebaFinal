import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { EmpresasComponent } from 'src/app/Pages/Empresas/component/empresas.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  dynamicComponentContainer: ViewContainerRef;
  constructor(private componentFactoryResolver: ComponentFactoryResolver, private router: Router) {}

  showIcon = false;
  isCollapsed = false;
  mode = false;
  dark = false;
  theme = true;
  menus = [
    {
      level: 1,
      title: 'Inicio',
      icon: 'home',
      open: false,
      selected: false,
      disabled: false,
      route: ''
    },
    {
      level: 1,
      title: 'Empresas',
      icon: 'unordered-list',
      open: true,
      selected: false,
      disabled: false,
      route: "Empresas",
      component: EmpresasComponent
    },
    {
      level: 1,
      title: 'Categorías',
      icon: 'tags',
      open: true,
      selected: false,
      disabled: false,
    },
    {
      level: 1,
      title: 'Sucursales',
      icon: 'environment',
      open: true,
      selected: false,
      disabled: false,
    },
    {
      level: 1,
      title: 'Servicios',
      icon: 'tool',
      open: true,
      selected: false,
      disabled: false,
    },
    {
      level: 1,
      title: 'Productos',
      icon: 'shopping-cart',
      open: true,
      selected: false,
      disabled: false,
    },
    {
      level: 1,
      title: 'Empresas',
      icon: 'shop',
      open: true,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          title: 'Group 1',
          icon: 'bars',
          open: false,
          selected: false,
          disabled: false,
          children: [
            {
              level: 3,
              title: 'Option 1',
              selected: false,
              disabled: false
            },
            {
              level: 3,
              title: 'Option 2',
              selected: false,
              disabled: true
            }
          ]
        },
        {
          level: 2,
          title: 'Group 2',
          icon: 'bars',
          selected: true,
          disabled: false
        },
        {
          level: 2,
          title: 'Group 3',
          icon: 'bars',
          selected: false,
          disabled: false
        }
      ]
    },
    {
      level: 1,
      title: 'Team Group',
      icon: 'team',
      open: false,
      selected: false,
      disabled: false,
      children: [
        {
          level: 2,
          title: 'User 1',
          icon: 'user',
          selected: false,
          disabled: false
        },
        {
          level: 2,
          title: 'User 2',
          icon: 'user',
          selected: false,
          disabled: false
        }
      ]
    }
  ];

  navigate(route: string) {
    // Lógica de navegación, por ejemplo, cargar el componente dinámicamente
    const menuItem = this.menus.find(menu => menu.route === route);

    if (menuItem && menuItem.component) {
      this.loadComponent(menuItem.component);
    }
  }

  // Enrutamiento interno en lugar de enrutamiento tradicional
  loadComponent(component: any) {
    this.dynamicComponentContainer.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      component
    );

    const componentRef = this.dynamicComponentContainer.createComponent(
      componentFactory
    );
  }
}
