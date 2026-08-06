# Alcance de GabrielOS

## Propósito

Este documento establece la frontera funcional aprobada para el MVP. Si otro
documento usa una descripción más general, prevalece esta clasificación para
decidir si una funcionalidad pertenece al MVP.

## Dentro del MVP

### Autenticación para el usuario inicial

- Autenticar a Gabriel antes de acceder a información personal.
- Permitir que la primera instalación limite el registro a una cuenta.
- Asociar las entidades principales a un `userId` y autorizar su acceso en el
  servidor.
- Preparar el modelo para más usuarios sin construir administración
  multiusuario completa.

### Categorías y proyectos

- Crear, editar, consultar y archivar categorías y proyectos.
- Asociar cada tarea, de forma opcional, con un máximo de una categoría y un
  proyecto.

### Banco de tareas

- Crear, editar, consultar, priorizar, iniciar, completar, archivar y recuperar
  tareas.
- Permitir tareas sin fecha ni horario.
- Consultar tareas pendientes y atrasadas.
- Conservar el historial cuando cambie el estado o se archive una tarea.

### Plan diario

- Programar una tarea para una fecha y horario mediante un `DailyPlanItem`.
- Consultar el plan de un día.
- Iniciar, completar, omitir, cancelar y reprogramar elementos.
- Registrar en el historial los cambios relevantes.

### Rutinas básicas

- Crear, editar, activar, desactivar y archivar reglas recurrentes simples.
- Generar elementos del plan diario a partir de una rutina sin duplicar una
  ocurrencia ya generada.
- Las reglas recurrentes complejas o la planificación adaptativa no forman
  parte del MVP.

### Historial

- Registrar de forma inmutable creación, cambios de estado, reprogramación,
  archivado, recuperación, importación y resultados relevantes de
  sincronización.
- Consultar el historial asociado a una tarea.
- Impedir que el archivado normal destruya entradas anteriores.

### Google Calendar

- Sincronizar de forma unidireccional `DailyPlanItem` desde GabrielOS hacia
  Google Calendar.
- Crear, actualizar y retirar eventos externos de forma idempotente.
- Mostrar y registrar los errores que requieran atención.
- Aplicar la decisión completa del ADR 0002.

### Importación desde Google Sheets

- Importar archivos CSV o un formato controlado.
- Previsualizar y validar antes de persistir.
- Informar errores por fila e identificar cada importación mediante un lote.
- Prevenir duplicados y permitir reversión antes del corte definitivo.
- Aplicar `docs/migration-strategy.md`.

### Panel básico de cumplimiento

- Mostrar, para una fecha seleccionada, las cantidades de elementos
  completados, omitidos y cancelados.
- Mostrar el porcentaje de cumplimiento calculado como elementos completados
  dividido entre la suma de completados, omitidos y cancelados.
- Si no existen elementos en esos estados, mostrar que todavía no hay datos en
  vez de presentar un porcentaje engañoso.
- Permitir llegar desde el resumen a los elementos que componen cada cantidad.

## Después del MVP

- Estadísticas avanzadas y análisis de tendencias.
- Planificación automática.
- Asistente con inteligencia artificial.
- Aplicación móvil nativa.
- Multiusuario completo y administración de cuentas.
- Integraciones adicionales.
- Sincronización bidireccional con calendarios.
- Automatizaciones complejas.

También permanecen fuera del alcance inicial los microservicios, equipos
empresariales, marketplace, red social, facturación y suscripciones.

## Criterios de aceptación transversales

- Ninguna operación permite leer o modificar datos pertenecientes a otro
  `userId`.
- Archivar una tarea conserva la tarea, sus elementos del plan y su historial,
  y permite recuperarla.
- Reprogramar mantiene la identidad de la tarea y deja una entrada de
  historial con los valores anteriores y nuevos.
- Repetir una sincronización o importación ya aplicada no genera duplicados.
- Los errores de validación, importación y sincronización son comprensibles y
  no contienen secretos.
- Los flujos principales cumplen `docs/non-functional-requirements.md`.

## Control de alcance

Agregar una capacidad a la sección “Dentro del MVP” requiere autorización y
actualizar este documento. Un cambio que afecte la arquitectura requiere,
además, un ADR.
