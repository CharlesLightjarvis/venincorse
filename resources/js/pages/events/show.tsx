import { EventDetail } from './partials/event-detail';

export default function EventShowPage({ eventId }: { eventId: number }) {
    return <EventDetail eventId={eventId} />;
}
