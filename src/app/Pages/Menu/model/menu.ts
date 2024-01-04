export class Menus {
    level: number;
    title: string;
    icon?: string;
    open: boolean;
    selected: boolean;
    disabled: boolean;
    route?: string;
    component?: string;
  
    constructor(
      level: number,
      title: string,
      icon?: string,
      open?: boolean,
      selected?: boolean,
      disabled?: boolean,
      route?: string,
      component?: string
    ) {
      this.level = level;
      this.title = title;
      this.icon = icon;
      this.open = open;
      this.selected = selected;
      this.disabled = disabled;
      this.route = route;
      this.component = this.transformComponent(component);
    }
  
    private transformComponent(component: string): string {
      // Transforma el campo component quitando las comillas dobles
      if (typeof component === 'string' && component.startsWith('"') && component.endsWith('"')) {
        return component.slice(1, -1); // Quita las comillas dobles
      }
      return component;
    }
  }  