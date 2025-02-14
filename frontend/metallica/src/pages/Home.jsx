import React, { Suspense, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import Button from '../components/Button';
import useMeasure from 'react-use-measure';
import styles from '../styles/home.module.css'
function Home() {
  const [ref, bounds] = useMeasure({ scroll: false });
  const [isHover, setIsHover] = useState(false);
  const [isPress, setIsPress] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const resetMousePosition = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>HomePage</h1>
      <Button />
    </div>
  );
}

export default Home;
