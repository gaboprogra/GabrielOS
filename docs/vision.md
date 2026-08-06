# Visión de GabrielOS

## Aprobación

- Estado: Aprobada
- Fecha de aprobación: 2026-08-06
- Responsable: Gabriel
- Versión: 1.0

## Problema

Actualmente la información personal de organización puede quedar dispersa
entre calendarios, notas, hojas de cálculo, recordatorios y aplicaciones
diferentes.

Esto dificulta:

- Saber qué hacer cada día.
- Mantener rutinas.
- Dar seguimiento a proyectos.
- Registrar el trabajo realizado.
- Analizar el uso del tiempo.
- Reprogramar tareas incumplidas.
- Mantener un historial confiable.

## Visión

GabrielOS será un sistema personal centralizado que permita capturar,
organizar, planificar, ejecutar y revisar actividades desde una única
plataforma.

El sistema deberá ayudar al usuario a decidir:

- Qué debe hacer.
- Cuándo debe hacerlo.
- Qué es prioritario.
- Qué actividades están atrasadas.
- Qué progreso tiene cada proyecto.
- Cómo está cumpliendo su plan diario.

## Usuario inicial

La primera versión está diseñada para un único usuario: Gabriel. El MVP tendrá
autenticación y podrá limitar el registro a una sola cuenta.

Las entidades principales tendrán propietario y la autorización se comprobará
en el servidor. Esto permitirá incorporar más usuarios en el futuro sin
implementar todavía la experiencia multiusuario completa.

## Propuesta de valor

GabrielOS no será solamente una lista de tareas. Integrará un banco de tareas,
categorías, proyectos, plan diario, rutinas básicas, historial, calendario,
importación del sistema anterior y una vista básica de cumplimiento.

La planificación automática, las estadísticas avanzadas y la asistencia con
inteligencia artificial ampliarán esta propuesta después de validar el MVP.

## MVP

La primera versión web deberá permitir:

1. Autenticar al usuario inicial y limitar el acceso a sus propios datos.
2. Crear, editar, archivar y recuperar tareas del banco de tareas.
3. Clasificar cada tarea con, como máximo, una categoría y un proyecto.
4. Asignar prioridad, duración, estado y, opcionalmente, fecha límite.
5. Programar tareas como elementos concretos del plan diario.
6. Crear rutinas básicas que generen elementos del plan diario.
7. Completar, omitir, cancelar o reprogramar elementos del plan.
8. Registrar de forma inmutable las acciones relevantes en el historial.
9. Sincronizar el plan de GabrielOS hacia Google Calendar sin aceptar cambios
   en sentido inverso.
10. Importar datos de Google Sheets mediante un proceso controlado y
    reversible antes del corte definitivo.
11. Mostrar un panel básico de cumplimiento diario.

El alcance normativo completo se define en `docs/scope.md` y los conceptos en
`docs/domain-model.md`.

## Después del MVP

No se implementarán inicialmente:

- Estadísticas avanzadas.
- Planificación automática.
- Asistente con inteligencia artificial.
- Aplicación móvil nativa.
- Multiusuario completo.
- Integraciones adicionales.
- Sincronización bidireccional con calendarios.
- Automatizaciones complejas.
- Microservicios.
- Equipos empresariales, marketplace, red social, facturación o suscripciones.

## Principios de experiencia

- Registrar una tarea debe ser rápido.
- El plan diario debe ser fácil de entender.
- La información importante debe verse sin demasiados clics.
- El usuario debe conservar el control sobre las automatizaciones.
- Toda acción automática importante debe poder revisarse.
- Reprogramar o archivar una tarea no debe destruir su historial.
- Los errores de importación o sincronización deben ser visibles y
  recuperables.

## Criterios iniciales de éxito

- Crear una tarea básica en no más de tres acciones después de abrir el
  formulario de captura.
- Incorporar una tarea existente al plan diario sin duplicarla.
- Repetir una operación de sincronización sin crear eventos duplicados.
- Consultar qué elementos fueron completados, omitidos o cancelados en una
  fecha determinada.
- Recuperar una tarea archivada junto con su historial previo.
- Identificar como atrasadas las tareas o actividades que cumplan la regla del
  modelo de dominio.
- Previsualizar una importación y obtener errores por fila antes de escribir
  datos.
- Consultar en el panel básico la proporción diaria entre elementos
  completados y elementos cerrados como completados, omitidos o cancelados.
- Completar el punto de corte y utilizar GabrielOS diariamente sin depender de
  la hoja original para nuevas operaciones.

Los objetivos técnicos verificables se detallan en
`docs/non-functional-requirements.md`.
