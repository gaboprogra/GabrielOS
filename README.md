# GabrielOS

GabrielOS es un sistema personal de organización, planificación y seguimiento
diseñado para centralizar tareas, rutinas, proyectos, agenda, historial y
automatizaciones.

## Estado del proyecto

La visión y la arquitectura versión 1.0 fueron aprobadas por Gabriel el
2026-08-06. La fase de arquitectura está cerrada y el proyecto puede avanzar a
la implementación incremental del MVP.

Todavía no existe una aplicación de producción en este repositorio. La primera
versión funcional fue probada utilizando:

- Google Sheets.
- Google Apps Script.
- Google Calendar.
- Automatización de tareas y eventos.
- Historial de actividades.

La nueva versión será una aplicación web construida a partir de lo aprendido
con ese prototipo.

## Objetivo principal

Crear un sistema personal que permita:

- Registrar y organizar tareas rápidamente.
- Construir un plan diario y administrar rutinas.
- Relacionar tareas con categorías y proyectos.
- Sincronizar inicialmente el plan hacia Google Calendar.
- Importar de forma controlada la información de Google Sheets.
- Conservar un historial confiable.
- Consultar el cumplimiento diario.
- Incorporar automatización e inteligencia artificial después del MVP.

## Alcance aprobado del MVP

El MVP incluye:

1. Autenticación para un usuario inicial.
2. Categorías y proyectos.
3. Banco de tareas.
4. Plan diario.
5. Rutinas básicas.
6. Historial inmutable.
7. Sincronización unidireccional con Google Calendar.
8. Importación desde Google Sheets.
9. Panel básico de cumplimiento.

Las estadísticas avanzadas, la planificación automática, el asistente con
inteligencia artificial, la aplicación móvil nativa, el multiusuario completo,
las integraciones adicionales y las automatizaciones complejas quedan para
después del MVP. El detalle normativo se encuentra en `docs/scope.md`.

## Principios del proyecto

- Modularidad.
- Simplicidad de uso.
- Seguridad y propiedad de datos.
- Trazabilidad e historial.
- Pruebas automatizadas.
- Documentación permanente.
- Desarrollo incremental.
- Evitar complejidad innecesaria.

## Documentación

- Visión aprobada: `docs/vision.md`.
- Alcance del MVP: `docs/scope.md`.
- Arquitectura aprobada: `docs/architecture.md`.
- Modelo de dominio: `docs/domain-model.md`.
- Estrategia de migración: `docs/migration-strategy.md`.
- Requisitos no funcionales: `docs/non-functional-requirements.md`.
- Decisiones técnicas: `docs/decisions/`.
- Reglas para agentes: `AGENTS.md`.

## Estado

🚧 Arquitectura aprobada; implementación del MVP pendiente.
