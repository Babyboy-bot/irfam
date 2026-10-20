import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { irfamColors } from '../theme';

export default function SearchBar({ value, onChange, placeholder = "Rechercher..." }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ color: irfamColors.primary.main }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          bgcolor: irfamColors.neutral.white,
          '&:hover fieldset': {
            borderColor: irfamColors.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: irfamColors.primary.main,
          },
        },
      }}
    />
  );
}
