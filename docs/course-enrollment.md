# Parcours — groupes, inscription, paiement et gestion

Ce document décrit la fonctionnalité « parcours » (branche `feat/course-enrollment`) : ce qui a été construit, les règles métier et juridiques retenues, et où se trouve le code. Le paiement Stripe commun avec le cours d’essai est décrit dans [payments.md](payments.md) ; la mise en ligne dans [production.md](production.md).

## En bref

Un **parcours** = un niveau complet du CECRL (A1, A2, B1, B2) de **60 heures**, suivi en **groupe** (3 à 6 élèves) ou en **individuel**, à un **rythme** fixe. Le professeur crée les groupes ; l’élève choisit un groupe ouvert, paie (en une fois ou en 3 fois sans frais) et retrouve tout dans « Mes parcours ».

| Étape | Commit      | Contenu                                                                           |
| ----- | ----------- | --------------------------------------------------------------------------------- |
| 1     | `be16336`   | Groupes créés par le professeur, planning de 60 h généré automatiquement          |
| 2     | `dbf8858`   | Inscription et paiement en une fois (Stripe), espace « Mes parcours »             |
| 3     | `c993081`   | Paiement en 3 fois : carte enregistrée, prélèvements automatiques, relances       |
| 4     | `650e6bf`   | Outils du professeur : annulation avec remboursement, notes, lien visio par email |
| 5     | (ce commit) | CGV « Parcours », confidentialité, documentation                                  |

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
- **Réglages** : **lien visio par défaut** du groupe (envoyé par email aux élèves inscrits quand il est ajouté ou modifié), nombre de places (jamais en dessous du nombre d’inscrits), ouverture aux inscriptions. Chaque séance peut avoir **son propre lien**, saisi depuis son popover dans le planning ; sans lien spécifique, c’est le lien par défaut qui s’applique.
- **Supprimer** : seulement un groupe sans inscrit ; sinon, le fermer aux inscriptions.
- **« Gérer » un élève** :
    - notes privées ;
    - **annuler l’inscription** avec un remboursement **au prorata** (rétractation après le début : l’élève doit la part des heures déjà effectuées), **intégral** (groupe annulé par l’école) ou **nul** (après le délai), ou un montant libre plafonné à ce qui a été payé. Le remboursement est pris sur les paiements réels, le plus récent d’abord ; les échéances restantes sont annulées ; la place est libérée ; l’élève reçoit un email avec le motif et le montant.

## Côté élève (permissions `course-enrollments.create` et `course-enrollments.view-own`)

### Inscription (`/course-enrollments/create`)

Accessible depuis « Réserver une place » sur la page d’un parcours. Trois étapes, comme le cours d’essai :

1. **Ton groupe** : si tu arrives depuis la fiche d’un niveau, le niveau et le format sont déjà choisis (un rappel s’affiche, avec « Changer » pour les modifier) ; sinon tu les choisis. Puis un groupe ouvert (dates, jours, heure dans le fuseau de l’élève, places restantes ; « Complet » et « Déjà inscrit » non sélectionnables). Sans groupe ouvert : « Nous contacter » ou « Réserver un essai ». La connexion est demandée à la fin de cette étape.
2. **À propos de toi** : objectif.
3. **Récapitulatif** : choix du paiement (en une fois, ou 3 × le montant), acceptation des CGV (rétractation de 14 jours, échéances dues après le délai, autorisation de prélèvement en 3 fois) et, si le groupe commence pendant le délai de rétractation, **demande expresse de commencer tôt** (obligatoire, art. L221-25). Puis paiement sur Stripe.

### « Mes parcours » (`/course-enrollments`)

La page liste les inscriptions sous forme de **cartes** (niveau, format, rythme, statut, dates, prochaine séance, prix), comme les groupes côté professeur. Chaque carte ouvre une **page de détail** (`/course-enrollments/{id}`) : statut, dates, horaires, prochaine séance, séances suivies, **planning en calendrier CalendarKit** (vues mois, semaine, jour, agenda, fuseau de l’élève, lecture seule, ouverte sur la prochaine séance), **popover de séance** au clic (date, horaire, durée, bouton « Rejoindre la visio » avec le lien propre à la séance ou, à défaut, le lien par défaut du groupe), bouton « Rejoindre la visio », échéancier en 3 fois avec « Régler maintenant », date limite de rétractation, motif et montant en cas d’annulation, « Reprendre le paiement » si l’élève a quitté Stripe. Les liens visio ne sont exposés qu’aux élèves dont l’inscription est **confirmée** et dont le parcours n’est pas terminé.

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

| Email                       | Destinataire    | Quand                                                                                                           |
| --------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- |
| `CourseEnrolled`            | Élève           | Inscription confirmée : récapitulatif, échéancier, date limite de rétractation                                  |
| `CourseEnrolledForTeacher`  | Équipe          | Nouvelle inscription                                                                                            |
| `CourseEnrollmentRefunded`  | Élève           | Paiement arrivé trop tard, remboursé                                                                            |
| `CourseInstallmentPaid`     | Élève           | Échéance 2 ou 3 réglée (reçu)                                                                                   |
| `CourseInstallmentFailed`   | Élève           | Prélèvement refusé, avec lien de paiement                                                                       |
| `CourseMeetingLinkShared`   | Élèves inscrits | Lien visio par défaut ajouté ou modifié                                                                         |
| `CourseEnrollmentCancelled` | Élève           | Inscription annulée par le professeur, motif et remboursement                                                   |
| `TrialPaymentAlert`         | Équipe          | Montant inattendu, remboursement automatique échoué ou interrompu, échéance impayée après la dernière tentative |

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

| Domaine       | Fichiers                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration | `config/courses.php`                                                                                                                                                                                                                                                                                                                                                                                                             |
| Modèles       | `CourseCohort`, `CourseSession`, `CourseEnrollment`, `CourseInstallment`                                                                                                                                                                                                                                                                                                                                                         |
| Enums         | `CourseLevel`, `CourseFormat`, `CourseRhythm`, `CourseEnrollmentStatus`, `CoursePaymentPlan`, `CourseInstallmentStatus`                                                                                                                                                                                                                                                                                                          |
| Actions       | `CreateCourseCohort`, `UpdateCourseCohort`, `DeleteCourseCohort`, `CreateCourseEnrollment`, `CreateCourseCheckout`, `ApplyCourseEnrollmentPayment`, `ReconcileCourseEnrollmentPayment`, `CreateCourseEnrolledNotifications`, `CreateCourseInstallmentCharges`, `CreateCourseInstallmentCheckout`, `ApplyCourseInstallmentPayment`, `UpdateCourseInstallmentPaid`, `CreateCourseEnrollmentCancellation`, `UpdateCourseEnrollment` |
| Stripe        | `app/Services/CoursePaymentGateway.php`, webhook `app/Listeners/HandleTrialPaymentWebhook.php`                                                                                                                                                                                                                                                                                                                                   |
| Contrôleurs   | `CourseCohortController`, `CourseSessionController`, `CourseCatalogController`, `CourseEnrollmentController`, `CourseInstallmentCheckoutController`, `CourseEnrollmentManagementController`, `CourseEnrollmentCancellationController`                                                                                                                                                                                              |
| Commandes     | `courses:expire-enrollments`, `courses:charge-installments`                                                                                                                                                                                                                                                                                                                                                                      |
| Pages         | `course-cohorts/{index,create,show}.tsx` (professeur), `course-enrollments/{create,index,show}.tsx` (élève), `courses/course-detail.tsx` (bandeau du prochain groupe)                                                                                                                                                                                                                                                            |
| Planning      | `resources/js/components/course-planning-calendar.tsx` (CalendarKit Pro, lecture seule)                                                                                                                                                                                                                                                                                                                                          |
| Tests         | `tests/Feature/CourseCohortTest.php`, `CourseEnrollmentTest.php`, `CourseInstallmentTest.php`, `CourseManagementTest.php`                                                                                                                                                                                                                                                                                                        |

## Hors V1 (voir [backlog.md](backlog.md))

Appel en séance, replays, bilans intermédiaires (checkpoints), changement de groupe en cours de route, crédit du cours d’essai, plusieurs professeurs.
