import React from "react";
import { useGLTF } from "@react-three/drei";

export default function Keyboard(props) {
  const { scene } = useGLTF("/keyboard.glb"); // Load model from public folder
  return <primitive object={scene} {...props} />;
}
