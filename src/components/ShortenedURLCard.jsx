import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Link,
  Snackbar,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { formatDate, isExpired, generateShortURL } from '../utils/urlUtils';
import { logUserAction } from '../utils/loggerMiddleware';

const ShortenedURLCard = ({ mapping, showFullUrl = false }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyField, setCopyField] = useState('');

  if (!mapping) return null;

  const shortUrl = generateShortURL(mapping.shortcode);
  const expired = isExpired(mapping.expiryDate);
  const hasExpiry = mapping.expiryDate !== null;

  // Copy to clipboard function
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setCopyField(fieldName);
      logUserAction('Copied to clipboard', { field: fieldName, shortcode: mapping.shortcode });
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
        setCopyField('');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopySuccess(true);
      setCopyField(fieldName);
      setTimeout(() => {
        setCopySuccess(false);
        setCopyField('');
      }, 2000);
    }
  };

  // Open URL in new tab
  const openUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    logUserAction('Opened URL', { url, shortcode: mapping.shortcode });
  };

  // Truncate long URLs for display
  const truncateUrl = (url, maxLength = 60) => {
    if (showFullUrl || url.length <= maxLength) return url;
    return `${url.substring(0, maxLength)}...`;
  };

  return (
    <>
      <Card 
        elevation={2} 
        sx={{ 
          mb: 2,
          border: expired ? '2px solid #f44336' : '1px solid #e0e0e0',
          backgroundColor: expired ? '#ffebee' : 'white'
        }}
      >
        <CardContent>
          {/* Header with status */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <LinkIcon color="primary" />
              <Typography variant="h6" color="primary">
                Short URL Created
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              {expired && (
                <Chip 
                  label="EXPIRED" 
                  color="error" 
                  size="small"
                  icon={<ScheduleIcon />}
                />
              )}
              {hasExpiry && !expired && (
                <Chip 
                  label="EXPIRES" 
                  color="warning" 
                  size="small"
                  icon={<ScheduleIcon />}
                />
              )}
              {!hasExpiry && (
                <Chip 
                  label="PERMANENT" 
                  color="success" 
                  size="small"
                />
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Original URL */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Original URL
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Link
                    href={mapping.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      flexGrow: 1, 
                      wordBreak: 'break-all',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <Typography variant="body2">
                      {truncateUrl(mapping.originalUrl)}
                    </Typography>
                  </Link>
                  
                  <Tooltip title="Copy original URL">
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(mapping.originalUrl, 'original')}
                      color={copySuccess && copyField === 'original' ? 'success' : 'default'}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Open original URL">
                    <IconButton 
                      size="small" 
                      onClick={() => openUrl(mapping.originalUrl)}
                      color="primary"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Short URL */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Short URL
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Link
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      flexGrow: 1,
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {shortUrl}
                  </Link>
                  
                  <Tooltip title="Copy short URL">
                    <IconButton 
                      size="small" 
                      onClick={() => copyToClipboard(shortUrl, 'short')}
                      color={copySuccess && copyField === 'short' ? 'success' : 'primary'}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Open short URL">
                    <IconButton 
                      size="small" 
                      onClick={() => openUrl(shortUrl)}
                      color="primary"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>

            {/* Metadata */}
            <Grid item xs={12}>
              <Box display="flex" justify="space-between" alignItems="center" mt={2}>
                <Box display="flex" gap={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Shortcode
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {mapping.shortcode}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(mapping.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Clicks
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {mapping.clickCount}
                    </Typography>
                  </Box>
                </Box>

                {hasExpiry && (
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      {expired ? 'Expired' : 'Expires'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={expired ? 'error' : 'warning.main'}
                      fontWeight="bold"
                    >
                      {formatDate(mapping.expiryDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {expired && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This short URL has expired and will no longer redirect to the original URL.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Copy success notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySuccess(false)} 
          severity="success" 
          variant="filled"
        >
          {copyField === 'short' ? 'Short URL' : 'Original URL'} copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShortenedURLCard;