import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AttachMoney,
  MoneyOff,
  Category,
  Assessment,
  Person,
  Logout,
  ChevronLeft,
  People,
  CardGiftcard,
  Store,
  AccountBalance,
  Inventory,
  Work,
} from '@mui/icons-material';
import { irfamColors, gradients, shadows } from '../theme';

const drawerWidth = 260;

export default function Layout({ children, currentPage, onNavigate, onLogout, username, alerts = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'Pensionnaires', icon: <People />, page: 'pensionnaires' },
    { text: 'Personnel', icon: <Work />, page: 'personnel' },
    { text: 'Ressources', icon: <AttachMoney />, page: 'ressources' },
    { text: 'Dépenses', icon: <MoneyOff />, page: 'depenses' },
    { text: 'Budgets', icon: <AccountBalance />, page: 'budgets', alertKey: 'budgets' },
    { text: 'Donateurs', icon: <CardGiftcard />, page: 'donateurs' },
    // Fournisseurs supprimé - Module non nécessaire
    { text: 'Inventaire', icon: <Inventory />, page: 'inventaire', alertKey: 'stock' },
    { text: 'Catégories', icon: <Category />, page: 'categories' },
    { text: 'Rapports', icon: <Assessment />, page: 'rapports' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      minHeight: '100vh',
      background: gradients.primary, 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 3, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: irfamColors.neutral.white, letterSpacing: 2, mb: 0.5 }}>
          IRFAM
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: 1 }}>
          Gestion Comptable
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)', height: 2, flexShrink: 0 }} />
      <List sx={{ px: 2, pt: 2, pb: 3, flexGrow: 1, overflow: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem key={item.page} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                onNavigate(item.page);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2.5,
                color: irfamColors.neutral.white,
                bgcolor: currentPage === item.page ? 'rgba(255,255,255,0.25)' : 'transparent',
                backdropFilter: currentPage === item.page ? 'blur(10px)' : 'none',
                border: currentPage === item.page ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                boxShadow: currentPage === item.page ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.18)',
                  transform: 'translateX(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                py: 1.3,
              }}
            >
              <ListItemIcon sx={{ 
                color: irfamColors.neutral.white, 
                minWidth: 44,
                '& svg': {
                  fontSize: currentPage === item.page ? 26 : 24,
                  transition: 'font-size 0.3s ease',
                },
              }}>
                {item.alertKey && alerts[item.alertKey] > 0 ? (
                  <Badge 
                    badgeContent={alerts[item.alertKey]} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#D32F2F',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: currentPage === item.page ? 700 : 500,
                  fontSize: currentPage === item.page ? '0.95rem' : '0.9rem',
                  transition: 'all 0.3s ease',
                }}
              />
              {currentPage === item.page && (
                <Box sx={{
                  width: 4,
                  height: 24,
                  bgcolor: irfamColors.neutral.white,
                  borderRadius: 2,
                  ml: 1,
                }}/>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: irfamColors.background.default }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          color: irfamColors.text.primary,
          boxShadow: shadows.md,
          borderBottom: `1px solid ${irfamColors.border.light}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
              bgcolor: irfamColors.background.brown, 
              p: 1, 
              borderRadius: 2, 
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {menuItems.find(item => item.page === currentPage)?.icon}
            </Box>
            <Box>
              <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: irfamColors.primary.main }}>
                {menuItems.find(item => item.page === currentPage)?.text || 'IRFAM'}
              </Typography>
              <Typography variant="caption" sx={{ color: irfamColors.text.secondary }}>
                Institut de Réhabilitation et de Formation des Aveugles du Mont Carmel
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleMenu} 
            sx={{ 
              p: 0.5,
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s ease',
            }}
          >
            <Avatar sx={{ 
              bgcolor: irfamColors.primary.main, 
              color: irfamColors.neutral.white,
              width: 44,
              height: 44,
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: shadows.sm,
            }}>
              {username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Person sx={{ mr: 1 }} /> {username}
            </MenuItem>
            <Divider />
            <MenuItem onClick={onLogout}>
              <Logout sx={{ mr: 1 }} /> Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
