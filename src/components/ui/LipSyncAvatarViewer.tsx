import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Button from './Button';
import { AdvancedLipsyncSystem } from '../../utils/advanced-lipsync-system';

interface LipSyncData {
  duration?: number;
  keyframes?: Array<{
    time: number;
    visemes: Record<string, number>;
  }>;
  mouthCues?: Array<{
    start: number;
    end: number;
    value: string;
  }>;
}

interface LipSyncAvatarViewerProps {
  modelUrl?: string;
  lipsyncUrl?: string;
  className?: string;
  isPlaying?: boolean;
  currentTime?: number;
}

export interface LipSyncAvatarViewerRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  getDuration: () => number;
}

const LipSyncAvatarViewer = forwardRef<LipSyncAvatarViewerRef, LipSyncAvatarViewerProps>(
  ({ modelUrl, lipsyncUrl, className = '', isPlaying = false, currentTime = 0 }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationRef = useRef<number | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const lipSyncDataRef = useRef<LipSyncData | null>(null);
    const advancedLipsyncRef = useRef<AdvancedLipsyncSystem | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [duration, setDuration] = useState(0);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      play: () => {
        // Animation will be handled by the animation loop
      },
      pause: () => {
        // Animation will be handled by the animation loop
      },
      stop: () => {
        // Animation will be handled by the animation loop
      },
      seek: (time: number) => {
        // Seek will be handled by parent component
      },
      getDuration: () => duration,
    }));

    // Initialize advanced lipsync system
    useEffect(() => {
      advancedLipsyncRef.current = new AdvancedLipsyncSystem();
    }, []);

    // Load lip sync data
    useEffect(() => {
      if (!lipsyncUrl) return;

      const loadLipSyncData = async () => {
        try {
          const response = await fetch(lipsyncUrl);
          if (!response.ok) throw new Error('Failed to load lip sync data');
          const data = await response.json();
          lipSyncDataRef.current = data;
          setDuration(data.duration || 0);
          console.log('✅ Advanced lipsync data loaded:', data);
        } catch (err: any) {
          console.error('❌ Failed to load lip sync data:', err);
        }
      };

      loadLipSyncData();
    }, [lipsyncUrl]);

    // Apply lip sync animation based on current time
    const applyLipSync = (time: number) => {
      if (!lipSyncDataRef.current || !modelRef.current) return;

      const { mouthCues, keyframes } = lipSyncDataRef.current;
      
      // Handle mouthCues format (new format)
      if (mouthCues && mouthCues.length > 0) {
        // Find the current mouth cue for this time
        const currentCue = mouthCues.find(cue => time >= cue.start && time <= cue.end);
        
        if (currentCue) {
          console.log(`Time: ${time.toFixed(2)}s, Viseme: ${currentCue.value}`);
          
          // Apply the viseme to all meshes
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
              const morphTargets = child.morphTargetInfluences;
              
              // Reset all morph targets first
              for (let i = 0; i < morphTargets.length; i++) {
                morphTargets[i] = 0;
              }
              
              // Apply the current viseme
              const morphIndex = getMorphTargetIndex(currentCue.value, child);
              if (morphIndex !== -1) {
                morphTargets[morphIndex] = 1.0; // Full weight for the current viseme
              }
            }
          });
        } else {
          // No active cue, reset to neutral
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
              const morphTargets = child.morphTargetInfluences;
              for (let i = 0; i < morphTargets.length; i++) {
                morphTargets[i] = 0;
              }
            }
          });
        }
        return;
      }
      
      // Handle keyframes format (legacy format)
      if (keyframes && keyframes.length > 0) {
        // Find the two keyframes to interpolate between
        let prevKeyframe = keyframes[0];
        let nextKeyframe = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
          if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
            prevKeyframe = keyframes[i];
            nextKeyframe = keyframes[i + 1];
            break;
          }
        }

        // Interpolate between keyframes
        const timeDiff = nextKeyframe.time - prevKeyframe.time;
        const factor = timeDiff > 0 ? (time - prevKeyframe.time) / timeDiff : 0;

        // Apply morph target weights
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
            const morphTargets = child.morphTargetInfluences;
            
            // Apply viseme weights to morph targets
            Object.entries(prevKeyframe.visemes).forEach(([viseme, weight]) => {
              const nextWeight = nextKeyframe.visemes[viseme] || 0;
              const interpolatedWeight = weight + (nextWeight - weight) * factor;
              
              const morphIndex = getMorphTargetIndex(viseme, child);
              if (morphIndex !== -1) {
                morphTargets[morphIndex] = interpolatedWeight;
              }
            });
          }
        });
      }
    };

    // Helper function to map viseme names to morph target indices
    const getMorphTargetIndex = (viseme: string, mesh: THREE.Mesh): number => {
      if (!mesh.morphTargetDictionary) {
        console.log('No morph target dictionary found for mesh:', mesh.name);
        return -1;
      }
      
      console.log('Available morph targets:', Object.keys(mesh.morphTargetDictionary));
      
      // Map the actual viseme values from your data to common morph target names
      const visemeMap: Record<string, string[]> = {
        'X': ['silence', 'neutral', 'rest', 'closed', 'mouth_closed'],
        'A': ['a', 'ah', 'mouth_a', 'open_wide'],
        'B': ['b', 'p', 'm', 'mouth_b', 'lips_together'],
        'C': ['c', 'k', 'g', 'mouth_c', 'tongue_back'],
        'D': ['d', 't', 'n', 'mouth_d', 'tongue_tip'],
        'E': ['e', 'eh', 'mouth_e', 'smile'],
        'F': ['f', 'v', 'mouth_f', 'teeth_lip'],
        'G': ['g', 'k', 'mouth_g', 'throat'],
        'H': ['h', 'mouth_h', 'breath'],
      };

      const possibleNames = visemeMap[viseme] || [viseme.toLowerCase(), viseme];
      
      for (const name of possibleNames) {
        if (mesh.morphTargetDictionary[name] !== undefined) {
          console.log(`Found morph target for viseme ${viseme}: ${name} (index: ${mesh.morphTargetDictionary[name]})`);
          return mesh.morphTargetDictionary[name];
        }
      }
      
      console.log(`No morph target found for viseme: ${viseme}`);
      return -1;
    };

    // Main Three.js setup
    useEffect(() => {
      if (!mountRef.current || !modelUrl) return;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;

      // Camera setup (face focused)
      const camera = new THREE.PerspectiveCamera(
        60,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 2.2, 1.5);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 0.8;
      controls.maxDistance = 2.5;
      controls.maxPolarAngle = Math.PI / 1.8;
      controls.minPolarAngle = Math.PI / 3;
      controls.target.set(0, 1.7, 0);
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
          }) as any;

          // Clear existing model
          scene.children.forEach(child => {
            if (child.type === 'Group' || child.type === 'Mesh') {
              scene.remove(child);
            }
          });

          // Add new model
          if (gltf.scene) {
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.8 / maxDim;
            
            gltf.scene.scale.setScalar(scale);
            gltf.scene.position.sub(center.multiplyScalar(scale));
            gltf.scene.position.y = -gltf.scene.position.y;
            gltf.scene.position.y -= 0.3;

            // Enable shadows and debug morph targets
            gltf.scene.traverse((child: any) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Debug morph targets for advanced lipsync
                if (child.morphTargetInfluences) {
                  console.log('🎭 Mesh name:', child.name);
                  console.log('🎭 Morph targets available:', child.morphTargetInfluences.length);
                  console.log('🎭 Morph target dictionary:', child.morphTargetDictionary);
                }
              }
            });

            modelRef.current = gltf.scene;
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

      // Optimized animation loop
      let lastTime = 0;
      const animate = (currentTime: number) => {
        // Throttle to 60fps to prevent performance issues
        if (currentTime - lastTime >= 16.67) {
          // Apply lip sync animation
          if (isPlaying && lipSyncDataRef.current) {
            applyLipSync(currentTime);
          }
          
          controls.update();
          renderer.render(scene, camera);
          lastTime = currentTime;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      animate(0);

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

    // Apply advanced lipsync animation when time changes
    useEffect(() => {
      if (isPlaying && lipSyncDataRef.current && modelRef.current && advancedLipsyncRef.current) {
        console.log(`🎭 Applying advanced lipsync at time: ${currentTime.toFixed(2)}s`);
        advancedLipsyncRef.current.applyAdvancedLipsync(
          modelRef.current, 
          currentTime, 
          lipSyncDataRef.current
        );
      }
    }, [currentTime, isPlaying]);

    // Test morph targets on model load
    useEffect(() => {
      if (modelRef.current && advancedLipsyncRef.current) {
        console.log('🧪 Testing morph targets...');
        // Force a test viseme to see if morph targets work at all
        const testWeights = { mouth_open: 1.0, mouth_closed: 0.0 };
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
            console.log('🧪 Testing mesh:', child.name);
            advancedLipsyncRef.current?.applyMorphTargets(child, testWeights);
          }
        });
      }
    }, [modelRef.current]);

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
  }
);

LipSyncAvatarViewer.displayName = 'LipSyncAvatarViewer';

export default LipSyncAvatarViewer;
