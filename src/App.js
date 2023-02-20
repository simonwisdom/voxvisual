import * as THREE from "three";
import React, { useRef } from "react";
import { useThree } from "react-three-fiber";
import { Canvas } from '@react-three/fiber'

function VoiceVisualization() {
  const groupRef = useRef();
  const audioRef = useRef();
  const data = new Uint8Array(128);

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      source.connect(analyser);

      const decayRate = 0.0000;

      function update() {
        analyser.getByteFrequencyData(data);
        const group = groupRef.current;

        group.children.forEach((mesh, i) => {
          const scale = data[i] / 200 * 10;
          mesh.scale.y = scale;

          // Move the mesh down the screen
          mesh.position.y -= decayRate * (1 + scale);

          // Fade out the mesh as it moves down the screen
          const material = mesh.material;
          const opacity = material.opacity - decayRate / 2;
          material.opacity = opacity < 0 ? 0 : opacity;
        });
      }

      // Render loop
      function render() {
        update();
        audioRef.current = requestAnimationFrame(render);
      }
      render();
    });

  const items = [];
  for (let i = 0; i < 128; i++) {
    const item = (
      <mesh key={i} position={[(i - 64) / 4, 10, -20]}>
        <boxBufferGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={new THREE.Color().setHSL(i / 128, 1, 0.5)} />
      </mesh>
    );
    items.push(item);
  }

  return <group ref={groupRef}>{items}</group>
}


function App() {
  return (
    <div style={{ height: '100vh' }}>
    <Canvas>
      <VoiceVisualization />
      <ambientLight />
    </Canvas>
    </div>
  );
}

export default App;
