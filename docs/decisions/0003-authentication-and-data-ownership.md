# ADR 0003: Autenticación y propiedad de datos

## Estado

Aceptada.

## Metadatos

- Fecha: 2026-08-06
- Responsable: Gabriel
- Versión: 1.0

## Contexto

La primera instalación de GabrielOS está destinada a un único usuario, pero la
información personal requiere protección incluso en ese escenario. Construir
el esquema sin propietario haría costosa y riesgosa una evolución futura hacia
más usuarios.

La interfaz no constituye una frontera de seguridad. Toda operación de servidor
debe identificar al usuario y limitar explícitamente los datos que puede
consultar o modificar.

## Decisión

El MVP incluirá autenticación mediante Auth.js. La primera instalación podrá
limitar el registro a una sola cuenta mediante un flujo de configuración
inicial o una lista explícita de cuentas admitidas. Una vez creada la cuenta
inicial, el registro público permanecerá cerrado salvo configuración y
autorización deliberadas.

Las entidades principales tendrán un `userId` obligatorio. Esto incluye, como
mínimo:

- `Category`.
- `Project`.
- `Task`.
- `DailyPlanItem`.
- `Routine`.
- `CalendarEvent` y credenciales o conexiones asociadas.
- `HistoryEntry`.
- Lotes y registros de importación.

Las entidades de soporte que solo existen como parte interna de otra entidad
deben quedar protegidas por la misma propiedad, ya sea mediante `userId` propio
o mediante una relación obligatoria cuya propiedad se verifique.

## Reglas de acceso

- Toda consulta de datos personales incluye el `userId` obtenido de la sesión
  autenticada.
- El servidor no acepta un `userId` enviado por el cliente como prueba de
  identidad.
- Obtener un registro por identificador también filtra o verifica su
  propietario antes de leerlo, modificarlo o relacionarlo.
- Las relaciones entre tareas, proyectos, categorías, planes y rutinas solo se
  permiten cuando todas las entidades pertenecen al mismo usuario.
- Los casos de uso verifican autorización antes de ejecutar reglas o efectos
  externos.
- Los componentes visuales pueden ocultar acciones, pero eso no sustituye la
  verificación del servidor.
- El acceso denegado no revela si existe un registro de otro usuario.

## Persistencia

- `userId` será una clave foránea no nula e indexada en las entidades
  principales.
- Las restricciones únicas que representen datos del usuario incluirán
  `userId` cuando deban ser únicas por propietario.
- Repositorios y servicios recibirán el contexto del usuario de forma explícita
  y no ofrecerán operaciones personales sin ese contexto.
- Prisma se utilizará desde repositorios o infraestructura y las consultas
  reutilizables deben hacer evidente el filtro de propiedad.
- Las migraciones y tareas administrativas excepcionales deben documentar cómo
  mantienen o asignan la propiedad.

## Integraciones e historial

- Una conexión de Google Calendar pertenece a un usuario y sus eventos no
  pueden asociarse a elementos de otro.
- Los trabajos diferidos conservan el `userId` y vuelven a comprobar las
  relaciones antes de ejecutar un efecto externo.
- Cada `HistoryEntry` pertenece al mismo usuario que la entidad registrada.
- Un registro técnico puede identificar al actor o proceso, pero nunca omitir
  la propiedad del dato afectado.

## Preparación para multiusuario futuro

La arquitectura y el esquema permitirán almacenar más de un propietario y
probar el aislamiento entre ellos. Esto no obliga al MVP a incluir:

- Registro público.
- Administración de usuarios.
- Equipos, organizaciones o roles complejos.
- Compartición de tareas o proyectos.
- Invitaciones, delegación ni colaboración.

Agregar estas capacidades requerirá revisar amenazas, experiencia y modelo de
autorización, y registrar una nueva decisión si cambia la arquitectura.

## Verificación

- Las pruebas crean al menos dos usuarios ficticios para confirmar que uno no
  puede leer, modificar, relacionar, importar ni sincronizar datos del otro.
- Se prueban accesos por identificador válido perteneciente a otro usuario.
- Se prueba que el registro de una segunda cuenta queda bloqueado cuando la
  instalación está configurada para una sola.
- La revisión del código comprueba filtros en repositorios y autorización en
  casos de uso y endpoints.

## Consecuencias positivas

- Los datos quedan protegidos desde la primera versión.
- La evolución a multiusuario no exige agregar propiedad retrospectivamente a
  todas las entidades.
- Las reglas de acceso son comprobables con pruebas automatizadas.

## Consecuencias negativas

- Incluso una instalación de una cuenta requiere autenticación y filtros.
- Cada consulta, relación, importación y trabajo diferido debe transportar el
  contexto del usuario.
- Será necesario evitar que abstracciones genéricas oculten filtros de
  propiedad.

## Alternativas descartadas

### Sin autenticación por tratarse de un usuario

Descartada porque una aplicación web puede quedar expuesta y contiene datos
personales e integraciones autorizadas.

### Agregar propiedad cuando se implemente multiusuario

Descartada porque obligaría a migrar todas las entidades y aumentaría el riesgo
de accesos cruzados.
