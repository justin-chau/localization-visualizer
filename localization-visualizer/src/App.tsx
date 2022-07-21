import { useControls } from "leva";
import useWebsocket from "react-use-websocket";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";

function App() {
  const [{ x, y, z }, set] = useControls(() => ({ x: 0, y: 0, z: 0 }));

  const { lastMessage } = useWebsocket("ws://localhost:5555");

  useEffect(() => {
    const position = lastMessage?.data
      ? JSON.parse(lastMessage.data)
      : [0, 0, 0];
    set({ x: -position[0] * 10, y: -position[1] * 10, z: -position[2] * 10 });
  }, [lastMessage?.data]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas>
        <OrbitControls />
        <mesh position={[0, 0, 0]}>
          <sphereGeometry />
          <meshBasicMaterial />
        </mesh>

        <mesh position={[x, y, z]}>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </div>
  );
}

export default App;
