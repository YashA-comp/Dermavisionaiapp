import * as tmImage from '@teachablemachine/image';

// IMPORTANT: Replace this URL with your Teachable Machine model's shareable link
// Go to:https://teachablemachine.withgoogle.com/models/[...]
// Click "Export Model" → Copy the model URL
// It should look like: https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/
const TEACHABLE_MACHINE_URL = 'https://teachablemachine.withgoogle.com/models/Wz1Z7n2SB/';
// ✅ Model URL configured - AI ready to load!

// Class definitions (from your training - confirmed in metadata)
const CLASS_NAMES = [
  '0_Normal',        // Class 0
  '1_Fungal',        // Class 1
  '2_Inflammatory',  // Class 2
  '3_Benign',        // Class 3
  '4_Malignant'      // Class 4
];

// Risk mapping: Convert class probabilities to base risk (0-1)
const CLASS_RISK_SCORES: { [key: string]: number } = {
  '0_Normal': 0.0,         // No base risk
  '1_Fungal': 0.30,        // Yellow zone (mild infection)
  '2_Inflammatory': 0.40,  // Yellow zone (needs attention)
  '3_Benign': 0.20,        // Green-Yellow (low risk)
  '4_Malignant': 0.80      // Red zone (high risk)
};

let model: tmImage.CustomMobileNet | null = null;
let modelLoadError: string | null = null;
let isLoading = false; // Prevent duplicate simultaneous loads
let loadPromise: Promise<{ success: boolean; error?: string }> | null = null; // Cache the loading promise

/**
 * Load the Teachable Machine model from cloud URL
 */
export async function loadModel(): Promise<{ success: boolean; error?: string }> {
  try {
    // If model already loaded, return success
    if (model !== null) {
      console.log('✅ Model already loaded, skipping...');
      return { success: true };
    }

    // If already loading, return the same promise (prevent parallel loads)
    if (loadPromise !== null) {
      console.log('⏳ Model load already in progress, waiting for it to complete...');
      return loadPromise;
    }

    // Create and cache the load promise
    loadPromise = (async () => {
      isLoading = true;
      console.log('🚀 Loading Teachable Machine model...');
      
      // Check if URL has been configured properly
      if (TEACHABLE_MACHINE_URL.includes('PASTE_YOUR_MODEL_URL_HERE') || 
          TEACHABLE_MACHINE_URL.includes('[...]')) {
        const message = '⚠️  MODEL URL NOT CONFIGURED!\n\n' +
          'The URL still contains placeholder [...]\n\n' +
          '📋 HOW TO FIX:\n' +
          '1. Go to https://teachablemachine.withgoogle.com/\n' +
          '2. Open your project\n' +
          '3. Click "Export Model" → "Upload my model"\n' +
          '4. After upload completes, COPY THE FULL URL (e.g., https://teachablemachine.withgoogle.com/models/abc123xyz/)\n' +
          '5. Paste it in /utils/modelInference.ts line 8\n' +
          '6. Replace [...] with your actual model ID\n\n' +
          '✅ Example correct URL: https://teachablemachine.withgoogle.com/models/aBcD1234eFgH/\n\n' +
          'ℹ️  App will use fallback mode (ai_base = 0.1) until configured';
        
        console.error('❌', message);
        modelLoadError = message;
        isLoading = false;
        loadPromise = null;
        return { success: false, error: message };
      }

      console.log('📡 Fetching model from Teachable Machine cloud...');
      console.log('   URL:', TEACHABLE_MACHINE_URL);
      
      // Dispose of any existing model first (cleanup)
      if (model) {
        console.log('🗑️ Disposing existing model...');
        try {
          model.dispose();
        } catch (e) {
          console.warn('⚠️ Error disposing model:', e);
        }
        model = null;
      }
      
      // Load both model and metadata from Teachable Machine
      const modelURL = TEACHABLE_MACHINE_URL + 'model.json';
      const metadataURL = TEACHABLE_MACHINE_URL + 'metadata.json';
      
      console.log('   Model file:', modelURL);
      console.log('   Metadata file:', metadataURL);
      console.log('   Loading...');
      
      // Load using Teachable Machine's built-in loader
      // This handles TensorFlow.js internally without conflicts
      model = await tmImage.load(modelURL, metadataURL);
      
      console.log('✅ Model loaded successfully');
      console.log('   Classes:', model.getClassLabels());
      console.log('✅ AI ready for inference');
      modelLoadError = null;
      isLoading = false;
      
      return { success: true };
    })();

    const result = await loadPromise;
    loadPromise = null; // Clear the promise cache after completion
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to load model:', errorMessage);
    console.log('ℹ️  Please check:');
    console.log('   1. Model URL is correct');
    console.log('   2. Model is publicly shared on Teachable Machine');
    console.log('   3. You have internet connection');
    console.log('ℹ️  App will continue in fallback mode (ai_base = 0.1)');
    modelLoadError = errorMessage;
    isLoading = false;
    loadPromise = null;
    return { success: false, error: errorMessage };
  }
}

/**
 * Run inference on an image
 * @param imageUrl - Base64 data URL or blob URL of the image
 * @returns Prediction results with class probabilities and base risk
 */
export async function runInference(imageUrl: string): Promise<{
  success: boolean;
  ai_base_risk: number;
  predictions: { className: string; probability: number }[];
  topClass: string;
  topProbability: number;
  error?: string;
}> {
  try {
    // Check if model is loaded
    if (!model) {
      if (modelLoadError) {
        throw new Error(`Model not loaded: ${modelLoadError}`);
      }
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    console.log('🔍 Running inference on image...');

    // Create an HTML Image element
    const img = document.createElement('img');
    
    // Load the image and wait for it to be ready
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        console.log('   Image loaded successfully');
        console.log(`   Dimensions: ${img.width}x${img.height}`);
        resolve();
      };
      img.onerror = (e) => {
        console.error('   Failed to load image:', e);
        reject(new Error('Failed to load image'));
      };
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });

    console.log('   Running model prediction...');
    
    // Run inference using Teachable Machine's predict method
    // This method internally handles TensorFlow operations
    const predictions = await model.predict(img);

    // Parse results
    const results = predictions.map((pred) => ({
      className: pred.className,
      probability: pred.probability
    }));

    // Sort by probability (highest first)
    results.sort((a, b) => b.probability - a.probability);

    const topClass = results[0].className;
    const topProbability = results[0].probability;

    // Calculate weighted base risk using class probabilities
    const ai_base_risk = results.reduce((sum, { className, probability }) => {
      const riskScore = CLASS_RISK_SCORES[className] || 0;
      return sum + (riskScore * probability);
    }, 0);

    console.log('✅ Inference complete:');
    console.log(`   Top prediction: ${topClass} (${(topProbability * 100).toFixed(1)}%)`);
    console.log(`   AI base risk: ${(ai_base_risk * 100).toFixed(1)}%`);
    console.log('   All predictions:', results.map(r => 
      `${r.className}: ${(r.probability * 100).toFixed(1)}%`
    ).join(', '));

    return {
      success: true,
      ai_base_risk,
      predictions: results,
      topClass,
      topProbability,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Inference failed:', errorMessage);
    return {
      success: false,
      ai_base_risk: 0.1, // Fallback to default
      predictions: [],
      topClass: 'Unknown',
      topProbability: 0,
      error: errorMessage,
    };
  }
}

/**
 * Check if model is loaded
 */
export function isModelLoaded(): boolean {
  return model !== null;
}

/**
 * Get model load error if any
 */
export function getModelLoadError(): string | null {
  return modelLoadError;
}

/**
 * Dispose the model and clean up resources
 * Useful for hot module reloading in development
 */
export function disposeModel(): void {
  if (model) {
    console.log('🗑️ Disposing model...');
    try {
      model.dispose();
    } catch (e) {
      console.warn('⚠️ Error disposing model:', e);
    }
    model = null;
    modelLoadError = null;
    isLoading = false;
    loadPromise = null;
    console.log('✅ Model disposed');
  }
}
