import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Html, useProgress, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
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
  // Use GLTF loader which supports multiple UV sets (uv, uv2, etc.)
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => {
    // Deep clone the scene to allow independent material/geometry manipulation
    const clone = scene.clone(true);
    
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Clone geometry to safely modify attributes without affecting cache
        child.geometry = child.geometry.clone();

        // Check for secondary UV set (usually mapped from UVMap.001 in Blender to TEXCOORD_1 in GLTF)
        // GLTFLoader names them 'uv' and 'uv2'.
        if (child.geometry.attributes.uv2) {
            // Swap: Use the second UV map for the main texture mapping
            child.geometry.attributes.uv = child.geometry.attributes.uv2;
        }

        // Ensure geometry has valid normals to prevent shader division-by-zero errors
        if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
        }

        // Create the wrap material
        const wrapMaterial = new THREE.MeshStandardMaterial({
          map: textureMap,
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.1,
          envMapIntensity: 1.0,
          transparent: true,
          side: THREE.DoubleSide // Ensure visibility from all angles
        });

        // Apply material logic
        if (Array.isArray(child.material)) {
          const materials = child.material as THREE.Material[];
          
          // Logic: Sort by string name (low to high) and pick the first one.
          // This ensures consistent selection based on alphabetical order.
          let targetIndex = 0;
          let lowestName = materials[0].name;

          materials.forEach((mat, index) => {
            if (mat.name < lowestName) {
                lowestName = mat.name;
                targetIndex = index;
            }
          });

          const newMaterials = [...materials];
          newMaterials[targetIndex] = wrapMaterial;
          child.material = newMaterials;
        } else {
          child.material = wrapMaterial;
        }
      }
    });
    return clone;
  }, [scene, textureMap]);

  // @ts-ignore
  return <primitive object={clonedScene} />;
};

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ model, textureData, onClose }) => {
  
  const textureMap = useMemo(() => {
    if (!textureData) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureData);
    tex.colorSpace = THREE.SRGBColorSpace;
    
    // IMPORTANT: For GLTF models, textures are typically mapped with (0,0) at Top-Left
    // matching the HTML Canvas coordinate system.
    // Three.js defaults flipY=true (Bottom-Left origin), which we need to disable for GLTF compatibility.
    tex.flipY = false; 
    
    return tex;
  }, [textureData]);

  // Switch to .glb extension to ensure multiple UV maps are supported (GLTF format)
  const modelUrl = `https://raw.githubusercontent.com/GewoonJaap/custom-tesla-wraps/master/${model.folderName}/vehicle.glb`;

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col animate-in fade-in duration-300">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none safe-area-top">
        <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-2 rounded-full border border-zinc-700 pointer-events-auto max-w-[75%] shadow-xl">
            <h2 className="text-white font-bold flex items-center gap-2 text-xs sm:text-base">
                <RotateCw className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="truncate">3D Preview: {model.name}</span>
            </h2>
        </div>
        <button 
            onClick={onClose}
            className="bg-zinc-900/80 hover:bg-zinc-800 text-white p-2 rounded-full border border-zinc-700 pointer-events-auto transition-colors shadow-xl"
        >
            <X className="w-6 h-6" />
        </button>
      </div>

      {textureMap ? (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [5, 2, 5], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.5} shadows="contact" adjustCamera={1.2}>
                        <ModelRender url={modelUrl} textureMap={textureMap} />
                    </Stage>
                    <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} />
                </Suspense>
            </Canvas>
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none px-4 text-center">
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