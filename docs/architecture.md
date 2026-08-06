# Arquitectura de GabrielOS

## Estilo arquitectónico

GabrielOS utilizará inicialmente un monolito modular.

La aplicación se desplegará como una unidad, pero la lógica estará separada
por módulos funcionales.

## Motivos

- Reduce la complejidad de desarrollo.
- Facilita las pruebas locales.
- Evita infraestructura innecesaria.
- Permite desarrollar rápidamente el MVP.
- Mantiene límites claros entre funcionalidades.
- Permite extraer servicios posteriormente si existe una necesidad real.

## Tecnologías iniciales

- TypeScript.
- Next.js.
- React.
- PostgreSQL.
- Prisma.
- Zod.
- Auth.js.
- Vitest.
- Playwright.
- pnpm.
- Docker Compose.

## Módulos iniciales

- Autenticación.
- Tareas.
- Categorías.
- Proyectos.
- Plan diario.
- Rutinas.
- Calendario.
- Historial.
- Estadísticas.

## Capas conceptuales

Cada módulo podrá contener:

- Presentación: páginas, componentes y controladores.
- Aplicación: casos de uso.
- Dominio: reglas de negocio.
- Infraestructura: base de datos y servicios externos.

No todos los módulos deberán tener necesariamente carpetas para cada capa.
La separación se aplicará cuando exista suficiente complejidad.

## Base de datos

PostgreSQL será la fuente principal de información.

Los cambios de estructura se realizarán mediante migraciones.

## Integraciones externas

Las integraciones, como Google Calendar, se implementarán mediante adaptadores
para evitar que la lógica de negocio dependa directamente del proveedor.

## API

La aplicación expondrá endpoints internos cuando sean necesarios.

La lógica de negocio no deberá escribirse directamente dentro de componentes
visuales.

## Escalabilidad

No se crearán microservicios inicialmente.

Un módulo podrá extraerse como servicio independiente únicamente cuando
exista una necesidad técnica comprobable.
