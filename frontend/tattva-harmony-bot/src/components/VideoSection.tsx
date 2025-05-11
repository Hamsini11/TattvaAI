
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LeafIcon from "./icons/LeafIcon";

const VideoSection: React.FC = () => {
  const videos = [
    {
      id: 1,
      title: "Introduction to Ayurveda",
      description: "Learn the basics of Ayurvedic medicine and how it can transform your health.",
      embedId: "vz4nVCeSMn4",
    },
    {
      id: 2,
      title: "Understanding the Three Doshas",
      description: "Explore Vata, Pitta, and Kapha doshas and their influence on your constitution.",
      embedId: "RO8mRlZM6rA",
    },
    {
      id: 3,
      title: "Benefits of Knowing Your Prakriti",
      description: "Discover how identifying your Prakriti can lead to personalized health strategies.",
      embedId: "JupAlzu4xTU",
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <LeafIcon className="text-tattva-green mr-3" size={24} />
          <h2 className="text-2xl md:text-3xl font-semibold text-tattva-green-dark">
            Educational Videos
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden border border-tattva-green-light/50 hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.embedId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-tattva-green-dark">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{video.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
