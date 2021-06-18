# Drawing Arm (traceur)

Ceci est un projet d'école consistant à dessiner des formes avec un Raspberry PI, des servomoteurs et un site web.

## Aperçu

Site web :

![screenshot-suivi-trace](https://user-images.githubusercontent.com/37781713/122549475-ce1ecf80-d032-11eb-938f-6187fc3101f2.png)

Exemple en fonctionnement (traçage d'un carré) :

https://user-images.githubusercontent.com/37781713/122550028-7765c580-d033-11eb-8827-d06dfd35e555.mp4

## Utilisation

Ce projet nécessite Node.js, Yarn et doit être lancé sur une carte Raspberry PI 3.

Installation :
```
yarn
```

Démarrage du serveur :
```
yarn server
```

Démarrage de la version de développement du client :
```
yarn start
```

Création de la version de production du client (disponible dans le dossier `build/`):
```
yarn build
```

Note : lorsque la version de développement du client est utilisé, le serveur et le client doivent être tous les deux démarrés.

## Licence

MIT Licence

Copyright (c) 2021 gauthier-th (mail@gauthierth.fr)

Créé par Tom, Baptiste, Clément et Gauthier.