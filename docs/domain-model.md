# Modelo de dominio de GabrielOS

## Propósito

Este documento define el vocabulario y las reglas de negocio mínimas del MVP.
Es conceptual: el esquema físico se creará posteriormente mediante
migraciones.

## Propiedad común

Las entidades principales pertenecen a un usuario mediante `userId`. Toda
referencia entre entidades debe mantenerse dentro del mismo usuario y toda
operación debe comprobar la propiedad en el servidor.

## Entidades

### Task

Unidad de trabajo pendiente que puede existir sin fecha ni horario.

- Durante el MVP puede tener, como máximo, un proyecto y una categoría.
- La relación con proyecto y categoría es opcional.
- Puede tener una fecha límite opcional, independiente de su programación en
  el plan diario.
- Conserva su identidad cuando se programa o reprograma.
- No se elimina físicamente mediante las operaciones normales del MVP.

Estados permitidos:

- `PENDING`: pendiente de ejecución.
- `IN_PROGRESS`: el trabajo comenzó y no finalizó.
- `COMPLETED`: el trabajo requerido terminó.
- `ARCHIVED`: se retiró del uso activo sin destruir sus datos ni historial.

### DailyPlanItem

Programación concreta de una tarea para una fecha y horario.

- Debe referenciar una `Task` del mismo usuario.
- Una tarea puede tener distintos elementos de plan a lo largo del tiempo.
- Puede ser creado manualmente o generado por una rutina.
- Puede reprogramarse conservando su identidad y registrando el cambio en el
  historial.

Estados permitidos:

- `PLANNED`: programado y todavía no iniciado.
- `IN_PROGRESS`: ejecución iniciada.
- `COMPLETED`: ejecución finalizada.
- `SKIPPED`: no se realizó en la programación prevista.
- `CANCELLED`: la programación dejó de aplicar.

### Routine

Regla recurrente que genera elementos del plan diario.

- Cada ocurrencia generada debe referenciar una tarea.
- La generación debe ser idempotente para no duplicar la misma ocurrencia.
- Cambiar o desactivar una rutina no borra los elementos ni el historial ya
  generados.

### CalendarEvent

Representación externa de un `DailyPlanItem` en un proveedor de calendario.

- Debe referenciar el elemento del plan y pertenecer al mismo usuario.
- Conserva el identificador externo necesario para actualizar el mismo evento.
- No es la fuente autoritativa durante el MVP.
- Los cambios externos no modifican el dominio de GabrielOS durante la
  sincronización unidireccional.

### HistoryEntry

Registro inmutable de una acción relevante.

- Pertenece a un usuario e identifica la entidad afectada.
- Conserva el tipo de acción, la fecha y los datos mínimos necesarios para
  comprender el cambio.
- No se actualiza ni elimina mediante operaciones normales.
- Las correcciones se representan mediante una entrada posterior, no
  reescribiendo la anterior.

## Transiciones y coordinación de estados

Los estados de `Task` y `DailyPlanItem` son distintos y no se sincronizan por
efecto de base de datos; un caso de uso aplica ambos cambios y registra el
historial cuando corresponda.

Para una tarea no recurrente:

- Iniciar un elemento puede cambiar la tarea de `PENDING` a `IN_PROGRESS`.
- Completar el trabajo cambia el elemento a `COMPLETED` y la tarea a
  `COMPLETED`.
- Omitir o cancelar un elemento no completa la tarea; esta permanece disponible
  para reprogramarse mientras no esté archivada.

Una rutina básica referencia una tarea fuente del mismo usuario y genera una
ocurrencia `DailyPlanItem` en estado `PLANNED`. Completar una ocurrencia no
completa automáticamente la tarea fuente mientras la rutina continúe activa;
la tarea representa el trabajo recurrente. Desactivar o archivar la rutina no
borra ocurrencias anteriores.

Transiciones admitidas de `Task` durante el MVP:

- `PENDING` puede pasar a `IN_PROGRESS`, `COMPLETED` o `ARCHIVED`.
- `IN_PROGRESS` puede pasar a `PENDING`, `COMPLETED` o `ARCHIVED`.
- `COMPLETED` puede pasar a `ARCHIVED`.
- `ARCHIVED` puede recuperarse como `PENDING`.

Transiciones admitidas de `DailyPlanItem` durante el MVP:

- `PLANNED` puede pasar a `IN_PROGRESS`, `COMPLETED`, `SKIPPED` o `CANCELLED`.
- `IN_PROGRESS` puede pasar a `COMPLETED`, `SKIPPED` o `CANCELLED`.
- `SKIPPED` puede reprogramarse como `PLANNED` o pasar a `CANCELLED`.
- `COMPLETED` y `CANCELLED` son estados finales durante el MVP.

## Reglas temporales

Una actividad se considera atrasada cuando su horario o fecha límite ya pasó y
no está completada, cancelada ni archivada. Aplicado a cada entidad:

- Una `Task` con fecha límite vencida está atrasada si su estado no es
  `COMPLETED` ni `ARCHIVED`.
- Un `DailyPlanItem` cuyo horario programado ya pasó está atrasado si su estado
  no es `COMPLETED` ni `CANCELLED` y su tarea no está `ARCHIVED`.
- Un elemento `SKIPPED` vencido continúa visible como no completado hasta que
  se reprograme, se cancele o se archive su tarea.
- Las comparaciones de calendario del MVP utilizan la zona horaria
  `America/La_Paz`.

## Reprogramación

Reprogramar significa modificar la fecha o el horario de un `DailyPlanItem`
conservando la identidad de la `Task` y del propio elemento del plan.

Un elemento `PLANNED`, `IN_PROGRESS` o `SKIPPED` puede reprogramarse y queda en
estado `PLANNED`. Reabrir un elemento `COMPLETED` o `CANCELLED` queda fuera del
MVP.

Cada reprogramación crea una `HistoryEntry` que registra, como mínimo, los
valores temporales anteriores y nuevos. Si existe un `CalendarEvent`, el mismo
evento externo se actualiza mediante su identificador; no se crea otro por el
solo hecho de reprogramar.

## Archivado y recuperación

Durante el MVP no existe borrado físico normal de tareas. La acción “Eliminar”
de la interfaz cambia el estado de la `Task` a `ARCHIVED`.

Al archivar:

- La tarea, sus elementos del plan y su historial se conservan.
- Los elementos futuros que ya no correspondan dejan de estar activos y sus
  eventos externos se retiran según el ADR 0002.
- Se crea una `HistoryEntry`.

La tarea puede recuperarse. La recuperación la devuelve a `PENDING`, no
reactiva automáticamente programaciones canceladas y crea una nueva entrada de
historial.

## Invariantes del MVP

- Ningún `DailyPlanItem` existe sin una `Task`.
- Ningún `CalendarEvent` existe sin un `DailyPlanItem`.
- Una `Task` tiene como máximo un proyecto y una categoría.
- Las referencias no atraviesan propietarios.
- El historial es inmutable.
- Archivar no equivale a borrar físicamente.
- Google Calendar no decide el estado del dominio durante el MVP.
