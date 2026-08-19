import { create } from 'zustand'
import type { TasaCambio, Divisa } from "@/types/zodType";

type Store = {
  tasaAplicada: TasaCambio | null
  setTasaAplicada: (tasa: TasaCambio | null) => void
  divisa: Divisa | null
  setDivisaPago: ( divisa: Divisa | null) => void
}

const usePagosStore = create<Store>()((set) => ({
  tasaAplicada: null,
  setTasaAplicada: (tasa) => set({ tasaAplicada: tasa }),
  divisa: null,
  setDivisaPago: (divisa) => set({ divisa }),
}))

export default usePagosStore