export class Servicios {
    id?: string;
    nombreServicio: string;
    descripcion: string;
    fecha: Date;
    costo: number;
    iva: string;
    descripcionServicio: string;
    duracionServicio: Date[]; // Modificado para ser un array de fechas
    empresa: string;
    fechaCreacion: Date;

    constructor(data?: Partial<Servicios>) {
        Object.assign(this, data);
    }
}