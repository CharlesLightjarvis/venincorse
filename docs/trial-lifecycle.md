# Cours d’essai — cycle de vie, emails et suivi

Ce document décrit ce qui se passe **après** le paiement d’un cours d’essai : préparation de la visio, emails, rappel, séance, clôture, annulation et cas de paiement à vérifier. Le paiement lui-même est décrit dans [payments.md](payments.md).

## Audit de départ (novembre 2026)

Le parcours payant (paiement Stripe, verrouillage du créneau, rattrapage des webhooks, permissions) était solide. Il manquait ce qui suit le paiement :

| #   | Manque constaté                                                                                                                       | État                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Aucun email : ni confirmation, ni lien de visio, ni rappel. L’élève devait revenir sur le site pour découvrir son lien.               | Corrigé                                                  |
| 2   | Rien après la séance : « Rejoindre la séance » restait affiché, le lien restait modifiable, pas de statut « réalisée » ni « absent ». | Corrigé                                                  |
| 3   | Aucune annulation possible côté professeur : un remboursement manuel dans Stripe n’était pas connu de l’application.                  | Corrigé                                                  |
| 4   | « Vérification manuelle nécessaire » sans issue dans l’application.                                                                   | Corrigé                                                  |
| 5   | Le planificateur et la file d’attente ne sont garantis qu’en local.                                                                   | Documenté (à mettre en place au déploiement)             |
| —   | Liste de gestion limitée aux 100 derniers essais.                                                                                     | Corrigé (filtres côté serveur, chargement au défilement) |
| —   | `trial-booking.md` décrivait des fonctions de la démo absentes du vrai parcours.                                                      | Corrigé                                                  |
| —   | Un seul professeur : essais et disponibilités ne sont rattachés à personne.                                                           | Restant (voir plus bas)                                  |

## Statuts d’un essai

| Statut           | Signification                                                                                                                                                                     | Suite possible                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pending`        | Créneau réservé, paiement à faire (45 min)                                                                                                                                        | `processing`, `confirmed`, `expired`                                                                 |
| `processing`     | Paiement envoyé, en vérification                                                                                                                                                  | `confirmed`, `expired`, `payment_review`                                                             |
| `payment_review` | Paiement non confirmable automatiquement (créneau pris ou trop proche, montant inattendu, session Stripe introuvable, remboursement échoué). L’équipe reçoit une alerte par email | `confirmed`, `refunded` ou `expired` (créneau libéré si rien n’a été débité), décision du professeur |
| `confirmed`      | Payé, séance à venir ou en cours                                                                                                                                                  | `ended`, `cancelled` (et clôture possible dès le début de la séance)                                 |
| `ended`          | Heure de fin passée, **à clôturer** par le professeur (passage automatique, chaque minute)                                                                                        | `completed`, `no_show`                                                                               |
| `completed`      | Séance réalisée                                                                                                                                                                   | —                                                                                                    |
| `no_show`        | L’élève ne s’est pas présenté (séance due)                                                                                                                                        | —                                                                                                    |
| `cancelled`      | Annulée par le professeur, élève remboursé                                                                                                                                        | —                                                                                                    |
| `expired`        | Non payé dans le délai, créneau libéré                                                                                                                                            | —                                                                                                    |
| `refunded`       | Payé trop tard ou après vérification, remboursé                                                                                                                                   | —                                                                                                    |

Un élève n’a droit qu’à **un** cours d’essai : `confirmed`, `completed`, `no_show` (et les paiements en cours) bloquent une nouvelle réservation. Après `cancelled`, `refunded` ou `expired`, il peut réserver à nouveau.

## Règles côté élève (Ma réservation d’essai)

Inspirées de Calendly et Preply, et reprises mot pour mot dans les CGV (`/cgv`) :

- **Report** : gratuit, **une fois**, jusqu’à **24 h avant** la séance, vers un autre créneau libre. L’ancien créneau est libéré, l’ancien lien de visio **effacé** (le professeur en partage un nouveau), l’élève et l’équipe reçoivent un email.
- **Annulation** : jusqu’à **24 h avant**, avec **remboursement intégral automatique** (Stripe). Le créneau est libéré ; l’élève peut réserver un nouvel essai.
- **Moins de 24 h avant** : plus de report ni d’annulation en ligne ; l’élève est invité à nous contacter.
- **Absence** : la séance n’est pas remboursée. Le professeur peut **offrir un nouveau créneau** (geste commercial, une fois) : l’élève le choisit lui-même **sous 14 jours** (`rebook_offer_days`). Ce créneau offert (`rebooked_at`) ne peut **plus être déplacé ni remboursé** par l’élève.
- **Suppression du compte** : refusée tant qu’un essai est en cours de paiement, à venir ou à clôturer. Un compte ayant déjà réservé est **anonymisé** (nom, email, connexion, objectif effacés) au lieu d’être supprimé, pour garder les paiements en comptabilité.
- **Droit de rétractation** (14 jours) : il reste exerçable **par email** même passé le délai de 24 h, tant que le cours n’a pas eu lieu (voir CGV). À la réservation, l’élève demande expressément que le cours ait lieu avant la fin de ce délai ; la date et la version des conditions acceptées sont enregistrées (`terms_accepted_at`, `terms_version`).

Délais et nombre de reports : `config/trials.php` (`change_notice_hours`, `max_reschedules`). Toute modification doit être répercutée dans les CGV (`resources/js/data/legal.ts`) et dans `terms_version`.

## Règles côté professeur (Gestion des essais)

- **Lien de la visio** : modifiable tant que l’essai peut avoir lieu (paiement en cours ou payé) **et** que la séance n’est pas terminée. Ensuite le champ reste visible mais verrouillé ; le serveur refuse toute modification. Les **notes privées** restent toujours modifiables.
- **Annuler une séance** : possible pour une séance payée qui n’a pas commencé. Un motif est obligatoire (il figure dans l’email). L’ordre est volontaire : **remboursement Stripe d’abord** ; s’il échoue, rien ne change et un message l’indique. S’il réussit : statut `cancelled`, créneau libéré, email à l’élève.
- **Clôturer** : dès que la séance a commencé, « Oui, séance réalisée » (avec un **bilan facultatif envoyé à l’élève** et affiché dans son espace) ou « L’élève était absent » (email « On s’est manqués »). Une séance passée non clôturée apparaît « À clôturer » dans la liste et sur le tableau de bord, et l’équipe reçoit **une relance par email 12 h après la fin**. Pas de clôture automatique : une absence serait comptée comme réalisée.
- **Après une absence** : bouton « Offrir un nouveau créneau » (une fois).
- **Paiement à vérifier** : « Confirmer la séance » (seulement si un paiement est enregistré, que le créneau peut encore être gardé et que la séance n’a pas commencé), « Rembourser l’élève » (créneau libéré, email), ou, si aucun paiement n’est enregistré, « Libérer le créneau » : la session Stripe est fermée puis vérifiée, et le créneau n’est libéré que si Stripe confirme que rien n’a été payé.
- **Paiement tardif** : un paiement qui arrive à moins de 12 h de la séance (`late_payment_cutoff_hours`) ou pour un créneau retiré des disponibilités est **remboursé automatiquement** au lieu d’être confirmé.
- **Disponibilités** : les jours et heures sont saisis dans le fuseau de l’école (`TRIAL_TIMEZONE`, `Europe/Paris` par défaut) et gardent leur heure locale aux changements d’heure. Si de nouveaux horaires laissent des séances déjà réservées en dehors, elles sont conservées et un avertissement l’indique.
- **Alertes paiement** (`TrialPaymentAlert`, à l’équipe) : passage en vérification, remboursement automatique échoué, remboursement refusé après coup par Stripe (`refund.failed`), litige bancaire (`charge.dispute.created`).
- Toutes les opérations d’argent d’un même essai (paiement, remboursement, annulation, vérification) passent par un **verrou** (`TrialReservationLock`) : un webhook, le planificateur et un clic ne peuvent pas se croiser.
- La liste est filtrée **côté serveur** (À venir, Paiement en cours, Réalisés, Annulés) avec des compteurs exacts, et se charge au défilement par 24.

## Emails

Tous les emails sont des notifications Laravel **mises en file d’attente** (`ShouldQueue`) : ils ne ralentissent ni ne bloquent jamais une action. Ils partent **après validation de la transaction** (`afterCommit`), sont retentés pendant une heure (3 erreurs maximum), respectent un **délai minimal entre deux envois** (`MAIL_SEND_INTERVAL_SECONDS` : `10` pour la sandbox Mailtrap gratuite, qui n’accepte qu’un email toutes les 10 secondes ; vide en production) et sont écrits en français. La date est dans le fuseau de l’élève pour l’élève, dans celui de l’école pour l’équipe. Les textes saisis par les élèves (nom, objectif) sont affichés tels quels : aucun lien ni mise en forme n’est interprété.

| Email                    | Destinataire                                       | Déclencheur                                                                                 |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `TrialBooked`            | Élève                                              | Paiement vérifié (webhook, retour de Stripe, rattrapage ou confirmation après vérification) |
| `TrialBookedForTeacher`  | Comptes ayant la permission de modifier les essais | Même moment                                                                                 |
| `TrialMeetingLinkShared` | Élève                                              | Lien ajouté ou modifié sur une séance payée                                                 |
| `TrialReminder`          | Élève                                              | 24 h avant la séance (une seule fois, colonne `reminder_sent_at`)                           |
| `TrialCancelled`         | Élève                                              | Annulation par le professeur, après remboursement                                           |
| `TrialRefunded`          | Élève                                              | Paiement tardif remboursé automatiquement, ou remboursement après vérification              |
| `TrialRescheduled`       | Élève                                              | Report d’une séance (ou choix du créneau offert après une absence)                          |
| `TrialChangedForTeacher` | Équipe                                             | L’élève a déplacé ou annulé sa séance                                                       |
| `TrialCompleted`         | Élève                                              | Séance clôturée « réalisée », avec le bilan du professeur                                   |
| `TrialMissed`            | Élève                                              | Séance clôturée « absent »                                                                  |
| `TrialRebookOffered`     | Élève                                              | Le professeur offre un nouveau créneau après une absence                                    |
| `TrialOutcomeReminder`   | Équipe                                             | Séance passée non clôturée, 12 h après la fin (une seule fois)                              |

Le `TrialCancelled` s’adapte : motif du professeur, ou simple confirmation quand c’est l’élève qui annule.

Code : `app/Notifications`, déclenchés depuis les actions de `app/Actions` (`ApplyTrialPayment`, `UpdateTrialReservation`, `CreateTrialCancellation`, `UpdateTrialPaymentReview`, `CreateTrialReminders`).

### En local : Mailtrap

Les identifiants SMTP de la sandbox Mailtrap sont dans `.env` (jamais versionné) :

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=…
MAIL_PASSWORD=…
```

Les emails n’arrivent dans Mailtrap que si un **worker de file d’attente** tourne (`php artisan dev` l’inclut, sinon `php artisan queue:listen`). Après toute modification du `.env`, redémarrer le worker. Les tests n’envoient rien : ils utilisent le mailer `array`.

## Tâches planifiées

| Commande                     | Fréquence         | Rôle                                                                                                             |
| ---------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `trials:expire-reservations` | chaque minute     | Libère les créneaux impayés, rattrape les paiements dont le webhook manque                                       |
| `trials:end-sessions`        | chaque minute     | Passe en `ended` les séances payées dont l’heure de fin est passée (aussi fait à l’ouverture des pages d’essais) |
| `trials:send-reminders`      | toutes les 15 min | Met en file le rappel des séances qui commencent dans les 24 h, et la relance de clôture à l’équipe              |
| `trials:publish-slots`       | chaque jour       | Publie les créneaux des 14 prochains jours                                                                       |

## Ce qu’il faut en production (point 5)

Sans ces deux processus, ni les emails, ni les rappels, ni le rattrapage des paiements ne fonctionnent :

1. **Un worker de file d’attente supervisé** (Supervisor, Laravel Cloud, Forge…), redémarré à chaque déploiement avec `php artisan queue:restart`.
2. **Le planificateur** : cron `* * * * * php artisan schedule:run` (ou l’équivalent de l’hébergeur).
3. **Un vrai fournisseur d’emails** (`MAIL_*`), un nom d’expéditeur et un `APP_NAME` à la marque de l’école : il apparaît dans l’en-tête et la signature des emails.

## Pages juridiques

`/mentions-legales`, `/cgu`, `/cgv`, `/confidentialite` (liens dans le pied de page ; les CGV sont liées depuis la case à cocher de la réservation). Les informations de la société sont centralisées dans `resources/js/data/legal.ts` : **tous les champs « [À compléter] » doivent être remplis** (raison sociale, SIREN, adresse, hébergeur, médiateur de la consommation, contacts) et **l’ensemble doit être relu par un juriste** avant le lancement.

## Reste à faire

- **Compléter et faire valider les pages juridiques** (voir ci-dessus).
- **Plusieurs professeurs** : rattacher disponibilités et essais à un professeur, et n’envoyer les emails qu’au professeur concerné.
- **Alerte « paiement à vérifier »** par email à l’équipe (elle est visible dans le tableau de bord et la liste).
- **Choix d’un parcours précis** dans le bilan, quand les parcours seront en base.
- **Surveillance** : alerte si la file d’attente s’arrête ou si des emails échouent définitivement (`failed_jobs`).
