import { CourseSchedule } from '@/components/course-schedule';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCourseMoney } from '@/data/course-booking';
import {
    examProviderLabels,
    examScopeLabels,
    examPaceLabels,
    type ExamEnrollment,
} from '@/data/exam-booking';
import { tierLabels } from '@/data/offer';

export function ExamBookingDetails({ booking }: { booking: ExamEnrollment }) {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-2xl font-semibold">
                    {examProviderLabels[booking.provider]}{' '}
                    {booking.level.toUpperCase()}
                </h2>
                <p className="mt-2 font-medium">
                    {examScopeLabels[booking.scope]}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {tierLabels[booking.tier]} · {examPaceLabels[booking.pace]}
                </p>
            </div>
            <p className="text-sm break-words">
                {booking.name}
                <br />
                {booking.email}
                <br />
                Objectif : {booking.goal}
            </p>
            {booking.examDate && (
                <p className="text-sm">
                    Date visée pour l’examen officiel : {booking.examDate}{' '}
                    (inscription non incluse)
                </p>
            )}
            <div>
                <p className="text-lg font-semibold">
                    Total : {formatCourseMoney(booking.totalCents)}
                </p>
                <ol className="mt-3 flex flex-col gap-2 text-sm">
                    {booking.paymentsCents.map((amount, index) => (
                        <li key={index}>
                            Échéance {index + 1} ·{' '}
                            {index === 0
                                ? 'à la réservation'
                                : `à J+${index * 30}`}{' '}
                            : {formatCourseMoney(amount)} (
                            {booking.status === 'cancelled'
                                ? index === 0
                                    ? 'remboursement simulé'
                                    : 'annulée'
                                : index === 0
                                  ? 'paiement simulé'
                                  : 'prévue, aucun prélèvement réel'}
                            )
                        </li>
                    ))}
                </ol>
            </div>
            <Alert>
                <AlertDescription>
                    Réservation de préparation uniquement. L’inscription au
                    certificat officiel reste à effectuer auprès du centre. Les
                    séances se tiendront sur Google Meet ; aucun lien réel n’est
                    créé ici.
                </AlertDescription>
            </Alert>
            <CourseSchedule
                sessions={booking.cohort.sessions}
                timezone={booking.timezone}
            />
            <p className="text-xs break-all text-muted-foreground">
                Référence démo : {booking.id}
            </p>
        </div>
    );
}
