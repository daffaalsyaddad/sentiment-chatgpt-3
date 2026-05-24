import { useEffect, useRef } from "react";
import * as THREE from "three";

function ParticleBackground() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      58,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020617, 0);
    container.appendChild(renderer.domElement);

    const particleCount = 760;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const cyan = new THREE.Color("#67e8f9");
    const purple = new THREE.Color("#c084fc");

    for (let index = 0; index < particleCount; index += 1) {
      const positionIndex = index * 3;
      const radius = 3 + Math.random() * 6;
      const angle = Math.random() * Math.PI * 2;

      positions[positionIndex] = Math.cos(angle) * radius;
      positions[positionIndex + 1] = (Math.random() - 0.5) * 7;
      positions[positionIndex + 2] = Math.sin(angle) * radius - 2;

      const color = cyan.clone().lerp(purple, Math.random() * 0.75);
      colors[positionIndex] = color.r;
      colors[positionIndex + 1] = color.g;
      colors[positionIndex + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.032,
      transparent: true,
      opacity: 0.78,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const ambientGlow = new THREE.PointLight(0x67e8f9, 1.2, 16);
    ambientGlow.position.set(-3, 2, 4);
    scene.add(ambientGlow);

    let frameId;

    function handleMouseMove(event) {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    }

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      const { x, y } = mouseRef.current;
      points.rotation.y += 0.0018;
      points.rotation.x += 0.0007;
      points.position.x += (x * 0.18 - points.position.x) * 0.035;
      points.position.y += (y * -0.14 - points.position.y) * 0.035;
      camera.position.x += (x * 0.24 - camera.position.x) * 0.025;
      camera.position.y += (y * -0.18 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_84%_20%,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_48%_82%,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
        <div
          ref={containerRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.85),transparent_88%)]" />
      </div>
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-300/10 to-transparent" />
    </div>
  );
}

export default ParticleBackground;
