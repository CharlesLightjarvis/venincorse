# Paiements du cours d’essai — exploitation

Mémo pour faire tourner le paiement Stripe du cours d’essai, en local et en production. La liste complète de mise en ligne est dans [production.md](production.md).

## Variables d’environnement

| Variable | Rôle |
| --- | --- |
| `STRIPE_SECRET_KEY` | Clé API Stripe. En test : `rk_test_…` (clé restreinte, recommandée) ou `sk_test_…`. |
| `STRIPE_PUBLIC_KEY` | Clé publique `pk_…` (non utilisée par le Checkout hébergé, conservée pour la suite). |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature des webhooks `whsec_…`. Sans lui, le bouton « Payer » reste désactivé. |
| `TRIAL_PUBLIC_URL` | URL publique du site, utilisée pour le retour depuis Stripe. |
| `TRIAL_TEST_MODE_ONLY` | `true` par défaut : seules les clés de test sont acceptées. Passer à `false` en production pour accepter les clés `sk_live_…` / `rk_live_…`. Les événements Stripe de l’autre mode (test ou réel) sont ignorés. |
| `TRIAL_TIMEZONE` | Fuseau des disponibilités et des emails de l’équipe (`Europe/Paris` par défaut). |
| `MAIL_MAX_PER_SECOND` | Débit maximal d’envoi des emails (`1` pour la sandbox Mailtrap ; vide = sans limite). |

L’application n’accepte que des clés de **test** tant que `TRIAL_TEST_MODE_ONLY` n’est pas désactivé. Ne jamais commiter de clé, ni coller une clé `live` dans un outil ou une conversation.

Après toute modification du `.env`, **redémarrer les processus longs** (file d’attente, planificateur) : ils gardent la configuration lue à leur démarrage.

## En local

Trois choses doivent tourner en plus du site servi par Herd :

1. **La file d’attente** — traite les webhooks Stripe. Incluse dans `php artisan dev` et dans les processus Herd.
2. **Le planificateur** — libère les créneaux impayés et rattrape les paiements dont le webhook n’est pas arrivé. **Il n’est pas inclus dans les processus lancés par Herd.** Lancer l’environnement avec `php artisan dev` (qui l’inclut), ou garder ouvert :

   ```bash
   php artisan schedule:work
   ```

3. **Le transfert des webhooks** — Stripe ne peut pas joindre `venincorse.test`. Lancer la [Stripe CLI](https://docs.stripe.com/stripe-cli) et la garder ouverte :

   ```bash
   stripe listen --forward-to http://venincorse.test/payments/webhook/stripe --events "checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired,refund.failed,charge.dispute.created"
   ```

   Garder la liste d’événements **entre guillemets** : sous PowerShell, sans guillemets, la liste est mal transmise et aucun événement de paiement n’est relayé. Le secret `whsec_…` affiché au démarrage doit être celui de `STRIPE_WEBHOOK_SECRET`.

### Payer en test

- Carte : `4242 4242 4242 4242`, date future quelconque, CVC `123`.
- Comptes de démonstration (`php artisan db:seed --class=DemoUserSeeder`, mot de passe `password`) : `admin@venincorse.test`, `student1@venincorse.test`, `student2@venincorse.test`.
- Publier les créneaux : `php artisan trials:publish-slots`. Ils sont générés depuis les disponibilités enregistrées par l’équipe (page « Disponibilités », permission `trial-availability.manage`) ; `migrate:fresh --seed` les publie aussi.
- Donner l’accès à la gestion des essais à un compte existant : `php artisan trials:grant-management email@exemple.fr`.

## En production

- **Enregistrer le webhook** dans le tableau de bord Stripe (Développeurs → Webhooks) :
  - URL : `https://<domaine>/payments/webhook/stripe`
  - Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `refund.failed`, `charge.dispute.created`
  - Copier le secret de signature de cet endpoint dans `STRIPE_WEBHOOK_SECRET`.
- **Lancer un worker de file d’attente** supervisé (Supervisor, Laravel Cloud…) : sans lui, ni les webhooks ni les emails ne partent (tous les emails des essais sont mis en file d’attente).
- **Lancer le planificateur** chaque minute (cron `* * * * * php artisan schedule:run`) : expiration des tentatives impayées, rattrapage Stripe, publication des créneaux et rappels 24 h avant chaque séance. Détail dans [trial-lifecycle.md](trial-lifecycle.md).
- **Configurer l’envoi d’emails** (`MAIL_*`) avec un vrai fournisseur ; Mailtrap Sandbox ne sert qu’aux tests.
- **Base MySQL (ou PostgreSQL) et cache partagé** (`CACHE_STORE=database` ou `redis`) : les verrous des paiements et `onOneServer()` du planificateur en dépendent ; SQLite ne verrouille pas les lignes.
- **À chaque déploiement**, exécuter :

  ```bash
  php artisan queue:restart
  ```

  Sinon, un worker resté actif continue avec l’ancienne configuration et l’ancien code (c’est ce qui a bloqué les webhooks en local : worker démarré avant l’ajout des clés).

## Comment un paiement est confirmé

La réservation n’est jamais confirmée par le simple retour depuis Stripe : l’application vérifie le paiement côté serveur, par trois voies complémentaires et sans risque de double traitement :

1. le **webhook** signé de Stripe ;
2. une **vérification directe auprès de Stripe** quand l’élève revient sur sa réservation, son espace ou le tunnel, ou clique sur « Actualiser le statut » ;
3. le **planificateur**, qui rattrape les paiements commencés depuis plus de cinq minutes.

Si les trois manquent (worker arrêté, CLI fermée, planificateur absent), un paiement réussi peut rester « en attente » : relancer les processus, puis `php artisan trials:expire-reservations` rattrape la situation.
