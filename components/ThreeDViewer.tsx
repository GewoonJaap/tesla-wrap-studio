import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Html, useProgress } from '@react-three/drei';
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

  const scene = useMemo(() => {
    const clone = obj.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Create the wrap material
        const wrapMaterial = new THREE.MeshStandardMaterial({
          map: textureMap,
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.1,
          envMapIntensity: 1.0,
          transparent: true,
        });

        if (Array.isArray(child.material)) {
          const materials = child.material as THREE.Material[];
          
          // Logic: Find the material with the lowest number in its name (e.g. Material_140 vs Material_141)
          // The user states "Material_NUMBER" is the naming convention and we want the first one (lowest).
          // This ensures we target the main body material even if the array order varies.
          
          let targetIndex = 0;
          let lowestNum = Number.MAX_SAFE_INTEGER;

          materials.forEach((mat, index) => {
            // Extract number from string like "Material_140"
            const match = mat.name.match(/(\d+)/); 
            if (match) {
               const num = parseInt(match[1], 10);
               if (num < lowestNum) {
                 lowestNum = num;
                 targetIndex = index;
               }
            }
          });

          // Apply to the best candidate found
          const newMaterials = [...materials];
          newMaterials[targetIndex] = wrapMaterial;
          child.material = newMaterials;
          
        } else {
          // Single material - apply directly
          child.material = wrapMaterial;
        }
        
        child.geometry.computeVertexNormals();
      }
    });
    return clone;
  }, [obj, textureMap]);

  // @ts-ignore
  return <primitive object={scene} />;
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ model, textureData, onClose }) => {
  
  const textureMap = useMemo(() => {
    if (!textureData) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureData);
    tex.colorSpace = THREE.SRGBColorSpace;
    // Note: We use the default flipY = true here.
    // The canvas generates an image with (0,0) at top-left.
    // Standard Blender UVs expect (0,0) at bottom-left.
    // Therefore, flipping Y is required to align the texture correctly.
    return tex;
  }, [textureData]);

  const modelUrl = `https://raw.githubusercontent.com/GewoonJaap/custom-tesla-wraps/master/${model.folderName}/vehicle.obj`;

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
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

      {textureMap ? (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [5, 2, 5], fov: 45 }}>
                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.5} shadows="contact">
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
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                <p>Loading texture...</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDViewer;