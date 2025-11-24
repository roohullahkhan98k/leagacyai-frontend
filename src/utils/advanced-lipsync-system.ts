import * as THREE from 'three';

// Advanced Lipsync System for 100% Realistic Results
export class AdvancedLipsyncSystem {
  visemeMap: Record<string, Record<string, number>>;
  expressionMap: Record<string, Record<string, number>>;

  constructor() {
    // Simplified viseme mapping for models with only mouthOpen and mouthSmile morph targets
    this.visemeMap = {
      'X': { // Silence/Neutral
        mouthOpen: 0.0,
        mouthSmile: 0.0
      },
      'A': { // Ah (open mouth)
        mouthOpen: 1.0,
        mouthSmile: 0.0
      },
      'B': { // B, P, M (lips together)
        mouthOpen: 0.0,
        mouthSmile: 0.0
      },
      'C': { // C, K, G (back of mouth)
        mouthOpen: 0.6,
        mouthSmile: 0.0
      },
      'D': { // D, T, N (tongue tip)
        mouthOpen: 0.4,
        mouthSmile: 0.0
      },
      'E': { // E, Eh (smile)
        mouthOpen: 0.3,
        mouthSmile: 0.8
      },
      'F': { // F, V (teeth on lip)
        mouthOpen: 0.2,
        mouthSmile: 0.0
      },
      'G': { // G, K (throat)
        mouthOpen: 0.7,
        mouthSmile: 0.0
      },
      'H': { // H (breath)
        mouthOpen: 0.5,
        mouthSmile: 0.0
      }
    };

    this.expressionMap = {
      // Simplified facial expressions using available morph targets
      'happy': {
        mouthOpen: 0.2,
        mouthSmile: 1.0
      },
      'sad': {
        mouthOpen: 0.1,
        mouthSmile: 0.0
      },
      'surprised': {
        mouthOpen: 0.8,
        mouthSmile: 0.0
      },
      'angry': {
        mouthOpen: 0.1,
        mouthSmile: 0.0
      }
    };
  }

  // Advanced viseme interpolation for smooth transitions
  interpolateVisemes(currentViseme: string, nextViseme: string, progress: number) {
    const result: Record<string, number> = {};
    const current = this.visemeMap[currentViseme] || this.visemeMap['X'];
    const next = this.visemeMap[nextViseme] || this.visemeMap['X'];
    
    // Get all unique keys
    const allKeys = new Set([...Object.keys(current), ...Object.keys(next)]);
    
    for (const key of allKeys) {
      const currentValue = current[key] || 0;
      const nextValue = next[key] || 0;
      
      // Use smooth interpolation curve
      const smoothProgress = this.smoothStep(progress);
      result[key] = currentValue + (nextValue - currentValue) * smoothProgress;
    }
    
    return result;
  }

  // Smooth step function for natural transitions
  smoothStep(t: number) {
    return t * t * (3 - 2 * t);
  }

  // Apply advanced lipsync to 3D model
  applyAdvancedLipsync(model: THREE.Group, time: number, lipsyncData: any) {
    if (!lipsyncData || !lipsyncData.mouthCues) {
      console.log('❌ No lipsync data or mouthCues');
      return;
    }

    // Find current and next mouth cues
    const currentCue = this.findCurrentCue(lipsyncData.mouthCues, time);
    const nextCue = this.findNextCue(lipsyncData.mouthCues, time);
    
    if (!currentCue) {
      console.log(`❌ No current cue found for time: ${time.toFixed(2)}s`);
      return;
    }

    let visemeWeights: Record<string, number>;
    
    if (nextCue && nextCue !== currentCue) {
      // Interpolate between current and next viseme
      const progress = (time - currentCue.start) / (nextCue.start - currentCue.start);
      visemeWeights = this.interpolateVisemes(currentCue.value, nextCue.value, progress);
    } else {
      // Use current viseme only
      visemeWeights = this.visemeMap[currentCue.value] || this.visemeMap['X'];
    }

    console.log(`🎭 Time: ${time.toFixed(2)}s, Viseme: ${currentCue.value}, Weights:`, visemeWeights);

    // Apply to all meshes in the model
    let meshesFound = 0;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        meshesFound++;
        console.log(`🎭 Applying to mesh: ${child.name}, morph targets: ${child.morphTargetInfluences.length}`);
        this.applyMorphTargets(child, visemeWeights);
      }
    });
    
    if (meshesFound === 0) {
      console.log('❌ No meshes with morph targets found!');
    }
  }

  // Find current mouth cue
  findCurrentCue(mouthCues: any[], time: number) {
    return mouthCues.find(cue => time >= cue.start && time <= cue.end);
  }

  // Find next mouth cue
  findNextCue(mouthCues: any[], time: number) {
    return mouthCues.find(cue => cue.start > time);
  }

  // Apply morph targets to a mesh
  applyMorphTargets(mesh: THREE.Mesh, visemeWeights: Record<string, number>) {
    if (!mesh.morphTargetDictionary) {
      console.log(`❌ No morph target dictionary for mesh: ${mesh.name}`);
      return;
    }

    console.log(`🎭 Mesh: ${mesh.name}, Dictionary keys:`, Object.keys(mesh.morphTargetDictionary));

    // Reset all morph targets
    for (let i = 0; i < mesh.morphTargetInfluences!.length; i++) {
      mesh.morphTargetInfluences![i] = 0;
    }

    // Apply viseme weights
    let appliedCount = 0;
    Object.entries(visemeWeights).forEach(([visemeName, weight]) => {
      const morphIndex = this.findMorphTargetIndex(mesh, visemeName);
      if (morphIndex !== -1) {
        mesh.morphTargetInfluences![morphIndex] = weight;
        appliedCount++;
        console.log(`✅ Applied ${visemeName}: ${weight} to index ${morphIndex}`);
      } else {
        console.log(`❌ No morph target found for: ${visemeName}`);
      }
    });
    
    console.log(`🎭 Applied ${appliedCount} morph targets to ${mesh.name}`);
  }

  // Find morph target index with advanced matching
  findMorphTargetIndex(mesh: THREE.Mesh, visemeName: string) {
    if (!mesh.morphTargetDictionary) return -1;

    // Try exact match first
    if (mesh.morphTargetDictionary[visemeName] !== undefined) {
      return mesh.morphTargetDictionary[visemeName];
    }

    // Try common variations
    const variations = [
      visemeName.toLowerCase(),
      visemeName.toUpperCase(),
      `mouth_${visemeName.toLowerCase()}`,
      `viseme_${visemeName.toLowerCase()}`,
      `blend_${visemeName.toLowerCase()}`,
      `shape_${visemeName.toLowerCase()}`,
      `morph_${visemeName.toLowerCase()}`,
      // Common alternative names
      visemeName === 'mouth_closed' ? 'closed' : null,
      visemeName === 'mouth_open' ? 'open' : null,
      visemeName === 'lips_pressed' ? 'pressed' : null,
      visemeName === 'jaw_open' ? 'jaw' : null,
    ].filter(Boolean);

    for (const variation of variations) {
      if (variation && mesh.morphTargetDictionary[variation] !== undefined) {
        console.log(`🎭 Found morph target for ${visemeName}: ${variation}`);
        return mesh.morphTargetDictionary[variation];
      }
    }

    return -1;
  }

  // Add facial expressions for more realism
  applyFacialExpression(model: THREE.Group, expression: string, intensity: number = 1.0) {
    const expressionWeights = this.expressionMap[expression];
    if (!expressionWeights) return;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        Object.entries(expressionWeights).forEach(([expressionName, weight]) => {
          const morphIndex = this.findMorphTargetIndex(child, expressionName);
          if (morphIndex !== -1) {
            child.morphTargetInfluences![morphIndex] = (weight as number) * intensity;
          }
        });
      }
    });
  }
}
