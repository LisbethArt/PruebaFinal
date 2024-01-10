export class Sucursales {
    id?: string;
    nombreSucursal: string;
    tipoSucursal: string;
    direccion: string;
    ubicacion: Ubicacion;
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

export class Ubicacion {
    latitud: number = null; 
    longitud: number = null;
  }