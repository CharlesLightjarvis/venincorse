# Parcours — groupes, inscription, paiement et gestion

Ce document décrit la fonctionnalité « parcours » (branche `feat/course-enrollment`) : ce qui a été construit, les règles métier et juridiques retenues, et où se trouve le code. Le paiement Stripe commun avec le cours d’essai est décrit dans [payments.md](payments.md) ; la mise en ligne dans [production.md](production.md).

## En bref

Un **parcours** = un niveau complet du CECRL (A1, A2, B1, B2) de **60 heures**, suivi en **groupe** (3 à 6 élèves) ou en **individuel**, à un **rythme** fixe. Le professeur crée les groupes ; l’élève choisit un groupe ouvert, paie (en une fois ou en 3 fois sans frais) et retrouve tout dans « Mes parcours ».

| Étape | Commit    | Contenu                                                                                               |
| ----- | --------- | ----------------------------------------------------------------------------------------------------- |
| 1     | `be16336` | Groupes créés par le professeur, planning de 60 h généré automatiquement                              |
| 2     | `dbf8858` | Inscription et paiement en une fois (Stripe), espace « Mes parcours »                                 |
| 3     | `c993081` | Paiement en 3 fois : carte enregistrée, prélèvements automatiques, relances                           |
| 4     | `650e6bf` | Outils du professeur : annulation avec remboursement, notes, lien visio par email                     |
| 5     | `148dc26` | CGV « Parcours », confidentialité, documentation                                                      |
| 6     | (à venir) | Séances (déplacer, annuler, rétablir), annulation de groupe, replanification, relance manuelle, appel |

## Décisions prises avec le porteur du projet

| Sujet                          | Décision                                                                                                                                                                                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organisation des groupes       | **Créés par le professeur** (niveau, format, rythme, date, heure, places). Pas de dates générées automatiquement.                                                                                                                                                                   |
| Individuel (1:1)               | **Même système** : un « groupe » d’une seule place.                                                                                                                                                                                                                                 |
| Groupe peu rempli              | Il **démarre quel que soit le nombre d’inscrits**.                                                                                                                                                                                                                                  |
| Paiement                       | **En une fois ou en 3 fois**, dès la V1.                                                                                                                                                                                                                                            |
| Frais du paiement en 3 fois    | **0 % par défaut** (`COURSE_INSTALLMENT_SURCHARGE_PERCENT`). La maquette prévoyait +5 % : des frais non négligeables peuvent faire du paiement fractionné un crédit à la consommation (art. L312-4 du Code de la consommation). À valider par un juriste avant de mettre des frais. |
| Remboursement                  | Pas de bouton « Annuler » pour l’élève. **Seul le droit légal de rétractation** (14 jours, par email) s’applique, au **prorata** si le parcours a commencé. Après le délai : aucun remboursement, échéances dues.                                                                   |
| Crédit du cours d’essai (39 €) | **Pas de crédit** en V1.                                                                                                                                                                                                                                                            |

## Catalogue et rythmes

Configuration : `config/courses.php`.

| Niveau              | Groupe | Individuel |
| ------------------- | ------ | ---------- |
| A1 — Les fondations | 720 €  | 2 090 €    |
| A2 — Raconter       | 720 €  | 2 090 €    |
| B1 — S’exprimer     | 840 €  | 2 090 €    |
| B2 — Structurer     | 900 €  | 2 090 €    |

| Rythme         | Jours                | Durée d’une séance | Durée du parcours |
| -------------- | -------------------- | ------------------ | ----------------- |
| Extensif       | lun., mer., ven.     | 1 h                | ~20 semaines      |
| Accéléré       | mar., jeu.           | 3 h                | ~10 semaines      |
| Intensif       | du lundi au vendredi | 3 h                | 4 semaines        |
| Super intensif | du lundi au vendredi | 5 h                | ~2,5 semaines     |

Le **prix est copié sur le groupe à sa création** : changer la configuration n’affecte jamais les groupes existants ni les élèves déjà inscrits.

## Côté professeur (permission `course-cohorts.manage`)

Menu **« Groupes des parcours »** (`/teaching/course-cohorts`).

- **Créer un groupe** : niveau, format, rythme, date de début, heure des séances (heure de Paris), places (6 maximum, 1 en individuel), jours sans cours (fériés, vacances). Un aperçu indique le nombre de séances et les dates de début et de fin.
- **Planning automatique** (`CreateCourseCohort`) : les 60 heures sont réparties à partir de la date de début sur les jours du rythme, en sautant les jours sans cours. Les heures sont lues dans le fuseau de l’école (`TRIAL_TIMEZONE`, `Europe/Paris`) et stockées en UTC : une séance à 9 h reste à 9 h après le passage à l’heure d’été.
- **Fiche du groupe** : dates, séances à venir, places, prix, planning en calendrier, élèves (statut, paiement, échéances, « Échéance impayée »). Le planning utilise **CalendarKit Pro** (vues mois, semaine, jour, agenda, fuseau de l’équipe, lecture seule) ; les réglages compacts sont au-dessus du calendrier pleine largeur. Un clic sur une séance ouvre un **popover ancré** à la séance avec sa date, son horaire, sa durée et son lien visio ; l’équipe peut y modifier le lien de cette séance.
- **Modifier une séance** (popover du planning) :
    - **déplacer** une séance future : l’ancienne et la nouvelle date sont envoyées aux élèves inscrits ;
    - **annuler** une séance future avec un motif (5 à 500 caractères), ou **rétablir** une séance annulée qui n’a pas encore commencé ;
    - **enregistrer l’appel** d’une séance commencée : chaque élève confirmé est marqué **présent**, **absent** ou **absence justifiée** ; un nouvel appel remplace le précédent. L’appel se fait depuis la section **« Présences »** de la fiche du groupe (liste des séances commencées) ou depuis le popover de la séance dans le planning. Les élèves voient leur présence dans la section « Présences » de leur page et dans le popover de la séance.
    - Une séance passée reste de l’historique : elle ne peut plus être déplacée ni annulée, mais son lien visio reste modifiable. Une séance annulée est affichée en rouge et intitulée « Séance N · annulée ».
- **Réglages** : **lien visio par défaut** du groupe (envoyé par email aux élèves inscrits quand il est ajouté ou modifié), nombre de places (jamais en dessous du nombre d’inscrits), ouverture aux inscriptions. Chaque séance peut avoir **son propre lien**, saisi depuis son popover dans le planning ; sans lien spécifique, c’est le lien par défaut qui s’applique. Un lien propre à une séance future et non annulée est envoyé par email aux élèves confirmés.
- **Replanifier la suite** (« Modifier le planning ») : rythme, première date, heure et jours sans cours. Les séances déjà commencées sont conservées ; les heures restantes sont régénérées à partir de la date choisie, et les élèves confirmés reçoivent le nouveau planning par email. Les liens visio propres aux séances futures supprimées sont perdus.
- **Annuler le groupe** (« Annuler le groupe ») : motif obligatoire, puis annulation définitive. Les séances à venir sont annulées, les inscriptions **confirmées** et **en revue de paiement** sont **intégralement remboursées**, les places en attente de paiement sont libérées, et chaque élève reçoit un email. Un remboursement que Stripe refuse est signalé à l’équipe et reste à traiter depuis la fiche de l’élève. Un groupe annulé ne peut plus être modifié, ni recevoir de paiement.
- **Supprimer** : seulement un groupe sans inscrit ; sinon, le fermer aux inscriptions ou l’annuler.
- **« Gérer » un élève** :
    - notes privées ;
    - **échéances à encaisser** : une échéance échue ou en échec peut être **relancée immédiatement** (« Réessayer maintenant ») sans attendre le prochain prélèvement automatique. En cas de nouvel échec, le motif s’affiche pour l’équipe et l’élève n’est pas ré-envoyé par email ; en cas de succès, le reçu lui est envoyé ;
    - **annuler l’inscription** avec un remboursement **au prorata** (rétractation après le début : l’élève doit la part des heures déjà effectuées), **intégral** (groupe annulé par l’école) ou **nul** (après le délai), ou un montant libre plafonné à ce qui a été payé. Le remboursement est pris sur les paiements réels, le plus récent d’abord ; les échéances restantes sont annulées ; la place est libérée ; l’élève reçoit un email avec le motif et le montant.

## Côté élève (permissions `course-enrollments.create` et `course-enrollments.view-own`)

### Inscription (`/course-enrollments/create`)

Accessible depuis « Réserver une place » sur la page d’un parcours. Trois étapes, comme le cours d’essai :

1. **Ton groupe** : si tu arrives depuis la fiche d’un niveau, le niveau et le format sont déjà choisis (un rappel s’affiche, avec « Changer » pour les modifier) ; sinon tu les choisis. Puis un groupe ouvert (dates, jours, heure dans le fuseau de l’élève, places restantes ; « Complet » et « Déjà inscrit » non sélectionnables). Sans groupe ouvert : « Nous contacter » ou « Réserver un essai ». La connexion est demandée à la fin de cette étape.
2. **À propos de toi** : objectif.
3. **Récapitulatif** : choix du paiement (en une fois, ou 3 × le montant), acceptation des CGV (rétractation de 14 jours, échéances dues après le délai, autorisation de prélèvement en 3 fois) et, si le groupe commence pendant le délai de rétractation, **demande expresse de commencer tôt** (obligatoire, art. L221-25). Puis paiement sur Stripe.

### « Mes parcours » (`/course-enrollments`)

La page liste les inscriptions sous forme de **cartes** (niveau, format, rythme, statut, dates, prochaine séance, prix), comme les groupes côté professeur. Chaque carte ouvre une **page de détail** (`/course-enrollments/{id}`) : statut, dates, horaires, prochaine séance, séances suivies, **planning en calendrier CalendarKit** (vues mois, semaine, jour, agenda, fuseau de l’élève, lecture seule, ouverte sur la prochaine séance), **popover de séance** au clic (date, horaire, durée, bouton « Rejoindre la visio » avec le lien propre à la séance ou, à défaut, le lien par défaut du groupe), bouton « Rejoindre la visio », échéancier en 3 fois avec « Régler maintenant », date limite de rétractation, motif et montant en cas d’annulation, « Reprendre le paiement » si l’élève a quitté Stripe. Les liens visio ne sont exposés qu’aux élèves dont l’inscription est **confirmée** et dont le parcours n’est pas terminé.

Les séances **annulées** apparaissent en rouge dans le calendrier et affichent leur motif à la place du bouton visio. Si le **groupe entier est annulé**, la page affiche un bandeau « Groupe annulé » avec la date et le motif, et les élèves confirmés ont été remboursés. Une fois la séance commencée, chaque élève voit aussi sa **présence** (« Présent », « Absent », « Absence justifiée ») dans la section **« Présences »** de sa page et dans le popover de la séance ; tant que le professeur n’a pas fait l’appel, le statut affiché est « Appel en attente ».

## Statuts

**Inscription** (`CourseEnrollmentStatus`) :

| Statut           | Signification                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pending`        | Place réservée 45 min pendant le paiement                                                                              |
| `processing`     | Paiement envoyé, en attente de la banque                                                                               |
| `confirmed`      | Inscrit                                                                                                                |
| `payment_review` | Paiement reçu mais non confirmable (montant inattendu, groupe complet ou commencé et remboursement automatique échoué) |
| `expired`        | Non payé à temps, place libérée                                                                                        |
| `refunded`       | Paiement arrivé trop tard (groupe complet ou commencé), remboursé automatiquement                                      |
| `cancelled`      | Annulé par le professeur (avec ou sans remboursement)                                                                  |

Une place est occupée par les inscriptions `processing`, `confirmed`, `payment_review`, et `pending` tant que le délai de paiement court.

**Échéance** (`CourseInstallmentStatus`) : `scheduled` (à venir), `failed` (prélèvement refusé, nouvelle tentative prévue ou épuisée), `paid`, `cancelled` (inscription annulée).

**Groupe et séance** : un groupe annulé porte `cancelled_at` et `cancellation_reason`, et n’est plus ouvert aux inscriptions. Une séance annulée porte les mêmes champs et reste visible dans le calendrier ; seules les séances futures peuvent être annulées, et seules les séances annulées non commencées peuvent être rétablies.

**Présence** (`CourseAttendanceStatus`) : `present`, `absent`, `excused` (absence justifiée). L’appel n’est possible qu’après le début d’une séance non annulée, et seulement pour les élèves dont l’inscription est confirmée.

## Paiement

### En une fois

`CreateCourseEnrollment` réserve la place en **verrouillant la ligne du groupe** : deux élèves ne peuvent pas prendre la dernière place. Revenir sur le même groupe réutilise la tentative non payée. `CreateCourseCheckout` ouvre une session Stripe Checkout qui **expire avec la réservation** (45 min). Le paiement est appliqué par `ApplyCourseEnrollmentPayment`, appelé par le webhook, au retour de l’élève (`?refresh=1`) ou par le planificateur (`courses:expire-enrollments`) : un webhook manqué ne bloque jamais une inscription payée.

Un paiement qui arrive **après l’expiration** n’obtient une place que si le groupe en a encore une et n’a pas commencé ; sinon il est **remboursé automatiquement** et l’élève prévenu.

### En 3 fois

- La page Stripe encaisse la **1re échéance** et **enregistre la carte** chez Stripe (`customer_creation`, `setup_future_usage: off_session`). L’application ne stocke que les identifiants Stripe du client et du moyen de paiement.
- À la confirmation, les échéances suivantes sont planifiées **tous les 30 jours** à partir du premier paiement. Le total est réparti en parts égales, l’arrondi sur la dernière.
- `courses:charge-installments` (toutes les heures) prélève les échéances dues sur la carte enregistrée (`CreateCourseInstallmentCharges`) et envoie un reçu.
- **Échec** (carte refusée, ou banque qui demande une validation 3D Secure, fréquent en Europe) : la raison est traduite en français, l’élève reçoit un email et peut régler l’échéance lui-même sur une page Stripe (la carte utilisée devient celle des échéances suivantes). Nouvelles tentatives automatiques après **3 jours puis 4 jours** (`retry_days`) ; après la dernière, l’équipe reçoit une alerte.
- Rien n’est prélevé pour une inscription qui n’est plus `confirmed`.

Testé sur Stripe en mode test : carte valide (prélevée), carte refusée et 3D Secure demandé (échec, email, relance), pages de paiement acceptées, remboursement partiel.

### Sécurité commune avec le cours d’essai

Verrou par inscription (`TrialReservationLock`) sur toute opération d’argent, mode test/réel cohérent avec la clé Stripe, événements des essais et des parcours séparés par leurs métadonnées, alertes à l’équipe (`TrialPaymentAlert`), emails en file d’attente avec texte des élèves neutralisé.

## Emails (tous en file d’attente, en français)

| Email                            | Destinataire     | Quand                                                                                                           |
| -------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `CourseEnrolled`                 | Élève            | Inscription confirmée : récapitulatif, échéancier, date limite de rétractation                                  |
| `CourseEnrolledForTeacher`       | Équipe           | Nouvelle inscription                                                                                            |
| `CourseEnrollmentRefunded`       | Élève            | Paiement arrivé trop tard, remboursé                                                                            |
| `CourseInstallmentPaid`          | Élève            | Échéance 2 ou 3 réglée (reçu), y compris après une relance manuelle réussie                                     |
| `CourseInstallmentFailed`        | Élève            | Prélèvement refusé, avec lien de paiement (jamais renvoyé après une relance manuelle)                           |
| `CourseMeetingLinkShared`        | Élèves inscrits  | Lien visio **par défaut** du groupe ajouté ou modifié                                                           |
| `CourseSessionMeetingLinkShared` | Élèves confirmés | Lien visio **propre à une séance** future ajouté ou modifié                                                     |
| `CourseSessionRescheduled`       | Élèves confirmés | Séance future déplacée : ancienne et nouvelle date                                                              |
| `CourseSessionCancelled`         | Élèves confirmés | Séance future annulée, avec le motif                                                                            |
| `CourseScheduleChanged`          | Élèves confirmés | Planning des séances restantes replanifié, avec la prochaine séance                                             |
| `CourseEnrollmentCancelled`      | Élève            | Inscription annulée par le professeur, motif et remboursement (y compris libération d’une place non payée)      |
| `TrialPaymentAlert`              | Équipe           | Montant inattendu, remboursement automatique échoué ou interrompu, échéance impayée après la dernière tentative |

## Tâches planifiées

| Commande                      | Fréquence         | Rôle                                                                        |
| ----------------------------- | ----------------- | --------------------------------------------------------------------------- |
| `courses:expire-enrollments`  | chaque minute     | Libère les places non payées, rattrape les paiements dont le webhook manque |
| `courses:charge-installments` | toutes les heures | Prélève les échéances dues, gère les relances                               |

## Webhook Stripe

En plus des événements du cours d’essai, `payment_intent.succeeded` (confirmation tardive d’un prélèvement). Liste complète dans [payments.md](payments.md).

## Comptes

La suppression d’un compte est **refusée** tant qu’un parcours est en cours ou à venir, ou qu’une échéance reste due. Ensuite, le compte est **anonymisé** (comme pour le cours d’essai) : les inscriptions payées restent en comptabilité, l’objectif et les notes sont effacés.

## Juridique

- CGV : sections « Les parcours », « Inscription et paiement d’un parcours », « Rétractation et annulation d’un parcours » (`resources/js/pages/home/legal/sales.tsx`, règles dans `coursePolicy` de `resources/js/data/legal.ts`). Version des conditions : `2026-11-07`, enregistrée avec chaque inscription.
- Confidentialité : enregistrement de la carte chez Stripe pour le paiement en 3 fois.
- Textes marketing alignés : « 3× sans frais », paiement par carte via Stripe (plus de mention de PayPal ou de virement).
- À faire relire par un juriste (voir [production.md](production.md)).

## Code

| Domaine       | Fichiers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration | `config/courses.php`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Modèles       | `CourseCohort`, `CourseSession`, `CourseSessionAttendance`, `CourseEnrollment`, `CourseInstallment`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Enums         | `CourseLevel`, `CourseFormat`, `CourseRhythm`, `CourseEnrollmentStatus`, `CoursePaymentPlan`, `CourseInstallmentStatus`, `CourseAttendanceStatus`                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Actions       | `CreateCourseCohort`, `UpdateCourseCohort`, `DeleteCourseCohort`, `GenerateCourseSchedule`, `UpdateCourseSession`, `UpdateCourseCohortSchedule`, `CancelCourseCohort`, `RecordCourseSessionAttendance`, `CreateCourseEnrollment`, `CreateCourseCheckout`, `ApplyCourseEnrollmentPayment`, `ReconcileCourseEnrollmentPayment`, `CreateCourseEnrolledNotifications`, `CreateCourseInstallmentCharges`, `ChargeCourseInstallment`, `RetryCourseInstallment`, `CreateCourseInstallmentCheckout`, `ApplyCourseInstallmentPayment`, `UpdateCourseInstallmentPaid`, `CreateCourseEnrollmentCancellation`, `UpdateCourseEnrollment` |
| Stripe        | `app/Services/CoursePaymentGateway.php`, webhook `app/Listeners/HandleTrialPaymentWebhook.php`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Contrôleurs   | `CourseCohortController`, `CourseCohortCancellationController`, `CourseCohortScheduleController`, `CourseSessionController`, `CourseSessionAttendanceController`, `CourseCatalogController`, `CourseEnrollmentController`, `CourseInstallmentCheckoutController`, `CourseInstallmentRetryController`, `CourseEnrollmentManagementController`, `CourseEnrollmentCancellationController`                                                                                                                                                                                                                                      |
| Commandes     | `courses:expire-enrollments`, `courses:charge-installments`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Pages         | `course-cohorts/{index,create,show}.tsx` (professeur), `course-enrollments/{create,index,show}.tsx` (élève), `courses/course-detail.tsx` (bandeau du prochain groupe)                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Planning      | `resources/js/components/course-planning-calendar.tsx` (CalendarKit Pro ; popover séance, déplacement, annulation, appel)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Tests         | `tests/Feature/CourseCohortTest.php`, `CourseEnrollmentTest.php`, `CourseInstallmentTest.php`, `CourseManagementTest.php`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

## Hors V1 (voir [backlog.md](backlog.md))

Appel en séance, replays, bilans intermédiaires (checkpoints), changement de groupe en cours de route, crédit du cours d’essai, plusieurs professeurs.
