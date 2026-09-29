# ADR-001: Elecció de base de dades principal

## Data
2026-09-29

## Estat
Aprovat

## Context
Per a l'aplicació e-commerce necessitem un sistema d'emmagatzematge de dades que sigui flexible, escalable i que permeti gestionar catàlegs de productes, usuaris i comandes amb estructures de dades que poden evolucionar en el temps.

## Decisió
Farem servir **MongoDB** com a base de dades NoSQL principal, executada i gestionada mitjançant un contenidor **Docker**.

## Conseqüències
### Positives (+)
* Alta flexibilitat de l'esquema de dades (ideal per a catàlegs de productes amb atributs variables).
* Integració nativa i excel·lent rendiment amb l'ecosistema Node.js / Express.
* Fàcil desplagament en entorns de desenvolupament mitjançant Docker.

### Negatives (-)
* Menys adequat per a transaccions complexes multicomanda en comparació amb bases de dades relacionals (SQL).
* Requerirà una bona definició de validacions a nivell d'aplicació (p. ex., amb Mongoose).