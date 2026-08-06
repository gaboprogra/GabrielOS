# Arquitectura de GabrielOS

## Aprobación

- Estado: Aprobada
- Fecha de aprobación: 2026-08-06
- Responsable: Gabriel
- Versión: 1.0

## Estilo arquitectónico

GabrielOS utilizará un monolito modular durante el MVP. La aplicación se
desplegará como una unidad, pero la lógica estará separada por módulos
funcionales.

No se crearán microservicios durante el MVP. Un módulo solo podrá extraerse
posteriormente cuando exista una necesidad técnica comprobable y una nueva
decisión arquitectónica.

## Motivos

- Reduce la complejidad de desarrollo.
- Facilita las pruebas locales.
- Evita infraestructura innecesaria.
- Permite desarrollar incrementalmente el MVP.
- Mantiene límites claros entre funcionalidades.
- Permite evolucionar cuando exista una necesidad real.

La decisión central está registrada en el ADR 0001.

## Tecnologías aprobadas

- TypeScript estricto.
- Next.js y React.
- PostgreSQL.
- Prisma para acceso a datos desde infraestructura o repositorios.
- Zod para validación en límites de entrada.
- Auth.js para autenticación.
- Vitest y Playwright para pruebas.
- pnpm para gestión de paquetes.
- Docker Compose para apoyar entornos locales cuando se implemente la
  infraestructura.

Esta lista define la arquitectura prevista; la aprobación de arquitectura no
instala dependencias ni sustituye la aprobación requerida antes de agregar
cada dependencia al repositorio.

## Módulos del MVP

- Autenticación y propiedad de datos.
- Categorías.
- Proyectos.
- Banco de tareas.
- Plan diario.
- Rutinas básicas.
- Historial.
- Integración con Google Calendar.
- Importación desde Google Sheets.
- Panel básico de cumplimiento.

Las estadísticas avanzadas, automatizaciones complejas y asistencia
inteligente no forman parte de estos módulos iniciales. El alcance completo se
define en `docs/scope.md`.

## Capas conceptuales

Cada módulo podrá contener:

- Presentación: páginas, componentes y controladores.
- Aplicación: casos de uso y servicios públicos del módulo.
- Dominio: entidades y reglas de negocio.
- Infraestructura: repositorios, Prisma y adaptadores externos.

No todos los módulos deberán tener necesariamente carpetas para cada capa. La
separación física se aplicará cuando aporte claridad, pero las reglas de
dependencia se mantienen siempre.

## Límites modulares

- Cada módulo controla sus reglas de negocio.
- Un módulo no accede directamente al repositorio interno de otro.
- La comunicación entre módulos se realiza mediante servicios o casos de uso
  públicos.
- Los componentes de interfaz no contienen lógica de negocio importante.
- Prisma se utiliza únicamente desde infraestructura o repositorios, no desde
  componentes de interfaz.
- El código compartido debe ser genuinamente genérico y no un mecanismo para
  eludir la propiedad de un módulo.
- No se crearán microservicios durante el MVP.

## Modelo de datos y propiedad

PostgreSQL será la fuente principal de información de GabrielOS. Los cambios
de estructura se realizarán mediante migraciones.

Las entidades principales tendrán un `userId` obligatorio. Las consultas se
filtrarán por el usuario autenticado y la autorización se verificará en el
servidor, aunque la primera instalación admita una sola cuenta. El detalle se
registra en el ADR 0003.

El modelo conceptual, los estados y las reglas de historial y archivado se
definen en `docs/domain-model.md`.

## Integraciones externas

Las integraciones se implementarán mediante adaptadores para evitar que la
lógica de negocio dependa directamente del proveedor.

Durante el MVP, la sincronización con Google Calendar será unidireccional desde
GabrielOS. GabrielOS será la fuente autoritativa y se utilizará la zona horaria
`America/La_Paz`. La idempotencia, los identificadores externos, errores,
reintentos y renovación de autorización se definen en el ADR 0002.

## Migración

La sustitución de Google Sheets se realizará mediante importaciones
controladas, identificadas por lote, con vista previa, validación, prevención
de duplicados y reversión antes del corte definitivo. El proceso completo se
define en `docs/migration-strategy.md`.

## API y aplicación

La aplicación expondrá endpoints internos, acciones de servidor o interfaces
equivalentes cuando sean necesarios. Todos ellos deben validar la entrada,
autenticar al usuario, autorizar el acceso y delegar las reglas en casos de uso
del módulo correspondiente.

## Requisitos no funcionales

Los mínimos de seguridad, respaldo, recuperación, errores, privacidad,
rendimiento, accesibilidad, responsive, entornos, configuración y secretos se
definen en `docs/non-functional-requirements.md`.

## Estado de la fase

Con la aprobación de esta versión y la coherencia de los documentos vinculados,
la fase de arquitectura queda cerrada el 2026-08-06. Los cambios sustanciales
posteriores requieren actualizar la documentación y registrar el ADR
correspondiente.
