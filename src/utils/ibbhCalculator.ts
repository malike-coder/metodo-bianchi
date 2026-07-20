import type { WizardFormData, BianchClient, IbbhStatus, DimensionScores, ActionItem, ActionTimeframe, RoomEvaluation } from '../types/bianchi';

interface NumericRoomEval {
  feel: number;
  light: number;
  order: number;
  plants: number;
}

export function getNumericRoomEval(ev: RoomEvaluation | undefined): NumericRoomEval {
  if (!ev) return { feel: 3, light: 3, order: 3, plants: 3 };

  let lNum = 3;
  if (ev.light === 'Muy abundante') lNum = 5;
  else if (ev.light === 'Suficiente') lNum = 4;
  else if (ev.light === 'Escasa') lNum = 2;
  else if (ev.light === 'Casi no hay') lNum = 1;
  else if (typeof (ev.light as any) === 'number') lNum = ev.light as any;

  let oNum = 3;
  if (ev.order === 'Fácil de sostener') oNum = 5;
  else if (ev.order === 'Se desorganiza fácil') oNum = 3;
  else if (ev.order === 'Caótico') oNum = 1;
  else if (typeof (ev.order as any) === 'number') oNum = ev.order as any;

  let pNum = 3;
  if (ev.plants === 'Muchas') pNum = 5;
  else if (ev.plants === 'Pocas') pNum = 3;
  else if (ev.plants === 'Ninguna') pNum = 1;

  return {
    feel: ev.feel || 3,
    light: lNum,
    order: oNum,
    plants: pNum
  };
}

export function preprocessForm(form: WizardFormData): WizardFormData {
  const p = { ...form };

  // 1. Map Emotional representation
  if (form.homeRepresentation && form.homeRepresentation.includes('Refleja quién sos')) p.slideEmotional1 = 5;
  else if (form.homeRepresentation && form.homeRepresentation.includes('Te representa en parte')) p.slideEmotional1 = 4;
  else if (form.homeRepresentation && form.homeRepresentation.includes('ya no acompaña')) p.slideEmotional1 = 2;
  else if (form.homeRepresentation && form.homeRepresentation.includes('dejó de representar')) p.slideEmotional1 = 1;

  // 2. Map Arrival feeling
  if (form.arrivalFeeling && form.arrivalFeeling.includes('bajar un cambio')) p.slideEmotional2 = 5;
  else if (form.arrivalFeeling && form.arrivalFeeling.includes('Me gusta volver')) p.slideEmotional2 = 4;
  else if (form.arrivalFeeling && form.arrivalFeeling.includes('sigo con mi día')) p.slideEmotional2 = 3;
  else if (form.arrivalFeeling && form.arrivalFeeling.includes('tengo que hacer')) p.slideEmotional2 = 2;
  else if (form.arrivalFeeling && form.arrivalFeeling.includes('sobrepasado')) p.slideEmotional2 = 1;

  // 3. Map Predominant emotion
  if (form.predominantSensations && form.predominantSensations.length > 0) {
    const mainS = form.predominantSensations[0];
    if (['Calma', 'Refugio', 'Bienestar', 'Seguridad', 'Alegría'].includes(mainS)) {
      p.predominantEmotion = 'Calma';
    } else if (['Desorden', 'Indiferencia'].includes(mainS)) {
      p.predominantEmotion = 'Incomodidad';
    } else {
      p.predominantEmotion = 'Agobio';
    }
  }

  // 4. Map desired feeling
  if (form.desiredFeelings && form.desiredFeelings.length > 0) {
    p.desiredFeeling = form.desiredFeelings.join(', ').replace(/🌿 |😴 |😊 |💪 |👨👩👧 |🎨 |📦 |🏡 |💼 |✨ /g, '');
  }

  // 5. Map transitions
  if (form.transitions && form.transitions.length > 0) {
    p.transition = form.transitions[0];
  }

  // 6. Map room evaluations to numeric ratings for downstream math
  const roomKeys = Object.keys(form.roomEvaluations);
  let sumLight = 0;
  let sumNoise = 0;
  let sumMoisture = 0;
  let sumPlants = 0;
  let sumViews = 0;
  let sumOrder = 0;
  let sumCirc = 0;

  roomKeys.forEach((room) => {
    const ev = form.roomEvaluations[room];
    if (!ev) return;
    
    // Light
    if (ev.light === 'Muy abundante') sumLight += 5;
    else if (ev.light === 'Suficiente') sumLight += 4;
    else if (ev.light === 'Escasa') sumLight += 2;
    else sumLight += 1;

    // Noise
    if (ev.noise === 'Silencioso') sumNoise += 5;
    else if (ev.noise === 'Moderado') sumNoise += 3;
    else sumNoise += 1;

    // Moisture
    if (ev.moisture === 'Sí') sumMoisture += 1;

    // Plants
    if (ev.plants === 'Muchas') sumPlants += 5;
    else if (ev.plants === 'Pocas') sumPlants += 3;
    else sumPlants += 1;

    // Views
    if (ev.views === 'Visual al verde') sumViews += 5;
    else if (ev.views === 'Visual edificada') sumViews += 3;
    else sumViews += 1;

    // Order
    if (ev.order === 'Fácil de sostener') sumOrder += 5;
    else if (ev.order === 'Se desorganiza fácil') sumOrder += 3;
    else sumOrder += 1;

    // Circulation
    if (ev.circulation === 'Fluida y libre') sumCirc += 5;
    else if (ev.circulation === 'Con obstáculos') sumCirc += 3;
    else sumCirc += 2;
  });

  const count = roomKeys.length || 1;
  p.slidePhys1 = Math.round(sumLight / count);
  p.slidePhys2 = Math.round(sumNoise / count);
  p.slideBio1 = Math.round(sumPlants / count);
  p.slideBio2 = Math.round(sumViews / count);
  p.slideOrd1 = Math.round(sumOrder / count);
  p.slideOrd2 = Math.round(sumCirc / count);
  p.hasMoisture = sumMoisture > 0 ? 'Si' : 'No';

  // Map budget
  if (form.interventionType && form.interventionType.includes('Pequeños cambios')) p.budget = 'Bajo';
  else if (form.interventionType && form.interventionType.includes('Mejoras progresivas')) p.budget = 'Medio';
  else p.budget = 'Alto';

  return p;
}

// ── Coherent Mathematical Calculation of IBBH ──────────────────
export function calculateIbbh(rawForm: WizardFormData): number {
  const form = preprocessForm(rawForm);
  // 1. Personal & Emotional Context (slides 1 and 2: max 10)
  const emotionalSum = form.slideEmotional1 + form.slideEmotional2; 
  
  // 2. Physical & IEQ Context (slidePhys1 + slidePhys2 + yes/no penalties: max 10)
  let physicalSum = form.slidePhys1 + form.slidePhys2;
  if (form.hasMoisture === 'Si') physicalSum = Math.max(2, physicalSum - 2);
  if (form.hasSyntheticMaterials === 'Si') physicalSum = Math.max(2, physicalSum - 1);

  // 3. Circulation & Order Context (slideOrd1 + slideOrd2 + yes/no penalties: max 10)
  let orderSum = form.slideOrd1 + form.slideOrd2;
  if (form.hasInheritedObjects === 'Si') orderSum = Math.max(2, orderSum - 1);

  // 4. Biophilic Context (slideBio1 + slideBio2 + yes/no boost: max 10)
  let bioSum = form.slideBio1 + form.slideBio2;
  if (form.hasPauseSpace === 'Si') bioSum = Math.min(10, bioSum + 1);

  // 5. Room-Specific Evaluations (Average of feel + light + order for each selected room: max 15 per room)
  const roomKeys = Object.keys(form.roomEvaluations);
  let roomScoreAvg = 75; // Default if no rooms are selected
  if (roomKeys.length > 0) {
    const totalRoomScore = roomKeys.reduce((acc, room) => {
      const roomEval = getNumericRoomEval(form.roomEvaluations[room]);
      return acc + (roomEval.feel + roomEval.light + roomEval.order);
    }, 0);
    const maxPossibleRoomScore = roomKeys.length * 15;
    roomScoreAvg = (totalRoomScore / maxPossibleRoomScore) * 100;
  }


  // Weighted IBBH: 40% Room-specific evaluations, 30% Emotional/Personal, 15% Physical/IEQ, 15% Order/Biofilia
  // Simpler and extremely coherent representation:
  // 30% Rooms, 30% Emotional, 15% Physical, 15% Order/Circulation, 10% Biofilia
  const emotionalPct = (emotionalSum / 10) * 100;
  const physicalPct = (physicalSum / 10) * 100;
  const orderPct = (orderSum / 10) * 100;
  const bioPct = (bioSum / 10) * 100;

  const finalIbbh = Math.round(
    roomScoreAvg * 0.30 +
    emotionalPct * 0.30 +
    physicalPct * 0.15 +
    orderPct * 0.15 +
    bioPct * 0.10
  );

  return Math.min(100, Math.max(10, finalIbbh));
}

// ── Status from Score ────────────────────────────────────────
export function getIbbhStatus(score: number): IbbhStatus {
  if (score >= 90) return 'regenerativo';
  if (score >= 75) return 'saludable';
  if (score >= 60) return 'funcional';
  if (score >= 40) return 'vulnerable';
  return 'exigente';
}

export interface StatusConfig {
  label: string;
  message: string;
  colorClass: string;
  badgeClass: string;
}

export function getStatusConfig(status: IbbhStatus): StatusConfig {
  const map: Record<IbbhStatus, StatusConfig> = {
    regenerativo: {
      label: 'Hábitat Regenerativo',
      message: 'Tu hogar es un aliado activo que favorece y potencia tu bienestar.',
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    },
    saludable: {
      label: 'Hábitat Saludable',
      message: 'Tu hogar responde adecuadamente y te acompaña en tu vida cotidiana.',
      colorClass: 'text-bianchi-sage',
      badgeClass: 'bg-green-50 border-green-300 text-green-700',
    },
    funcional: {
      label: 'Hábitat Funcional',
      message: 'Tu hogar tiene bases sólidas. Con algunos ajustes específicos, puede ayudarte a vivir mejor.',
      colorClass: 'text-amber-700',
      badgeClass: 'bg-amber-50 border-amber-300 text-amber-700',
    },
    vulnerable: {
      label: 'Hábitat en Transición',
      message: 'Tu casa está en un proceso de cambio. Algunos ambientes te piden más energía de la que te devuelven, pero eso tiene solución. Con pequeños ajustes, este espacio puede empezar a cuidarte de verdad.',
      colorClass: 'text-bianchi-terra',
      badgeClass: 'bg-red-50 border-red-300 text-red-700',
    },
    exigente: {
      label: 'Hábitat Exigente',
      message: 'Tu casa actualmente te está pidiendo un esfuerzo extra en el día a día. Pero no te preocupes: tu hogar no está siendo juzgado, sino comprendido. Toda vivienda tiene un enorme potencial para mejorar su capacidad de cuidarte.',
      colorClass: 'text-red-800',
      badgeClass: 'bg-red-100 border-red-400 text-red-800',
    },
  };
  return map[status];
}

// ── Dimension Scores from Form ───────────────────────────────
export function calculateDimensions(rawForm: WizardFormData): DimensionScores {
  const form = preprocessForm(rawForm);
  // Extract room averages
  const roomKeys = Object.keys(form.roomEvaluations);
  let avgRoomFeel = 3;
  let avgRoomLight = 3;
  let avgRoomOrder = 3;

  if (roomKeys.length > 0) {
    const sum = roomKeys.reduce((acc, r) => {
      const e = getNumericRoomEval(form.roomEvaluations[r]);
      return { feel: acc.feel + e.feel, light: acc.light + e.light, order: acc.order + e.order };
    }, { feel: 0, light: 0, order: 0 });
    avgRoomFeel = sum.feel / roomKeys.length;
    avgRoomLight = sum.light / roomKeys.length;
    avgRoomOrder = sum.order / roomKeys.length;
  }

  const identity = form.slideEmotional1 * 20;
  const regulacion = Math.round((form.slideEmotional2 * 10 + avgRoomFeel * 10)); // max 100
  const calidad = Math.round((form.slidePhys1 * 10 + avgRoomLight * 10)); // max 100
  const orden = Math.round((form.slideOrd1 * 10 + avgRoomOrder * 10)); // max 100
  const biofilia = (form.slideBio1 + form.slideBio2) * 10; // max 100

  // Sleep is specifically dependent on Bedroom feel, light, order if selected
  let descanso = Math.round((form.slidePhys2 * 10 + form.slideEmotional2 * 10) / 2);
  if (form.roomEvaluations['Dormitorio Principal']) {
    const bed = getNumericRoomEval(form.roomEvaluations['Dormitorio Principal']);
    descanso = Math.round(((bed.feel + bed.light + bed.order) / 15) * 100);
  }

  const funcionalidad = Math.round((calidad + orden) / 2);
  const vinculos = Math.round((identity + regulacion) / 2);

  const clampVal = (val: number) => Math.min(100, Math.max(10, Math.round(val)));

  return {
    'Identidad y Pertenencia': clampVal(identity),
    'Regulación emocional': clampVal(regulacion),
    'Calidad Ambiental': clampVal(calidad),
    'Orden': clampVal(orden),
    'Biofilia': clampVal(biofilia),
    'Descanso': clampVal(descanso),
    'Funcionalidad': clampVal(funcionalidad),
    'Vínculos': clampVal(vinculos),
  };
}

// ── Personalized Narrative ───────────────────────────────────────
// Note: impactPercent in action items is displayed as "podría contribuir hasta X%"
// to avoid deterministic claims. See ResultsScreen.tsx for display logic.
export function generateNarrative(form: WizardFormData): string {
  const firstName = form.name.split(' ')[0] || 'vos';
  const feeling = form.desiredFeeling
    ? `Querés sentir ${form.desiredFeeling.toLowerCase()}`
    : 'Buscás un espacio que te cuide';

  const narrativeMap: Record<string, string> = {
    Separacion: `${firstName}, tu casa hoy tiene una tarea muy concreta: ser tu refugio. ${feeling}. No siempre es fácil habitar un espacio en el que todo está cambiando, pero los ambientes que te rodean pueden ayudarte mucho más de lo que creés. Vamos a ver juntos dónde están las fricciones y cómo resolverlas.`,
    Duelo: `${firstName}, en momentos de pérdida el espacio que habitamos puede contenernos o puede pesarnos. ${feeling}. Tu casa puede ser un lugar de calma real. Miremos qué está sumando y qué está restando energía sin que te des cuenta.`,
    Mudanza: `${firstName}, un lugar nuevo tarda un tiempo en sentirse como propio. ${feeling}. Este diagnóstico te ayuda a entender qué ajustes necesitás para que tu casa empiece a cuidarte de verdad, no solo a funcionar.`,
    NuevaEtapa: `${firstName}, cuando la vida cambia, el espacio también necesita actualizarse. ${feeling}. Tu hogar tiene que acompañar quién sos ahora, no reflejar quién eras. Empecemos por ahí.`,
    Ninguno: `${firstName}, a veces las incomodidades del hogar son tan sutiles que las terminamos naturalizando. ${feeling}. Este diagnóstico está diseñado para revelar, con cuidado, cómo tu espacio actual impacta en tu energía y descanso cotidiano.`,
  };

  return narrativeMap[form.transition] ??
    `${firstName}, tu hogar es mucho más que un espacio físico. Es el sistema silencioso que regula cómo dormís, cómo te regulás y cómo salís al mundo cada día. Miremos juntos qué está pasando en cada ambiente.`;
}

// ── Dynamic Contextual Action Recommendations Engine ────────
interface RecommendationTemplate {
  room: string;
  timeframe: ActionTimeframe;
  title: string;
  description: string;
  estimatedMinutes: number;
  expectedImpact: string[];
  impactPercent: number;
  onlyFor?: 'Propio' | 'Alquiler';
  excludeFor?: 'Propio' | 'Alquiler';
  lowBudgetOnly?: boolean;
}

const ACTION_DATABASE: RecommendationTemplate[] = [
  // Entrada
  {
    room: 'Entrada',
    timeframe: 'today',
    title: 'Despejá la superficie de entrada',
    description: 'Retirá abrigos, carteras y llaves acumuladas. Generá un umbral limpio al ingresar.',
    estimatedMinutes: 10,
    expectedImpact: ['Reducción de alerta al entrar', 'Descompresión visual inmediata'],
    impactPercent: 6,
  },
  {
    room: 'Entrada',
    timeframe: 'week',
    title: 'Establecé una bandeja de descarga',
    description: 'Colocá un contenedor de madera natural o mimbre para las llaves y elementos del bolsillo.',
    estimatedMinutes: 20,
    expectedImpact: ['Orden mental al llegar', 'Fricción reducida al salir'],
    impactPercent: 7,
  },
  {
    room: 'Entrada',
    timeframe: 'month',
    title: 'Iluminación cálida indirecta',
    description: 'Agrega un velador de mesa con luz cálida (2700K) en el recibidor en vez de usar luz cenital fría.',
    estimatedMinutes: 30,
    expectedImpact: ['Transición lumínica confortable', 'Sensación de bienvenida'],
    impactPercent: 9,
  },
  {
    room: 'Entrada',
    timeframe: 'project',
    title: 'Mueble zapatero empotrado',
    description: 'Instalá un mueble cerrado a medida para calzado, abrigos y bolsos.',
    estimatedMinutes: 240,
    expectedImpact: ['Ocultamiento total del desorden', 'Higiene del hábitat'],
    onlyFor: 'Propio',
    impactPercent: 12,
  },
  {
    room: 'Entrada',
    timeframe: 'project',
    title: 'Estante flotante y cesto organizador',
    description: 'Colocá un estante flotante de melamina y un cesto de yute en el suelo para tus zapatos sin obra.',
    estimatedMinutes: 60,
    expectedImpact: ['Orden portátil', 'Flexibilidad habitacional'],
    onlyFor: 'Alquiler',
    impactPercent: 10,
  },

  // Living
  {
    room: 'Living',
    timeframe: 'today',
    title: 'Despejá la mesa ratona',
    description: 'Retirá tazas, papeles y controles remotos. Dejá únicamente un libro o una vela aromática.',
    estimatedMinutes: 10,
    expectedImpact: ['Calma visual', 'Reducción de cortisol'],
    impactPercent: 5,
  },
  {
    room: 'Living',
    timeframe: 'week',
    title: 'Reorientación del sofá principal',
    description: 'Girás la disposición del sillón para que su visual apunte hacia la luz natural de la ventana, no a la televisión.',
    estimatedMinutes: 45,
    expectedImpact: ['Aprovechamiento de luz natural', 'Mayor interacción social'],
    impactPercent: 8,
  },
  {
    room: 'Living',
    timeframe: 'month',
    title: 'Incorporación de alfombra natural',
    description: 'Sumá una alfombra grande de algodón o yute para mejorar la acústica y el confort táctil.',
    estimatedMinutes: 60,
    expectedImpact: ['Aislamiento de reverberación acústica', 'Enraizamiento sensorial'],
    impactPercent: 9,
  },
  {
    room: 'Living',
    timeframe: 'project',
    title: 'Aberturas de doble vidriado (DVH)',
    description: 'Cambiá la carpintería existente por aberturas de doble vidriado térmico para aislar el ruido exterior.',
    estimatedMinutes: 300,
    expectedImpact: ['Confort térmico total', 'Aislamiento del ruido de calle'],
    onlyFor: 'Propio',
    impactPercent: 15,
  },
  {
    room: 'Living',
    timeframe: 'project',
    title: 'Cortinas dobles de lino grueso',
    description: 'Colocá cortinados gruesos sobre rieles portátiles para absorber los rebotes de ondas de sonido sin obra.',
    estimatedMinutes: 90,
    expectedImpact: ['Mitigación acústica económica', 'Calidez estética'],
    onlyFor: 'Alquiler',
    impactPercent: 11,
  },

  // Cocina
  {
    room: 'Cocina',
    timeframe: 'today',
    title: 'Ocultá electrodomésticos en alacenas',
    description: 'Guardá licuadora y tostadora si no las usás a diario para liberar el plano de trabajo.',
    estimatedMinutes: 15,
    expectedImpact: ['Mayor espacio libre', 'Disminución del cansancio mental'],
    impactPercent: 6,
  },
  {
    room: 'Cocina',
    timeframe: 'week',
    title: 'Organización del sector de cocción',
    description: 'Disponé aceites y especies sobre una bandeja de madera limpia cerca de las hornallas.',
    estimatedMinutes: 30,
    expectedImpact: ['Fricción reducida al cocinar', 'Orden del área'],
    impactPercent: 6,
  },
  {
    room: 'Cocina',
    timeframe: 'month',
    title: 'Iluminación LED cálida bajo alacena',
    description: 'Instalá tiras LED cálidas adhesivas autoinstalables bajo los muebles altos para alumbrar la mesada.',
    estimatedMinutes: 40,
    expectedImpact: ['Confort visual directo', 'Mejor definición lumínica'],
    impactPercent: 8,
  },
  {
    room: 'Cocina',
    timeframe: 'project',
    title: 'Remodelación de revestimiento y extractor',
    description: 'Cambiá azulejos antiguos por cerámicos claros y renová el extractor para mejorar la calidad del aire.',
    estimatedMinutes: 360,
    expectedImpact: ['Higiene ambiental', 'Renovación de aire excelente'],
    onlyFor: 'Propio',
    impactPercent: 12,
  },
  {
    room: 'Cocina',
    timeframe: 'project',
    title: 'Vinilo lavable y estantes flotantes',
    description: 'Aplicá vinilo lavable autoadhesivo e instalá barrales colgantes de metal sin romper paredes.',
    estimatedMinutes: 120,
    expectedImpact: ['Actualización de identidad', 'Orden visual económico'],
    onlyFor: 'Alquiler',
    impactPercent: 9,
  },

  // Dormitorio Principal
  {
    room: 'Dormitorio Principal',
    timeframe: 'today',
    title: 'Retirá cargadores de la mesita de luz',
    description: 'Evitá cables a la vista al lado de tu cama. Cargá tus dispositivos fuera del dormitorio.',
    estimatedMinutes: 10,
    expectedImpact: ['Higiene del sueño', 'Menor carga mental'],
    impactPercent: 8,
  },
  {
    room: 'Dormitorio Principal',
    timeframe: 'week',
    title: 'Despejá la visual desde la cama',
    description: 'Reordená o guardá objetos desordenados que queden en tu línea visual directa al acostarte.',
    estimatedMinutes: 20,
    expectedImpact: ['Calma antes de dormir', 'Facilidad de relajación'],
    impactPercent: 8,
  },
  {
    room: 'Dormitorio Principal',
    timeframe: 'month',
    title: 'Instalación de cortinas blackout',
    description: 'Asegurá oscuridad total nocturna para maximizar la producción natural de melatonina.',
    estimatedMinutes: 50,
    expectedImpact: ['Sueño más profundo', 'Protección lumínica'],
    impactPercent: 12,
  },
  {
    room: 'Dormitorio Principal',
    timeframe: 'project',
    title: 'Diseño integral de vestidor cerrado',
    description: 'Reemplazá el perchero abierto por un placard a medida con puertas de madera que oculten la ropa.',
    estimatedMinutes: 300,
    expectedImpact: ['Descompresión visual total', 'Orden permanente'],
    onlyFor: 'Propio',
    impactPercent: 14,
  },
  {
    room: 'Dormitorio Principal',
    timeframe: 'project',
    title: 'Organizadores colgantes textiles',
    description: 'Instalá estantes de tela colgantes dentro de placares y organizá los percheros con perchas idénticas.',
    estimatedMinutes: 90,
    expectedImpact: ['Orden interior accesible', 'Organización de vestuario'],
    onlyFor: 'Alquiler',
    impactPercent: 10,
  },

  // Baño
  {
    room: 'Baño',
    timeframe: 'today',
    title: 'Despejá el plano del espejo',
    description: 'Guardá cepillos, frascos y maquillaje dentro de cajoneras o neceseres cerrados.',
    estimatedMinutes: 10,
    expectedImpact: ['Amplitud espacial percibida', 'Higiene visual'],
    impactPercent: 5,
  },
  {
    room: 'Baño',
    timeframe: 'week',
    title: 'Incorporación de plantas de humedad',
    description: 'Colocá un helecho o una hiedra que absorban vapor y purifiquen el aire.',
    estimatedMinutes: 15,
    expectedImpact: ['Conexión biofílica', 'Reducción de humedad del aire'],
    impactPercent: 7,
  },
  {
    room: 'Baño',
    timeframe: 'month',
    title: 'Espejo retroiluminado cálido',
    description: 'Cambiá la bombilla fluorescente fría del techo por luz LED cálida integrada tras el espejo.',
    estimatedMinutes: 60,
    expectedImpact: ['Luz difusa relajante', 'Cuidado de la vista nocturna'],
    impactPercent: 9,
  },
  {
    room: 'Baño',
    timeframe: 'project',
    title: 'Obra de impermeabilización y ventilación activa',
    description: 'Rehacé la impermeabilización de los muros húmedos e instalá extractor de ducto forzado.',
    estimatedMinutes: 240,
    expectedImpact: ['Sanidad ambiental', 'Humedades eliminadas'],
    onlyFor: 'Propio',
    impactPercent: 12,
  },
  {
    room: 'Baño',
    timeframe: 'project',
    title: 'Renovación textil y organizador adhesivo',
    description: 'Cambiá la cortina por lino impermeable y colocá repisas adhesivas de acero sin perforar cerámicos.',
    estimatedMinutes: 45,
    expectedImpact: ['Mejora de materialidad', 'Organización rápida sin roturas'],
    onlyFor: 'Alquiler',
    impactPercent: 9,
  },

  // Escritorio
  {
    room: 'Escritorio',
    timeframe: 'today',
    title: 'Rutina de escritorio despejado',
    description: 'Despejá cuadernos, papeles y tazas al finalizar tu jornada de trabajo para separar el día de tu noche.',
    estimatedMinutes: 5,
    expectedImpact: ['Desconexión mental', 'Reducción del estrés laboral'],
    impactPercent: 7,
  },
  {
    room: 'Escritorio',
    timeframe: 'week',
    title: 'Ajuste de escritorio perpendicular',
    description: 'Mové tu escritorio para que quede a 90 grados de la ventana, aprovechando luz natural sin reflejos en monitor.',
    estimatedMinutes: 30,
    expectedImpact: ['Ergonomía visual', 'Aprovechamiento lumínico natural'],
    impactPercent: 8,
  },
  {
    room: 'Escritorio',
    timeframe: 'month',
    title: 'Silla ergonómica de alto soporte',
    description: 'Sustituye la silla de comedor auxiliar por una silla corporativa ergonómica regulable.',
    estimatedMinutes: 45,
    expectedImpact: ['Confort corporal', 'Aumento de foco laboral'],
    impactPercent: 10,
  },
  {
    room: 'Escritorio',
    timeframe: 'project',
    title: 'Muebles de archivo empotrados',
    description: 'Diseñá e instalá estanterías de pared a medida para ordenar carpetas y libros pesados.',
    estimatedMinutes: 180,
    expectedImpact: ['Liberación de paso', 'Organización masiva permanente'],
    onlyFor: 'Propio',
    impactPercent: 13,
  },
  {
    room: 'Escritorio',
    timeframe: 'project',
    title: 'Cajonera de rodillos y corcho de yute',
    description: 'Colocá una cajonera móvil bajo mesa y un panel organizador de yute/corcho para colgar notas.',
    estimatedMinutes: 45,
    expectedImpact: ['Organización modular', 'Estética cálida portable'],
    onlyFor: 'Alquiler',
    impactPercent: 9,
  },

  // Patio / Balcón
  {
    room: 'Patio / Balcón',
    timeframe: 'today',
    title: 'Poda de mantenimiento de verde',
    description: 'Retirá ramas secas y limpiá macetas del balcón para activar el flujo visual del verde.',
    estimatedMinutes: 10,
    expectedImpact: ['Estética de vitalidad', 'Calma mental inmediata'],
    impactPercent: 5,
  },
  {
    room: 'Patio / Balcón',
    timeframe: 'week',
    title: 'Instalación de almohadón exterior',
    description: 'Sumá un almohadón cómodo resistente a la intemperie sobre un asiento de madera natural.',
    estimatedMinutes: 15,
    expectedImpact: ['Llamado a la pausa exterior', 'Sensación de refugio'],
    impactPercent: 7,
  },
  {
    room: 'Patio / Balcón',
    timeframe: 'month',
    title: 'Guirnalda lumínica en riel exterior',
    description: 'Colocá guirnaldas de luz cálida difusa para dar calidez y ambientar salidas al exterior en noches templadas.',
    estimatedMinutes: 45,
    expectedImpact: ['Ampliación visual del hogar', 'Identidad acogedora'],
    impactPercent: 9,
  },
  {
    room: 'Patio / Balcón',
    timeframe: 'project',
    title: 'Deck de madera y sistema de riego',
    description: 'Colocá baldosas encastrables de deck de madera tratada y automatizá el riego por goteo.',
    estimatedMinutes: 240,
    expectedImpact: ['Oasis natural pleno', 'Confort táctil del suelo'],
    onlyFor: 'Propio',
    impactPercent: 14,
  },
  {
    room: 'Patio / Balcón',
    timeframe: 'project',
    title: 'Maceteros en fila y alfombra yute',
    description: 'Creá un cerco verde móvil de maceteros plásticos ligeros y colocá alfombra apta exterior.',
    estimatedMinutes: 90,
    expectedImpact: ['Privacidad biofílica sin obra', 'Decoración modular'],
    onlyFor: 'Alquiler',
    impactPercent: 11,
  },
];

export function generateActionItems(form: WizardFormData): ActionItem[] {
  const selected = form.selectedRooms;
  const isRenting = form.housingStatus === 'Alquiler';
  
  // Filter ACTION_DATABASE using selected rooms and rental status
  const matched = ACTION_DATABASE.filter((rec) => {
    // 1. Capa 1 & 2: Room matches
    if (!selected.includes(rec.room)) return false;

    // 2. Capa 5: Restricción del tipo de vivienda
    if (isRenting && rec.onlyFor === 'Propio') return false;
    if (!isRenting && rec.onlyFor === 'Alquiler') return false;

    return true;
  });

  // Map RecommendationTemplate items to ActionItem types
  const items: ActionItem[] = matched.map((rec) => {
    return {
      id: `${rec.room}-${rec.timeframe}-${Math.random().toString(36).substr(2, 5)}`,
      room: rec.room === 'Entrada' ? 'Entrada / Hall' : rec.room,
      title: rec.title,
      description: rec.description,
      timeframe: rec.timeframe,
      estimatedMinutes: rec.estimatedMinutes,
      expectedImpact: rec.expectedImpact,
      impactPercent: rec.impactPercent,
      isKeyAction: false,
    };
  });

  // Find lowest-scoring room to set key action
  let lowestRoom = 'Dormitorio Principal';
  let minScore = 100;
  Object.keys(form.roomEvaluations).forEach((room) => {
    const e = getNumericRoomEval(form.roomEvaluations[room]);
    const s = e.feel + e.light + e.order;
    if (s < minScore) {
      minScore = s;
      lowestRoom = room;
    }
  });

  // Mark first action in the lowest scoring room (or fallback first action) as Key Action
  const lowestRoomLabel = lowestRoom === 'Entrada' ? 'Entrada / Hall' : lowestRoom;
  const keyActionCandidate = items.find((item) => item.room === lowestRoomLabel && item.timeframe === 'week') 
    || items.find((item) => item.timeframe === 'week')
    || items[0];
    
  if (keyActionCandidate) {
    keyActionCandidate.isKeyAction = true;
  }

  return items;
}

// ── Build Full Client from Form ──────────────────────────────
export function buildClientFromForm(rawForm: WizardFormData): BianchClient {
  const form = preprocessForm(rawForm);
  const ibbh = calculateIbbh(form);
  const status = getIbbhStatus(ibbh);
  const dimensions = calculateDimensions(form);
  const narrativeText = generateNarrative(form);
  const actionItems = generateActionItems(form);

  return {
    id: `user-${Date.now()}`,
    name: form.name || 'Invitado Bianchi',
    age: form.age ? parseInt(form.age) : 35,
    city: form.city || 'Buenos Aires',
    housingType: form.housingStatus,
    squareMeters: 75,
    occupants: 2,
    hoursAtHome: form.hoursAtHome,
    transition: form.transition,
    hasPets: form.hasPets,
    desiredFeeling: form.desiredFeeling,
    selectedRooms: form.selectedRooms.length > 0 ? form.selectedRooms : ['Entrada', 'Living', 'Cocina', 'Dormitorio Principal', 'Baño', 'Escritorio', 'Patio / Balcón'],
    photos: (form.selectedRooms.length > 0 ? form.selectedRooms : ['Entrada', 'Living', 'Cocina', 'Dormitorio Principal', 'Baño', 'Escritorio', 'Patio / Balcón']).map((room, idx) => {
      const files = form.photoFiles[room] || [];
      const file = files[0];
      let url = '/bianchi_interior.png';
      if (file) {
        try {
          url = URL.createObjectURL(file);
        } catch (e) {
          console.error('Error creating object URL for photo preview', e);
        }
      }
      return {
        id: `photo-${idx}-${Date.now()}`,
        room,
        url,
        pins: [],
      };
    }),
    dimensions,
    ibbh,
    status,
    narrativeText,
    hypotheses: [
      {
        id: 'hyp-1',
        title: 'Refugio de Calma',
        description: `El dormitorio principal muestra signos de sobrecarga visual. Al cambiar la iluminación y cables, facilitás que el cerebro de ${form.name.split(' ')[0]} regule la melatonina.`,
        confidence: 85,
        approved: null,
        fromAi: true,
      },
      {
        id: 'hyp-2',
        title: 'Descompresión de Ingreso',
        description: 'La Entrada presenta baja ordenación. Agregar un zapatero y vaciabolsillos reducirá la activación simpática al cruzar el umbral del hogar.',
        confidence: 78,
        approved: null,
        fromAi: true,
      },
    ],
    actionItems,
    createdAt: new Date().toISOString(),
  };
}

// ── AI VISION STUBS ──────────────────────────────────────────
export async function analyzeRoomPhoto(_photoFile: File, _roomName: string) {
  console.log('[AI STUB] analyzeRoomPhoto called');
  return null;
}

export async function generateAiNarrative(_form: WizardFormData, _aiAnalyses: unknown[]) {
  console.log('[AI STUB] generateAiNarrative called');
  return null;
}
