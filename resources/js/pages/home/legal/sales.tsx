import { LegalPage } from '@/components/legal-page';
import { legalEntity, trialPolicy } from '@/data/legal';

export default function TermsOfSale() {
    return (
        <LegalPage
            current="CGV"
            title="Conditions générales de vente"
            intro={
                <p>
                    Les présentes conditions s’appliquent aux cours vendus sur
                    le site {legalEntity.brand}, en particulier au cours
                    d’essai. Elles sont acceptées au moment de la réservation.
                </p>
            }
            sections={[
                {
                    id: 'vendeur',
                    title: 'Vendeur',
                    content: (
                        <p>
                            {legalEntity.companyName}, {legalEntity.address},{' '}
                            {legalEntity.registration}. Contact :{' '}
                            {legalEntity.email}.
                        </p>
                    ),
                },
                {
                    id: 'essai',
                    title: 'Le cours d’essai',
                    content: (
                        <ul>
                            <li>
                                Un cours individuel de{' '}
                                {trialPolicy.durationMinutes} minutes en
                                visioconférence, au prix de {trialPolicy.price}{' '}
                                TTC.
                            </li>
                            <li>
                                Un seul cours d’essai par élève. Après une
                                annulation remboursée, tu peux en réserver un
                                nouveau.
                            </li>
                            <li>
                                Le lien de la visio est communiqué par le
                                professeur avant la séance, dans ton espace et
                                par email.
                            </li>
                        </ul>
                    ),
                },
                {
                    id: 'commande',
                    title: 'Réservation et paiement',
                    content: (
                        <>
                            <p>
                                Tu choisis un créneau, puis tu paies en ligne
                                par carte via notre prestataire de paiement
                                sécurisé Stripe. Nous n’avons jamais accès à tes
                                données bancaires.
                            </p>
                            <p>
                                Le créneau est bloqué pendant{' '}
                                {trialPolicy.paymentHoldMinutes} minutes le
                                temps du paiement. La réservation n’est
                                confirmée qu’après vérification du paiement ; tu
                                reçois alors un email de confirmation.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'report',
                    title: 'Report par l’élève',
                    content: (
                        <p>
                            Tu peux déplacer ton cours d’essai{' '}
                            <strong>
                                gratuitement, {trialPolicy.freeReschedules}{' '}
                                fois, jusqu’à {trialPolicy.changeNoticeHours}{' '}
                                heures avant la séance
                            </strong>
                            , depuis ton espace, vers un autre créneau
                            disponible. Le professeur t’envoie alors le lien de
                            la visio de la nouvelle séance. Passé ce délai, le
                            cours ne peut plus être déplacé en ligne :
                            contacte-nous en cas d’imprévu.
                        </p>
                    ),
                },
                {
                    id: 'annulation',
                    title: 'Annulation par l’élève',
                    content: (
                        <p>
                            Tu peux annuler ton cours depuis ton espace{' '}
                            <strong>
                                jusqu’à {trialPolicy.changeNoticeHours} heures
                                avant la séance
                            </strong>{' '}
                            : tu es alors remboursé intégralement, sur le moyen
                            de paiement utilisé, sous quelques jours selon ta
                            banque. Ces règles s’appliquent sans préjudice de
                            ton droit de rétractation (article suivant).
                        </p>
                    ),
                },
                {
                    id: 'retractation',
                    title: 'Droit de rétractation',
                    content: (
                        <>
                            <p>
                                En tant que consommateur, tu disposes d’un délai
                                de <strong>14 jours</strong> à compter de la
                                réservation pour te rétracter, sans avoir à te
                                justifier (articles L221-18 et suivants du Code
                                de la consommation). Pour l’exercer, écris-nous
                                à {legalEntity.email} : nous te remboursons
                                intégralement dans les 14 jours.
                            </p>
                            <p>
                                En réservant un cours qui a lieu avant la fin de
                                ce délai, tu demandes expressément que le
                                service commence avant son expiration. Si tu te
                                rétractes après le début du cours, le montant
                                correspondant au service déjà fourni reste dû ;
                                une fois le cours entièrement réalisé, tu ne
                                peux plus exercer ce droit (article L221-28 du
                                Code de la consommation).
                            </p>
                        </>
                    ),
                },
                {
                    id: 'absence',
                    title: 'Absence de l’élève',
                    content: (
                        <>
                            <p>
                                Si tu ne te présentes pas à la séance sans
                                l’avoir annulée ou déplacée dans les délais, le
                                cours est considéré comme dû et n’est pas
                                remboursé. En cas d’empêchement sérieux,
                                contacte-nous : le professeur peut, à sa
                                discrétion, t’offrir un nouveau créneau, une
                                seule fois.
                            </p>
                            <p>
                                Ce créneau offert est à choisir dans ton espace
                                dans les{' '}
                                <strong>
                                    {trialPolicy.rebookOfferDays} jours
                                </strong>{' '}
                                suivant l’offre. Une fois choisi, il{' '}
                                <strong>
                                    ne peut plus être déplacé ni remboursé
                                </strong>
                                , puisqu’il remplace une séance déjà due.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'annulation-professeur',
                    title: 'Annulation par l’école',
                    content: (
                        <p>
                            Si nous devons annuler ton cours (indisponibilité du
                            professeur, problème technique de notre fait), tu es
                            prévenu par email et{' '}
                            <strong>remboursé intégralement</strong>. Tu peux
                            ensuite réserver un nouveau créneau.
                        </p>
                    ),
                },
                {
                    id: 'technique',
                    title: 'Problème technique pendant la séance',
                    content: (
                        <p>
                            Si la séance ne peut pas avoir lieu à cause d’un
                            problème de notre côté, nous te proposons un nouveau
                            créneau ou un remboursement. Un problème de
                            connexion de ton côté n’ouvre pas droit à
                            remboursement, mais contacte-nous : nous chercherons
                            une solution.
                        </p>
                    ),
                },
                {
                    id: 'litiges',
                    title: 'Réclamations et médiation',
                    content: (
                        <>
                            <p>
                                Pour toute réclamation, écris-nous à{' '}
                                {legalEntity.email}. Nous répondons sous 7 jours
                                ouvrés.
                            </p>
                            <p>
                                À défaut d’accord, tu peux recourir gratuitement
                                au médiateur de la consommation :{' '}
                                {legalEntity.mediator}. Les présentes conditions
                                sont soumises au droit français.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
