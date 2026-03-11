import MorningBrief from '../components/panels/MorningBrief';
import PricePanel from '../components/panels/PricePanel';
import KeyLevels from '../components/panels/KeyLevels';
import NewsPanel from '../components/panels/NewsPanel';
import CalendarPanel from '../components/panels/CalendarPanel';
import AlertsPanel from '../components/panels/AlertsPanel';
import TradesPanel from '../components/panels/TradesPanel';
import ThreeQuestions from '../components/panels/ThreeQuestions';

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Three Questions Frame */}
      <ThreeQuestions />

      {/* Row 1: 3 equal columns */}
      <div className="grid gap-5 md:grid-cols-3">
        <MorningBrief />
        <PricePanel />
        <KeyLevels />
      </div>

      {/* Row 2: 2/3 + 1/3 */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2">
          <NewsPanel />
        </div>
        <CalendarPanel />
      </div>

      {/* Row 3: 1/3 + 2/3 */}
      <div className="grid gap-5 md:grid-cols-3">
        <AlertsPanel />
        <div className="md:col-span-2">
          <TradesPanel />
        </div>
      </div>
    </div>
  );
}
