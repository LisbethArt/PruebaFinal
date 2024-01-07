export class Categorias {
    id?: string;
    nombreCategoria: string;
    descripcion: string;
    estado: boolean;
    fechaCreacion: Date;

    constructor(data?: Partial<Categorias>) {
        Object.assign(this, data);
      }
}