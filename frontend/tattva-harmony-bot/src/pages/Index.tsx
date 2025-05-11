import React, { useEffect } from "react";
import LeafIcon from "@/components/icons/LeafIcon";
import KnowledgeCorner from "@/components/KnowledgeCorner";
import TattvaBot from "@/components/TattvaBot";
import VideoSection from "@/components/VideoSection";
import DoshaSection from "@/components/DoshaSection";
import ResultsPlaceholder from "@/components/ResultsPlaceholder";
import AyurvedicRecommendations from "@/components/AyurvedicRecommendations";
import Footer from "@/components/Footer";
import { usePrakritiStore } from "@/lib/store";

const Index = () => {
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
  const { prakritiType} = testPrakriti;
  // const { prakritiType } = usePrakritiStore();
  
  // Always scroll to top on page load/reload
  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'auto'; // Use browser's default behavior
    }
  }, []);
  console.log("Current prakritiType:", prakritiType);
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tattva-green-light to-white py-20 px-4 overflow-hidden">
        <div className="leaf-bg absolute inset-0 opacity-20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center">
              <LeafIcon className="text-tattva-green h-10 w-10 sm:h-12 sm:w-12 mr-3" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-tattva-green-dark">
                Tattva AI
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-gray-700 max-w-2xl mb-10 animate-fade-in">
              Discover your natural balance through ancient wisdom
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <TattvaBot />
              <KnowledgeCorner />
            </div>
          </div>
        </div>
      </section>
      
      {/* Dosha Section */}
      <DoshaSection />
      
      {/* Results Placeholder */}
      <ResultsPlaceholder />
      
      {/* Ayurvedic Recommendations - Only shown when prakriti is available */}
      {prakritiType && <AyurvedicRecommendations />}
      
      {/* <VideoSection /> */}

      <Footer />
    </div>
  );
};

export default Index;
