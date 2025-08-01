import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
  Link as LinkIcon
} from '@mui/icons-material';

// Import pages and components
import ShortenerPage from './pages/ShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';

// Import logger for initialization
import logger from './utils/loggerMiddleware';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    secondary: {
      main: '#FFC107',
      light: '#FFE082',
      dark: '#FFA000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  // Don't show navigation for redirect routes
  if (location.pathname !== '/' && location.pathname !== '/statistics') {
    return null;
  }

  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <LinkIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ mr: 4 }}>
              URL Shortener
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<HomeIcon />}
              variant={location.pathname === '/' ? 'outlined' : 'text'}
              sx={{
                color: 'white',
                borderColor: location.pathname === '/' ? 'rgba(255,255,255,0.5)' : 'transparent'
              }}
            >
              Shortener
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/statistics"
              startIcon={<AnalyticsIcon />}
              variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
              sx={{
                color: 'white',
                borderColor: location.pathname === '/statistics' ? 'rgba(255,255,255,0.5)' : 'transparent'
              }}
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Footer component
const Footer = () => {
  const location = useLocation();
  
  // Don't show footer for redirect routes
  if (location.pathname !== '/' && location.pathname !== '/statistics') {
    return null;
  }

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto', 
        py: 3, 
        px: 2, 
        backgroundColor: 'primary.main',
        color: 'white',
        textAlign: 'center'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2">
          © 2024 URL Shortener - A client-side React application with Material UI
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
          All data is stored locally in your browser. No external servers are used.
        </Typography>
      </Container>
    </Box>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error
    logger.error('SYSTEM', 'Application error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h4" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                onClick={() => window.location.reload()}
                sx={{ mr: 2 }}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>
            </Box>
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 4, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </Box>
            )}
          </Container>
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

// Main App component
function App() {
  // Initialize logger on app start
  React.useEffect(() => {
    logger.info('SYSTEM', 'Application started', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname
    });

    // Log when user is about to leave
    const handleBeforeUnload = () => {
      logger.info('SYSTEM', 'Application closing');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh' 
            }}
          >
            <Navigation />
            
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Main shortener page */}
                <Route path="/" element={<ShortenerPage />} />
                
                {/* Statistics page */}
                <Route path="/statistics" element={<StatisticsPage />} />
                
                {/* Redirect handler for short URLs */}
                <Route path="/:shortcode" element={<RedirectHandler />} />
              </Routes>
            </Box>

            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;