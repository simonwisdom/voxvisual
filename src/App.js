import { useRef, useState } from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Text } from '@chakra-ui/react';


function BackgroundImage({ url }) {
  const { viewport } = useThree();

  const texture = new THREE.TextureLoader().load(url);


  const width = viewport.width;
  const height = viewport.height;
  const aspect = width / height;
  return (
    <mesh renderOrder={-1} scale={[aspect * 4, 4, 1]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial map={texture} depthTest={false}/>
    </mesh>
  );
}

function VoiceVisualization() {
  const groupRef = useRef();
  const cubeGroupRef = useRef(); // New group for cubes
  const audioRef = useRef();
  const data = new Uint8Array(128);
  const threshold = 90; // The threshold value to trigger the animation

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      source.connect(analyser);


      function update() {
        analyser.getByteFrequencyData(data);

        const group = groupRef.current;
        const cubeGroup = cubeGroupRef.current;

        // Update waveform
        group.children.forEach((mesh, i) => {
          mesh.scale.y = data[i] / 200;
          // if (data[i] > threshold) {
          //   mesh.material.color.set(0xffffff);
          //   mesh.material.emissive.set(0xffffff);
          // } else {
          //   mesh.material.color.set(0x000000);
          //   mesh.material.emissive.set(0x000000);
          // }
        });

        // console.log(data);


        // Trigger animation for cubes
        cubeGroup.children.forEach((cube, i) => {
          // const distance = Math.abs(data[i * 4] - 128);
          if (data[i*8] > threshold) {
            cube.material.color.set(0xffffff);
            cube.material.emissive.set(0xffffff);
          } else {
            cube.material.color.set(0x000000);
            cube.material.emissive.set(0x000000);
          }



          // console.log(distance, data[i * 4]);
          // if (distance > threshold) {
          // cube.userData.triggered = true;
          // cube.material.color.setRGB(1, 1, 1);
            // cube.material.emissive.set('blue');
          // }
        });
      }

      // Render loop
      function render() {
        update();
        audioRef.current = requestAnimationFrame(render);
      }
      render();
    });

 // Create cubes
 const cubes = [];
 for (let i = 0; i < 16; i++) {
   const cube = (
     <mesh key={i} position={[(i - 16) * 2, -5, -20]} userData={{ triggered: false }}>
       <boxBufferGeometry args={[1, 1, 1]} />
       <meshStandardMaterial color={'red'} />
     </mesh>
   );
   cubes.push(cube);
 }

 return (
   <>
     <group ref={groupRef}>
       {[...Array(128)].map((_, i) => (
         <mesh key={i} position={[15 + (i - 64) / 3, 8, -45 ]}>
           <boxBufferGeometry args={[0.1, 10, 0.2]} />
           <meshStandardMaterial color={new THREE.Color().setHSL(i / 128, 1, 0.5)} />
         </mesh>
       ))}
     </group>
     <group ref={cubeGroupRef} position={[10, -15, -20]}>
       {cubes}
     </group>
   </>
 );
}



function App() {
  return (
    <div style={{ height: '100vh' }}>
    <Canvas>
    <BackgroundImage url={require('./assets/sophia-desk-blade-runner.png')} />

      <VoiceVisualization />
      <ambientLight />
    </Canvas>

    </div>
  );
}

export default App;
