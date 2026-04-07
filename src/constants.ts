import { StoryNode } from "./types";

export const STORY_DATA: Record<string, StoryNode> = {
  inicio: {
    id: "inicio",
    text: "Llegas a la mansión del Profesor Arístides. El aire es pesado. El cuerpo del profesor yace en su estudio, rodeado de libros de filosofía antigua. El inspector te mira: 'Detective, confiamos en su lógica. Investigue la escena.'",
    choices: [
      { text: "Examinar el cuerpo", nextNode: "examinar_cuerpo" },
      { text: "Hablar con el mayordomo (Edgar)", nextNode: "hablar_mayordomo" },
      { text: "Hablar con la sobrina (Elena)", nextNode: "hablar_elena" },
      { text: "Hablar con el abogado (Vance)", nextNode: "hablar_vance" },
      { text: "Revisar el escritorio", nextNode: "revisar_escritorio" },
      { text: "Investigar la biblioteca (Acertijo 3)", nextNode: "acertijo_biblioteca", forbiddenFlags: ["biblioteca_resuelta", "biblioteca_fallada"] },
      { text: "Investigar la mesa auxiliar", nextNode: "mesa_auxiliar" },
      { text: "Ir a la Acusación Final", nextNode: "acusacion_previa" }
    ]
  },
  hablar_vance: {
    id: "hablar_vance",
    text: "El abogado Vance está ordenando unos papeles. 'El profesor iba a desheredar a Elena hoy mismo. Es una lástima que no llegara a firmar.'",
    choices: [
      { text: "Preguntar por su coartada", nextNode: "vance_coartada" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  vance_coartada: {
    id: "vance_coartada",
    text: "'Estuve en el tribunal toda la tarde. Tengo docenas de testigos, detective.'",
    choices: [
      { text: "Anotar coartada de Vance", nextNode: "inicio", unlockClue: "Coartada de Vance" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  acertijo_biblioteca: {
    id: "acertijo_biblioteca",
    text: "En la biblioteca, un libro está fuera de lugar. Tiene un grabado: 'Tengo ciudades, pero no casas. Tengo montañas, pero no árboles. Tengo agua, pero no peces. ¿Qué soy?'. (Cuidado: un error bloqueará el mecanismo).",
    choices: [
      { text: "Un mapa", nextNode: "biblioteca_secreta", unlockClue: "Frasco de Veneno", setFlag: "biblioteca_resuelta" },
      { text: "Un globo terráqueo", nextNode: "biblioteca_bloqueada", setFlag: "biblioteca_fallada" },
      { text: "Un sueño", nextNode: "biblioteca_bloqueada", setFlag: "biblioteca_fallada" }
    ]
  },
  biblioteca_bloqueada: {
    id: "biblioteca_bloqueada",
    text: "Al tirar del libro equivocado, escuchas un 'clack' metálico. El mecanismo se ha atascado permanentemente.",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  biblioteca_secreta: {
    id: "biblioteca_secreta",
    text: "Al mover el libro, un panel se abre. Encuentras un frasco de cianuro escondido detrás de los tomos de Aristóteles.",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  examinar_cuerpo: {
    id: "examinar_cuerpo",
    text: "El profesor parece haber muerto por envenenamiento. En su mano derecha sostiene una pequeña nota que dice: 'La verdad es una sombra'. Notas un olor extraño, como a almendras amargas. Cerca de su mano izquierda, ves algo brillando en la alfombra.",
    choices: [
      { text: "Recoger la nota", nextNode: "inicio", unlockClue: "Nota Críptica", setFlag: "nota_recogida" },
      { text: "Examinar el objeto en el suelo", nextNode: "examinar_suelo" },
      { text: "Volver al centro de la habitación", nextNode: "inicio" }
    ]
  },
  examinar_suelo: {
    id: "examinar_suelo",
    text: "Es el reloj de bolsillo del profesor. El cristal está roto y las manecillas se han detenido exactamente a las 4:45. Esto contradice la versión de Edgar sobre el té de las cinco. También ves una pequeña llave de plata bajo el sofá.",
    choices: [
      { text: "Recoger el reloj", nextNode: "inicio", unlockClue: "Reloj Roto" },
      { text: "Recoger la llave de plata", nextNode: "inicio", unlockClue: "Llave de Plata" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  hablar_mayordomo: {
    id: "hablar_mayordomo",
    text: "El mayordomo, un hombre pálido llamado Edgar, tiembla ligeramente. 'Yo solo le traje su té de las cinco, como siempre. Él estaba leyendo a Platón.'",
    choices: [
      { text: "¿Alguien más entró al estudio?", nextNode: "interrogar_edgar_mas", setFlag: "hablado_edgar" },
      { text: "Observar sus manos", nextNode: "observar_manos_edgar" },
      { text: "Mencionar la nota críptica", nextNode: "edgar_reacciona_nota", requiredClues: ["Nota Críptica"] },
      { text: "Confrontar con el reloj roto", nextNode: "edgar_confronta_reloj", requiredClues: ["Reloj Roto"] },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  edgar_confronta_reloj: {
    id: "edgar_confronta_reloj",
    text: "Edgar tartamudea. '¿4:45? Debió... debió romperse antes. Yo... yo juro que vine a las cinco.' Su nerviosismo es evidente.",
    choices: [
      { text: "Anotar contradicción horaria", nextNode: "inicio", setFlag: "edgar_mentiroso" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  edgar_reacciona_nota: {
    id: "edgar_reacciona_nota",
    text: "Edgar palidece aún más. '¿Esa nota? El profesor solía escribir cosas así cuando estaba... preocupado por alguien cercano.' Mira de reojo hacia el pasillo donde está Elena.",
    choices: [
      { text: "¿Preocupado por Elena?", nextNode: "edgar_sobre_elena", setFlag: "edgar_acusa_elena" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  edgar_sobre_elena: {
    id: "edgar_sobre_elena",
    text: "'Ella ha estado presionándolo mucho por dinero. El profesor no quería dárselo porque decía que ella lo malgastaría en vicios.'",
    choices: [
      { text: "Anotar conflicto de dinero", nextNode: "inicio", unlockClue: "Motivo de Elena" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  interrogar_edgar_mas: {
    id: "interrogar_edgar_mas",
    text: "'Solo la sobrina del profesor, Elena. Ella discutía con él sobre la herencia esta mañana.'",
    choices: [
      { text: "Anotar sospecha sobre Elena", nextNode: "inicio", unlockClue: "Testimonio sobre Elena" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  observar_manos_edgar: {
    id: "observar_manos_edgar",
    text: "Notas manchas de tinta fresca en sus dedos, pero el profesor escribía con pluma de oro que está limpia.",
    choices: [
      { text: "Anotar sobre la tinta", nextNode: "inicio", unlockClue: "Manchas de Tinta" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  hablar_elena: {
    id: "hablar_elena",
    text: "Elena fuma un cigarrillo con elegancia forzada. 'Es una tragedia, ¿verdad? Mi pobre tío. Siempre tan obsesionado con sus libros.'",
    choices: [
      { text: "¿Dónde estaba usted a las cinco?", nextNode: "elena_coartada" },
      { text: "Confrontar con el testimonio de Edgar", nextNode: "elena_confronta_edgar", requiredFlags: ["hablado_edgar"] },
      { text: "Mostrar la página falsificada", nextNode: "elena_confronta_firma", requiredClues: ["Página Falsificada"] },
      { text: "Resolver su acertijo (Acertijo 2)", nextNode: "acertijo_elena", forbiddenFlags: ["elena_acertijo_fallado", "elena_acertijo_resuelto"] },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  acertijo_elena: {
    id: "acertijo_elena",
    text: "Elena sonríe con malicia. 'Si eres tan listo, dime: ¿Qué es lo que cuanto más grande es, menos se ve? Solo te lo preguntaré una vez.'",
    choices: [
      { text: "La oscuridad", nextNode: "elena_impresionada", unlockClue: "Confidencia de Elena", setFlag: "elena_acertijo_resuelto" },
      { text: "El humo", nextNode: "elena_decepcionada", setFlag: "elena_acertijo_fallado" },
      { text: "La mentira", nextNode: "elena_decepcionada", setFlag: "elena_acertijo_fallado" }
    ]
  },
  elena_decepcionada: {
    id: "elena_decepcionada",
    text: "Elena suspira y apaga su cigarrillo. 'Me sobreestimaste, detective. No tengo nada más que decirte.' Se da la vuelta y te ignora.",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  elena_impresionada: {
    id: "elena_impresionada",
    text: "'Vaya, no eres tan tonto. Te diré algo: Edgar no es tan fiel como parece. Lo vi escondiendo algo en la biblioteca ayer.'",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  elena_coartada: {
    id: "elena_coartada",
    text: "'En el jardín, leyendo. Sola. No tengo testigos, si es lo que busca, detective.'",
    choices: [
      { text: "Dudar de su coartada", nextNode: "inicio", setFlag: "elena_sospechosa" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  elena_confronta_edgar: {
    id: "elena_confronta_edgar",
    text: "'¿Edgar dijo eso? Ese hombre siempre me ha odiado. Es un servil que solo busca quedarse con las migajas del testamento.'",
    choices: [
      { text: "Anotar hostilidad mutua", nextNode: "inicio", unlockClue: "Rivalidad Edgar-Elena" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  elena_confronta_firma: {
    id: "elena_confronta_firma",
    text: "Elena pierde la compostura por un segundo. '¡Eso es una mentira! ¡Él me obligó!'. Se calla de golpe, dándose cuenta de lo que ha dicho.",
    choices: [
      { text: "Presionar más", nextNode: "elena_confesion_parcial", setFlag: "elena_presionada" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  elena_confesion_parcial: {
    id: "elena_confesion_parcial",
    text: "'Está bien, intenté falsificar su firma. Pero no lo maté. Cuando entré al estudio para dejar el papel, él ya estaba... así.'",
    choices: [
      { text: "Anotar confesión de falsificación", nextNode: "inicio", unlockClue: "Confesión de Elena" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  revisar_escritorio: {
    id: "revisar_escritorio",
    text: "En el escritorio hay un diario abierto. La última entrada dice: 'Mi heredero no entiende que la virtud no se compra'. Notas una pequeña hendidura en el lateral del mueble y una caja fuerte con un teclado numérico.",
    choices: [
      { text: "Buscar la página perdida", nextNode: "buscar_pagina" },
      { text: "Presionar la hendidura", nextNode: "cajon_secreto" },
      { text: "Intentar abrir la caja fuerte (Acertijo 1)", nextNode: "acertijo_caja_fuerte", forbiddenFlags: ["caja_bloqueada", "caja_abierta"] },
      { text: "La caja fuerte está bloqueada", nextNode: "revisar_escritorio", requiredFlags: ["caja_bloqueada"] },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  acertijo_caja_fuerte: {
    id: "acertijo_caja_fuerte",
    text: "La caja fuerte tiene una nota: 'Soy el número de patas de una araña multiplicado por el número de ojos de un cíclope, menos el número de dedos de una mano humana'. ¿Cuál es el código? (Cuidado: un error bloqueará la caja).",
    choices: [
      { text: "3", nextNode: "caja_fuerte_abierta", unlockClue: "Testamento Real", setFlag: "caja_abierta" },
      { text: "8", nextNode: "caja_fuerte_bloqueada", setFlag: "caja_bloqueada" },
      { text: "13", nextNode: "caja_fuerte_bloqueada", setFlag: "caja_bloqueada" }
    ]
  },
  caja_fuerte_bloqueada: {
    id: "caja_fuerte_bloqueada",
    text: "Introduces el código incorrecto. La caja fuerte emite un pitido agudo y el teclado se bloquea permanentemente. Has perdido la oportunidad de ver qué había dentro.",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  caja_fuerte_abierta: {
    id: "caja_fuerte_abierta",
    text: "¡Click! La caja se abre. Encuentras el testamento original. El profesor planeaba dejarlo todo a una fundación benéfica, no a Elena ni a Edgar.",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  cajon_secreto: {
    id: "cajon_secreto",
    text: "Un pequeño compartimento se abre. Dentro hay una carta de despido redactada por el profesor, dirigida a Edgar. Tiene fecha de hoy.",
    choices: [
      { text: "Guardar la carta de despido", nextNode: "inicio", unlockClue: "Carta de Despido" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  buscar_pagina: {
    id: "buscar_pagina",
    text: "Encuentras la página arrugada en la papelera. Describe cómo Elena intentó falsificar su firma recientemente.",
    choices: [
      { text: "Guardar la página", nextNode: "inicio", unlockClue: "Página Falsificada" },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  mesa_auxiliar: {
    id: "mesa_auxiliar",
    text: "Hay una copa de vino a medio terminar. Al acercarte, percibes el mismo aroma a almendras amargas que emanaba del cuerpo del profesor. Hay un pequeño joyero cerrado sobre la mesa.",
    choices: [
      { text: "Analizar el vino", nextNode: "inicio", unlockClue: "Copa de Vino" },
      { text: "Intentar abrir el joyero con la llave de plata", nextNode: "joyero_abierto", requiredClues: ["Llave de Plata"] },
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  joyero_abierto: {
    id: "joyero_abierto",
    text: "El joyero se abre, pero solo contiene una vieja foto de la esposa fallecida del profesor. No parece haber nada relevante para el asesinato aquí.",
    choices: [
      { text: "Volver", nextNode: "inicio" }
    ]
  },
  acusacion_previa: {
    id: "acusacion_previa",
    text: "¿Estás listo para acusar a alguien? Una acusación errónea arruinará tu carrera para siempre.",
    choices: [
      { text: "Acusar a Edgar (El Mayordomo)", nextNode: "acusar_edgar" },
      { text: "Acusar a Elena (La Sobrina)", nextNode: "acusar_elena" },
      { text: "Acusar a Vance (El Abogado)", nextNode: "acusar_vance" },
      { text: "Seguir investigando", nextNode: "inicio" }
    ]
  },
  acusar_edgar: {
    id: "acusar_edgar",
    text: "Resumen de Acusación: Edgar (El Mayordomo).\n\nHechos a favor: Tenía acceso al veneno para ratas. Estaba a punto de ser despedido, dándole un motivo claro. Su reloj se rompió a la hora del crimen.\n\nContradicciones: Afirma ser leal, pero ocultaba su despido.\n\n¿Confirmas tu acusación?",
    choices: [
      { 
        text: "Confirmar Acusación (Requiere: Reloj, Carta, Veneno)", 
        nextNode: "victoria", 
        requiredClues: ["Reloj Roto", "Carta de Despido", "Frasco de Veneno"],
        requiredFlags: ["hablado_edgar"] 
      },
      {
        text: "Me retracto. Necesito investigar más.",
        nextNode: "acusacion_previa"
      }
    ]
  },
  acusar_elena: {
    id: "acusar_elena",
    text: "Resumen de Acusación: Elena (La Sobrina).\n\nHechos a favor: Iba a ser desheredada hoy mismo, lo que le da un fuerte motivo económico.\n\nContradicciones: Afirma haber estado en el jardín y no parece tener acceso al veneno utilizado.\n\n¿Confirmas tu acusación?",
    choices: [
      { text: "Confirmar Acusación", nextNode: "derrota_elena" },
      { text: "Me retracto. Necesito investigar más.", nextNode: "acusacion_previa" }
    ]
  },
  derrota_elena: {
    id: "derrota_elena",
    text: "Acusas a Elena. Ella te mira con desprecio. '¿Yo? Estaba en el jardín y no tengo acceso al veneno. Mis abogados te destruirán por esta difamación.' Has acusado a la persona equivocada.",
    choices: [
      { text: "Finalizar Caso (Derrota)", nextNode: "derrota" }
    ]
  },
  acusar_vance: {
    id: "acusar_vance",
    text: "Resumen de Acusación: Vance (El Abogado).\n\nHechos a favor: Manejaba el testamento del profesor y conocía sus intenciones de desheredar a Elena.\n\nContradicciones: Afirma haber estado en el tribunal toda la tarde, una coartada fácilmente verificable.\n\n¿Confirmas tu acusación?",
    choices: [
      { text: "Confirmar Acusación", nextNode: "derrota_vance" },
      { text: "Me retracto. Necesito investigar más.", nextNode: "acusacion_previa" }
    ]
  },
  derrota_vance: {
    id: "derrota_vance",
    text: "Acusas a Vance. Él saca un documento sellado por el juez que prueba que estuvo en el tribunal a la hora de la muerte. Has hecho el ridículo y el verdadero asesino escapa.",
    choices: [
      { text: "Finalizar Caso (Derrota)", nextNode: "derrota" }
    ]
  },
  victoria_elena: {
    id: "victoria_elena",
    text: "Elena se quiebra. '¡Él nunca me dio lo que merecía!'. Resulta que ella no lo envenenó, pero contrató a alguien para hacerlo. Has descubierto la verdad detrás de la herencia.",
    choices: [
      { text: "Jugar de nuevo", nextNode: "inicio" }
    ]
  },
  victoria: {
    id: "victoria",
    text: "¡Felicidades, Detective! Has resuelto el caso usando la lógica y las pistas correctas. El asesino está tras las rejas.",
    choices: [
      { text: "Jugar de nuevo", nextNode: "inicio" }
    ]
  },
  derrota: {
    id: "derrota",
    text: "Has fallado. El verdadero asesino sigue libre y tu reputación ha sido destruida.",
    choices: [
      { text: "Reintentar", nextNode: "inicio" }
    ]
  }
};
