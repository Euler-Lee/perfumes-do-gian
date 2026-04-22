export type Categoria = {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  criado_em: string;
};

export type Perfume = {
  id: string;
  user_id: string;
  categoria_id: string | null;
  nome: string;
  marca: string | null;
  tipo: 'arabe' | 'importado';
  concentracao: string | null;
  familia_olfativa: string | null;
  descricao: string | null;
  volume_ml: number | null;
  preco: number | null;
  criado_em: string;
  categorias?: Categoria;
  usos?: PerfumeUso[];
};

export type PerfumeUso = {
  id: string;
  perfume_id: string;
  ambiente: 'trabalho' | 'casual' | 'noite' | 'eventos' | 'verao' | 'inverno';
  percentual: number;
};

export type Colecao = {
  id: string;
  user_id: string;
  perfume_id: string;
  quantidade: number;
  notas: string | null;
  na_colecao: boolean;
  criado_em: string;
  perfumes?: Perfume;
};

export type AmbienteLabel = {
  key: PerfumeUso['ambiente'];
  label: string;
  icon: string;
  cor: string;
};

export const AMBIENTES: AmbienteLabel[] = [
  { key: 'trabalho',  label: 'Trabalho / Escritório', icon: '💼', cor: '#3A5FA0' },
  { key: 'casual',    label: 'Casual / Dia a dia',    icon: '☀️', cor: '#C8A951' },
  { key: 'noite',     label: 'Noite / Balada',        icon: '🌙', cor: '#5C3D8F' },
  { key: 'eventos',   label: 'Eventos / Cerimônias',  icon: '🎩', cor: '#1B6B4A' },
  { key: 'verao',     label: 'Verão',                 icon: '🏖️', cor: '#D4714A' },
  { key: 'inverno',   label: 'Outono / Inverno',      icon: '❄️', cor: '#2A6080' },
];
