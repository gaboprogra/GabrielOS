# AGENTS.md

## Contexto del proyecto

GabrielOS es un sistema personal de organización, planificación, seguimiento
y automatización.

La aplicación debe reemplazar progresivamente un prototipo construido con
Google Sheets, Google Apps Script y Google Calendar.

La visión y la arquitectura versión 1.0 fueron aprobadas por Gabriel el
2026-08-06. La fase de arquitectura está cerrada, la implementación del MVP
está habilitada y el trabajo posterior debe respetar la documentación
aprobada.

Antes de trabajar, revisar:

- `README.md`
- `docs/vision.md`
- `docs/scope.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/migration-strategy.md`
- `docs/non-functional-requirements.md`
- `docs/decisions/`

## Reglas generales

- No modificar archivos que no estén relacionados con la tarea.
- No instalar dependencias sin explicar primero por qué son necesarias.
- No reemplazar tecnologías existentes sin autorización.
- No eliminar funcionalidades sin autorización.
- No introducir secretos, contraseñas o claves en el repositorio.
- No guardar credenciales reales en archivos versionados.
- No modificar la arquitectura sin registrar una decisión técnica.
- No ampliar el MVP sin actualizar y aprobar `docs/scope.md`.
- No considerar una tarea terminada sin verificar el resultado.
- Priorizar soluciones simples, mantenibles y fáciles de probar.
- No crear microservicios durante el MVP.

## Flujo de trabajo

Antes de escribir código:

1. Leer la documentación relevante.
2. Revisar la estructura existente.
3. Explicar brevemente el plan.
4. Identificar los archivos que serán modificados.
5. Señalar riesgos o dudas importantes.

Después de escribir código:

1. Ejecutar las validaciones disponibles.
2. Ejecutar pruebas relacionadas.
3. Revisar el diff.
4. Informar los archivos modificados.
5. Explicar cómo verificar manualmente el cambio.
6. Señalar cualquier limitación pendiente.

## Reglas de código

- Utilizar TypeScript estricto.
- Evitar el uso injustificado de `any`.
- Utilizar nombres descriptivos.
- Mantener funciones pequeñas.
- Separar lógica de negocio, acceso a datos y presentación.
- Respetar los límites modulares definidos en `docs/architecture.md`.
- Validar datos recibidos desde formularios, importaciones o APIs.
- Manejar errores explícitamente.
- Agregar pruebas para reglas de negocio importantes.
- Evitar código duplicado.
- Documentar decisiones, no instrucciones obvias.

## Dependencias

Se permite instalar los frameworks y las dependencias aprobadas en
`docs/architecture.md` cuando una tarea de implementación los requiera.

Antes de instalar una dependencia nueva:

1. Explicar qué problema resuelve.
2. Revisar si el proyecto ya posee una solución equivalente.
3. Evaluar mantenimiento y seguridad.
4. Solicitar aprobación.

## Base de datos

- No eliminar tablas o columnas sin autorización.
- Los cambios de esquema deben usar migraciones.
- No editar manualmente bases de datos de producción.
- No incluir datos personales reales en pruebas.
- Mantener la lógica de negocio fuera de las consultas de interfaz.
- Incluir `userId` y filtrar por usuario según el ADR 0003.
- No realizar borrado físico normal de tareas durante el MVP; archivar en su
  lugar.

## Seguridad

- Nunca mostrar claves, tokens o contraseñas.
- Utilizar variables de entorno.
- Mantener `.env` fuera de Git.
- Crear `.env.example` sin valores secretos cuando se configure la aplicación.
- Validar autenticación y permisos del usuario en el servidor.
- No confiar solamente en controles visuales del frontend.
- No registrar secretos ni datos personales innecesarios en logs.

## Definición de terminado

Una tarea se considera terminada cuando:

- Cumple el requisito solicitado y el alcance aprobado.
- No rompe funcionalidades existentes.
- Las validaciones pasan.
- Las pruebas relacionadas pasan.
- No contiene secretos.
- El código es entendible.
- La documentación fue actualizada cuando corresponde.
- Se explicó cómo verificar el resultado.

## Restricciones de implementación

- Implementar el MVP de forma incremental; no generar la aplicación completa
  en una sola tarea.
- Cada bloque implementado debe pasar lint, typecheck, pruebas y build antes de
  considerarse terminado.
- No crear funcionalidades posteriores al MVP sin autorización.
- No implementar sincronización bidireccional con Google Calendar durante el
  MVP.
- No implementar multiusuario completo durante el MVP.
- No introducir microservicios durante el MVP.
- Toda modificación sustancial de la arquitectura aprobada requiere un ADR.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
