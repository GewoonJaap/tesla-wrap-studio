import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { CarModel } from '../types';
import { X, Loader2, RotateCw } from 'lucide-react';

interface ThreeDViewerProps {
  model: CarModel;
  textureData: string | null;
  onClose: () => void;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white bg-black/50 p-4 rounded-xl backdrop-blur-md">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="text-xs font-mono">{progress.toFixed(0)}% loaded</span>
      </div>
    </Html>
  );
}

const ModelRender = ({ url, textureMap }: { url: string, textureMap: THREE.Texture }) => {
  const obj = useLoader(OBJLoader, url);

  // Apply texture to the model
  const scene = useMemo(() => {
    const clone = obj.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create a nice car paint material
        child.material = new THREE.MeshStandardMaterial({
          map: textureMap,
          roughness: 0.2,
          metalness: 0.3,
          envMapIntensity: 1.0,
        });
        
        // Ensure standard geometry calculation
        child.geometry.computeVertexNormals();
      }
    });
    return clone;
  }, [obj, textureMap]);

  // @ts-ignore
  return <primitive object={scene} />;
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ model, textureData, onClose }) => {
  
  // Create texture from base64 string
  const textureMap = useMemo(() => {
    if (!textureData) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureData);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false; // Important for matching standard UV layouts usually
    return tex;
  }, [textureData]);

  // Construct raw GitHub URL for OBJ
  const modelUrl = `https://raw.githubusercontent.com/GewoonJaap/custom-tesla-wraps/master/${model.folderName}/${model.id === 'cybertruck' ? 'cybertruck.obj' : 'model.obj'}`;

  // Fallback for models that don't have an OBJ yet (Prompt only gave Cybertruck)
  const isSupported = model.id === 'cybertruck'; 

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-700 pointer-events-auto">
            <h2 className="text-white font-bold flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-purple-500" />
                3D Preview: {model.name}
            </h2>
        </div>
        <button 
            onClick={onClose}
            className="bg-zinc-900/80 hover:bg-zinc-800 text-white p-2 rounded-full border border-zinc-700 pointer-events-auto transition-colors"
        >
            <X className="w-6 h-6" />
        </button>
      </div>

      {isSupported && textureMap ? (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [5, 2, 5], fov: 45 }}>
                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.7, blur: 2 }}>
                        <ModelRender url={modelUrl} textureMap={textureMap} />
                    </Stage>
                    <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} />
                </Suspense>
            </Canvas>
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <p className="text-zinc-500 text-xs bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    Drag to rotate • Scroll to zoom
                </p>
            </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
            <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-center max-w-md">
                <p className="text-lg text-white mb-2">3D Model Not Available</p>
                <p>
                    Currently, 3D preview is optimized for the <strong>Cybertruck</strong>. 
                    <br/>
                    Support for {model.name} is coming soon!
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDViewer;