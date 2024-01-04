export class Empresas {
    nombreComercial: string;
    razonSocial: string;
    actividadEconomica: string;
    estado: boolean;
    imagenes: string[];
    categoria: string;
    direccion?: string;
    quienesSomos: string;
    nombreContacto: string;
    telefono?: string;
    correo: string;
    redesSociales?: RedesSociales;
    fechaCreacion: Date;
  
    constructor(data?: Partial<Empresas>) {
      Object.assign(this, data);
    }
  }
  
  export class RedesSociales {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  }