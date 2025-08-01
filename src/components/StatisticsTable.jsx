import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Link,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { formatDate, isExpired, generateShortURL } from '../utils/urlUtils';
import { deleteMapping, cleanupExpiredUrls } from '../utils/storage';
import { logUserAction } from '../utils/loggerMiddleware';

const StatisticsTable = ({ mappings, onDataChange }) => {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copySuccess, setCopySuccess] = useState('');

  // Sorting configuration
  const headCells = [
    { id: 'shortcode', label: 'Shortcode', sortable: true },
    { id: 'originalUrl', label: 'Original URL', sortable: true },
    { id: 'shortUrl', label: 'Short URL', sortable: false },
    { id: 'clickCount', label: 'Clicks', sortable: true },
    { id: 'createdAt', label: 'Created', sortable: true },
    { id: 'expiryDate', label: 'Expires', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false }
  ];

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    logUserAction('Sorted statistics table', { property, order: isAsc ? 'desc' : 'asc' });
  };

  // Copy to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
      logUserAction('Copied from statistics table', { type });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Delete mapping
  const handleDelete = (shortcode) => {
    if (window.confirm('Are you sure you want to delete this short URL?')) {
      if (deleteMapping(shortcode)) {
        onDataChange?.();
        logUserAction('Deleted URL mapping', { shortcode });
      }
    }
  };

  // Cleanup expired URLs
  const handleCleanup = () => {
    const removedCount = cleanupExpiredUrls();
    if (removedCount > 0) {
      onDataChange?.();
      logUserAction('Cleaned up expired URLs', { removedCount });
    }
  };

  // Get status info
  const getStatusInfo = (mapping) => {
    const expired = isExpired(mapping.expiryDate);
    if (expired) {
      return { label: 'Expired', color: 'error' };
    } else if (mapping.expiryDate) {
      return { label: 'Active (Expires)', color: 'warning' };
    } else {
      return { label: 'Active (Permanent)', color: 'success' };
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = mappings.filter(mapping => {
      // Search filter
      const searchMatch = !searchTerm || 
        mapping.shortcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let statusMatch = true;
      if (statusFilter === 'active') {
        statusMatch = !isExpired(mapping.expiryDate);
      } else if (statusFilter === 'expired') {
        statusMatch = isExpired(mapping.expiryDate);
      } else if (statusFilter === 'permanent') {
        statusMatch = !mapping.expiryDate;
      } else if (statusFilter === 'expiring') {
        statusMatch = mapping.expiryDate && !isExpired(mapping.expiryDate);
      }

      return searchMatch && statusMatch;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle special cases
      if (orderBy === 'status') {
        aValue = isExpired(a.expiryDate) ? 'expired' : 'active';
        bValue = isExpired(b.expiryDate) ? 'expired' : 'active';
      } else if (orderBy === 'createdAt' || orderBy === 'expiryDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [mappings, searchTerm, statusFilter, order, orderBy]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: mappings.length,
      active: mappings.filter(m => !isExpired(m.expiryDate)).length,
      expired: mappings.filter(m => isExpired(m.expiryDate)).length,
      totalClicks: mappings.reduce((sum, m) => sum + m.clickCount, 0)
    };
  }, [mappings]);

  if (mappings.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No shortened URLs yet
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Create your first short URL using the form above!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3}>
      {/* Header with stats and controls */}
      <Box p={3} borderBottom={1} borderColor="divider">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">URL Statistics</Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => onDataChange?.()}
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {/* Summary stats */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Chip 
            label={`Total: ${stats.total}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Active: ${stats.active}`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`Expired: ${stats.expired}`} 
            color="error" 
            variant="outlined" 
          />
          <Chip 
            label={`Total Clicks: ${stats.totalClicks}`} 
            color="info" 
            variant="outlined" 
          />
        </Box>

        {/* Filters */}
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search URLs or shortcodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="all">All URLs</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="permanent">Permanent</MenuItem>
              <MenuItem value="expiring">Expiring</MenuItem>
            </Select>
          </FormControl>

          {stats.expired > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleCleanup}
              startIcon={<DeleteIcon />}
            >
              Cleanup Expired ({stats.expired})
            </Button>
          )}
        </Box>

        {filteredAndSortedData.length !== mappings.length && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Showing {filteredAndSortedData.length} of {mappings.length} URLs
          </Alert>
        )}
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id}>
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData.map((mapping) => {
              const shortUrl = generateShortURL(mapping.shortcode);
              const statusInfo = getStatusInfo(mapping);
              const expired = isExpired(mapping.expiryDate);
              
              return (
                <TableRow 
                  key={mapping.shortcode}
                  sx={{ 
                    backgroundColor: expired ? 'error.light' : 'inherit',
                    opacity: expired ? 0.7 : 1
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {mapping.shortcode}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={mapping.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        maxWidth: 300,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {mapping.originalUrl}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Link
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 'bold' }}
                    >
                      {shortUrl}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {mapping.clickCount}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(mapping.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(mapping.expiryDate)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="Copy short URL">
                        <IconButton 
                          size="small"
                          onClick={() => copyToClipboard(shortUrl, mapping.shortcode)}
                          color={copySuccess === mapping.shortcode ? 'success' : 'default'}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Open short URL">
                        <IconButton 
                          size="small"
                          onClick={() => window.open(shortUrl, '_blank')}
                          color="primary"
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(mapping.shortcode)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredAndSortedData.length === 0 && mappings.length > 0 && (
        <Box p={3} textAlign="center">
          <Typography variant="body1" color="text.secondary">
            No URLs match your current filters
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StatisticsTable;