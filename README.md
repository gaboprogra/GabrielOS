# GabrielOS

GabrielOS es un sistema personal de organización, planificación y seguimiento
diseñado para centralizar tareas, rutinas, proyectos, agenda, historial y
automatizaciones.

## Estado del proyecto

La visión y la arquitectura versión 1.0 fueron aprobadas por Gabriel el
2026-08-06. La fase de implementación incremental del MVP está habilitada.

La base ejecutable utiliza Next.js, React, TypeScript estricto y Tailwind CSS.
El primer bloque implementado es el dominio mínimo de tareas, con la regla pura
que determina si una tarea está atrasada. Todavía no se implementaron CRUD,
autenticación, persistencia ni integraciones externas.

## Requisitos

- Node.js 20.9 o superior. El entorno inicial fue verificado con Node.js
  22.17.0.
- pnpm 10.32.1, fijado mediante `packageManager` en `package.json`.

## Instalación

```bash
pnpm install
```

La instalación no requiere secretos ni servicios externos en esta etapa.

## Desarrollo

Iniciar el servidor local:

```bash
pnpm dev
```

Después, abrir `http://localhost:3000`.

## Comandos de calidad

- `pnpm lint`: ejecuta ESLint.
- `pnpm typecheck`: genera los tipos de rutas de Next.js y verifica TypeScript
  sin emitir archivos.
- `pnpm test`: ejecuta las pruebas unitarias una vez con Vitest.
- `pnpm test:watch`: ejecuta Vitest en modo interactivo.
- `pnpm build`: genera el build de producción.
- `pnpm check`: ejecuta lint, typecheck, test y build, en ese orden.

## Estructura inicial

```text
src/
├── app/                         # App Router, portada y estilos globales
├── modules/
│   └── tasks/
│       └── domain/              # Task, estados, reglas y pruebas unitarias
└── shared/
    └── domain/                  # Conceptos genéricos futuros, actualmente vacío
```

Solo se crean módulos cuando una funcionalidad comienza a implementarse.

## Alcance aprobado del MVP

El MVP incluye autenticación para un usuario inicial, categorías, proyectos,
banco de tareas, plan diario, rutinas básicas, historial, sincronización
unidireccional con Google Calendar, importación desde Google Sheets y un panel
básico de cumplimiento.

Las estadísticas avanzadas, planificación automática, inteligencia artificial,
aplicación móvil nativa, multiusuario completo, integraciones adicionales y
automatizaciones complejas quedan para después del MVP. El detalle normativo
está en `docs/scope.md`.

## Documentación

- [Rutinas, generación automática y Calendar](docs/routines.md)

- Visión aprobada: `docs/vision.md`.
- Alcance del MVP: `docs/scope.md`.
- Arquitectura aprobada: `docs/architecture.md`.
- Modelo de dominio: `docs/domain-model.md`.
- Estrategia de migración: `docs/migration-strategy.md`.
- Requisitos no funcionales: `docs/non-functional-requirements.md`.
- Decisiones técnicas: `docs/decisions/`.
- Reglas para agentes: `AGENTS.md`.
