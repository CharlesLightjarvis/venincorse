/**
 * Company details shown on the legal pages. Every "[À compléter]" value must be filled in
 * before going live; the pages also need a review by a lawyer.
 */
export const legalEntity = {
    brand: 'VéninCorsé',
    companyName: '[À compléter : raison sociale]',
    legalForm: '[À compléter : forme juridique, capital]',
    registration: '[À compléter : SIREN / RCS]',
    vatNumber:
        '[À compléter : n° de TVA intracommunautaire, ou mention d’exonération]',
    address: '[À compléter : adresse du siège]',
    email: '[À compléter : email de contact]',
    publicationDirector: '[À compléter : nom du directeur de la publication]',
    host: '[À compléter : nom, adresse et téléphone de l’hébergeur]',
    mediator: '[À compléter : nom et site du médiateur de la consommation]',
    dataProtectionContact:
        '[À compléter : email dédié aux données personnelles]',
};

/** Shown on every legal page; bump it together with `config('trials.terms_version')`. */
export const legalUpdatedAt = '7 novembre 2026';

/** The trial lesson rules, shared by the terms of sale and the booking flow. */
export const trialPolicy = {
    price: '39 €',
    durationMinutes: 60,
    paymentHoldMinutes: 45,
    changeNoticeHours: 24,
    freeReschedules: 1,
    rebookOfferDays: 14,
};

/**
 * The course ("parcours") rules shown in the terms of sale. Keep them in sync with `config/courses.php`: if a
 * fee is ever added to the instalment plan, the terms must say so (and a lawyer must confirm it is allowed).
 */
export const coursePolicy = {
    totalHours: 60,
    seatHoldMinutes: 45,
    withdrawalDays: 14,
    installments: 3,
    installmentIntervalDays: 30,
    installmentRetries: 2,
};
