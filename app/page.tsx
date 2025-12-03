'use client';

import { useUser } from '@/hooks/useUser';
import CalorieCalculator from '@/components/CalorieCalculator';
import Navbar from '@/components/Navbar';
import { DailyNutrition } from '@/components/DailyNutrition';
export default function Home() {
  const user = useUser();

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        {!user ? (
          <div className="flex flex-col items-center mt-20 text-center">
    
          <img
            src="https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?q=80&w=800"
            className="w-72 h-72 object-cover rounded-2xl shadow-lg mb-6"
            alt="Healthy eating illustration"
          />
      
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to AI Calorie Tracker
          </h2>
      
          <p className="text-gray-600 mt-2 max-w-md">
            Sign in to unlock AI-powered calorie analysis from photos and track your meals effortlessly.
          </p>
        </div>
        ) : (
          <div>
          <DailyNutrition />
          <CalorieCalculator />
          </div>
        )}
      </div>
    </div>
  );
}
