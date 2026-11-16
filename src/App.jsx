import { SessionProvider, useSession } from './context/SessionContext';
import SessionList from './components/SessionList';
import RecordingPanel from './components/recording/RecordingPanel';
import ReviewView from './components/review/ReviewView';

function AppContent() {
  const { view } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <p className="max-w-4xl mx-auto mb-6 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
        This demo runs entirely in your browser. Recordings and photos are saved only on this device and are never uploaded.
        Speech-to-text is not included in this version.
      </p>
      {view === 'home' && <SessionList />}
      {view === 'record' && <RecordingPanel />}
      {view === 'review' && <ReviewView />}
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
