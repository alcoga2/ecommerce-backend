# Verificació local amb Postman

1. Importa `Ecommerce API.postman_collection.json` i `Ecommerce Local.postman_environment.json` a Postman.
2. Selecciona l'entorn **Ecommerce Local**.
3. Inicia MongoDB i l'API a `http://localhost:3000` en mode local.
4. Executa la col·lecció en l'ordre definit. Les variables `productId`, `categoryId`, `categorySlug`, `userId` i `userEmail` s'assignen durant l'execució.

La col·lecció conté les operacions CRUD de Products, Categories i Users, més les proves de validació demanades. Les dades són fictícies. La categoria i el producte de prova s'eliminen; l'usuari es desactiva perquè el DELETE d'usuaris és una baixa lògica. Els fitxers exportats no contenen credencials ni secrets.

No s'han enviat les peticions des d'aquesta sessió; els fitxers i scripts s'han validat com a JSON i JavaScript. Cal executar la col·lecció amb l'API i MongoDB locals disponibles per obtenir els resultats HTTP.
