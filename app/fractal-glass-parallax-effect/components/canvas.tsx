import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main(){
vUv = uv;
gl_position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);}`;

export const fragmentShader = `
uniform sampler2D uTexture:
uniform vec2 uResolution;
uniform vec2 uTextureSize:
uniform vec2 Mouse;
uniform float ParallaxStrength;
uniform float DistortionMultiplier;
uniform float uGlassStrength;
uniform float uStripesFrequency:
uniform float uGlassSmoothness;
uniform float uEdgePadding:
varying vec2 vUv:
vec2 gotCoverUV(vec2 uv, vec2 textureSize) t
If (textureSize.x < 1.0 || textureSize. y < 1.0) return uv:

vec2 s = uResolution / textureSize
float scale * nax(s.x, s.y):

vec2 scaledSize - textureSize * scale:
vec2 offset - (uResolution - scaledSize) * 0.5 
return (uv * uResolution - offset ) / scaledSize;
}

float displacement(float x, float num_stripes, float strength) {
float modulus * 1.0 / num_stripes:
return mod(x, modulus) * strength;
}

float fractalGlass(float x) {
float d = 0.0;
for (int i = -5; i <= 5; 1++)(
d += displacement(x • float(1) * uGlassSmoothness, uStripesFrequency. uGlassStrength):
}
d = d / 11.0;
return x * d;
}

float smoothEdge(float x, float padding) {
float edge = padding:
if (x < edge) {
return smoothstep(0.0, edge, x);
}
else if (x > 1.0 - edge) {
return smoothstep(1.0, 1.0 - edge, x);
}

return 1.0:
}
void main(){
vec2 uv = vUv;
float originalX = uv.x;
float edgeFactor = smoothEdge(originalX, uEdgePadding):
float distortedX = fractalGlass(originalX):
uv.x = mix(originalX, distortedX, edgeFactor):
float distortionFactor = uv.x - originalX;
Float parallaxDirection • -sign(0.5 - uMouse.x);
vec2 parallaxOffset = vec2(
    parallaxDirection * abs(uMouse.x - 0.5) * ParallaxStrength * 
    (1.0 + abs (distortionFactor) * DistortionMultiplier),
    0.0
    );
    
    parallaxOffset *= edgeFactor;
    uv += parallaxOffset;
    vec2 coverUV = getCoverUV(uv, TextureSize) ;
    if (coverUV.x
    < 0.0 || coverUV.x > 1.0 Il coverUV.y < 0.0 || coverUV. y
    > 1.0) {
    coverUV = clamp(coverUV, 0.0, 1.0);
}
    vec4
    color =
    texture2D(uTexture, coverUV);
    gl_FragColor = color;
}`;

const config = {
  lerpFactor: 0.035,
  parallaxStrength: 0.1,
  distortionMultiplier: 10,
  glassStrength: 2.0,
  glassSmoothness: 0.0001,
  stripesFrequency: 35,
  edgePadding: 0.1,
};

const container = document.querySelector(".hero-section");
const imageElement = document.querySelector(
  "glass-texture"
) as HTMLImageElement | null;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const mouse = { x: 0.5, y: 0.5 };
const targetMouse = { x: 0.5, y: 0.5 };
const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

const textureSize = { x: 1, y: 1 };
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: null },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    uTextureSize: { value: new THREE.Vector2(textureSize.x, textureSize.y) },
    uMouse: { value: new THREE.Vector2(mouse.x, mouse.y) },
    uParallaxStrength: { value: config.parallaxStrength },
    DistortionMultiplier: { value: config.distortionMultiplier },
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

function loadImage() {
  if (!imageElement) {
    // Handle the case when imageElement is null
    return;
  }
  if (!(imageElement as HTMLImageElement)?.complete) {
    imageElement.onload = loadImage;
    return;
  }
  const texture = new THREE.Texture(imageElement);
  textureSize.x =
    (imageElement as HTMLImageElement).naturalWidth ||
    (imageElement as HTMLImageElement).width;
  textureSize.y =
    (imageElement as HTMLImageElement).naturalHeight ||
    (imageElement as HTMLImageElement).height;
  texture.needsUpdate = true;
  material.uniforms.uTexture.value = texture;
  material.uniforms.uTextureSize.value.set(textureSize.x, textureSize.y);
}

if ((imageElement as HTMLImageElement).complete) {
  loadImage();
} else {
  (imageElement as HTMLImageElement).onload = loadImage;
}
window.addEventListener("mousemove", (e) => {
  targetMouse.x = e.clientX / window.innerWidth;
  targetMouse.y = 1.0 - e.clientY / window.innerHeight;
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(
    window.innerWidth,
    window.innerHeight
  );
});

function animate() {
  requestAnimationFrame(animate);
  mouse.x = lerp(mouse.x, targetMouse.x, config.lerpFactor);
  mouse.y = lerp(mouse.y, targetMouse.y, config.lerpFactor);
  material.uniforms.uMouse.value.set(mouse.x, mouse.y);
  renderer.render(scene, camera);
  animate();
}
