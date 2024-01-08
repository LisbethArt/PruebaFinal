export class Productos {
    id?: string;
    nombreProducto: string;
    descripcion: string;
    funcionalidades: string;
    multimedia: string[];
    texto: string;
    descripcionCaracteristica: string;
    empresa: string;
    fechaCreacion: Date;

    constructor(data?: Partial<Productos>) {
        Object.assign(this, data);
    }
}