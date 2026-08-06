# Estrategia de migración desde Google Sheets

## Objetivo

Trasladar los datos útiles del prototipo a GabrielOS de forma trazable,
repetible y verificable, sin depender de acceso directo a la hoja durante la
importación y sin obligar a un corte irreversible prematuro.

## Principios

- La importación nunca escribe antes de mostrar una vista previa válida.
- Cada ejecución queda identificada por un lote.
- Repetir un archivo o lote no crea registros duplicados.
- La hoja original se conserva sin cambios durante la validación.
- Solo uno de los sistemas se considera autoritativo para nuevas operaciones
  en cada etapa.
- La reversión se permite antes del corte definitivo.

## Exportación

1. Crear una copia de respaldo de la hoja original.
2. Exportar cada conjunto de datos necesario desde Google Sheets como CSV
   codificado en UTF-8 o como otro formato controlado y documentado.
3. No depender de fórmulas, colores, posiciones visuales o scripts para
   interpretar un valor; materializar los valores necesarios en la
   exportación.
4. Registrar para la ejecución la fecha de exportación, la hoja de origen y la
   versión del formato.
5. Tratar los archivos exportados como datos personales: no versionarlos ni
   utilizarlos como fixtures de prueba.

## Formato controlado

Antes de implementar el importador se definirá una plantilla por tipo de
entidad con:

- Nombres y orden aceptado de columnas.
- Campos obligatorios y opcionales.
- Formatos de fecha, hora, zona horaria y enumeraciones.
- Regla para representar valores vacíos.
- Versión del formato.

Cada fila importable debe proporcionar un identificador estable de origen o
recibir uno durante la preparación del archivo.

## Trazabilidad de datos heredados

Los registros importados incluirán:

- `legacySource`: origen del registro; para esta migración será
  `google_sheets`.
- `legacyId`: identificador estable del registro dentro del origen.
- `importBatchId`: identificador único del lote que creó el registro.

El lote de importación conserva, como mínimo, propietario, fecha, nombre o
huella del archivo, versión de formato, estado y cantidades de filas válidas,
inválidas, importadas y omitidas.

## Vista previa y validación

La vista previa analiza el archivo sin modificar datos persistentes y muestra:

- Total de filas y tipo de entidad detectado.
- Valores normalizados que se importarían.
- Registros nuevos, duplicados y rechazados.
- Advertencias que requieren revisión.
- Resumen por categoría de error.

La validación comprueba al menos:

- Columnas requeridas y versión de formato.
- Tipos, longitudes, estados y campos obligatorios.
- Fechas y horas interpretables en `America/La_Paz`.
- Referencias a proyecto, categoría o tarea dentro del mismo usuario.
- Máximo de un proyecto y una categoría por tarea.
- `legacyId` presente y no ambiguo dentro de `legacySource`.
- Ausencia de fórmulas o contenido no admitido en campos controlados.

## Reporte de errores

El proceso produce un reporte descargable o consultable con número de fila,
campo, valor representado de forma segura, código y explicación del error.

El reporte no incluye tokens, credenciales ni datos adicionales ajenos a la
fila. Una fila inválida no se importa silenciosamente. El usuario debe corregir
el archivo o aceptar de forma explícita importar únicamente las filas válidas.

## Prevención de duplicados

- La combinación `userId`, `legacySource` y `legacyId` identifica de forma
  única un registro heredado del mismo tipo.
- Una restricción de persistencia debe respaldar esta regla cuando se diseñe el
  esquema.
- Reintentar un lote ya aplicado devuelve su resultado o clasifica sus filas
  como existentes; no inserta copias.
- Una importación posterior puede actualizar un registro heredado solo mediante
  una operación explícita y trazada, nunca por coincidencia aproximada de
  títulos.

## Aplicación del lote

Después de aprobar la vista previa, el sistema crea un `importBatchId` y aplica
el lote de forma transaccional por unidad consistente. Si una falla impide
mantener las relaciones válidas, esa unidad se revierte y el lote registra el
error.

Las altas y correcciones realizadas por la importación generan las entradas de
historial necesarias para conocer su origen.

## Coexistencia temporal

1. **Preparación:** Google Sheets continúa siendo la fuente autoritativa; las
   importaciones en GabrielOS son ensayos reversibles.
2. **Validación paralela:** se comparan cantidades, muestras y relaciones. Las
   nuevas operaciones continúan registrándose en Sheets y pueden exportarse de
   nuevo mediante identificadores estables.
3. **Preparación del corte:** se anuncia una ventana breve sin nuevas ediciones
   en Sheets, se realiza la exportación final y se valida el lote.
4. **Después del corte:** GabrielOS pasa a ser la fuente autoritativa y Sheets
   queda disponible solo como referencia durante el periodo acordado.

No se implementará sincronización bidireccional ni escritura simultánea entre
Sheets y GabrielOS.

## Punto de corte

Gabriel aprueba el corte definitivo únicamente después de comprobar:

- Respaldo recuperable de la hoja.
- Lote final sin errores bloqueantes.
- Cantidades y muestras representativas conciliadas.
- Proyectos, categorías, tareas y relaciones válidas.
- Historial de importación consultable.
- Acceso y flujos diarios principales funcionando en GabrielOS.
- Google Sheets establecido como solo lectura para el uso normal.

La fecha, el lote final y el resultado de estas comprobaciones deben quedar
registrados.

## Reversión

Antes del corte definitivo, un lote puede revertirse mediante una operación
administrativa explícita basada en `importBatchId`. La reversión elimina o
desactiva únicamente los datos creados por ese lote, respeta relaciones con
otros lotes y deja un registro de auditoría del intento y su resultado.

Si datos creados manualmente dependen del lote, la reversión se bloquea hasta
resolver esas dependencias. Después del corte definitivo no se promete una
reversión funcional a Sheets; la recuperación se realizará desde respaldos y
migraciones correctivas controladas.
