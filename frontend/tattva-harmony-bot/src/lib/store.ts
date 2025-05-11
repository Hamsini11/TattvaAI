import { create } from 'zustand';

type PrakritiStore = {
  prakritiType: string;
  deha_prakriti: { vata: number; pitta: number; kapha: number };
  manas_prakriti: { vata: number; pitta: number; kapha: number };
  guna_prakriti: { sattva: number; rajas: number; tamas: number };
  recommendationChart: any;
  
  setPrakritiType: (type: string) => void;
  setDehaPrakriti: (values: {vata: number; pitta: number; kapha: number}) => void;
  setManasPrakriti: (values: {vata: number; pitta: number; kapha: number}) => void;
  setGunaPrakriti: (values: {sattva: number; rajas: number; tamas: number}) => void;
  setRecommendationChart: (chart: any) => void;
};

export const usePrakritiStore = create<PrakritiStore>((set) => ({
  prakritiType: "",
  deha_prakriti: { vata: 0, pitta: 0, kapha: 0 },
  manas_prakriti: { vata: 0, pitta: 0, kapha: 0 },
  guna_prakriti: { sattva: 0, rajas: 0, tamas: 0 },
  recommendationChart: null,
  
  setPrakritiType: (type) => set({ prakritiType: type }),
  setDehaPrakriti: (values) => set({ deha_prakriti: values }),
  setManasPrakriti: (values) => set({ manas_prakriti: values }),
  setGunaPrakriti: (values) => set({ guna_prakriti: values }),
  setRecommendationChart: (chart) => set({ recommendationChart: chart }),
}));