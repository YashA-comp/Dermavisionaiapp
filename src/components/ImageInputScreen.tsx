import { useState, useRef } from "react";
import { Upload, X, ArrowLeft, ImageIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ImageInputScreenProps {
  onImageSelected: (imageUrl: string) => void;
  onBack: () => void;
}

export function ImageInputScreen({ onImageSelected, onBack }: ImageInputScreenProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (previewUrl) {
      onImageSelected(previewUrl);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-teal-700 rounded">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold">Upload Image</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {!previewUrl && (
          <div className="space-y-6">
            <div className="text-center space-y-3 mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Upload Photo of Skin Spot</h3>
              <p className="text-gray-600 text-base">
                Select a clear photo taken in good lighting
              </p>
            </div>

            {/* Upload Photo Section */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-4 border-teal-400 rounded-2xl p-12 text-center shadow-xl">
              <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ImageIcon className="w-20 h-20 text-teal-600" strokeWidth={2} />
              </div>
              
              <h3 className="text-3xl font-bold text-teal-900 mb-3">Choose Photo</h3>
              <p className="text-teal-800 mb-8 text-lg">
                Select an image from your device
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-teal-600 hover:bg-teal-700 text-white h-16 px-12 text-xl font-bold shadow-xl"
                size="lg"
              >
                <Upload className="w-7 h-7 mr-3" />
                Upload Photo
              </Button>
              
              <p className="text-sm text-teal-700 mt-6">
                Supported formats: JPG, PNG, HEIC
              </p>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <h4 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Tips for Best Results
              </h4>
              <ul className="text-sm text-blue-800 space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Take photo in <strong>bright, natural lighting</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Ensure the spot is <strong>clearly visible and in focus</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Avoid blurry or dark images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Get close enough to see details</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {previewUrl && (
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 text-center">Review Your Photo</h3>
            
            <div className="relative rounded-xl overflow-hidden border-4 border-teal-300 shadow-2xl">
              <img src={previewUrl} alt="Preview" className="w-full h-auto" />
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Image Quality Checklist */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
              <p className="text-base font-bold text-amber-900 mb-3">✓ Quality Check:</p>
              <ul className="text-sm text-amber-900 space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Spot is clearly visible and in focus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Good lighting (not too dark or bright)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>Image is sharp, not blurry</span>
                </li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={clearImage}
                variant="outline"
                className="flex-1 border-2 border-gray-400 hover:bg-gray-50 h-16 text-lg font-semibold"
              >
                <X className="w-5 h-5 mr-2" />
                Choose Different Photo
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white h-16 text-lg font-bold shadow-xl"
              >
                Continue →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
