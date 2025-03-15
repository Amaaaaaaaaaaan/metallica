"use client";

import React from "react";
import { motion, useScroll } from "framer-motion";
import styles from "./Aboutus.module.css";
export default function ScrollLinkedComponent() {
  const { scrollYProgress } = useScroll();

  return (
    <>
      {/* Scroll Indicator */}
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX: scrollYProgress,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          transformOrigin: "0%",
          backgroundColor: "var(--hue-1,rgb(219, 113, 52))",
          zIndex: 1000,
        }}
      />
      
      {/* Scrollable Container */}
      <div className={styles.scrollContainer}>
        <Content />
      </div>
    </>
  );
}

function Content() {
  return (
    <article style={{ maxWidth: 500, padding: "150px 20px" }}>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.
      </p>
      <p>
        Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo.
        In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta.
      </p>
      <h2>Sub-header</h2>
      <p>
        Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet.
        Pellentesque auctor vehicula malesuada.
      </p>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique,
        elit metus efficitur elit, ac pretium sapien nisl nec ante.
      </p>
      <p>
        In et ex ultricies, mollis mi in, euismod dolor. Quisque convallis ligula non magna
        efficitur tincidunt.
      </p>
      <p>
        Pellentesque id lacus pulvinar elit pulvinar pretium ac non urna. Proin sit amet lacus mollis,
        semper massa ut, rutrum mi.
      </p>
      <p>
        Vestibulum cursus ipsum tellus, eu tincidunt neque tincidunt a.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.
      </p>
      <p>
        Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo.
        In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta.
      </p>
      <h2>Sub-header</h2>
      <p>
        Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet.
        Pellentesque auctor vehicula malesuada.
      </p>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique,
        elit metus efficitur elit, ac pretium sapien nisl nec ante.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ac rhoncus quam.
      </p>
      <p>
        Fringilla quam urna. Cras turpis elit, euismod eget ligula quis, imperdiet sagittis justo.
        In viverra fermentum ex ac vestibulum. Aliquam eleifend nunc a luctus porta.
      </p>
      <h2>Sub-header</h2>
      <p>
        Maecenas quis elementum nulla, in lacinia nisl. Ut rutrum fringilla aliquet.
        Pellentesque auctor vehicula malesuada.
      </p>
      <p>
        Sed sem nisi, luctus consequat ligula in, congue sodales nisl. Vestibulum bibendum
        at erat sit amet pulvinar.
      </p>
      <p>
        Pellentesque pharetra leo vitae tristique rutrum. Donec ut volutpat ante, ut suscipit leo.
      </p>
      <h2>Sub-header</h2>
      <p>
        Morbi ut scelerisque nibh. Integer auctor, massa non dictum tristique,
        elit metus efficitur elit, ac pretium sapien nisl nec ante.
      </p>
    </article>
  );
}
