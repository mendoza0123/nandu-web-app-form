import type { InterviewRole, Question } from '@/lib/types';

// Source: All_Questions_list/LD_Brain_NanduBhai_SelfFillForm.pdf (v3)
// 50 questions across 8 sections + 1 closing reflection. Designed for
// Nandu to fill at his own pace — 8 sessions of 15-20 min each.
//
// All MCQs are 'checkbox' (multi-select) per Nandu's preference: factory
// reality is rarely "exactly one of A/B/C/D" — he can tick everything that
// applies and add free-text notes in the "अन्य / Notes" textarea.
const nandu: Question[] = [
  // ─────────────────────────────────────────────
  // भाग 1 — दैनिक कामकाज (Daily Work)
  // ─────────────────────────────────────────────
  {
    id: 'Q1',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Subah factory aane ke baad aap sabse pehle kya karte hain?',
    promptHi: 'सुबह factory आने के बाद आप सबसे पहले क्या करते हैं?',
    type: 'checkbox',
    options: [
      'A. Machine warm-up check (printhead nozzle test)',
      'B. Pichle din ke pending orders dekhna',
      'C. Us din ka production schedule dekhna',
      'D. Staff ki haazri aur shift assignment',
    ],
    optionsHi: [
      'A. Machine warm-up check (printhead nozzle test)',
      'B. पिछले दिन के pending orders देखना',
      'C. उस दिन का production schedule देखना',
      'D. Staff की हाजरी और shift assignment',
    ],
    allowNotes: true,
  },
  {
    id: 'Q2',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Koi morning checklist jo aap mann mein follow karte hain — jo kahin likhi nahi hai?',
    promptHi: 'क्या आपकी कोई morning checklist है जो आप मन में follow करते हैं — जो कहीं लिखी नहीं है?',
    type: 'textarea',
  },
  {
    id: 'Q3',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Ek job complete hone ke baad kaun-kaun se steps hote hain? (Sab par tick karein)',
    promptHi: 'एक job complete होने के बाद कौन-कौन से steps होते हैं? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Challan se fabric receive + meter count verify',
      'B. Design file ki setup — width alignment (36 / 58 / 64 / 72")',
      'C. Korean paper chunna (width + GSM)',
      'D. Printing machine par job chalana',
      'E. Fusing machine mein transfer (mandatory)',
      'F. Calendering (optional)',
      'G. KATA — roll-by-roll measurement + visual inspection',
      'H. KATA Certificate dena',
    ],
    optionsHi: [
      'A. Challan से fabric receive + meter count verify',
      'B. Design file की setup — width alignment (36 / 58 / 64 / 72")',
      'C. Korean paper चुनना (width + GSM)',
      'D. Printing machine पर job चलाना',
      'E. Fusing machine में transfer (ज़रूरी / mandatory)',
      'F. Calendering (optional)',
      'G. KATA — roll-by-roll measurement + visual inspection',
      'H. KATA Certificate देना',
    ],
    allowNotes: true,
  },
  {
    id: 'Q4',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Ek normal order — fabric receive se dispatch tak — kitna samay lagta hai?',
    promptHi: 'एक normal order — fabric receive से dispatch तक — कितना समय लगता है?',
    type: 'checkbox',
    options: [
      'A. Usi din (urgent jobs ke liye)',
      'B. 1-2 din',
      'C. 3-4 din',
      'D. 5-7 din',
    ],
    optionsHi: [
      'A. उसी दिन (urgent jobs के लिए)',
      'B. 1-2 दिन',
      'C. 3-4 दिन',
      'D. 5-7 दिन',
    ],
    allowNotes: true,
  },
  {
    id: 'Q5',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Order mein delay hone ke mukhya kaaran kya hain? (Sab par tick karein)',
    promptHi: 'Order में delay होने के मुख्य कारण क्या हैं? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Fabric quality mein dikkat (polyester % kam hona)',
      'B. Design file galat ya adhoori aana',
      'C. Korean paper ka size match nahi karna',
      'D. Delta-E colour drift — production hold',
      'E. Fusing machine ki maintenance',
      'F. KATA mein shortage nikalna',
      'G. Customer se sample approval der se aana',
    ],
    optionsHi: [
      'A. Fabric quality में दिक्कत (polyester % कम होना)',
      'B. Design file गलत या अधूरी आना',
      'C. Korean paper का size match नहीं करना',
      'D. Delta-E colour drift — production hold',
      'E. Fusing machine की maintenance',
      'F. KATA में shortage निकलना',
      'G. Customer से sample approval देर से आना',
    ],
    allowNotes: true,
  },
  {
    id: 'Q6',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Quality hold kab karte hain? (Sab par tick karein)',
    promptHi: 'Quality hold कब करते हैं? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Delta-E value 5 se upar jaaye',
      'B. Banding dikhe (horizontal dhariyaan)',
      'C. Ghosting dikhe (double image — fabric shift)',
      'D. Colour drift — ek roll se doosre roll mein farq',
      'E. Fading edges (uneven press pressure)',
      'F. Print ki sharpness kam lage (DPI / temperature ki dikkat)',
    ],
    optionsHi: [
      'A. Delta-E value 5 से ऊपर जाए',
      'B. Banding दिखे (horizontal धारियाँ)',
      'C. Ghosting दिखे (double image — fabric shift)',
      'D. Colour drift — एक roll से दूसरे roll में फर्क',
      'E. Fading edges (uneven press pressure)',
      'F. Print की sharpness कम लगे (DPI / temperature की दिक्कत)',
    ],
    allowNotes: true,
  },
  {
    id: 'Q7',
    section: 'Sec 1: Daily Work',
    sectionHi: 'भाग 1: दैनिक कामकाज',
    prompt: 'Quality check ka koi tareeka hai jo aap mann mein karte hain — jo kahin likha nahi hai?',
    promptHi: 'Quality check का कोई तरीका है जो आप मन में करते हैं — जो कहीं लिखा नहीं है?',
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // भाग 2 — मशीन और रखरखाव (Machines and Maintenance)
  // ─────────────────────────────────────────────
  {
    id: 'Q8',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'Humare paas abhi kaun-kaun si chalu (active) printing machines hain? (Sab par tick karein)',
    promptHi: 'हमारे पास अभी कौन-कौन सी चालू (active) printing machines हैं? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. PANTONE L1916 (16-head) Machine 1',
      'B. PANTONE L1916 (16-head) Machine 2',
      'C. PANTONE L1912 (12-head) Machine',
      'D. PANTONE XENON (8-head) Unit 1',
      'E. PANTONE XENON (8-head) Unit 2',
    ],
    optionsHi: [
      'A. PANTONE L1916 (16-head) Machine 1',
      'B. PANTONE L1916 (16-head) Machine 2',
      'C. PANTONE L1912 (12-head) Machine',
      'D. PANTONE XENON (8-head) Unit 1',
      'E. PANTONE XENON (8-head) Unit 2',
    ],
    allowNotes: true,
  },
  {
    id: 'Q9',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: '5 idle machines (3-head, puraani) — kab chalu karni chahiye? Kis situation mein?',
    promptHi: '5 idle machines (3-head, पुरानी) — कब चालू करनी चाहिए? किस situation में?',
    type: 'textarea',
  },
  {
    id: 'Q10',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'Daily machine maintenance mein kya-kya hota hai? (Sab par tick karein)',
    promptHi: 'Daily machine maintenance में क्या-क्या होता है? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Printhead nozzle test print',
      'B. Ink system flush (colour change par)',
      'C. Paper feed tension check',
      'D. Printhead height adjust (fabric ki motai ke hisaab se)',
      'E. Temperature aur speed ki calibration verify',
      'F. Belt aur roller ko saaf karna',
    ],
    optionsHi: [
      'A. Printhead nozzle test print',
      'B. Ink system flush (colour change पर)',
      'C. Paper feed tension check',
      'D. Printhead height adjust (fabric की मोटाई के हिसाब से)',
      'E. Temperature और speed की calibration verify',
      'F. Belt और roller को साफ करना',
    ],
    allowNotes: true,
  },
  {
    id: 'Q11',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'Printhead repair ya badalne ka samay kab aata hai? Kaun se signs dekhkar pata chalta hai?',
    promptHi: 'Printhead repair या बदलने का समय कब आता है? कौन से signs देखकर पता चलता है?',
    type: 'textarea',
  },
  {
    id: 'Q12',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'Fusing machine FM-01 ya FM-02 — kaun sa job kis machine par jaata hai?',
    promptHi: 'Fusing machine FM-01 या FM-02 — कौन सा job किस machine पर जाता है?',
    type: 'checkbox',
    options: [
      'A. FM-02 (14,000 meter/din) — bade orders ke liye',
      'B. FM-01 (5,000 meter/din) — chhote ya urgent jobs ke liye',
      'C. Jo machine us samay khali ho use use karte hain',
      'D. Koi pakka niyam nahi',
    ],
    optionsHi: [
      'A. FM-02 (14,000 मीटर/दिन) — बड़े orders के लिए',
      'B. FM-01 (5,000 मीटर/दिन) — छोटे या urgent jobs के लिए',
      'C. जो machine उस समय खाली हो उसे use करते हैं',
      'D. कोई पक्का नियम नहीं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q13',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'Fusing temperature aur speed — fabric type ke hisaab se kaise set karte hain? (185-230°C ke beech — aap actually kya rakhte hain)',
    promptHi: 'Fusing temperature और speed — fabric type के हिसाब से कैसे set करते हैं? (185–230°C के बीच — आप actually क्या रखते हैं)',
    type: 'textarea',
    help: 'Har fabric ke liye likhein — Nokia 58" / Satin Slub / Heavy (Scuba, Blackout) / Light (Georgette) / Waffle Lycra / Blackout 54 / Doosra. Format: Fabric — Temp (°C) — Speed (m/hr) — Notes',
  },
  {
    id: 'Q14',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'Aise spare parts jo hamesha stock mein rakhne chahiye? (Sab par tick karein)',
    promptHi: 'ऐसे spare parts जो हमेशा stock में रखने चाहिए? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Printhead (PANTONE ke compatible)',
      'B. Ink pump aur tubing (printing machine ke)',
      'C. Heating elements (fusing machine ke)',
      'D. Paper core holders',
      'E. Electrical fuses aur circuit parts',
      'F. Belt / rollers (calendar aur fusing ke)',
    ],
    optionsHi: [
      'A. Printhead (PANTONE के compatible)',
      'B. Ink pump और tubing (printing machine के)',
      'C. Heating elements (fusing machine के)',
      'D. Paper core holders',
      'E. Electrical fuses और circuit parts',
      'F. Belt / rollers (calendar और fusing के)',
    ],
    allowNotes: true,
  },
  {
    id: 'Q15',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'PANTONE machine ke parts kahan se milte hain? Supplier ka naam aur number?',
    promptHi: 'PANTONE machine के parts कहाँ से मिलते हैं? Supplier का नाम और number?',
    type: 'textarea',
    help: 'Supplier ka naam · Contact person · Phone/WhatsApp · Lead time (order se delivery) · Notes',
  },
  {
    id: 'Q16',
    section: 'Sec 2: Machines and Maintenance',
    sectionHi: 'भाग 2: मशीन और रखरखाव',
    prompt: 'MDO ko machine kaise assign karte hain?',
    promptHi: 'MDO को machine कैसे assign करते हैं?',
    type: 'checkbox',
    options: [
      'A. Har MDO ki ek fixed machine hoti hai',
      'B. Jo available ho use jahan zaroorat ho wahan lagate hain',
      'C. MDO ki training aur certification dekhkar',
      'D. Job ki difficulty dekhkar',
    ],
    optionsHi: [
      'A. हर MDO की एक fixed machine होती है',
      'B. जो available हो उसे जहाँ ज़रूरत हो वहाँ लगाते हैं',
      'C. MDO की training और certification देखकर',
      'D. Job की difficulty देखकर',
    ],
    allowNotes: true,
  },

  // ─────────────────────────────────────────────
  // भाग 3 — Fusing और Defects की पहचान (Fusing and Defects)
  // ─────────────────────────────────────────────
  {
    id: 'Q17',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Nokia 58" ke liye fusing temperature kitna rakhte hain?',
    promptHi: 'Nokia 58" के लिए fusing temperature कितना रखते हैं?',
    type: 'checkbox',
    options: [
      'A. 185-190°C',
      'B. 195-205°C',
      'C. 210-220°C',
      'D. 225-230°C',
    ],
    optionsHi: [
      'A. 185–190°C',
      'B. 195–205°C',
      'C. 210–220°C',
      'D. 225–230°C',
    ],
    allowNotes: true,
    help: 'Exact value Notes mein likh sakte hain',
  },
  {
    id: 'Q18',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Satin Slub ke liye Nokia 58" se compare karein to temperature?',
    promptHi: 'Satin Slub के लिए Nokia 58" से compare करें तो temperature?',
    type: 'checkbox',
    options: [
      'A. Nokia se zyada rakhte hain — Satin bhaari (heavy) hai',
      'B. Nokia se kam rakhte hain — Satin naazuk (delicate) hai',
      'C. Ek jaisa (same) temperature rakhte hain',
      'D. Temperature same rakhte hain lekin speed kam kar dete hain',
    ],
    optionsHi: [
      'A. Nokia से ज़्यादा रखते हैं — Satin भारी (heavy) है',
      'B. Nokia से कम रखते हैं — Satin नाज़ुक (delicate) है',
      'C. एक जैसा (same) temperature रखते हैं',
      'D. Temperature same रखते हैं लेकिन speed कम कर देते हैं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q19',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Heavy fabric (Scuba, Blackout, moti Georgette) par temperature?',
    promptHi: 'Heavy fabric (Scuba, Blackout, मोटी Georgette) पर temperature?',
    type: 'checkbox',
    options: [
      'A. Standard se 10-15°C zyada',
      'B. Standard se 20-25°C zyada',
      'C. Temperature same, speed kam',
      'D. Pehle chhota test karte hain, fir adjust',
    ],
    optionsHi: [
      'A. Standard से 10–15°C ज़्यादा',
      'B. Standard से 20–25°C ज़्यादा',
      'C. Temperature same, speed कम',
      'D. पहले छोटा test करते हैं, फिर adjust',
    ],
    allowNotes: true,
  },
  {
    id: 'Q20',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Under-fused fabric (kam fuse hua) kaise pehchante hain?',
    promptHi: 'Under-fused fabric (कम fuse हुआ) कैसे पहचानते हैं?',
    type: 'checkbox',
    options: [
      'A. Rang feeka dikhta hai, theek se transfer nahi hua',
      'B. Haath se ragadne par rang nikalta hai',
      'C. Surface par design dhundhla dikhta hai',
      'D. Kinaron par design kam, beech mein theek',
    ],
    optionsHi: [
      'A. रंग फीका दिखता है, ठीक से transfer नहीं हुआ',
      'B. हाथ से रगड़ने पर रंग निकलता है',
      'C. Surface पर design धुंधला दिखता है',
      'D. किनारों पर design कम, बीच में ठीक',
    ],
    allowNotes: true,
  },
  {
    id: 'Q21',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Over-fused fabric (zyada fuse hua) kaise pehchante hain?',
    promptHi: 'Over-fused fabric (ज़्यादा fuse हुआ) कैसे पहचानते हैं?',
    type: 'checkbox',
    options: [
      'A. Fabric sakht (stiff) ho jati hai, haath mein kada lagta hai',
      'B. Rang bahut gehre aate hain, original se dark',
      'C. Fabric ki chamak (shine) badal jaati hai',
      'D. Edges burn ho jate hain ya darken hote hain',
    ],
    optionsHi: [
      'A. Fabric सख्त (stiff) हो जाती है, हाथ में कड़ा लगता है',
      'B. रंग बहुत गहरे आते हैं, original से dark',
      'C. Fabric की चमक (shine) बदल जाती है',
      'D. Edges burn हो जाते हैं या darken होते हैं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q22',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Banding (horizontal dhariyaan) aane par sabse pehle kya karte hain?',
    promptHi: 'Banding (horizontal धारियाँ) आने पर सबसे पहले क्या करते हैं?',
    type: 'checkbox',
    options: [
      'A. Nozzle check print — printhead ko check karte hain',
      'B. Paper badalte hain',
      'C. Machine band karke fir se restart',
      'D. Printhead cleaning cycle chalate hain',
    ],
    optionsHi: [
      'A. Nozzle check print — printhead को चेक करते हैं',
      'B. Paper बदलते हैं',
      'C. Machine बंद करके फिर से restart',
      'D. Printhead cleaning cycle चलाते हैं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q23',
    section: 'Sec 3: Fusing and Defects',
    sectionHi: 'भाग 3: Fusing और Defects की पहचान',
    prompt: 'Ghosting (double image) ka sabse aam kaaran kya hai?',
    promptHi: 'Ghosting (double image) का सबसे आम कारण क्या है?',
    type: 'checkbox',
    options: [
      'A. Fabric machine mein hil jaati hai — movement',
      'B. Temperature bahut zyada — fabric slip kar jaati hai',
      'C. Paper aur fabric theek se align nahi the',
      'D. Speed bahut tez thi',
    ],
    optionsHi: [
      'A. Fabric machine में हिल जाती है — movement',
      'B. Temperature बहुत ज़्यादा — fabric slip कर जाती है',
      'C. Paper और fabric ठीक से align नहीं थे',
      'D. Speed बहुत तेज़ थी',
    ],
    allowNotes: true,
  },

  // ─────────────────────────────────────────────
  // भाग 4 — Paper और Ink
  // ─────────────────────────────────────────────
  {
    id: 'Q24',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: 'Korean paper ka width kaise decide karte hain order ke liye?',
    promptHi: 'Korean paper का width कैसे decide करते हैं order के लिए?',
    type: 'checkbox',
    options: [
      'A. Customer ki fabric width ke hisaab se (36 / 63 / 64 / 72")',
      'B. Jo stock mein ho wahi use karte hain',
      'C. Hamesha ek hi standard width',
      'D. Machine ki printing width ke hisaab se',
    ],
    optionsHi: [
      'A. Customer की fabric width के हिसाब से (36 / 63 / 64 / 72")',
      'B. जो stock में हो वही use करते हैं',
      'C. हमेशा एक ही standard width',
      'D. Machine की printing width के हिसाब से',
    ],
    allowNotes: true,
  },
  {
    id: 'Q25',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: '38 GSM aur 45 GSM paper — kab kiska use karte hain? Result mein kya farq padta hai?',
    promptHi: '38 GSM और 45 GSM paper — कब किसका use करते हैं? Result में क्या फर्क पड़ता है?',
    type: 'textarea',
  },
  {
    id: 'Q26',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: 'Korean paper ka stock kitne din ka rakhte hain?',
    promptHi: 'Korean paper का stock कितने दिन का रखते हैं?',
    type: 'checkbox',
    options: [
      'A. 7-10 din',
      'B. 15-20 din',
      'C. 1 mahina',
      'D. 2 mahine ya zyada',
    ],
    optionsHi: [
      'A. 7-10 दिन',
      'B. 15-20 दिन',
      'C. 1 महीना',
      'D. 2 महीने या ज़्यादा',
    ],
    allowNotes: true,
  },
  {
    id: 'Q27',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: 'Paper storage kahan aur kaise karte hain? Temperature aur humidity ka khayal rakhte hain?',
    promptHi: 'Paper storage कहाँ और कैसे करते हैं? Temperature और humidity का ख़याल रखते हैं?',
    type: 'textarea',
  },
  {
    id: 'Q28',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: 'Humidity mein rakha paper roll kaise pehchante hain kharab ho gaya hai?',
    promptHi: 'Humidity में रखा paper roll कैसे पहचानते हैं कि ख़राब हो गया है?',
    type: 'checkbox',
    options: [
      'A. Paper ki edge curl ho jaati hai',
      'B. Print karne par colour bleed hota hai',
      'C. Paper machine mein wrinkle (mudta) pad jata hai',
      'D. Haath lagane par soft ya nam (damp) lagta hai',
    ],
    optionsHi: [
      'A. Paper की edge curl हो जाती है',
      'B. Print करने पर colour bleed होता है',
      'C. Paper machine में wrinkle (मुड़ता) पड़ जाता है',
      'D. हाथ लगाने पर soft या नम (damp) लगता है',
    ],
    allowNotes: true,
  },
  {
    id: 'Q29',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: 'PANTONE Royal Splash ink ke baare mein kya-kya check karte hain? (Sab par tick karein)',
    promptHi: 'PANTONE Royal Splash ink के बारे में क्या-क्या check करते हैं? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Ink expiry date (12 month shelf life)',
      'B. Storage temperature (15-25°C)',
      'C. Naye ink batch par test print',
      'D. CMYK balance check',
      'E. Ink level alerts',
    ],
    optionsHi: [
      'A. Ink expiry date (12 month shelf life)',
      'B. Storage temperature (15–25°C)',
      'C. नए ink batch पर test print',
      'D. CMYK balance check',
      'E. Ink level alerts',
    ],
    allowNotes: true,
  },
  {
    id: 'Q30',
    section: 'Sec 4: Paper and Ink',
    sectionHi: 'भाग 4: Paper और Ink',
    prompt: 'Ink supplier ka naam, contact aur mahine ka approximate quantity?',
    promptHi: 'Ink supplier का नाम, contact और महीने का approximate quantity?',
    type: 'textarea',
    help: 'Supplier ka naam · Contact person · Phone/WhatsApp · Monthly quantity (litres) · Lead time',
  },

  // ─────────────────────────────────────────────
  // भाग 5 — Order, Quality और KATA
  // ─────────────────────────────────────────────
  {
    id: 'Q31',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'Naya order accept karne se pehle kya-kya check karte hain? (Sab par tick karein)',
    promptHi: 'नया order accept करने से पहले क्या-क्या check करते हैं? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Fabric ki polyester % confirm (50%+ zaroori)',
      'B. Machine ki available capacity',
      'C. Korean paper available hai ya nahi',
      'D. Sample approval hua hai (naye customer ke liye)',
      'E. Delivery date possible hai ya nahi',
    ],
    optionsHi: [
      'A. Fabric की polyester % confirm (50%+ ज़रूरी)',
      'B. Machine की available capacity',
      'C. Korean paper available है या नहीं',
      'D. Sample approval हुआ है (नए customer के लिए)',
      'E. Delivery date possible है या नहीं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q32',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'Sample approval mein aapka role hota hai? Final approval kaun karta hai?',
    promptHi: 'Sample approval में आपका role होता है? Final approval कौन करता है?',
    type: 'textarea',
  },
  {
    id: 'Q33',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'KATA process mein exactly kya-kya hota hai? (Sab par tick karein)',
    promptHi: 'KATA process में exactly क्या-क्या होता है? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. Roll-by-roll meter measurement (±0.5%)',
      'B. Har roll ki visual inspection',
      'C. Defect marking (DEF code + photo)',
      'D. Final meter count banaam order compare',
      'E. Shortage hone par customer ko notify',
      'F. KATA Certificate dena (KAT-YYYY-MM-NNNN)',
    ],
    optionsHi: [
      'A. Roll-by-roll meter measurement (±0.5%)',
      'B. हर roll की visual inspection',
      'C. Defect marking (DEF code + photo)',
      'D. Final meter count बनाम order compare',
      'E. Shortage होने पर customer को notify',
      'F. KATA Certificate देना (KAT-YYYY-MM-NNNN)',
    ],
    allowNotes: true,
  },
  {
    id: 'Q34',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'KATA mein common rejection ya shortage ke kaaran kya hain?',
    promptHi: 'KATA में common rejection या shortage के कारण क्या हैं?',
    type: 'textarea',
  },
  {
    id: 'Q35',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'Kitna colour difference acceptable hai? (Delta-E)',
    promptHi: 'कितना colour difference acceptable है? (Delta-E)',
    type: 'checkbox',
    options: [
      'A. Bilkul match hona chahiye — 0 se 2',
      'B. Thoda farq chalta hai — 0 se 3',
      'C. Practical tolerance — 0 se 5',
      'D. Customer ke hisaab se — dekhkar tay karte hain',
    ],
    optionsHi: [
      'A. बिल्कुल match होना चाहिए — 0 से 2',
      'B. थोड़ा फर्क चलता है — 0 से 3',
      'C. Practical tolerance — 0 से 5',
      'D. Customer के हिसाब से — देखकर तय करते हैं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q36',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'Zyada orders hon to priority kaise decide karte hain?',
    promptHi: 'ज़्यादा orders हों तो priority कैसे decide करते हैं?',
    type: 'checkbox',
    options: [
      'A. Urgent delivery waale pehle',
      'B. Book A (LD Silk captive) ko hamesha priority',
      'C. Bade order (zyada meter) pehle',
      'D. Jo order pehle aaya (FIFO)',
      'E. Raghav bhai se poochkar decide karte hain',
    ],
    optionsHi: [
      'A. Urgent delivery वाले पहले',
      'B. Book A (LD Silk captive) को हमेशा priority',
      'C. बड़े order (ज़्यादा मीटर) पहले',
      'D. जो order पहले आया (FIFO)',
      'E. राघव भाई से पूछकर decide करते हैं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q37',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'Kabhi Book A aur Book B mein conflict hua ho? Kaise handle kiya?',
    promptHi: 'कभी Book A और Book B में conflict हुआ हो? कैसे handle किया?',
    type: 'textarea',
  },
  {
    id: 'Q38',
    section: 'Sec 5: Order, Quality and KATA',
    sectionHi: 'भाग 5: Order, Quality और KATA',
    prompt: 'Job 980 metres bani, lekin order 1000 metres ka tha — kya karte hain?',
    promptHi: 'Job 980 metres बनी, लेकिन order 1000 metres का था — क्या करते हैं?',
    type: 'checkbox',
    options: [
      'A. 980 dispatch kar dete hain, customer ko batakar balance baad mein',
      'B. Job rokte hain — 1000 poora hone tak rukte hain',
      'C. 20 metres reprint karke saath bhej dete hain',
      'D. Raghav bhai se poochte hain',
    ],
    optionsHi: [
      'A. 980 dispatch कर देते हैं, customer को बताकर balance बाद में',
      'B. Job रोकते हैं — 1000 पूरा होने तक रुकते हैं',
      'C. 20 metres reprint करके साथ भेज देते हैं',
      'D. राघव भाई से पूछते हैं',
    ],
    allowNotes: true,
  },

  // ─────────────────────────────────────────────
  // भाग 6 — Fabric Receiving
  // ─────────────────────────────────────────────
  {
    id: 'Q39',
    section: 'Sec 6: Fabric Receiving',
    sectionHi: 'भाग 6: Fabric Receiving',
    prompt: 'Customer ki fabric aane par metres kaise check karte hain?',
    promptHi: 'Customer की fabric आने पर metres कैसे check करते हैं?',
    type: 'checkbox',
    options: [
      'A. Roll ko manually counter par naapte hain — har baar',
      'B. Visual estimate se andaaza lagate hain',
      'C. Weight se calculate karte hain',
      'D. Customer ke challan par bharosa, sirf spot check',
    ],
    optionsHi: [
      'A. Roll को manually counter पर नापते हैं — हर बार',
      'B. Visual estimate से अंदाज़ा लगाते हैं',
      'C. Weight से calculate करते हैं',
      'D. Customer के challan पर भरोसा, सिर्फ spot check',
    ],
    allowNotes: true,
  },
  {
    id: 'Q40',
    section: 'Sec 6: Fabric Receiving',
    sectionHi: 'भाग 6: Fabric Receiving',
    prompt: 'Fabric customer ke challan se kam nikle to kya karte hain?',
    promptHi: 'Fabric customer के challan से कम निकले तो क्या करते हैं?',
    type: 'checkbox',
    options: [
      'A. Anand bhai ko batate hain — wo customer se baat karte hain',
      'B. Customer ko directly call/WhatsApp karte hain',
      'C. Discrepancy note banate hain aur job rokte hain customer confirm karne tak',
      'D. Kam meter ka job banakar aage badhte hain',
    ],
    optionsHi: [
      'A. आनंद भाई को बताते हैं — वो customer से बात करते हैं',
      'B. Customer को directly call/WhatsApp करते हैं',
      'C. Discrepancy note बनाते हैं और job रोकते हैं customer confirm करने तक',
      'D. कम मीटर का job बनाकर आगे बढ़ते हैं',
    ],
    allowNotes: true,
  },
  {
    id: 'Q41',
    section: 'Sec 6: Fabric Receiving',
    sectionHi: 'भाग 6: Fabric Receiving',
    prompt: 'Damaged fabric aaye to kya karte hain?',
    promptHi: 'Damaged fabric आए तो क्या करते हैं?',
    type: 'checkbox',
    options: [
      'A. Waapas bhej dete hain',
      'B. Photo lete hain, customer ko batakar unki permission se accept',
      'C. Damaged hissa mark karte hain, baaki par print karte hain',
      'D. Anand / Raghav bhai se poochte hain, wo decide karein',
    ],
    optionsHi: [
      'A. वापस भेज देते हैं',
      'B. Photo लेते हैं, customer को बताकर उनकी permission से accept',
      'C. Damaged हिस्सा mark करते हैं, बाकी पर print करते हैं',
      'D. आनंद / राघव भाई से पूछते हैं, वो decide करें',
    ],
    allowNotes: true,
  },
  {
    id: 'Q42',
    section: 'Sec 6: Fabric Receiving',
    sectionHi: 'भाग 6: Fabric Receiving',
    prompt: 'Fabric kitne din store mein rahe to customer ko remind karte hain ki order dein?',
    promptHi: 'Fabric कितने दिन store में रहे तो customer को remind करते हैं कि order दें?',
    type: 'checkbox',
    options: [
      'A. 15 din',
      'B. 30 din',
      'C. 45 din',
      'D. Jab tak customer order na de — hamari zimmedari',
    ],
    optionsHi: [
      'A. 15 दिन',
      'B. 30 दिन',
      'C. 45 दिन',
      'D. जब तक customer order न दे — हमारी ज़िम्मेदारी',
    ],
    allowNotes: true,
  },

  // ─────────────────────────────────────────────
  // भाग 7 — Dispatch और Packaging
  // ─────────────────────────────────────────────
  {
    id: 'Q43',
    section: 'Sec 7: Dispatch and Packaging',
    sectionHi: 'भाग 7: Dispatch और Packaging',
    prompt: 'Finished fabric roll ki packaging standard kya hai?',
    promptHi: 'Finished fabric roll की packaging standard क्या है?',
    type: 'checkbox',
    options: [
      'A. Polybag mein lapetkar, fir brown paper',
      'B. Sirf polybag — fabric ke upar',
      'C. Customer ke hisaab se alag-alag packaging',
      'D. Hard core mein roll karke polybag',
    ],
    optionsHi: [
      'A. Polybag में लपेटकर, फिर brown paper',
      'B. सिर्फ polybag — fabric के ऊपर',
      'C. Customer के हिसाब से अलग-अलग packaging',
      'D. Hard core में roll करके polybag',
    ],
    allowNotes: true,
  },
  {
    id: 'Q44',
    section: 'Sec 7: Dispatch and Packaging',
    sectionHi: 'भाग 7: Dispatch और Packaging',
    prompt: 'Roll label par kya-kya likhte hain?',
    promptHi: 'Roll label पर क्या-क्या लिखते हैं?',
    type: 'checkbox',
    options: [
      'A. Customer ka naam + Job number + metres',
      'B. Customer ka naam + design name + width + metres',
      'C. Challan number + roll number + metres',
      'D. Sab — customer, design, width, metres, challan number',
    ],
    optionsHi: [
      'A. Customer का नाम + Job number + metres',
      'B. Customer का नाम + design name + width + metres',
      'C. Challan number + roll number + metres',
      'D. सब — customer, design, width, metres, challan number',
    ],
    allowNotes: true,
  },

  // ─────────────────────────────────────────────
  // भाग 8 — Team और Training
  // ─────────────────────────────────────────────
  {
    id: 'Q45',
    section: 'Sec 8: Team and Training',
    sectionHi: 'भाग 8: Team और Training',
    prompt: 'Aapki team mein kitne log hain?',
    promptHi: 'आपकी team में कितने लोग हैं?',
    type: 'checkbox',
    options: [
      'A. 5 se kam',
      'B. 5-10 log',
      'C. 10-15 log',
      'D. 15 se zyada',
    ],
    optionsHi: [
      'A. 5 से कम',
      'B. 5-10 लोग',
      'C. 10-15 लोग',
      'D. 15 से ज़्यादा',
    ],
    allowNotes: true,
    help: 'Exact number Notes mein likh sakte hain',
  },
  {
    id: 'Q46',
    section: 'Sec 8: Team and Training',
    sectionHi: 'भाग 8: Team और Training',
    prompt: 'Har team member ka naam aur kaam? (MDO / QC / KATA / Dispatch / Packaging)',
    promptHi: 'हर team member का नाम और काम? (MDO / QC / KATA / Dispatch / Packaging)',
    type: 'textarea',
    help: 'Format: Naam — Role — Kitne saal se — Koi special skill',
  },
  {
    id: 'Q47',
    section: 'Sec 8: Team and Training',
    sectionHi: 'भाग 8: Team और Training',
    prompt: 'MDO (Machine/Design Operator) ko nayi machine par train karne mein kitna samay lagta hai?',
    promptHi: 'MDO (Machine/Design Operator) को नई machine पर train करने में कितना समय लगता है?',
    type: 'checkbox',
    options: [
      'A. 1 hafte se kam',
      'B. 2-4 hafte',
      'C. 1-2 mahine',
      'D. 3 mahine ya zyada',
    ],
    optionsHi: [
      'A. 1 हफ्ते से कम',
      'B. 2-4 हफ्ते',
      'C. 1-2 महीने',
      'D. 3 महीने या ज़्यादा',
    ],
    allowNotes: true,
  },
  {
    id: 'Q48',
    section: 'Sec 8: Team and Training',
    sectionHi: 'भाग 8: Team और Training',
    prompt: 'MDO ko kaise certify karte hain? Koi specific test ya checklist hoti hai?',
    promptHi: 'MDO को कैसे certify करते हैं? कोई specific test या checklist होती है?',
    type: 'textarea',
  },
  {
    id: 'Q49',
    section: 'Sec 8: Team and Training',
    sectionHi: 'भाग 8: Team और Training',
    prompt: 'Factory mein kaun se zaroori kaam hain jinhein AI tool mein automate hona chahiye? (Sab par tick karein)',
    promptHi: 'Factory में कौन से ज़रूरी काम हैं जिन्हें AI tool में automate होना चाहिए? (सब पर tick करें)',
    type: 'checkbox',
    options: [
      'A. PANTONE machine settings (priority aur speed) decide karna',
      'B. Korean paper GSM selection (job type ke hisaab se)',
      'C. Defect diagnosis aur production hold decision',
      'D. KATA final approval',
      'E. Sample approval ke baad production decision',
      'F. Shift staffing aur machine allocation',
      'G. Customer issue handling routing',
    ],
    optionsHi: [
      'A. PANTONE machine settings (priority और speed) decide करना',
      'B. Korean paper GSM selection (job type के हिसाब से)',
      'C. Defect diagnosis और production hold decision',
      'D. KATA final approval',
      'E. Sample approval के बाद production decision',
      'F. Shift staffing और machine allocation',
      'G. Customer issue handling routing',
    ],
    allowNotes: true,
  },
  {
    id: 'Q50',
    section: 'Sec 8: Team and Training',
    sectionHi: 'भाग 8: Team और Training',
    prompt: 'Emergency contacts — naam aur number (PANTONE technician, electrician, paper supplier, ink supplier, spare parts vendor, AMC / machine repair)',
    promptHi: 'Emergency contacts — नाम और number (PANTONE technician, electrician, paper supplier, ink supplier, spare parts vendor, AMC / machine repair)',
    type: 'textarea',
    help: 'Format: Service — Naam — Phone/WhatsApp — Notes (har service ke liye ek line)',
  },

  // ─────────────────────────────────────────────
  // Final reflection
  // ─────────────────────────────────────────────
  {
    id: 'Q51',
    section: 'Final',
    sectionHi: 'अंतिम प्रश्न',
    prompt: 'Aur kuch? Koi zaroori baat jo company mein sabko hamesha pata rehni chahiye? Koi tip, suggestion, ya factory ki baat jo aap share karna chahte hain?',
    promptHi: 'और कुछ? कोई ज़रूरी बात जो company में सबको हमेशा पता रहनी चाहिए? कोई tip, suggestion, या factory की बात जो आप share करना चाहते हैं?',
    type: 'textarea',
  },
];

// Source: All_Questions_list/LD_Brain_Questionnaire_Gaurav.pdf
// Gaurav Ji — LD Silk Mills, Sales Principal. 45-60 min interview-style
// questionnaire covering 7 brain gaps (S1, S2, S5, S10, S13, S14, C8).
//
// Mostly long-form textarea per question (multi-part prompts, sub-bullets
// described in the help line). One MCQ for the one-time-buyer reason in C1
// which the PDF gives as a discrete a-f list.
const gaurav: Question[] = [
  // ─────────────────────────────────────────────
  // Section A — SP Assignment (do this first — unblocks everything)
  // ─────────────────────────────────────────────
  {
    id: 'A1',
    section: 'Sec A: SP Assignment',
    prompt:
      "Top 50 accounts without SP assignment. The brain currently shows ₹45.94 Cr (68.4% of total Silk revenue) as 'UNASSIGNED' in SAB — no salesperson tagged to any of the major accounts. Can you commit to assigning a salesperson to each of the top 50 accounts in SAB this week? Describe your action plan or any blockers.",
    type: 'textarea',
    help: "Use 'Gaurav' for accounts you handle directly, 'Rinku Bhai' or appropriate broker code for his accounts, 'House' / catch-all for direct walk-ins with no SP. Unlocks SP net revenue ranking and the relationship-ownership map.",
    required: true,
  },
  {
    id: 'A2',
    section: 'Sec A: SP Assignment',
    prompt:
      'Relationship ownership map — for each of the top 20 Silk accounts by revenue, who is the named human relationship owner? Cover at minimum: Donear Industries (₹6.63 Cr), Amarson International (₹1.66 Cr), PR EXPO TRADELINK (₹6.82 Cr combined), Karani Clothing (₹1.11 Cr), Mahendra Ji Knit Wear (₹1.08 Cr), Leena Garments / Regent Creation / D.P.Traders (₹60–62L each), and any others in the top 20.',
    type: 'textarea',
    help: "For each account: name | owner (you / broker / SP) | phone | how often you/they call | if they stopped buying tomorrow — would we know why?",
    required: true,
  },

  // ─────────────────────────────────────────────
  // Section B — Chur Textiles (urgent — ₹5.7 Cr churn)
  // ─────────────────────────────────────────────
  {
    id: 'B1',
    section: 'Sec B: Chur Textiles',
    prompt:
      'Chur Textiles churn — they were buying ₹1.9 Cr/year, did zero in FY 25-26. Please cover: (a) Why did they stop? (b) Did they tell you they were switching or did they just go quiet? (c) Who was managing this relationship — you, a broker, or an SP? (d) Has anyone at Silk spoken to Chur in the last 6 months? (e) Which competitor are they buying from now? (f) Any chance of winning them back — what would it take?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'B2',
    section: 'Sec B: Chur Textiles',
    prompt:
      "Early warning system after Chur Textiles: are there any other large accounts that have been quieter than usual recently? Any top-20 account you have a gut feel about that's at risk of reducing or stopping?",
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // Section C — One-and-done customer qualification
  // ─────────────────────────────────────────────
  {
    id: 'C1a',
    section: 'Sec C: One-and-Done Customers',
    prompt:
      'Of the 531 one-time Silk buyers — what is the most common reason a new customer buys once and doesn\'t return? (Tick all that apply)',
    type: 'checkbox',
    options: [
      'A. Price — found cheaper elsewhere',
      'B. Quality — they weren\'t satisfied',
      'C. Range — we didn\'t have what they needed next time',
      'D. They were just sampling us and went back to their regular supplier',
      'E. They placed one big order for a specific project and don\'t need fabric regularly',
      'F. We never followed up with them',
    ],
    allowNotes: true,
  },
  {
    id: 'C1b',
    section: 'Sec C: One-and-Done Customers',
    prompt:
      'Are there specific types of customers (by geography, product type, or order size) that are more likely to be reactivatable? Give examples if you can.',
    type: 'textarea',
  },
  {
    id: 'C1c',
    section: 'Sec C: One-and-Done Customers',
    prompt:
      "What is the minimum order history that makes a customer worth a reactivation call? (e.g., 'only worth calling if their first order was > ₹50K')",
    type: 'textarea',
  },
  {
    id: 'C2',
    section: 'Sec C: One-and-Done Customers',
    prompt:
      'Ideal Customer Profile based on your years of experience: (a) What does your best customer look like — what do they do, where are they located, how often do they buy, how many meters per order? (b) Is there a type of customer you\'ve learned to avoid (one-time, price-only, high-return, slow payer)? (c) Do your best customers have anything in common — industry, location, business type?',
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // Section D — Broker ↔ Customer Map
  // ─────────────────────────────────────────────
  {
    id: 'D1',
    section: 'Sec D: Broker ↔ Customer Map',
    prompt:
      'For the top 5 brokers (Rinku Bhai and the next 4): (a) Which specific customers did each broker introduce? (b) If Rinku Bhai stopped working with us tomorrow — which customers would be at risk? (c) Are there customers brought by a broker but who now deal directly with us?',
    type: 'textarea',
  },
  {
    id: 'D2',
    section: 'Sec D: Broker ↔ Customer Map',
    prompt:
      'Broker exclusivity: (a) Are there customers with an exclusive relationship with a specific broker (we can only reach them through that broker)? (b) Are there customers where the broker relationship is weakening and we should build a direct line before the broker moves away?',
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // Section E — Cotton Sales Intelligence
  // ─────────────────────────────────────────────
  {
    id: 'E1',
    section: 'Sec E: Cotton Sales Intelligence',
    prompt:
      'Cotton pipeline — Cotton has capacity but needs external customers beyond Vhagar. (a) Are you actively pitching Cotton\'s manufacturing to any external buyers? (b) Any serious conversations — what happened? (c) Ideal first external Cotton customer profile — domestic apparel brand, export agent, etailer?',
    type: 'textarea',
  },
  {
    id: 'E2',
    section: 'Sec E: Cotton Sales Intelligence',
    prompt:
      'Lost deals and competitive intelligence on Cotton: (a) Have you pitched Cotton to any buyer who said no or went to a competitor? (b) What was the reason given? (c) What are competitors charging per piece for similar garments? (d) What certifications are buyers most commonly asking for that Cotton doesn\'t have yet?',
    type: 'textarea',
  },
  {
    id: 'E3',
    section: 'Sec E: Cotton Sales Intelligence',
    prompt:
      "Cotton pricing: (a) For mass production garments (basic shirts / trousers), what is Cotton charging per piece? (b) What do you think the market rate for similar CMT work is? (c) Is Cotton's current pricing competitive, above market, or below market?",
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // Section F — Mill Relationships (supporting Laxmikant's capture project)
  // ─────────────────────────────────────────────
  {
    id: 'F1',
    section: 'Sec F: Mill Relationships',
    prompt:
      'Mill relationships from your sales side (Laxmikant manages buying): (a) Are there mills that also source fabrics from customers — making them both supplier AND customer? (b) K.K. DESIGNERS appears as both a top-3 grey supplier AND a high-return customer. What is their actual relationship with LD Silk — mill, trader, or something else? (c) Any conflicts of interest in the mill network you\'re aware of?',
    type: 'textarea',
  },
  {
    id: 'F2',
    section: 'Sec F: Mill Relationships',
    prompt:
      'Mill succession (your view): (a) Are there mills becoming unreliable — late deliveries, quality slippage? (b) Newer mills you\'ve heard good things about that Laxmikant Ji should look at?',
    type: 'textarea',
  },
];

// Source: All_Questions_list/LD_Brain_Questionnaire_Laxmikant.pdf
// 30 focused questions across 4 sections. Originally drafted as 14 dense
// multi-part questions, rewritten so each prompt asks ONE thing and any
// discrete-option asks (channels, dead-stock causes, margin category)
// land as checkboxes instead of open text. Tone consciously soft — for
// the founder/procurement principal, every "what if you weren't here"
// idea is framed as "travel / step-back / next-in-line" rather than
// permanence. Estimated 60–90 minutes across 2–3 sittings.
const laxmikant: Question[] = [
  // ─────────────────────────────────────────────
  // भाग A — मिल नेटवर्क (Mill Network)
  // ─────────────────────────────────────────────
  {
    id: 'A1',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Top 10 mills ki list — sirf mill ka naam aur city. Jitne yaad aayein, abhi likh dijiye.',
    promptHi: 'Top 10 mills की list — सिर्फ mill का नाम और city। जितने याद आएं, अभी लिख दीजिए।',
    type: 'textarea',
    help: 'Ek line per mill — naam aur shahar (Surat / Bhilwara / Mumbai / etc.)',
  },
  {
    id: 'A2',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'In mills ke saath kitne saal se kaam ho raha hai? Mill ke naam ke saamne saal likh dijiye.',
    promptHi: 'इन mills के साथ कितने साल से काम हो रहा है? Mill के नाम के सामने साल लिख दीजिए।',
    type: 'textarea',
    help: 'Mill — Years (e.g. Sundeep Mills — 12 saal)',
  },
  {
    id: 'A3',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Har mill ka primary contact person kaun hai? Naam aur, agar yaad ho to, designation likh dijiye.',
    promptHi: 'हर mill का primary contact person कौन है? नाम और, अगर याद हो तो, designation लिख दीजिए।',
    type: 'textarea',
  },
  {
    id: 'A4',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'In contacts ka personal mobile / WhatsApp aapke paas hai, ya sirf office number? Per-mill batayein.',
    promptHi: 'इन contacts का personal mobile / WhatsApp आपके पास है, या सिर्फ office number? Per-mill बताइए।',
    type: 'textarea',
    help: 'Mill — Personal mobile / WhatsApp / Sirf office',
  },
  {
    id: 'A5',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Agar kabhi aap 2–3 hafte travel pe ho ya thoda step-back lein, in mills mein se kaunse LD Silk team member ke saath relationship continue ho sake? Kahaan handover comfortable hai aur kahaan abhi sirf aapka direct relationship hai?',
    promptHi: 'अगर कभी आप 2–3 हफ्ते travel पे हो या थोड़ा step-back लें, इन mills में से कौनसे LD Silk team member के साथ relationship continue हो सके? कहाँ handover comfortable है और कहाँ अभी सिर्फ आपका direct relationship है?',
    type: 'textarea',
  },
  {
    id: 'A6',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Excess ya clearance stock aane par sabse pehle aapko kaun-kaun si mills call karti hain? Sirf mill ke naam batayein.',
    promptHi: 'Excess या clearance stock आने पर सबसे पहले आपको कौन-कौन सी mills call करती हैं? सिर्फ mill के नाम बताइए।',
    type: 'textarea',
  },
  {
    id: 'A7',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Ye distress / clearance calls aap tak kaise pohchti hain?',
    promptHi: 'ये distress / clearance calls आप तक कैसे पहुँचती हैं?',
    type: 'checkbox',
    options: [
      'A. WhatsApp message ya call',
      'B. Direct phone call',
      'C. Broker ke through',
      'D. Office staff ke through',
      'E. Email',
    ],
    optionsHi: [
      'A. WhatsApp message या call',
      'B. Direct phone call',
      'C. Broker के through',
      'D. Office staff के through',
      'E. Email',
    ],
    allowNotes: true,
  },
  {
    id: 'A8',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'In distress calls ki nature kya hai?',
    promptHi: 'इन distress calls की nature क्या है?',
    type: 'checkbox',
    options: [
      'A. Personal trust — wo specifically aap par trust karte hain',
      'B. Transactional — wo sab buyers ko call karte hain',
      'C. Mixed — kuch mills personal, kuch transactional',
    ],
    optionsHi: [
      'A. Personal trust — वो specifically आप पर trust करते हैं',
      'B. Transactional — वो सब buyers को call करते हैं',
      'C. Mixed — कुछ mills personal, कुछ transactional',
    ],
    allowNotes: true,
  },
  {
    id: 'A9',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Agar aap kabhi 2–3 hafte available na ho, ye distress calls phir bhi LD Silk team ko aati rahegi, ya competitor pe shift ho jaayegi?',
    promptHi: 'अगर आप कभी 2–3 हफ्ते available ना हों, ये distress calls फिर भी LD Silk team को आती रहेगी, या competitor पे shift हो जाएगी?',
    type: 'textarea',
  },
  {
    id: 'A10',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Aaj kal koi key mills aisi hain jo ownership change ya financial stress mein hain? Aap kaise updated rehte hain?',
    promptHi: 'आज कल कोई key mills ऐसी हैं जो ownership change या financial stress में हैं? आप कैसे updated रहते हैं?',
    type: 'textarea',
  },
  {
    id: 'A11',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Kuch contacts mein, agle generation ya next-in-line ke saath bhi relationship build karna start karna chahiye? Konsi mills mein ye priority hai aapke hisaab se?',
    promptHi: 'कुछ contacts में, अगले generation या next-in-line के साथ भी relationship build करना start करना चाहिए? कौनसी mills में ये priority है आपके हिसाब से?',
    type: 'textarea',
  },
  {
    id: 'A12',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Pichhle 1–2 saal mein kaunsi mills mein quality slipping ya inconsistent dikh rahi hai?',
    promptHi: 'पिछले 1–2 साल में कौनसी mills में quality slipping या inconsistent दिख रही है?',
    type: 'textarea',
  },
  {
    id: 'A13',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Pichhle 12 mahine mein kaunsi nayi mills se buying start ki jo accha perform kar rahi hain? Aur kaunsi mills jo pehle aapne reject ki thi, aaj wapas dekhne layak lagti hain?',
    promptHi: 'पिछले 12 महीने में कौनसी नई mills से buying start की जो अच्छा perform कर रही हैं? और कौनसी mills जो पहले आपने reject की थी, आज वापस देखने लायक लगती हैं?',
    type: 'textarea',
  },
  {
    id: 'A14',
    section: 'Sec A: Mill Network',
    sectionHi: 'भाग A: मिल नेटवर्क',
    prompt: 'Naya mill judge karne ke liye aap kya criteria use karte hain?',
    promptHi: 'नया mill judge करने के लिए आप क्या criteria use करते हैं?',
    type: 'checkbox',
    options: [
      'A. Sample quality',
      'B. Existing supplier ya customer ka reference',
      'C. Mill ki age aur market reputation',
      'D. Pricing competitiveness',
      'E. Production capacity',
      'F. Owner ya management ka conduct',
      'G. Financial stability',
      'H. Delivery reliability',
    ],
    optionsHi: [
      'A. Sample quality',
      'B. Existing supplier या customer का reference',
      'C. Mill की age और market reputation',
      'D. Pricing competitiveness',
      'E. Production capacity',
      'F. Owner या management का conduct',
      'G. Financial stability',
      'H. Delivery reliability',
    ],
    allowNotes: true,
  },

  // ─────────────────────────────────────────────
  // भाग B — फ़ैब्रिक ज्ञान (Fabric Knowledge)
  // ─────────────────────────────────────────────
  {
    id: 'B1',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Top fabric compositions — highest-volume fabrics (London, Innova, Dominoz, Polo, etc.) ke liye composition (e.g. 60% Polyester, 35% Viscose, 5% Lycra) likh dijiye. Jitna yaad aaye abhi, baaki Mahesh ek detailed list lekar baithega.',
    promptHi: 'Top fabric compositions — highest-volume fabrics (London, Innova, Dominoz, Polo, etc.) के लिए composition (e.g. 60% Polyester, 35% Viscose, 5% Lycra) लिख दीजिए। जितना याद आए अभी, बाकी Mahesh एक detailed list लेकर बैठेगा।',
    type: 'textarea',
    help: 'Format: Fabric — Composition',
  },
  {
    id: 'B2',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'In fabrics ke saath width, approximate GSM, aur weave type (plain / twill / dobby / satin) bhi yaad hai to likh dijiye.',
    promptHi: 'इन fabrics के साथ width, approximate GSM, और weave type (plain / twill / dobby / satin) भी याद है तो लिख दीजिए।',
    type: 'textarea',
    help: 'Fabric — Width — GSM — Weave',
  },
  {
    id: 'B3',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Polyester-heavy fabrics mein se kaunsi digital sublimation printing ke liye Linkd par suitable hain?',
    promptHi: 'Polyester-heavy fabrics में से कौनसी digital sublimation printing के लिए Linkd पर suitable हैं?',
    type: 'textarea',
  },
  {
    id: 'B4',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Aapne kabhi Linkd ya kahin aur in fabrics ko print karke try kiya hai? Kya result aaya tha?',
    promptHi: 'आपने कभी Linkd या कहीं और इन fabrics को print करके try किया है? क्या result आया था?',
    type: 'textarea',
  },
  {
    id: 'B5',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Kaunsi fabrics Linkd ko naya printing substrate ki tarah try karni chahiye, jo abhi tak try nahi ki gayi?',
    promptHi: 'कौनसी fabrics Linkd को नया printing substrate की तरह try करनी चाहिए, जो अभी तक try नहीं की गई?',
    type: 'textarea',
  },
  {
    id: 'B6',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Series-level customers — London specifically kaun khareedte hain? Innova kaun le jaata hai? Dominoz kaun? London-Innova-Dominoz buyers ek hi hain ya alag-alag customer base?',
    promptHi: 'Series-level customers — London specifically कौन खरीदते हैं? Innova कौन ले जाता है? Dominoz कौन? London-Innova-Dominoz buyers एक ही हैं या अलग-अलग customer base?',
    type: 'textarea',
    help: 'London buyers · Innova buyers · Dominoz buyers · Same or different?',
  },
  {
    id: 'B7',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Kuch customers aise hain jo SIRF ek hi fabric family lete hain — aur kuch nahi? Kaun?',
    promptHi: 'कुछ customers ऐसे हैं जो सिर्फ एक ही fabric family लेते हैं — और कुछ नहीं? कौन?',
    type: 'textarea',
  },
  {
    id: 'B8',
    section: 'Sec B: Fabric Knowledge',
    sectionHi: 'भाग B: फ़ैब्रिक ज्ञान',
    prompt: 'Aise fabrics kahaan hain jahaan ₹5 price hilta hai to customer turant competitor pe chala jaata hai? Kaun se fabrics aur kaun se customers?',
    promptHi: 'ऐसे fabrics कहाँ हैं जहाँ ₹5 price हिलता है तो customer तुरंत competitor पे चला जाता है? कौन से fabrics और कौन से customers?',
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // भाग C — डेड स्टॉक विश्लेषण (Dead Stock Postmortems)
  // ─────────────────────────────────────────────
  {
    id: 'C1',
    section: 'Sec C: Dead Stock Postmortems',
    sectionHi: 'भाग C: डेड स्टॉक विश्लेषण',
    prompt: 'Titan (5,861 mtrs) ki kahaani — aap apne shabdon mein bata dijiye. Kab khareeda gaya, kis customer ke liye, sell hona kyun ruka, aur aaj kya status hai? Voice note mein bolna sabse aasan rahega.',
    promptHi: 'Titan (5,861 mtrs) की कहानी — आप अपने शब्दों में बता दीजिए। कब खरीदा गया, किस customer के लिए, sell होना क्यों रुका, और आज क्या status है? Voice note में बोलना सबसे आसान रहेगा।',
    type: 'textarea',
  },
  {
    id: 'C2',
    section: 'Sec C: Dead Stock Postmortems',
    sectionHi: 'भाग C: डेड स्टॉक विश्लेषण',
    prompt: 'Chip Plain (5,496 mtrs) — ye khareeda gaya lekin aaj tak ek meter bhi sell nahi hua. Original intent kya tha, kisne approve kiya tha, aur aaj sahi action kya hai (liquidate / Cotton repurpose / donate)?',
    promptHi: 'Chip Plain (5,496 mtrs) — ये खरीदा गया लेकिन आज तक एक meter भी sell नहीं हुआ। Original intent क्या था, किसने approve किया था, और आज सही action क्या है (liquidate / Cotton repurpose / donate)?',
    type: 'textarea',
  },
  {
    id: 'C3',
    section: 'Sec C: Dead Stock Postmortems',
    sectionHi: 'भाग C: डेड स्टॉक विश्लेषण',
    prompt: 'Merit Plain (2,903 mtrs, Feb 2026 purchase) — sirf 2 mahine pehle khareeda, ek meter bhi nahi gaya. Intended customer kaun tha? Interest confirm tha purchase se pehle, ya speculative? Ab kya plan?',
    promptHi: 'Merit Plain (2,903 mtrs, Feb 2026 purchase) — सिर्फ 2 महीने पहले खरीदा, एक meter भी नहीं गया। Intended customer कौन था? Interest confirm था purchase से पहले, या speculative? अब क्या plan?',
    type: 'textarea',
  },
  {
    id: 'C4',
    section: 'Sec C: Dead Stock Postmortems',
    sectionHi: 'भाग C: डेड स्टॉक विश्लेषण',
    prompt: 'General dead stock — aapke experience mein, fabrics ke dead stock banne ke sabse common reasons kya hain?',
    promptHi: 'General dead stock — आपके experience में, fabrics के dead stock बनने के सबसे common reasons क्या हैं?',
    type: 'checkbox',
    options: [
      'A. Galat trend call — fashion shift ho gaya',
      'B. Customer-specific buy jo fall through ho gayi',
      'C. Price too high — competitive nahi raha',
      'D. Quality issue — mill ne expected quality nahi di',
      'E. Competitor ne customer ko kaata',
      'F. Seasonal miss — timing galat',
      'G. Speculative buy without confirmed demand',
    ],
    optionsHi: [
      'A. गलत trend call — fashion shift हो गया',
      'B. Customer-specific buy जो fall through हो गई',
      'C. Price too high — competitive नहीं रहा',
      'D. Quality issue — mill ने expected quality नहीं दी',
      'E. Competitor ने customer को काटा',
      'F. Seasonal miss — timing गलत',
      'G. Speculative buy without confirmed demand',
    ],
    allowNotes: true,
  },
  {
    id: 'C5',
    section: 'Sec C: Dead Stock Postmortems',
    sectionHi: 'भाग C: डेड स्टॉक विश्लेषण',
    prompt: 'Koi pattern dikha hai — kis specific mill, fabric category, ya season se zyada dead stock aata hai?',
    promptHi: 'कोई pattern दिखा है — किस specific mill, fabric category, या season से ज़्यादा dead stock आता है?',
    type: 'textarea',
  },
  {
    id: 'C6',
    section: 'Sec C: Dead Stock Postmortems',
    sectionHi: 'भाग C: डेड स्टॉक विश्लेषण',
    prompt: 'Naya unproven fabric ka first trial mein aap maximum kitna khareedne ko taiyar honge?',
    promptHi: 'नया unproven fabric का first trial में आप maximum कितना खरीदने को तैयार होंगे?',
    type: 'textarea',
  },

  // ─────────────────────────────────────────────
  // भाग D — कीमत समझ (Pricing Instincts)
  // ─────────────────────────────────────────────
  {
    id: 'D1',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Tier 1 finished fabric (London, Innova, Polo-type) ka "never go below" rate kya hai naye salesperson ke liye?',
    promptHi: 'Tier 1 finished fabric (London, Innova, Polo-type) का "never go below" rate क्या है नए salesperson के लिए?',
    type: 'textarea',
  },
  {
    id: 'D2',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Tier 4 digital / print fabric (Milano, Canvas-type) ka floor rate kya hai?',
    promptHi: 'Tier 4 digital / print fabric (Milano, Canvas-type) का floor rate क्या है?',
    type: 'textarea',
  },
  {
    id: 'D3',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Jab koi mill price quote karta hai, aap kaise pehchaante hain ki ye accha price hai ya bura? Kaunse signals dekhte hain?',
    promptHi: 'जब कोई mill price quote करता है, आप कैसे पहचानते हैं कि ये अच्छा price है या बुरा? कौनसे signals देखते हैं?',
    type: 'textarea',
  },
  {
    id: 'D4',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Kabhi aisa hua ki mill ne aisi price offer ki jo bahut suspicious lagi — bahut sasti? Tab kya hua tha?',
    promptHi: 'कभी ऐसा हुआ कि mill ने ऐसी price offer की जो बहुत suspicious लगी — बहुत सस्ती? तब क्या हुआ था?',
    type: 'textarea',
  },
  {
    id: 'D5',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Jab fabric expected price se 20% neeche aata hai, iska sabse common matlab kya hota hai aapke experience mein?',
    promptHi: 'जब fabric expected price से 20% नीचे आता है, इसका सबसे common मतलब क्या होता है आपके experience में?',
    type: 'checkbox',
    options: [
      'A. Quality issue — defective ya substandard',
      'B. Fake ya counterfeit',
      'C. Distress sale — mill ko cash chahiye',
      'D. Competitor ka customer poaching attempt',
      'E. Promotional ya introductory pricing',
      'F. Old stock liquidation',
    ],
    optionsHi: [
      'A. Quality issue — defective या substandard',
      'B. Fake या counterfeit',
      'C. Distress sale — mill को cash चाहिए',
      'D. Competitor का customer poaching attempt',
      'E. Promotional या introductory pricing',
      'F. Old stock liquidation',
    ],
    allowNotes: true,
  },
  {
    id: 'D6',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Kaunsi fabric category Silk ko sabse achhi margin deti hai? (Ek ya zyada select kar sakte hain)',
    promptHi: 'कौनसी fabric category Silk को सबसे अच्छी margin देती है? (एक या ज़्यादा select कर सकते हैं)',
    type: 'checkbox',
    options: [
      'A. Tier 1 finished (London, Innova, Polo)',
      'B. Grey processed',
      'C. Linen',
      'D. Digital / print',
    ],
    optionsHi: [
      'A. Tier 1 finished (London, Innova, Polo)',
      'B. Grey processed',
      'C. Linen',
      'D. Digital / print',
    ],
    allowNotes: true,
  },
  {
    id: 'D7',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Aur kaunsi category ki margin sabse patli hai? (Ek ya zyada select kar sakte hain)',
    promptHi: 'और कौनसी category की margin सबसे पतली है? (एक या ज़्यादा select कर सकते हैं)',
    type: 'checkbox',
    options: [
      'A. Tier 1 finished (London, Innova, Polo)',
      'B. Grey processed',
      'C. Linen',
      'D. Digital / print',
    ],
    optionsHi: [
      'A. Tier 1 finished (London, Innova, Polo)',
      'B. Grey processed',
      'C. Linen',
      'D. Digital / print',
    ],
    allowNotes: true,
  },
  {
    id: 'D8',
    section: 'Sec D: Pricing Instincts',
    sectionHi: 'भाग D: कीमत समझ',
    prompt: 'Kaunsi category aap zyada sell karne mein khush hain, aur kaunsi reduce karna chahenge — aur kyun?',
    promptHi: 'कौनसी category आप ज़्यादा sell करने में खुश हैं, और कौनसी reduce करना चाहेंगे — और क्यों?',
    type: 'textarea',
  },
];

const md: Question[] = [
  { id: 'M1', section: 'Management Vision', prompt: 'Aaj ke liye top 3 business priorities kya hain?', type: 'textarea' },
  { id: 'M2', section: 'Management Vision', prompt: 'Aap kis cheez par bilkul compromise nahi karna chahte?', type: 'textarea' },
  { id: 'M3', section: 'Decision Rules', prompt: 'Speed, quality, cost mein conflict aaye to decision rule kya hota hai?', type: 'radio', options: ['Speed first', 'Quality first', 'Cost first', 'Case by case'] },
  { id: 'M4', section: 'Growth', prompt: 'Agale 90 din mein sabse bada growth goal kya hai?', type: 'textarea' },
  { id: 'M5', section: 'Bottlenecks', prompt: 'Aaj growth ko sabse zyada kya block kar raha hai?', type: 'textarea' },
  { id: 'M6', section: 'Knowledge Capture', prompt: 'Kis type ka knowledge sabse pehle document karna chahiye?', type: 'textarea' },
  { id: 'M7', section: 'Operations', prompt: 'Konsi approvals ya decisions slow hain?', type: 'textarea' },
  { id: 'M8', section: 'Reporting', prompt: 'Daily, weekly, monthly kya track hona chahiye?', type: 'textarea' },
  { id: 'M9', section: 'Leadership', prompt: 'Kis person/role ki knowledge sabse critical hai?', type: 'textarea' },
  { id: 'M10', section: 'Leadership', prompt: 'Koi final note jo LD Brain ko yaad rakhna chahiye?', type: 'textarea' },
];

export const QUESTION_SETS: Record<InterviewRole, Question[]> = {
  nandu,
  gaurav,
  laxmikant,
  md,
};
