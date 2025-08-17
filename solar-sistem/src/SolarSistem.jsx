import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  Tooltip,
  Paper,
  Stack,
  IconButton,
  Chip,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  CenterFocusStrong,
  AccessTime,
  ZoomIn,
  Mouse,
  Info,
  TouchApp
} from '@mui/icons-material';

import { calculateHeliocentricPosition, calculateAllPlanetPositions, dateToJulianDay, testCalculations } from './mainFunctions'

// Componente Star usando MUI Box
const Star = ({ x, y, size, delay }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        left: `${x}%`,
        top: `${y}%`,
        backgroundColor: theme.palette.common.white,
        borderRadius: '50%',
        animation: `twinkle 4s ease-in-out infinite alternate`,
        animationDelay: `${delay}s`,
        '@keyframes twinkle': {
          '0%': { opacity: 0.2 },
          '50%': { opacity: 0.8 },
          '100%': { opacity: 1 }
        }
      }}
    />
  );
};

// Componente Planet
const Planet = ({ planetKey, data, speed, onPlanetHover, onPlanetLeave }) => {
  const { name, period, currentAngle, planetSize, color, hasRings, hasMoon, info, eccentricity } = data;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const planetStyle = {
    position: 'absolute',
    width: `${planetSize}px`,
    height: `${planetSize}px`,
    background: color,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    boxShadow: `0 0 ${planetSize}px ${alpha(theme.palette.common.white, 0.3)}`,
    '&:hover': {
      transform: 'translateY(-50%) scale(1.5)',
      zIndex: 100
    },
    // Aumentar área de toque em mobile
    ...(isMobile && {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '-10px',
        left: '-10px',
        right: '-10px',
        bottom: '-10px',
        pointerEvents: 'none'
      }
    })
  };

  // Calcule os semi-eixos da elipse
  const semiMajorAxis = data.orbitSize / 2; // 'a'
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity); // 'b'

  // Para órbitas elípticas reais, precisamos considerar o foco da elipse
  const focusDistance = semiMajorAxis * eccentricity; // distância do centro ao foco
  const anomalyRad = currentAngle * Math.PI / 180;

  // Posição na elipse com o Sol em um dos focos
  const x = (semiMajorAxis * Math.cos(anomalyRad)) - focusDistance;
  const y = semiMinorAxis * Math.sin(anomalyRad);

  return (
    <Box>
      {/* Órbita elíptica */}
      <Box
        sx={{
          position: 'absolute',
          border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
          borderRadius: '50%',
          width: `${semiMajorAxis * 2}px`,
          height: `${semiMinorAxis * 2}px`,
          left: '50%',
          top: '50%',
          // Adicione esta linha para deslocar a órbita considerando o foco:
          transform: `translate(calc(-50% - ${focusDistance}px), -50%)`,
          '&:hover': {
            borderColor: alpha(theme.palette.warning.main, 0.3),
            borderWidth: '2px'
          }
        }}
      />
      {/* Container do Planeta */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {name}
              </Typography>
              <Typography variant="caption" display="block">
                Período orbital: {period} dias terrestres
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {info}
              </Typography>
            </Box>
          }
          arrow
          placement="top"
          // Desabilitar tooltip no mobile para melhor performance
          disableHoverListener={isMobile}
          disableFocusListener={isMobile}
        >
          <Box
            sx={{
              ...planetStyle,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={(e) => !isMobile && onPlanetHover(e, name, info, period)}
            onMouseLeave={!isMobile ? onPlanetLeave : undefined}
            onTouchStart={(e) => isMobile && onPlanetHover(e, name, info, period)}
            onTouchEnd={(e) => isMobile && onPlanetLeave()}
          >
            {/* Label do planeta */}
            <Chip
              label={name}
              size="small"
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: isMobile ? '6px' : '8px',
                height: isMobile ? '14px' : '16px',
                backgroundColor: 'transparent',
                color: theme.palette.warning.main,
                pointerEvents: 'none',
                zIndex: 100,
                '& .MuiChip-label': {
                }
              }}
            />

            {/* Anéis de Saturno */}
            {hasRings && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    width: '18px',
                    height: '18px',
                    border: `1px solid ${alpha('#FAB069', 0.4)}`,
                    borderRadius: '50%',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: '24px',
                    height: '24px',
                    border: `1px solid ${alpha('#FAB069', 0.2)}`,
                    borderRadius: '50%',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Componente Sun
const Sun = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #FFF95B 0%, #FFD700 30%, #FF8C00 70%, #FF4500 100%)',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 140, 0, 0.6)',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'sunPulse 6s ease-in-out infinite alternate',
        zIndex: 10,
        '@keyframes sunPulse': {
          '0%': {
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 140, 0, 0.6)'
          },
          '100%': {
            boxShadow: '0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 140, 0, 0.8)'
          }
        }
      }}
    />
  );
};

// Componente principal SolarSystem
const SolarSystem = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(3600);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados específicos para touch
  const [isTouch, setIsTouch] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 });

  // Dados planetários com informações reais
  const [planetData, setPlanetData] = useState({
    mercury: {
      name: "Mercúrio",
      period: 88,
      currentAngle: 45,
      info: "O menor e mais rápido planeta. Temperaturas extremas: 427°C (dia) a -173°C (noite). Sem atmosfera significativa.",
      orbitSize: 80,
      eccentricity: 0.206,
      planetSize: 3,
      color: "radial-gradient(circle, #B8860B, #8C7853)"
    },
    venus: {
      name: "Vênus",
      period: 225,
      currentAngle: 120,
      info: "O planeta mais quente (462°C) devido ao efeito estufa. Rotação retrógrada. Pressão 90x maior que a Terra.",
      orbitSize: 108,
      eccentricity: 0.007,
      planetSize: 4,
      color: "radial-gradient(circle, #FFF8DC, #FFC649)"
    },
    earth: {
      name: "Terra",
      period: 365.25,
      currentAngle: 180,
      info: "Nosso planeta azul. Única vida conhecida no universo. 71% da superfície coberta por água. 1 lua natural.",
      orbitSize: 150,
      eccentricity: 0.017,
      planetSize: 4,
      color: "radial-gradient(circle, #4A90E2 0%, #2E5F8A 50%, #228B22 100%)",
      hasMoon: true
    },
    mars: {
      name: "Marte",
      period: 687,
      currentAngle: 240,
      info: "O planeta vermelho. Possui as maiores montanhas e cânions do Sistema Solar. Duas pequenas luas: Fobos e Deimos.",
      orbitSize: 228,
      eccentricity: 0.093,
      planetSize: 3,
      color: "radial-gradient(circle, #FF6B47, #CD5C5C)"
    },
    jupiter: {
      name: "Júpiter",
      period: 4332,
      currentAngle: 300,
      info: "O maior planeta. Mais de 80 luas conhecidas. Grande Mancha Vermelha é uma tempestade maior que a Terra.",
      orbitSize: 520,
      eccentricity: 0.049,
      planetSize: 12,
      color: "radial-gradient(circle, #D8CA9D 0%, #FAB069 50%, #CC8B5C 100%)"
    },
    saturn: {
      name: "Saturno",
      period: 10759,
      currentAngle: 15,
      info: "Famoso pelos anéis espetaculares. Densidade menor que a água. Titã, sua maior lua, tem atmosfera densa.",
      orbitSize: 954,
      eccentricity: 0.057,
      planetSize: 10,
      color: "radial-gradient(circle, #FAB069, #E6B35C)",
      hasRings: true
    },
    uranus: {
      name: "Urano",
      period: 30687,
      currentAngle: 90,
      info: "Gira 'de lado' (98° de inclinação). Gigante gelado com anéis verticais. 27 luas conhecidas.",
      orbitSize: 1916,
      eccentricity: 0.046,
      planetSize: 6,
      color: "radial-gradient(circle, #4FD0E7, #3BA7C7)"
    },
    neptune: {
      name: "Netuno",
      period: 60190,
      currentAngle: 270,
      info: "O planeta mais distante. Ventos de até 2.100 km/h - os mais rápidos do Sistema Solar. Cor azul devido ao metano.",
      orbitSize: 3006,
      eccentricity: 0.011,
      planetSize: 6,
      color: "radial-gradient(circle, #4169E1, #2E4BC7)"
    }
  });

  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const containerRef = useRef(null);
  const solarSystemRef = useRef(null);

  const mapPlanetName = (englishName) => {
    const mapping = {
      'Mercury': 'mercury',
      'Venus': 'venus',
      'Earth': 'earth',
      'Mars': 'mars',
      'Jupiter': 'jupiter',
      'Saturn': 'saturn',
      'Uranus': 'uranus',
      'Neptune': 'neptune'
    };
    return mapping[englishName] || englishName.toLowerCase();
  };

  const calculateCurrentPosition = (planetKey, date = new Date()) => {
    const position = calculateHeliocentricPosition(planetKey, date);
    return position ? position.normalizedAngle : 0;
  };

  const fetchPlanetPositions = useCallback(async () => {
    setIsLoadingPositions(true);
    try {
      const currentDate = new Date();
      const positions = calculateAllPlanetPositions(currentDate);

      setPlanetData(prevPlanetData => {
        const updatedPlanets = { ...prevPlanetData };

        Object.entries(positions).forEach(([planetKey, position]) => {
          if (updatedPlanets[planetKey]) {
            updatedPlanets[planetKey] = {
              ...updatedPlanets[planetKey],
              currentAngle: position.normalizedAngle,
              realDistance: position.r
            };
          }
        });

        return updatedPlanets;
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao calcular posições dos planetas:', error);
    } finally {
      setIsLoadingPositions(false);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (!isPaused) {
      intervalId = setInterval(() => {
        const currentDate = new Date(Date.now() + speed * 1000);
        const positions = calculateAllPlanetPositions(currentDate);

        setPlanetData(prevPlanets => {
          const newPlanets = { ...prevPlanets };

          Object.entries(positions).forEach(([planetKey, position]) => {
            if (newPlanets[planetKey]) {
              newPlanets[planetKey].currentAngle = position.normalizedAngle;
            }
          });

          return newPlanets;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isPaused, speed]);

  const formatSpeed = useCallback((speed) => {
    if (speed < 60) return `${speed}x`;
    if (speed < 3600) return `${Math.round(speed / 60)} min/s`;
    if (speed < 86400) return `${Math.round(speed / 3600)} h/s`;
    return `${Math.round(speed / 86400)} dias/s`;
  }, []);

  // Funções auxiliares para touch
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches) => {
    if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setIsTouch(true);

    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // Pan com um dedo
      const deltaX = e.touches[0].clientX - lastMouse.x;
      const deltaY = e.touches[0].clientY - lastMouse.y;

      const newPanX = panX + deltaX;
      const newPanY = panY + deltaY;

      setPanX(newPanX);
      setPanY(newPanY);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });

      if (solarSystemRef.current) {
        solarSystemRef.current.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${zoom})`;
      }
    } else if (e.touches.length === 2) {
      // Zoom com dois dedos
      const distance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);

      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        const newZoom = Math.max(0.1, Math.min(5, zoom * scale));
        setZoom(newZoom);

        // Ajustar pan baseado no centro do pinch
        const centerDeltaX = center.x - lastTouchCenter.x;
        const centerDeltaY = center.y - lastTouchCenter.y;

        const newPanX = panX + centerDeltaX;
        const newPanY = panY + centerDeltaY;

        setPanX(newPanX);
        setPanY(newPanY);

        if (solarSystemRef.current) {
          solarSystemRef.current.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${newZoom})`;
        }
      }

      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    }
  }, [isDragging, lastMouse, panX, panY, zoom, lastTouchDistance, lastTouchCenter]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setIsTouch(false);
      setLastTouchDistance(0);
    } else if (e.touches.length === 1) {
      // Transição de dois dedos para um dedo
      setIsDragging(true);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastTouchDistance(0);
    }
  }, []);

  // Mouse handlers (mantidos para desktop)
  const handleWheel = useCallback((e) => {
    if (isMobile) return; // Desabilitar wheel em mobile
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
    setZoom(newZoom);
    if (solarSystemRef.current) {
      solarSystemRef.current.style.transform = `translate(${panX}px, ${panY}px) scale(${newZoom})`;
    }
  }, [panX, panY, zoom, isMobile]);

  const handleMouseDown = useCallback((e) => {
    if (isMobile || isTouch) return; // Ignorar mouse events em mobile/touch
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, [isMobile, isTouch]);

  const handleMouseMove = useCallback((e) => {
    if (isMobile || isTouch || !isDragging) return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    const newPanX = panX + deltaX;
    const newPanY = panY + deltaY;

    setPanX(newPanX);
    setPanY(newPanY);
    setLastMouse({ x: e.clientX, y: e.clientY });

    if (solarSystemRef.current) {
      solarSystemRef.current.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${zoom})`;
    }
  }, [isDragging, lastMouse, panX, panY, zoom, isMobile, isTouch]);

  const handleMouseUp = useCallback(() => {
    if (isMobile || isTouch) return;
    setIsDragging(false);
  }, [isMobile, isTouch]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Mouse events (apenas para desktop)
    if (!isMobile) {
      container.addEventListener('wheel', handleWheel);
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);

      if (!isMobile) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, isMobile]);

  // Atualizar a data atual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers vazios para manter compatibilidade
  const handlePlanetHover = () => { };
  const handlePlanetLeave = () => { };

  // Buscar posições iniciais e configurar atualizações
  useEffect(() => {
    fetchPlanetPositions();

    const updateInterval = setInterval(() => {
      fetchPlanetPositions();
    }, 21600000);

    return () => clearInterval(updateInterval);
  }, [fetchPlanetPositions]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at center, #0B1426 0%, #020408 100%)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
        touchAction: 'none', // Previne scroll padrão no mobile
      }}
    >
      {/* Container principal */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Sistema Solar */}
        <Box
          ref={solarSystemRef}
          sx={{
            position: 'relative',
            width: isMobile ? '800px' : '1200px',
            height: isMobile ? '800px' : '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          <Sun />

          {Object.entries(planetData).map(([key, data]) => (
            <Planet
              key={key}
              planetKey={key}
              data={data}
              speed={speed}
              onPlanetHover={handlePlanetHover}
              onPlanetLeave={handlePlanetLeave}
            />
          ))}
        </Box>
      </Box>

      {/* Painel de Informações - Responsivo */}
      <Card
        sx={{
          position: 'absolute',
          top: isMobile ? 10 : 20,
          left: isMobile ? 10 : 20,
          maxWidth: isMobile ? '280px' : '380px',
          backgroundColor: alpha(theme.palette.common.black, 0.85),
          backdropFilter: 'blur(15px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          color: theme.palette.common.white,
          ...(isMobile && {
            maxHeight: '40vh',
            overflow: 'auto'
          })
        }}
      >
        <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{
              color: theme.palette.warning.main,
              mb: isMobile ? 1 : 2,
              fontSize: isMobile ? '0.9rem' : undefined
            }}
          >
            🌌 Sistema Solar Real - NASA JPL Data
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              fontSize: isMobile ? '0.75rem' : undefined
            }}
          >
            Posições Calculadas (NASA JPL):
          </Typography>

          <Box sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem', lineHeight: 1.4 }}>
            {Object.entries(planetData).map(([key, planet]) => (
              <Typography key={planet.name} variant="caption" display="block">
                • {planet.name}: {planet.currentAngle.toFixed(1)}°
                {planet.realDistance && ` (${planet.realDistance.toFixed(2)} AU)`}
              </Typography>
            ))}
          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: isMobile ? 1 : 2,
              fontStyle: 'italic',
              display: 'block',
              fontSize: isMobile ? '0.65rem' : undefined
            }}
          >
            Cálculos baseados em elementos orbitais NASA JPL
          </Typography>
        </CardContent>
      </Card>

      {/* Display de Data - Responsivo */}
      <Paper
        sx={{
          position: 'absolute',
          top: isMobile ? 10 : 20,
          right: isMobile ? 10 : 20,
          px: isMobile ? 2 : 3,
          py: isMobile ? 1 : 2,
          backgroundColor: alpha(theme.palette.common.black, 0.85),
          color: theme.palette.warning.main,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography
          variant={isMobile ? "body2" : "body1"}
          sx={{
            fontWeight: 'bold',
            fontSize: isMobile ? '0.8rem' : undefined
          }}
        >
          {new Intl.DateTimeFormat('pt-BR', {
            day: 'numeric',
            month: isMobile ? 'short' : 'long',
            year: 'numeric'
          }).format(currentDate)}
        </Typography>
      </Paper>

      {/* Info de Controle - Adaptado para Mobile */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: isMobile ? 20 : 140,
          right: isMobile ? 10 : 20,
          px: isMobile ? 1.5 : 2,
          py: isMobile ? 0.5 : 1,
          backgroundColor: alpha(theme.palette.common.black, 0.8),
          color: theme.palette.warning.main,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="caption" display="block" sx={{ fontSize: isMobile ? '0.7rem' : undefined }}>
          {isMobile ? (
            <>
              <TouchApp sx={{ fontSize: 12, mr: 0.5 }} />
              Touch: Pan/Pinch Zoom
            </>
          ) : (
            <>
              <Mouse sx={{ fontSize: 12, mr: 0.5 }} />
              Mouse: Zoom In/Out
            </>
          )}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: isMobile ? '0.7rem' : undefined }}>
          Zoom: {Math.round(zoom * 100)}%
        </Typography>
      </Paper>

      {/* Controles */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
      </Stack>
    </Box>
  );
};

export default SolarSystem;