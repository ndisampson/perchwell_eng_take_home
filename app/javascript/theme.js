import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Green color
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#fff',
      highlight: '#dfe',
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          color: '#4caf50',
          '&:hover': {
            color: '#388e3c',
          },
          '&:visited': {
            color: '#4caf50',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#81c784', // light green
            backgroundColor: '#dfe', // highlight
          },
        },
      },
    },
  },
});

export default theme;

