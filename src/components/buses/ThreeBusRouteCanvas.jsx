import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeBusRouteCanvas
 * Three.js interactive highway perspective grid, glowing transit velocity streaks,
 * and pulsating waypoint nodes.
 * Gives the Buses hero and dashboard a high-tech, luxury intercity transport feel.
 */
export const ThreeBusRouteCanvas = ({ className = '' }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    let renderer, scene, camera;
    let speedLinesGroup;
    let waypointsGroup;
    let gridHelper;
    let animationFrameId = 0;
    let isVisible = true;

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const init = () => {
      try {
        const width = container.clientWidth || window.innerWidth || 1200;
        const height = container.clientHeight || 500;
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return false;

        renderer = new THREE.WebGLRenderer({
          canvas,
          context: gl,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, Math.max(width / Math.max(height, 1), 0.1), 0.1, 1000);
        camera.position.set(0, 10, 45);
        camera.lookAt(0, 4, 0);

        speedLinesGroup = new THREE.Group();
        waypointsGroup = new THREE.Group();
        scene.add(speedLinesGroup);
        scene.add(waypointsGroup);

      // ─── 1. Perspective Highway Grid ────────────────────────────────────────
      const size = 120;
      const divisions = 24;
      gridHelper = new THREE.GridHelper(size, divisions, 0xf59e0b, 0x334155);
      gridHelper.position.y = -6;
      gridHelper.material.opacity = 0.22;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);

      // ─── 2. Moving Velocity Streaks (Speed Lines) ───────────────────────────
      const lineCount = 36;
      const streakLines = [];

      for (let i = 0; i < lineCount; i++) {
        const x = (Math.random() - 0.5) * 60;
        const zStart = (Math.random() - 0.5) * 80;
        const length = 6 + Math.random() * 12;
        const y = -5.8 + Math.random() * 2;

        const points = [
          new THREE.Vector3(x, y, zStart),
          new THREE.Vector3(x, y, zStart + length)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);

        const isGold = Math.random() > 0.4;
        const mat = new THREE.LineBasicMaterial({
          color: isGold ? 0xf59e0b : 0x10b981,
          transparent: true,
          opacity: 0.35 + Math.random() * 0.4
        });

        const line = new THREE.Line(geo, mat);
        line.userData = { speed: 0.4 + Math.random() * 0.6, zOrigin: zStart, length, x, y };
        speedLinesGroup.add(line);
        streakLines.push(line);
      }

      // ─── 3. Glowing Intercity Waypoints ─────────────────────────────────────
      const waypoints = [
        { x: -18, z: -10, label: 'Origin Hub', color: 0xf59e0b },
        { x: 0, z: 5, label: 'Midway Express', color: 0x10b981 },
        { x: 18, z: -8, label: 'Destination Terminal', color: 0x38bdf8 }
      ];

      waypoints.forEach((wp) => {
        // Center Beacon
        const sphereGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
          color: wp.color,
          transparent: true,
          opacity: 0.85
        });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(wp.x, -5, wp.z);
        waypointsGroup.add(mesh);

        // Ground Target Ring
        const ringGeo = new THREE.RingGeometry(1.5, 1.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: wp.color,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(wp.x, -5.8, wp.z);
        ring.rotation.x = Math.PI / 2;
        waypointsGroup.add(ring);
      });
      return true;
    } catch (err) {
      console.info('[ThreeBusRouteCanvas] WebGL init fallback:', err.message);
      return false;
    }
  };

  const initialized = init();
  if (!initialized) {
    return () => {};
  }

  const handleContextLost = (e) => {
    e.preventDefault();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
  canvas.addEventListener('webglcontextlost', handleContextLost, false);

    // Mouse listener
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / rect.width - 0.5) * 2;
      mouse.targetY = -(clientY / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Loop
    const startTime = performance.now();
    let lastTime = startTime;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible || !renderer || !scene || !camera || !speedLinesGroup || !waypointsGroup) return;

      const now = performance.now();
      const delta = (now - lastTime) * 0.001;
      lastTime = now;
      const elapsedTime = (now - startTime) * 0.001;

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      camera.position.x = mouse.x * 6;
      camera.position.y = 10 + mouse.y * 2;
      camera.lookAt(0, 4, 0);

      // Animate speed lines moving towards the camera
      if (speedLinesGroup.children) {
        speedLinesGroup.children.forEach((line) => {
          line.position.z += line.userData.speed * 40 * delta;
          if (line.position.z > 30) {
            line.position.z = -50;
          }
        });
      }

      // Pulse waypoint rings
      if (waypointsGroup.children) {
        waypointsGroup.children.forEach((child, idx) => {
          if (child.geometry?.type === 'RingGeometry') {
            const s = 1 + Math.sin(elapsedTime * 3 + idx) * 0.15;
            child.scale.set(s, s, s);
          }
        });
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      // Deep recursive disposal of Three.js objects
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => {
                mat.map?.dispose();
                mat.dispose();
              });
            } else {
              object.material.map?.dispose();
              object.material.dispose();
            }
          }
        });
        scene.clear();
      }

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default ThreeBusRouteCanvas;
