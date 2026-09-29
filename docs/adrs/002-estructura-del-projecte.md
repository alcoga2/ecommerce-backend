# ADR-002: Estructura del projecte (Repositoris separats)

## Data
2026-09-29

## Estat
Aprovat

## Context
Per al desenvolupament de l'aplicació web Full Stack, hem de decidir l'organització del codi font i la gestió de repositoris.

## Decisió
Optem per una arquitectura de **repositoris separats** (repositori independent per al backend i un altre per al frontend).

## Conseqüències
### Positives (+)
* Aïllament clar de responsabilitats i independència en el cicle de vida i CI/CD de cada part.
* Menor complexitat en la configuració de scripts de construcció i eines de desplegament.
* Permet un control d'accés i versions més net per a cada mòdul.

### Negatives (-)
* Cal gestionar dos repositoris de Git independents.
* Duplicació de certs tipus o interfícies entre frontend i backend si no es fa servir un paquet compartit.