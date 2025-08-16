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
  alpha
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Refresh,
  CenterFocusStrong,
  AccessTime,
  ZoomIn,
  Mouse,
  Info
} from '@mui/icons-material';

// Dados planetários com informações reais
const planetData = {
  mercury: {
    name: "Mercúrio",
    period: 88,
    currentAngle: 152,
    info: "O menor e mais rápido planeta. Temperaturas extremas: 427°C (dia) a -173°C (noite). Sem atmosfera significativa.",
    orbitSize: 80,
    planetSize: 3,
    color: "radial-gradient(circle, #B8860B, #8C7853)"
  },
  venus: {
    name: "Vênus",
    period: 225,
    currentAngle: 108,
    info: "O planeta mais quente (462°C) devido ao efeito estufa. Rotação retrógrada. Pressão 90x maior que a Terra.",
    orbitSize: 108,
    planetSize: 4,
    color: "radial-gradient(circle, #FFF8DC, #FFC649)"
  },
  earth: {
    name: "Terra",
    period: 365.25,
    currentAngle: 227,
    info: "Nosso planeta azul. Única vida conhecida no universo. 71% da superfície coberta por água. 1 lua natural.",
    orbitSize: 150,
    planetSize: 4,
    color: "radial-gradient(circle, #4A90E2 0%, #2E5F8A 50%, #228B22 100%)",
    hasMoon: true
  },
  mars: {
    name: "Marte",
    period: 687,
    currentAngle: 53,
    info: "O planeta vermelho. Possui as maiores montanhas e cânions do Sistema Solar. Duas pequenas luas: Fobos e Deimos.",
    orbitSize: 228,
    planetSize: 3,
    color: "radial-gradient(circle, #FF6B47, #CD5C5C)"
  },
  jupiter: {
    name: "Júpiter",
    period: 4332,
    currentAngle: 78,
    info: "O maior planeta. Mais de 80 luas conhecidas. Grande Mancha Vermelha é uma tempestade maior que a Terra.",
    orbitSize: 520,
    planetSize: 12,
    color: "radial-gradient(circle, #D8CA9D 0%, #FAB069 50%, #CC8B5C 100%)"
  },
  saturn: {
    name: "Saturno",
    period: 10759,
    currentAngle: 345,
    info: "Famoso pelos anéis espetaculares. Densidade menor que a água. Titã, sua maior lua, tem atmosfera densa.",
    orbitSize: 954,
    planetSize: 10,
    color: "radial-gradient(circle, #FAB069, #E6B35C)",
    hasRings: true
  },
  uranus: {
    name: "Urano",
    period: 30687,
    currentAngle: 45,
    info: "Gira 'de lado' (98° de inclinação). Gigante gelado com anéis verticais. 27 luas conhecidas.",
    orbitSize: 1916,
    planetSize: 6,
    color: "radial-gradient(circle, #4FD0E7, #3BA7C7)"
  },
  neptune: {
    name: "Netuno",
    period: 60190,
    currentAngle: 315,
    info: "O planeta mais distante. Ventos de até 2.100 km/h - os mais rápidos do Sistema Solar. Cor azul devido ao metano.",
    orbitSize: 3006,
    planetSize: 6,
    color: "radial-gradient(circle, #4169E1, #2E4BC7)"
  }
};

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

// Componente StarField
const StarField = () => {
  const stars = [];
  for (let i = 0; i < 500; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 4
    });
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    >
      {stars.map(star => (
        <Star key={star.id} {...star} />
      ))}
    </Box>
  );
};

// Componente Asteroid
const Asteroid = ({ x, y }) => (
  <Box
    sx={{
      position: 'absolute',
      width: '0.5px',
      height: '0.5px',
      backgroundColor: '#666',
      borderRadius: '50%',
      opacity: 0.4,
      left: `${x}px`,
      top: `${y}px`
    }}
  />
);

// Componente AsteroidBelt
const AsteroidBelt = () => {
  const asteroids = [];
  for (let i = 0; i < 100; i++) {
    const angle = (360 / 100) * i + Math.random() * 10 - 5;
    const radius = 187 + Math.random() * 20 - 10;
    const x = Math.cos(angle * Math.PI / 180) * radius + 187;
    const y = Math.sin(angle * Math.PI / 180) * radius + 187;

    asteroids.push({ id: i, x, y });
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '374px',
        height: '374px',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}
    >
      {asteroids.map(asteroid => (
        <Asteroid key={asteroid.id} {...asteroid} />
      ))}
    </Box>
  );
};

// Componente Planet
const Planet = ({ planetKey, data, speed, onPlanetHover, onPlanetLeave }) => {
  const { name, period, currentAngle, planetSize, color, hasRings, hasMoon, info } = data;
  const theme = useTheme();

  // Remova a lógica de rotação
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
    }
  };

  // Calcule a posição X e Y do planeta
  const orbitRadius = data.orbitSize / 2;
  const x = Math.cos(currentAngle * Math.PI / 180) * orbitRadius;
  const y = Math.sin(currentAngle * Math.PI / 180) * orbitRadius;

  return (
    <Box>
      {/* Órbita */}
      <Box
        sx={{
          position: 'absolute',
          border: `1px solid ${alpha(theme.palette.common.white, 0.06)}`,
          borderRadius: '50%',
          width: `${data.orbitSize}px`,
          height: `${data.orbitSize}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
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
          // Remova a linha "transform: `rotate(${currentAngle}deg)`, " daqui
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
        >
          <Box
            sx={{
              ...planetStyle,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={(e) => onPlanetHover(e, name, info, period)}
            onMouseLeave={onPlanetLeave}
          >
            {/* Label do planeta */}
            <Chip
              label={name}
              size="small"
              sx={{
                position: 'absolute',
                transform: 'translateX(8px) translateY(-3px)',
                fontSize: '8px',
                height: '16px',
                backgroundColor: alpha(theme.palette.common.black, 0.6),
                color: theme.palette.warning.main,
                pointerEvents: 'none',
                '& .MuiChip-label': {
                  px: 1
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

            {/* Lua da Terra */}
            {hasMoon && (
              <Box
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  backgroundColor: '#C0C0C0',
                  borderRadius: '50%',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  animation: 'moonOrbit 27.3s linear infinite',
                  '@keyframes moonOrbit': {
                    '0%': { transform: 'translateY(-50%) rotate(0deg) translateX(6px) rotate(0deg)' },
                    '100%': { transform: 'translateY(-50%) rotate(360deg) translateX(6px) rotate(-360deg)' }
                  }
                }}
              />
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
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(3600);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const solarSystemRef = useRef(null);

  // Formatador de velocidade
  const formatSpeed = useCallback((speed) => {
    if (speed < 60) return `${speed}x`;
    if (speed < 3600) return `${Math.round(speed / 60)} min/s`;
    if (speed < 86400) return `${Math.round(speed / 3600)} h/s`;
    return `${Math.round(speed / 86400)} dias/s`;
  }, []);

  // Controle de zoom com mouse
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom * delta)));
  }, []);

  // Controle de pan (arrastar)
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;

      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);

      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMouse]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        case 'r':
          setZoom(1);
          setPanX(0);
          setPanY(0);
          break;
        case 'c':
          setPanX(0);
          setPanY(0);
          break;
        case '+':
        case '=':
          setSpeed(prev => Math.min(10000, prev * 1.5));
          break;
        case '-':
          setSpeed(prev => Math.max(1, prev / 1.5));
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Event listeners para mouse
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Atualizar transform do sistema solar
  useEffect(() => {
    if (solarSystemRef.current) {
      solarSystemRef.current.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    }
  }, [panX, panY, zoom]);

  // Handlers vazios para manter compatibilidade
  const handlePlanetHover = () => { };
  const handlePlanetLeave = () => { };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at center, #0B1426 0%, #020408 100%)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <StarField />

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
            width: '1200px',
            height: '1200px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <Sun />
          <AsteroidBelt />

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

      {/* Painel de Informações */}
      <Card
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          maxWidth: 380,
          backgroundColor: alpha(theme.palette.common.black, 0.85),
          backdropFilter: 'blur(15px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          color: theme.palette.common.white
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>
            🌌 Sistema Solar Real
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            15 de Agosto de 2025
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Velocidades Orbitais Reais:
          </Typography>
          <Box sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
            {Object.values(planetData).map((planet) => (
              <Typography key={planet.name} variant="caption" display="block">
                • {planet.name}: {planet.period > 365
                  ? `${(planet.period / 365).toFixed(1)} anos/órbita`
                  : `${planet.period} dias/órbita`}
              </Typography>
            ))}
          </Box>
          <Typography variant="caption" sx={{ mt: 2, fontStyle: 'italic', display: 'block' }}>
            Posições baseadas em efemérides astronômicas
          </Typography>
        </CardContent>
      </Card>

      {/* Display de Data */}
      <Paper
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          px: 3,
          py: 2,
          backgroundColor: alpha(theme.palette.common.black, 0.85),
          color: theme.palette.warning.main,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          15 de Agosto de 2025
        </Typography>
      </Paper>

      {/* Info de Zoom */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 140,
          right: 20,
          px: 2,
          py: 1,
          backgroundColor: alpha(theme.palette.common.black, 0.8),
          color: theme.palette.warning.main,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Typography variant="caption" display="block">
          <Mouse sx={{ fontSize: 12, mr: 0.5 }} />
          Mouse: Zoom In/Out
        </Typography>
        <Typography variant="caption">
          Zoom: {Math.round(zoom * 100)}%
        </Typography>
      </Paper>

      {/* Controle de Velocidade */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 3,
          py: 2,
          backgroundColor: alpha(theme.palette.common.black, 0.8),
          backdropFilter: 'blur(10px)',
          minWidth: 300
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" sx={{ color: theme.palette.common.white, fontWeight: 'bold' }}>
            Aceleração:
          </Typography>
          <Slider
            value={speed}
            onChange={(_, newValue) => setSpeed(newValue)}
            min={1}
            max={10000}
            step={1}
            sx={{
              color: theme.palette.warning.main,
              '& .MuiSlider-thumb': {
                backgroundColor: theme.palette.warning.main
              },
              '& .MuiSlider-track': {
                backgroundColor: theme.palette.warning.main
              }
            }}
          />
          <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 'bold', minWidth: 80 }}>
            {formatSpeed(speed)}
          </Typography>
        </Stack>
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
        <Button
          variant="contained"
          startIcon={isPaused ? <PlayArrow /> : <Pause />}
          onClick={() => setIsPaused(!isPaused)}
          sx={{
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            color: theme.palette.common.white,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25)
            }
          }}
        >
          {isPaused ? 'Continuar' : 'Pausar'}
        </Button>

        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => {
            setZoom(1);
            setPanX(0);
            setPanY(0);
          }}
          sx={{
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            color: theme.palette.common.white,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25)
            }
          }}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          startIcon={<CenterFocusStrong />}
          onClick={() => {
            setPanX(0);
            setPanY(0);
          }}
          sx={{
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            color: theme.palette.common.white,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25)
            }
          }}
        >
          Centralizar
        </Button>

        <Button
          variant="contained"
          startIcon={<AccessTime />}
          onClick={() => setSpeed(1)}
          sx={{
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            color: theme.palette.common.white,
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.25)
            }
          }}
        >
          Tempo Real
        </Button>
      </Stack>
    </Box>
  );
};

export default SolarSystem;