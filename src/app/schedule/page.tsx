import { getSchedule } from '@/lib/data';
import { ScheduleList } from '@/components/schedule/ScheduleList';
import { PageHeader } from '@/components/ui/PageHeader';

export const revalidate = 3600;

export default function SchedulePage() {
  const schedule = getSchedule();

  const past = schedule.filter((g) => g.status === 'final').reverse();
  const upcoming = schedule.filter((g) => g.status === 'scheduled');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader title="Schedule" subtitle="2025–26 Season" />

      {schedule.length === 0 && (
        <div className="text-center py-20 text-swarm-muted">
          Schedule not yet loaded. Run the data fetch script.
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <ScheduleList games={upcoming} />
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-swarm-muted text-xs font-medium uppercase tracking-wider mb-3">
            Results ({past.length})
          </h2>
          <ScheduleList games={past} />
        </section>
      )}
    </div>
  );
}
