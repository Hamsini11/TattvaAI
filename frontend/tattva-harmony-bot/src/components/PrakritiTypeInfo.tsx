import React from "react";
import { prakritiData } from "@/lib/prakritiData";
import { AyurvedicSymbol } from "./AyurvedicSymbols";
import { DecorativeCorner } from "./DecorativeCorner";

interface PrakritiTypeInfoProps {
  prakritiType: string;
}

const PrakritiTypeInfo: React.FC<PrakritiTypeInfoProps> = ({ prakritiType }) => {
  const data = prakritiData[prakritiType] || prakritiData.default;
  
  // Extract dosha and guna components
  const parts = prakritiType.split(" ");
  const guna = parts[0].toLowerCase();
  const deha = parts[1].toLowerCase();
  const manas = parts[2].toLowerCase();
  
  return (
    <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border border-amber-200 rounded-lg p-6 shadow-inner relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22%3E%3Cpath d=%22M15 3C8.373 3 3 8.373 3 15s5.373 12 12 12 12-5.373 12-12S21.627 3 15 3zm0 21c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9-4.029 9-9 9z%22 fill-opacity=%220.03%22/%3E%3C/svg%3E')] opacity-50"></div>
      
      {/* Ancient-style header */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-amber-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 px-4 text-2xl font-semibold text-amber-800 font-serif italic">
            {data.sanskrit}
          </span>
        </div>
      </div>
      
      {/* Title and symbol */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-amber-900 mb-4">{data.title}</h3>
        
        {/* Symbol in decorative circle */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 shadow-inner flex items-center justify-center">
            <span 
              role="img" 
              aria-label={`${prakritiType} symbol`} 
              className="text-3xl"
            >
              {data.symbol}
            </span>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-200 mb-6">
        <p className="text-amber-800 leading-relaxed">{data.description}</p>
      </div>
      
      {/* Key attributes in artistic containers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200 shadow-sm">
          <h4 className="font-medium mb-2 text-emerald-800 flex items-center">
            <span className="mr-2">✨</span> Natural Strengths
          </h4>
          <ul className="list-disc pl-4 text-sm space-y-1 text-emerald-700">
            {data.strengths.map((strength, i) => (
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-lg border border-orange-200 shadow-sm">
          <h4 className="font-medium mb-2 text-amber-800 flex items-center">
            <span className="mr-2">🔄</span> Potential Challenges
          </h4>
          <ul className="list-disc pl-4 text-sm space-y-1 text-amber-700">
            {data.challenges.map((challenge, i) => (
              <li key={i}>{challenge}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-sky-100 p-4 rounded-lg border border-blue-200 shadow-sm">
          <h4 className="font-medium mb-2 text-sky-800 flex items-center">
            <span className="mr-2">🍃</span> Balance Tips
          </h4>
          <ul className="list-disc pl-4 text-sm space-y-1 text-sky-700">
            {data.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Ancient footer design */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center justify-center">
          <div className="h-px w-16 bg-amber-300"></div>
          <span className="mx-2 text-amber-500">॥</span>
          <div className="h-px w-16 bg-amber-300"></div>
        </div>
        <p className="mt-2 text-xs text-amber-600 italic">
          "To know yourself is the beginning of healing."
        </p>
      </div>
    </div>
  );
};

export default PrakritiTypeInfo;