import React, { useEffect, useState } from 'react';
import { Box, Fade, Zoom, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { irfamColors } from '../theme';

// Animation de pulsation pour le logo
const pulse = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation de zoom style Netflix
const netflixZoom = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(15);
    opacity: 0;
  }
`;

// Animation du texte
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SplashContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExiting',
})(({ isExiting }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${irfamColors.primary.dark} 0%, ${irfamColors.primary.main} 50%, ${irfamColors.secondary.main} 100%)`,
  zIndex: 9999,
  overflow: 'hidden',
  transition: 'opacity 0.5s ease-out',
  opacity: isExiting ? 0 : 1,
}));

const LogoContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExiting',
})(({ isExiting }) => ({
  width: '280px',
  height: '280px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: isExiting 
    ? `${netflixZoom} 1.2s cubic-bezier(0.87, 0, 0.13, 1) forwards`
    : `${pulse} 1s ease-out forwards`,
  position: 'relative',
  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4))',
}));

const LogoImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  borderRadius: '50%',
});

const TextContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExiting',
})(({ isExiting }) => ({
  marginTop: '40px',
  textAlign: 'center',
  animation: isExiting ? 'none' : `${fadeInUp} 0.8s ease-out 0.5s both`,
}));

const GlowEffect = styled(Box)({
  position: 'absolute',
  width: '400px',
  height: '400px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${irfamColors.secondary.light}40 0%, transparent 70%)`,
  animation: `${pulse} 2s ease-in-out infinite`,
  zIndex: -1,
});

export default function SplashScreen({ onFinish, logoUrl }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Durée d'affichage du splash (3.5 secondes)
    const displayTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Après l'animation de sortie, appeler onFinish
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3700); // 2500ms display + 1200ms exit animation

    return () => {
      clearTimeout(displayTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <SplashContainer isExiting={isExiting}>
      <GlowEffect />
      
      <LogoContainer isExiting={isExiting}>
        <LogoImage 
          src={process.env.PUBLIC_URL + '/logo-irfam.png'} 
          alt="IRFAM Logo"
          onError={(e) => {
            // Fallback si l'image ne charge pas
            console.error('Logo non trouvé');
            e.target.style.display = 'none';
          }}
        />
      </LogoContainer>

      {!isExiting && (
        <Fade in={true} timeout={1000} style={{ transitionDelay: '800ms' }}>
          <TextContainer isExiting={isExiting}>
            <Typography
              variant="h3"
              sx={{
                color: irfamColors.neutral.white,
                fontWeight: 800,
                letterSpacing: 4,
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                mb: 1,
              }}
            >
              IRFAM
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: irfamColors.neutral.white,
                fontWeight: 500,
                letterSpacing: 1,
                opacity: 0.95,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              Institut de Réhabilitation et de Formation des Aveugles du Mont Carmel
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: irfamColors.neutral.white,
                fontWeight: 400,
                letterSpacing: 0.5,
                opacity: 0.9,
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                mt: 0.5,
              }}
            >
              des Aveugles du Mont Carmel
            </Typography>
          </TextContainer>
        </Fade>
      )}
    </SplashContainer>
  );
}
