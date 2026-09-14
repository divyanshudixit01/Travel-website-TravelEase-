import React from 'react';
import { ThreeCloudsCanvas } from './ThreeCloudsCanvas';

/**
 * ThreeHeroCanvas — High performance Three.js interactive hero atmosphere (TravelEase 2026)
 * Features:
 *  - Full-bleed alpine mountain scenery backdrop with mouse parallax
 *  - Celestial lighting: Radiant Sun (Light mode), Moon with lunar halo & twinkling starfield (Dark mode)
 *  - Floating volumetric billowy cotton clouds with natural horizontal wind drift
 *  - 3 Authentic IndiGo commercial airliners cruising along dual flight corridors:
 *    - Flight 1: 6E 101 (DEL ➔ BOM) Mid-Sky Eastbound Cruiser
 *    - Flight 2: 6E 404 (BLR ➔ DEL) High-Sky Eastbound Cruiser
 *    - Flight 3: 6E 808 (CCU ➔ DEL) Counter-Corridor Westbound Cruiser
 *    - Twin jet turbines with glowing exhaust, streaming contrails, and flashing navigation strobes
 */
export const ThreeHeroCanvas = ({ className = '', showAirplane = false }) => {
  return <ThreeCloudsCanvas className={className} showAirplane={showAirplane} />;
};

export { ThreeCloudsCanvas };
export default ThreeHeroCanvas;
