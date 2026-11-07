# Mise en production — liste de contrôle

Tout ce qu’il faut faire avant (et pendant) la mise en ligne du cours d’essai payant. Les détails techniques sont dans [payments.md](payments.md) (Stripe), [trial-lifecycle.md](trial-lifecycle.md) (statuts, emails, tâches) et [trial-booking.md](trial-booking.md) (parcours de réservation).

## 1. Contenu et juridique (avant tout)

- [ ] **Compléter les mentions légales** dans `resources/js/data/legal.ts` : chaque valeur `[À compléter]` (raison sociale, forme juridique et capital, SIREN/RCS, TVA, adresse, email de contact, directeur de la publication, hébergeur, médiateur de la consommation, email dédié aux données personnelles).
- [ ] **TVA** : si l’activité est en micro-entreprise sans TVA, indiquer « TVA non applicable, art. 293 B du CGI » (mentions légales et CGV) ; sinon, le prix affiché doit être TTC avec le numéro de TVA.
- [ ] **Médiateur de la consommation** : adhérer à un médiateur (obligatoire pour vendre à des particuliers) et l’indiquer.
- [ ] **Faire relire les CGU, CGV et la politique de confidentialité par un juriste** (`/cgu`, `/cgv`, `/confidentialite`), notamment : droit de rétractation de 14 jours, absence non remboursée, créneau offert ni déplaçable ni remboursable, anonymisation des comptes.
- [ ] À chaque changement des conditions : mettre à jour `legalUpdatedAt` (`legal.ts`) **et** `terms_version` (`config/trials.php`), qui est enregistrée avec chaque réservation.
- [ ] Vérifier le prix (`trials.amount_cents`, `trialPolicy.price`) et la durée affichés.
- [ ] **Paiement en 3 fois des parcours** : faire valider par le juriste l’absence de frais (ou les frais choisis), l’autorisation de prélèvement des échéances sur la carte enregistrée, et le fait que les échéances restent dues après le délai de rétractation.

## 2. Hébergement et services

- [ ] **PHP 8.5**, extensions Laravel habituelles, HTTPS obligatoire (certificat valide).
- [ ] **Base MySQL 8 / MariaDB 10.6+ (ou PostgreSQL)**. Pas de SQLite : les verrous de lignes (`lockForUpdate`) qui empêchent deux réservations du même créneau n’y fonctionnent pas.
- [ ] **Cache partagé** entre tous les serveurs : `CACHE_STORE=database` (ou `redis`). Les verrous de paiement (`TrialReservationLock`), l’idempotence des requêtes et `onOneServer()` du planificateur en dépendent.
- [ ] **File d’attente** : `QUEUE_CONNECTION=database` (ou `redis`) avec un **worker supervisé** en permanence (Supervisor, Laravel Cloud…) :
  ```bash
  php artisan queue:work --tries=3 --max-time=3600
  ```
  Sans worker : aucun email ne part et les webhooks Stripe ne sont pas traités (les paiements ne seraient confirmés que par le rattrapage du planificateur).
- [ ] **Planificateur** chaque minute (cron) :
  ```cron
  * * * * * cd /chemin/du/site && php artisan schedule:run >> /dev/null 2>&1
  ```
  Il expire les paiements abandonnés, rattrape les paiements Stripe, publie les créneaux, passe les séances en « terminée », envoie les rappels. Vérifier qu’il tourne vraiment (voir § 7).
- [ ] **Sauvegardes automatiques** quotidiennes de la base, conservées hors du serveur, et une restauration testée au moins une fois.

## 3. Variables d’environnement (`.env` de production)

| Variable | Valeur en production |
| --- | --- |
| `APP_NAME` | Nom de l’école (affiché dans les emails : aujourd’hui « Laravel ») |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` (sinon les erreurs affichent des secrets) |
| `APP_URL` | `https://<domaine>` |
| `APP_KEY` | Générée une seule fois (`php artisan key:generate`), jamais changée ensuite |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Base MySQL/MariaDB dédiée, avec un utilisateur qui n’est **pas** `root` et un mot de passe fort |
| `CACHE_STORE`, `QUEUE_CONNECTION`, `SESSION_DRIVER` | `database` (ou `redis`) |
| `SESSION_SECURE_COOKIE` | `true` |
| `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | Fournisseur d’emails réel (Postmark, Resend, Mailgun, SES…). **Pas** la sandbox Mailtrap |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | Adresse de l’école, sur un domaine dont les enregistrements **SPF, DKIM et DMARC** sont configurés (sinon les emails tombent en spam) |
| `MAIL_SEND_INTERVAL_SECONDS` | Vide (pas de limite), sauf si le fournisseur impose un délai entre deux emails |
| `STRIPE_SECRET_KEY` | Clé **live** : de préférence une clé restreinte `rk_live_…` (Checkout Sessions, Payment Intents et Refunds en écriture, Customers en lecture) |
| `STRIPE_PUBLIC_KEY` | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | Secret `whsec_…` de l’endpoint de production (§ 4), **différent** de celui de la Stripe CLI locale |
| `TRIAL_TEST_MODE_ONLY` | `false` (sinon les clés live sont refusées et le bouton « Payer » reste désactivé) |
| `TRIAL_PUBLIC_URL` | `https://<domaine>` (retour depuis Stripe) |
| `TRIAL_TIMEZONE` | `Europe/Paris` (fuseau des disponibilités, des groupes de parcours et des emails de l’équipe) |
| `COURSE_INSTALLMENT_SURCHARGE_PERCENT` | `0` (paiement en 3 fois **sans frais**). Ne mettre des frais qu’après validation d’un juriste : un paiement fractionné avec frais non négligeables peut relever du crédit à la consommation (Code de la consommation, art. L312-4 et suivants : fiche d’information, TAEG, vérification de solvabilité). |
| `LOG_LEVEL` | `warning` (ou `error`) |

Ne jamais commiter le `.env`, ni coller une clé live dans un outil, un ticket ou une conversation.

## 4. Stripe

- [ ] **Activer le compte Stripe** (identité, coordonnées bancaires, nom affiché sur les relevés bancaires).
- [ ] Créer la clé restreinte live et la mettre dans `STRIPE_SECRET_KEY`.
- [ ] **Créer l’endpoint de webhook** (Développeurs → Webhooks) :
  - URL : `https://<domaine>/payments/webhook/stripe`
  - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `refund.failed`, `charge.dispute.created`, `payment_intent.succeeded`
  - Copier son secret de signature dans `STRIPE_WEBHOOK_SECRET`.
- [ ] Mettre `TRIAL_TEST_MODE_ONLY=false`. Les événements du mode test sont alors ignorés automatiquement.
- [ ] Activer les **emails de reçu** Stripe si souhaité, et les **notifications de litiges** dans le tableau de bord (en plus de l’alerte envoyée par l’application).
- [ ] **Faire un vrai paiement de bout en bout** avec une carte réelle (petit montant si besoin), vérifier la confirmation, l’email, puis **le rembourser depuis l’application** (annulation) et vérifier le remboursement dans Stripe.

## 5. Premier déploiement

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan db:seed --class=RolesAndPermissionsSeeder --force
php artisan trials:publish-slots
php artisan optimize
php artisan queue:restart
```

- [ ] **Ne pas lancer** `DemoUserSeeder` ni `migrate:fresh` en production (comptes de démo avec le mot de passe `password`, effacement de la base). `migrate:fresh` est d’ailleurs bloqué en production.
- [ ] Créer le compte du professeur via l’inscription, puis lui donner l’accès : `php artisan trials:grant-management email@exemple.fr`.
- [ ] Le professeur règle ses **disponibilités** (page « Disponibilités », heures de Paris) ; les créneaux se publient sur 14 jours.
- [ ] Retirer ou protéger les pages de démonstration (`/demo/trial`, `/booking/*`) si elles ne doivent pas être publiques.

## 6. À chaque déploiement

```bash
php artisan down --retry=60
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan optimize
php artisan queue:restart
php artisan up
```

`queue:restart` est indispensable : un worker resté actif garde l’ancien code et l’ancienne configuration.

## 7. Surveillance et exploitation

- [ ] **Emails d’alerte de l’équipe** (`TrialPaymentAlert`) : paiement à vérifier, remboursement automatique échoué, remboursement refusé par Stripe, litige bancaire. S’assurer qu’au moins un compte avec la permission de gérer les essais reçoit ces emails et les traite rapidement (les litiges ont une date limite de réponse dans Stripe).
- [ ] **Planificateur et worker** : vérifier qu’ils tournent (par exemple une surveillance « heartbeat » type Oh Dear, Better Stack ou Laravel Cloud). Symptômes d’un arrêt : aucun email, essais qui restent « Confirmée » après la séance, paiements qui restent « en cours ».
- [ ] **Jobs en échec** : consulter `php artisan queue:failed` régulièrement (ou une alerte) ; relancer avec `php artisan queue:retry all` après correction.
- [ ] **Erreurs** : brancher un suivi d’erreurs (Sentry, Flare, Nightwatch…) ou au minimum surveiller `storage/logs`.
- [ ] **Paiements à vérifier** : les traiter depuis « Gestion des essais » (Confirmer, Rembourser, ou Libérer le créneau si rien n’a été débité).
- [ ] **Séances à clôturer** : le tableau de bord les compte ; une relance part 12 h après la fin.

## 8. RGPD

- [ ] Tenir le **registre des traitements** (comptes, réservations, paiements, emails).
- [ ] Vérifier que les **sous-traitants** sont cités dans la politique de confidentialité : hébergeur, Stripe, fournisseur d’emails, outil de suivi d’erreurs.
- [ ] Les comptes ayant réservé sont **anonymisés** à la suppression ; les données de paiement sont gardées 10 ans (obligation comptable).
- [ ] Prévoir la purge des comptes inactifs depuis 3 ans (annoncée dans la politique de confidentialité) : elle n’est pas encore automatisée.

## 9. Points connus, à décider plus tard

Les évolutions prévues (purge des comptes inactifs, alerte si le planificateur ou la file s’arrête) sont détaillées dans [backlog.md](backlog.md).

- Un seul professeur / une seule école : tout compte ayant la permission de gérer les essais agit sur tous les essais. À revoir si plusieurs professeurs arrivent (attribution des essais par professeur).
- Les tests automatiques tournent sur SQLite en mémoire ; les verrous de lignes ne sont donc vérifiés qu’en conditions réelles sur MySQL.
