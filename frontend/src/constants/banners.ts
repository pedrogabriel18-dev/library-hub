export interface BannerOption {
  name: string
  value: string
}

export const BANNER_COLORS: BannerOption[] = [
  { name: 'Vermelho', value: 'linear-gradient(135deg, #DC2626, #991B1B)' },
  { name: 'Azul', value: 'linear-gradient(135deg, #1D4ED8, #1E40AF)' },
  { name: 'Verde', value: 'linear-gradient(135deg, #16A34A, #15803D)' },
  { name: 'Roxo', value: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
  { name: 'Laranja', value: 'linear-gradient(135deg, #EA580C, #C2410C)' },
  { name: 'Cinza', value: 'linear-gradient(135deg, #4B5563, #374151)' },
  { name: 'Preto', value: 'linear-gradient(135deg, #1F2937, #111827)' },
  { name: 'Branco', value: 'linear-gradient(135deg, #FFFFFF, #D1D5DB)' },
]

export const BANNER_GRADIENTS: BannerOption[] = [
  { name: 'Vermelho → Azul', value: 'linear-gradient(135deg, #EF4444, #3B82F6)' },
  { name: 'Azul → Branco', value: 'linear-gradient(135deg, #3B82F6, #FFFFFF)' },
  { name: 'Azul Escuro → Roxo', value: 'linear-gradient(135deg, #1E3A8A, #7C3AED)' },
  { name: 'Cinza → Azul', value: 'linear-gradient(135deg, #6B7280, #3B82F6)' },
  { name: 'Vermelho → Preto', value: 'linear-gradient(135deg, #EF4444, #111827)' },
]
