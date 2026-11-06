import { LegalPage } from '@/components/legal-page';
import { legalEntity } from '@/data/legal';

export default function PrivacyPolicy() {
    return (
        <LegalPage
            current="Confidentialité"
            title="Politique de confidentialité"
            intro={
                <p>
                    Cette page explique quelles données personnelles{' '}
                    {legalEntity.brand} collecte, pourquoi, combien de temps
                    elles sont conservées et comment exercer tes droits,
                    conformément au RGPD.
                </p>
            }
            sections={[
                {
                    id: 'responsable',
                    title: 'Responsable du traitement',
                    content: (
                        <p>
                            {legalEntity.companyName}, {legalEntity.address}.
                            Pour toute question sur tes données :{' '}
                            {legalEntity.dataProtectionContact}.
                        </p>
                    ),
                },
                {
                    id: 'donnees',
                    title: 'Données collectées',
                    content: (
                        <ul>
                            <li>
                                <strong>Compte :</strong> nom, adresse email,
                                mot de passe (enregistré chiffré, jamais en
                                clair), fuseau horaire, préférences de sécurité
                                (double authentification, clés d’accès).
                            </li>
                            <li>
                                <strong>Cours d’essai :</strong> créneau choisi,
                                niveau estimé, objectif, statut du paiement,
                                date d’acceptation des conditions, lien de la
                                visio, bilan de séance.
                            </li>
                            <li>
                                <strong>Notes du professeur :</strong> notes
                                privées sur la séance, visibles uniquement par
                                l’équipe pédagogique.
                            </li>
                            <li>
                                <strong>Paiement :</strong> identifiant de la
                                transaction et montant. Les données de carte
                                sont traitées uniquement par Stripe, nous n’y
                                avons pas accès.
                            </li>
                        </ul>
                    ),
                },
                {
                    id: 'finalites',
                    title: 'Pourquoi et sur quelle base',
                    content: (
                        <ul>
                            <li>
                                <strong>Gérer ton compte et tes cours</strong>{' '}
                                (réservation, visio, emails de confirmation, de
                                rappel et de suivi) : exécution du contrat.
                            </li>
                            <li>
                                <strong>Encaisser et rembourser</strong>, tenir
                                la comptabilité : obligation légale.
                            </li>
                            <li>
                                <strong>Sécuriser le service</strong>{' '}
                                (prévention de la fraude, journaux techniques) :
                                intérêt légitime.
                            </li>
                        </ul>
                    ),
                },
                {
                    id: 'destinataires',
                    title: 'Qui reçoit tes données',
                    content: (
                        <>
                            <p>
                                L’équipe pédagogique et administrative, et nos
                                sous-traitants, uniquement pour les besoins du
                                service :
                            </p>
                            <ul>
                                <li>
                                    Stripe, pour le paiement et les
                                    remboursements ;
                                </li>
                                <li>notre prestataire d’envoi d’emails ;</li>
                                <li>notre hébergeur ;</li>
                                <li>
                                    l’outil de visioconférence choisi par le
                                    professeur (Google Meet, Zoom, Teams…),
                                    lorsque tu rejoins la séance.
                                </li>
                            </ul>
                            <p>
                                Certains de ces prestataires peuvent traiter des
                                données hors de l’Union européenne ; ces
                                transferts sont encadrés par les garanties
                                prévues par le RGPD (clauses contractuelles
                                types ou décision d’adéquation). Nous ne vendons
                                jamais tes données.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'durees',
                    title: 'Durées de conservation',
                    content: (
                        <ul>
                            <li>
                                Compte : tant qu’il est actif, puis suppression
                                à ta demande ou après 3 ans d’inactivité. Si tu
                                as déjà réservé un cours, le compte est
                                anonymisé : nom, email, accès et objectif sont
                                effacés, seules les données de réservation et de
                                paiement sont gardées.
                            </li>
                            <li>
                                Données de réservation et de paiement : 10 ans
                                pour les pièces comptables (obligation légale).
                            </li>
                            <li>Journaux techniques : 12 mois maximum.</li>
                        </ul>
                    ),
                },
                {
                    id: 'droits',
                    title: 'Tes droits',
                    content: (
                        <>
                            <p>
                                Tu peux accéder à tes données, les rectifier,
                                les supprimer, en limiter l’usage, t’y opposer
                                ou les récupérer (portabilité). Une partie se
                                fait directement depuis tes paramètres (profil,
                                suppression du compte) ; pour le reste, écris à{' '}
                                {legalEntity.dataProtectionContact}. Nous
                                répondons sous un mois.
                            </p>
                            <p>
                                Si tu estimes que tes droits ne sont pas
                                respectés, tu peux saisir la CNIL (cnil.fr).
                            </p>
                        </>
                    ),
                },
                {
                    id: 'cookies',
                    title: 'Cookies et stockage local',
                    content: (
                        <>
                            <p>
                                Le site n’utilise que des cookies{' '}
                                <strong>strictement nécessaires</strong>, qui ne
                                demandent pas ton consentement :
                            </p>
                            <ul>
                                <li>
                                    cookie de session, pour rester connecté ;
                                </li>
                                <li>
                                    jeton de sécurité (XSRF-TOKEN), contre les
                                    requêtes frauduleuses ;
                                </li>
                                <li>
                                    préférences d’affichage (thème clair ou
                                    sombre, menu replié).
                                </li>
                            </ul>
                            <p>
                                Aucun cookie publicitaire ni de mesure
                                d’audience n’est déposé. Si cela change, un
                                bandeau te demandera ton accord au préalable.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'securite',
                    title: 'Sécurité',
                    content: (
                        <p>
                            Les échanges sont chiffrés (HTTPS), les mots de
                            passe sont stockés chiffrés et l’accès aux données
                            est limité aux personnes qui en ont besoin. La
                            double authentification est disponible dans tes
                            paramètres.
                        </p>
                    ),
                },
            ]}
        />
    );
}
