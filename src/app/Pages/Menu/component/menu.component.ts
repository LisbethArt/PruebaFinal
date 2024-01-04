import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  constructor(private router: Router) {}

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
      route: "Empresas"
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

  navigate(route: string) { // Método para navegar a la ruta
    this.router.navigate([route]);
  }
}
