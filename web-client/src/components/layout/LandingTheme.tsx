// theme.js o dove hai definito il tuo tema
import { createTheme } from '@mantine/core';

const theme = createTheme({
  colors: {
    'oklch-green': [
      'oklch(96.27% 0.0217 120)', // Lightest
      'oklch(92.66% 0.0429 120)',
      'oklch(86.02% 0.0827 120)',
      'oklch(78.2% 0.13 120)',
      'oklch(71.8% 0.1686 120)',
      'oklch(66.89% 0.1986 120)',
      'oklch(62.59% 0.2247 120)',
      'oklch(58.56% 0.2209 120)',
      'oklch(54.26% 0.2067 120)',
      'oklch(49.72% 0.1888 120)', // Darkest
    ],
  },
});

export default theme;
