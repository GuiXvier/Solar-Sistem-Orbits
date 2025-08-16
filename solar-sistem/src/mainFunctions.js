// Elementos orbitais dos planetas para J2000.0 (1 Jan 2000 12:00 TT)
// Baseado nos dados da NASA JPL: https://ssd.jpl.nasa.gov/planets/approx_pos.html

const ORBITAL_ELEMENTS = {
    mercury: {
        // Elementos orbitais para J2000.0
        a: 0.38709927,      // semi-eixo maior (AU)
        e: 0.20563593,      // excentricidade
        I: 7.00497902,      // inclinação (graus)
        L: 252.25032350,    // longitude média (graus)
        longPeri: 77.45779628,  // longitude do periélio (graus)
        longNode: 48.33076593,  // longitude do nó ascendente (graus)
        // Taxas de variação por século
        aDot: 0.00000037,
        eDot: 0.00001906,
        IDot: -0.00594749,
        LDot: 149472.67411175,
        longPeriDot: 0.16047689,
        longNodeDot: -0.12534081
    },
    venus: {
        a: 0.72333566, e: 0.00677672, I: 3.39467605,
        L: 181.97909950, longPeri: 131.60246718, longNode: 76.67984255,
        aDot: 0.00000390, eDot: -0.00004107, IDot: -0.00078890,
        LDot: 58517.81538729, longPeriDot: 0.00268329, longNodeDot: -0.27769418
    },
    earth: {
        a: 1.00000261, e: 0.01671123, I: -0.00001531,
        L: 100.46457166, longPeri: 102.93768193, longNode: 0.0,
        aDot: 0.00000562, eDot: -0.00004392, IDot: -0.01294668,
        LDot: 35999.37244981, longPeriDot: 0.32327364, longNodeDot: 0.0
    },
    mars: {
        a: 1.52371034, e: 0.09339410, I: 1.84969142,
        L: -4.55343205, longPeri: -23.94362959, longNode: 49.55953891,
        aDot: 0.00001847, eDot: 0.00007882, IDot: -0.00813131,
        LDot: 19140.30268499, longPeriDot: 0.44441088, longNodeDot: -0.29257343
    },
    jupiter: {
        a: 5.20288700, e: 0.04838624, I: 1.30439695,
        L: 34.39644051, longPeri: 14.72847983, longNode: 100.47390909,
        aDot: -0.00011607, eDot: -0.00013253, IDot: -0.00183714,
        LDot: 3034.74612775, longPeriDot: 0.21252668, longNodeDot: 0.20469106
    },
    saturn: {
        a: 9.53667594, e: 0.05386179, I: 2.48599187,
        L: 49.95424423, longPeri: 92.59887831, longNode: 113.66242448,
        aDot: -0.00125060, eDot: -0.00050991, IDot: 0.00193609,
        LDot: 1222.49362201, longPeriDot: -0.41897216, longNodeDot: -0.28867794
    },
    uranus: {
        a: 19.18916464, e: 0.04725744, I: 0.77263783,
        L: 313.23810451, longPeri: 170.95427630, longNode: 74.01692503,
        aDot: -0.00196176, eDot: -0.00004397, IDot: -0.00242939,
        LDot: 428.48202785, longPeriDot: 0.40805281, longNodeDot: 0.04240589
    },
    neptune: {
        a: 30.06992276, e: 0.00859048, I: 1.77004347,
        L: -55.12002969, longPeri: 44.96476227, longNode: 131.78422574,
        aDot: 0.00026291, eDot: 0.00005105, IDot: 0.00035372,
        LDot: 218.45945325, longPeriDot: -0.32241464, longNodeDot: -0.00508664
    }
};

// Função para calcular elementos orbitais em uma data específica
function calculateOrbitalElements(planetKey, julianDate) {
    const elements = ORBITAL_ELEMENTS[planetKey];
    if (!elements) return null;

    // Tempo em séculos julianos desde J2000.0
    const T = (julianDate - 2451545.0) / 36525.0;

    return {
        a: elements.a + elements.aDot * T,
        e: elements.e + elements.eDot * T,
        I: elements.I + elements.IDot * T,
        L: elements.L + elements.LDot * T,
        longPeri: elements.longPeri + elements.longPeriDot * T,
        longNode: elements.longNode + elements.longNodeDot * T
    };
}

// Função para converter data para dia juliano
function dateToJulianDay(date) {
    const a = Math.floor((14 - (date.getUTCMonth() + 1)) / 12);
    const y = date.getUTCFullYear() + 4800 - a;
    const m = (date.getUTCMonth() + 1) + 12 * a - 3;

    const jdn = date.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y +
        Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const fraction = (date.getUTCHours() - 12) / 24 +
        date.getUTCMinutes() / 1440 +
        date.getUTCSeconds() / 86400 +
        date.getUTCMilliseconds() / 86400000;

    return jdn + fraction;
}

// Função para resolver a equação de Kepler
function solveKeplerEquation(M, e, tolerance = 1e-8, maxIterations = 100) {
    let E = M; // Primeira aproximação

    for (let i = 0; i < maxIterations; i++) {
        const deltaE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= deltaE;

        if (Math.abs(deltaE) < tolerance) break;
    }

    return E;
}

// Função principal para calcular a posição heliocêntrica
function calculateHeliocentricPosition(planetKey, date = new Date()) {
    const jd = dateToJulianDay(date);
    const elements = calculateOrbitalElements(planetKey, jd);

    if (!elements) return null;

    // Converter graus para radianos
    const deg2rad = Math.PI / 180;
    const L = elements.L * deg2rad;
    const longPeri = elements.longPeri * deg2rad;
    const longNode = elements.longNode * deg2rad;
    const I = elements.I * deg2rad;

    // Calcular anomalia média
    const M = L - longPeri;

    // Resolver equação de Kepler para anomalia excêntrica
    const E = solveKeplerEquation(M, elements.e);

    // Calcular anomalia verdadeira
    const nu = 2 * Math.atan2(
        Math.sqrt(1 + elements.e) * Math.sin(E / 2),
        Math.sqrt(1 - elements.e) * Math.cos(E / 2)
    );

    // Calcular raio vetor
    const r = elements.a * (1 - elements.e * Math.cos(E));

    // Posição no plano orbital
    const xOrbital = r * Math.cos(nu);
    const yOrbital = r * Math.sin(nu);

    // Argumento do periélio
    const argPeri = longPeri - longNode;

    // Transformar para coordenadas heliocêntricas eclípticas
    const cosArgPeri = Math.cos(argPeri);
    const sinArgPeri = Math.sin(argPeri);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);
    const cosLongNode = Math.cos(longNode);
    const sinLongNode = Math.sin(longNode);

    const x = (cosLongNode * cosArgPeri - sinLongNode * sinArgPeri * cosI) * xOrbital +
        (-cosLongNode * sinArgPeri - sinLongNode * cosArgPeri * cosI) * yOrbital;

    const y = (sinLongNode * cosArgPeri + cosLongNode * sinArgPeri * cosI) * xOrbital +
        (-sinLongNode * sinArgPeri + cosLongNode * cosArgPeri * cosI) * yOrbital;

    const z = (sinArgPeri * sinI) * xOrbital + (cosArgPeri * sinI) * yOrbital;

    return {
        x, y, z, r,
        // Converter posição para ângulo para sua visualização 2D
        angle: Math.atan2(y, x) * 180 / Math.PI
    };
}

// Função para calcular todas as posições planetárias
function calculateAllPlanetPositions(date = new Date()) {
    const positions = {};
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
        const position = calculateHeliocentricPosition(key, date);
        if (position) {
            positions[key] = {
                ...position,
                // Normalizar ângulo para 0-360
                normalizedAngle: ((position.angle % 360) + 360) % 360
            };
        }
    });

    return positions;
}

// Função de teste
function testCalculations() {
    const testDate = new Date('2000-01-01T12:00:00Z'); // J2000.0
    console.log('Teste para J2000.0:', testDate);

    const positions = calculateAllPlanetPositions(testDate);

    Object.entries(positions).forEach(([planet, pos]) => {
        console.log(`${planet}: ângulo=${pos.normalizedAngle.toFixed(2)}°, distância=${pos.r.toFixed(3)} AU`);
    });

    return positions;
}

// Exportar funções principais
export {
    calculateHeliocentricPosition,
    calculateAllPlanetPositions,
    dateToJulianDay,
    testCalculations
};