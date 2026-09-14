import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeCloudsCanvas — Cinematic Atmosphere & Multi-Airliner Engine (TravelEase 2026)
 *  - High-Definition Volumetric Cotton Clouds: Billowy, dense, fluffy, bright white cotton ball formations.
 *  - 3 Visible Authentic IndiGo Airliners:
 *    1. Flight 1 (Mid-Sky): Cruising Eastbound from the left across mid-sky (z = -120), cutting between cotton cloud layers.
 *    2. Flight 2 (High-Sky): Cruising Eastbound from the left at high altitude (z = -240), weaving through upper clouds.
 *    3. Flight 3 (Counter-Corridor): Cruising Westbound from the right across the lower/mid sky (z = -50) right across foreground cotton billows.
 *  - Authentic IndiGo Livery:
 *    - Aeronautical white upper fuselage & wings.
 *    - Signature deep royal IndiGo blue underbelly and belly chine.
 *    - IndiGo Sharklets with inner white trim at both wingtips.
 *    - Prominent IndiGo blue tailfin with white constellation/chevron motif.
 *    - Dual high-bypass turbofan engines in blue with polished chrome intake lip.
 *    - Glowing amber exhaust cores and twin streaming vapor contrails.
 *    - Flashing red/green navigation beacons and blinking white anti-collision strobes.
 */
export const ThreeCloudsCanvas = ({ className = '', showAirplane = false }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer, scene, camera;
    let skyMesh, sunMesh, moonMesh, starPoints, mountainMesh;
    const shootingStars = [];
    let cloudsGroup;
    const indigoFlights = [];
    let animationFrameId = 0;
    let isVisible = true;
    let isDark = document.documentElement.classList.contains('dark');

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const cloudsData = [];
    const texturesToDispose = new Set();
    const registerTexture = (tex) => {
      if (tex) texturesToDispose.add(tex);
      return tex;
    };

    // 1. Procedural Vertical Gradient Sky Texture
    const createSkyTexture = (dark) => {
      const c = document.createElement('canvas');
      c.width = 16;
      c.height = 512;
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 512);

      if (dark) {
        grad.addColorStop(0, '#020510');
        grad.addColorStop(0.28, '#081024');
        grad.addColorStop(0.62, '#0f1c3a');
        grad.addColorStop(1, '#152449');
      } else {
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.25, '#38bdf8');
        grad.addColorStop(0.58, '#7dd3fc');
        grad.addColorStop(1, '#dbeafe');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 512);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return registerTexture(tex);
    };

    // 2. Procedural Sun Texture (Brilliant core + golden-amber corona)
    const createSunTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');

      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 250);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.15, 'rgba(255, 250, 230, 0.98)');
      grad.addColorStop(0.32, 'rgba(251, 191, 36, 0.75)');
      grad.addColorStop(0.60, 'rgba(245, 158, 11, 0.32)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(256, 256, 250, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return registerTexture(tex);
    };

    // 3. Procedural Moon Texture (Silver-pearl disc with soft lunar halo & craters)
    const createMoonTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');

      // Outer silver halo
      const halo = ctx.createRadialGradient(256, 256, 90, 256, 256, 248);
      halo.addColorStop(0, 'rgba(226, 232, 240, 0.70)');
      halo.addColorStop(0.40, 'rgba(148, 163, 184, 0.28)');
      halo.addColorStop(0.75, 'rgba(100, 116, 139, 0.10)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, 512, 512);

      // Moon body
      const moonGrad = ctx.createRadialGradient(242, 242, 0, 256, 256, 96);
      moonGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      moonGrad.addColorStop(0.72, 'rgba(241, 245, 249, 0.98)');
      moonGrad.addColorStop(0.96, 'rgba(203, 213, 225, 0.92)');
      moonGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(256, 256, 96, 0, Math.PI * 2);
      ctx.fill();

      // Craters / maria
      const craters = [
        { x: 232, y: 236, r: 18, a: 0.14 },
        { x: 278, y: 268, r: 24, a: 0.12 },
        { x: 284, y: 226, r: 15, a: 0.09 },
        { x: 238, y: 286, r: 19, a: 0.10 },
        { x: 215, y: 260, r: 12, a: 0.08 },
      ];
      craters.forEach(({ x, y, r, a }) => {
        ctx.fillStyle = `rgba(100, 116, 139, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return registerTexture(tex);
    };

    // 4. Procedural High-Definition Volumetric Cotton Cloud Texture (Fluffy Cotton Balls)
    const createCottonCloudTexture = (type = 'cotton_cumulus') => {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 540;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 800, 540);

      if (type === 'cotton_cumulus') {
        // Voluminous billowy cumulus tower: dense, puffy, multi-lobed cotton formation
        const basePuffs = [
          { x: 280, y: 380, r: 165, a: 0.94, under: true },
          { x: 410, y: 390, r: 180, a: 0.96, under: true },
          { x: 540, y: 380, r: 160, a: 0.94, under: true },
          { x: 180, y: 360, r: 130, a: 0.88, under: true },
          { x: 640, y: 360, r: 135, a: 0.88, under: true },
        ];

        const mainPuffs = [
          { x: 340, y: 290, r: 175, a: 0.99 },
          { x: 470, y: 275, r: 190, a: 1.0 },
          { x: 230, y: 310, r: 150, a: 0.96 },
          { x: 580, y: 300, r: 155, a: 0.96 },
          { x: 400, y: 215, r: 170, a: 1.0 },
          { x: 295, y: 225, r: 145, a: 0.98 },
          { x: 505, y: 220, r: 150, a: 0.98 },
        ];

        const crownPuffs = [
          { x: 420, y: 140, r: 140, a: 1.0 },
          { x: 315, y: 155, r: 125, a: 0.99 },
          { x: 515, y: 150, r: 130, a: 0.99 },
          { x: 235, y: 190, r: 110, a: 0.96 },
          { x: 595, y: 185, r: 115, a: 0.96 },
          // Micro-rim puffs for fibrous cotton texture
          { x: 370, y: 105, r: 95, a: 1.0 },
          { x: 465, y: 110, r: 100, a: 1.0 },
        ];

        const allPuffs = [...basePuffs, ...mainPuffs, ...crownPuffs];

        allPuffs.forEach(({ x, y, r, a, under }) => {
          const grad = ctx.createRadialGradient(x, y - r * 0.15, r * 0.05, x, y, r);
          if (under) {
            grad.addColorStop(0, `rgba(246, 250, 255, ${a})`);
            grad.addColorStop(0.55, `rgba(235, 242, 252, ${a * 0.96})`);
            grad.addColorStop(0.85, `rgba(224, 234, 248, ${a * 0.60})`);
            grad.addColorStop(1, 'rgba(215, 226, 242, 0)');
          } else {
            grad.addColorStop(0, `rgba(255, 255, 255, ${a})`);
            grad.addColorStop(0.58, `rgba(255, 255, 255, ${a * 0.98})`);
            grad.addColorStop(0.86, `rgba(255, 255, 255, ${a * 0.70})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // 'cotton_puff': Rounded, bouncy, billowy cotton ball puff
        const puffs = [
          { x: 380, y: 320, r: 185, a: 0.96, under: true },
          { x: 255, y: 310, r: 155, a: 0.94, under: true },
          { x: 505, y: 310, r: 155, a: 0.94, under: true },
          // Mid body
          { x: 380, y: 235, r: 180, a: 1.0 },
          { x: 275, y: 235, r: 155, a: 0.98 },
          { x: 485, y: 235, r: 155, a: 0.98 },
          // Puffy crowns
          { x: 380, y: 150, r: 150, a: 1.0 },
          { x: 290, y: 165, r: 130, a: 0.99 },
          { x: 470, y: 165, r: 130, a: 0.99 },
          // Fluffy rim
          { x: 180, y: 270, r: 110, a: 0.90 },
          { x: 580, y: 270, r: 110, a: 0.90 },
        ];

        puffs.forEach(({ x, y, r, a, under }) => {
          const grad = ctx.createRadialGradient(x, y - r * 0.12, r * 0.05, x, y, r);
          if (under) {
            grad.addColorStop(0, `rgba(244, 248, 255, ${a})`);
            grad.addColorStop(0.55, `rgba(232, 240, 250, ${a * 0.95})`);
            grad.addColorStop(0.85, `rgba(220, 230, 246, ${a * 0.55})`);
            grad.addColorStop(1, 'rgba(215, 226, 242, 0)');
          } else {
            grad.addColorStop(0, `rgba(255, 255, 255, ${a})`);
            grad.addColorStop(0.58, `rgba(255, 255, 255, ${a * 0.98})`);
            grad.addColorStop(0.86, `rgba(255, 255, 255, ${a * 0.68})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      const texture = new THREE.CanvasTexture(c);
      texture.needsUpdate = true;
      return registerTexture(texture);
    };

    // Circular Particle Texture for Stars
    const createStarTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.20)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return registerTexture(new THREE.CanvasTexture(c));
    };

    // ============================================================
    // PROCEDURAL AUTHENTIC INDIGO AIRLINER GENERATOR (A320neo Livery)
    // ============================================================
    const createIndigoAircraft = ({
      scale = 2.0,
      direction = 1, // 1: Eastbound (+X, left-to-right), -1: Westbound (-X, right-to-left)
      initialX = 0,
      initialY = 120,
      initialZ = -150,
      speed = 1.8,
      flightNo = '6E 101',
      dark = false,
    }) => {
      const group = new THREE.Group();
      const strobes = [];
      const contrails = [];
      const whiteMaterials = [];
      const wingMaterials = [];

      // Authentic High-Contrast IndiGo Colors
      const indigoBlue = 0x00248f; // Vibrant royal IndiGo blue
      const fuselageWhite = dark ? 0xf1f5f9 : 0xffffff;
      const metalSilver = 0xd5dce6; // Chrome intake cowl lip
      const cockpitDark = 0x0b1120; // Flight deck tinted glass
      const exhaustAmber = 0xff9900; // Glowing jet turbine core
      const wingGrey = dark ? 0x94a3b8 : 0xedf2f7;

      const whiteMat = new THREE.MeshBasicMaterial({ color: fuselageWhite, depthTest: true, depthWrite: true });
      whiteMaterials.push(whiteMat);

      const indigoMat = new THREE.MeshBasicMaterial({ color: indigoBlue, depthTest: true, depthWrite: true });

      const wingMat = new THREE.MeshBasicMaterial({ color: wingGrey, depthTest: true, depthWrite: true });
      wingMaterials.push(wingMat);

      const cockpitMat = new THREE.MeshBasicMaterial({ color: cockpitDark, depthTest: true, depthWrite: true });
      const silverMat = new THREE.MeshBasicMaterial({ color: metalSilver, depthTest: true, depthWrite: true });
      const exhaustMat = new THREE.MeshBasicMaterial({
        color: exhaustAmber,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true,
      });

      // 1. Upper White Fuselage
      const upperFuselageGeo = new THREE.CylinderGeometry(7.2, 5.2, 115, 16);
      upperFuselageGeo.rotateZ(Math.PI / 2);
      const upperFuselage = new THREE.Mesh(upperFuselageGeo, whiteMat);
      upperFuselage.position.set(0, 0.6, 0);
      group.add(upperFuselage);

      // 2. Lower IndiGo Blue Belly (Distinctive IndiGo two-tone split livery)
      const lowerBellyGeo = new THREE.CylinderGeometry(7.0, 5.0, 112, 16);
      lowerBellyGeo.rotateZ(Math.PI / 2);
      const lowerBelly = new THREE.Mesh(lowerBellyGeo, indigoMat);
      lowerBelly.position.set(-1, -1.6, 0);
      group.add(lowerBelly);

      // 3. Aerodynamic Nose Cone (White upper dome / Navy lower chin)
      const noseUpperGeo = new THREE.ConeGeometry(5.2, 26, 16);
      noseUpperGeo.rotateZ(-Math.PI / 2);
      const noseUpper = new THREE.Mesh(noseUpperGeo, whiteMat);
      noseUpper.position.set(57.5 + 13, 0.4, 0);
      group.add(noseUpper);

      const noseBellyGeo = new THREE.ConeGeometry(5.0, 24, 16);
      noseBellyGeo.rotateZ(-Math.PI / 2);
      const noseBelly = new THREE.Mesh(noseBellyGeo, indigoMat);
      noseBelly.position.set(56.5 + 12, -1.2, 0);
      group.add(noseBelly);

      // Black Weather Radome Tip
      const radomeGeo = new THREE.SphereGeometry(1.5, 8, 8);
      const radomeMesh = new THREE.Mesh(radomeGeo, cockpitMat);
      radomeMesh.position.set(57.5 + 26, -0.2, 0);
      group.add(radomeMesh);

      // 4. Cockpit Windshield (Modern A320neo wraparound dark glass mask)
      const cockpitGeo = new THREE.BoxGeometry(13, 4.6, 10.5);
      const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
      cockpitMesh.position.set(52, 3.8, 0);
      group.add(cockpitMesh);

      // 5. IndiGo Forward Cabin Branding Band & Passenger Windows
      const brandingGeo = new THREE.BoxGeometry(48, 1.8, 14.8);
      const brandingMesh = new THREE.Mesh(brandingGeo, indigoMat);
      brandingMesh.position.set(12, 1.4, 0);
      group.add(brandingMesh);

      const windowStripGeo = new THREE.BoxGeometry(64, 1.2, 14.9);
      const windowStripMesh = new THREE.Mesh(windowStripGeo, cockpitMat);
      windowStripMesh.position.set(-8, 2.2, 0);
      group.add(windowStripMesh);

      // 6. Main Swept Wings
      const wingGeo = new THREE.BoxGeometry(32, 2.2, 185);
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      wingMesh.position.set(4, -0.2, 0);
      group.add(wingMesh);

      // 7. Signature IndiGo Winglets / Sharklets (Tall navy blue wingtips with inner white accent)
      [-92.5, 92.5].forEach((zPos) => {
        const sharkletGeo = new THREE.BoxGeometry(12, 15, 2.4);
        const sharkletMesh = new THREE.Mesh(sharkletGeo, indigoMat);
        sharkletMesh.position.set(-6, 6.5, zPos);
        group.add(sharkletMesh);

        const innerStripeGeo = new THREE.BoxGeometry(8, 12, 0.8);
        const innerStripeMesh = new THREE.Mesh(innerStripeGeo, whiteMat);
        innerStripeMesh.position.set(-6, 6.5, zPos > 0 ? zPos - 1.3 : zPos + 1.3);
        group.add(innerStripeMesh);
      });

      // 8. Vertical Stabilizer (Iconic IndiGo Deep Navy Tailfin)
      const tailFinGeo = new THREE.BoxGeometry(24, 38, 2.8);
      const tailFinMesh = new THREE.Mesh(tailFinGeo, indigoMat);
      tailFinMesh.position.set(-44, 17, 0);
      tailFinMesh.rotation.z = -0.36;
      group.add(tailFinMesh);

      // IndiGo Tailfin White Accent (Chevron / constellation dots motif)
      const tailGraphicGeo = new THREE.BoxGeometry(14, 20, 3.0);
      const tailGraphicMesh = new THREE.Mesh(tailGraphicGeo, whiteMat);
      tailGraphicMesh.position.set(-42, 18, 0);
      tailGraphicMesh.rotation.z = -0.36;
      tailGraphicMesh.scale.set(0.65, 0.65, 1.05);
      group.add(tailGraphicMesh);

      // Horizontal Stabilizers
      const hStabGeo = new THREE.BoxGeometry(18, 1.8, 62);
      const hStabMesh = new THREE.Mesh(hStabGeo, wingMat);
      hStabMesh.position.set(-48, 4.2, 0);
      group.add(hStabMesh);

      // 9. Twin High-Bypass Turbofan Engines (Under-wing nacelles)
      [-30, 30].forEach((zOffset) => {
        // IndiGo Blue Nacelle Body
        const nacelleGeo = new THREE.CylinderGeometry(5.4, 4.8, 28, 16);
        nacelleGeo.rotateZ(Math.PI / 2);
        const nacelleMesh = new THREE.Mesh(nacelleGeo, indigoMat);
        nacelleMesh.position.set(8, -6, zOffset);
        group.add(nacelleMesh);

        // Chrome Intake Cowl Ring
        const intakeGeo = new THREE.CylinderGeometry(5.5, 5.4, 4, 16);
        intakeGeo.rotateZ(Math.PI / 2);
        const intakeMesh = new THREE.Mesh(intakeGeo, silverMat);
        intakeMesh.position.set(22, -6, zOffset);
        group.add(intakeMesh);

        // Dark Fan Spinner Cone
        const spinnerGeo = new THREE.ConeGeometry(2.2, 7, 12);
        spinnerGeo.rotateZ(-Math.PI / 2);
        const spinnerMesh = new THREE.Mesh(spinnerGeo, cockpitMat);
        spinnerMesh.position.set(21, -6, zOffset);
        group.add(spinnerMesh);

        // Glowing Turbine Exhaust Ring
        const exhaustGeo = new THREE.RingGeometry(1.4, 4.8, 14);
        exhaustGeo.rotateY(-Math.PI / 2);
        const exhaustMesh = new THREE.Mesh(exhaustGeo, exhaustMat);
        exhaustMesh.position.set(-6, -6, zOffset);
        group.add(exhaustMesh);

        // Contrails (Volumetric vapor trails streaming behind engines)
        const contrailGeo = new THREE.PlaneGeometry(450, 4.8);
        contrailGeo.rotateX(Math.PI / 2);
        const contrailMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: dark ? 0.45 : 0.70,
          depthWrite: false,
        });
        const contrailMesh = new THREE.Mesh(contrailGeo, contrailMat);
        contrailMesh.position.set(-232, -6, zOffset);
        group.add(contrailMesh);
        contrails.push(contrailMesh);
      });

      // 10. Aviation Navigation Lights
      const redNavLight = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff1a1a })
      );
      redNavLight.position.set(-6, 5.5, -92.5);
      group.add(redNavLight);

      const greenNavLight = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00e676 })
      );
      greenNavLight.position.set(-6, 5.5, 92.5);
      group.add(greenNavLight);

      // Anti-collision Flashing Strobes
      const tailStrobe = new THREE.Mesh(
        new THREE.SphereGeometry(2.8, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      tailStrobe.position.set(-58, 4.5, 0);
      group.add(tailStrobe);
      strobes.push(tailStrobe);

      const topStrobe = new THREE.Mesh(
        new THREE.SphereGeometry(2.8, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      topStrobe.position.set(-2, 7.8, 0);
      group.add(topStrobe);
      strobes.push(topStrobe);

      // Apply Scale
      group.scale.set(scale, scale, scale);

      // Apply Initial Position & Orientation
      if (direction === -1) {
        // Cruising Westbound (Right-to-Left): rotate 180° around Y
        group.rotation.y = Math.PI;
      }
      group.position.set(initialX, initialY, initialZ);

      return {
        group,
        direction,
        speed,
        baseY: initialY,
        baseZ: initialZ,
        scale,
        flightNo,
        strobes,
        contrails,
        whiteMaterials,
        wingMaterials,
      };
    };

    // Theme Atmosphere Update
    const updateThemeAtmosphere = () => {
      isDark = document.documentElement.classList.contains('dark');
      if (!scene) return;

      // Update Sky
      if (skyMesh) {
        if (skyMesh.material.map) {
          skyMesh.material.map.dispose();
          texturesToDispose.delete(skyMesh.material.map);
        }
        skyMesh.material.map = createSkyTexture(isDark);
        skyMesh.material.needsUpdate = true;
      }

      // Update Sun & Moon
      if (sunMesh) {
        sunMesh.material.opacity = isDark ? 0 : 0.98;
      }
      if (moonMesh) {
        moonMesh.material.opacity = isDark ? 0.98 : 0;
      }

      // Update Stars
      if (starPoints) {
        starPoints.material.opacity = isDark ? 0.90 : 0;
      }

      // Update Mountain Scenery Tone
      if (mountainMesh) {
        if (isDark) {
          mountainMesh.material.color.set(0x7588a8);
          mountainMesh.material.opacity = 0.90;
        } else {
          mountainMesh.material.color.set(0xffffff);
          mountainMesh.material.opacity = 0.98;
        }
        mountainMesh.material.needsUpdate = true;
      }

      // Update Cotton Clouds (Brilliant pure white in Light Mode, glowing moonlit silver in Dark Mode)
      if (cloudsData.length > 0) {
        cloudsData.forEach((item) => {
          if (isDark) {
            item.mesh.material.color.set(0xb8c9df);
            item.mesh.material.opacity = 0.18;
          } else {
            item.mesh.material.color.set(0xffffff);
            item.mesh.material.opacity = 0.22;
          }
          item.mesh.material.needsUpdate = true;
        });
      }

      // Update IndiGo Aircraft Materials
      if (indigoFlights.length > 0) {
        indigoFlights.forEach(({ whiteMaterials, wingMaterials, contrails }) => {
          if (whiteMaterials) {
            whiteMaterials.forEach((mat) => {
              mat.color.set(isDark ? 0xf1f5f9 : 0xffffff);
              mat.needsUpdate = true;
            });
          }
          if (wingMaterials) {
            wingMaterials.forEach((mat) => {
              mat.color.set(isDark ? 0x94a3b8 : 0xedf2f7);
              mat.needsUpdate = true;
            });
          }
          if (contrails) {
            contrails.forEach((mesh) => {
              mesh.material.opacity = isDark ? 0.45 : 0.70;
              mesh.material.needsUpdate = true;
            });
          }
        });
      }
    };

    const init = () => {
      try {
        const width = container.clientWidth || window.innerWidth || 1200;
        const height = container.clientHeight || 700;
        const isMobile = width < 768 || (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

        // Safe WebGL context detection
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          return false;
        }

        renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl,
          alpha: true,
          antialias: !isMobile, // Disable MSAA on budget mobile to conserve GPU fill-rate
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.25) : Math.min(window.devicePixelRatio, 2));

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, Math.max(width / Math.max(height, 1), 0.1), 1, 3500);
        camera.position.set(0, 0, 550);

      // ============================================================
      // 1. CELESTIAL: TWINKLING STARS (DARK MODE: z = -525)
      // ============================================================
      const starCount = isMobile ? 350 : 950;
      const starGeo = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      const colorWhite = new THREE.Color(0xffffff);
      const colorBlue = new THREE.Color(0xdbeafe);
      const colorAmber = new THREE.Color(0xfef3c7);

      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 2800;
        starPositions[i * 3 + 1] = Math.random() * 700 - 30;
        starPositions[i * 3 + 2] = -525 + (Math.random() - 0.5) * 20;

        const rand = Math.random();
        const col = rand > 0.6 ? colorBlue : rand > 0.25 ? colorWhite : colorAmber;
        starColors[i * 3] = col.r;
        starColors[i * 3 + 1] = col.g;
        starColors[i * 3 + 2] = col.b;
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 3.5,
        map: createStarTexture(),
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.90 : 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      starPoints = new THREE.Points(starGeo, starMat);
      starPoints.renderOrder = 0;
      scene.add(starPoints);

      // Reset outer shootingStars array
      shootingStars.length = 0;
      const shootingStarCount = 3;
      for (let i = 0; i < shootingStarCount; i++) {
        const lineGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xa5f3fc,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        line.renderOrder = 4;
        scene.add(line);
        shootingStars.push({
          line,
          active: false,
          head: new THREE.Vector3(),
          tail: new THREE.Vector3(),
          speed: 14,
          dx: 1.2,
          dy: -0.7,
          life: 0,
          maxLife: 40,
          delay: Math.floor(Math.random() * 100 + 20),
        });
      }

      // ============================================================
      // 3. CELESTIAL: SUN (LIGHT MODE: z = -520)
      // ============================================================
      const sunGeo = new THREE.PlaneGeometry(360, 360);
      const sunMat = new THREE.MeshBasicMaterial({
        map: createSunTexture(),
        transparent: true,
        opacity: isDark ? 0 : 0.98,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      sunMesh = new THREE.Mesh(sunGeo, sunMat);
      sunMesh.position.set(380, 230, -520);
      sunMesh.renderOrder = 1;
      scene.add(sunMesh);

      // ============================================================
      // 4. CELESTIAL: MOON (DARK MODE: z = -520)
      // ============================================================
      const moonGeo = new THREE.PlaneGeometry(270, 270);
      const moonMat = new THREE.MeshBasicMaterial({
        map: createMoonTexture(),
        transparent: true,
        opacity: isDark ? 0.98 : 0,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.position.set(350, 220, -520);
      moonMesh.renderOrder = 1;
      scene.add(moonMesh);

      // ============================================================
      // 5. 3D FLOATING VOLUMETRIC COTTON CLOUDS (Subtle Ambient Wisps)
      // ============================================================
      cloudsGroup = new THREE.Group();
      scene.add(cloudsGroup);

      const cottonCumulusTexture = createCottonCloudTexture('cotton_cumulus');
      const cottonPuffTexture = createCottonCloudTexture('cotton_puff');

      const geoCumulus = new THREE.PlaneGeometry(860, 560);
      const geoPuff = new THREE.PlaneGeometry(700, 480);

      const cloudCount = 4;

      for (let i = 0; i < cloudCount; i++) {
        const isPuff = i % 2 === 0;
        const texture = isPuff ? cottonPuffTexture : cottonCumulusTexture;
        const geometry = isPuff ? geoPuff : geoCumulus;

        const initialOpacity = isDark ? 0.18 : 0.22;
        const initialColor = isDark
          ? new THREE.Color(0xb8c9df)
          : new THREE.Color(0xffffff);

        const cloudMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: initialOpacity,
          color: initialColor,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, cloudMat);
        mesh.renderOrder = 2;

        const zPos = -120 - i * 30;
        const xPos = ((i / cloudCount) * 2200) - 1100 + (Math.random() - 0.5) * 80;

        // Position ONLY at lower valley mist (-230) and high sky margin (+220), leaving the mountain completely clear!
        const yPos = i < 2 ? (-230 + Math.random() * 40) : (230 + Math.random() * 40);

        mesh.position.set(xPos, yPos, zPos);

        const scale = 0.70 + Math.random() * 0.25;
        mesh.scale.set(scale, scale, 1);

        cloudsGroup.add(mesh);

        cloudsData.push({
          mesh,
          speedX: 0.10 + Math.random() * 0.10,
          baseY: yPos,
          floatFreq: 0.0005 + Math.random() * 0.0004,
          floatAmp: 4 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // ============================================================
      // 7. THREE PROMINENT AUTHENTIC INDIGO AIRLINERS
      // ============================================================
      if (showAirplane) {
        // Flight 1: Eastbound Cruiser from Left (Mid-Sky corridor, z = -120)
        // Scaled large (2.2), positioned on-screen at x = -80 so it is immediately visible!
        const flight1 = createIndigoAircraft({
          scale: 2.2,
          direction: 1, // Eastbound (+X)
          initialX: -80,
          initialY: 110,
          initialZ: -120,
          speed: 1.5,
          flightNo: '6E 101 DEL ➔ BOM',
          dark: isDark,
        });
        flight1.group.renderOrder = 3;
        scene.add(flight1.group);
        indigoFlights.push(flight1);

        // Flight 2: Eastbound Cruiser from Left (High-Sky corridor, z = -240)
        // Scaled 1.85, positioned in upper sky
        const flight2 = createIndigoAircraft({
          scale: 1.85,
          direction: 1, // Eastbound (+X)
          initialX: -380,
          initialY: 220,
          initialZ: -240,
          speed: 1.2,
          flightNo: '6E 404 BLR ➔ DEL',
          dark: isDark,
        });
        flight2.group.renderOrder = 3;
        scene.add(flight2.group);
        indigoFlights.push(flight2);

        // Flight 3: Westbound Cruiser from Right (Counter-Corridor, z = -50)
        // Scaled 2.4, positioned on-screen at x = +240, cruising leftwards!
        const flight3 = createIndigoAircraft({
          scale: 2.4,
          direction: -1, // Westbound (-X, coming from right)
          initialX: 240,
          initialY: 20,
          initialZ: -50,
          speed: -1.6,
          flightNo: '6E 808 CCU ➔ DEL',
          dark: isDark,
        });
        flight3.group.renderOrder = 3;
        scene.add(flight3.group);
        indigoFlights.push(flight3);
      }
      return true;
    } catch (err) {
      console.info('[ThreeCloudsCanvas] WebGL init fallback:', err.message);
      return false;
    }
  };

  const initialized = init();
  if (!initialized) {
    return () => {};
  }

  // WebGL context lost handler to prevent browser console exceptions
  const handleContextLost = (e) => {
    e.preventDefault();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
  canvas.addEventListener('webglcontextlost', handleContextLost, false);

    // Mouse Parallax Listener
    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Resize Observer
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Theme Toggle Observer
    const themeObserver = new MutationObserver(() => {
      updateThemeAtmosphere();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Viewport Visibility Observer
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        animate();
      }
    });
    intersectionObserver.observe(container);

    // Master Animation Loop
    const startTime = performance.now();

    const animate = () => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Detect user vestibular motion preference
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        camera.position.x = 0;
        camera.position.y = 0;
        camera.lookAt(0, 0, 0);
      } else {
        // Smooth mouse lerping
        mouse.x += (mouse.targetX - mouse.x) * 0.035;
        mouse.y += (mouse.targetY - mouse.y) * 0.035;

        // Gentle camera parallax displacement
        camera.position.x = mouse.x * 24;
        camera.position.y = mouse.y * 15;
        camera.lookAt(0, 0, 0);
      }

      // Subtle celestial floating & breathing
      if (sunMesh && sunMesh.material.opacity > 0) {
        sunMesh.scale.setScalar(1 + Math.sin(elapsedTime * 1.4) * 0.03);
        sunMesh.position.y = 230 + Math.sin(elapsedTime * 0.8) * 4;
      }
      if (moonMesh && moonMesh.material.opacity > 0) {
        moonMesh.position.y = 220 + Math.sin(elapsedTime * 0.75) * 6;
      }

      // Dynamic Shooting Stars in Dark Mode
      if (isDark && shootingStars && shootingStars.length > 0) {
        shootingStars.forEach((star) => {
          if (!star.active) {
            star.delay--;
            if (star.delay <= 0) {
              star.active = true;
              star.life = 0;
              star.maxLife = 35 + Math.random() * 25;
              const startX = -600 + Math.random() * 800;
              const startY = 160 + Math.random() * 200;
              const startZ = -510;
              star.head.set(startX, startY, startZ);
              star.tail.copy(star.head);
              star.speed = 12 + Math.random() * 6;
              const angle = -0.45 - Math.random() * 0.25;
              star.dx = Math.cos(angle);
              star.dy = Math.sin(angle);
            }
          } else {
            star.life++;
            star.head.x += star.dx * star.speed;
            star.head.y += star.dy * star.speed;

            const trailLength = Math.min(star.life * star.speed * 0.75, 130);
            star.tail.x = star.head.x - star.dx * trailLength;
            star.tail.y = star.head.y - star.dy * trailLength;
            star.tail.z = star.head.z;

            const progress = star.life / star.maxLife;
            const opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
            star.line.material.opacity = Math.max(0, opacity * 0.95);

            const pos = star.line.geometry.attributes.position;
            pos.setXYZ(0, star.head.x, star.head.y, star.head.z);
            pos.setXYZ(1, star.tail.x, star.tail.y, star.tail.z);
            pos.needsUpdate = true;

            if (star.life >= star.maxLife) {
              star.active = false;
              star.line.material.opacity = 0;
              star.delay = Math.floor(Math.random() * 180 + 70);
            }
          }
        });
      } else if (!isDark && shootingStars && shootingStars.length > 0) {
        shootingStars.forEach((star) => {
          star.active = false;
          star.line.material.opacity = 0;
        });
      }

      // Continuous natural horizontal wind drift for cotton clouds
      for (let i = 0; i < cloudsData.length; i++) {
        const item = cloudsData[i];
        item.mesh.position.x += item.speedX;
        item.mesh.position.y = item.baseY + Math.sin(elapsedTime * 0.45 + item.phase) * item.floatAmp;

        // Seamless infinite wrap-around
        if (item.mesh.position.x > 1400) {
          item.mesh.position.x = -1400;
          const verticalZone = i % 3;
          if (verticalZone === 0) {
            item.baseY = 80 + Math.random() * 180;
          } else if (verticalZone === 1) {
            item.baseY = -50 + Math.random() * 120;
          } else {
            item.baseY = -190 + Math.random() * 110;
          }
        }
      }

      // Animate All 3 IndiGo Airliners Moving Through Cotton Clouds
      if (indigoFlights.length > 0) {
        indigoFlights.forEach((flight, idx) => {
          const { group, direction, speed, baseY } = flight;

          if (direction === 1) {
            // Eastbound: Cruising from Left to Right
            group.position.x += speed;
            group.position.y = baseY + Math.sin(elapsedTime * 0.45 + idx * 1.5) * 16;
            group.rotation.z = Math.sin(elapsedTime * 0.5 + idx) * 0.025 - 0.012;
            group.rotation.y = Math.cos(elapsedTime * 0.35 + idx) * 0.012;

            // Infinite flight wrap-around (Left to Right)
            if (group.position.x > 850) {
              group.position.x = -850;
              if (idx === 0) flight.baseY = 100 + Math.random() * 45;
              if (idx === 1) flight.baseY = 200 + Math.random() * 50;
            }
          } else {
            // Westbound: Cruising from Right to Left (Counter Corridor)
            group.position.x += speed; // speed is negative (-1.7)
            group.position.y = baseY + Math.sin(elapsedTime * 0.4 + 2.2) * 14;
            group.rotation.z = -(Math.sin(elapsedTime * 0.45 + 2.2) * 0.025 - 0.012);
            group.rotation.y = Math.PI + Math.cos(elapsedTime * 0.3 + 2.2) * 0.012;

            // Infinite flight wrap-around (Right to Left)
            if (group.position.x < -850) {
              group.position.x = 850;
              flight.baseY = 15 + Math.random() * 40;
            }
          }

          // Aviation Navigation Strobes Pulsing (Realistic blinking strobe)
          const isStrobeOn = Math.sin(elapsedTime * 5.5 + idx * 2.0) > 0.45;
          flight.strobes.forEach((strobe) => {
            strobe.visible = isStrobeOn;
          });
        });
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();

      // Deep recursive scene graph disposal
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => {
                if (mat.map && typeof mat.map.dispose === 'function') mat.map.dispose();
                mat.dispose();
              });
            } else {
              if (object.material.map && typeof object.material.map.dispose === 'function') {
                object.material.map.dispose();
              }
              object.material.dispose();
            }
          }
        });
        scene.clear();
      }

      // Explicitly dispose all procedural canvas textures
      texturesToDispose.forEach((tex) => {
        if (tex && typeof tex.dispose === 'function') {
          tex.dispose();
        }
      });
      texturesToDispose.clear();

      // Cleanly dispose WebGL renderer without permanently corrupting the canvas context
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [showAirplane]);

  return (
    <div
      ref={containerRef}
      style={{ transform: 'translateZ(0)', contain: 'paint layout' }}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Soft atmospheric gradient blend at base, keeping sky and cotton clouds radiant */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-80% to-slate-50/70 dark:to-[#070a13]/75 pointer-events-none" />
    </div>
  );
};

export default React.memo(ThreeCloudsCanvas);
