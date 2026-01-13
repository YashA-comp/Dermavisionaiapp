import { Activity } from "lucide-react";
import { Button } from "./ui/button";

interface WelcomeScreenProps {
  onStartScan: () => void;
  modelStatus?: 'loading' | 'loaded' | 'error';
}

export function WelcomeScreen({ onStartScan, modelStatus = 'loading' }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <Activity className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">DermaVision AI</h1>
          <p className="text-lg text-gray-600">
            Intelligent Skin Condition Triage
          </p>
        </div>

        {/* AI Model Status */}
        {modelStatus === 'loading' && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-800 font-medium">Loading AI model...</p>
            </div>
          </div>
        )}
        
        {modelStatus === 'loaded' && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-600 text-xl">✓</span>
              <p className="text-green-800 font-medium">AI Ready - 5 Skin Conditions Trained</p>
            </div>
          </div>
        )}
        
        {modelStatus === 'error' && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-amber-600 text-xl">⚠</span>
              <p className="text-amber-800 font-medium">AI model not loaded - Using fallback mode</p>
            </div>
            <p className="text-xs text-amber-700 mt-2">
              App will still work with symptom-based assessment
            </p>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <p className="text-gray-700 leading-relaxed">
            Upload a photo of the affected skin area and answer a few simple questions. 
            Our AI-powered system will provide an initial risk assessment to help guide your next steps.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onStartScan}
          disabled={modelStatus === 'loading'}
          className="w-full h-14 text-lg font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {modelStatus === 'loading' ? 'Preparing AI...' : 'Start New Scan'}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4">
          This tool is for informational purposes only and does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}