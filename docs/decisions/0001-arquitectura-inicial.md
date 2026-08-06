# ADR 0001: Arquitectura inicial

## Estado

Aceptada.

## Contexto

GabrielOS requiere una aplicación web robusta, pero será desarrollada
inicialmente por una sola persona y para un único usuario.

Utilizar microservicios desde el inicio aumentaría la complejidad de
desarrollo, despliegue, pruebas y mantenimiento.

## Decisión

Utilizar un monolito modular construido con TypeScript, Next.js y PostgreSQL.

Los módulos tendrán límites claros y la comunicación con servicios externos
se realizará mediante adaptadores.

## Consecuencias positivas

- Desarrollo inicial más rápido.
- Menor costo operativo.
- Pruebas más sencillas.
- Despliegue simplificado.
- Código centralizado.
- Posibilidad de evolución gradual.

## Consecuencias negativas

- La aplicación se desplegará inicialmente como una unidad.
- Será necesario mantener disciplina para evitar mezclar módulos.
- Una falla grave puede afectar a toda la aplicación.

## Alternativas descartadas

### Microservicios

Descartados por complejidad innecesaria para el MVP.

### Frontend y backend completamente separados

Descartados inicialmente porque duplicarían configuración, despliegue y
mantenimiento sin aportar una ventaja suficiente en esta etapa.
