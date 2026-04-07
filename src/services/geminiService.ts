import { GoogleGenAI, Type } from "@google/genai";
import { StoryNode, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const schema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      description: "List of story nodes",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "The unique ID of the node, e.g., 'inicio'" },
          text: { type: Type.STRING },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                nextNode: { type: Type.STRING },
                requiredClues: { type: Type.ARRAY, items: { type: Type.STRING } },
                requiredFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                forbiddenFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
                unlockClue: { type: Type.STRING },
                setFlag: { type: Type.STRING }
              },
              required: ["text", "nextNode"]
            }
          }
        },
        required: ["id", "text", "choices"]
      }
    },
    caseTitle: { type: Type.STRING },
    caseDescription: { type: Type.STRING },
    totalClues: { type: Type.INTEGER, description: "Total number of clues available to find in the case" },
    imageKeyword: { type: Type.STRING, description: "A single English keyword representing the theme of the case (e.g., 'mansion', 'library', 'train', 'noir') to be used for fetching a background image." }
  },
  required: ["nodes", "caseTitle", "caseDescription", "totalClues", "imageKeyword"]
};

export async function generateDetectiveCase(difficulty: Difficulty = 'normal') {
  const difficultyPrompt = {
    'fácil': "Acertijos sencillos, pistas claras, testimonios directos. Mínimas pistas falsas.",
    'normal': "Acertijos de nivel medio, algunas pistas falsas (red herrings), testimonios con contradicciones.",
    'difícil': "Acertijos crípticos, múltiples pistas falsas sutiles que desvíen la atención, testimonios muy ambiguos."
  }[difficulty];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Eres un escritor experto en novelas de misterio interactivas. Genera un caso de detectives en Español.
    DIFICULTAD: ${difficulty.toUpperCase()}. ${difficultyPrompt}
    
    REGLAS DE DISEÑO (ESTRICTAS):
    1. NARRATIVA Y LÓGICA: Crea una historia intrigante con 1 víctima, 3 sospechosos (solo 1 culpable) y un giro argumental. El asesino DEBE tener un Motivo claro, un Arma homicida y la Oportunidad de cometer el crimen. Los inocentes deben tener coartadas que se puedan verificar.
    2. ACERTIJOS: Incluye EXACTAMENTE 3 acertijos lógicos. Al menos 1 debe ser propuesto por un sospechoso en un interrogatorio.
    3. PENALIZACIONES: Si el jugador elige la respuesta incorrecta en un acertijo, usa 'setFlag' (ej. "acertijo_1_fallado") y llévalo a un nodo donde pierda la oportunidad. Usa 'forbiddenFlags' en la opción del acertijo para evitar que vuelva a intentarlo.
    4. PISTAS FALSAS: Crea pistas recolectables (unlockClue) que parezcan importantes pero sean irrelevantes para el asesino real.
    5. ACUSACIÓN EN DOS PASOS: Crea un nodo de acusación inicial con los 3 sospechosos. Elegir a un sospechoso DEBE llevar a un nodo de 'confirmación' que resuma las pistas y contradicciones de ese sospechoso. En este nodo, el jugador debe poder 'Confirmar acusación' (lleva a 'victoria' si es culpable y tiene pistas, o 'derrota' si es inocente) o 'Retractarse' (vuelve a la investigación).
    6. ESTRUCTURA: El nodo inicial debe tener id "inicio".
    7. TOTAL DE PISTAS: Calcula el número total de pistas (unlockClue) que el jugador puede encontrar y ponlo en 'totalClues'.
    8. IMAGEN DE FONDO: Proporciona una única palabra clave en INGLÉS en 'imageKeyword' que represente el escenario principal del caso (ej. "mansion", "library", "train", "noir").
    
    Genera un JSON válido siguiendo estrictamente el esquema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  try {
    let text = response.text || "";
    // Remove markdown code blocks if present
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    }
    
    const data = JSON.parse(text);
    
    // Convert nodes array to storyData record
    if (data.nodes && Array.isArray(data.nodes)) {
      data.storyData = {};
      data.nodes.forEach((node: any) => {
        data.storyData[node.id] = node;
      });
    }
    
    return data;
  } catch (e) {
    console.error("Error parsing AI response:", e, response.text);
    throw new Error("No se pudo generar el caso.");
  }
}
