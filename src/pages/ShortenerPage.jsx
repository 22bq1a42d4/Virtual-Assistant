import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Fade,
  Paper,
  Alert,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ShortenerForm from '../components/ShortenerForm';
import ShortenedURLCard from '../components/ShortenedURLCard';
import { getAllMappings, getStatistics } from '../utils/storage';
import { logUserAction } from '../utils/loggerMiddleware';

const ShortenerPage = () => {
  const [recentUrls, setRecentUrls] = useState([]);
  const [newlyCreatedUrls, setNewlyCreatedUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    loadData();
    logUserAction('Visited shortener page');
  }, []);

  // Load data from storage
  const loadData = () => {
    try {
      const mappings = getAllMappings();
      // Sort by creation date, newest first
      const sortedMappings = mappings.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentUrls(sortedMappings);
      setStats(getStatistics());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Handle new URLs created
  const handleUrlsCreated = (newUrls) => {
    setNewlyCreatedUrls(newUrls);
    loadData(); // Refresh all data
    logUserAction('URLs created successfully', { count: newUrls.length });
  };

  // Get URLs to display (recent + newly created)
  const getDisplayUrls = () => {
    const urlsToShow = showAll ? recentUrls : recentUrls.slice(0, 5);
    
    // If we have newly created URLs, show them first
    if (newlyCreatedUrls.length > 0) {
      const recentWithoutNew = urlsToShow.filter(url => 
        !newlyCreatedUrls.some(newUrl => newUrl.shortcode === url.shortcode)
      );
      return [...newlyCreatedUrls, ...recentWithoutNew];
    }
    
    return urlsToShow;
  };

  const displayUrls = getDisplayUrls();
  const hasMoreUrls = recentUrls.length > 5;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          URL Shortener
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          mb={3}
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Transform long URLs into short, shareable links with custom shortcodes and analytics
        </Typography>

        {/* Quick Stats */}
        {stats && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              maxWidth: 400, 
              mx: 'auto', 
              mb: 4,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <Grid container spacing={2} textAlign="center">
              <Grid item xs={4}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {stats.totalUrls}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total URLs
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {stats.activeUrls}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6" color="info.main" fontWeight="bold">
                  {stats.totalClicks}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Clicks
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Button
          variant="outlined"
          startIcon={<AnalyticsIcon />}
          onClick={() => navigate('/statistics')}
          size="large"
        >
          View Detailed Analytics
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - URL Shortener Form */}
        <Grid item xs={12} lg={6}>
          <ShortenerForm onUrlsCreated={handleUrlsCreated} />
        </Grid>

        {/* Right Column - Recent URLs */}
        <Grid item xs={12} lg={6}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h2">
                {newlyCreatedUrls.length > 0 ? 'Your New URLs' : 'Recent URLs'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
                size="small"
              >
                Refresh
              </Button>
            </Box>

            {displayUrls.length === 0 ? (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No URLs created yet
                </Typography>
                <Typography variant="body2">
                  Use the form on the left to create your first short URL!
                </Typography>
              </Paper>
            ) : (
              <Box>
                {/* Success message for newly created URLs */}
                {newlyCreatedUrls.length > 0 && (
                  <Fade in timeout={1000}>
                    <Alert 
                      severity="success" 
                      sx={{ mb: 3 }}
                      onClose={() => setNewlyCreatedUrls([])}
                    >
                      Successfully created {newlyCreatedUrls.length} short URL{newlyCreatedUrls.length > 1 ? 's' : ''}!
                    </Alert>
                  </Fade>
                )}

                {/* URL Cards */}
                {displayUrls.map((mapping, index) => (
                  <Fade 
                    key={mapping.shortcode} 
                    in 
                    timeout={500 + index * 100}
                  >
                    <Box>
                      <ShortenedURLCard 
                        mapping={mapping}
                        showFullUrl={false}
                      />
                    </Box>
                  </Fade>
                ))}

                {/* Show More/Less Button */}
                {hasMoreUrls && (
                  <Box textAlign="center" mt={2}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowAll(!showAll);
                        logUserAction(showAll ? 'Collapsed URL list' : 'Expanded URL list');
                      }}
                    >
                      {showAll 
                        ? `Show Less (${Math.min(5, recentUrls.length)} of ${recentUrls.length})`
                        : `Show All ${recentUrls.length} URLs`
                      }
                    </Button>
                  </Box>
                )}

                {recentUrls.length > 10 && (
                  <Box textAlign="center" mt={3}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Want to see detailed analytics and manage all your URLs?
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AnalyticsIcon />}
                      onClick={() => navigate('/statistics')}
                    >
                      Go to Statistics Page
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Feature Highlights */}
      <Box mt={8}>
        <Typography variant="h4" textAlign="center" mb={4}>
          Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Custom Shortcodes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create memorable, branded short URLs with your own custom shortcodes
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Expiry Dates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set validity periods for your URLs to automatically expire after a specified time
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Click Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track clicks and view detailed statistics for all your shortened URLs
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ShortenerPage;