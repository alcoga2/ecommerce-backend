# 4.4 Validacions i gestió centralitzada d'errors

Les rutes deleguen els errors al middleware global `api/src/middleware/errorHandler.js`. Les respostes d'error segueixen aquest format i no inclouen stack traces ni missatges interns de MongoDB:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les dades no són vàlides",
    "details": [{ "field": "email", "message": "Introdueix un email vàlid" }]
  }
}
```

| HTTP | Codi d'error | Quan s'utilitza |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | ID invàlid, JSON incorrecte o camp no permès |
| 404 | `NOT_FOUND` | Recurs inexistent o ruta no definida |
| 409 | `DUPLICATE_KEY_ERROR` | Email o slug duplicat |
| 422 | `VALIDATION_ERROR` | Validació de Mongoose (camps obligatoris, format, longitud) |
| 500 | `INTERNAL_SERVER_ERROR` | Error inesperat, amb missatge genèric |

Les operacions correctes retornen 200 per consultes i modificacions, 201 en crear i 204 en eliminar una categoria o producte. La baixa d'usuari és lògica i retorna 200 amb `active: false`.

## Casos per reproduir a local

Cal tenir MongoDB local i l'API en execució amb `MONGO_URI` configurada. `localOnly` bloqueja `/api/users` si `NODE_ENV=production` o si la petició no arriba per loopback. Les dades següents són fictícies. Amb PowerShell es poden enviar les peticions amb `Invoke-RestMethod`; per veure també el cos d'error, capturar `$_.ErrorDetails.Message`.

### 1. Crear categoria sense nom

```http
POST /api/categories
Content-Type: application/json

{"slug":"sense-nom"}
```

Esperat: **422**, `VALIDATION_ERROR`, detall del camp `name` (obligatori).

### 2. Slug duplicat

Crear una vegada `{"name":"Electrònica","slug":"electronica"}` i repetir la mateixa petició.

Esperat en la segona petició: **409**, `DUPLICATE_KEY_ERROR`, detall del camp `slug`.

### 3. ID invàlid

```http
GET /api/categories/no-es-un-objectid
```

Esperat: **400**, `BAD_REQUEST`, missatge `Formato de ID no válido`.

### 4. Usuari inexistent

```http
GET /api/users/507f1f77bcf86cd799439011
```

Esperat: **404**, `NOT_FOUND`, missatge `Usuario no encontrado` (sempre que aquest ID no existeixi).

### 5. Email duplicat

Crear un usuari fictici amb `{"name":"Usuari Demo","email":"demo@example.test","password":"contrasenya-ficticia-123"}` i repetir la petició amb el mateix email.

Esperat en la segona petició: **409**, `DUPLICATE_KEY_ERROR`, detall del camp `email`. El cos de resposta no inclou `password` ni `passwordHash`.

### 6. Modificar camps no permesos

Amb un usuari existent, enviar `PUT /api/users/<id>` amb `{"role":"admin"}` (també s'han de rebutjar `active` i `passwordHash`).

Esperat: **400**, `BAD_REQUEST`, amb el camp rebut marcat com `Campo no permitido`; el rol roman sense canvis.

## Resultat de verificació

La sintaxi dels fitxers modificats s'ha comprovat amb `node --check`. Els sis casos anteriors documenten el resultat esperat, però no s'han executat contra MongoDB en aquest entorn perquè Docker Desktop no estava disponible (no es podia connectar al seu motor). Cal executar-los amb la base de dades local activa per confirmar els resultats d'extrem a extrem.

## 4.5 Filtres, ordenació i paginació

Les llistes `GET /api/categories` i `GET /api/users` admeten:

- `active=true|false` per filtrar l'estat.
- `name=<text>` per cercar sense distingir majúscules i minúscules; els caràcters es tracten com a text literal.
- `sort=<camp>` ascendent o `sort=-<camp>` descendent. Categories: `name`, `createdAt`. Usuaris: `name`, `email`, `createdAt`.
- `page` i `limit` com a enters positius. Per defecte són 1 i 10; el límit màxim és 50 resultats (un `limit` més gran es redueix a 50).

Exemple: `GET /api/users?name=anna&sort=-createdAt&page=2&limit=5`.

Resposta de llista:

```json
{
  "data": [],
  "pagination": { "page": 2, "limit": 5, "total": 25, "totalPages": 5 }
}
```

Un `active` diferent de `true` o `false`, un camp d'ordenació no permès o un `page`/`limit` que no sigui un enter positiu segur retorna **400 `BAD_REQUEST`**. La consulta combina filtres amb ordenació i paginació; el recompte total correspon als resultats filtrats.
