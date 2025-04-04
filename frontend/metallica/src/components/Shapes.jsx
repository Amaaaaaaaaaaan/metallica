import { motion } from "framer-motion-3d";
import { MotionConfig } from "framer-motion";
import { useRef, useLayoutEffect } from "react";
import { transition } from "./settings";
import { Canvas, useThree } from "@react-three/fiber";
import { useSmoothTransform } from "./use-smooth-transform";

// export function Shapes({ isHover, isPress, mouseX, mouseY }) {
//   const lightRotateX = useSmoothTransform(mouseY, spring, mouseToLightRotation);
//   const lightRotateY = useSmoothTransform(mouseX, spring, mouseToLightRotation);

//   return (
//     // <Canvas shadows dpr={[1, 2]} resize={{ scroll: false, offsetSize: true }}>
//     //   <Camera mouseX={mouseX} mouseY={mouseY} />
//     //   <MotionConfig transition={transition}>
//     //     <motion.group
//     //       center={[0, 0, 0]}
//     //       rotation={[lightRotateX, lightRotateY, 0]}
//     //     >
//     //       <Lights />
//     //     </motion.group>
//     //     <motion.group
//     //       initial={false}
//     //       animate={isHover ? "hover" : "rest"}
//     //       dispose={null}
//     //       variants={{
//     //         hover: { z: isPress ? -0.9 : 0 }
//     //       }}
//     //     >
//     //     </motion.group>
//     //   </MotionConfig>
//     // </Canvas>
//   // );
// }

// export function Lights() {
//   return (
//     <>
//       <spotLight color="#61dafb" position={[-10, -10, -10]} intensity={0.2} />
//       <spotLight color="#61dafb" position={[-10, 0, 15]} intensity={0.8} />
//       <spotLight color="#61dafb" position={[-5, 20, 2]} intensity={0.5} />
//       <spotLight color="#f2056f" position={[15, 10, -2]} intensity={2} />
//       <spotLight color="#f2056f" position={[15, 10, 5]} intensity={1} />
//       <spotLight color="#b107db" position={[5, -10, 5]} intensity={0.8} />
//     </>
//   );
// }

export function MusicNote() {
  return (
    <motion.mesh position={[-0.5, -0.5, 0]} variants={{ hover: { z: 2 } }}>
      <sphereGeometry args={[0.4]} />
      <Material />
    </motion.mesh>
  );
}

export function Material() {
  return <meshPhongMaterial color="#fff" specular="#61dafb" shininess={10} />;
}

// Adapted from https://github.com/pmndrs/drei/blob/master/src/core/PerspectiveCamera.tsx
function Camera({ mouseX, mouseY, ...props }) {
  const cameraX = useSmoothTransform(mouseX, spring, (x) => x / 350);
  const cameraY = useSmoothTransform(mouseY, spring, (y) => (-1 * y) / 350);

  const set = useThree(({ set }) => set);
  const camera = useThree(({ camera }) => camera);
  const size = useThree(({ size }) => size);
  const scene = useThree(({ scene }) => scene);
  const cameraRef = useRef();

  useLayoutEffect(() => {
    const { current: cam } = cameraRef;
    if (cam) {
      cam.aspect = size.width / size.height;
      cam.updateProjectionMatrix();
    }
  }, [size, props]);

  useLayoutEffect(() => {
    if (cameraRef.current) {
      const oldCam = camera;
      set(() => ({ camera: cameraRef.current }));
      return () => set(() => ({ camera: oldCam }));
    }
  }, [camera, cameraRef, set]);

  useLayoutEffect(() => {
    return cameraX.onChange(() => camera.lookAt(scene.position));
  }, [cameraX]);

  return (
    <motion.perspectiveCamera
      ref={cameraRef}
      fov={90}
      position={[cameraX, cameraY, 3.8]}
    />
  );
}

// const spring = { stiffness: 600, damping: 30 };

const mouseToLightRotation = (v) => (-1 * v) / 140;

