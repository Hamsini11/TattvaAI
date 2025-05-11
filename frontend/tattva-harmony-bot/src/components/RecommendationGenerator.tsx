// RecommendationGenerator.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePrakritiStore } from "@/lib/store";
import LeafIcon from "./icons/LeafIcon";

const RecommendationGenerator = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const { 
    prakritiType, 
    deha_prakriti, 
    manas_prakriti, 
    guna_prakriti, 
    setRecommendationChart 
  } = usePrakritiStore();
  
  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/holistic-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prakritiType: prakritiType,
          deha_prakriti: deha_prakriti,
          manas_prakriti: manas_prakriti,
          guna_prakriti: guna_prakriti,
          session_id: localStorage.getItem('session_id') || "unknown"
        }),
      });
      
      const data = await response.json();
      setRecommendations(data.recommendations);
      setRecommendationChart(data.recommendationChart);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const saveRecommendations = () => {
    // Save to localStorage or your backend
    localStorage.setItem('ayurveda_recommendations', JSON.stringify(recommendations));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <LeafIcon className="mr-2 text-tattva-green" size={24} />
            Holistic Ayurvedic Wellness Plan
          </DialogTitle>
        </DialogHeader>
        
        {!recommendations ? (
          <div className="py-8 text-center">
            <p className="mb-6 text-lg">
              Generate your personalized 21-day Ayurvedic wellness plan based on your unique prakriti profile:
              <br />
              <span className="font-semibold text-tattva-green">{prakritiType}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Your plan will include personalized recommendations for sleep, yoga, pranayama, 
              meditation, self-care techniques, and optimal eating times.
            </p>
            <Button 
              onClick={generateRecommendations}
              className="bg-tattva-green hover:bg-tattva-green-dark text-white"
              disabled={loading}
            >
              {loading ? "Generating Your Plan..." : "Generate My Wellness Plan"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-8">
                {recommendations && recommendations.chart && (
                  <div dangerouslySetInnerHTML={{ __html: recommendations.chart }} />
                )}
                
                {recommendations && recommendations.sections && recommendations.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                    <p className="whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                className="bg-tattva-green hover:bg-tattva-green-dark text-white"
                onClick={saveRecommendations}
              >
                Save This Plan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationGenerator;