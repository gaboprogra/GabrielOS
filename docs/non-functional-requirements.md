# Requisitos no funcionales del MVP

## Propósito

Estos requisitos establecen mínimos verificables adecuados para un sistema
personal. No presuponen infraestructura empresarial ni un proveedor de
despliegue específico.

## Seguridad

- Todo acceso a datos requiere una sesión autenticada, salvo el flujo mínimo
  necesario para iniciar sesión o habilitar la primera cuenta.
- Toda lectura o escritura de una entidad principal verifica `userId` en el
  servidor.
- Las entradas de formularios, APIs e importaciones se validan en el servidor.
- Las cookies de sesión se configuran con opciones seguras apropiadas al
  entorno de producción y no son accesibles desde JavaScript cuando no sea
  necesario.
- Las operaciones sensibles rechazan solicitudes sin autorización aunque la
  interfaz o una URL sean manipuladas.
- Deben existir pruebas de autorización para, como mínimo, tareas, plan diario,
  historial, importaciones e integración de calendario.

## Copias de seguridad

- La base de datos de producción tendrá una copia de seguridad automática al
  menos diaria.
- Se conservarán como mínimo las siete copias diarias más recientes durante el
  MVP.
- Los respaldos se almacenarán separados de la instancia activa y protegidos
  con controles de acceso.
- Antes de una migración destructiva o una importación final se generará un
  respaldo recuperable.

## Recuperación

- Se documentará el procedimiento para restaurar base de datos y configuración
  sin copiar secretos al repositorio.
- Se probará una restauración antes del primer uso diario y después de cambios
  relevantes en el mecanismo de respaldo.
- Para el MVP se acepta un objetivo de punto de recuperación de hasta 24 horas
  y un objetivo de restauración de hasta 4 horas, medidos desde que Gabriel
  inicia el procedimiento.
- Una restauración se verifica comprobando acceso, conteos básicos y consulta
  de tareas, plan e historial.

## Registro y gestión de errores

- Los errores de servidor se registran con fecha, entorno, operación,
  identificador de correlación y contexto técnico mínimo.
- Los errores de sincronización e importación incluyen estado y datos
  suficientes para reintentar o corregir la operación.
- Los logs no contienen contraseñas, tokens, cookies, secretos ni archivos CSV
  completos.
- La interfaz muestra un mensaje comprensible y un identificador de referencia
  cuando el detalle técnico no sea seguro para el usuario.
- Los errores no controlados de los flujos principales deben poder localizarse
  mediante su identificador de correlación en una verificación manual.

## Privacidad

- Se recopilan únicamente los datos necesarios para las funciones aprobadas.
- Los datos personales no se usan en pruebas automatizadas, demostraciones ni
  documentación.
- No se incorporan analíticas de terceros ni se envían datos a nuevos
  proveedores sin una decisión y autorización explícitas.
- Los archivos de importación y reportes se protegen como datos personales y
  se eliminan cuando termina el periodo operativo necesario.
- Archivar conserva los datos según el modelo de dominio; cualquier futura
  eliminación física requerirá una política explícita.

## Rendimiento

- En un entorno representativo del MVP, el percentil 95 de las consultas del
  banco de tareas y del plan diario debe responder en menos de 2 segundos para
  hasta 10 000 tareas y un año de elementos del plan del usuario.
- Crear, actualizar o reprogramar debe confirmar la operación local en menos de
  2 segundos en el percentil 95, sin esperar que Google Calendar complete su
  trabajo remoto.
- Las importaciones y sincronizaciones se diseñan para no bloquear la interfaz;
  muestran progreso o estado cuando superen 2 segundos.
- Las mediciones excluyen el tiempo de red de proveedores externos y deben
  documentar datos, entorno y resultado.

## Accesibilidad básica

- Los flujos principales pueden completarse con teclado.
- Los controles tienen nombre accesible, las etiquetas se asocian a sus campos
  y el foco visible no se elimina.
- El texto y los controles esenciales buscan contraste WCAG 2.1 nivel AA.
- Los errores se comunican por texto y no únicamente mediante color.
- La estructura usa encabezados y elementos semánticos en orden comprensible.
- Una revisión automatizada y una comprobación manual de teclado no deben
  presentar bloqueos en autenticación, captura de tarea y plan diario.

## Compatibilidad responsive

- Los flujos principales son utilizables sin desplazamiento horizontal de la
  página entre 360 y 1440 píxeles de ancho.
- La captura de tareas, el plan diario y la resolución de errores de formulario
  funcionan con entrada táctil y escritorio.
- Se verificarán la versión estable actual y la anterior de Chrome, Firefox,
  Edge y Safari al momento de cada versión relevante, cuando estén disponibles
  en las plataformas de prueba.

## Entornos

- Desarrollo, pruebas y producción usan configuraciones y bases de datos
  separadas.
- Los entornos no productivos utilizan datos ficticios o anonimizados.
- Las migraciones se prueban fuera de producción antes de aplicarse.
- El comportamiento esencial debe ser reproducible localmente sin depender de
  credenciales de producción.

## Variables de configuración

- La configuración variable por entorno se suministra mediante variables de
  entorno y se valida al iniciar la aplicación.
- Cuando se implemente la aplicación, `.env.example` documentará nombres y
  finalidad con valores vacíos o seguros, nunca secretos reales.
- La zona horaria del MVP se configura explícitamente como
  `America/La_Paz` donde afecte reglas de negocio o integración.
- Una variable ausente o inválida produce un error de inicio claro, sin revelar
  valores sensibles.

## Protección de secretos

- `.env` y archivos con credenciales permanecen fuera de Git.
- Tokens de OAuth, claves de sesión y credenciales de base de datos se guardan
  en mecanismos apropiados del entorno de ejecución, con acceso mínimo.
- Ningún secreto aparece en código, historial, URLs, logs, capturas,
  documentación o datos de prueba.
- Los tokens de Google se cifran en reposo cuando se persistan y pueden
  revocarse o sustituirse sin cambiar código.
- Antes de cada entrega se revisan el diff y los archivos versionados para
  detectar secretos accidentales.

## Verificación mínima antes de una entrega del MVP

- Pruebas relacionadas y validaciones estáticas aprobadas.
- Pruebas de aislamiento por `userId` y reglas críticas del dominio aprobadas.
- Flujos principales revisados en ancho móvil y escritorio.
- Errores y logs revisados para confirmar que no exponen secretos.
- Resultado de rendimiento documentado si el cambio afecta consultas,
  importación o sincronización.
- Procedimiento de respaldo y restauración vigente para cambios de datos.
