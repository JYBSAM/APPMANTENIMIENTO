// @ts-nocheck
/**
 * GOOGLE APPS SCRIPT - BACKEND API
 * Copia este código en tu editor de Google Apps Script (script.google.com)
 * Luego publícalo como "Aplicación Web" con acceso para "Cualquiera".
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 ManteniPro')
      .addItem('Configurar Tablas Iniciales', 'manualSetup')
      .addToUi();
}

function manualSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheets(ss);
  SpreadsheetApp.getUi().alert('✅ Configuración completada. Las tablas han sido creadas correctamente.');
}

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    if (action === 'getData') {
      return createResponse({
        config: getSheetData(ss, 'CONFIGURACION'),
        solicitudes: getSheetData(ss, 'SOLICITUDES'),
        tecnicos: getSheetData(ss, 'TECNICOS'),
        equipos: getSheetData(ss, 'EQUIPOS'),
        infraestructura: getSheetData(ss, 'INFRAESTRUCTURA'),
        historial: getSheetData(ss, 'HISTORIAL')
      });
    }
    
    return createResponse({ error: 'Acción no válida' }, 400);
  } catch (err) {
    return createResponse({ error: err.message }, 500);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    if (action === 'addSolicitud') {
      const sheet = ss.getSheetByName('SOLICITUDES');
      const id = Utilities.getUuid();
      const date = new Date().toISOString();
      
      sheet.appendRow([
        id,
        date,
        data.tipo,
        data.area || data.equipo,
        data.elemento || data.falla,
        data.descripcion,
        data.prioridad,
        'Pendiente',
        '',
        data.impacto || 'No',
        data.costo || 0,
        data.imagen || '',
        data.rol || '',
        data.nombre || ''
      ]);
      
      return createResponse({ success: true, id: id });
    }
    
    if (action === 'updateSolicitud') {
      const sheet = ss.getSheetByName('SOLICITUDES');
      const rows = sheet.getDataRange().getValues();
      const id = data.id;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === id) {
          if (data.estado) sheet.getRange(i + 1, 8).setValue(data.estado);
          if (data.tecnico) sheet.getRange(i + 1, 9).setValue(data.tecnico);
          
          if (data.estado === 'Resuelto') {
            const histSheet = ss.getSheetByName('HISTORIAL');
            histSheet.appendRow([
              Utilities.getUuid(),
              id,
              data.tecnico || rows[i][8],
              new Date().toISOString(),
              data.observaciones || ''
            ]);
          }
          break;
        }
      }
      return createResponse({ success: true });
    }

    if (action === 'setup') {
      setupSheets(ss);
      return createResponse({ success: true, message: 'Tablas creadas correctamente' });
    }
    
    return createResponse({ error: 'Acción no válida' }, 400);
  } catch (err) {
    return createResponse({ error: err.message }, 500);
  }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}

function createResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheets(ss) {
  const tables = {
    'CONFIGURACION': ['Empresa', 'Fecha instalacion'],
    'SOLICITUDES': ['ID', 'Fecha', 'Tipo', 'Area_Equipo', 'Elemento_Falla', 'Descripcion', 'Prioridad', 'Estado', 'Tecnico_asignado', 'Impacto_Produccion', 'Costo_Estimado', 'Imagen', 'Rol_Solicitante', 'Solicitante_Nombre'],
    'TECNICOS': ['ID', 'Nombre', 'Telefono', 'Especialidad', 'Estado'],
    'EQUIPOS': ['ID', 'Equipo', 'Ubicación', 'Estado'],
    'INFRAESTRUCTURA': ['ID', 'Elemento', 'Ubicación', 'Estado'],
    'HISTORIAL': ['ID', 'Solicitud', 'Tecnico', 'Fecha_inicio', 'Fecha_cierre', 'Observaciones', 'Repuestos_Utilizados', 'Costo_Final', 'Tiempo_Parada_Minutos']
  };
  
  for (const name in tables) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(tables[name]);
    }
  }
}

