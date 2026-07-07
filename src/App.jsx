import Court from './components/court/Court.jsx';
import Rail from './components/rail/Rail.jsx';
import RuleReferenceModal from './components/RuleReferenceModal.jsx';
import { useTrainer } from './hooks/useTrainer.js';

export default function App() {
  const { state, derived, actions, courtRef } = useTrainer();
  return (
    <div style={{ height: '100dvh', display: 'flex', flexWrap: 'wrap', overflow: 'auto' }}>
      <Court state={state} derived={derived} actions={actions} courtRef={courtRef} />
      <Rail state={state} derived={derived} actions={actions} />
      {state.showRef && <RuleReferenceModal onClose={actions.toggleRef} />}
    </div>
  );
}

