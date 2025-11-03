// components/CalorieCalculator.tsx
'use client';

import { useState } from 'react';
import { Camera, Upload, Loader2, AlertCircle } from 'lucide-react';

interface Food {
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface NutritionResult {
  foods: Food[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export default function CalorieCalculator() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
  
    setLoading(true);
    setError(null);
    setResult(null);
  
    try {
      // ✅ Convert image to base64 using Promise
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject('Failed to read image');
        reader.readAsDataURL(image);
      });
  
      // ✅ Use Vite-style env for Ionic / React builds
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Please add VITE_GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY');
  
      // ✅ Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this food image and provide detailed nutrition info in JSON format:
  {
    "foods": [
      {
        "name": "food name",
        "portion": "estimated portion with units",
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      }
    ],
    "totals": {
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number
    },
    "confidence": "high|medium|low",
    "notes": "any relevant observations"
  }
  
  Be specific about portions. If multiple items, list each separately. Be conservative with calorie estimates.`,
                  },
                  {
                    inline_data: {
                      mime_type: image.type,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
          }),
        }
      );
  
      const data = await response.json();
  
      if (data.error) throw new Error(data.error.message || 'Failed to analyze image');
  
      // ✅ Extract JSON safely
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
  
      if (!jsonMatch) throw new Error('Could not parse JSON from Gemini response');
  
      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📸 AI Calorie Calculator
          </h1>
          <p className="text-gray-600">Snap a photo, get instant nutrition info</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Upload Section */}
          {!preview ? (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>

              {/* Analyze Button */}
              {!result && !loading && (
                <button
                  onClick={analyzeImage}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Analyze Nutrition
                </button>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center gap-3 text-indigo-600 py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">Analyzing your food...</span>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  {/* Individual Foods */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">Detected Foods:</h3>
                    {result.foods.map((food, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{food.name}</h4>
                            <p className="text-sm text-gray-600">{food.portion}</p>
                          </div>
                          <span className="text-lg font-bold text-indigo-600">
                            {food.calories} cal
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>🥩 P: {food.protein_g}g</span>
                          <span>🍞 C: {food.carbs_g}g</span>
                          <span>🥑 F: {food.fat_g}g</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                    <h3 className="font-bold text-lg mb-4">Total Nutrition</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-indigo-100 text-sm">Calories</p>
                        <p className="text-3xl font-bold">{result.totals.calories}</p>
                      </div>
                      <div>
                        <p className="text-indigo-100 text-sm">Protein</p>
                        <p className="text-2xl font-semibold">{result.totals.protein_g}g</p>
                      </div>
                      <div>
                        <p className="text-indigo-100 text-sm">Carbs</p>
                        <p className="text-2xl font-semibold">{result.totals.carbs_g}g</p>
                      </div>
                      <div>
                        <p className="text-indigo-100 text-sm">Fat</p>
                        <p className="text-2xl font-semibold">{result.totals.fat_g}g</p>
                      </div>
                    </div>
                    
                    {/* Confidence Badge */}
                    <div className="mt-4 inline-block">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.confidence === 'high' ? 'bg-green-400 text-green-900' :
                        result.confidence === 'medium' ? 'bg-yellow-400 text-yellow-900' :
                        'bg-red-400 text-red-900'
                      }`}>
                        {result.confidence.toUpperCase()} CONFIDENCE
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {result.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note:</span> {result.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Analyze Another
                    </button>
                    <button
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Save to Log
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 Tip: Take photos from directly above for best results</p>
        </div>
      </div>
    </div>
  );
}