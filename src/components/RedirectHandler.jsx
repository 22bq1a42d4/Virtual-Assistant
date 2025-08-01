import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Link,
  Chip
} from '@mui/material';
import {
  Launch as LaunchIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { getMapping, incrementClickCount } from '../utils/storage';
import { isExpired, formatDate } from '../utils/urlUtils';
import { logUrlAccess, logUserAction } from '../utils/loggerMiddleware';

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState(null);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortcode) {
        setError('No shortcode provided');
        setLoading(false);
        return;
      }

      try {
        logUserAction('Attempting to access short URL', { shortcode });

        // Get the mapping
        const urlMapping = getMapping(shortcode);
        
        if (!urlMapping) {
          setError('Short URL not found');
          logUrlAccess(shortcode, null, false);
          setLoading(false);
          return;
        }

        setMapping(urlMapping);

        // Check if expired
        if (isExpired(urlMapping.expiryDate)) {
          setError('This short URL has expired');
          logUrlAccess(shortcode, urlMapping.originalUrl, false);
          setLoading(false);
          return;
        }

        // Increment click count
        const incrementSuccess = incrementClickCount(shortcode);
        if (!incrementSuccess) {
          console.warn('Failed to increment click count');
        }

        logUrlAccess(shortcode, urlMapping.originalUrl, true);

        // Start redirect countdown
        setLoading(false);
        setRedirecting(true);

        // Countdown timer
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // Perform redirect
              window.location.href = urlMapping.originalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Cleanup timer if component unmounts
        return () => clearInterval(timer);

      } catch (err) {
        setError(`An error occurred: ${err.message}`);
        logUrlAccess(shortcode, null, false);
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortcode]);

  // Manual redirect function
  const handleManualRedirect = () => {
    if (mapping) {
      logUserAction('Manual redirect initiated', { shortcode });
      window.location.href = mapping.originalUrl;
    }
  };

  // Cancel redirect
  const handleCancelRedirect = () => {
    setRedirecting(false);
    setCountdown(0);
    logUserAction('Redirect cancelled', { shortcode });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">
          Processing short URL...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        px={3}
      >
        <Card elevation={3} sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            
            <Typography variant="h4" color="error" gutterBottom>
              URL Not Found
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>

            <Typography variant="body1" color="text.secondary" mb={3}>
              The short URL "/{shortcode}" could not be found or may have expired.
            </Typography>

            <Box display="flex" gap={2} justifyContent="center">
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.location.href = '/'}
              >
                Go to Homepage
              </Button>
              
              <Button 
                variant="outlined"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </Box>

            {mapping && isExpired(mapping.expiryDate) && (
              <Box mt={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Original URL (for reference)
                </Typography>
                <Link 
                  href={mapping.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {mapping.originalUrl}
                </Link>
                <Box mt={1}>
                  <Chip 
                    icon={<ScheduleIcon />}
                    label={`Expired on ${formatDate(mapping.expiryDate)}`}
                    color="error"
                    size="small"
                  />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (redirecting && mapping) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="50vh"
        px={3}
      >
        <Card elevation={3} sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            
            <Typography variant="h4" gutterBottom>
              Redirecting...
            </Typography>
            
            <Typography variant="h2" color="primary" sx={{ mb: 2 }}>
              {countdown}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" mb={3}>
              You will be redirected to the original URL in {countdown} second{countdown !== 1 ? 's' : ''}.
            </Typography>

            <Box mb={3} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Destination URL:
              </Typography>
              <Link 
                href={mapping.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  wordBreak: 'break-all',
                  fontSize: '0.9rem'
                }}
              >
                {mapping.originalUrl}
              </Link>
            </Box>

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<LaunchIcon />}
                onClick={handleManualRedirect}
              >
                Go Now
              </Button>
              
              <Button 
                variant="outlined"
                onClick={handleCancelRedirect}
              >
                Cancel
              </Button>

              <Button 
                variant="text"
                size="small"
                onClick={() => window.location.href = '/'}
              >
                Homepage
              </Button>
            </Box>

            <Box mt={3}>
              <Typography variant="caption" color="text.secondary">
                Short URL: /{shortcode} • Created: {formatDate(mapping.createdAt)}
                {mapping.expiryDate && ` • Expires: ${formatDate(mapping.expiryDate)}`}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Fallback - should not reach here under normal circumstances
  return <Navigate to="/" replace />;
};

export default RedirectHandler;