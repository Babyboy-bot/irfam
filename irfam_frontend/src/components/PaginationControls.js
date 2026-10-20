import React from 'react';
import { Box, IconButton, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { ChevronLeft, ChevronRight, FirstPage, LastPage } from '@mui/icons-material';
import { irfamColors } from '../theme';

export default function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mt: 3,
      p: 2,
      borderRadius: 2,
      bgcolor: irfamColors.background.brownLight,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Lignes par page :
        </Typography>
        <FormControl size="small">
          <Select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(e.target.value)}
            sx={{
              borderRadius: 2,
              bgcolor: irfamColors.neutral.white,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: irfamColors.border.light,
              },
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          {startItem}-{endItem} sur {totalItems}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          size="small"
          sx={{
            color: irfamColors.primary.main,
            '&:disabled': { color: irfamColors.text.disabled },
          }}
        >
          <FirstPage />
        </IconButton>
        <IconButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          size="small"
          sx={{
            color: irfamColors.primary.main,
            '&:disabled': { color: irfamColors.text.disabled },
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Typography variant="body2" fontWeight={600} sx={{ mx: 2 }}>
          Page {currentPage} sur {totalPages}
        </Typography>

        <IconButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          size="small"
          sx={{
            color: irfamColors.primary.main,
            '&:disabled': { color: irfamColors.text.disabled },
          }}
        >
          <ChevronRight />
        </IconButton>
        <IconButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          size="small"
          sx={{
            color: irfamColors.primary.main,
            '&:disabled': { color: irfamColors.text.disabled },
          }}
        >
          <LastPage />
        </IconButton>
      </Box>
    </Box>
  );
}
