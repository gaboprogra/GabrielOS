# Rutinas

## Generación de ocurrencias

Una `Routine` define la vigencia y una colección de `RoutineSchedule`, con un
horario independiente por día. Las ejecuciones concretas continúan siendo
`DailyPlanItem`.

El generador calcula fechas en `America/La_Paz` y mantiene una ventana inclusiva
de siete días: hoy y los seis días siguientes. Respeta la vigencia, el estado de
la rutina, la tarea `REUSABLE` no archivada y los conflictos con actividades
`PLANNED` o `IN_PROGRESS`.

La clave única `routineScheduleId + routineOccurrenceDate` hace idempotente la
generación. `routineOccurrenceDate` no cambia al reprogramar manualmente una
ocurrencia, por lo que moverla no libera la clave original. `REMOVE` registra una
`RoutineOccurrenceExclusion` para impedir que esa ocurrencia eliminada vuelva a
crearse.

Al editar una rutina se reconcilian solamente ocurrencias futuras `PLANNED`
dentro de la ventana. No se modifican `IN_PROGRESS`, estados terminales ni
ocurrencias con `isRoutineException = true`. Si un horario actualizado entra en
conflicto, la ocurrencia automática se cancela y el conflicto se registra en el
log del servidor. Desactivar aplica la misma política a futuras ocurrencias
automáticas planificadas; no se reactivan ocurrencias ya canceladas.

## Endpoint interno y Vercel Cron

`GET /api/internal/routines/generate` requiere:

```http
Authorization: Bearer <CRON_SECRET>
```

Configura `CRON_SECRET` en Vercel. No se añadió `vercel.json` para no cambiar la
configuración de despliegue ni asumir el plan actual. Para activarlo después,
se puede incorporar esta entrada al `vercel.json` del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/internal/routines/generate",
      "schedule": "0 7 * * *"
    }
  ]
}
```

`07:00 UTC` corresponde a `03:00` en Bolivia. Vercel envía automáticamente el
header `Authorization: Bearer <CRON_SECRET>` cuando esa variable está
configurada para el proyecto.

Crear, editar o activar una rutina también dispara el generador inmediatamente,
sin esperar al cron.

## Google Calendar y colores

GabrielOS envía `calendarColor` en las acciones `create` y `update`. El valor es
un nombre de `CalendarApp.EventColor`, obtenido aproximando el HEX de Category a
la paleta limitada de Calendar. Si no hay color válido, envía `null` y se
conserva el color predeterminado del calendario.

El Apps Script desplegado debe añadir este helper:

```javascript
function applyCalendarColor(event, calendarColor) {
  if (!calendarColor) return;

  const colors = {
    PALE_BLUE: CalendarApp.EventColor.PALE_BLUE,
    PALE_GREEN: CalendarApp.EventColor.PALE_GREEN,
    MAUVE: CalendarApp.EventColor.MAUVE,
    PALE_RED: CalendarApp.EventColor.PALE_RED,
    YELLOW: CalendarApp.EventColor.YELLOW,
    ORANGE: CalendarApp.EventColor.ORANGE,
    CYAN: CalendarApp.EventColor.CYAN,
    GRAY: CalendarApp.EventColor.GRAY,
    BLUE: CalendarApp.EventColor.BLUE,
    GREEN: CalendarApp.EventColor.GREEN,
    RED: CalendarApp.EventColor.RED,
  };

  const eventColor = colors[calendarColor];
  if (eventColor) event.setColor(eventColor);
}
```

Después de obtener el evento en las ramas `create` y `update`, llamar:

```javascript
applyCalendarColor(event, payload.calendarColor);
```

En `update` debe usarse el evento recuperado por `payload.eventId`; no debe
crearse otro. La llamada al Apps Script siempre ocurre después del commit de la
base de datos. Si falla, la ocurrencia permanece y queda con
`calendarSyncStatus = FAILED`, el mismo `googleCalendarEventId` y el error para
un reintento futuro.
