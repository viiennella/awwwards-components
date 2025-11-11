"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uMouse;
uniform float uParallaxStrength;
uniform float uDistortionMultiplier;
uniform float uGlassStrength;
uniform float uStripesFrequency;
uniform float uGlassSmoothness;
uniform float uEdgePadding;

varying vec2 vUv;

vec2 getCoverUV(vec2 uv, vec2 textureSize) {
  if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;
  vec2 s = uResolution / textureSize;
  float scale = max(s.x, s.y);
  vec2 scaledSize = textureSize * scale;
  vec2 offset = (uResolution - scaledSize) * 0.5;
  return (uv * uResolution - offset) / scaledSize;
}

float displacement(float x, float num_stripes, float strength) {
  float modulus = 1.0 / num_stripes;
  return mod(x, modulus) * strength;
}

float fractalGlass(float x) {
  float d = 0.0;
  for (int i = -5; i <= 5; i++) {
    d += displacement(x + float(i) * uGlassSmoothness, uStripesFrequency, uGlassStrength);
  }
  d /= 11.0;
  return x + d;
}

float smoothEdge(float x, float padding) {
  if (x < padding)
    return smoothstep(0.0, padding, x);
  else if (x > 1.0 - padding)
    return smoothstep(1.0, 1.0 - padding, x);
  return 1.0;
}

void main() {
  vec2 uv = vUv;
  float originalX = uv.x;
  float edgeFactor = smoothEdge(originalX, uEdgePadding);
  float distortedX = fractalGlass(originalX);
  uv.x = mix(originalX, distortedX, edgeFactor);
  float distortionFactor = uv.x - originalX;
  float parallaxDirection = -sign(0.5 - uMouse.x);
  vec2 parallaxOffset = vec2(
    parallaxDirection * abs(uMouse.x - 0.5) * uParallaxStrength *
    (1.0 + abs(distortionFactor) * uDistortionMultiplier),
    0.0
  );
  parallaxOffset *= edgeFactor;
  uv += parallaxOffset;
  vec2 coverUV = getCoverUV(uv, uTextureSize);
  coverUV = clamp(coverUV, 0.0, 1.0);
  vec4 color = texture2D(uTexture, coverUV);
  gl_FragColor = color;
}
`;

export function FractalGlassCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = {
      lerpFactor: 0.035,
      parallaxStrength: 0.1,
      distortionMultiplier: 10,
      glassStrength: 2.0,
      glassSmoothness: 0.0001,
      stripesFrequency: window.innerWidth / 15,
      edgePadding: 0.1,
    };

    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mouse = { x: 0.5, y: 0.5 };
    const targetMouse = { x: 0.5, y: 0.5 };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const textureLoader = new THREE.TextureLoader();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTextureSize: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
        uParallaxStrength: { value: config.parallaxStrength },
        uDistortionMultiplier: { value: config.distortionMultiplier },
        uGlassStrength: { value: config.glassStrength },
        uStripesFrequency: { value: config.stripesFrequency },
        uGlassSmoothness: { value: config.glassSmoothness },
        uEdgePadding: { value: config.edgePadding },
      },
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    textureLoader.load("/glassTexture.jpg", (texture) => {
      material.uniforms.uTexture.value = texture;
      material.uniforms.uTextureSize.value.set(
        texture.image.width,
        texture.image.height
      );
    });

    function onMouseMove(e: MouseEvent) {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    }

    function onTouchMove(e: TouchEvent) {
      targetMouse.x = e.touches[0].clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.touches[0].clientY / window.innerHeight;
    }

    function onResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("resize", onResize);

    function animate() {
      requestAnimationFrame(animate);
      mouse.x = lerp(mouse.x, targetMouse.x, config.lerpFactor);
      mouse.y = lerp(mouse.y, targetMouse.y, config.lerpFactor);
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden touch-none"
    />
  );
}
