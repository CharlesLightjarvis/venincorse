import { LegalPage } from '@/components/legal-page';
import { legalEntity } from '@/data/legal';

export default function TermsOfUse() {
    return (
        <LegalPage
            current="CGU"
            title="Conditions générales d’utilisation"
            intro={
                <p>
                    Les présentes conditions encadrent l’utilisation du site et
                    de l’espace personnel {legalEntity.brand}. Les achats (cours
                    d’essai, parcours) sont régis par les conditions générales
                    de vente.
                </p>
            }
            sections={[
                {
                    id: 'objet',
                    title: 'Objet et acceptation',
                    content: (
                        <p>
                            En créant un compte ou en utilisant le site, tu
                            acceptes les présentes conditions. Si tu ne les
                            acceptes pas, n’utilise pas le service.
                        </p>
                    ),
                },
                {
                    id: 'compte',
                    title: 'Compte personnel',
                    content: (
                        <>
                            <p>
                                Un compte est nécessaire pour réserver et suivre
                                tes cours. Tu t’engages à fournir des
                                informations exactes et à garder ton mot de
                                passe confidentiel.
                            </p>
                            <p>
                                Le compte est personnel : toute activité
                                réalisée depuis ton compte est réputée faite par
                                toi. Préviens-nous sans délai en cas d’usage
                                frauduleux.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'usage',
                    title: 'Bon usage du service',
                    content: (
                        <>
                            <p>Il est interdit notamment :</p>
                            <ul>
                                <li>
                                    de perturber le fonctionnement du site ou de
                                    tenter d’accéder aux données d’autres
                                    utilisateurs ;
                                </li>
                                <li>
                                    de diffuser ou d’enregistrer une séance sans
                                    l’accord du professeur ;
                                </li>
                                <li>
                                    d’avoir un comportement irrespectueux envers
                                    les professeurs ou les autres élèves.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: 'visio',
                    title: 'Cours en visioconférence',
                    content: (
                        <p>
                            Les cours ont lieu sur un outil de visioconférence
                            tiers (par exemple Google Meet, Zoom ou Teams), dont
                            le lien est communiqué dans ton espace et par email.
                            L’utilisation de cet outil est soumise à ses propres
                            conditions. Tu es responsable de ta connexion
                            internet et de ton matériel.
                        </p>
                    ),
                },
                {
                    id: 'responsabilite',
                    title: 'Disponibilité et responsabilité',
                    content: (
                        <p>
                            Nous faisons notre possible pour que le site soit
                            accessible en continu, sans pouvoir le garantir
                            (maintenance, panne d’un prestataire). Notre
                            responsabilité ne peut être engagée pour un dommage
                            indirect lié à l’utilisation du site.
                        </p>
                    ),
                },
                {
                    id: 'suspension',
                    title: 'Suspension et suppression du compte',
                    content: (
                        <p>
                            Tu peux supprimer ton compte à tout moment depuis
                            tes paramètres, sauf pendant qu’un cours est en
                            cours de paiement, à venir ou en attente de clôture
                            : annule-le d’abord ou contacte-nous. Si tu as déjà
                            réservé un cours, ton compte est anonymisé (nom,
                            email et accès effacés) plutôt que supprimé, car les
                            réservations payées doivent être conservées en
                            comptabilité. Nous pouvons suspendre un compte en
                            cas de manquement grave aux présentes conditions,
                            après t’en avoir informé sauf urgence.
                        </p>
                    ),
                },
                {
                    id: 'modification',
                    title: 'Modification des conditions',
                    content: (
                        <p>
                            Ces conditions peuvent évoluer. La version en
                            vigueur est celle publiée sur cette page ; en cas de
                            changement important, nous te préviendrons par
                            email.
                        </p>
                    ),
                },
                {
                    id: 'droit',
                    title: 'Droit applicable',
                    content: (
                        <p>
                            Les présentes conditions sont soumises au droit
                            français. Contact : {legalEntity.email}.
                        </p>
                    ),
                },
            ]}
        />
    );
}
