import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { irfamColors } from '../theme';

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirmer l'action", 
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  danger = false,
}) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: danger ? `2px solid #D32F2F` : `2px solid ${irfamColors.primary.main}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        color: danger ? '#D32F2F' : irfamColors.primary.main,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        {danger && <Warning sx={{ color: '#D32F2F' }} />}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: irfamColors.border.main,
            color: irfamColors.text.primary,
            '&:hover': {
              borderColor: irfamColors.primary.main,
              bgcolor: irfamColors.background.brown,
            }
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            borderRadius: 2,
            bgcolor: danger ? '#D32F2F' : irfamColors.primary.main,
            '&:hover': {
              bgcolor: danger ? '#B71C1C' : irfamColors.primary.dark,
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
