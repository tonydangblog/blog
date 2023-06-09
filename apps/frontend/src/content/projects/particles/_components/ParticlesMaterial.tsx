import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";

import { AdditiveBlending, ShaderMaterial } from "three";

import { rgb_to_vec3 } from "@lib/colors/rgb_to_vec3";
import { useTheme } from "@lib/react/hooks/useTheme";
// @ts-expect-error glsl import
import vertexShader from "@lib/shaders/particle/vertex.glsl";
// @ts-expect-error glsl import
import fragmentShader from "@lib/shaders/particle/fragment.glsl";

const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    u_elapsed_time: { value: 0 },
    u_pixel_ratio: { value: null },
    u_particle_size: { value: null },
    u_color: { value: null },
  },
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
});

export default function ParticlesMaterial() {
  const particlesMaterial = useRef<ShaderMaterial>(null);
  const width = useRef(window.innerWidth);
  const height = useRef(window.innerHeight);
  const theme = useTheme();

  const [{ size, oscillation, light_color, dark_color }, set] = useControls(
    () => ({
      size: { value: 100, min: 0, max: 300, step: 1 },
      oscillation: { value: 1, min: 0, max: 10, step: 0.1 },
      theme: { value: theme, render: () => false },
      light_color: {
        value: { r: 22, g: 78, b: 99 },
        render: (get) => get("theme") === "light",
      },
      dark_color: {
        value: { r: 103, g: 232, b: 249 },
        render: (get) => get("theme") === "dark",
      },
    })
  );

  useEffect(() => set({ theme }), [theme, set]);

  useEffect(() => {
    function update_pixel_ratio() {
      const new_width = window.innerWidth;
      const new_height = window.innerHeight;

      if (new_width === width.current && new_height === height.current) return;

      width.current = new_width;
      height.current = new_height;
      if (
        particlesMaterial.current &&
        particlesMaterial.current.uniforms.u_pixel_ratio
      ) {
        particlesMaterial.current.uniforms.u_pixel_ratio.value = Math.min(
          window.devicePixelRatio,
          2
        );
      }
    }

    window.addEventListener("resize", update_pixel_ratio);

    return () => window.removeEventListener("resize", update_pixel_ratio);
  }, []);

  useFrame((_state, delta) => {
    if (
      particlesMaterial.current &&
      particlesMaterial.current.uniforms.u_elapsed_time
    ) {
      particlesMaterial.current.uniforms.u_elapsed_time.value +=
        delta * oscillation;
    }
  });

  return (
    <shaderMaterial
      ref={particlesMaterial}
      {...material}
      uniforms-u_pixel_ratio-value={Math.min(window.devicePixelRatio, 2)}
      uniforms-u_particle_size-value={size}
      uniforms-u_color-value={rgb_to_vec3(
        theme === "dark" ? dark_color : light_color
      )}
    />
  );
}
