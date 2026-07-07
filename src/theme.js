// Design tokens for the sandy-court aesthetic. Pure,  safe to import anywhere.
export const COLORS = {
  background: '#58ADCD;',  // sky / background
  court: '#B98A52',       // outer surround / attack-line base
  courtBack: '#C79758',   // front-zone strip
  courtFront: '#D8A968',  // main court fill
  cream: '#F6F1E6',       // court lines, light tokens
  ink: '#221B12',         // primary text / dark tokens
  navy: '#24406B',        // team color / serve button
  red: '#D7402B',         // faults
  green: '#3E6B4F',       // success
};

export const FONTS = {
  display: "'Saira Condensed', sans-serif",
  body: "'IBM Plex Sans', sans-serif",
};

// Height of the slim mobile control bar (rotation, mode, serve) pinned under the court.
export const MOBILE_BAR_HEIGHT = 60;

// Below this viewport width the app switches from the side rail to the stacked
// court + bottom bar layout described in the design plan.
export const MOBILE_BREAKPOINT = 720;
