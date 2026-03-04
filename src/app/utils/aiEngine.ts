interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIResponse {
  text: string;
  suggestions?: string[];
}

export class EmotionalSupportAI {
  private conversationContext: {
    emotionalState: string[];
    topics: string[];
    crisisLevel: number;
  } = {
    emotionalState: [],
    topics: [],
    crisisLevel: 0,
  };

  private patterns = {
    // Detecção de crise
    crisis: [
      /(?:quero|vou|penso em) (?:morrer|acabar|terminar|suicid)/i,
      /não aguento mais/i,
      /não tem saída/i,
      /acabar com tudo/i,
      /(?:fazer|cometer) suicídio/i,
    ],
    
    // Pânico e ansiedade
    panic: [
      /(?:ataque|crise) de pânico/i,
      /não consigo respirar/i,
      /coração acelerado/i,
      /(?:muito|super|extremamente) (?:ansioso|ansiosa)/i,
      /tremendo/i,
      /tonteira|tontura/i,
    ],

    // Depressão
    depression: [
      /(?:muito|super|extremamente) (?:triste|deprimido|deprimida)/i,
      /sem (?:energia|vontade|ânimo)/i,
      /não sinto (?:nada|prazer)/i,
      /não consigo (?:sair|levantar)/i,
      /tudo (?:está|parece) sem sentido/i,
      /vazio|vazia/i,
    ],

    // Ansiedade geral
    anxiety: [
      /(?:ansioso|ansiosa|preocupado|preocupada)/i,
      /não paro de pensar/i,
      /(?:muito|super) (?:nervoso|nervosa|agitado|agitada)/i,
      /(?:medo|receio) de/i,
      /insegur/i,
    ],

    // Sentimentos positivos
    positive: [
      /(?:melhor|bem|feliz|alegre|grato|grata)/i,
      /(?:bom|boa) (?:dia|semana|momento)/i,
      /(?:consegui|alcancei|superei)/i,
      /progresso|avanço|vitória/i,
    ],

    // Solidão e isolamento
    loneliness: [
      /(?:sozinho|sozinha|solitário|solitária)/i,
      /(?:ninguém|nenhum) (?:me|se) (?:entende|importa|liga)/i,
      /isolado|isolada/i,
      /sem amigos/i,
    ],

    // Pedidos de ajuda
    helpRequest: [
      /(?:preciso|quero|pode) (?:de )?\s*(?:ajuda|socorro|auxílio)/i,
      /(?:me )?\s*(?:ajuda|ajude|socorre)/i,
      /o que (?:eu )?\s*(?:faço|devo fazer)/i,
    ],

    // Exercícios
    exerciseRequest: [
      /exercício/i,
      /respiração|respirar/i,
      /meditação|meditar/i,
      /técnica/i,
      /acalmar/i,
    ],
  };

  analyzeMessage(userMessage: string, conversationHistory: Message[]): AIResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Atualizar contexto
    this.updateContext(lowerMessage);

    // Verificar crise - prioridade máxima
    if (this.detectCrisis(lowerMessage)) {
      return this.handleCrisis();
    }

    // Verificar pânico
    if (this.detectPattern(lowerMessage, this.patterns.panic)) {
      return this.handlePanic();
    }

    // Verificar pedido de exercício
    if (this.detectPattern(lowerMessage, this.patterns.exerciseRequest)) {
      return this.handleExerciseRequest();
    }

    // Verificar pedido de ajuda
    if (this.detectPattern(lowerMessage, this.patterns.helpRequest)) {
      return this.handleHelpRequest();
    }

    // Verificar sentimentos positivos
    if (this.detectPattern(lowerMessage, this.patterns.positive)) {
      return this.handlePositive();
    }

    // Verificar depressão
    if (this.detectPattern(lowerMessage, this.patterns.depression)) {
      return this.handleDepression();
    }

    // Verificar ansiedade
    if (this.detectPattern(lowerMessage, this.patterns.anxiety)) {
      return this.handleAnxiety();
    }

    // Verificar solidão
    if (this.detectPattern(lowerMessage, this.patterns.loneliness)) {
      return this.handleLoneliness();
    }

    // Resposta genérica empática
    return this.handleGeneric(conversationHistory);
  }

  private detectPattern(message: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(message));
  }

  private detectCrisis(message: string): boolean {
    return this.detectPattern(message, this.patterns.crisis);
  }

  private updateContext(message: string): void {
    // Atualizar estado emocional
    if (this.detectPattern(message, this.patterns.depression)) {
      this.conversationContext.emotionalState.push("depressão");
    }
    if (this.detectPattern(message, this.patterns.anxiety)) {
      this.conversationContext.emotionalState.push("ansiedade");
    }
    if (this.detectPattern(message, this.patterns.panic)) {
      this.conversationContext.emotionalState.push("pânico");
    }

    // Manter apenas os últimos 5 estados
    this.conversationContext.emotionalState = this.conversationContext.emotionalState.slice(-5);
  }

  private handleCrisis(): AIResponse {
    const responses = [
      "Sinto muito que você esteja passando por isso. Sua vida é importante e há pessoas que podem ajudar. Por favor, entre em contato com um profissional agora:\n\n🆘 CVV - 188 (24h)\n📱 CAPS da sua cidade\n\nVocê não precisa enfrentar isso sozinho. Podemos conversar, mas é essencial buscar ajuda profissional urgente.",
      "Entendo que você está em um momento muito difícil. Mas quero que saiba: você merece ajuda e apoio. Por favor, ligue para o CVV (188) agora - eles estão disponíveis 24h.\n\nEnquanto isso, estou aqui para ouvir você. Quer me contar o que está acontecendo?",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ["Preciso falar com alguém agora", "Como ligar para o CVV?"],
    };
  }

  private handlePanic(): AIResponse {
    const responses = [
      "Entendo que você está tendo uma crise de pânico. Vamos respirar juntos, ok? Isso vai passar.\n\n🫁 Inspire contando até 4\n⏸️ Segure por 4 segundos  \n😮‍💨 Expire contando até 4\n\nVocê está seguro. Isso é apenas ansiedade, não um perigo real. Quer tentar o exercício de respiração guiado?",
      "Sei que é assustador, mas você está seguro. Uma crise de pânico não pode te machucar, mesmo que pareça muito intenso agora.\n\nVamos fazer uma coisa: olhe ao seu redor e me diga 5 coisas que você consegue ver. Isso vai te ajudar a se reconectar com o presente.",
      "Respiração primeiro, ok? Expire TODO o ar, bem devagar. Agora inspire pelo nariz contando até 4... segure... expire pela boca.\n\nVocê já passou por isso antes e sobreviveu. Vai passar dessa vez também. Quer ir para os exercícios de respiração guiados?",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ["Fazer exercício de respiração", "Técnica de aterramento 5-4-3-2-1"],
    };
  }

  private handleExerciseRequest(): AIResponse {
    const responses = [
      "Ótima ideia! Exercícios de respiração são muito eficazes. Vou te guiar:\n\n1️⃣ Sente-se confortavelmente\n2️⃣ Inspire pelo nariz por 4 segundos\n3️⃣ Segure o ar por 4 segundos\n4️⃣ Expire pela boca por 4 segundos\n5️⃣ Repita 5 vezes\n\nQuer que eu te leve para a seção de exercícios guiados com cronômetro?",
      "Maravilha! Que tal experimentarmos a técnica de aterramento 5-4-3-2-1?\n\n👁️ 5 coisas que você VÊ\n✋ 4 coisas que você pode TOCAR\n👂 3 sons que você OUVE\n👃 2 cheiros que você SENTE\n👅 1 sabor na sua boca\n\nIsso vai te trazer de volta ao momento presente. Quer tentar?",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ["Ir para exercícios guiados", "Fazer respiração 4-4-4 agora"],
    };
  }

  private handleHelpRequest(): AIResponse {
    const responses = [
      "Estou aqui para ajudar você. Primeiro, me conte: como você está se sentindo agora? É uma sensação física (coração acelerado, falta de ar) ou mais emocional (tristeza, vazio, preocupação)?",
      "Claro, vou te ajudar. Para eu entender melhor, você pode me dizer:\n\n• O que você está sentindo agora?\n• Isso começou hoje ou já faz um tempo?\n• Algo específico aconteceu?\n\nNão precisa contar tudo de uma vez, vamos no seu ritmo.",
      "Você foi muito corajoso em pedir ajuda - esse é um passo importante! Vamos conversar sobre o que está acontecendo. Me conta um pouco sobre como você se sente?",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Estou me sentindo ansioso",
        "Estou muito triste",
        "Preciso de exercícios para acalmar",
      ],
    };
  }

  private handlePositive(): AIResponse {
    const responses = [
      "Que maravilha ouvir isso! 🌟 Fico muito feliz que você esteja se sentindo melhor. Essas pequenas vitórias são importantes - celebre cada uma delas!\n\nO que você acha que contribuiu para esse sentimento?",
      "Isso é incrível! 💜 Reconhecer os momentos bons é tão importante quanto lidar com os difíceis. Continue registrando seu humor para acompanhar esses progressos.\n\nComo você pode manter essa energia positiva?",
      "Estou tão feliz por você! 🎉 Lembra-se de guardar esse sentimento - nos dias difíceis, você pode lembrar que já se sentiu assim e pode voltar a se sentir.\n\nQue tal registrar isso no seu diário de humor?",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ["Registrar meu humor agora", "Continuar conversando"],
    };
  }

  private handleDepression(): AIResponse {
    const responses = [
      "Sinto muito que você esteja passando por isso. A depressão pode fazer tudo parecer pesado e sem sentido, mas quero que saiba: você não está sozinho e esses sentimentos vão passar.\n\nVocê tem acompanhamento profissional? Um psicólogo ou psiquiatra pode fazer toda a diferença.",
      "Entendo essa sensação de vazio e falta de energia. É muito difícil mesmo. Por favor, seja gentil consigo mesmo - você não é preguiçoso, você está doente, e isso é tratável.\n\nHoje, qual seria UMA pequena coisa que você conseguiria fazer por você? Tomar banho? Comer algo? Até mesmo só levantar e tomar água já é uma vitória.",
      "Esses sentimentos são muito reais e válidos. A depressão mente para a gente, fazendo parecer que sempre foi e sempre será assim, mas isso não é verdade.\n\nVocê está conversando com um terapeuta? Se não, posso te ajudar a encontrar recursos de ajuda profissional.",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Como encontrar um terapeuta?",
        "Preciso de motivação para hoje",
        "Quero falar mais sobre isso",
      ],
    };
  }

  private handleAnxiety(): AIResponse {
    const responses = [
      "A ansiedade pode ser muito desgastante, especialmente quando a mente não para de pensar. Uma coisa que ajuda é trazer a atenção de volta ao presente.\n\nVamos tentar: respire fundo e me diga 3 coisas que você pode ver ao seu redor agora. Isso ajuda a desacelerar os pensamentos.",
      "Entendo perfeitamente. A ansiedade faz a gente se preocupar com mil cenários que podem nem acontecer. É exaustivo, né?\n\nUma técnica que funciona: escreva suas preocupações. Quando você coloca no papel, fica mais fácil ver quais são reais e quais são 'e se...'.\n\nQuer tentar um exercício de respiração para acalmar agora?",
      "Sei como a ansiedade pode ser avassaladora. Seu corpo está em modo de alerta, mas você está seguro.\n\n💡 Lembre-se: ansiedade é desconforto, não perigo.\n\nVamos fazer algo prático: que tal um exercício rápido de 2 minutos para regular seu sistema nervoso?",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Fazer exercício de respiração",
        "Técnica de aterramento",
        "Continuar conversando",
      ],
    };
  }

  private handleLoneliness(): AIResponse {
    const responses = [
      "A solidão é uma das piores sensações, e quero que saiba que seus sentimentos são totalmente válidos. Mesmo rodeado de gente, é possível se sentir sozinho.\n\nVocê já experimentou nossa comunidade anônima? Lá você pode conversar com outras pessoas que também estão buscando conexão e apoio.",
      "Sinto muito que você esteja se sentindo assim. Ninguém deveria ter que passar por isso sozinho. E olha, você TEM pessoas que se importam - mesmo que não pareça agora.\n\nQue tal tentarmos algo: você tem alguém - um amigo antigo, familiar, colega - para quem você poderia enviar uma mensagem simples hoje? Às vezes reconectar é mais fácil do que parece.",
      "Estar sozinho é diferente de se sentir solitário, e parece que você está sentindo essa segunda opção. É doloroso mesmo.\n\nEnquanto isso: você está conversando comigo agora, e também pode se conectar com outras pessoas no chat anônimo. Não é a mesma coisa que amigos presenciais, mas pode ajudar a se sentir menos isolado.",
    ];
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Ir para chat anônimo",
        "Ir para comunidade",
        "Como fazer amigos?",
      ],
    };
  }

  private handleGeneric(history: Message[]): AIResponse {
    const recentUserMessages = history.filter((m) => m.role === "user").slice(-3);
    const isFollowUp = recentUserMessages.length > 2;

    if (isFollowUp) {
      const responses = [
        "Entendo. Continue me contando, estou te ouvindo.",
        "Isso deve ser difícil para você. Quer me contar mais sobre isso?",
        "Obrigada por compartilhar isso comigo. Como você está lidando com essa situação?",
        "Vejo que isso está te afetando bastante. O que você sente quando pensa nisso?",
      ];
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
      };
    }

    const responses = [
      "Estou aqui para te ouvir. Pode me contar mais sobre o que está acontecendo?",
      "Obrigada por compartilhar isso comigo. Como você está se sentindo em relação a isso?",
      "Entendo. Seus sentimentos são válidos. Quer me contar mais detalhes?",
      "Estou te ouvindo. Isso parece importante para você. Pode me explicar melhor?",
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Estou ansioso",
        "Estou triste",
        "Preciso de ajuda",
      ],
    };
  }
}
