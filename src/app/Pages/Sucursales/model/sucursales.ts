export class Sucursales {
    id?: string;
    nombreSucursal: string;
    tipoSucursal: string;
    direccion: Direccion;
    estado: string;
    nombreResponsable: string;
    correo : string;
    telefono: string;
    horariosSucursal: string[];
    fechaCreacion: Date;

    constructor(data?: Partial<Sucursales>) {
        Object.assign(this, data);
    }
}

export class Direccion {
    latitud: number = null; 
    longitud: number = null;
  }