import { CellGroup, Pastor, Slide } from '../types';
import { supabase } from '../lib/supabase';

export interface BrandConfig {
  id: string;
  name: string;
  domain?: string;
  campusName: string;
  logoUrl: string;
  bgUrl: string;
  dashboardBgUrl?: string;
  primaryColor: string;
  primaryColorHover: string;
  accentColor: string;
  type: 'church' | 'synagogue';
  termPastor: string;
  termPastors: string;
  termPastoral: string;
  termCult: string;
  termCults: string;
  termDonation: string;
  termDonations: string;
  termConnect: string;
  termConnects: string;
  termMember: string;
  location: string;
  wifi: string;
  pixKey: string;
  whatsappNumber?: string;
  pastors: Pastor[];
  cellGroups: CellGroup[];
  glowColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  badgeLabel: string;
  accentSplashColor: string;
  slides?: Slide[];
  // Fotos institucionais por módulo do dashboard (tela "Como podemos ajudar
  // você?") — opcional; quando ausente, cada card usa a imagem genérica
  // padrão de MODULE_BG em DashboardView.tsx. Chaves batem com as usadas lá.
  moduleBackgrounds?: {
    newMember?: string;
    donations?: string;
    ministries?: string;
    checkin?: string;
    myCell?: string;
    prayer?: string;
  };
  // Vitrine do app oficial da igreja (QR codes) — opcional; quando ausente,
  // o botão/modal correspondente no rodapé do dashboard não aparece.
  appLinks?: {
    ios?: string;
    android?: string;
  };
}

export const brands: Record<string, BrandConfig> = {
  atitude: {
    id: 'atitude',
    domain: 'santuario-atitude.vercel.app',
    name: 'Atitude',
    campusName: 'Alphaville',
    logoUrl: 'https://i0.wp.com/igrejaatitude.com.br/wp-content/themes/ibatitude/images/logo.png',
    bgUrl: 'https://i0.wp.com/igrejaatitude.com.br/wp-content/uploads/2025/03/hall-iba.png',
    primaryColor: '#e30613',
    primaryColorHover: '#c61118',
    accentColor: '#e30613',
    glowColor: 'rgba(245, 195, 30, 0.25)',
    badgeBgColor: '#f5c31e',
    badgeTextColor: '#0a0a0a',
    badgeLabel: 'Igreja Batista Atitude',
    accentSplashColor: '#f5c31e',
    slides: [
      {
        bgUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&fit=crop&q=80',
        verse: 'Seja forte e corajoso! Não se apavore, nem se desanime.',
        verseRef: 'Josué 1:9'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1548625361-ec4682df6250?w=1600&fit=crop&q=80',
        verse: 'Alegrei-me com os que me disseram: Vamos à casa do Senhor!',
        verseRef: 'Salmos 122:1'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=1600&fit=crop&q=80',
        verse: 'Deem graças ao Senhor, porque ele é bom.',
        verseRef: 'Salmos 136:1'
      }
    ],
    type: 'church',
    termPastor: 'Pastor',
    termPastors: 'Pastores',
    termPastoral: 'Atendimento Pastoral',
    termCult: 'Culto',
    termCults: 'Cultos de Celebração',
    termDonation: 'Dízimo ou Oferta',
    termDonations: 'Dízimos e Ofertas',
    termConnect: 'Célula',
    termConnects: 'Pequenos Grupos',
    termMember: 'Novo Membro',
    location: 'Av. Juruá, 159 - Alphaville, Barueri - SP',
    wifi: 'Atitude_Guest',
    pixKey: 'pixsaopaulo@ibatitude.com.br',
    pastors: [
      {
        id: '1',
        name: 'Pr. Josué Valandro Jr.',
        role: 'Pastor Sênior & Fundador',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&fit=crop&q=80',
      },
      {
        id: '2',
        name: 'Pr. Wallace Cardozo',
        role: 'Pastor Responsável Alphaville',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&fit=crop&q=80',
      },
      {
        id: '3',
        name: 'Pra. Viviane Santos',
        role: 'Ministério de Casais',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80',
      },
      {
        id: '4',
        name: 'Pra. Daniele Souza',
        role: 'Cuidado & Integração',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&fit=crop&q=80',
      }
    ],
    cellGroups: [
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
    ]
  },
  icconselheira: {
    id: 'icconselheira',
    domain: 'santuario-icc.vercel.app',
    name: 'Igreja Cristã Conselheira',
    campusName: 'ICC',
    logoUrl: '/images/icc/logo.png',
    bgUrl: 'https://static.wixstatic.com/media/6ffcad_074e01478e384e37a4e59dd024c7c5ca~mv2.png/v1/crop/x_0,y_129,w_2048,h_894/fill/w_1966,h_858,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMAGEM%20DE%20ABERTURA%20PARA%20SITE.png',
    dashboardBgUrl: 'https://static.wixstatic.com/media/6ffcad_3f8d653f42e04ddf9ec57a6f5d3e188c~mv2.jpg/v1/fill/w_2500,h_1250,al_c/6ffcad_3f8d653f42e04ddf9ec57a6f5d3e188c~mv2.jpg',
    primaryColor: '#2C5A4C',
    primaryColorHover: '#1B3B31',
    accentColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.25)',
    badgeBgColor: '#d4af37',
    badgeTextColor: '#0a0a0a',
    badgeLabel: 'ICC',
    accentSplashColor: '#d4af37',
    slides: [
      {
        bgUrl: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=1600&fit=crop&q=80',
        verse: 'O Senhor é o meu pastor; de nada terei falta.',
        verseRef: 'Salmos 23:1'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=1600&fit=crop&q=80',
        verse: 'Onde estiverem dois ou três reunidos em meu nome, aí estou eu.',
        verseRef: 'Mateus 18:20'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&fit=crop&q=80',
        verse: 'Ensina-nos a contar os nossos dias para que o nosso coração alcance sabedoria.',
        verseRef: 'Salmos 90:12'
      }
    ],
    type: 'church',
    termPastor: 'Pastor',
    termPastors: 'Pastores',
    termPastoral: 'Atendimento Pastoral',
    termCult: 'Culto',
    termCults: 'Cultos',
    termDonation: 'Contribuição',
    termDonations: 'Contribuições',
    termConnect: 'Grupo',
    termConnects: 'Grupos',
    termMember: 'Membro',
    location: 'Av. Nova Cantareira, 3014 - Tucuruvi - São Paulo',
    wifi: 'ICC_Wifi',
    pixKey: 'pix@icc.com.br',
    pastors: [
      {
        id: '1',
        name: 'Pastor Local',
        role: 'Pastor Responsável',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&fit=crop&q=80',
      }
    ],
    cellGroups: [
      {
        id: '1',
        name: 'Oração e Intercessão',
        neighborhood: 'Templo',
        day: 'Terça-feira',
        hour: '20:30',
        leader: 'Coordenação',
        phone: '(11) 99999-9999',
      },
      {
        id: '2',
        name: 'Encontro de Mulheres',
        neighborhood: 'Templo',
        day: 'Quarta-feira',
        hour: '15:00',
        leader: 'Coordenação de Mulheres',
        phone: '(11) 99999-9999',
      },
      {
        id: '3',
        name: 'Café e Debate Teológico',
        neighborhood: 'Templo',
        day: 'Quinta-feira',
        hour: '20:30',
        leader: 'Coordenação',
        phone: '(11) 99999-9999',
      },
      {
        id: '4',
        name: 'Celebração para Família',
        neighborhood: 'Templo',
        day: 'Domingo',
        hour: '10:30',
        leader: 'Pastor Responsável',
        phone: '(11) 99999-9999',
      }
    ]
  },
  lagoinha: {
    id: 'lagoinha',
    domain: 'santuario-lagoinha.vercel.app',
    name: 'Lagoinha',
    campusName: 'Alphaville',
    logoUrl: '/images/lagoinha/logo.png',
    bgUrl: 'https://static.wixstatic.com/media/d7e284_e0cb83d5c8204ecb96855d028995d338~mv2.jpeg/v1/fill/w_1600,h_1000,al_c/d7e284_e0cb83d5c8204ecb96855d028995d338~mv2.jpeg',
    primaryColor: '#d4af37',
    primaryColorHover: '#b8942a',
    accentColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.25)',
    badgeBgColor: '#d4af37',
    badgeTextColor: '#0a0a0a',
    badgeLabel: 'Lagoinha Alphaville',
    accentSplashColor: '#d4af37',
    slides: [
      {
        bgUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&fit=crop&q=80',
        verse: 'Grandes coisas fez o Senhor por nós, por isso estamos alegres.',
        verseRef: 'Salmos 126:3'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?w=1600&fit=crop&q=80',
        verse: 'Entrem por suas portas com ações de graças, e em seus átrios, com louvor.',
        verseRef: 'Salmos 100:4'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&fit=crop&q=80',
        verse: 'Tudo o que tem fôlego louve ao Senhor. Aleluia!',
        verseRef: 'Salmos 150:6'
      }
    ],
    type: 'church',
    termPastor: 'Pastor',
    termPastors: 'Pastores',
    termPastoral: 'Atendimento Pastoral',
    termCult: 'Culto',
    termCults: 'Cultos de Celebração',
    termDonation: 'Dízimo ou Oferta',
    termDonations: 'Dízimos e Ofertas',
    termConnect: 'GC (Grupo de Crescimento)',
    termConnects: 'Grupos de Crescimento',
    termMember: 'Novo Membro',
    location: 'Avenida Tamboré, 74 – Alphaville Industrial, Barueri - SP',
    wifi: 'Lagoinha_Alphaville',
    pixKey: 'pix@lagoinhaalphaville.com.br',
    pastors: [
      {
        id: '1',
        name: 'Pr. André Valadão',
        role: 'Pastor Sênior Global',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80',
      },
      {
        id: '2',
        name: 'Pr. Lucinho Barreto',
        role: 'Líder do Be One Youth',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80',
      },
      {
        id: '3',
        name: 'Pr. Marcos & Pra. Carla',
        role: 'Pastores Responsáveis Locais',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?w=400&fit=crop&q=80',
      }
    ],
    cellGroups: [
      {
        id: '1',
        name: 'GC Lagoinha Araguaia',
        neighborhood: 'Alphaville',
        day: 'Quinta-feira',
        hour: '20:00',
        leader: 'Danilo & Carol',
        phone: '(11) 99887-7665',
      },
      {
        id: '2',
        name: 'GC Be One Jovens',
        neighborhood: 'Tamboré',
        day: 'Sábado',
        hour: '17:30',
        leader: 'Lucas Lima',
        phone: '(11) 98765-1234',
      },
      {
        id: '3',
        name: 'GC Casais & Famílias',
        neighborhood: 'Barueri',
        day: 'Terça-feira',
        hour: '19:30',
        leader: 'Marcelo & Fabiana',
        phone: '(11) 97654-3210',
      }
    ]
  },
  universal: {
    id: 'universal',
    domain: 'santuario-universal.vercel.app',
    name: 'Universal',
    campusName: 'Templo de Salomão',
    logoUrl: '/images/universal/logo.png',
    bgUrl: '/images/universal/bg.jpg',
    primaryColor: '#102a43',
    primaryColorHover: '#0b1d33',
    accentColor: '#cf2e2e',
    glowColor: 'rgba(207, 46, 46, 0.25)',
    badgeBgColor: '#cf2e2e',
    badgeTextColor: '#ffffff',
    badgeLabel: 'Universal - Templo de Salomão',
    accentSplashColor: '#cf2e2e',
    slides: [
      {
        bgUrl: '/images/universal/img_1.jpg',
        verse: 'O Temor do Senhor envolve, sobretudo, a fé que agrada a Deus...',
        verseRef: 'Bispo Macedo'
      },
      {
        bgUrl: '/images/universal/img_2.jpg',
        verse: 'SEJA FEITA A MINHA VONTADE',
        verseRef: 'Bispo Renato Cardoso'
      },
      {
        bgUrl: '/images/universal/img_3.jpg',
        verse: 'Remissão de pecados',
        verseRef: 'Ester Bezerra'
      }
    ],
    type: 'church',
    termPastor: 'Pastor',
    termPastors: 'Bispos e Pastores',
    termPastoral: 'Atendimento Espiritual',
    termCult: 'Reunião',
    termCults: 'Reuniões de Fé',
    termDonation: 'Dízimo ou Voto',
    termDonations: 'Dízimos e Votos',
    termConnect: 'Grupo',
    termConnects: 'Grupos de Ação',
    termMember: 'Cadastro de Membro',
    location: 'Av. Celso Garcia, 605 - Brás, São Paulo - SP',
    wifi: 'Universal_Free',
    pixKey: 'pix@universal.org.br',
    pastors: [
      {
        id: '1',
        name: 'Bispo Edir Macedo',
        role: 'Líder e Fundador',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80',
      },
      {
        id: '2',
        name: 'Bispo Renato Cardoso',
        role: 'Pastor Responsável Nacional',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop&q=80',
      },
      {
        id: '3',
        name: 'Pastor Jean Carlos',
        role: 'Atendimento do Altar',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&fit=crop&q=80',
      }
    ],
    cellGroups: [
      {
        id: '1',
        name: 'Grupo FJU (Força Jovem)',
        neighborhood: 'Lobby Principal',
        day: 'Todos os dias',
        hour: 'Atendimento contínuo',
        leader: 'Pr. FJU São Paulo',
        phone: '(11) 99111-2222',
      },
      {
        id: '2',
        name: 'Grupo Caleb (Melhor Idade)',
        neighborhood: 'Auditório Lateral',
        day: 'Quarta e Domingo',
        hour: 'Horário dos Cultos',
        leader: 'Coodenação Caleb',
        phone: '(11) 99222-3333',
      },
      {
        id: '3',
        name: 'Grupo EVG (Evangelização)',
        neighborhood: 'Área Externa',
        day: 'Sábado',
        hour: '14:00',
        leader: 'Líder EVG Brás',
        phone: '(11) 99333-4444',
      }
    ]
  },
  beityaacov: {
    id: 'beityaacov',
    domain: 'santuario-beityaacov.vercel.app',
    name: 'Beit Yaacov',
    campusName: 'Congregação',
    logoUrl: '/images/beityaacov/logo.png',
    bgUrl: 'https://www.morasha.com.br/wp-content/uploads/2023/06/beityaacov.jpg',
    primaryColor: '#0d47a1',
    primaryColorHover: '#0a3580',
    accentColor: '#ffb300',
    glowColor: 'rgba(255, 179, 0, 0.25)',
    badgeBgColor: '#ffb300',
    badgeTextColor: '#0a0a0a',
    badgeLabel: 'Sinagoga Beit Yaacov',
    accentSplashColor: '#ffb300',
    slides: [
      {
        bgUrl: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=1600&fit=crop&q=80',
        verse: 'Ouve, Israel, o Senhor nosso Deus é o único Senhor.',
        verseRef: 'Deuteronômio 6:4'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1616499849206-8fb531779d7d?w=1600&fit=crop&q=80',
        verse: 'Como são belas as tuas tendas, ó Jacó, as tuas habitações, ó Israel!',
        verseRef: 'Números 24:5'
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=1600&fit=crop&q=80',
        verse: 'A Torá que Moisés nos ordenou é a herança da congregação de Jacó.',
        verseRef: 'Deuteronômio 33:4'
      }
    ],
    type: 'synagogue',
    termPastor: 'Rabino',
    termPastors: 'Rabinos',
    termPastoral: 'Atendimento do Rabinato',
    termCult: 'Cabalar / Shabat',
    termCults: 'Serviços do Shabat',
    termDonation: 'Tsedaká (Doação)',
    termDonations: 'Tsedaká (Doações)',
    termConnect: 'Shiur (Estudo)',
    termConnects: 'Estudos e Classes',
    termMember: 'Registro de Membro',
    location: 'Rua Dr. Veiga Filho, 547 – Higienópolis, São Paulo - SP',
    wifi: 'BeitYaacov_Guest',
    pixKey: 'tsedaka@beityaacov.org.br',
    pastors: [
      {
        id: '1',
        name: 'Rabino Avraham Cohen',
        role: 'Rabino Sênior',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&fit=crop&q=80',
      },
      {
        id: '2',
        name: 'Rabino Y. David Weitman',
        role: 'Orientação Espiritual',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80',
      },
      {
        id: '3',
        name: 'Rabino Efraim Laniado',
        role: 'Estudos da Torá e Halachá',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&fit=crop&q=80',
      }
    ],
    cellGroups: [
      {
        id: '1',
        name: 'Shiur Torá Semanal',
        neighborhood: 'Biblioteca Beit Yaacov',
        day: 'Terça-feira',
        hour: '19:30',
        leader: 'Rabino Efraim',
        phone: '(11) 99777-6655',
      },
      {
        id: '2',
        name: 'Cabalá e Meditação',
        neighborhood: 'Auditório Anexo',
        day: 'Segunda-feira',
        hour: '20:00',
        leader: 'Rabino Y. David',
        phone: '(11) 98888-7766',
      },
      {
        id: '3',
        name: 'Classe de Jovens Sinagoga',
        neighborhood: 'Sala de Juventude',
        day: 'Quinta-feira',
        hour: '19:30',
        leader: 'Coordenação Beit Yaacov',
        phone: '(11) 97777-5544',
      }
    ]
  },
  ibmalphaville: {
    id: 'ibmalphaville',
    domain: 'santuario-ibm.vercel.app',
    name: 'IBM Alphaville',
    campusName: 'Sede Tamboré',
    logoUrl: '/images/ibm/logo.png',
    bgUrl: 'https://static.wixstatic.com/media/25a297_cdd52ddb9e2c4f8d975daee634ddf4e7~mv2.jpg/v1/fill/w_1600,h_1000,al_c/25a297_cdd52ddb9e2c4f8d975daee634ddf4e7~mv2.jpg',
    primaryColor: '#ea492e',
    primaryColorHover: '#c43c24',
    accentColor: '#ea492e',
    glowColor: 'rgba(234, 73, 46, 0.25)',
    badgeBgColor: '#ea492e',
    badgeTextColor: '#ffffff',
    badgeLabel: 'IBM Alphaville',
    accentSplashColor: '#ea492e',
    slides: [
      {
        bgUrl: '/images/ibm/img_1.jpg',
        verse: 'Porque dele, e por ele, e para ele são todas as coisas; glória, pois, a ele.',
        verseRef: 'Romanos 11:36'
      },
      {
        bgUrl: '/images/ibm/img_2.jpg',
        verse: 'Louvai ao SENHOR, porque ele é bom, porque a sua benignidade dura para sempre.',
        verseRef: 'Salmos 136:1'
      },
      {
        bgUrl: '/images/ibm/img_3.jpg',
        verse: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.',
        verseRef: 'Provérbios 3:5'
      }
    ],
    type: 'church',
    termPastor: 'Pastor',
    termPastors: 'Pastores',
    termPastoral: 'Atendimento Pastoral',
    termCult: 'Celebração',
    termCults: 'Celebrações de Domingo',
    termDonation: 'Dízimo ou Oferta',
    termDonations: 'Dízimos e Ofertas',
    termConnect: 'Grupo de Relacionamento',
    termConnects: 'Grupos de Relacionamento',
    termMember: 'Novo por Aqui',
    location: 'Av. Tamboré, 1603 – Tamboré, Barueri - SP',
    wifi: 'IBM_Alphaville',
    pixKey: '07.838.266/0001-57',
    pastors: [
      {
        id: '1',
        name: 'Pr. Sidney Costa',
        role: 'Pastor Sênior',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80',
      },
      {
        id: '2',
        name: 'Pr. Hugo Ksenhuk',
        role: 'Pastor de Comunicação e Ensino',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80',
      },
      {
        id: '3',
        name: 'Pr. Fabiano Bispo',
        role: 'Cuidado Pastoral e Integração',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&q=80',
      },
      {
        id: '4',
        name: 'Pr. Reinaldo Rodrigues',
        role: 'Família e Casais',
        available: true,
        photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&fit=crop&q=80',
      }
    ],
    cellGroups: [
      {
        id: '1',
        name: 'GR Tamboré - Jovens',
        neighborhood: 'Tamboré',
        day: 'Terça-feira',
        hour: '20:00',
        leader: 'André & Amanda',
        phone: '(11) 99988-1122',
      },
      {
        id: '2',
        name: 'GR Alphaville 1 - Casais',
        neighborhood: 'Alphaville',
        day: 'Quarta-feira',
        hour: '20:00',
        leader: 'Thiago & Gabi',
        phone: '(11) 99988-3344',
      },
      {
        id: '3',
        name: 'GR Centro Barueri - Misto',
        neighborhood: 'Centro Barueri',
        day: 'Quinta-feira',
        hour: '19:30',
        leader: 'Renato & Paula',
        phone: '(11) 99988-5566',
      },
      {
        id: '4',
        name: 'GR Aldeia da Serra - Famílias',
        neighborhood: 'Aldeia da Serra',
        day: 'Sábado',
        hour: '18:00',
        leader: 'Felipe & Carol',
        phone: '(11) 99988-7788',
      }
    ],
    // Fotos institucionais reais/curadas especificamente para a IBM Alphaville
    // (ver relatório da melhoria visual) — outras igrejas continuam com o
    // MODULE_BG genérico padrão em DashboardView.tsx, inalterado.
    moduleBackgrounds: {
      newMember: '/images/ibm/dashboard/novo-membro.jpg',
      donations: '/images/ibm/dashboard/generosidade.jpg',
      ministries: '/images/ibm/dashboard/participar.jpg',
      checkin: '/images/ibm/dashboard/celebracao.jpg',
      myCell: '/images/ibm/dashboard/grupos.jpg',
      prayer: '/images/ibm/dashboard/oracao.jpg',
    },
    appLinks: {
      ios: 'https://apps.apple.com/us/app/id1467026014',
      android: 'https://play.google.com/store/apps/details?id=br.com.inchurch.ibmemorialalphaville',
    },
  }
};

// Marcas embutidas no bundle (seed/fallback) — usadas para paint instantâneo
// antes da configuração real chegar do Supabase, e como base para qualquer
// campo que uma igreja ainda não tenha personalizado.
export function getStoredBrands(): Record<string, BrandConfig> {
  return JSON.parse(JSON.stringify(brands));
}

// Fonte de verdade real: tabela `brand_configs` (church-scoped por RLS —
// master vê todas as linhas, church_admin só a própria). Cada linha guarda o
// BrandConfig COMPLETO daquela igreja (não um diff); `applyBrandConfigRows`
// aplica isso sobre o seed hardcoded, que sobra só pra igrejas ainda sem
// nenhuma customização salva.
export async function fetchBrandConfigRows(): Promise<Record<string, Partial<BrandConfig>>> {
  const { data, error } = await supabase.from('brand_configs').select('id, config');
  if (error || !data) {
    console.error('Failed to fetch brand_configs:', error?.message);
    return {};
  }
  const rows: Record<string, Partial<BrandConfig>> = {};
  for (const row of data as { id: string; config: Partial<BrandConfig> | null }[]) {
    rows[row.id] = row.config || {};
  }
  return rows;
}

export function applyBrandConfigRows(
  base: Record<string, BrandConfig>,
  rows: Record<string, Partial<BrandConfig>>
): Record<string, BrandConfig> {
  const merged: Record<string, BrandConfig> = JSON.parse(JSON.stringify(base));
  for (const [id, override] of Object.entries(rows)) {
    merged[id] = merged[id]
      ? { ...merged[id], ...override, id: merged[id].id, domain: merged[id].domain }
      : ({ id, ...override } as BrandConfig);
  }
  return merged;
}

// Busca só a igreja pedida — usada pelo totem público (leitura anônima,
// permitida pela policy `anon_select_brand_configs`), que não precisa da
// lista inteira de igrejas.
export async function fetchBrandConfigOverride(churchId: string): Promise<Partial<BrandConfig> | null> {
  const { data, error } = await supabase
    .from('brand_configs')
    .select('config')
    .eq('id', churchId)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch brand_configs for', churchId, error.message);
    return null;
  }
  return (data?.config as Partial<BrandConfig>) || null;
}

export async function saveBrandConfig(churchId: string, config: BrandConfig): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('brand_configs')
    .upsert({ id: churchId, config, updated_at: new Date().toISOString() });
  return { error: error?.message || null };
}

export async function deleteBrandConfig(churchId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('brand_configs').delete().eq('id', churchId);
  return { error: error?.message || null };
}

// Domínio do hub central (link único que lista todas as igrejas/marcas) +
// domínios próprios da Central de cada organização (mesmo app, mesmo login
// via CentralAdminGate — o que muda é qual conta loga e o que o RBAC libera
// pra ela). Adicionar uma organização nova é só um alias de domínio + uma
// linha aqui, sem duplicar app/projeto/banco.
export const CENTRAL_HOSTS = [
  'igreja-a-santuario-digital.vercel.app',
  'central-ibmalphaville.vercel.app',
];

export function isCentralHost(): boolean {
  if (typeof window === 'undefined') return false;
  return CENTRAL_HOSTS.includes(window.location.hostname.toLowerCase());
}

function getBrandIdFromHostname(): string | null {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();
  const match = Object.values(brands).find((b) => b.domain?.toLowerCase() === hostname);
  return match ? match.id : null;
}

export function getCurrentBrand(): BrandConfig {
  if (typeof window === 'undefined') {
    return brands.atitude;
  }

  const dynamicBrands = getStoredBrands();
  const params = new URLSearchParams(window.location.search);
  const explicitClient = params.get('client');

  let client: string;
  if (explicitClient) {
    // ?client= sempre tem prioridade (usado no hub central e em testes/preview)
    client = explicitClient.toLowerCase().trim();
  } else {
    // Sem query param: o domínio dedicado da igreja decide a marca
    client = getBrandIdFromHostname() || 'atitude';
  }

  if (client === 'ibm' || client === 'ibm-alphaville' || client === 'ibmalphaville') {
    client = 'ibmalphaville';
  } else if (client === 'lagoinha' || client === 'lagoinhaalphaville' || client === 'lagoinha-alphaville') {
    client = 'lagoinha';
  } else if (client === 'universal' || client === 'iurd') {
    client = 'universal';
  } else if (client === 'beityaacov' || client === 'beit-yaacov' || client === 'morasha') {
    client = 'beityaacov';
  } else if (client === 'icc' || client === 'icconselheira') {
    client = 'icconselheira';
  }

  return dynamicBrands[client] || dynamicBrands.atitude || brands.atitude;
}

export function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '227, 6, 19';
}
