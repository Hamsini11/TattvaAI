import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { usePrakritiStore } from "@/lib/store";
import RecommendationGenerator from "./RecommendationGenerator";
import LeafIcon from "@/components/icons/LeafIcon";
import { Button } from "@/components/ui/button";
import PrakritiTypeInfo from "./PrakritiTypeInfo";
import DoshaDonutChart from "./DoshaDonutChart";

// Helper function to get avatar paths based on prakriti combination
const getAvatarPaths = async (prakritiType: string) => {
  if (!prakritiType) return [];
  
  const [guna, deha, manas] = prakritiType.split(' ');
  const baseAvatarName = `${guna.charAt(0).toUpperCase()}${deha.charAt(0).toUpperCase()}${manas.charAt(0).toUpperCase()}`;
  
  try {
    const files = import.meta.glob('/src/assets/avatars/*.png');
    console.log('Available files:', Object.keys(files)); // Log all available files
    console.log('Base avatar name:', baseAvatarName); // Log base avatar name

    const matchingAvatars = Object.keys(files)
      .filter(path => path.includes(baseAvatarName))
      .map(path => ({
        path,
        isFemale: path.toLowerCase().includes('f'),
        isMale: path.toLowerCase().includes('m')
      }));
    
    console.log('Matching avatars:', matchingAvatars); // Log matching avatars
    return matchingAvatars;
  } catch (error) {
    console.error('Error loading avatar files:', error);
    return [];
  }
};

const ResultsPlaceholder: React.FC = () => {
  const testPrakriti = {
    prakritiType: "Taamasika Kapha Pitta",
    deha_prakriti: {
      vata: 15,
      pitta: 10,
      kapha: 75
    },
    manas_prakriti: {
      vata: 20,
      pitta: 65,
      kapha: 15
    },
    guna_prakriti: {
      sattva: 15,
      rajas: 25,
      tamas: 60
    }
  };
  const { prakritiType, deha_prakriti, manas_prakriti, guna_prakriti } = testPrakriti;
  // const { prakritiType, deha_prakriti, manas_prakriti, guna_prakriti } = usePrakritiStore();
  const [avatars, setAvatars] = useState<Array<{ path: string; isFemale: boolean; isMale: boolean }>>([]);
  const [selectedGender, setSelectedGender] = useState<'combined' | 'male' | 'female'>('combined');
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  
  useEffect(() => {
    if (prakritiType) {
      getAvatarPaths(prakritiType).then(setAvatars);
    }
  }, [prakritiType]);

  useEffect(() => {
    console.log("Current prakritiType:", prakritiType);
  }, [prakritiType]);

  useEffect(() => {
    console.log("Current avatars:", avatars);
  }, [avatars]);

  // Get the appropriate avatar based on selection
  const currentAvatar = avatars.find(avatar => {
    if (selectedGender === 'combined') return !avatar.isFemale && !avatar.isMale;
    if (selectedGender === 'female') return avatar.isFemale;
    if (selectedGender === 'male') return avatar.isMale;
  });

  return (
    <section id="results" className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border border-dashed border-tattva-green/50 bg-tattva-green-light/10">
          <CardHeader className="flex flex-row items-center justify-center">
            <Bot className="h-6 w-6 mr-2 text-tattva-green" />
            <CardTitle>Your Prakriti</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            {prakritiType ? (
              <div className="flex flex-col items-center">
                {avatars.length > 0 && (
                  <div className="mb-6">
                    {avatars.length > 1 && (
                      <div className="mb-4 space-x-2">
                        {avatars.some(a => !a.isFemale && !a.isMale) && (
                          <button
                            onClick={() => setSelectedGender('combined')}
                            className={`px-3 py-1 rounded ${selectedGender === 'combined' ? 'bg-tattva-green text-white' : 'bg-tattva-green/10'}`}
                          >
                            Combined
                          </button>
                        )}
                        {avatars.some(a => a.isMale) && (
                          <button
                            onClick={() => setSelectedGender('male')}
                            className={`px-3 py-1 rounded ${selectedGender === 'male' ? 'bg-tattva-green text-white' : 'bg-tattva-green/10'}`}
                          >
                            Male
                          </button>
                        )}
                        {avatars.some(a => a.isFemale) && (
                          <button
                            onClick={() => setSelectedGender('female')}
                            className={`px-3 py-1 rounded ${selectedGender === 'female' ? 'bg-tattva-green text-white' : 'bg-tattva-green/10'}`}
                          >
                            Female
                          </button>
                        )}
                      </div>
                    )}
                    <img 
                      src={currentAvatar?.path} 
                      alt={`${prakritiType} Avatar`}
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>
                )}
                <div className="bg-tattva-green/10 rounded-lg p-8 w-full max-w-md">
                  <h3 className="text-4xl font-bold text-tattva-green">
                    {prakritiType}
                  </h3>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Guna Prakriti • Deha Prakriti • Manas Prakriti</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <DoshaDonutChart 
                    title="Physical (Deha)" 
                    values={[
                      { name: "Vata", value: deha_prakriti.vata, color: "#60A5FA" }, // Blue
                      { name: "Pitta", value: deha_prakriti.pitta, color: "#F97316" }, // Orange 
                      { name: "Kapha", value: deha_prakriti.kapha, color: "#4ADE80" }  // Green
                    ]}
                  />
                  <DoshaDonutChart 
                    title="Mental (Manas)" 
                    values={[
                      { name: "Vata", value: manas_prakriti.vata, color: "#60A5FA" }, // Blue
                      { name: "Pitta", value: manas_prakriti.pitta, color: "#F97316" }, // Orange
                      { name: "Kapha", value: manas_prakriti.kapha, color: "#4ADE80" }  // Green
                    ]}
                  />
                  <DoshaDonutChart 
                    title="Quality (Guna)" 
                    values={[
                      { name: "Sattva", value: guna_prakriti.sattva, color: "#FBBF24" }, // Yellow
                      { name: "Rajas", value: guna_prakriti.rajas, color: "#EC4899" },   // Pink
                      { name: "Tamas", value: guna_prakriti.tamas, color: "#6B7280" }    // Gray
                    ]}
                  />
                </div>
                {/* Add the PrakritiTypeInfo component instead */}
                <div className="mt-8 w-full">
                    <PrakritiTypeInfo prakritiType={prakritiType} />
                  </div>
                </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-lg">Complete your assessment with Tattva Bot to discover your prakriti</p>
                  <p className="text-sm text-muted-foreground mt-2">Your unique mind-body constitution will be revealed here</p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Vata</span>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Pitta</span>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">Kapha</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Add the recommendations generator */}
      <RecommendationGenerator 
        open={recommendationsOpen} 
        onOpenChange={setRecommendationsOpen} 
      />
    </section>
  );
};

export default ResultsPlaceholder;
