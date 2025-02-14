import { useMotionValue, useTransform } from "framer-motion";

export function useSmoothTransform(value, spring, transformer) {
  return useTransform(value, (v) => transformer(v), spring);
}