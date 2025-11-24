import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Button from './Button';

interface AvatarViewerProps {
  modelUrl?: string;
  className?: string;
}

const AvatarViewer = ({ modelUrl, className = '' }: AvatarViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!mountRef.current || !modelUrl) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup (face focused - looking UP at face)
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2.2, 1.5); // Higher position, looking DOWN at face

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting (matching README specs)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Controls (face focused - looking DOWN at face)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.8; // Close for face detail
    controls.maxDistance = 2.5; // Allow some distance
    controls.maxPolarAngle = Math.PI / 1.8; // Allow looking down at face
    controls.minPolarAngle = Math.PI / 3; // Prevent looking too far down
    controls.target.set(0, 1.7, 0); // Focus on face level
    controlsRef.current = controls;

    // Mount renderer
    mountRef.current.appendChild(renderer.domElement);

    // Load model
    const loadModel = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const loader = new GLTFLoader();
        const gltf = await new Promise((resolve, reject) => {
          loader.load(
            modelUrl!,
            resolve,
            undefined,
            reject
          );
        });

        // Clear existing model
        scene.children.forEach(child => {
          if (child.type === 'Group' || child.type === 'Mesh') {
            scene.remove(child);
          }
        });

        // Add new model
        if (gltf.scene) {
        // Center and scale the model (face-focused positioning)
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxDim; // Good scale for face viewing
        
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.sub(center.multiplyScalar(scale));
        gltf.scene.position.y = -gltf.scene.position.y; // Flip Y to ground the model
        gltf.scene.position.y -= 0.3; // Move avatar down so face is visible

          // Enable shadows (matching README approach)
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(gltf.scene);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load model');
        console.error('Model loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModel();

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No model selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {!isVisible && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center z-10">
          <Button
            variant="outline"
            onClick={() => setIsVisible(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Show Model
          </Button>
        </div>
      )}
      
      {isVisible && (
        <>
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="bg-white/80 hover:bg-white"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading model...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center z-10">
              <div className="text-center p-4">
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">Failed to load model</p>
                <p className="text-xs text-red-500 dark:text-red-500">{error}</p>
              </div>
            </div>
          )}
          
          <div ref={mountRef} className="w-full h-full" />
        </>
      )}
    </div>
  );
};

export default AvatarViewer;
