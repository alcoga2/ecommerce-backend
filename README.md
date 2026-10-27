# E-commerce API — Figuras de Dragon Ball

## Descripció
Backend d'una botiga en línia de figures de col·leccionisme de Dragon Ball, desenvolupat per a l'assignatura Desenvolupament Web Full Stack (curs 2026-2027). El frontend es gestiona en un repositori separat.

## Tecnologies
- Runtime: Node.js
- API: Express 5
- Base de dades: MongoDB 7 amb Mongoose
- Hash de contrasenyes: bcrypt

## Funcionalitats

- CRUD de productes amb referència a categories i consultes que poden omplir aquesta referència amb `populate()`.
- CRUD de categories amb filtres per `active` i `name`, ordenació i paginació.
- CRUD local d'usuaris: contrasenyes amb hash bcrypt, rol `client` per defecte i baixa lògica (`active=false`). Els endpoints d'usuaris només accepten connexions locals i queden bloquejats amb `NODE_ENV=production`; són per a dades fictícies mentre no hi hagi autenticació i autorització.
- Gestió centralitzada d'errors amb respostes JSON coherents.

## Endpoints

| Recurs | Operacions |
| --- | --- |
| `/api/products` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/categories` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/api/users` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` (només local) |

Les llistes de categories i usuaris admeten `active`, `name`, `sort`, `page` i `limit`. La mida per defecte és 10 i el màxim és 50. La resposta inclou `data` i les metadades de `pagination`.

## Execució local

Des de l'arrel del repositori, inicia MongoDB amb Docker Compose:

```bash
docker compose -f docker/docker-compose.yml up -d
```

El servei publica MongoDB al port local `27020` i conserva les dades en un volum Docker. Configura `api/.env` amb la connexió a la base de dades i el port de l'API:

```env
MONGO_URI=mongodb://admin:1234@localhost:27020/mongodb_docker_test?authSource=admin
PORT=3000
```

Les credencials definides a Compose són exclusivament de desenvolupament local; no les reutilitzis ni exposis aquest servei en producció.

Instal·la i inicia l'API:

```bash
cd api
npm install
npm run dev
```

L'API queda disponible a `http://localhost:3000`. Per comprovar que està en marxa, obre `GET /`. Per aturar MongoDB sense eliminar les dades, executa `docker compose -f docker/docker-compose.yml down` des de l'arrel.

## Postman i documentació

Importa la col·lecció `postman/Ecommerce API.postman_collection.json` i l'entorn `postman/Ecommerce Local.postman_environment.json`; selecciona **Ecommerce Local**. La col·lecció inclou proves de CRUD i validació amb dades fictícies.

Els casos d'errors documentats i els exemples de filtres/paginació són a [`docs/validacions-errors.md`](docs/validacions-errors.md). No despleguis públicament `/api/users` abans d'implementar autenticació (JWT) i control d'accés (RBAC).
