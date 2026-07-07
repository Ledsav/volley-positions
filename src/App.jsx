import Court from './components/court/Court.jsx';
import Rail from './components/rail/Rail.jsx';
import RuleReferenceModal from './components/RuleReferenceModal.jsx';
import { useIsMobile } from './hooks/useIsMobile.js';
import { useTrainer } from './hooks/useTrainer.js';

export default function App() {
  const { state, derived, actions, courtRef } = useTrainer();
  const isMobile = useIsMobile();
  return (
    <div style={{
      height: '100dvh', display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: isMobile ? 'nowrap' : 'wrap',
      overflow: isMobile ? 'hidden' : 'auto',
    }}>
      <Court state={state} derived={derived} actions={actions} courtRef={courtRef} isMobile={isMobile} />
      <Rail state={state} derived={derived} actions={actions} isMobile={isMobile} />
      {state.showRef && <RuleReferenceModal onClose={actions.toggleRef} />}
    </div>
  );
}

