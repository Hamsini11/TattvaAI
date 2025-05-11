import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PrakritiResult {
  deha_prakriti: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  manas_prakriti: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  guna_prakriti: {
    sattva: number;
    rajas: number;
    tamas: number;
  };
  backend_code: string;
}

interface PrakritiResultsProps {
  results: PrakritiResult;
}

const sanskritTerms = {
  deha: {
    title: "देह प्रकृति (Deha Prakriti)",
    description: "Physical Constitution - How your body manifests its inherent nature",
    doshas: {
      vata: "वात (Vāta) - Movement & Change",
      pitta: "पित्त (Pitta) - Transformation & Metabolism",
      kapha: "कफ (Kapha) - Structure & Stability"
    }
  },
  manas: {
    title: "मानस प्रकृति (Manas Prakriti)",
    description: "Mental Constitution - How your mind processes information and experiences",
    doshas: {
      vata: "वात बुद्धि (Vāta Buddhi) - Quick & Creative",
      pitta: "पित्त बुद्धि (Pitta Buddhi) - Sharp & Analytical",
      kapha: "कफ बुद्धि (Kapha Buddhi) - Steady & Retentive"
    }
  },
  guna: {
    title: "गुण प्रकृति (Guna Prakriti)",
    description: "Quality of Nature - Your fundamental mode of operation",
    qualities: {
      sattva: "सत्त्व (Sattva) - Harmony & Balance",
      rajas: "रजस् (Rajas) - Activity & Passion",
      tamas: "तमस् (Tamas) - Inertia & Stability"
    }
  }
};

const PrakritiResults: React.FC<PrakritiResultsProps> = ({ results }) => {
  const renderPercentages = (values: { [key: string]: number }, terms: { [key: string]: string }) => {
    return Object.entries(values).map(([key, value]) => (
      <div key={key} className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium">{terms[key]}</span>
          <span className="text-lg">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{sanskritTerms.deha.title}</CardTitle>
          <CardDescription>{sanskritTerms.deha.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderPercentages(results.deha_prakriti, sanskritTerms.deha.doshas)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{sanskritTerms.manas.title}</CardTitle>
          <CardDescription>{sanskritTerms.manas.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderPercentages(results.manas_prakriti, sanskritTerms.manas.doshas)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{sanskritTerms.guna.title}</CardTitle>
          <CardDescription>{sanskritTerms.guna.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderPercentages(results.guna_prakriti, sanskritTerms.guna.qualities)}
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Your Prakriti Code: {results.backend_code}</p>
        <p className="mt-2">
          This analysis reflects your natural constitution (Prakriti).
          For personalized guidance, please consult an Ayurvedic practitioner.
        </p>
      </div>
    </div>
  );
};

export default PrakritiResults; 