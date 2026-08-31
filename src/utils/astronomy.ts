import { PlanetData } from '../types';

// Współrzędne Planetarium Śląskiego w Chorzowie
export const CHORZOW_COORDS = {
  lat: 50.2911,
  lon: 18.9922,
  elevationM: 320,
  name: "Planetarium – Śląski Park Nauki",
  city: "Chorzów, woj. śląskie"
};

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

/**
 * Przelicza czas na juliańskie dni stulecia (J2000.0)
 */
function getJulianDays(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Oblicza Greenwicki Czas Gwiazdowy (GMST) w stopniach
 */
function getGMST(date: Date): number {
  const jd = getJulianDays(date);
  const d = jd - 2451545.0;
  let gmst = 280.46061837 + 360.98564736629 * d;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

/**
 * Oblicza Miejscowy Czas Gwiazdowy (LST) dla danej długości geograficznej w stopniach
 */
export function getLST(date: Date, lonDeg: number): number {
  const gmst = getGMST(date);
  let lst = gmst + lonDeg;
  lst = ((lst % 360) + 360) % 360;
  return lst;
}

/**
 * Transformacja sferyczna: Równikowe (RA, Dec) -> Horyzontalne (Alt, Az)
 * @param raDeg Rektascensja w stopniach (0..360)
 * @param decDeg Deklinacja w stopniach (-90..90)
 * @param latDeg Szerokość geograficzna obserwatora (Chorzów = 50.2911)
 * @param lstDeg Miejscowy Czas Gwiazdowy w stopniach
 */
export function equatorialToHorizontal(raDeg: number, decDeg: number, latDeg: number, lstDeg: number): { alt: number; az: number } {
  const hourAngleDeg = ((lstDeg - raDeg % 360) + 360) % 360;
  
  const phi = latDeg * DEG2RAD;
  const delta = decDeg * DEG2RAD;
  const h = hourAngleDeg * DEG2RAD;

  // sin(alt) = sin(phi) * sin(delta) + cos(phi) * cos(delta) * cos(H)
  const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(h);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altDeg = altRad * RAD2DEG;

  // cos(az) = (sin(delta) - sin(phi)*sin(alt)) / (cos(phi)*cos(alt))
  // sin(az) = -cos(delta)*sin(H) / cos(alt)
  const cosAlt = Math.cos(altRad);
  let azDeg = 0;

  if (Math.abs(cosAlt) > 1e-6) {
    const sinAz = -Math.cos(delta) * Math.sin(h) / cosAlt;
    const cosAz = (Math.sin(delta) - Math.sin(phi) * sinAlt) / (Math.cos(phi) * cosAlt);
    let azRad = Math.atan2(sinAz, cosAz);
    azDeg = (azRad * RAD2DEG + 360) % 360;
  }

  return {
    alt: altDeg,
    az: azDeg
  };
}

export function getCompassDirection(azimuthDeg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuthDeg / 22.5) % 16;
  return directions[index];
}

function formatRA(deg: number): string {
  const hours = deg / 15.0;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

function formatDec(deg: number): string {
  const sign = deg >= 0 ? '+' : '-';
  const absDeg = Math.abs(deg);
  const d = Math.floor(absDeg);
  const m = Math.floor((absDeg - d) * 60);
  return `${sign}${d.toString().padStart(2, '0')}° ${m.toString().padStart(2, '0')}'`;
}

/**
 * Wyznacza przybliżone pozycje planet Układu Słonecznego i Księżyca dla danego czasu
 */
export function calculateAllPlanets(date: Date, lat: number = CHORZOW_COORDS.lat, lon: number = CHORZOW_COORDS.lon): PlanetData[] {
  const jd = getJulianDays(date);
  const d = jd - 2451545.0;
  const lst = getLST(date, lon);

  // Przybliżone elementy orbitalne Keplera dla planet (J2000.0)
  interface PlanetOrbit {
    name: string;
    symbol: string;
    N0: number; N1: number; // węzeł wstępujący
    i0: number; i1: number; // inklinacja
    w0: number; w1: number; // argument peryhelium
    a0: number; a1: number; // półoś wielka
    e0: number; e1: number; // mimośród
    M0: number; M1: number; // anomalia średnia
    magBase: number;
    color: string;
  }

  const orbits: PlanetOrbit[] = [
    { name: 'Księżyc 🌕', symbol: '☾', N0: 125.1228, N1: -0.0529538083, i0: 5.1454, i1: 0, w0: 318.0634, w1: 0.1643573223, a0: 0.00257, a1: 0, e0: 0.0549, e1: 0, M0: 115.3654, M1: 13.0649929509, magBase: -12.5, color: '#f8fafc' },
    { name: 'Merkury ☿', symbol: '☿', N0: 48.3313, N1: 3.24587e-5, i0: 7.0047, i1: 5.00e-8, w0: 29.1241, w1: 1.01444e-5, a0: 0.387098, a1: 0, e0: 0.205635, e1: 5.59e-10, M0: 168.6562, M1: 4.0923344368, magBase: -0.4, color: '#94a3b8' },
    { name: 'Wenus ♀', symbol: '♀', N0: 76.6799, N1: 2.46590e-5, i0: 3.3946, i1: 2.75e-8, w0: 54.8910, w1: 1.38374e-5, a0: 0.723330, a1: 0, e0: 0.006773, e1: -1.302e-9, M0: 48.0052, M1: 1.6021302244, magBase: -4.4, color: '#fef08a' },
    { name: 'Mars ♂', symbol: '♂', N0: 49.5574, N1: 2.11081e-5, i0: 1.8497, i1: -1.78e-8, w0: 286.5016, w1: 2.92961e-5, a0: 1.523688, a1: 0, e0: 0.093405, e1: 2.516e-9, M0: 18.6021, M1: 0.5240207766, magBase: -1.2, color: '#f87171' },
    { name: 'Jowisz ♃', symbol: '♃', N0: 100.4542, N1: 2.76854e-5, i0: 1.3030, i1: -1.557e-7, w0: 273.8777, w1: 1.64505e-5, a0: 5.20256, a1: 0, e0: 0.048498, e1: 4.469e-9, M0: 19.8950, M1: 0.0830853001, magBase: -2.7, color: '#fed7aa' },
    { name: 'Saturn ♄', symbol: '♄', N0: 113.6634, N1: 2.38980e-5, i0: 2.4886, i1: -1.081e-7, w0: 339.3939, w1: 2.97661e-5, a0: 9.55475, a1: 0, e0: 0.055546, e1: -9.499e-9, M0: 316.9670, M1: 0.0334442282, magBase: 0.4, color: '#fde047' },
    { name: 'Uran ♅', symbol: '♅', N0: 74.0005, N1: 1.3978e-5, i0: 0.7733, i1: 1.9e-8, w0: 96.6612, w1: 3.0565e-5, a0: 19.18171, a1: -1.55e-8, e0: 0.047318, e1: 7.45e-9, M0: 142.5905, M1: 0.011725806, magBase: 5.7, color: '#67e8f9' },
    { name: 'Neptun ♆', symbol: '♆', N0: 131.7806, N1: 3.0173e-5, i0: 1.7700, i1: -2.55e-7, w0: 272.8461, w1: -6.027e-6, a0: 30.05826, a1: 3.313e-8, e0: 0.008606, e1: 2.15e-9, M0: 260.2471, M1: 0.005995147, magBase: 7.8, color: '#818cf8' }
  ];

  // Obliczenie pozycji Ziemi dla heliocentrycznych konwersji
  const e_M = (356.0470 + 0.9856002585 * d) % 360;
  const e_w = 282.9404 + 4.70935e-5 * d;
  const e_e = 0.016709 - 1.151e-9 * d;
  const e_M_rad = e_M * DEG2RAD;
  const e_E = e_M_rad + e_e * Math.sin(e_M_rad) * (1.0 + e_e * Math.cos(e_M_rad));
  const e_x = Math.cos(e_E) - e_e;
  const e_y = Math.sin(e_E) * Math.sqrt(1 - e_e * e_e);
  const e_r = Math.sqrt(e_x * e_x + e_y * e_y);
  const e_v = Math.atan2(e_y, e_x);
  const e_lon = (e_v * RAD2DEG + e_w) % 360;
  const earth_x = e_r * Math.cos(e_lon * DEG2RAD);
  const earth_y = e_r * Math.sin(e_lon * DEG2RAD);

  const planets: PlanetData[] = [];

  for (const orbit of orbits) {
    const N = (orbit.N0 + orbit.N1 * d) % 360;
    const i = (orbit.i0 + orbit.i1 * d) % 360;
    const w = (orbit.w0 + orbit.w1 * d) % 360;
    const a = orbit.a0 + orbit.a1 * d;
    const e = orbit.e0 + orbit.e1 * d;
    const M = ((orbit.M0 + orbit.M1 * d) % 360 + 360) % 360;

    const M_rad = M * DEG2RAD;
    let E = M_rad + e * Math.sin(M_rad) * (1.0 + e * Math.cos(M_rad));
    // Iteracja Newtona-Raphsona dla równania Keplera
    for (let iter = 0; iter < 3; iter++) {
      E = E - (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
    }

    const x = a * (Math.cos(E) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const r = Math.sqrt(x * x + y * y);
    const v = Math.atan2(y, x);

    const N_rad = N * DEG2RAD;
    const i_rad = i * DEG2RAD;
    const wv_rad = (v + w * DEG2RAD);

    // Współrzędne heliocentryczne
    const xh = r * (Math.cos(N_rad) * Math.cos(wv_rad) - Math.sin(N_rad) * Math.sin(wv_rad) * Math.cos(i_rad));
    const yh = r * (Math.sin(N_rad) * Math.cos(wv_rad) + Math.cos(N_rad) * Math.sin(wv_rad) * Math.cos(i_rad));
    const zh = r * (Math.sin(wv_rad) * Math.sin(i_rad));

    // Geocentryczne
    let xg = xh - earth_x;
    let yg = yh - earth_y;
    let zg = zh;

    if (orbit.name.includes("Księżyc")) {
      // Dla Księżyca wektor geocentryczny
      xg = xh;
      yg = yh;
      zg = zh;
    }

    // Nachylenie ekliptyki (obliquity)
    const ecl = (23.4393 - 3.563e-7 * d) * DEG2RAD;
    const xe = xg;
    const ye = yg * Math.cos(ecl) - zg * Math.sin(ecl);
    const ze = yg * Math.sin(ecl) + zg * Math.cos(ecl);

    let raRad = Math.atan2(ye, xe);
    let raDeg = (raRad * RAD2DEG + 360) % 360;
    let decRad = Math.atan2(ze, Math.sqrt(xe * xe + ye * ye));
    let decDeg = decRad * RAD2DEG;

    const geoDistance = Math.sqrt(xg * xg + yg * yg + zg * zg);

    // Transformacja do układu Alt/Az
    const { alt, az } = equatorialToHorizontal(raDeg, decDeg, lat, lst);

    planets.push({
      name: orbit.name,
      symbol: orbit.symbol,
      alt: Math.round(alt * 100) / 100,
      az: Math.round(az * 100) / 100,
      direction: getCompassDirection(az),
      ra: formatRA(raDeg),
      dec: formatDec(decDeg),
      magnitude: orbit.magBase,
      distanceAU: Math.round(geoDistance * 1000) / 1000,
      isVisible: alt > 0,
      color: orbit.color
    });
  }

  return planets;
}
