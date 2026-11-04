# Réservation du cours d’essai — prototype frontend

## Objectif

Remplacer la page marketing du cours d’essai par un parcours court : créneau → informations → paiement simulé → confirmation. Le visiteur réserve sans compte et sans test de niveau obligatoire.

## Périmètre actuel

- `/trial` : réservation autonome, sans header/footer marketing.
- `/booking/manage?id=…` : consultation, report et annulation d’une réservation de démonstration.
- `/booking/teacher` : espace professeur de démonstration : agenda, réservations et disponibilités.
- Données fictives et modifications conservées dans le stockage local du navigateur. Les écrans partagent ce stockage ; rien n’est transmis à un serveur. Utiliser uniquement des coordonnées fictives.
- Prix retenu pour le prototype : 39 € pour 60 minutes individuelles. Déduction du parcours sous 7 jours conservée dans la présentation, à confirmer avant commercialisation.
- Aucun backend métier, paiement réel, envoi d’email, création de compte ou création de réunion Meet.
- Aucune synchronisation Google Calendar.

## Visiteur

1. Choisir un créneau parmi les 14 prochains jours, avec sélection du fuseau d’affichage. Les horaires du professeur sont définis en UTC, sans ambiguïté aux changements d’heure.
2. Saisir prénom, email fictif, niveau estimé et objectif. Aucun mot de passe.
3. Relire la date, le prix et les conditions de report, puis simuler le paiement. Possibilité de simuler un paiement refusé : aucune réservation n’est créée dans ce cas.
4. Voir une confirmation avec référence, récapitulatif et accès à la gestion. Un aperçu d’email remplace l’envoi réel ; aucun faux numéro de carte n’est demandé.
5. Depuis la gestion, reporter sur un autre créneau disponible ou annuler avec confirmation. Dans ce prototype : report et annulation jusqu’à 24 h avant le cours ; annulation = remboursement simulé. Conditions à valider avant lancement.

## Professeur

- Agenda des séances à venir et fiche de l’élève (coordonnées, niveau, objectif, statut du paiement).
- Liste filtrable et recherchable des réservations ; états à venir, réalisé et annulé.
- Notes privées simulées et recommandation de parcours enregistrables ; marquer une séance réalisée.
- Définition des jours et heures ouverts, dates d’absence, délai minimum de réservation de 24 h et pause d’au moins une heure entre les créneaux proposés.
- Un créneau confirmé ou réalisé n’est plus proposé. Un report libère l’ancien créneau ; une annulation libère le créneau.
- Modifier les disponibilités ne supprime jamais une réservation existante.

## Direction visuelle

Respect du design existant : tokens sémantiques, vert de marque, fonds neutres, Fredoka pour les titres et Geist pour le texte. Réservation centrée, étapes lisibles, récapitulatif latéral sur desktop et empilé sur mobile. Agenda professeur organisé par date, sans statistiques décoratives. Pas d’animation d’entrée masquant les formulaires.

## Limites et futur backend

Le stockage local n’offre aucune authentification, confidentialité, gestion atomique des conflits ou synchronisation entre appareils. Les identifiants de démo ne sont pas des liens sécurisés. L’espace professeur public ne contient que des mocks et ne doit jamais être utilisé avec de vraies données.

Pour une version réelle : authentification et autorisation professeur, validation serveur, créneaux verrouillés atomiquement, paiement et webhooks, emails transactionnels, liens de gestion signés et expirables, lien Meet réel fourni par le professeur, rappels, règles de remboursement et protection des données. L’espace élève sera proposé lors d’une inscription à un parcours, pas imposé pour l’essai. Google Calendar reste hors périmètre.

## Vérification

Tester : réservation complète, validation des champs, paiement refusé puis réussi, créneau déjà occupé, fuseaux horaires, confirmation persistante après rechargement, report/annulation et libération du créneau, notes professeur, changement de disponibilités et absence de créneaux. Vérifier le responsive et le build. Les actions sont exclusivement locales.

Tests de logique sans dépendance supplémentaire (Node avec prise en charge TypeScript) : `node --test tests/Unit/trial-booking.test.mjs`.
