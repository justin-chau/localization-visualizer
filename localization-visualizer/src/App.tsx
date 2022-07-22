import { useControls, button } from "leva";
import useWebsocket from "react-use-websocket";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Line, MapControls } from "@react-three/drei";
import { AxesHelper } from "three";

function App() {
  const { lastMessage } = useWebsocket("ws://localhost:5555");
  const { sendMessage } = useWebsocket("ws://localhost:5555/capture");

  const [{ x, y, z }, set] = useControls(() => ({
    x: 0,
    y: 0,
    z: 0,
    "Capture Image": button(() => {
      sendMessage("capture");
    }),
  }));

  const parsed = useMemo(() => {
    if (lastMessage?.data) {
      return JSON.parse(lastMessage.data);
    }

    return undefined;
  }, [lastMessage]);

  useEffect(() => {
    if (parsed) {
      set({ x: parsed.robot_pose.x, y: parsed.robot_pose.y, z: 0 });
    }
  }, [parsed, set]);

  return (
    <div style={{ width: "100vw", height: "100vh", padding: 0, margin: 0 }}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 50], zoom: 15, up: [0, 0, 1], far: 10000 }}
      >
        <ambientLight />
        <primitive object={new AxesHelper(5)} />

        {parsed &&
          parsed.obstacle_list.map((obstacle: any) => (
            <mesh position={[obstacle.pose.x, obstacle.pose.y, 0]}>
              <sphereGeometry args={[obstacle.radius, 32, 16]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          ))}

        {parsed &&
          parsed.path.map((pose: any, index: number) => {
            if (index < parsed.path.length - 1) {
              return (
                <Line
                  points={[
                    [pose.x, pose.y, 0],
                    [parsed.path[index + 1].x, parsed.path[index + 1].y, 0],
                  ]}
                />
              );
            }
          })}

        {parsed && (
          <mesh position={[parsed.goal_pose.x, parsed.goal_pose.y, 0]}>
            <sphereGeometry args={[0.2, 32, 16]} />
            <meshStandardMaterial color="red" />
          </mesh>
        )}

        <mesh position={[x, y, z]}>
          <sphereGeometry args={[0.5, 32, 16]} />
          <meshStandardMaterial color="green" />
        </mesh>

        <MapControls />
      </Canvas>
    </div>
  );
}

export default App;
