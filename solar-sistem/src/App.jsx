import SolarSystem from './SolarSystem';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Opcional: tema escuro
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SolarSystem />
    </ThemeProvider>
  );
}