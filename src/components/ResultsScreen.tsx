import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle, AlertCircle as CautionIcon, Home, Shield } from "lucide-react";
import { Button } from "./ui/button";

interface ResultsScreenProps {
  imageUrl: string;
  symptoms: { itch_val: boolean; bleed_val: boolean; growth_val: boolean };
  aiBaseProbability: number;
  aiPredictions: { className: string; probability: number }[];
  aiTopClass: string;
  finalRiskScore: number;
  onBack: () => void;
  onHome: () => void;
}

export function ResultsScreen({ imageUrl, symptoms, aiBaseProbability, aiPredictions, aiTopClass, finalRiskScore, onBack, onHome }: ResultsScreenProps) {
  const [finalScore, setFinalScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [wasVetoApplied, setWasVetoApplied] = useState(false);

  useEffect(() => {
    // Use the Weighted Clinical Score calculated in App.tsx
    // No need to recalculate - just display the results
    
    // Check if critical override was applied
    const hasCriticalSymptoms = symptoms.bleed_val || symptoms.growth_val;
    
    // Animate the score
    setTimeout(() => {
      setFinalScore(finalRiskScore);
      setWasVetoApplied(hasCriticalSymptoms && finalRiskScore >= 0.75);
      setIsAnimating(false);
    }, 300);
  }, [finalRiskScore, symptoms]);

  // Traffic Light System
  const getTrafficLightStatus = (score: number) => {
    if (score >= 0.71) {
      return {
        level: "DANGER",
        label: "Danger - See Specialist Urgently",
        color: "#D32F2F",
        textColor: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-300",
        icon: <AlertTriangle className="w-12 h-12 text-red-700" strokeWidth={3} />,
        lightColor: "bg-red-600"
      };
    }
    if (score > 0.30) {
      return {
        level: "CAUTION",
        label: "Caution - Visit Local Clinic",
        color: "#FBC02D",
        textColor: "text-yellow-800",
        bg: "bg-yellow-50",
        border: "border-yellow-300",
        icon: <CautionIcon className="w-12 h-12 text-yellow-700" strokeWidth={3} />,
        lightColor: "bg-yellow-500"
      };
    }
    return {
      level: "SAFE",
      label: "Safe - Normal Spot",
      color: "#388E3C",
      textColor: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-300",
      icon: <CheckCircle className="w-12 h-12 text-green-700" strokeWidth={3} />,
      lightColor: "bg-green-600"
    };
  };

  const getSimpleAdvice = (score: number, vetoApplied: boolean) => {
    if (score >= 0.71) {
      return {
        title: "What This Means",
        message: "This spot has signs of danger. Please show this report to a doctor today or visit the nearest hospital. Early treatment is very important.",
        action: "🏥 Visit a specialist or hospital soon"
      };
    }
    if (score > 0.30 && vetoApplied) {
      return {
        title: "What This Means",
        message: "Your spot shows warning signs that need a doctor's attention. Please visit your local clinic or health center within the next few days.",
        action: "🏥 Visit your local clinic this week"
      };
    }
    if (score > 0.30) {
      return {
        title: "What This Means",
        message: "Your spot needs to be checked by a doctor. Visit your local clinic or health center within the next 1-2 weeks to be safe.",
        action: "🏥 Visit a clinic within 2 weeks"
      };
    }
    return {
        title: "What This Means",
        message: "This spot looks normal. Keep watching it for any changes. If it starts to grow, bleed, or itch, visit a doctor.",
        action: "👁️ Keep watching the spot for changes"
    };
  };

  const status = getTrafficLightStatus(finalScore);
  const advice = getSimpleAdvice(finalScore, wasVetoApplied);

  // Display percentage (0-100)
  const displayPercentage = Math.round(finalScore * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-teal-700 rounded">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Your Results</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        {/* Image Preview */}
        <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
          <img src={imageUrl} alt="Your spot" className="w-full h-48 object-cover" />
        </div>

        {/* Traffic Light Gauge - Visual Focus */}
        <div className={`${status.bg} ${status.border} border-3 rounded-2xl p-8 shadow-xl`}>
          <div className="text-center space-y-6">
            {/* Traffic Light Visual */}
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl">
                <div className="space-y-4">
                  {/* Red Light */}
                  <div className={`w-20 h-20 rounded-full ${finalScore >= 0.71 ? 'bg-red-600 shadow-lg shadow-red-400' : 'bg-gray-600'} transition-all duration-500`}>
                    {finalScore >= 0.71 && (
                      <div className="w-full h-full rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  {/* Yellow Light */}
                  <div className={`w-20 h-20 rounded-full ${finalScore > 0.30 && finalScore < 0.71 ? 'bg-yellow-500 shadow-lg shadow-yellow-400' : 'bg-gray-600'} transition-all duration-500`}>
                    {finalScore > 0.30 && finalScore < 0.71 && (
                      <div className="w-full h-full rounded-full bg-yellow-400 animate-pulse" />
                    )}
                  </div>
                  {/* Green Light */}
                  <div className={`w-20 h-20 rounded-full ${finalScore <= 0.30 ? 'bg-green-600 shadow-lg shadow-green-400' : 'bg-gray-600'} transition-all duration-500`}>
                    {finalScore <= 0.30 && (
                      <div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center">
              {status.icon}
            </div>

            {/* Risk Score */}
            <div className={`${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
              <div className="text-6xl font-bold" style={{ color: status.color }}>
                {displayPercentage}%
              </div>
              <div className="text-2xl font-bold mt-2" style={{ color: status.color }}>
                {status.level}
              </div>
            </div>

            {/* Status Label */}
            <div className={`${status.border} border-2 rounded-xl p-4 bg-white`}>
              <p className="text-xl font-bold" style={{ color: status.color }}>
                {status.label}
              </p>
            </div>

            {/* Safety Veto Badge */}
            {wasVetoApplied && (
              <div className="flex items-center justify-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-lg p-3">
                <Shield className="w-5 h-5 text-orange-700" />
                <span className="text-sm font-bold text-orange-700">Safety Check Applied</span>
              </div>
            )}
          </div>
        </div>

        {/* Simple "What This Means" Card */}
        <div className="bg-white border-3 border-gray-300 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-teal-600 text-white p-5">
            <h3 className="text-2xl font-bold">{advice.title}</h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-lg text-gray-800 leading-relaxed">
              {advice.message}
            </p>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-base font-semibold text-blue-900">
                {advice.action}
              </p>
            </div>
          </div>
        </div>

        {/* Risk of Serious Growth Breakdown */}
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 border-b-2 border-gray-200 p-4">
            <h4 className="font-bold text-gray-900 text-lg">Risk of Serious Growth</h4>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-700">AI Analysis (70% weight):</span>
              <span className="font-bold text-gray-900">{Math.round(aiBaseProbability * 100)}%</span>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-700">Your Symptoms Added (30% weight):</p>
              <ul className="space-y-2 text-base text-gray-700 ml-2">
                <li className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${symptoms.itch_val ? 'bg-orange-600' : 'bg-gray-300'}`} />
                    Itching
                  </span>
                  <span className={symptoms.itch_val ? 'font-bold text-orange-700' : 'text-gray-500'}>
                    {symptoms.itch_val ? '+10%' : '0%'}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${symptoms.bleed_val ? 'bg-red-600' : 'bg-gray-300'}`} />
                    <span>
                      Bleeding <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold ml-1">CRITICAL</span>
                    </span>
                  </span>
                  <span className={symptoms.bleed_val ? 'font-bold text-red-700' : 'text-gray-500'}>
                    {symptoms.bleed_val ? '+15%' : '0%'}
                  </span>
                </li>
                <li className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${symptoms.growth_val ? 'bg-purple-600' : 'bg-gray-300'}`} />
                    <span>
                      Growth <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold ml-1">CRITICAL</span>
                    </span>
                  </span>
                  <span className={symptoms.growth_val ? 'font-bold text-purple-700' : 'text-gray-500'}>
                    {symptoms.growth_val ? '+15%' : '0%'}
                  </span>
                </li>
              </ul>
            </div>
            {wasVetoApplied && (
              <>
                <div className="h-px bg-orange-300"></div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-700" />
                    <span className="text-sm font-bold text-orange-700">Critical Override: Minimum 75% enforced</span>
                  </div>
                </div>
              </>
            )}
            <div className="h-px bg-gray-300"></div>
            <div className="flex justify-between items-center text-lg font-bold pt-2">
              <span className="text-gray-900">Total Risk:</span>
              <span style={{ color: status.color }}>{displayPercentage}%</span>
            </div>
          </div>
        </div>

        {/* AI Model Predictions Breakdown */}
        {aiPredictions && aiPredictions.length > 0 && (
          <div className="bg-white border-2 border-blue-200 rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-50 border-b-2 border-blue-200 p-4">
              <h4 className="font-bold text-blue-900 text-lg">🤖 AI Model Analysis</h4>
              <p className="text-sm text-blue-700 mt-1">What the computer vision detected:</p>
            </div>
            <div className="p-5 space-y-3">
              {aiPredictions.slice(0, 5).map((pred, index) => {
                const percentage = Math.round(pred.probability * 100);
                const isTopPrediction = index === 0;
                // Clean up class name for display
                const displayName = pred.className.replace(/^\d+_/, '');
                
                return (
                  <div key={pred.className} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isTopPrediction && (
                          <span className="text-lg">🎯</span>
                        )}
                        <span className={`text-base ${isTopPrediction ? 'font-bold text-blue-900' : 'text-gray-700'}`}>
                          {displayName}
                        </span>
                        {isTopPrediction && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            TOP MATCH
                          </span>
                        )}
                      </div>
                      <span className={`text-base font-bold ${isTopPrediction ? 'text-blue-900' : 'text-gray-600'}`}>
                        {percentage}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${isTopPrediction ? 'bg-blue-600' : 'bg-gray-400'} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 mt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  These percentages show how confident the AI is about each condition type.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={onHome}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white h-14 text-lg font-semibold shadow-lg"
          >
            <Home className="w-6 h-6 mr-2" />
            Check Another Spot
          </Button>
        </div>

        {/* Simple Disclaimer */}
        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
          <p className="text-xs text-gray-700 text-center leading-relaxed">
            <strong>Important:</strong> This tool helps you understand your spot, but it is not a doctor. Always visit a real doctor for a proper check-up.
          </p>
        </div>
      </div>
    </div>
  );
}