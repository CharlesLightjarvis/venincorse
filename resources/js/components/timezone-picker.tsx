import { Form } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    timezoneIdentifiers,
    useBrowserTimezone,
} from '@/hooks/use-browser-timezone';
import { update } from '@/routes/user-timezone';

export default function TimezonePicker({
    timezone,
}: {
    timezone: string | null;
}) {
    const [selected, setSelected] = useState(timezone ?? '');
    const detected = useBrowserTimezone();
    const options = timezoneIdentifiers(timezone);

    return (
        <section className="flex flex-col gap-5">
            <Heading
                variant="small"
                title="Fuseau horaire"
                description="Choisis le fuseau utilisé pour les horaires de réservation. Laisse le champ vide pour suivre automatiquement celui de ton navigateur, sans enregistrer cette information dans ton profil."
            />
            <Form
                {...update.form()}
                options={{ preserveScroll: true }}
                className="flex flex-col gap-4"
            >
                {({ processing, errors, recentlySuccessful }) => (
                    <>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="profile-timezone">
                                Ton fuseau horaire
                            </Label>
                            <Input
                                id="profile-timezone"
                                name="timezone"
                                list="profile-timezones"
                                value={selected}
                                onChange={(event) =>
                                    setSelected(event.target.value)
                                }
                                placeholder={`Automatique · ${detected}`}
                                aria-invalid={Boolean(errors.timezone)}
                                aria-describedby="timezone-help"
                                autoComplete="off"
                            />
                            <datalist id="profile-timezones">
                                {options.map((zone) => (
                                    <option key={zone} value={zone} />
                                ))}
                            </datalist>
                            <p
                                id="timezone-help"
                                className="text-sm text-muted-foreground"
                            >
                                Fuseau détecté dans ce navigateur : {detected}.
                            </p>
                            <InputError message={errors.timezone} />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelected(detected)}
                            >
                                Utiliser {detected}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setSelected('')}
                            >
                                Revenir à la détection automatique
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={
                                    processing || selected === (timezone ?? '')
                                }
                            >
                                Enregistrer le fuseau
                            </Button>
                            {recentlySuccessful && (
                                <p
                                    role="status"
                                    className="text-sm text-primary"
                                >
                                    Fuseau enregistré.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}
