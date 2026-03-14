import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AREAS_INFRAESTRUCTURA = [
  'Oficina', 'Bodega', 'Planta', 'Baños', 'Recepción', 'Estacionamiento', 'Comedor'
];

export const ELEMENTOS_INFRAESTRUCTURA = [
  'Puerta', 'Ventana', 'Cortina', 'Iluminación', 'Goteras', 'Techo', 'Piso', 'Baño', 'Aire Acondicionado', 'Cerradura'
];

export const EQUIPOS_MAQUINARIA = [
  'Grúa horquilla', 'Apilador', 'Robot industrial', 'Máquina CNC', 'Línea producción', 'Compresor', 'Transportador', 'Generador'
];

export const TIPOS_FALLA_MAQUINARIA = [
  'Mecánica', 'Eléctrica', 'Hidráulica', 'Sensor', 'Programación', 'Neumática', 'Lubricación'
];

export const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'] as const;
export const ESTADOS = ['Pendiente', 'En proceso', 'Resuelto'] as const;
export const ROLES = ['Operario', 'Supervisor', 'Mantenimiento', 'Administración', 'Otro'] as const;
