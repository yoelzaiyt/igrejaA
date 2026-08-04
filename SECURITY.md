# Segurança do Projeto - Santuário Digital (Kiosk/Totem Security Model)

Este documento descreve as diretrizes de segurança, blindagens e proteções contra vulnerabilidades implementadas no totem público do **Santuário Digital**.

## 1. Modelo de Segurança do Totem (Kiosk Mode Security)
Para totens públicos, o objetivo principal é garantir que os usuários finais tenham acesso apenas ao fluxo de autoatendimento e não consigam escapar do navegador ou alterar configurações críticas do sistema.

### Proteções de Escapes Físicos e Teclados (Bloqueios)
*   **Desativação do Menu de Contexto (Botão Direito)**: Bloqueia totalmente o clique com o botão direito do mouse para evitar que usuários abram o menu de inspeção do navegador (`contextmenu`).
*   **Bloqueio de Teclas de Atalho de Desenvolvimento**: Eventos de teclado escutam e previnem atalhos que acionam ferramentas do desenvolvedor ou manipulação de página, incluindo:
    *   `F12` (Developer Tools)
    *   `Ctrl+Shift+I` e `Ctrl+Shift+J` (Console / Inspetor)
    *   `Ctrl+U` (Exibir Código Fonte)
    *   `Ctrl+S` (Salvar Página)
*   **Desativação de Seleção de Texto (`select-none`)**: Impede que os usuários arrastem e selecionem textos, evitando cópias acidentais ou acessos indesejados à área de transferência do sistema operacional.

---

## 2. Proteção de Acesso Administrativo (Passcode Lock)
O acesso ao Painel Administrativo (`AdminView`) agora possui uma camada obrigatória de autenticação física local (Keypad Lock) projetada para telas de toque:

*   **Senha de Acesso Padrão**: `1903`
*   **Fluxo de Autenticação**:
    1.  Ao clicar no botão de engrenagem/ferramentas administratistas nas telas principal (`HomeView`) e interna (`DashboardView`), um modal de segurança com teclado numérico é apresentado.
    2.  O usuário deve digitar o PIN de 4 dígitos.
    3.  A cada tentativa incorreta, o contador de tentativas restantes decrementa.
    4.  **Bloqueio de Brute Force**: Após 5 tentativas incorretas consecutivas, o acesso ao teclado é bloqueado temporariamente por **30 segundos** para evitar adivinhação automatizada.

---

## 3. Blindagem de Código-Fonte (Single Source of Truth)
Para evitar que alterações feitas no navegador via `localStorage` ou manipulações externas corrompam o layout, logos e configurações visuais das marcas, implementou-se a **Blindagem de Atributos Críticos** em `src/utils/brand.ts`:

*   **Comportamento**: Para todas as marcas padrão integradas no código (`atitude`, `lagoinha`, `universal`, `beityaacov`, `ibmalphaville`, `icconselheira`, `ymcactx`), qualquer tentativa de substituir atributos de estilização como `logoUrl`, `bgUrl`, `primaryColor` ou `slides` a partir de caches locais do navegador é sumariamente ignorada.
*   **Campos Editáveis Dinamicamente**: Apenas dados informativos editáveis de funcionamento local (como `campusName`, `location`, `wifi`, `pixKey`, `pastors` e `cellGroups`) são lidos e mesclados do `localStorage`, garantindo total resiliência do design e branding.

---

## 4. Prevenção de Vulnerabilidades Comuns (OWASP Key Mitigations)

### Cross-Site Scripting (XSS)
*   **Remoção de Renderizações Inseguras**: O projeto não utiliza a diretiva `dangerouslySetInnerHTML` com entradas dinâmicas inseridas por usuários nos formulários (Ficha do Atleta e Fale Conosco).
*   **Escapamento de Strings Nativas**: O React realiza automaticamente o escape de todas as variáveis renderizadas em chaves `{ }`, renderizando-as como texto puro e neutralizando qualquer tentativa de injeção de scripts (`<script>`, `onload`, `javascript:`).

### Injeção de Parâmetros e Sanitização
*   O carregamento dinâmico de clientes através do parâmetro `?client=` na URL passa por uma validação estrita (com limpeza de espaços e conversão para caixa baixa). Se um cliente desconhecido ou malformado for passado, o sistema automaticamente aplica o cliente padrão (`atitude`) como fallback seguro.

### Armazenamento Local Seguro (LocalStorage)
*   As informações salvas no navegador (`totem_lang` e `santuario_brands`) não contêm nenhuma informação sensível de usuários ou credenciais confidenciais, limitando-se apenas a preferências de navegação pública e dados informativos básicos.
