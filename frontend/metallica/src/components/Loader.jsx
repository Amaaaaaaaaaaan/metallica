import { useProgress, Html } from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div style={{
        width: "200px",
        height: "10px",
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "5px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "white",
          transition: "width 0.3s"
        }}></div>
      </div>
    </Html>
  );
}
