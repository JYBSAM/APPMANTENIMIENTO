import { AppData } from '../types';

const MOCK_DATA: AppData = {
  config: [{ Empresa: 'Empresa Demo S.A.', "Fecha instalacion": '2024-01-01' }],
  solicitudes: [
    {
      ID: '1',
      Fecha: new Date().toISOString(),
      Tipo: 'Infraestructura',
      Area_Equipo: 'Oficina',
      Elemento_Falla: 'Iluminación',
      Descripcion: 'Luz parpadeante en el pasillo principal.',
      Prioridad: 'Media',
      Estado: 'Pendiente',
      Tecnico_asignado: '',
      Impacto_Produccion: 'Parcial',
      Costo_Estimado: 50
    },
    {
      ID: '2',
      Fecha: new Date().toISOString(),
      Tipo: 'Maquinaria',
      Area_Equipo: 'Máquina CNC',
      Elemento_Falla: 'Mecánica',
      Descripcion: 'Ruido extraño en el motor principal.',
      Prioridad: 'Alta',
      Estado: 'En proceso',
      Tecnico_asignado: 'Juan Pérez',
      Impacto_Produccion: 'Total',
      Costo_Estimado: 1500
    }
  ],
  tecnicos: [
    { ID: 'T1', Nombre: 'Juan Pérez', Telefono: '+56912345678', Especialidad: 'Mecánica', Estado: 'Activo' },
    { ID: 'T2', Nombre: 'Maria Soto', Telefono: '+56987654321', Especialidad: 'Electricidad', Estado: 'Activo' }
  ],
  equipos: [
    { ID: 'E1', Equipo: 'Máquina CNC', Ubicación: 'Planta A', Estado: 'Operativo' },
    { ID: 'E2', Equipo: 'Compresor', Ubicación: 'Bodega 2', Estado: 'Falla' }
  ],
  infraestructura: [
    { ID: 'I1', Elemento: 'Puerta Principal', Ubicación: 'Recepción', Estado: 'Bueno' }
  ],
  historial: []
};

export async function fetchAppData(apiUrl: string): Promise<AppData> {
  if (!apiUrl) return MOCK_DATA;
  try {
    const response = await fetch(`${apiUrl}?action=getData`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return MOCK_DATA;
  }
}

export async function submitSolicitud(apiUrl: string, data: any) {
  if (!apiUrl) {
    console.log('Mock Submit:', data);
    return { success: true, id: 'mock-id' };
  }
  try {
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'addSolicitud', ...data })
    });
    return { success: true };
  } catch (error) {
    console.error('Error submitting solicitud:', error);
    return { success: false };
  }
}

export async function setupDatabase(apiUrl: string) {
  if (!apiUrl) return { success: false, error: 'No API URL' };
  try {
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'setup' })
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false };
  }
}

export async function updateSolicitud(apiUrl: string, data: any) {
  if (!apiUrl) {
    console.log('Mock Update:', data);
    return { success: true };
  }
  try {
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'updateSolicitud', ...data })
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteSolicitud(apiUrl: string, id: string) {
  if (!apiUrl) {
    console.log('Mock Delete:', id);
    return { success: true };
  }
  try {
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: 'deleteSolicitud', ID: id })
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting solicitud:', error);
    return { success: false };
  }
}
