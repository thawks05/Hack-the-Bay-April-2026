import { CITY_KPIS, PROJECTS, ALERTS } from './districts';

function safeLocalStorage(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getPageContext(pathname: string): string {
  let context = `[CURRENT PAGE CONTEXT]\nPage: ${pathname}\n`;

  if (pathname === '/map') {
    const selectedDistrict =
      safeLocalStorage('selectedDistrict') || 'None selected';
    const activeLayer = safeLocalStorage('activeLayer') || 'energy';
    context += `Selected District: ${selectedDistrict}\n`;
    context += `Active Layer: ${activeLayer}\n`;
    context += `City KPI Summary: Total MWh ${CITY_KPIS.totalMwh}, Peak MW ${CITY_KPIS.peakMw}, Waste ${CITY_KPIS.wastePercent}%, Renewable ${CITY_KPIS.renewablePercent}%\n`;
    context += `Districts visible: Downtown Core, Westshore, Channelside, Hyde Park, Riverwalk, Ybor City, Harbour Island, Armature Works\n`;
  } else if (pathname === '/dashboard') {
    context += `KPIs:\n`;
    context += `  Total MWh: ${CITY_KPIS.totalMwh}\n`;
    context += `  Peak MW: ${CITY_KPIS.peakMw}\n`;
    context += `  Energy Waste: ${CITY_KPIS.wastePercent}%\n`;
    context += `  Renewable: ${CITY_KPIS.renewablePercent}%\n`;
    context += `Grid Status:\n`;
    context += `  Stress Level: ${CITY_KPIS.gridStress}\n`;
    context += `  Capacity Used: ${CITY_KPIS.gridCapacityPercent}%\n`;
    context += `  Total Demand: ${CITY_KPIS.totalDemandMw} MW\n`;
    context += `  Clean Energy: ${CITY_KPIS.cleanEnergyPercent}%\n`;
    context += `Active Alerts:\n`;
    ALERTS.forEach((a) => {
      context += `  [${a.level.toUpperCase()}] ${a.district}: ${a.message}\n`;
    });
    context += `Power Budget: ${CITY_KPIS.gridCapacityPercent}% capacity used, ${100 - CITY_KPIS.gridCapacityPercent}% headroom remaining\n`;
  } else if (pathname === '/recommendations') {
    context += `Optimization Projects (ranked by score):\n`;
    PROJECTS.forEach((p) => {
      context += `  Score ${p.score}/100: "${p.name}" — District: ${p.districtId}, Type: ${p.type}, Cost: ${p.cost}, Timeline: ${p.time}, Impact: ${p.impact}\n`;
    });
    context += `Total projects: ${PROJECTS.length}\n`;
    context += `Budget range: $1.2M – $4.2M per project\n`;
  } else if (pathname === '/roadmap') {
    const roadmapYear = safeLocalStorage('roadmapYear') || '2030';
    const year = parseInt(roadmapYear, 10);
    const startYear = 2025;
    const endYear = 2054;
    const startRenewable = 23;
    const endRenewable = 100;
    const progress = Math.min(
      endRenewable,
      Math.max(
        startRenewable,
        startRenewable +
          ((year - startYear) / (endYear - startYear)) *
            (endRenewable - startRenewable)
      )
    );
    context += `Selected Roadmap Year: ${roadmapYear}\n`;
    context += `Projected Renewable %: ${progress.toFixed(1)}%\n`;
    context += `Current Baseline: 23% renewable (2025)\n`;
    context += `Target: 100% renewable by 2054\n`;
    context += `Key Milestones: 2028 solar grid phase 1, 2030 EV fleet electrification, 2035 offshore wind, 2040 hydrogen pilots, 2050 full grid decarbonization\n`;
  } else if (pathname === '/chat') {
    context += `Full AI chat interface — all district and city data available.\n`;
    context += `City KPIs: Total MWh ${CITY_KPIS.totalMwh}, Peak MW ${CITY_KPIS.peakMw}, Waste ${CITY_KPIS.wastePercent}%, Renewable ${CITY_KPIS.renewablePercent}%\n`;
  } else {
    context += `No data context for this page.\n`;
  }

  context += `[END CONTEXT]`;
  return context;
}
