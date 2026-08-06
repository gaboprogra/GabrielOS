# AGENTS.md

## Contexto del proyecto

GabrielOS es un sistema personal de organización, planificación, seguimiento
y automatización.

La aplicación debe reemplazar progresivamente un prototipo construido con
Google Sheets, Google Apps Script y Google Calendar.

Antes de trabajar, revisar:

- `README.md`
- `docs/vision.md`
- `docs/architecture.md`
- `docs/decisions/`

## Reglas generales

- No modificar archivos que no estén relacionados con la tarea.
- No instalar dependencias sin explicar primero por qué son necesarias.
- No reemplazar tecnologías existentes sin autorización.
- No eliminar funcionalidades sin autorización.
- No introducir secretos, contraseñas o claves en el repositorio.
- No guardar credenciales reales en archivos versionados.
- No modificar la arquitectura sin registrar una decisión técnica.
- No considerar una tarea terminada sin verificar el resultado.
- Priorizar soluciones simples, mantenibles y fáciles de probar.
- Evitar microservicios salvo que exista una necesidad demostrable.

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
- Validar datos recibidos desde formularios o APIs.
- Manejar errores explícitamente.
- Agregar pruebas para reglas de negocio importantes.
- Evitar código duplicado.
- Documentar decisiones, no instrucciones obvias.

## Dependencias

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

## Seguridad

- Nunca mostrar claves, tokens o contraseñas.
- Utilizar variables de entorno.
- Mantener `.env` fuera de Git.
- Crear `.env.example` sin valores secretos.
- Validar permisos del usuario en el servidor.
- No confiar solamente en controles visuales del frontend.

## Definición de terminado

Una tarea se considera terminada cuando:

- Cumple el requisito solicitado.
- No rompe funcionalidades existentes.
- Las validaciones pasan.
- Las pruebas relacionadas pasan.
- No contiene secretos.
- El código es entendible.
- La documentación fue actualizada cuando corresponde.
- Se explicó cómo verificar el resultado.

## Restricciones actuales

Mientras el proyecto esté en fase de arquitectura:

- No generar la aplicación completa.
- No instalar frameworks.
- No crear bases de datos.
- No implementar autenticación.
- No implementar integraciones externas.

Primero deben aprobarse la visión y la arquitectura.
