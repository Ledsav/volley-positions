import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

// renderToStaticMarkup does not run effects, so matchMedia/location are never touched.
// This exercises the full component tree + all derived domain calls for the default state.
describe('App', () => {
  it('renders the trainer without throwing', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Spike');
    expect(html).toContain('Rotation'); // rail rendered
    expect(html).toContain('viewBox="0 0 960 1180"'); // court + overlay svgs rendered
  });
});
