import { useState, useEffect, useRef } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { ImageInputScreen } from "./components/ImageInputScreen";
import { TriageChecklistScreen } from "./components/TriageChecklistScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { projectId, publicAnonKey } from './utils/supabase/info';
import { loadModel, isModelLoaded, runInference } from './utils/modelInference';

type Screen = "welcome" | "input" | "checklist" | "results";

interface ScanSession {
  imageUrl: string;
  ai_malignant_prob: number;
  symptoms: string[];
  final_risk_score: number;
  itch_val: boolean;
  bleed_val: boolean;
  growth_val: boolean;
  ai_predictions?: { className: string; probability: number }[];
  ai_top_class?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [scanSession, setScanSession] = useState<ScanSession>({
    imageUrl: "",
    ai_malignant_prob: 0.1, // Will be replaced by real AI prediction
    symptoms: [],
    final_risk_score: 0,
    itch_val: false,
    bleed_val: false,
    growth_val: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelLoadStatus, setModelLoadStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [modelError, setModelError] = useState<string | null>(null);
  const modelLoadAttempted = useRef(false); // Prevent duplicate loads in React Strict Mode

  // Load TensorFlow.js model on app startup
  useEffect(() => {
    // Prevent duplicate loads in React Strict Mode (development)
    if (modelLoadAttempted.current) {
      console.log('⏭️ Model load already attempted, skipping...');
      return;
    }
    
    modelLoadAttempted.current = true;
    
    const initModel = async () => {
      console.log('🚀 Initializing AI model...');
      const result = await loadModel();
      
      if (result.success) {
        setModelLoadStatus('loaded');
        console.log('✅ AI model ready');
      } else {
        setModelLoadStatus('error');
        setModelError(result.error || 'Unknown error loading model');
        console.error('❌ Failed to load AI model:', result.error);
      }
    };

    initModel();
  }, []);

  const handleStartScan = () => {
    setCurrentScreen("input");
  };

  const handleImageSelected = async (imageUrl: string) => {
    // Update image URL immediately
    setScanSession(prev => ({ ...prev, imageUrl }));
    
    // Run AI inference in the background
    if (isModelLoaded()) {
      console.log('🤖 Running AI analysis on uploaded image...');
      const result = await runInference(imageUrl);
      
      if (result.success) {
        // Update session with AI predictions
        setScanSession(prev => ({
          ...prev,
          ai_malignant_prob: result.ai_base_risk,
          ai_predictions: result.predictions,
          ai_top_class: result.topClass
        }));
        console.log(`✅ AI Analysis: ${result.topClass} detected with ${(result.ai_base_risk * 100).toFixed(1)}% base risk`);
      } else {
        console.warn('⚠️ AI inference failed, using fallback value:', result.error);
        // Keep default ai_malignant_prob = 0.1
      }
    } else {
      console.warn('⚠️ Model not loaded, skipping AI inference');
    }
    
    setCurrentScreen("checklist");
  };

  const handleAnalyze = async (symptoms: { itch_val: boolean; bleed_val: boolean; growth_val: boolean }) => {
    setIsSubmitting(true);
    
    // ========================================
    // WEIGHTED CLINICAL SCORE (WCS) ALGORITHM
    // ========================================
    // Formula: WCS = (P_AI × W_AI) + Σ(S_i × W_S_i)
    // With Critical Override: If critical symptoms → WCS = max(WCS, 0.75)
    
    // AI Primary Prediction (P_AI)
    const P_AI = scanSession.ai_malignant_prob;
    
    // AI Weight (W_AI) - Set high because AI is the primary driver
    const W_AI = 0.7;
    
    // Symptom Weights (W_S_i) - Lower weights for symptom support
    const W_ITCH = 0.10;      // Minor symptom (itching)
    const W_BLEED = 0.15;     // Critical symptom (bleeding)
    const W_GROWTH = 0.15;    // Critical symptom (rapid growth)
    
    // Symptom Values (S_i) - Binary: 1 if present, 0 if absent
    const S_itch = symptoms.itch_val ? 1 : 0;
    const S_bleed = symptoms.bleed_val ? 1 : 0;
    const S_growth = symptoms.growth_val ? 1 : 0;
    
    // Check for critical symptoms
    const hasCriticalSymptoms = symptoms.bleed_val || symptoms.growth_val;
    
    // Step 1: Calculate Weighted Clinical Score
    const WCS_raw = (P_AI * W_AI) + 
                    (S_itch * W_ITCH) + 
                    (S_bleed * W_BLEED) + 
                    (S_growth * W_GROWTH);
    
    // Step 2: Apply Critical Safety Override
    // If bleeding OR rapid growth is present, enforce minimum 75% risk
    let WCS = WCS_raw;
    if (hasCriticalSymptoms) {
      WCS = Math.max(WCS_raw, 0.75);
    }
    
    // Step 3: Clamp to valid range [0, 1]
    const final_risk_score = Math.min(1.0, Math.max(0, WCS));
    
    // Log the calculation for debugging
    console.log('📊 Weighted Clinical Score Calculation:');
    console.log(`   P_AI (AI Prediction): ${(P_AI * 100).toFixed(1)}%`);
    console.log(`   W_AI (AI Weight): ${W_AI}`);
    console.log(`   Symptoms: Itch=${S_itch}, Bleed=${S_bleed}, Growth=${S_growth}`);
    console.log(`   WCS_raw = (${P_AI.toFixed(2)} × ${W_AI}) + (${S_itch} × ${W_ITCH}) + (${S_bleed} × ${W_BLEED}) + (${S_growth} × ${W_GROWTH}) = ${WCS_raw.toFixed(3)}`);
    if (hasCriticalSymptoms) {
      console.log(`   ⚠️ Critical Override Applied: max(${WCS_raw.toFixed(3)}, 0.75) = ${WCS.toFixed(3)}`);
    }
    console.log(`   Final Risk Score: ${(final_risk_score * 100).toFixed(1)}%`);
    
    // Traffic Light System Labels
    let statusLabel = "";
    let statusColor = "";
    
    if (final_risk_score >= 0.71) {
      statusLabel = "Danger - See Specialist Urgently";
      statusColor = "#D32F2F"; // Red
    } else if (final_risk_score > 0.30) {
      statusLabel = "Caution - Visit Local Clinic";
      statusColor = "#FBC02D"; // Yellow
    } else {
      statusLabel = "Safe - Normal Spot";
      statusColor = "#388E3C"; // Green
    }

    // Build symptoms array
    const symptomsList: string[] = [];
    if (symptoms.itch_val) symptomsList.push("Actively Itching");
    if (symptoms.bleed_val) symptomsList.push("Bleeding/Crusting");
    if (symptoms.growth_val) symptomsList.push("Rapid Growth");

    try {
      // Save to Supabase database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-de0fc9cb/scans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            image_url: scanSession.imageUrl,
            symptoms: {
              itch_val: symptoms.itch_val,
              bleed_val: symptoms.bleed_val,
              growth_val: symptoms.growth_val
            },
            ai_prediction: scanSession.ai_top_class || "Unknown",
            ai_base_risk: P_AI,
            risk_score: final_risk_score,
            status: "completed",
            status_label: statusLabel,
            status_color: statusColor
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving scan to database:", errorData);
      } else {
        const result = await response.json();
        console.log("Scan saved successfully:", result);
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
    } finally {
      setIsSubmitting(false);
    }

    // Update scanSession and navigate to results
    setScanSession(prev => ({ 
      ...prev, 
      symptoms: symptomsList,
      final_risk_score,
      itch_val: symptoms.itch_val,
      bleed_val: symptoms.bleed_val,
      growth_val: symptoms.growth_val
    }));
    setCurrentScreen("results");
  };

  const handleBackToInput = () => {
    setCurrentScreen("input");
  };

  const handleBackToChecklist = () => {
    setCurrentScreen("checklist");
  };

  const handleBackToWelcome = () => {
    setScanSession({
      imageUrl: "",
      ai_malignant_prob: 0.1,
      symptoms: [],
      final_risk_score: 0,
      itch_val: false,
      bleed_val: false,
      growth_val: false
    });
    setCurrentScreen("welcome");
  };

  return (
    <div className="min-h-screen">
      {currentScreen === "welcome" && (
        <WelcomeScreen 
          onStartScan={handleStartScan}
          modelStatus={modelLoadStatus}
        />
      )}
      
      {currentScreen === "input" && (
        <ImageInputScreen
          onImageSelected={handleImageSelected}
          onBack={handleBackToWelcome}
        />
      )}
      
      {currentScreen === "checklist" && (
        <TriageChecklistScreen
          imageUrl={scanSession.imageUrl}
          onAnalyze={handleAnalyze}
          onBack={handleBackToInput}
        />
      )}
      
      {currentScreen === "results" && (
        <ResultsScreen
          imageUrl={scanSession.imageUrl}
          symptoms={{
            itch_val: scanSession.itch_val,
            bleed_val: scanSession.bleed_val,
            growth_val: scanSession.growth_val
          }}
          aiBaseProbability={scanSession.ai_malignant_prob}
          aiPredictions={scanSession.ai_predictions || []}
          aiTopClass={scanSession.ai_top_class || 'Unknown'}
          finalRiskScore={scanSession.final_risk_score}
          onBack={handleBackToChecklist}
          onHome={handleBackToWelcome}
        />
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700 font-medium text-lg">Checking the spot...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}