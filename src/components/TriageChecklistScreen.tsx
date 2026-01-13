import { useState } from "react";
import { ArrowLeft, AlertCircle, Droplet, Flame, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface TriageChecklistScreenProps {
  imageUrl: string;
  onAnalyze: (symptoms: { itch_val: boolean; bleed_val: boolean; growth_val: boolean }) => void;
  onBack: () => void;
}

export function TriageChecklistScreen({ imageUrl, onAnalyze, onBack }: TriageChecklistScreenProps) {
  const [itchVal, setItchVal] = useState(false);
  const [bleedVal, setBleedVal] = useState(false);
  const [growthVal, setGrowthVal] = useState(false);

  const handleGetAnalysis = () => {
    onAnalyze({
      itch_val: itchVal,
      bleed_val: bleedVal,
      growth_val: growthVal
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-teal-700 rounded">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Symptom Assessment</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Image Preview */}
        <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
          <img src={imageUrl} alt="Scan preview" className="w-full h-48 object-cover" />
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Please answer the following questions about your skin condition to help us provide an accurate assessment.
          </p>
        </div>

        {/* Symptom Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Symptom Checklist</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Itching */}
            <div className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="w-10 h-10 text-orange-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <Label htmlFor="itch" className="text-lg font-semibold text-gray-900 cursor-pointer block mb-1">
                  Actively Itching?
                </Label>
                <p className="text-sm text-gray-600">
                  Is the spot itchy or irritated?
                </p>
              </div>
              <Switch
                id="itch"
                checked={itchVal}
                onCheckedChange={setItchVal}
                className="data-[state=checked]:bg-teal-600 mt-2 scale-125"
              />
            </div>

            {/* Bleeding/Crusting */}
            <div className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Droplet className="w-10 h-10 text-red-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <Label htmlFor="bleed" className="text-lg font-semibold text-gray-900 cursor-pointer block mb-1">
                  Bleeding/Crusting?
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
                </Label>
                <p className="text-sm text-gray-600">
                  Any bleeding, oozing, or crust?
                </p>
              </div>
              <Switch
                id="bleed"
                checked={bleedVal}
                onCheckedChange={setBleedVal}
                className="data-[state=checked]:bg-red-600 mt-2 scale-125"
              />
            </div>

            {/* Rapid Growth */}
            <div className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-purple-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <Label htmlFor="growth" className="text-lg font-semibold text-gray-900 cursor-pointer block mb-1">
                  Rapid Growth?
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
                </Label>
                <p className="text-sm text-gray-600">
                  Has the spot grown in recent weeks?
                </p>
              </div>
              <Switch
                id="growth"
                checked={growthVal}
                onCheckedChange={setGrowthVal}
                className="data-[state=checked]:bg-purple-600 mt-2 scale-125"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleGetAnalysis}
          className="w-full h-14 text-lg font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-lg"
        >
          Get Analysis
        </Button>
      </div>
    </div>
  );
}