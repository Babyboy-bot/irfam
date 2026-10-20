// Thème IRFAM - Couleurs officielles : Blanc et Marron

export const irfamColors = {
  // Couleurs principales IRFAM
  primary: {
    main: '#8B4513',      // Marron principal (SaddleBrown)
    light: '#A0522D',     // Marron clair (Sienna)
    dark: '#5C2E0A',      // Marron foncé
    darker: '#3E1F07',    // Marron très foncé
  },
  
  secondary: {
    main: '#D2691E',      // Marron orangé (Chocolate)
    light: '#CD853F',     // Marron beige (Peru)
    dark: '#A0522D',      // Sienna
  },
  
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F5F5',
    gray: '#E0E0E0',
    darkGray: '#757575',
  },
  
  // Couleurs fonctionnelles (adaptées au marron)
  success: '#6B8E23',     // Vert olive (harmonise avec marron)
  warning: '#D2691E',     // Chocolate (déjà marron)
  error: '#A0522D',       // Sienna foncé
  info: '#8B4513',        // Marron principal
  
  // États
  hover: '#A0522D',       // Marron clair au survol
  active: '#5C2E0A',      // Marron foncé actif
  disabled: '#D3D3D3',    // Gris clair
  
  // Texte
  text: {
    primary: '#3E1F07',   // Marron très foncé pour texte
    secondary: '#6B4423', // Marron moyen
    light: '#8B7355',     // Marron grisé
    white: '#FFFFFF',
  },
  
  // Backgrounds
  background: {
    default: '#FFFFFF',
    paper: '#FAFAFA',
    brown: '#F5E6D3',     // Beige très clair
    brownLight: '#FDF8F3', // Beige presque blanc
  },
  
  // Bordures
  border: {
    light: '#E6D5C3',
    main: '#D2B48C',      // Tan
    dark: '#A0522D',
  }
};

// Couleurs par fonctionnalité
export const moduleColors = {
  dashboard: irfamColors.primary.main,
  pensionnaires: '#8B6914',  // Marron doré
  ressources: '#6B8E23',     // Vert olive
  depenses: '#A0522D',       // Sienna
  budgets: '#D2691E',        // Chocolate
  donateurs: '#CD853F',      // Peru
  inventaire: '#DEB887',     // BurlyWood
  categories: '#BC8F8F',     // RosyBrown
  rapports: '#8B4513',       // Marron principal
};

// Dégradés
export const gradients = {
  primary: `linear-gradient(135deg, ${irfamColors.primary.main} 0%, ${irfamColors.primary.light} 100%)`,
  secondary: `linear-gradient(135deg, ${irfamColors.secondary.main} 0%, ${irfamColors.secondary.light} 100%)`,
  background: `linear-gradient(135deg, ${irfamColors.background.brownLight} 0%, ${irfamColors.neutral.white} 100%)`,
  card: `linear-gradient(135deg, #FFFFFF 0%, ${irfamColors.background.brownLight} 100%)`,
  subtle: `linear-gradient(180deg, ${irfamColors.neutral.white} 0%, ${irfamColors.background.brownLight} 100%)`,
};

// Ombres élégantes
export const shadows = {
  sm: '0 2px 8px rgba(139, 69, 19, 0.08)',
  md: '0 4px 16px rgba(139, 69, 19, 0.12)',
  lg: '0 8px 24px rgba(139, 69, 19, 0.15)',
  xl: '0 12px 32px rgba(139, 69, 19, 0.18)',
  card: '0 2px 12px rgba(139, 69, 19, 0.1)',
  cardHover: '0 8px 24px rgba(139, 69, 19, 0.2)',
  button: '0 4px 12px rgba(139, 69, 19, 0.25)',
};

// Animations
export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: 'fadeIn 0.3s ease-out',
  },
  scaleIn: {
    '@keyframes scaleIn': {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    animation: 'scaleIn 0.3s ease-out',
  },
};

// Styles de cartes modernes
export const cardStyles = {
  base: {
    borderRadius: 3,
    boxShadow: shadows.card,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${irfamColors.border.light}`,
    background: irfamColors.neutral.white,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: shadows.cardHover,
    },
  },
  stat: {
    borderRadius: 3,
    padding: '24px',
    background: gradients.card,
    border: `1px solid ${irfamColors.border.light}`,
    boxShadow: shadows.card,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: shadows.lg,
      transform: 'translateY(-2px)',
    },
  },
};

// Styles de boutons
export const buttonStyles = {
  primary: {
    bgcolor: irfamColors.primary.main,
    color: irfamColors.neutral.white,
    borderRadius: 2,
    px: 3,
    py: 1.5,
    fontWeight: 600,
    boxShadow: shadows.button,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: irfamColors.primary.light,
      transform: 'translateY(-2px)',
      boxShadow: shadows.lg,
    },
  },
  secondary: {
    bgcolor: irfamColors.secondary.main,
    color: irfamColors.neutral.white,
    borderRadius: 2,
    px: 3,
    py: 1.5,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: irfamColors.secondary.light,
      transform: 'translateY(-2px)',
    },
  },
};
