import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CleaningServices as CleaningServicesIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatisticsTable from '../components/StatisticsTable';
import { 
  getAllMappings, 
  getStatistics, 
  cleanupExpiredUrls, 
  clearAllData 
} from '../utils/storage';
import { isExpired, formatDate } from '../utils/urlUtils';
import { logUserAction } from '../utils/loggerMiddleware';

const StatisticsPage = () => {
  const [mappings, setMappings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    logUserAction('Visited statistics page');
  }, []);

  // Load data from storage
  const loadData = async () => {
    try {
      setLoading(true);
      const allMappings = getAllMappings();
      setMappings(allMappings);
      setStats(getStatistics());
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    logUserAction('Refreshed statistics data');
  };

  // Cleanup expired URLs
  const handleCleanup = () => {
    if (window.confirm('Are you sure you want to delete all expired URLs? This action cannot be undone.')) {
      const removedCount = cleanupExpiredUrls();
      loadData();
      logUserAction('Cleaned up expired URLs', { removedCount });
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL URLs? This action cannot be undone and will remove all your data.')) {
      if (window.confirm('This will permanently delete all your shortened URLs and statistics. Are you absolutely sure?')) {
        clearAllData();
        loadData();
        logUserAction('Cleared all data');
      }
    }
  };

  // Export data as JSON
  const handleExport = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      statistics: stats,
      urls: mappings.map(mapping => ({
        ...mapping,
        shortUrl: `${window.location.origin}/${mapping.shortcode}`,
        status: isExpired(mapping.expiryDate) ? 'expired' : 'active'
      }))
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `url-shortener-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logUserAction('Exported data', { urlCount: mappings.length });
  };

  // Calculate additional statistics
  const getAdvancedStats = () => {
    if (!mappings.length) return null;

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentUrls = mappings.filter(m => new Date(m.createdAt) > last30Days);
    const veryRecentUrls = mappings.filter(m => new Date(m.createdAt) > last7Days);
    
    const mostClicked = mappings.reduce((prev, current) => 
      (prev.clickCount > current.clickCount) ? prev : current, mappings[0]
    );

    const averageClicks = mappings.length > 0 
      ? (mappings.reduce((sum, m) => sum + m.clickCount, 0) / mappings.length).toFixed(2)
      : 0;

    return {
      recentUrls: recentUrls.length,
      veryRecentUrls: veryRecentUrls.length,
      mostClicked,
      averageClicks,
      customShortcodes: mappings.filter(m => m.shortcode.length > 6).length,
      withExpiry: mappings.filter(m => m.expiryDate).length
    };
  };

  const advancedStats = getAdvancedStats();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back to Shortener
          </Button>
          <Typography variant="h4">URL Statistics</Typography>
        </Box>
        <LinearProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back to Shortener
          </Button>
          <Typography variant="h4" component="h1">
            URL Statistics & Analytics
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          {mappings.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              size="small"
            >
              Export Data
            </Button>
          )}
        </Box>
      </Box>

      {mappings.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No URL data available
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Create some short URLs first to see statistics and analytics here.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            size="large"
          >
            Create Your First Short URL
          </Button>
        </Paper>
      ) : (
        <>
          {/* Summary Statistics Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {stats?.totalUrls || 0}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total URLs
                  </Typography>
                  {advancedStats && (
                    <Typography variant="caption" color="text.secondary">
                      {advancedStats.veryRecentUrls} created in last 7 days
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {stats?.totalClicks || 0}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Clicks
                  </Typography>
                  {advancedStats && (
                    <Typography variant="caption" color="text.secondary">
                      Avg: {advancedStats.averageClicks} clicks per URL
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {stats?.activeUrls || 0}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Active URLs
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {((stats?.activeUrls || 0) / (stats?.totalUrls || 1) * 100).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {stats?.expiredUrls || 0}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Expired URLs
                  </Typography>
                  {stats?.expiredUrls > 0 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={handleCleanup}
                      sx={{ mt: 1 }}
                    >
                      Cleanup
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Additional Insights */}
          {advancedStats && (
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip 
                        label={`${advancedStats.recentUrls} URLs created (30 days)`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip 
                        label={`${advancedStats.customShortcodes} custom shortcodes`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip 
                        label={`${advancedStats.withExpiry} URLs with expiry`}
                        color="warning"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top Performer
                    </Typography>
                    {advancedStats.mostClicked && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Most clicked URL:
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          /{advancedStats.mostClicked.shortcode}
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {advancedStats.mostClicked.clickCount} clicks
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Data Management Actions */}
          <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Data Management
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              {stats?.expiredUrls > 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<CleaningServicesIcon />}
                  onClick={handleCleanup}
                  size="small"
                >
                  Cleanup {stats.expiredUrls} Expired URLs
                </Button>
              )}
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
                size="small"
              >
                Clear All Data
              </Button>
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> All data is stored locally in your browser. 
                Clearing browser data or using incognito mode will result in data loss. 
                Use the export feature to backup your data.
              </Typography>
            </Alert>
          </Paper>

          {/* Statistics Table */}
          <StatisticsTable 
            mappings={mappings} 
            onDataChange={loadData}
          />
        </>
      )}
    </Container>
  );
};

export default StatisticsPage;