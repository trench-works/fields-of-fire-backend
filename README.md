# Les Mémoires Oubliées

Voici le serveur WebSocket du projet Mémoires Oubliées.

## Struture Applicative

L'application est divisées en **Module**
Chaque **Module** contient un ou plusieurs **Controller**
Dans la logique, chaque **Controller** corresponde à un écran de jeu

Le **WebSocket** du client va venir s'abonner à un **Controller** à l'entrée de l'écran, et toutes les actions utilisateurs nécessitant de la manipulation de données feront des appels au **WebSocket**

### E.g

-   Entrée dans la liste des lobby disponibles -> abonnement au Controller "Menu" -> récupération de la liste des lobby
-   Si un lobby est créé, mis à jour ou supprimé -> On envoit la liste à jour à tous les clients connectés
-   Le joueur clique pour rejoindre un lobby -> mise à jour du lobby -> envoi d'un message au socket du client concerné
-   Déconnexion du Socket

# Framework Peregrin

<center>
 <img src='peregrin.png' width='20%' />
</center>

Le framework de l'application (baptisé Peregrin) fournit une interface simple et solide aux développeurs logiciels.

Il est basé sur un système d'injection (simplifiant et optimisation l'utilisation de dépendances inter-modules).

Il fournit aussi des services de base:
- LoggerService -> Injectable avec le nom "Logger"
- ConfigService -> Injectable avec le nom "ConfigService"

Il permet aussi notamment de typer l'interface pour le WebSocket, de cette manière, les dev ne risquent pas d'oublier un paramètre lors de l'envoi d'un message, et connaissent l'interface d'un message reçu.