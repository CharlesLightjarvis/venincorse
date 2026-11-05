import { useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { selectClassName } from '@/components/trial-slot-picker';
import {
    readPartnerRequests,
    readPartnerSnapshot,
    savePartnerRequests,
    subscribeToPartnerRequests,
    type PartnerRequest,
} from '@/data/partner-requests';
import { partners } from '@/routes';

const statusLabels = {
    pending: 'À étudier',
    reviewing: 'En cours d’étude',
    contacted: 'Contact établi',
};

export function PartnerRequestsPanel() {
    const snapshot = useSyncExternalStore(
        subscribeToPartnerRequests,
        readPartnerSnapshot,
        () => '[]',
    );
    const requests = useMemo(
        () => JSON.parse(snapshot) as PartnerRequest[],
        [snapshot],
    );
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = requests.find((request) => request.id === selectedId);
    const visible = requests.filter((request) =>
        `${request.name} ${request.email} ${request.country}`
            .toLocaleLowerCase('fr')
            .includes(search.toLocaleLowerCase('fr')),
    );

    function update(
        changes: Partial<Pick<PartnerRequest, 'status' | 'notes'>>,
    ) {
        savePartnerRequests(
            readPartnerRequests().map((request) =>
                request.id === selectedId
                    ? { ...request, ...changes }
                    : request,
            ),
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Demandes de partenariat pédagogique
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {requests.length} demande(s) · stockage local, aucun
                        e-mail envoyé. Les changements ne créent aucun accès
                        enseignant.
                    </p>
                </div>
                <Button asChild variant="outline" className="rounded-full">
                    <Link href={partners()}>Voir la page publique</Link>
                </Button>
            </div>
            <div className="flex max-w-md flex-col gap-2">
                <Label htmlFor="partner-search">Rechercher une demande</Label>
                <Input
                    id="partner-search"
                    placeholder="Nom, e-mail ou pays…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-border">
                    {visible.length === 0 && (
                        <p
                            role="status"
                            className="p-6 text-sm text-muted-foreground"
                        >
                            Aucune demande à afficher. Complétez le tunnel
                            public dans ce navigateur ou modifiez votre
                            recherche.
                        </p>
                    )}
                    {visible.map((request) => (
                        <button
                            key={request.id}
                            type="button"
                            aria-pressed={selectedId === request.id}
                            onClick={() => setSelectedId(request.id)}
                            className="flex w-full flex-col gap-2 border-b border-border p-5 text-left last:border-0 hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary"
                        >
                            <span className="font-semibold">
                                {request.name}
                            </span>
                            <span className="text-sm break-all text-muted-foreground">
                                {request.email}
                            </span>
                            <span className="text-sm">
                                {request.role} · {request.country}
                            </span>
                            <span className="text-xs text-primary">
                                {statusLabels[request.status]}
                            </span>
                        </button>
                    ))}
                </div>
                {selected && (
                    <section
                        className="min-w-0 rounded-2xl border border-border p-6"
                        aria-label="Détail de la demande"
                    >
                        <h3 className="text-xl font-semibold">
                            {selected.name}
                        </h3>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Reçue le{' '}
                            {new Date(selected.createdAt).toLocaleDateString(
                                'fr-FR',
                            )}{' '}
                            · simulation
                        </p>
                        <dl className="mt-5 space-y-4">
                            {[
                                ['E-mail', selected.email],
                                ['Pays', selected.country],
                                ['Profil', selected.role],
                                ['Expérience', selected.experience],
                                ['Élèves', selected.students],
                                ['Niveaux', selected.levels.join(', ')],
                                ['Format', selected.format],
                                ['Besoins', selected.needs.join(', ')],
                                ['Projet', selected.project],
                                ['Démarrage', selected.timeline],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-xs text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd className="mt-1 text-sm break-words whitespace-pre-wrap">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <div className="mt-6 flex flex-col gap-2">
                            <Label htmlFor="partner-status">
                                Suivi de la demande (démo)
                            </Label>
                            <select
                                id="partner-status"
                                className={selectClassName}
                                value={selected.status}
                                onChange={(event) =>
                                    update({
                                        status: event.target
                                            .value as PartnerRequest['status'],
                                    })
                                }
                            >
                                {Object.entries(statusLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                        <div className="mt-5 flex flex-col gap-2">
                            <Label htmlFor="partner-notes">
                                Notes de suivi (enregistrement local
                                automatique)
                            </Label>
                            <textarea
                                id="partner-notes"
                                value={selected.notes}
                                maxLength={3000}
                                rows={4}
                                onChange={(event) =>
                                    update({ notes: event.target.value })
                                }
                                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                            />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
