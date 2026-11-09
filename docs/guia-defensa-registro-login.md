# Guía para responder la validación: registro y login

Esta guía resume los tres objetivos de la actividad y dónde demostrar cada uno en el código. El proyecto separa las responsabilidades en rutas, controlador, servicio y modelo.

## Flujo general

```text
Postman → userRoutes → userController → userService → modelo User → MongoDB
```

- **Rutas:** reciben `POST /registro` y `POST /login`.
- **Controlador:** lee `req.body`, llama al servicio y elige el código HTTP de respuesta.
- **Servicio:** valida y normaliza datos, consulta MongoDB, compara contraseñas y crea el JWT.
- **Modelo:** define el esquema y cifra la contraseña antes de guardar.

## Dónde está cada parte

| Parte | Archivo | Ubicación aproximada | Qué explicar |
| --- | --- | --- | --- |
| Esquema de usuario | [`User.js`](../api/src/models/User.js#L5) | Líneas 5–57 | Campos, validaciones, rol y estado por defecto |
| Campo del hash | [`User.js`](../api/src/models/User.js#L35) | Líneas 35–39 | `passwordHash` es obligatorio y no se selecciona por defecto |
| Hash con bcrypt | [`User.js`](../api/src/models/User.js#L60) | Líneas 60–64 | Hook `pre('save')`, sal aleatoria y 12 rondas |
| Ocultar el hash | [`User.js`](../api/src/models/User.js#L67) | Líneas 67–71 | Elimina `passwordHash` al convertir el usuario a JSON |
| Registro en el servicio | [`userService.js`](../api/src/services/userService.js#L64) | Líneas 64–92 | Normaliza datos, requiere contraseña de 12 caracteres y crea el usuario |
| Login y comparación | [`userService.js`](../api/src/services/userService.js#L16) | Líneas 16–32 | Busca por email y compara la contraseña con `bcrypt.compare` |
| Firma del JWT | [`userService.js`](../api/src/services/userService.js#L34) | Líneas 34–39 | Incluye el id como subject, el rol y caducidad de una hora |
| Controlador | [`userController.js`](../api/src/controllers/userController.js#L3) | Líneas 3–18 | Delega registro/login al servicio y responde 201/200 |
| Rutas | [`userRoutes.js`](../api/src/routes/userRoutes.js#L5) | Líneas 5–9 | Conecta `registro`, `register` y `login` con el controlador |
| Montaje de rutas | [`index.js`](../api/src/index.js#L14) | Línea 14 | Añade el router bajo `/api/users` |
| Errores | [`errorHandler.js`](../api/src/middleware/errorHandler.js#L1) | Líneas 1–69 | Convierte errores de validación y duplicados en respuestas JSON |
| Dependencias | [`package.json`](../api/package.json#L14) | Líneas 14–19 | `bcrypt` y `jsonwebtoken` están instalados en la API |

## Respuestas breves a preguntas probables

### ¿Dónde se registra un usuario?

La ruta está en `api/src/routes/userRoutes.js`, líneas 6–7. Llama a `registerUser` del controlador. El controlador delega a `registerUser` del servicio, que prepara los datos y crea el documento con `User.create()`.

### ¿Dónde se cifra la contraseña?

En `api/src/models/User.js`, líneas 60–64, en un hook `pre('save')`. Si `passwordHash` ha cambiado, bcrypt genera una sal de 12 rondas y calcula el hash antes de escribir el documento en MongoDB. El servicio no cifra una segunda vez.

### ¿Cómo se evita devolver la contraseña?

El campo se llama `passwordHash` y usa `select: false` en el esquema. Además, el método `toJSON` elimina expresamente esa propiedad. Para verificar el login, el servicio solicita el campo de forma explícita con `.select('+passwordHash')`.

### ¿Cómo funciona el login?

El servicio busca el email normalizado, compara la contraseña recibida con el hash usando `bcrypt.compare` y rechaza credenciales incorrectas o cuentas inactivas. Si coinciden, firma un JWT.

### ¿Qué contiene el JWT y cuánto dura?

Incluye el rol y el identificador del usuario como `subject`; caduca en una hora. El secreto de firma se lee desde `JWT_SECRET` en `api/.env`. Un JWT firmado no cifra su contenido: no se deben incluir contraseñas ni datos secretos en el payload.

### ¿El JWT ya protege las demás rutas?

No. El login emite el token, pero todavía no hay middleware que lo valide y exija para acceder a otras rutas. El CRUD de usuarios está restringido por `localOnly`; eso no equivale a autorización con JWT.

### ¿Qué validaciones se aplican al registrar?

El nombre es obligatorio y tiene al menos 2 caracteres. El email es obligatorio, se convierte a minúsculas, se valida su formato y debe ser único. La contraseña debe ser texto y tener al menos 12 caracteres. Si no se proporciona rol, el modelo usa `client`.

### ¿Qué ocurre si el email ya existe?

MongoDB rechaza el índice único y el middleware global responde con HTTP 409 (`DUPLICATE_KEY_ERROR`).

### ¿Qué archivos forman el flujo?

`userRoutes.js` → `userController.js` → `userService.js` → `User.js`. Express monta las rutas en `/api/users` desde `index.js`.

## Demostración en Postman

Inicia MongoDB y el servidor (`cd api`, `npm run dev`). Selecciona **Body → raw → JSON** y usa estas peticiones:

### 1. Registro

`POST http://localhost:3000/api/users/registro`

```json
{
  "name": "Usuario Demo",
  "email": "demo.prueba@example.com",
  "password": "ClaveSegura2026!"
}
```

Esperado: **201 Created**, `status: "success"` y datos de usuario sin `password` ni `passwordHash`. Para repetir el registro, usa otro email porque el campo es único.

### 2. Login

`POST http://localhost:3000/api/users/login`

```json
{
  "email": "demo.prueba@example.com",
  "password": "ClaveSegura2026!"
}
```

Esperado: **200 OK**, usuario sin hash y una cadena `token` JWT.

## Qué mostrar en MongoDB

Busca el usuario recién registrado en la colección `users`. Enseña `name`, `email`, `role`, `active` y `passwordHash`. El hash no debe coincidir con la contraseña enviada y suele empezar por `$2b$12$`. No muestres ni envíes la contraseña real en una captura.

## Los tres objetivos de la rúbrica

1. **Registro y login (0,4):** demuestra las solicitudes de registro y login en Postman y señala rutas, controlador y servicio.
2. **Bcrypt y JWT (0,4):** enseña el hook de bcrypt en `User.js`, la comparación con `bcrypt.compare` y la firma con `jwt.sign` en `userService.js`.
3. **Postman y MongoDB (0,2):** adjunta la respuesta correcta de ambas peticiones y el documento guardado con `passwordHash`.

> Usa una contraseña de 12 caracteres o más. El ejemplo de la captura de la actividad contiene una contraseña más corta que la validación actual del proyecto.
