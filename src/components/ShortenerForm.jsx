import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { 
  isValidURL, 
  isValidShortcode, 
  isValidPeriod, 
  normalizeURL,
  calculateExpiryDate 
} from '../utils/urlUtils';
import { createMultipleMappings } from '../utils/storage';
import { logUserAction, logValidationError } from '../utils/loggerMiddleware';

const ShortenerForm = ({ onUrlsCreated }) => {
  const [urls, setUrls] = useState([{ url: '', shortcode: '', validityPeriod: '' }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Add a new URL input
  const addUrlInput = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', shortcode: '', validityPeriod: '' }]);
      logUserAction('Added URL input field', { totalFields: urls.length + 1 });
    }
  };

  // Remove a URL input
  const removeUrlInput = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      
      // Clear errors for removed field
      const newErrors = { ...errors };
      delete newErrors[index];
      // Reindex remaining errors
      const reindexedErrors = {};
      Object.keys(newErrors).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexedErrors[numKey - 1] = newErrors[key];
        } else if (numKey < index) {
          reindexedErrors[numKey] = newErrors[key];
        }
      });
      setErrors(reindexedErrors);
      
      logUserAction('Removed URL input field', { 
        index, 
        totalFields: newUrls.length 
      });
    }
  };

  // Update URL input
  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);

    // Clear specific field error
    if (errors[index] && errors[index][field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      if (Object.keys(newErrors[index] || {}).length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  // Validate all inputs
  const validateInputs = () => {
    const newErrors = {};
    let hasErrors = false;

    urls.forEach((urlData, index) => {
      const urlErrors = {};

      // Validate URL
      if (!urlData.url.trim()) {
        urlErrors.url = 'URL is required';
        hasErrors = true;
      } else if (!isValidURL(urlData.url)) {
        urlErrors.url = 'Please enter a valid URL';
        hasErrors = true;
        logValidationError('url', urlData.url, 'Invalid URL format');
      }

      // Validate custom shortcode if provided
      if (urlData.shortcode && !isValidShortcode(urlData.shortcode)) {
        urlErrors.shortcode = 'Shortcode must be 3-20 alphanumeric characters';
        hasErrors = true;
        logValidationError('shortcode', urlData.shortcode, 'Invalid shortcode format');
      }

      // Validate validity period if provided
      if (urlData.validityPeriod && !isValidPeriod(urlData.validityPeriod)) {
        urlErrors.validityPeriod = 'Please enter a valid number of hours (1-8760)';
        hasErrors = true;
        logValidationError('validityPeriod', urlData.validityPeriod, 'Invalid validity period');
      }

      if (Object.keys(urlErrors).length > 0) {
        newErrors[index] = urlErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    logUserAction('Started URL shortening process', {
      urlCount: urls.filter(u => u.url.trim()).length
    });

    // Validate inputs
    if (!validateInputs()) {
      setLoading(false);
      setErrorMessage('Please fix the validation errors and try again.');
      return;
    }

    try {
      // Prepare data for creation
      const urlData = urls
        .filter(urlInput => urlInput.url.trim())
        .map(urlInput => ({
          url: normalizeURL(urlInput.url.trim()),
          shortcode: urlInput.shortcode.trim() || null,
          expiryDate: urlInput.validityPeriod 
            ? calculateExpiryDate(parseInt(urlInput.validityPeriod))
            : null
        }));

      // Create mappings
      const { results, errors: creationErrors } = createMultipleMappings(urlData);

      if (creationErrors.length > 0) {
        // Handle partial failures
        const errorMessages = creationErrors.map(err => 
          `URL ${err.index + 1}: ${err.error}`
        ).join('\n');
        setErrorMessage(`Some URLs could not be processed:\n${errorMessages}`);
        
        if (results.length > 0) {
          setSuccessMessage(`${results.length} URL(s) successfully shortened!`);
          onUrlsCreated?.(results);
        }
      } else {
        // All successful
        setSuccessMessage(`All ${results.length} URL(s) successfully shortened!`);
        onUrlsCreated?.(results);
        
        // Reset form
        setUrls([{ url: '', shortcode: '', validityPeriod: '' }]);
      }

      logUserAction('Completed URL shortening process', {
        successCount: results.length,
        errorCount: creationErrors.length
      });

    } catch (error) {
      setErrorMessage(`An error occurred: ${error.message}`);
      logUserAction('URL shortening failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Clear all inputs
  const clearAll = () => {
    setUrls([{ url: '', shortcode: '', validityPeriod: '' }]);
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    logUserAction('Cleared all form inputs');
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={3}>
          <LinkIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1">
            URL Shortener
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Enter up to 5 URLs to shorten. You can optionally specify custom shortcodes and validity periods.
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{errorMessage}</pre>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {urls.map((urlData, index) => (
            <Card 
              key={index} 
              variant="outlined" 
              sx={{ mb: 2, backgroundColor: 'grey.50' }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                  <Typography variant="h6" color="primary">
                    URL #{index + 1}
                  </Typography>
                  <Box>
                    {urls.length > 1 && (
                      <Tooltip title="Remove this URL">
                        <IconButton 
                          onClick={() => removeUrlInput(index)}
                          size="small"
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL to shorten"
                      placeholder="https://example.com/very-long-url"
                      value={urlData.url}
                      onChange={(e) => updateUrl(index, 'url', e.target.value)}
                      error={!!errors[index]?.url}
                      helperText={errors[index]?.url}
                      variant="outlined"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Custom shortcode (optional)"
                      placeholder="mylink123"
                      value={urlData.shortcode}
                      onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                      error={!!errors[index]?.shortcode}
                      helperText={errors[index]?.shortcode || "3-20 alphanumeric characters"}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Validity period (hours)"
                      placeholder="24"
                      type="number"
                      value={urlData.validityPeriod}
                      onChange={(e) => updateUrl(index, 'validityPeriod', e.target.value)}
                      error={!!errors[index]?.validityPeriod}
                      helperText={errors[index]?.validityPeriod || "Leave empty for no expiry"}
                      variant="outlined"
                      inputProps={{ min: 1, max: 8760 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Box display="flex" gap={1}>
              {urls.length < 5 && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addUrlInput}
                  size="small"
                >
                  Add URL
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearAll}
                size="small"
                color="secondary"
              >
                Clear All
              </Button>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Chip 
                label={`${urls.filter(u => u.url.trim()).length} of 5 URLs`}
                color="primary"
                variant="outlined"
                size="small"
              />
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || urls.every(u => !u.url.trim())}
                startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
              >
                {loading ? 'Shortening...' : 'Shorten URLs'}
              </Button>
            </Box>
          </Box>
        </form>

        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              Need help? View usage guidelines
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              <strong>URL Requirements:</strong><br />
              • Must be a valid web URL (http:// or https://)<br />
              • Example: https://example.com/page<br /><br />
              
              <strong>Custom Shortcodes:</strong><br />
              • 3-20 characters, letters and numbers only<br />
              • Must be unique (not already in use)<br />
              • Example: mylink123<br /><br />
              
              <strong>Validity Period:</strong><br />
              • Number of hours until the short URL expires<br />
              • Maximum: 8760 hours (1 year)<br />
              • Leave empty for permanent links
            </Typography>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ShortenerForm;