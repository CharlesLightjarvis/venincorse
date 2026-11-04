export type LevelCode = 'a1' | 'a2' | 'b1' | 'b2';

export interface LevelTestQuestion {
    id: number;
    level: LevelCode;
    prompt: string;
    options: string[];
    answer: number;
}

export interface LevelTestResult {
    code: LevelCode;
    label: string;
    headline: string;
    description: string;
    courseHref: string;
    courseLabel: string;
    strengths: string[];
    nextSteps: string[];
}

export interface LevelTestOutcome {
    result: LevelTestResult;
    score: number;
    total: number;
    answered: number;
    percentage: number;
    correctByLevel: Record<LevelCode, number>;
}

export const levelTestQuestions: LevelTestQuestion[] = [
    // A1 — 15 questions
    {
        id: 1,
        level: 'a1',
        prompt: 'Quel article accompagne « Tisch » ?',
        options: ['der', 'die', 'das', 'den'],
        answer: 0,
    },
    {
        id: 2,
        level: 'a1',
        prompt: 'Comment dit-on « bonjour » le matin ?',
        options: ['Guten Abend', 'Guten Morgen', 'Gute Nacht', 'Guten Tag'],
        answer: 1,
    },
    {
        id: 3,
        level: 'a1',
        prompt: 'Complète : Ich ___ aus Frankreich.',
        options: ['bin', 'bist', 'ist', 'sind'],
        answer: 0,
    },
    {
        id: 4,
        level: 'a1',
        prompt: 'Complète : Du ___ Student.',
        options: ['bin', 'bist', 'ist', 'sind'],
        answer: 1,
    },
    {
        id: 5,
        level: 'a1',
        prompt: 'Quel est le pluriel de « Buch » ?',
        options: ['Bücher', 'Bucher', 'Büchs', 'Büchern'],
        answer: 0,
    },
    {
        id: 6,
        level: 'a1',
        prompt: 'Quelle réponse convient à « Wie heißt du ? »',
        options: [
            'Ich heiße Léa.',
            'Ich bin 25 Jahre alt.',
            'Ich komme aus Paris.',
            'Mir geht es gut.',
        ],
        answer: 0,
    },
    {
        id: 7,
        level: 'a1',
        prompt: 'Quel est le nombre 7 ?',
        options: ['sechs', 'sieben', 'acht', 'neun'],
        answer: 1,
    },
    {
        id: 8,
        level: 'a1',
        prompt: 'Quelle réponse convient à « Woher kommst du ? »',
        options: [
            'Ich komme aus Kanada.',
            'Ich wohne in Berlin.',
            'Ich heiße Tom.',
            'Ich bin Lehrer.',
        ],
        answer: 0,
    },
    {
        id: 9,
        level: 'a1',
        prompt: 'Quel article accompagne « Frau » ?',
        options: ['der', 'die', 'das', 'den'],
        answer: 1,
    },
    {
        id: 10,
        level: 'a1',
        prompt: 'Complète : Ich ___ 20 Jahre alt.',
        options: ['bin', 'bist', 'ist', 'habe'],
        answer: 0,
    },
    {
        id: 11,
        level: 'a1',
        prompt: 'Complète : Ich habe ___ Zeit.',
        options: ['nicht', 'kein', 'keine', 'keinen'],
        answer: 2,
    },
    {
        id: 12,
        level: 'a1',
        prompt: 'Complète : Am Montag ___ ich Deutsch.',
        options: ['lerne', 'lernst', 'lernt', 'lernen'],
        answer: 0,
    },
    {
        id: 13,
        level: 'a1',
        prompt: 'Complète : Das ist ___ Buch.',
        options: ['ein', 'eine', 'einen', 'einem'],
        answer: 0,
    },
    {
        id: 14,
        level: 'a1',
        prompt: 'Quelle réponse convient à « Wie geht’s ? »',
        options: [
            'Danke, gut.',
            'Ich heiße Anna.',
            'Ich komme aus Wien.',
            'Bis morgen.',
        ],
        answer: 0,
    },
    {
        id: 15,
        level: 'a1',
        prompt: 'Complète : Ich wohne ___ Berlin.',
        options: ['in', 'nach', 'aus', 'bei'],
        answer: 0,
    },

    // A2 — 15 questions
    {
        id: 16,
        level: 'a2',
        prompt: 'Quel est le participe passé du verbe « gehen » ?',
        options: ['gegangen', 'gegeht', 'ging', 'gangen'],
        answer: 0,
    },
    {
        id: 17,
        level: 'a2',
        prompt: 'Complète : Ich fahre ___ dem Bus zur Arbeit.',
        options: ['mit', 'in', 'auf', 'von'],
        answer: 0,
    },
    {
        id: 18,
        level: 'a2',
        prompt: 'Quel est le comparatif de « schnell » ?',
        options: ['schnellste', 'mehr schnell', 'schneller', 'am schnellsten'],
        answer: 2,
    },
    {
        id: 19,
        level: 'a2',
        prompt: 'Complète : Ich habe das Buch ___.',
        options: ['gelesen', 'las', 'lesen', 'gelesen gehabt'],
        answer: 0,
    },
    {
        id: 20,
        level: 'a2',
        prompt: 'Complète : Ich helfe ___ Mann.',
        options: ['der', 'den', 'dem', 'des'],
        answer: 2,
    },
    {
        id: 21,
        level: 'a2',
        prompt: 'Complète : Ich interessiere mich ___ Musik.',
        options: ['für', 'an', 'auf', 'mit'],
        answer: 0,
    },
    {
        id: 22,
        level: 'a2',
        prompt: 'Quel est le prétérit de « sein » à la 1re personne ?',
        options: ['war', 'ware', 'gewesen', 'bin'],
        answer: 0,
    },
    {
        id: 23,
        level: 'a2',
        prompt: 'Complète : Morgen ___ ich nach München.',
        options: ['fahre', 'fährst', 'fährt', 'fahren'],
        answer: 0,
    },
    {
        id: 24,
        level: 'a2',
        prompt: 'Complète : Er hat ___ Haustier.',
        options: ['kein', 'keine', 'keinen', 'nicht'],
        answer: 0,
    },
    {
        id: 25,
        level: 'a2',
        prompt: 'Complète : Das ist der Mann, ___ ich kenne.',
        options: ['der', 'den', 'dem', 'des'],
        answer: 1,
    },
    {
        id: 26,
        level: 'a2',
        prompt: 'Complète : Ich bin ___ als mein Bruder.',
        options: ['alt', 'älter', 'am ältesten', 'mehr alt'],
        answer: 1,
    },
    {
        id: 27,
        level: 'a2',
        prompt: 'Complète : Wir ___ gestern ins Kino gegangen.',
        options: ['haben', 'sind', 'werden', 'hatten'],
        answer: 1,
    },
    {
        id: 28,
        level: 'a2',
        prompt: 'Complète : Sie wohnt ___ der Schweiz.',
        options: ['in', 'nach', 'aus', 'bei'],
        answer: 0,
    },
    {
        id: 29,
        level: 'a2',
        prompt: 'Complète : Ich möchte ___ Kaffee.',
        options: ['ein', 'eine', 'einen', 'einem'],
        answer: 2,
    },
    {
        id: 30,
        level: 'a2',
        prompt: 'Complète : Ich habe ___ Hund.',
        options: ['ein', 'eine', 'einen', 'einem'],
        answer: 2,
    },

    // B1 — 15 questions
    {
        id: 31,
        level: 'b1',
        prompt: 'Complète : Ich lerne Deutsch, ___ ich in Berlin arbeiten möchte.',
        options: ['weil', 'dass', 'obwohl', 'wenn'],
        answer: 0,
    },
    {
        id: 32,
        level: 'b1',
        prompt: 'Quel est le prétérit de « sprechen » à la 3e personne du singulier ?',
        options: ['sprach', 'spricht', 'gesprochen', 'sprachte'],
        answer: 0,
    },
    {
        id: 33,
        level: 'b1',
        prompt: 'Complète : Das Buch ___ von mir gelesen.',
        options: ['wurde', 'war', 'hat', 'wird'],
        answer: 0,
    },
    {
        id: 34,
        level: 'b1',
        prompt: 'Complète : Wenn ich Zeit ___, komme ich.',
        options: ['habe', 'hätte', 'hatte', 'haben'],
        answer: 0,
    },
    {
        id: 35,
        level: 'b1',
        prompt: 'Complète : Er sagte, dass er ___.',
        options: ['kommt', 'komme', 'kam', 'käme'],
        answer: 1,
    },
    {
        id: 36,
        level: 'b1',
        prompt: 'Complète : Trotz ___ Regens blieben wir zu Hause.',
        options: ['der', 'den', 'dem', 'des'],
        answer: 3,
    },
    {
        id: 37,
        level: 'b1',
        prompt: 'Complète : Ich freue mich ___ deinen Besuch.',
        options: ['auf', 'für', 'über', 'an'],
        answer: 0,
    },
    {
        id: 38,
        level: 'b1',
        prompt: 'Complète : Das ist der Kollege, ___ ich gestern gesprochen habe.',
        options: ['mit dem', 'mit den', 'mit der', 'mit des'],
        answer: 0,
    },
    {
        id: 39,
        level: 'b1',
        prompt: 'Complète : Ich hätte gern ___ Glas Wasser.',
        options: ['ein', 'eine', 'einen', 'einem'],
        answer: 0,
    },
    {
        id: 40,
        level: 'b1',
        prompt: 'Complète : Je mehr ich übe, ___ besser werde ich.',
        options: ['desto', 'als', 'wie', 'so'],
        answer: 0,
    },
    {
        id: 41,
        level: 'b1',
        prompt: 'Complète : Er tut so, ___ er alles wüsste.',
        options: ['als ob', 'als', 'wie', 'dass'],
        answer: 0,
    },
    {
        id: 42,
        level: 'b1',
        prompt: 'Complète : Nachdem ich gegessen ___, ging ich spazieren.',
        options: ['hatte', 'habe', 'hätte', 'war'],
        answer: 0,
    },
    {
        id: 43,
        level: 'b1',
        prompt: 'Complète : Ich lasse mein Auto ___.',
        options: ['reparieren', 'repariert', 'repariere', 'zu reparieren'],
        answer: 0,
    },
    {
        id: 44,
        level: 'b1',
        prompt: 'Complète : Sie hat mich ___ zu kommen.',
        options: ['gebeten', 'gebittet', 'gebat', 'beten'],
        answer: 0,
    },
    {
        id: 45,
        level: 'b1',
        prompt: 'Complète : Ich warte ___ den Bus.',
        options: ['auf', 'für', 'an', 'über'],
        answer: 0,
    },

    // B2 — 15 questions
    {
        id: 46,
        level: 'b2',
        prompt: 'Complète : Wenn ich mehr Zeit ___, würde ich mehr lesen.',
        options: ['hätte', 'habe', 'hatte', 'haben würde'],
        answer: 0,
    },
    {
        id: 47,
        level: 'b2',
        prompt: 'Quelle phrase est correcte ?',
        options: [
            'Er hat entschieden, nach Berlin zu ziehen.',
            'Er hat sich entschieden, nach Berlin zu ziehen.',
            'Er hat sich entschieden, nach Berlin ziehen.',
            'Er hat sich entschieden, zu nach Berlin ziehen.',
        ],
        answer: 1,
    },
    {
        id: 48,
        level: 'b2',
        prompt: 'Complète : Die Ergebnisse ___ morgen veröffentlicht.',
        options: ['werden', 'wird', 'worden', 'wurden'],
        answer: 0,
    },
    {
        id: 49,
        level: 'b2',
        prompt: 'Complète : Er ___ das besser machen können.',
        options: ['hätte', 'hatte', 'hat', 'würde'],
        answer: 0,
    },
    {
        id: 50,
        level: 'b2',
        prompt: 'Complète : Das ist der beste Film, ___ ich je gesehen habe.',
        options: ['den', 'der', 'dem', 'das'],
        answer: 0,
    },
    {
        id: 51,
        level: 'b2',
        prompt: 'Complète : ___ er krank war, ging er zur Arbeit.',
        options: ['Obwohl', 'Weil', 'Wenn', 'Damit'],
        answer: 0,
    },
    {
        id: 52,
        level: 'b2',
        prompt: 'Complète : Ich hätte das nicht machen ___.',
        options: ['sollen', 'gesollt', 'soll', 'sollte'],
        answer: 0,
    },
    {
        id: 53,
        level: 'b2',
        prompt: 'Complète : Die Firma ___ ihre Mitarbeiter weiter.',
        options: ['bildet', 'weiterbildet', 'ausbildet', 'bildet aus'],
        answer: 0,
    },
    {
        id: 54,
        level: 'b2',
        prompt: 'Complète : Es handelt sich ___ ein Missverständnis.',
        options: ['um', 'für', 'auf', 'über'],
        answer: 0,
    },
    {
        id: 55,
        level: 'b2',
        prompt: 'Complète : Der Vertrag ___ bis Ende des Jahres.',
        options: ['läuft', 'lauft', 'laufte', 'gelaufen'],
        answer: 0,
    },
    {
        id: 56,
        level: 'b2',
        prompt: 'Complète : Je nachdem, ___ das Wetter ist, bleiben wir drinnen.',
        options: ['wie', 'als', 'dass', 'ob'],
        answer: 0,
    },
    {
        id: 57,
        level: 'b2',
        prompt: 'Complète : Er hat so ___, als hätte er es gewusst.',
        options: ['getan', 'gemacht', 'tun', 'tat'],
        answer: 0,
    },
    {
        id: 58,
        level: 'b2',
        prompt: 'Complète : Die Maßnahme ___ darauf ab, die Kosten zu senken.',
        options: ['zielt', 'zielte', 'gezielt', 'zielen'],
        answer: 0,
    },
    {
        id: 59,
        level: 'b2',
        prompt: 'Complète : ___ seiner Erfahrung hätte er das erkennen müssen.',
        options: ['Aufgrund', 'Trotz', 'Statt', 'Während'],
        answer: 0,
    },
    {
        id: 60,
        level: 'b2',
        prompt: 'Complète : Das Problem lässt sich nicht so leicht ___.',
        options: ['lösen', 'gelöst', 'löst', 'zu lösen'],
        answer: 0,
    },
];

export const levelsPerTest = 15;

export const levelTestResults: Record<LevelCode, LevelTestResult> = {
    a1: {
        code: 'a1',
        label: 'A1 — Premiers pas',
        headline: 'Tu débutes en allemand.',
        description:
            'Tu reconnais quelques mots et expressions, mais les bases restent à poser. C’est un excellent point de départ : le parcours A1 t’amène à ta première vraie conversation.',
        courseHref: '/courses/a1',
        courseLabel: 'Voir le parcours A1',
        strengths: [
            'Tu identifies les mots transparents et les salutations',
            'Tu oses te lancer, même sans maîtriser toutes les règles',
        ],
        nextSteps: [
            '60 heures pour poser les fondations',
            'Deux sous-niveaux : A1.1 et A1.2',
            'Un cours d’essai pour valider la méthode',
        ],
    },
    a2: {
        code: 'a2',
        label: 'A2 — Autonomie',
        headline: 'Tu as déjà des bases.',
        description:
            'Tu te débrouilles dans les situations simples, mais tu bloques dès que la phrase sort du cadre appris. Le parcours A2 consolide les temps du passé et te rend autonome au quotidien.',
        courseHref: '/courses/a2',
        courseLabel: 'Voir le parcours A2',
        strengths: [
            'Tu comprends les questions simples et tu sais y répondre',
            'Tu connais le présent et le vocabulaire du quotidien',
        ],
        nextSteps: [
            '60 heures pour gagner en autonomie',
            'Passé, datif et premières subordonnées',
            'Un cours d’essai pour tester ton oral',
        ],
    },
    b1: {
        code: 'b1',
        label: 'B1 — Confiance',
        headline: 'Tu es intermédiaire.',
        description:
            'Tu tiens une conversation simple et tu comprends l’essentiel d’un texte courant. Le parcours B1 travaille la fluidité, l’argumentation et les situations imprévues.',
        courseHref: '/courses/b1',
        courseLabel: 'Voir le parcours B1',
        strengths: [
            'Tu comprends un article court ou une émission simple',
            'Tu sais raconter une expérience et donner ton avis',
        ],
        nextSteps: [
            '60 heures pour parler avec plus d’aisance',
            'Prétérit, Konjunktiv II et subordonnées',
            'Un cours d’essai pour viser ton objectif',
        ],
    },
    b2: {
        code: 'b2',
        label: 'B2 — Précision',
        headline: 'Tu es avancé.',
        description:
            'Tu comprends des textes complexes et tu t’exprimes avec structure. Le parcours B2 affine la nuance et prépare aux épreuves ÖSD ou TELC.',
        courseHref: '/courses/b2',
        courseLabel: 'Voir le parcours B2',
        strengths: [
            'Tu structures un argument et tu nuances une idée',
            'Tu comprends un débat ou un texte long',
        ],
        nextSteps: [
            '60 heures pour viser la précision',
            'Style, synthèse et tâches d’examen',
            'Une prépa ÖSD ou TELC ciblée',
        ],
    },
};

const levelPriority: LevelCode[] = ['b2', 'b1', 'a2', 'a1'];

export function getLevelTestOutcome(
    answers: (number | null)[],
): LevelTestOutcome {
    const correctByLevel: Record<LevelCode, number> = {
        a1: 0,
        a2: 0,
        b1: 0,
        b2: 0,
    };

    let score = 0;
    let answered = 0;

    levelTestQuestions.forEach((question, index) => {
        if (answers[index] === null || answers[index] === undefined) {
            return;
        }

        answered += 1;

        if (answers[index] === question.answer) {
            score += 1;
            correctByLevel[question.level] += 1;
        }
    });

    const code =
        levelPriority.find((level) => correctByLevel[level] >= 9) ?? 'a1';

    return {
        result: levelTestResults[code],
        score,
        total: levelTestQuestions.length,
        answered,
        percentage: Math.round((score / levelTestQuestions.length) * 100),
        correctByLevel,
    };
}
