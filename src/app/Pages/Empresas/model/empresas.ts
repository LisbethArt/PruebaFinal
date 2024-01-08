export class Empresas {
    id?: string;
    nombreComercial: string;
    razonSocial: string;
    actividadEconomica: string;
    estado: string;
    imagenes: string[];
    categoria: string;
    direccion?: string;
    quienesSomos: string;
    nombreContacto?: string;
    telefono?: string;
    correo: string;
    redesSociales?: RedesSociales;
    fechaCreacion: Date;
  
    constructor(data?: Partial<Empresas>) {
      Object.assign(this, { redesSociales: new RedesSociales(), ...data });
    }
  }
  
  export class RedesSociales {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  }