# Backlog — à faire plus tard

Points connus, non bloquants pour démarrer, à reprendre après la mise en ligne. Ajouter ici toute idée ou dette repérée, avec le contexte utile pour la reprendre.

## Parcours : évolutions prévues après la V1

Voir [course-enrollment.md](course-enrollment.md) pour ce qui existe.

- **Replays** des séances de groupe (annoncés dans le marketing : « Replay disponible 30 jours »), à retirer du site ou à construire.
- **Checkpoints** : les 2 bilans oral et écrit par niveau annoncés dans le marketing.
- **Changement de groupe** en cours de route (déménagement, horaires) sans annuler l’inscription.
- **Crédit du cours d’essai** (39 € déduits d’un parcours sous 7 jours), annoncé dans le marketing : à construire ou à retirer des pages.
- **Plusieurs professeurs** : rattacher chaque groupe à un professeur.

## Suppression automatique des comptes inactifs (3 ans)

- **Pourquoi** : la politique de confidentialité (`/confidentialite`, section « Durées de conservation ») annonce la suppression des comptes après 3 ans d’inactivité. Ce n’est pas encore automatisé : à faire avant que les premiers comptes atteignent 3 ans.
- **Piste** :
    - enregistrer la dernière activité (par exemple une colonne `last_seen_at` mise à jour à la connexion) ;
    - une commande planifiée quotidienne qui traite les comptes inactifs depuis 3 ans avec `DeleteUserAccount` (anonymisation si l’élève a déjà réservé, suppression sinon) ;
    - prévenir l’utilisateur par email environ 30 jours avant ;
    - ne jamais toucher aux comptes de l’équipe (permission de gérer les essais).

## Alerte si le planificateur ou la file d’attente s’arrête

- **Pourquoi** : sans planificateur, les paiements abandonnés ne sont plus libérés, les paiements Stripe ne sont plus rattrapés et les rappels ne partent plus ; sans worker de file d’attente, aucun email ne part et les webhooks Stripe ne sont pas traités. Aujourd’hui, rien ne prévient si l’un des deux s’arrête.
- **Piste** :
    - un « battement de cœur » : une tâche planifiée chaque minute enregistre l’heure (cache) et pousse un petit job dans la file ;
    - le tableau de bord de l’équipe affiche un avertissement si le dernier battement a plus de 5 minutes ;
    - en production, compléter par une surveillance externe (Oh Dear, Better Stack, Laravel Cloud…) qui alerte par email ou SMS.
