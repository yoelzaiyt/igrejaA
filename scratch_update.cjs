const fs = require('fs');

const path = require('path');
const brandFilePath = path.join(__dirname, 'src', 'utils', 'brand.ts');
let content = fs.readFileSync(brandFilePath, 'utf8');

const institutionalSlides = {
    atitude: [
      {
        bgUrl: 'https://igrejaatitude.com.br/wp-content/uploads/2025/03/hall-iba.png',
        verse: 'Mas o fruto do Espírito é amor, alegria, paz, paciência, amabilidade, bondade, fidelidade.',
        verseRef: 'Gálatas 5:22',
      },
      {
        bgUrl: 'https://igrejaatitude.com.br/wp-content/themes/ibatitude/images/welcome_image.png',
        verse: 'O Senhor é o meu pastor; de nada terei falta.',
        verseRef: 'Salmos 23:1',
      },
      {
        bgUrl: 'https://igrejaatitude.com.br/wp-content/uploads/2026/05/SITE_MARGEM_DE_SEGURANCA-v2.png',
        verse: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.',
        verseRef: 'Salmos 37:5',
      },
    ],
    ibmalphaville: [
      {
        bgUrl: 'https://static.wixstatic.com/media/25a297_cdd52ddb9e2c4f8d975daee634ddf4e7~mv2.jpg/v1/fill/w_1600,h_1000,al_c/25a297_cdd52ddb9e2c4f8d975daee634ddf4e7~mv2.jpg',
        verse: 'E conhecereis a verdade, e a verdade vos libertará.',
        verseRef: 'João 8:32',
      },
      {
        bgUrl: 'https://static.wixstatic.com/media/25a297_23c72b225cde4d3cbdf6d25bf78440cc~mv2.jpg/v1/fill/w_1600,h_1000,al_c/25a297_23c72b225cde4d3cbdf6d25bf78440cc~mv2.jpg',
        verse: 'Buscai primeiro o reino de Deus e a sua justiça.',
        verseRef: 'Mateus 6:33',
      },
      {
        bgUrl: 'https://static.wixstatic.com/media/25a297_ff16b9b398df49cf9d84dd61e389cb43~mv2.png/v1/fill/w_1600,h_1000,al_c/25a297_ff16b9b398df49cf9d84dd61e389cb43~mv2.png',
        verse: 'Eu vim para que tenham vida, e a tenham em abundância.',
        verseRef: 'João 10:10',
      },
    ],
    lagoinha: [
      {
        bgUrl: 'https://static.wixstatic.com/media/nsplsh_684f463162576f65745f51~mv2_d_9000_6000_s_4_2.jpg/v1/fill/w_1600,h_1000,al_c/nsplsh_684f463162576f65745f51~mv2_d_9000_6000_s_4_2.jpg',
        verse: 'Louvai ao Senhor porque ele é bom; o seu amor é eterno.',
        verseRef: 'Salmos 107:1',
      },
      {
        bgUrl: 'https://static.wixstatic.com/media/d7e284_9980a324f46540919ac27aa5fd0dd79d~mv2.jpg/v1/fill/w_1600,h_1000,al_c/d7e284_9980a324f46540919ac27aa5fd0dd79d~mv2.jpg',
        verse: 'O Senhor é a minha força e o meu escudo.',
        verseRef: 'Salmos 28:7',
      },
      {
        bgUrl: 'https://static.wixstatic.com/media/d7e284_4ad952e22e284bf6b8724ea5a70c1b16~mv2.jpg/v1/fill/w_1600,h_1000,al_c/d7e284_4ad952e22e284bf6b8724ea5a70c1b16~mv2.jpg',
        verse: 'Alegrai-vos sempre no Senhor.',
        verseRef: 'Filipenses 4:4',
      },
    ],
    universal: [
      {
        bgUrl: 'https://portalwp.s3.amazonaws.com/wp-content/uploads/2026/05/27164318/Templo-de-Salomao-disponibiliza-atendimento-espiritual-diario-ao-publico-2.jpg',
        verse: 'Pedi e dar-se-vos-á; buscai e encontrareis.',
        verseRef: 'Mateus 7:7',
      },
      {
        bgUrl: 'https://portalwp.s3.amazonaws.com/wp-content/uploads/2026/05/29125252/Amadora-STOP-POBREZA-2.jpg',
        verse: 'Tudo posso naquele que me fortalece.',
        verseRef: 'Filipenses 4:13',
      },
      {
        bgUrl: 'https://portalwp.s3.amazonaws.com/wp-content/uploads/2026/05/19112324/Formatura-UNP-do-ABC_Maua3.jpg',
        verse: 'Se Deus é por nós, quem será contra nós?',
        verseRef: 'Romanos 8:31',
      },
    ],
    beityaacov: [
      {
        bgUrl: 'https://www.morasha.com.br/wp-content/uploads/2023/06/beityaacov.jpg',
        verse: 'Ouve, Israel, o Senhor nosso Deus é o único Senhor.',
        verseRef: 'Deuteronômio 6:4',
      },
      {
        bgUrl: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&auto=format&fit=crop&q=85',
        verse: 'A Torá é uma árvore de vida para quem a abraça.',
        verseRef: 'Provérbios 3:18',
      },
      {
        bgUrl: 'https://www.morasha.com.br/wp-content/uploads/2023/06/120_ed87.jpg',
        verse: 'Quão boas são as tuas tendas, ó Jacó, as tuas moradas, ó Israel.',
        verseRef: 'Números 24:5',
      },
    ],
    icconselheira: [
      {
        bgUrl: 'https://static.wixstatic.com/media/6ffcad_074e01478e384e37a4e59dd024c7c5ca~mv2.png/v1/crop/x_0,y_129,w_2048,h_894/fill/w_1966,h_858,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMAGEM%20DE%20ABERTURA%20PARA%20SITE.png',
        verse: 'E conhecereis a verdade, e a verdade vos libertará.',
        verseRef: 'João 8:32',
      },
      {
        bgUrl: 'https://static.wixstatic.com/media/6ffcad_3f8d653f42e04ddf9ec57a6f5d3e188c~mv2.jpg/v1/fill/w_2500,h_1250,al_c/6ffcad_3f8d653f42e04ddf9ec57a6f5d3e188c~mv2.jpg',
        verse: 'Porque nele vivemos, e nos movemos, e existimos.',
        verseRef: 'Atos 17:28',
      },
      {
        bgUrl: 'https://static.wixstatic.com/media/6ffcad_19cb063f32a9490695f16c15daff22caf000.jpg/v1/fill/w_1280,h_720,al_c,q_85,enc_avif,quality_auto/6ffcad_19cb063f32a9490695f16c15daff22caf000.jpg',
        verse: 'O Senhor é o meu pastor, nada me faltará.',
        verseRef: 'Salmos 23:1',
      },
    ]
};

// Replace imports
content = content.replace(
  "import { CellGroup, Pastor } from '../types';",
  "import { CellGroup, Pastor, Slide } from '../types';"
);

// Add slides to BrandConfig interface
if (!content.includes('slides: Slide[];')) {
  content = content.replace(
    "cellGroups: CellGroup[];\n  glowColor: string;",
    "cellGroups: CellGroup[];\n  slides: Slide[];\n  glowColor: string;"
  );
}

// For each brand, inject slides before cellGroups
for (const brandId of Object.keys(institutionalSlides)) {
  const slideJson = JSON.stringify(institutionalSlides[brandId], null, 6).replace(/\}$/gm, '    }');
  // match `    pastors: [`
  const regex = new RegExp(`(    id: '${brandId}',[\\s\\S]*?)(    pastors: \\[\n)`);
  content = content.replace(regex, `$1    slides: ${slideJson},\n$2`);
}

fs.writeFileSync(brandFilePath, content);
console.log("Updated brand.ts");
