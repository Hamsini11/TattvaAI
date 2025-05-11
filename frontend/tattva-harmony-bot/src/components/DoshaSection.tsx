
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VataIcon, PittaIcon, KaphaIcon } from "./icons/DoshaIcons";

const DoshaSection: React.FC = () => {
  const doshas = [
    {
      name: "Vata",
      description: "The energy of movement and change. Composed of Air and Space elements.",
      qualities: ["Light", "Dry", "Mobile", "Cold", "Rough", "Subtle"],
      icon: VataIcon,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Pitta",
      description: "The energy of transformation and metabolism. Composed of Fire and Water elements.",
      qualities: ["Hot", "Sharp", "Light", "Liquid", "Spreading", "Oily"],
      icon: PittaIcon,
      color: "bg-tattva-orange-light text-tattva-orange-dark",
    },
    {
      name: "Kapha",
      description: "The energy of structure and cohesion. Composed of Earth and Water elements.",
      qualities: ["Heavy", "Slow", "Cold", "Oily", "Smooth", "Dense", "Soft", "Stable"],
      icon: KaphaIcon,
      color: "bg-tattva-green-light text-tattva-green-dark",
    },
  ];

  return (
    <section className="py-12 px-4 bg-tattva-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-tattva-green-dark">
          The Three Doshas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doshas.map((dosha) => (
            <Card key={dosha.name} className="border border-tattva-green-light/30 hover:shadow-md transition-shadow">
              <CardHeader className={`${dosha.color} flex flex-col items-center py-6`}>
                <dosha.icon size={60} className={`mb-3`} />
                <CardTitle className="text-xl">{dosha.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4">{dosha.description}</p>
                <div>
                  <h4 className="font-medium mb-2">Key Qualities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {dosha.qualities.map((quality) => (
                      <span 
                        key={quality} 
                        className="inline-block px-3 py-1 text-sm rounded-full bg-gray-100"
                      >
                        {quality}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoshaSection;
