export interface Config {
  Empresa: string;
  "Fecha instalacion": string;
}

export interface Solicitud {
  ID: string;
  Fecha: string;
  Tipo: 'Infraestructura' | 'Maquinaria';
  Area_Equipo: string;
  Elemento_Falla: string;
  Descripcion: string;
  Prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  Estado: 'Pendiente' | 'En proceso' | 'Resuelto';
  Tecnico_asignado: string;
  Impacto_Produccion: 'No' | 'Parcial' | 'Total';
  Costo_Estimado?: number;
  Imagen?: string;
  Rol_Solicitante?: string;
  Solicitante_Nombre?: string;
}

export interface Tecnico {
  ID: string;
  Nombre: string;
  Telefono: string;
  Especialidad: string;
  Estado: 'Activo' | 'Inactivo';
}

export interface Equipo {
  ID: string;
  Equipo: string;
  Ubicación: string;
  Estado: string;
}

export interface Infraestructura {
  ID: string;
  Elemento: string;
  Ubicación: string;
  Estado: string;
}

export interface Historial {
  ID: string;
  Solicitud: string;
  Tecnico: string;
  Fecha_inicio: string;
  Fecha_cierre: string;
  Observaciones: string;
  Repuestos_Utilizados: string;
  Costo_Final: number;
  Tiempo_Parada_Minutos: number;
}

export interface AppData {
  config: Config[];
  solicitudes: Solicitud[];
  tecnicos: Tecnico[];
  equipos: Equipo[];
  infraestructura: Infraestructura[];
  historial: Historial[];
}
