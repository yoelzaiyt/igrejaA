import { BrandConfig } from './brand';

export type Lang = 'pt' | 'en' | 'es' | 'de';

const dictionary: Record<string, Record<Lang, string>> = {
  // Common buttons
  back: { pt: 'Voltar', en: 'Back', es: 'Volver', de: 'Zurück' },
  home: { pt: 'Início', en: 'Home', es: 'Inicio', de: 'Startseite' },
  accessibility: { pt: 'Acessibilidade', en: 'Accessibility', es: 'Accesibilidad', de: 'Barrierefreiheit' },
  language: { pt: 'Idioma', en: 'Language', es: 'Idioma', de: 'Sprache' },
  admin: { pt: 'Administrador', en: 'Admin', es: 'Admin', de: 'Admin' },
  confirm: { pt: 'Confirmar', en: 'Confirm', es: 'Confirmar', de: 'Bestätigen' },
  tapToStart: { pt: 'Toque para iniciar', en: 'Tap to start', es: 'Toque para iniciar', de: 'Tippen zum Starten' },
  tapToType: { pt: 'Toque para digitar', en: 'Tap to type', es: 'Toque para escrever', de: 'Tippen zum Schreiben' },
  cancel: { pt: 'Cancelar', en: 'Cancel', es: 'Cancelar', de: 'Abbrechen' },
  save: { pt: 'Salvar', en: 'Save', es: 'Guardar', de: 'Speichern' },
  loading: { pt: 'Carregando...', en: 'Loading...', es: 'Cargando...', de: 'Laden...' },
  anonymous: { pt: 'Anônimo', en: 'Anonymous', es: 'Anónimo', de: 'Anonym' },
  withName: { pt: 'Com Nome', en: 'With Name', es: 'Con Nombre', de: 'Mit Namen' },
  fullName: { pt: 'Nome Completo', en: 'Full Name', es: 'Nombre Completo', de: 'Vollständiger Name' },
  cellPhone: { pt: 'Celular / WhatsApp', en: 'Cell / WhatsApp', es: 'Celular / WhatsApp', de: 'Handy / WhatsApp' },
  email: { pt: 'E-mail', en: 'Email', es: 'Correo Electrónico', de: 'E-Mail' },
  city: { pt: 'Cidade / Estado', en: 'City / State', es: 'Ciudad / Estado', de: 'Stadt / Bundesland' },
  next: { pt: 'Avançar', en: 'Next', es: 'Siguiente', de: 'Weiter' },
  finish: { pt: 'Finalizar', en: 'Finish', es: 'Finalizar', de: 'Abschließen' },
  copied: { pt: 'Copiado!', en: 'Copied!', es: '¡Copiado!', de: 'Kopiert!' },
  adminPasscodePrompt: {
    pt: 'Digite a senha de administrador para continuar',
    en: 'Enter the admin passcode to continue',
    es: 'Ingrese la contraseña de administrador para continuar',
    de: 'Geben Sie den Admin-Passcode ein, um fortzufahren'
  },
  adminPasscodeInvalid: {
    pt: 'Senha incorreta!',
    en: 'Incorrect passcode!',
    es: '¡Contraseña incorrecta!',
    de: 'Falscher Passcode!'
  },
  adminPasscodeAttempts: {
    pt: 'Tentativas restantes',
    en: 'Remaining attempts',
    es: 'Intentos restantes',
    de: 'Verbleibende Versuche'
  },
  adminPasscodeBlocked: {
    pt: 'Acesso bloqueado por segurança.',
    en: 'Access blocked for security.',
    es: 'Acceso bloqueado por seguridad.',
    de: 'Zugriff aus Sicherheitsgründen gesperrt.'
  },

  // Home View
  welcome: { pt: 'Bem-vindo', en: 'Welcome', es: 'Bienvenido', de: 'Willkommen' },
  welcomeVoice: {
    pt: 'Bem-vindo. Toque na tela para iniciar o atendimento.',
    en: 'Welcome. Tap the screen to start.',
    es: 'Bienvenido. Toque la pantalla para comenzar.',
    de: 'Willkommen. Tippen Sie auf den Bildschirm, um zu starten.'
  },
  ctaQuestion: {
    pt: 'Como podemos ajudar você?',
    en: 'How can we help you?',
    es: '¿Como podemos ajudarle?',
    de: 'Wie können wir Ihnen heute helfen?'
  },
  locationGym: { pt: 'Ginásio Central', en: 'Central Gym', es: 'Gimnasio Central', de: 'Zentralsporthalle' },
  locationHall: { pt: 'Auditório Principal', en: 'Main Auditorium', es: 'Auditorio Principal', de: 'Hauptsaal' },
  locationSynagogue: { pt: 'Salão de Orações', en: 'Prayer Hall', es: 'Salón de Oraciones', de: 'Gebetsraum' },

  // Dashboard Options (YMCA vs Others)
  newMemberEyebrow: { pt: 'Cadastro', en: 'Registration', es: 'Registro', de: 'Registrierung' },
  newMemberEyebrowSports: { pt: 'Cadastro de Atleta', en: 'Athlete Registration', es: 'Registro de Atleta', de: 'Athleten-Registrierung' },
  newMemberEyebrowCarWash: { pt: 'Ficha de Cliente', en: 'Customer Profile', es: 'Ficha de Cliente', de: 'Kundenkartei' },
  volunteerEyebrow: { pt: 'Voluntariado', en: 'Volunteering', es: 'Voluntariado', de: 'Ehrenamt' },
  volunteerEyebrowSynagogue: { pt: 'Engajamento & Mitzvot', en: 'Engagement & Mitzvot', es: 'Compromiso & Mitzvot', de: 'Mitzwot & Engagement' },
  volunteerEyebrowSports: { pt: 'Participação & Apoio', en: 'Involvement & Help', es: 'Participación & Apoyo', de: 'Mitarbeit & Unterstützung' },
  volunteerEyebrowCarWash: { pt: 'Clube & Fidelidade', en: 'Club & Loyalty', es: 'Club & Fidelidad', de: 'Club & Treue' },
  volunteerTitle: { pt: 'Participar', en: 'Participate', es: 'Participar', de: 'Teilnehmen' },
  volunteerTitleCarWash: { pt: 'Fidelizar / Participar', en: 'Join Club / Loyalty', es: 'Unirse al Club', de: 'Klub beitreten' },
  
  calendarEyebrow: { pt: 'Agenda & Encontros', en: 'Schedule & Gatherings', es: 'Agenda & Encuentros', de: 'Termine & Treffen' },
  calendarEyebrowSynagogue: { pt: 'Shabat & Festividades', en: 'Shabat & Festivities', es: 'Shabat & Festividades', de: 'Schabbat & Feiertage' },
  calendarEyebrowSports: { pt: 'Treinos & Horários', en: 'Practices & Schedules', es: 'Entrenamientos & Horarios', de: 'Training & Termine' },
  calendarEyebrowCarWash: { pt: 'Pistas & Programas', en: 'Lanes & Programs', es: 'Carriles & Programas', de: 'Bahnen & Programme' },

  // YMCA Specific Flow Terms
  ymcaHomeEventsBtn: { pt: 'Eventos dos Clientes', en: 'Client Events', es: 'Eventos de Clientes', de: 'Kunden-Events' },
  ymcaClassesCardTitle: { pt: 'Aulas & Inscrição', en: 'Classes & Registration', es: 'Clases e Inscripción', de: 'Kurse & Anmeldung' },
  ymcaClassesCardEyebrow: { pt: 'Aplicativo e Inscrições', en: 'App & Registrations', es: 'Aplicación e Inscripciones', de: 'App & Anmeldung' },
  ymcaModalTitle: { pt: 'Aulas & Inscrição YMCA', en: 'YMCA Classes & Registration', es: 'Clases e Inscripción YMCA', de: 'YMCA Kurse & Anmeldung' },
  ymcaModalDesc: { pt: 'Escaneie o QR Code abaixo para acessar o aplicativo oficial da YMCA ou para encontrar sua unidade e se inscrever nas aulas.', en: 'Scan the QR Code below to access the official YMCA app or to find your branch and register for classes.', es: 'Escanee el código QR para acceder a la aplicación oficial de la YMCA o encontrar su unidad e inscribirse.', de: 'Scannen Sie den QR-Code, um die YMCA-App aufzurufen ou Ihre Filiale zu finden und sich anzumelden.' },
  ymcaLocatorLabel: { pt: 'Encontrar Unidade (Web)', en: 'Find your Y (Web)', es: 'Encontrar Unidad (Web)', de: 'Filiale finden (Web)' },


  groupsEyebrow: { pt: 'Conexão Grupos', en: 'Group Connection', es: 'Conexión de Grupos', de: 'Gruppen-Verbindung' },
  groupsEyebrowSynagogue: { pt: 'Grupos de Estudo', en: 'Study Groups', es: 'Grupos de Estudio', de: 'Lerngruppen' },
  groupsEyebrowSports: { pt: 'Nossos Times', en: 'Our Teams', es: 'Nuestros Equipos', de: 'Unsere Teams' },
  groupsEyebrowCarWash: { pt: 'Assinaturas & Vantagens', en: 'Subs & Benefits', es: 'Sub & Beneficios', de: 'Abos & Vorteile' },

  prayerEyebrow: { pt: 'Intercessão', en: 'Intercession', es: 'Intercesión', de: 'Fürbitte' },
  prayerEyebrowSports: { pt: 'Feedback & Ouvidoria', en: 'Feedback & Support', es: 'Sugerencias & Suporte', de: 'Feedback & Support' },
  prayerEyebrowCarWash: { pt: 'Suporte ao Cliente', en: 'Customer Support', es: 'Soporte al Cliente', de: 'Kundenservice' },
  prayerTitle: { pt: 'Pedido de Oração', en: 'Prayer Request', es: 'Pedido de Oración', de: 'Gebetsanliegen' },
  prayerTitleSynagogue: { pt: 'Pedido de Rezas', en: 'Prayer Request', es: 'Pedido de Rezos', de: 'Gebetsanliegen' },
  prayerTitleSports: { pt: 'Suporte & Ouvidoria', en: 'Support & Suggestions', es: 'Soporte & Sugerencias', de: 'Support & Vorschläge' },
  prayerTitleCarWash: { pt: 'Fale Conosco', en: 'Contact Us', es: 'Contáctenos', de: 'Kontakt' },

  // New Member View
  regHowToProceed: {
    pt: 'Como você prefere prosseguir?',
    en: 'How do you prefer to proceed?',
    es: '¿Cómo prefiere proceder?',
    de: 'Wie möchten Sie fortfahren?'
  },
  regIntroText: {
    pt: 'Você pode preencher o formulário de cadastro completo ou apenas enviar seu e-mail de contato para ser integrado ao grupo de cadastro.',
    en: 'You can fill out the complete registration form or just submit your email to be added to our follow-up list.',
    es: 'Puede completar el formulario de registro completo o simplemente enviar seu correo para ser agregado a la lista.',
    de: 'Sie können das vollständige Registrierungsformular ausfüllen oder einfach Ihre E-Mail-Adresse eingeben.'
  },
  regIntroTextSports: {
    pt: 'Você pode preencher a ficha de atleta completa ou apenas registrar seu e-mail para que a coordenação esportiva envie os detalhes por e-mail.',
    en: 'You can fill out the full athlete sheet or just register your email so the sports coordination team can send you the details.',
    es: 'Puede completar la ficha de atleta completa o simplemente registrar su correo para que la coordinación deportiva le envíe os detalhes.',
    de: 'Sie können das vollständige Athletenformular ausfüllen oder einfach Ihre E-Mail-Adresse eintragen.'
  },
  regIntroTextCarWash: {
    pt: 'Você pode preencher o formulário de cliente completo ou apenas enviar seu e-mail para receber as promoções.',
    en: 'You can fill out the complete customer profile or just submit your email to receive promotions.',
    es: 'Puede completar el perfil de cliente completo o simplemente enviar su correo para recibir promociones.',
    de: 'Sie können das vollständige Kundenprofil ausfüllen oder einfach Ihre E-Mail-Adresse eintragen.'
  },
  regCardFull: { pt: 'Ficha de Cadastro Completa', en: 'Full Registration Sheet', es: 'Ficha de Registro Completa', de: 'Vollständiges Anmeldeformular' },
  regCardFullSports: { pt: 'Ficha de Atleta Completa', en: 'Full Athlete Sheet', es: 'Ficha de Atleta Completa', de: 'Vollständiges Athletenformular' },
  regCardFullCarWash: { pt: 'Ficha de Cliente Completa', en: 'Full Customer Profile', es: 'Perfil de Cliente Completo', de: 'Vollständiges Kundenprofil' },
  regCardFullDesc: {
    pt: 'Preencha nome, telefone, e-mail e cidade para nossa equipe de novos membros entrar em contato.',
    en: 'Fill in your name, phone, email, and city so our welcome team can contact you.',
    es: 'Complete su nombre, teléfono, correo y ciudad para que nuestro equipo se ponga en contacto.',
    de: 'Geben Sie Name, Telefonnummer, E-Mail und Stadt an, damit unser Team Sie kontaktieren kann.'
  },
  regCardFullDescSports: {
    pt: 'Preencha nome, telefone, e-mail e cidade para nossa coordenação de basquete entrar em contato.',
    en: 'Fill in your name, phone, email, and city so our basketball coordination team can reach out.',
    es: 'Complete su nombre, teléfono, correo y ciudad para que nuestra coordinación de baloncesto se comunique.',
    de: 'Geben Sie Name, Telefonnummer, E-Mail und Stadt an, damit unsere Basketball-Koordination Sie kontaktieren kann.'
  },
  regCardFullDescCarWash: {
    pt: 'Preencha nome, celular, e-mail e cidade para registrar seu perfil no IMO Car Wash.',
    en: 'Fill in your name, mobile, email, and city to register your IMO Car Wash profile.',
    es: 'Complete su nombre, móvil, correo y ciudad para registrar su perfil de IMO Car Wash.',
    de: 'Geben Sie Name, Handynummer, E-Mail-Adresse und Stadt an, um Ihr Kundenprofil zu registrieren.'
  },
  regCardQuick: { pt: 'Quero ser Membro (Rápido)', en: 'Join Us (Quick Email)', es: 'Quiero ser Miembro (Rápido)', de: 'Mitglied werden (Schnelle E-Mail)' },
  regCardQuickSports: { pt: 'Registro Rápido (E-mail)', en: 'Quick Registration (Email)', es: 'Registro Rápido (Correo)', de: 'Schnellregistrierung (E-Mail)' },
  regCardQuickCarWash: { pt: 'Registro Rápido (E-mail)', en: 'Quick Registration (Email)', es: 'Registro Rápido (Correo)', de: 'Schnellregistrierung (E-Mail)' },
  regCardQuickDesc: {
    pt: 'Insira apenas seu e-mail para que nosso grupo de cadastro envie seu convite de participação.',
    en: 'Just enter your email and our integration team will send you an invitation.',
    es: 'Ingrese su correo electrónico y nuestro equipo le enviará una invitación.',
    de: 'Geben Sie nur Ihre E-Mail-Adresse ein, damit wir Ihnen eine Einladung senden können.'
  },
  regCardQuickDescSports: {
    pt: 'Insira seu e-mail para receber a ficha de inscrição digital e calendário de treinos.',
    en: 'Enter your email to receive the digital registration form and practice calendar.',
    es: 'Ingrese su correo para receber la ficha de inscrição digital y el calendario de entrenamientos.',
    de: 'Geben Sie Ihre E-Mail-Adresse ein, um das digitale Anmeldeformular und den Trainingsplan zu erhalten.'
  },
  regCardQuickDescCarWash: {
    pt: 'Insira seu e-mail para receber ofertas, novidades e cupons de lavagem.',
    en: 'Enter your email to receive offers, news, and wash coupons.',
    es: 'Ingrese su correo para recibir ofertas, noticias y cupones de lavado.',
    de: 'Geben Sie Ihre E-Mail-Adresse ein, um Angebote, Neuigkeiten und Waschgutscheine zu erhalten.'
  },
  regSuccessTitle: { pt: 'Cadastro Concluído!', en: 'Registration Completed!', es: '¡Registro Completado!', de: 'Registrierung abgeschlossen!' },
  regSuccessTitleSynagogue: { pt: 'Registro Concluído!', en: 'Registration Completed!', es: '¡Registro Completado!', de: 'Registrierung abgeschlossen!' },
  regSuccessTitleSports: { pt: 'Cadastro de Atleta Concluído!', en: 'Athlete Registration Completed!', es: '¡Registro de Atleta Completado!', de: 'Athleten-Registrierung abgeschlossen!' },
  regSuccessTitleCarWash: { pt: 'Perfil de Cliente Criado!', en: 'Customer Profile Created!', es: '¡Perfil de Cliente Creado!', de: 'Kundenprofil erstellt!' },
  regSuccessDesc: {
    pt: 'Agradecemos o seu interesse! Em breve nossa equipe entrará em contato com você.',
    en: 'Thank you for your interest! Our team will contact you shortly.',
    es: '¡Gracias por su interés! Nuestro equipo se pondrá en contacto con usted en breve.',
    de: 'Vielen Dank für Ihr Interesse! Unser Team wird sich in Kürze mit Ihnen in Verbindung setzen.'
  },

  // Support / Prayer View
  supportHeaderSports: { pt: 'Ouvidoria', en: 'Feedback & Support', es: 'Buzón de Sugerencias', de: 'Feedback & Lob' },
  supportWriteMessageSports: {
    pt: 'Escreva aqui sua mensagem, dúvida ou sugestão',
    en: 'Write your message, question, or suggestion here',
    es: 'Escriba aquí su mensagem, dúvida ou sugestão',
    de: 'Schreiben Sie hier Ihre Nachricht, Frage oder Anregung'
  },
  supportPlaceholderSports: {
    pt: 'Escreva sua mensagem aqui...',
    en: 'Type your message here...',
    es: 'Escriba su mensaje aquí...',
    de: 'Schreiben Sie Ihre Nachricht hier...'
  },
  supportAlertSports: {
    pt: 'Por favor, escreva a sua mensagem ou sugestão.',
    en: 'Please write your message or suggestion.',
    es: 'Por favor, escriba su mensaje o sugerencia.',
    de: 'Bitte schreiben Sie Ihre Nachricht oder Ihren Vorschlag.'
  },
  supportSuccessTitleSports: { pt: 'Mensagem Enviada!', en: 'Message Sent!', es: '¡Mensaje Enviado!', de: 'Nachricht gesendet!' },
  supportSuccessDescSports: {
    pt: 'Sua mensagem foi enviada à nossa coordenação esportiva! Em breve entraremos em contato para responder às suas solicitações.',
    en: 'Your message has been sent to our sports coordination! We will reach out shortly to assist you.',
    es: '¡Su mensaje ha sido enviado a nuestra coordinación deportiva! Nos pondremos en contacto en breve.',
    de: 'Ihre Nachricht wurde an unsere Sportkoordination gesendet! Wir werden uns in Kürze bei Ihnen melden.'
  },
  supportInfoSports: {
    pt: 'Suas dúvidas, sugestões e críticas de melhoria são encaminhadas diretamente à coordenação esportiva da YMCA Central Texas.',
    en: 'Your questions, suggestions, and feedback are forwarded directly to the YMCA Central Texas sports coordination.',
    es: 'Sus dudas, sugerencias y comentarios se envían directamente a la coordinación deportiva de la YMCA Central Texas.',
    de: 'Ihre Fragen, Vorschläge und Ihr Feedback werden direkt an die Sportkoordination der YMCA Central Texas weitergeleitet.'
  },
  supportSuccessDescCarWash: {
    pt: 'Sua mensagem foi enviada ao suporte do IMO Car Wash! Em breve entraremos em contato para responder às suas solicitações.',
    en: 'Your message has been sent to IMO Car Wash support! We will reach out shortly to assist you.',
    es: '¡Su mensagem ha sido enviado al suporte de IMO Car Wash! Nos pondremos en contacto en breve.',
    de: 'Ihre Nachricht wurde an den Support von IMO Car Wash gesendet! Wir werden uns in Kürze bei Ihnen melden.'
  },
  supportInfoCarWash: {
    pt: 'Suas dúvidas, sugestões e críticas de melhoria são encaminhadas diretamente à equipe de atendimento ao cliente do IMO Car Wash.',
    en: 'Your questions, suggestions, and feedback are forwarded directly to the IMO Car Wash customer support team.',
    es: 'Sus dudas, sugerencias y comentarios se envían directamente al equipo de atención al cliente de IMO Car Wash.',
    de: 'Ihre Fragen, Vorschläge und Ihr Feedback werden direkt an das Kundensupport-Team von IMO Car Wash weitergeleitet.'
  },
  supportAlertDefault: {
    pt: 'Por favor, escreva o seu pedido de oração.',
    en: 'Please write your prayer request.',
    es: 'Por favor, escriba su petición de oración.',
    de: 'Bitte schreiben Sie Ihr Gebetsanliegen auf.'
  },
  supportAlertSynagogue: {
    pt: 'Por favor, escreva o seu pedido de reza.',
    en: 'Please write your prayer request.',
    es: 'Por favor, escriba su petición de rezo.',
    de: 'Bitte schreiben Sie Ihr Gebetsanliegen auf.'
  },
  supportSuccessDescDefault: {
    pt: 'Nossa equipe de intercessores estará em oração pelo seu pedido. Tenha certeza de que Deus estende as mãos sobre sua vida!',
    en: 'Our team will be praying for your request. Be assured that God extends His hands over your life!',
    es: 'Nuestro equipo estará orando por su petición. ¡Tenga por seguro que Dios extiende sus manos sobre su vida!',
    de: 'Unser Team wird für Ihr Anliegen beten. Seien Sie versichert, dass Gott Seine Hände über Ihr Leben ausstreckt!'
  },
  supportSuccessDescSynagogue: {
    pt: 'Nossa comunidade e rabinos estarão em oração pelo seu pedido. Tenha fé de que o Criador atende às preces sinceras!',
    en: 'Our community and rabbis will be praying for your request. Have faith that the Creator answers sincere prayers!',
    es: 'Nuestra comunidad y rabinos estarán orando por su petición. ¡Tenga fe en que el Creador responde a las oraciones sinceras!',
    de: 'Unsere Gemeinde und Rabbiner werden für Ihr Anliegen beten. Vertrauen Sie darauf, dass der Schöpfer aufrichtige Gebete erhört!'
  },
  supportInfoDefault: {
    pt: 'Todos os pedidos de oração recebidos em nosso Santuário são mantidos em absoluto sigilo e levados por nossos intercessores nas reuniões de oração diárias.',
    en: 'All prayer requests received in our Sanctuary are kept in absolute confidentiality and carried by our intercessors in daily prayers.',
    es: 'Todas las peticiones de oración recibidas son confidenciales y llevadas por nuestros intercesores en las oraciones diarias.',
    de: 'Alle in unserem Heiligtum eingehenden Gebetsanliegen werden absolut vertraulich behandelt und von unseren Fürbittern in die täglichen Gebete getragen.'
  },
  supportInfoSynagogue: {
    pt: 'Todos os pedidos de rezas recebidos em nossa sinagoga são mantidos em absoluto sigilo e lembrados nas preces diárias por nossos rabinos e comunidade.',
    en: 'All prayer requests received in our synagogue are kept in absolute confidentiality and remembered in daily prayers by our rabbis.',
    es: 'Todas las peticiones de rezo son confidenciales y recordadas en las oraciones diarias por nuestros rabinos.',
    de: 'Alle in unserer Synagoge eingehenden Gebetsanliegen werden absolut vertraulich behandelt und in den täglichen Gebeten von unseren Rabbinern und der Gemeinde bedacht.'
  },
  supportQuoteDefault: {
    pt: '"Clama a mim, e responder-te-ei, e anunciar-te-ei coisas grandes e firmes..." Jeremias 33:3',
    en: '"Call to me and I will answer you and tell you great and unsearchable things..." Jeremiah 33:3',
    es: '"Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas..." Jeremías 33:3',
    de: '"Rufe mich an, so will ich dir antworten und dir große und unfassbare Dinge verkünden..." Jeremia 33:3'
  },
  supportQuoteSynagogue: {
    pt: '"O Eterno está perto de todos os que O invocam, de todos os que O invocam em verdade." Salmos 145:18',
    en: '"The Lord is near to all who call on him, to all who call on him in truth." Psalm 145:18',
    es: '"Cercano está el Eterno a todos los que le invocan, a todos los que le invocan de veras." Salmos 145:18',
    de: '"Der Herr ist nahe allen, die ihn anrufen, allen, die ihn im Ernst anrufen." Psalm 145:18'
  },
  supportQuoteSports: {
    pt: '"O esporte tem o poder de transformar vidas e unir comunidades." — Nelson Mandela',
    en: '"Sport has the power to change the world and unite communities." — Nelson Mandela',
    es: '"El deporte tiene el poder de transformar vidas y unir comunidades." — Nelson Mandela',
    de: '"Sport hat die Kraft, die Welt zu verändern und Gemeinschaften zu vereinen." — Nelson Mandela'
  },
  supportSubmitDefault: { pt: 'Enviar Pedido', en: 'Send Request', es: 'Enviar Petición', de: 'Anfrage senden' },
  supportSubmitSports: { pt: 'Enviar Mensagem', en: 'Send Message', es: 'Enviar Mensaje', de: 'Nachricht senden' },

  // Donation / Monthly Fee View
  selectCategory: {
    pt: 'Selecione uma categoria abaixo para fazer sua contribuição',
    en: 'Select a category below to make your contribution',
    es: 'Seleccione una categoría a continuación para realizar su contribución',
    de: 'Wählen Sie unten eine Kategorie aus, um Ihren Beitrag zu leisten'
  },
  selectCategorySports: {
    pt: 'Selecione uma categoria abaixo para efetuar seu pagamento',
    en: 'Select a category below to make your payment',
    es: 'Seleccione una categoría a continuación para realizar su pago',
    de: 'Wählen Sie unten eine Kategorie aus, um Ihre Zahlung vorzunehmen'
  },
  presetSelectValue: { pt: 'Selecione um Valor', en: 'Select an Amount', es: 'Seleccione un Monto', de: 'Betrag auswählen' },
  customValueLabel: { pt: 'Outro Valor (R$)', en: 'Custom Amount (R$)', es: 'Otro Monto (R$)', de: 'Anderer Betrag (R$)' },
  selectPaymentMethod: { pt: 'Escolha a Forma de Pagamento', en: 'Choose Payment Method', es: 'Elija el Método de Pago', de: 'Zahlungsmethode wählen' },
  pixInstruction: {
    pt: 'Leia o QR Code abaixo com o app do seu banco ou copie a chave PIX.',
    en: 'Scan the QR Code below with your banking app or copy the PIX key.',
    es: 'Escanee el código QR a continuación con su aplicación bancaria o copie la clave PIX.',
    de: 'Scannen Sie den QR-Code unten mit Ihrer Banking-App oder kopieren Sie den PIX-Schlüssel.'
  },
  pixCopyButton: { pt: 'Copiar Código Copie e Cole', en: 'Copy PIX Code', es: 'Copiar Código PIX', de: 'PIX-Code kopieren' },
  cardMethodPix: { pt: 'PIX (Instantâneo)', en: 'PIX (Instant)', es: 'PIX (Instantáneo)', de: 'PIX (Sofort)' },
  cardMethodCredit: { pt: 'Cartão de Crédito', en: 'Credit Card', es: 'Tarjeta de Crédito', de: 'Kreditkarte' },
  cardMethodDebit: { pt: 'Cartão de Débito', en: 'Debit Card', es: 'Tarjeta de Débito', de: 'Debitkarte' },
  dailyGoalProgress: { pt: 'Progresso da Meta', en: 'Goal Progress', es: 'Progreso de la Meta', de: 'Fortschritt des Ziels' },
  dailyGoalToday: { pt: 'Hoje:', en: 'Today:', es: 'Hoy:', de: 'Heute:' },
  dailyGoalTarget: { pt: 'Meta:', en: 'Goal:', es: 'Meta:', de: 'Ziel:' },

  // Checkin View
  checkinHeaderTitle: { pt: 'Check-in do Culto', en: 'Service Check-in', es: 'Check-in de Culto', de: 'Gottesdienst-Anmeldung' },
  checkinHeaderTitleSports: { pt: 'Check-in de Treino', en: 'Practice Check-in', es: 'Check-in de Entrenamiento', de: 'Trainings-Anmeldung' },
  checkinInputLabel: {
    pt: 'Digite seu nome ou celular para confirmar seu acesso',
    en: 'Enter your name or cell number to confirm access',
    es: 'Ingrese su nombre o celular para confirmar su acceso',
    de: 'Geben Sie Ihren Namen oder Ihre Handynummer ein, um den Zugang zu bestätigen'
  },
  checkinInputPlaceholder: {
    pt: 'Buscar por nome ou celular...',
    en: 'Search by name or cell phone...',
    es: 'Buscar por nombre o celular...',
    de: 'Suche nach Name oder Mobiltelefon...'
  },
  checkinSubmit: { pt: 'Confirmar Acesso', en: 'Confirm Access', es: 'Confirmar Acceso', de: 'Zugang bestätigen' },
  checkinSuccessConfirmed: { pt: 'Acesso Confirmado!', en: 'Access Confirmed!', es: '¡Acceso Confirmado!', de: 'Zugang bestätigt!' },
  checkinSuccessBanner: { pt: 'Tenha um excelente culto!', en: 'Have an excellent service!', es: '¡Que tenha un excelente servicio!', de: 'Haben Sie einen gesegneten Gottesdienst!' },
  checkinSuccessBannerSports: { pt: 'Tenha um excelente treino!', en: 'Have a great practice!', es: '¡Que tenha un excelente entrenamiento!', de: 'Hab ein tolles Training!' },

  // Ministries / Activities View
  volunteerHeaderTitle: { pt: 'Serviço Voluntário', en: 'Volunteer Work', es: 'Trabajo Voluntario', de: 'Ehrenamtlicher Dienst' },
  volunteerHeaderTitleSynagogue: { pt: 'Atividades Comunitárias', en: 'Community Activities', es: 'Actividades Comunitarias', de: 'Gemeindeaktivitäten' },
  volunteerHeaderTitleSports: { pt: 'Participação & Ajuda', en: 'Participation & Help', es: 'Participación & Ayuda', de: 'Mitarbeit & Hilfe' },
  volunteerSubtitle: {
    pt: 'Escolha onde você deseja servir',
    en: 'Choose where you want to serve',
    es: 'Elija dónde desea servir',
    de: 'Wählen Sie aus, wo Sie dienen möchten'
  },
  volunteerSubtitleSynagogue: {
    pt: 'Escolha onde você deseja atuar',
    en: 'Choose where you want to participate',
    es: 'Elija dónde desea participar',
    de: 'Wählen Sie aus, wo Sie mitwirken möchten'
  },
  volunteerSubtitleSports: {
    pt: 'Escolha onde você deseja ajudar',
    en: 'Choose where you want to help',
    es: 'Elija dónde desea ayudar',
    de: 'Wählen Sie aus, wo Sie helfen möchten'
  },
  volunteerJoinBtn: { pt: 'Quero Participar', en: 'I Want to Join', es: 'Quero Participar', de: 'Ich möchte mitmachen' },
  volunteerBackBtn: { pt: 'Voltar aos Ministérios', en: 'Back to Ministries', es: 'Volver a Ministerios', de: 'Zurück zu den Diensten' },
  volunteerBackBtnSynagogue: { pt: 'Voltar às Atividades', en: 'Back to Activities', es: 'Volver a Actividades', de: 'Zurück zu den Aktivitäten' },
  volunteerBackBtnSports: { pt: 'Voltar ao Painel', en: 'Back to Options', es: 'Volver a Opciones', de: 'Zurück zur Übersicht' },

  // My Cell / Finder View
  cellHeaderTitle: { pt: 'Encontre seu Grupo', en: 'Find your Group', es: 'Encuentre su Grupo', de: 'Gruppe finden' },
  cellHeaderTitleSports: { pt: 'Encontre seu Time', en: 'Find your Team', es: 'Encuentre su Equipo', de: 'Team finden' },
  cellCardBannerTitle: { pt: 'Vida em Comunidade', en: 'Life in Community', es: 'Vida en Comunidad', de: 'Leben in Gemeinschaft' },
  cellCardBannerTitleSynagogue: { pt: 'Estudos & Mitzvot', en: 'Studies & Mitzvot', es: 'Estudios & Mitzvot', de: 'Studium & Mitzwot' },
  cellCardBannerTitleSports: { pt: 'Esporte & Cooperação', en: 'Sport & Teamwork', es: 'Deporte & Cooperación', de: 'Sport & Kooperation' },
  cellCardBannerDesc: {
    pt: 'Encontre um grupo perto de você e viva uma verdadeira comunhão.',
    en: 'Find a group near you and live in true communion.',
    es: 'Encuentre un grupo cerca de usted y viva en verdadera comunión.',
    de: 'Finden Sie eine Gruppe in Ihrer Nähe und leben Sie in wahrer Gemeinschaft.'
  },
  cellCardBannerDescSports: {
    pt: 'Encontre um time e treinos ideais para sua faixa etária.',
    en: 'Find a team and practice schedule perfect for your age group.',
    es: 'Encuentre un equipo y entrenamientos perfectos para su edad.',
de: 'Finden Sie ein passendes Team und Trainingszeiten für Ihre Altersgruppe.'
  },
  cellJoinVisitBtn: { pt: 'Quero Visitar', en: 'I Want to Visit', es: 'Quiero Visitar', de: 'Ich möchte besuchen' },
  cellJoinVisitBtnSynagogue: { pt: 'Quero Participar', en: 'I Want to Join', es: 'Quero Participar', de: 'Ich möchte teilnehmen' },
  cellJoinVisitBtnSports: { pt: 'Quero Treinar', en: 'I Want to Practice', es: 'Quiero Entrenar', de: 'Ich möchte trainieren' },

  // App Download Block
  downloadTitle: {
    pt: 'Baixe o Aplicativo Oficial da YMCA',
    en: 'Download the Official YMCA App',
    es: 'Descargue la Aplicación Oficial de la YMCA',
    de: 'Laden Sie die offizielle YMCA-App herunter'
  },
  downloadDesc: {
    pt: 'Escaneie o QR Code abaixo com a câmera do seu celular para acompanhar treinos, horários e muito mais!',
    en: 'Scan the QR Code below with your mobile camera to track practices, schedules, and more!',
    es: '¡Escanee el código QR a continuación con la cámara de su celular para seguir entrenamientos, horarios y más!',
    de: 'Scannen Sie den QR-Code unten mit Ihrer Handykamera, um Trainingspläne, Termine und mehr zu sehen!'
  },
  downloadAndroid: { pt: 'Versão Android', en: 'Android Version', es: 'Versión Android', de: 'Android-Version' },
  downloadIos: { pt: 'Versão iOS', en: 'iOS Version', es: 'iOS Version', de: 'iOS-Version' },

  // Checkin Success View
  checkinSuccessTitle: { pt: 'Check-in Realizado!', en: 'Check-in Completed!', es: '¡Check-in Realizado!', de: 'Check-in durchgeführt!' },
  checkinSuccessPresence: { pt: 'Presença Confirmada', en: 'Presence Confirmed', es: 'Presencia Confirmada', de: 'Anwesenheit bestätigt' },
  checkinSuccessDescDefault: {
    pt: 'Seja muito bem-vindo! Seu acesso ao templo principal foi liberado. Desejamos uma experiência transformadora com Deus nesta noite.',
    en: 'Welcome! Your access to the main sanctuary has been checked in. We wish you a transformative experience tonight.',
    es: '¡Bienvenido! Su acceso al templo principal ha sido registrado. Le deseamos una experiencia transformadora esta noche.',
    de: 'Willkommen! Ihr Zugang zum Hauptsaal wurde registriert. Wir wünschen Ihnen heute einen segensreichen Abend.'
  },
  checkinSuccessDescSynagogue: {
    pt: 'Seja muito bem-vindo! Seu acesso à sinagoga foi registrado. Desejamos um Shabat de paz, reflexão e bênçãos em nossa comunidade.',
    en: 'Welcome! Your access to the synagogue has been registered. We wish you a Shabat of peace, reflection, and blessings.',
    es: '¡Bienvenido! Su acesso a la sinagoga ha sido registrado. Le deseamos un Shabat de paz, reflexión y bendiciones.',
    de: 'Willkommen! Ihr Zugang zur Synagoge wurde registriert. Wir wünschen Ihnen einen ruhigen und gesegneten Schabbat.'
  },
  checkinSuccessDescSports: {
    pt: 'Seja muito bem-vindo! Sua presença no treino de hoje foi confirmada. Bom treino, atleta!',
    en: 'Welcome! Your presence at today\'s practice has been confirmed. Have a great practice, athlete!',
    es: '¡Bienvenido! Su presencia en el entrenamiento de hoy ha sido confirmada. ¡Buen entrenamiento, atleta!',
    de: 'Willkommen! Ihre Anwesenheit beim heutigen Training wurde bestätigt. Hab ein gutes Training, Athlet!'
  },
  checkinSuccessDescCarWash: {
    pt: 'Seja muito bem-vindo! Seu programa de lavagem foi agendado e a cancela foi liberada. Dirija-se à pista de lavagem indicada.',
    en: 'Welcome! Your wash program has been confirmed and the gate is open. Please proceed to the designated wash lane.',
    es: '¡Bienvenido! Su programa de lavado ha sido confirmado y la barrera se ha abierto. Diríjase al carril de lavado indicado.',
    de: 'Willkommen! Ihr Waschprogramm wurde bestätigt und die Schranke ist geöffnet. Bitte fahren Sie in die zugewiesene Waschstraße.'
  },
  checkinSuccessFinishBtn: { pt: 'Concluir e Voltar ao Início', en: 'Finish and Return Home', es: 'Concluir y Volver al Inicio', de: 'Abschließen und zurück' },
  
  // Custom Events / Activities Top Pill Labels
  specialEventLabelDefault: { pt: 'Celebração Especial', en: 'Special Celebration', es: 'Celebración Especial', de: 'Besondere Feier' },
  specialEventLabelSynagogue: { pt: 'Serviços do Shabat', en: 'Shabat Services', es: 'Servicios del Shabat', de: 'Schabbat-Gottesdienste' },
  specialEventLabelSports: { pt: 'Treino de Basquete YMCA', en: 'YMCA Basketball Practice', es: 'Entrenamiento de Baloncesto YMCA', de: 'YMCA Basketball Training' },
  specialEventLabelCarWash: { pt: 'Serviço de Lavagem Expressa', en: 'Express Wash Service', es: 'Servicio de Lavado Express', de: 'Express-Waschservice' },

  // New Member View Success Screen Translations
  regSuccessGreeting: {
    pt: 'Ficamos muito felizes em ter você conosco! Em breve nossa equipe entrará em contato.',
    en: 'We are very happy to have you with us! Our team will contact you soon.',
    es: '¡Estamos muy felices de tenerte con nosotros! Nuestro equipo se pondrá en contacto pronto.',
    de: 'Wir freuen uns sehr, Sie bei uns zu haben! Unser Team wird sich in Kürze bei Ihnen melden.'
  },
  goBackHome: { pt: 'Voltar ao Início', en: 'Back to Home', es: 'Volver al Inicio', de: 'Zurück zur Startseite' },
};

export function t(key: string, lang: Lang): string {
  const item = dictionary[key];
  if (!item) return key;
  return item[lang] || item['pt'] || key;
}

export function translateBrandTerms(brand: BrandConfig, lang: Lang): BrandConfig {
  if (lang === 'pt') return brand;

  // Custom translation for ymcactx
  if (brand.id === 'ymcactx') {
    const ymcactxTranslations: Record<string, Record<'en' | 'es' | 'de', string>> = {
      termPastor: { en: 'Coach', es: 'Entrenador', de: 'Trainer' },
      termPastors: { en: 'Coaches', es: 'Entrenadores', de: 'Trainer' },
      termPastoral: { en: 'Talk to the Coach', es: 'Hablar con el Entrenador', de: 'Trainer-Hilfe' },
      termCult: { en: 'Practice', es: 'Entrenamiento', de: 'Training' },
      termCults: { en: 'Practices & Activities', es: 'Entrenamientos & Actividades', de: 'Trainings' },
      termDonation: { en: 'Monthly Fee', es: 'Mensualidad', de: 'Beitrag' },
      termDonations: { en: 'Fees & Contributions', es: 'Mensualidades & Contribuciones', de: 'Beiträge' },
      termConnect: { en: 'Team', es: 'Equipo', de: 'Team' },
      termConnects: { en: 'Our Teams', es: 'Nuestros Equipos', de: 'Teams' },
      termMember: { en: 'Athlete Sheet', es: 'Ficha del Atleta', de: 'Anmeldung' },
    };

    const copy = { ...brand };
    for (const key of Object.keys(ymcactxTranslations)) {
      if (key in copy) {
        (copy as any)[key] = ymcactxTranslations[key][lang === 'es' ? 'es' : (lang === 'de' ? 'de' : 'en')];
      }
    }
    return copy;
  }

  // Custom translation for imocarwash
  if (brand.id === 'imocarwash') {
    const imocarwashTranslations: Record<string, Record<'en' | 'es' | 'de', string>> = {
      termPastor: { en: 'Operator', es: 'Operador', de: 'Mitarbeiter' },
      termPastors: { en: 'Operators', es: 'Operadores', de: 'Mitarbeiter' },
      termPastoral: { en: 'Talk to Operator', es: 'Hablar con el Operador', de: 'Mitarbeiter sprechen' },
      termCult: { en: 'Wash', es: 'Lavado', de: 'Wäsche' },
      termCults: { en: 'Wash Programs', es: 'Programas de Lavado', de: 'Waschprogramme' },
      termDonation: { en: 'Payment', es: 'Pago', de: 'Zahlung' },
      termDonations: { en: 'Services & Subscriptions', es: 'Servicios & Recargas', de: 'Dienste & Pässe' },
      termConnect: { en: 'Club', es: 'Club', de: 'Klub' },
      termConnects: { en: 'Promotions & Clubs', es: 'Promociones & Clubes', de: 'Aktionen & Klubs' },
      termMember: { en: 'Customer Card', es: 'Ficha de Cliente', de: 'Kundenkarte' },
    };

    const copy = { ...brand };
    for (const key of Object.keys(imocarwashTranslations)) {
      if (key in copy) {
        (copy as any)[key] = imocarwashTranslations[key][lang === 'es' ? 'es' : (lang === 'de' ? 'de' : 'en')];
      }
    }
    return copy;
  }

  // General fallback translations (e.g. for church clients)
  const defaultChurchTranslations: Record<string, Record<'en' | 'es' | 'de', string>> = {
    termPastor: { en: 'Pastor', es: 'Pastor', de: 'Pastor' },
    termPastors: { en: 'Pastors', es: 'Pastores', de: 'Pastoren' },
    termPastoral: { en: 'Pastoral Care', es: 'Atención Pastoral', de: 'Seelsorge' },
    termCult: { en: 'Service', es: 'Culto', de: 'Dienst' },
    termCults: { en: 'Services', es: 'Cultos', de: 'Dienste' },
    termDonation: { en: 'Tithes & Offerings', es: 'Diezmos y Ofrendas', de: 'Spende' },
    termDonations: { en: 'Tithes & Offerings', es: 'Diezmos y Ofrendas', de: 'Spenden' },
    termConnect: { en: 'Small Group', es: 'Grupo Pequeño', de: 'Gruppe' },
    termConnects: { en: 'Small Groups', es: 'Grupos Pequeños', de: 'Gruppen' },
    termMember: { en: 'New Member', es: 'Nuevo Miembro', de: 'Mitglied' },
  };

  const copy = { ...brand };
  for (const key of Object.keys(defaultChurchTranslations)) {
    if (key in copy) {
      (copy as any)[key] = defaultChurchTranslations[key][lang === 'es' ? 'es' : (lang === 'de' ? 'de' : 'en')];
    }
  }
  return copy;
}
