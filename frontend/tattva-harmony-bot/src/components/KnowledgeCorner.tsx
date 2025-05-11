
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import LeafIcon from "./icons/LeafIcon";

const KnowledgeCorner: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="tattva-btn-primary">
          <LeafIcon className="mr-2 text-white" size={16} />
          Discover Your Natural Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <LeafIcon className="mr-2 text-tattva-green" size={24} />
            Knowledge Corner
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="history" className="knowledge-tab">History</TabsTrigger>
            <TabsTrigger value="prakriti" className="knowledge-tab">Prakriti</TabsTrigger>
            <TabsTrigger value="tradition" className="knowledge-tab">Tradition</TabsTrigger>
            <TabsTrigger value="influence" className="knowledge-tab">Influence</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[500px] pr-4">
            <TabsContent value="history" className="space-y-4">
              <h3 className="text-xl font-semibold">History of Ayurveda</h3>
              <p>
                Ayurveda is one of the world's oldest holistic healing systems, developed more than 5,000 years ago in India. Its name derives from the Sanskrit words "ayur" (life) and "veda" (science or knowledge), translating to "the science of life."
              </p>
              <p>
                The origins of Ayurveda are traced to the ancient Vedic culture of India, with the wisdom being passed down from gods to sages, and then to human physicians. The earliest Ayurvedic texts, the Charaka Samhita, Sushruta Samhita, and Ashtanga Hridayam, codified the fundamental principles and practices.
              </p>
              <p>
                Unlike many ancient medical systems, Ayurveda has remained continuously practiced and evolved throughout the centuries, adapting to new discoveries while maintaining its core principles. Today, it is recognized as a traditional medical system by the World Health Organization and continues to influence global approaches to health and wellness.
              </p>
              <h3 className="text-xl font-semibold mt-6">Key Historical Developments</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>2500-500 BCE:</strong> Formation of fundamental Ayurvedic texts.</li>
                <li><strong>1000-1500 CE:</strong> Regional schools develop, enriching practices.</li>
                <li><strong>17th-19th Century:</strong> Exchange with Western medicine begins.</li>
                <li><strong>20th Century:</strong> Revival of Ayurveda in independent India.</li>
                <li><strong>21st Century:</strong> Global recognition and integration with modern medicine.</li>
              </ul>
            </TabsContent>
            <TabsContent value="prakriti" className="space-y-4">
              <h3 className="text-xl font-semibold">Origins of Prakriti Concept</h3>
              <p>
                Prakriti, derived from Sanskrit meaning "nature" or "constitution," is a fundamental concept in Ayurvedic medicine. It describes your unique physical and mental constitution, determined at conception and remaining constant throughout life.
              </p>
              <p>
                According to Ayurvedic texts, your Prakriti is formed at the moment of conception by the combination of three biological energies or doshas: Vata, Pitta, and Kapha. The specific proportion of these doshas creates your unique blueprint, influencing everything from physical characteristics to psychological tendencies.
              </p>
              <h3 className="text-xl font-semibold mt-6">The Three Doshas</h3>
              <div className="space-y-4">
                <div className="bg-tattva-green-light p-4 rounded-md">
                  <h4 className="font-medium">Vata (Air & Space)</h4>
                  <p>Governs movement, circulation, respiration, and nervous function. People with dominant Vata tend to be creative, energetic, and quick-thinking, but may also experience anxiety and irregular habits.</p>
                </div>
                <div className="bg-tattva-orange-light p-4 rounded-md">
                  <h4 className="font-medium">Pitta (Fire & Water)</h4>
                  <p>Controls digestion, metabolism, and transformation. Pitta-dominant individuals are typically intelligent, focused, and ambitious, but may be prone to irritability and inflammation.</p>
                </div>
                <div className="bg-tattva-yellow-light p-4 rounded-md">
                  <h4 className="font-medium">Kapha (Earth & Water)</h4>
                  <p>Maintains structure, stability, and lubrication. Those with Kapha dominance are often calm, compassionate, and strong, but can struggle with lethargy and resistance to change.</p>
                </div>
              </div>
              <p className="mt-4">
                Understanding your Prakriti is the foundation of Ayurvedic health, as it provides insights into your natural tendencies, potential vulnerabilities, and optimal lifestyle choices. Unlike modern medicine's one-size-fits-all approach, Ayurveda recognizes that what constitutes balance varies from person to person based on their unique Prakriti.
              </p>
            </TabsContent>
            <TabsContent value="tradition" className="space-y-4">
              <h3 className="text-xl font-semibold">Understanding the 5000-Year Tradition</h3>
              <p>
                Ayurveda's remarkable longevity as a healing tradition spans more than five millennia, making it one of humanity's oldest continuously practiced medical systems. Its endurance speaks to both its effectiveness and adaptability across changing civilizations and cultures.
              </p>
              <h3 className="text-xl font-semibold mt-6">Timeline of Ayurvedic Development</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-tattva-green pl-4 py-2">
                  <h4 className="font-medium">Vedic Period (1500-500 BCE)</h4>
                  <p>Early concepts appear in the Atharvaveda, with references to herbs, healing practices, and the first mentions of the tridosha theory.</p>
                </div>
                <div className="border-l-4 border-tattva-green pl-4 py-2">
                  <h4 className="font-medium">Classical Period (500 BCE-1000 CE)</h4>
                  <p>Formalization of Ayurvedic knowledge in major texts. Development of eight branches of Ayurveda, including internal medicine, surgery, and rejuvenation therapy.</p>
                </div>
                <div className="border-l-4 border-tattva-green pl-4 py-2">
                  <h4 className="font-medium">Medieval Period (1000-1700 CE)</h4>
                  <p>Regional adaptations and refinements. Integration with Unani medicine during Islamic influence in India. Preservation through manuscripts and gurukul tradition.</p>
                </div>
                <div className="border-l-4 border-tattva-green pl-4 py-2">
                  <h4 className="font-medium">Colonial Period (1700-1947)</h4>
                  <p>Decline under British rule as Western medicine was promoted. Survival through traditional practitioner families and rural practice.</p>
                </div>
                <div className="border-l-4 border-tattva-green pl-4 py-2">
                  <h4 className="font-medium">Modern Revival (1947-Present)</h4>
                  <p>Post-independence recognition and institutional support. Research efforts to validate traditional knowledge. Global spread and integration with complementary health approaches.</p>
                </div>
              </div>
              <p className="mt-4">
                Throughout this extensive history, the core principles of Ayurveda—understanding individual constitution, maintaining balance, and viewing health holistically—have remained remarkably consistent, even as practical applications evolved to address new challenges and incorporate new knowledge.
              </p>
            </TabsContent>
            <TabsContent value="influence" className="space-y-4">
              <h3 className="text-xl font-semibold">How Doshas Influence Health</h3>
              <p>
                In Ayurvedic medicine, your health status at any given moment is determined by the relationship between your innate constitution (Prakriti) and your current state (Vikriti). When your doshas are in balance relative to your natural constitution, you experience health; when they deviate significantly, illness can result.
              </p>
              <h3 className="text-xl font-semibold mt-6">Balancing Mechanisms</h3>
              <p>
                Ayurveda provides specific practices to maintain or restore balance for each dosha:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-center">Vata Balance</h4>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Regular daily routine</li>
                    <li>Warm, cooked foods</li>
                    <li>Calming activities</li>
                    <li>Oil massage (Abhyanga)</li>
                    <li>Staying warm and grounded</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-center">Pitta Balance</h4>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Cooling foods and herbs</li>
                    <li>Moderate exercise</li>
                    <li>Avoiding excessive heat</li>
                    <li>Mindfulness practices</li>
                    <li>Regular sleep schedule</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-center">Kapha Balance</h4>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Stimulating activities</li>
                    <li>Vigorous exercise</li>
                    <li>Light, warm, dry foods</li>
                    <li>Variety and stimulation</li>
                    <li>Fasting periodically</li>
                  </ul>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6">Health Implications</h3>
              <p>
                Each dosha, when imbalanced, creates predictable patterns of dysfunction:
              </p>
              <div className="space-y-3 mt-4">
                <div className="flex items-start">
                  <div className="bg-gray-200 rounded-full p-2 mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" /></svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Excess Vata</h4>
                    <p>Anxiety, insomnia, dry skin, constipation, irregular digestion, joint pain, restlessness</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-200 rounded-full p-2 mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12a4 4 0 0 1 8 0" /><line x1="12" y1="10" x2="12" y2="10" /></svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Excess Pitta</h4>
                    <p>Inflammation, irritability, acid reflux, skin rashes, excessive hunger, overheating, sharp headaches</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-gray-200 rounded-full p-2 mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a8 8 0 0 0 8-8c0-5-8-13-8-13S4 9 4 14a8 8 0 0 0 8 8Z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Excess Kapha</h4>
                    <p>Congestion, lethargy, weight gain, fluid retention, slow digestion, depression, attachment issues</p>
                  </div>
                </div>
              </div>
              <p className="mt-4">
                By identifying your dominant doshas and current imbalances, Ayurveda offers personalized strategies to prevent illness and optimize wellness. This personalized approach to health is increasingly recognized by modern medicine as we move toward more individualized healthcare models.
              </p>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeCorner;
