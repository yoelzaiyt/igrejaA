import { CellGroup, Pastor } from './types';

export const cellGroups: CellGroup[] = [
  {
    id: '1',
    name: 'Célula Reencontro Alphaville',
    neighborhood: 'Alphaville',
    day: 'Quarta-feira',
    hour: '20:00',
    leader: 'Carlos & Marta',
    phone: '(11) 98765-4321',
  },
  {
    id: '2',
    name: 'Célula Conexão Jovem',
    neighborhood: 'Tamboré',
    day: 'Sábado',
    hour: '19:30',
    leader: 'Gustavo Santos',
    phone: '(11) 91234-5678',
  },
  {
    id: '3',
    name: 'Célula Atitude Barueri',
    neighborhood: 'Barueri',
    day: 'Quinta-feira',
    hour: '20:00',
    leader: 'Juliana Vieira',
    phone: '(11) 93344-5566',
  },
  {
    id: '4',
    name: 'Célula Graça & Paz',
    neighborhood: 'Santana de Parnaíba',
    day: 'Terça-feira',
    hour: '19:30',
    leader: 'Pr. Marcos Lima',
    phone: '(11) 92233-4455',
  },
  {
    id: '5',
    name: 'Célula Família Feliz',
    neighborhood: 'Alphaville 3',
    day: 'Quarta-feira',
    hour: '20:00',
    leader: 'André & Roberta',
    phone: '(11) 94455-6677',
  }
];

export const pastors: Pastor[] = [
  {
    id: '1',
    name: 'Pr. Josué Valandro Jr.',
    role: 'Pastor Sênior & Fundador',
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Pr. Wallace Cardozo',
    role: 'Pastor Responsável Alphaville',
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Pra. Viviane Santos',
    role: 'Ministério de Casais',
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Pra. Daniele Souza',
    role: 'Cuidado & Integração',
    available: true,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80',
  }
];

export const churchMembers = [
  'Gabriel Silva Reis',
  'Mariana Costa Oliveira',
  'Lucas Oliveira Mendes',
  'Ana Carolina Santos',
  'João Pedro Ferreira',
  'Beatriz Lima Souza',
  'Ricardo Almeida Neves',
  'Camila Nogueira Ramos',
  'Felipe Rodrigues Paiva',
  'Sofia Martins Carvalho'
];
