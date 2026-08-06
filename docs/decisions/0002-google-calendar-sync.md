# ADR 0002: Sincronización inicial con Google Calendar

## Estado

Aceptada.

## Metadatos

- Fecha: 2026-08-06
- Responsable: Gabriel
- Versión: 1.0

## Contexto

El plan diario debe poder visualizarse en Google Calendar sin convertir al
proveedor externo en una segunda fuente de reglas de negocio. Una
sincronización bidireccional agrega resolución de conflictos, cambios
concurrentes y estados difíciles de reconciliar, complejidad que no es
necesaria para validar el MVP.

La integración debe tolerar reintentos, fallos de red y autorizaciones vencidas
sin duplicar eventos ni perder trazabilidad.

## Decisión

Durante el MVP, la sincronización será unidireccional:

`GabrielOS -> Google Calendar`

GabrielOS será la fuente autoritativa. Un `CalendarEvent` será la representación
externa de un `DailyPlanItem`; editar un evento directamente en Google Calendar
no modificará tareas, estados ni horarios en GabrielOS.

Toda fecha y horario visible para el usuario o enviado al proveedor se
interpretará con la zona horaria `America/La_Paz`. La persistencia podrá usar
instantes UTC siempre que conserve el significado local y realice las
conversiones explícitamente.

## Identidad y prevención de duplicados

- Cada vínculo persistirá, como mínimo, proveedor, calendario externo,
  identificador externo del evento y `DailyPlanItem` asociado.
- La relación activa entre proveedor, calendario y `DailyPlanItem` será única.
- Una creación comprobará primero si existe un identificador externo válido.
- Cuando la API lo permita, se enviará una clave idempotente o un identificador
  determinista de GabrielOS.
- Si la respuesta del proveedor es incierta, el proceso intentará reconciliar
  el evento existente antes de crear otro.
- Repetir el mismo comando o reanudarlo después de una falla no debe producir
  un segundo evento.

## Operaciones idempotentes

La integración manejará comandos persistidos o estados equivalentes para:

- Crear el evento cuando el elemento del plan sincronizable todavía no tenga
  representación externa.
- Actualizar el evento identificado cuando cambien fecha, horario o datos
  sincronizados.
- Retirar el evento cuando se cancele el elemento del plan o se archive su
  tarea y la programación futura deje de corresponder.
- Reconocer como exitosa una retirada cuando el evento externo ya no exista.

Un `DailyPlanItem` sin fecha y horario suficientes para representarse en el
calendario no se sincroniza y debe exponer un estado comprensible, no crear un
evento incompleto.

## Reprogramación

Reprogramar actualiza el evento señalado por el identificador externo. No se
crea otro evento por el solo cambio de fecha u horario. El cambio local y su
entrada de historial se confirman sin depender de que Google responda de forma
inmediata; la sincronización pendiente conserva la información necesaria para
reintentarse.

## Archivado, cancelación y eliminación externa

Archivar una tarea no borra sus datos ni historial en GabrielOS. Para cada
`DailyPlanItem` futuro que deje de corresponder:

- El elemento se marca `CANCELLED` mediante el caso de uso del plan.
- Se registra el cambio en el historial.
- Si existe un evento externo, se cancela o elimina mediante el adaptador y se
  conserva localmente la trazabilidad de esa operación.

Los eventos de elementos ya completados se conservan salvo una decisión
funcional posterior. Una falla al retirar el evento no revierte el archivado;
queda como sincronización pendiente o fallida.

## Errores y reintentos

- Cada intento registra operación, entidad, fecha, resultado, código de error
  seguro y cantidad de intentos, sin guardar tokens ni contenido sensible
  innecesario.
- Los errores transitorios se reintentan automáticamente con espera creciente
  y un límite configurable.
- Los errores permanentes o el agotamiento de reintentos quedan visibles para
  revisión y permiten reintento manual.
- Una operación posterior sustituye o invalida comandos pendientes obsoletos
  para no aplicar horarios antiguos después de una reprogramación.
- El fallo de Google Calendar no impide usar el banco de tareas ni el plan
  diario local.

## Autorización

- Se solicitarán únicamente los permisos de Google necesarios para administrar
  los eventos elegidos por GabrielOS.
- Los tokens se protegerán según `docs/non-functional-requirements.md`.
- Cuando sea posible, la renovación se realizará con el mecanismo seguro del
  proveedor antes de solicitar intervención.
- Si la autorización fue revocada o no puede renovarse, las operaciones quedan
  pendientes, se informa al usuario y se ofrece volver a autorizar.
- Volver a autorizar no debe crear duplicados ni descartar operaciones
  pendientes.

## Sincronización inicial y reconciliación

La primera ejecución solo crea o vincula eventos correspondientes a elementos
seleccionados como sincronizables por las reglas del MVP. La reconciliación se
apoya en los identificadores persistidos y, de manera secundaria, en el
identificador determinista de GabrielOS; no empareja por título únicamente.

Las verificaciones periódicas pueden confirmar la existencia del evento y
reparar estados técnicos, pero no importan cambios funcionales desde Google.

## Consecuencias positivas

- Existe una única fuente de reglas y estados.
- La sincronización es más simple de probar y operar.
- Los reintentos no deberían producir duplicados.
- El usuario puede continuar trabajando durante fallos del proveedor.

## Consecuencias negativas

- Los cambios hechos directamente en Google Calendar no regresan a GabrielOS.
- El usuario debe reprogramar o cancelar desde GabrielOS.
- Se necesita persistir estado técnico y gestionar operaciones pendientes.

## Fuera del MVP

- Sincronización bidireccional.
- Resolución de conflictos con ediciones externas.
- Proveedores de calendario adicionales.
- Automatizaciones complejas basadas en eventos externos.
