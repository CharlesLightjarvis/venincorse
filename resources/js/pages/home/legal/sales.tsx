import { LegalPage } from '@/components/legal-page';
import { coursePolicy, legalEntity, trialPolicy } from '@/data/legal';

export default function TermsOfSale() {
    return (
        <LegalPage
            current="CGV"
            title="Conditions générales de vente"
            intro={
                <p>
                    Les présentes conditions s’appliquent aux cours vendus sur
                    le site {legalEntity.brand} : le cours d’essai et les
                    parcours. Elles sont acceptées au moment de la réservation
                    ou de l’inscription.
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
                    id: 'parcours',
                    title: 'Les parcours',
                    content: (
                        <ul>
                            <li>
                                Un parcours couvre un niveau complet de{' '}
                                {coursePolicy.totalHours} heures de cours en
                                visioconférence, en groupe de 3 à 6 élèves ou en
                                individuel, selon le planning du groupe choisi
                                (dates, jours et horaires indiqués avant
                                l’inscription).
                            </li>
                            <li>
                                Un groupe commence à la date prévue, quel que
                                soit le nombre d’inscrits. Le prix, par personne
                                et toutes taxes comprises, est celui affiché au
                                moment de l’inscription.
                            </li>
                            <li>
                                Le lien de la visio est communiqué dans ton
                                espace et par email. Une séance manquée de ton
                                fait n’est ni rattrapée ni remboursée.
                            </li>
                        </ul>
                    ),
                },
                {
                    id: 'parcours-paiement',
                    title: 'Inscription et paiement d’un parcours',
                    content: (
                        <>
                            <p>
                                Tu choisis un groupe ouvert, puis tu paies en
                                ligne par carte via Stripe. Ta place est
                                réservée {coursePolicy.seatHoldMinutes} minutes
                                le temps du paiement ; l’inscription est
                                confirmée dès que le paiement est vérifié et un
                                email récapitulatif t’est envoyé.
                            </p>
                            <p>
                                Tu peux payer <strong>en une fois</strong> ou{' '}
                                <strong>
                                    en {coursePolicy.installments} fois sans
                                    frais
                                </strong>
                                . En plusieurs fois, la première échéance est
                                payée à l’inscription et ta carte est
                                enregistrée de façon sécurisée par Stripe (nous
                                n’avons jamais accès à ses numéros). Tu
                                autorises alors le prélèvement des échéances
                                suivantes sur cette carte, tous les{' '}
                                {coursePolicy.installmentIntervalDays} jours.
                                Chaque prélèvement fait l’objet d’un email.
                            </p>
                            <p>
                                Si un prélèvement échoue, tu es prévenu par
                                email et tu peux régler l’échéance toi-même,
                                avec la carte de ton choix ; une nouvelle
                                tentative automatique a lieu jusqu’à{' '}
                                {coursePolicy.installmentRetries} fois. Une
                                échéance qui reste impayée reste due et peut
                                entraîner la suspension de ta participation au
                                groupe.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'parcours-retractation',
                    title: 'Rétractation et annulation d’un parcours',
                    content: (
                        <>
                            <p>
                                Tu disposes d’un délai de{' '}
                                <strong>
                                    {coursePolicy.withdrawalDays} jours
                                </strong>{' '}
                                à compter de ton inscription pour te rétracter,
                                sans avoir à te justifier, en écrivant à{' '}
                                {legalEntity.email} (articles L221-18 et
                                suivants du Code de la consommation). Nous te
                                remboursons dans les 14 jours, sur le moyen de
                                paiement utilisé.
                            </p>
                            <p>
                                Si ton groupe commence pendant ce délai, tu
                                demandes expressément à l’inscription que le
                                parcours commence avant la fin du délai. En cas
                                de rétractation après le début du parcours, tu
                                restes redevable de la part correspondant aux
                                heures déjà effectuées, calculée au prorata du
                                prix (article L221-25) ; le reste t’est
                                remboursé et les échéances restantes sont
                                annulées.
                            </p>
                            <p>
                                Passé le délai de rétractation, l’inscription
                                n’est plus remboursable et les échéances
                                restantes restent dues. Contacte-nous en cas de
                                difficulté : nous chercherons une solution.
                            </p>
                            <p>
                                Si nous devons annuler un groupe ou ne pouvons
                                pas assurer le parcours, tu es prévenu par email
                                et remboursé de la part non effectuée, et les
                                échéances restantes sont annulées.
                            </p>
                        </>
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
