// Jednoduchy system na banovani lidi co pisou spatny slova
// Proste kdyz nekdo napise neco jako "fuck" nebo tak, tak dostane ban

type ModerationResult = {
  allowed: boolean;      // jestli muze ta zprava projit
  reason?: string;       // proc to bylo zablokovany
  action?: 'ban' | 'timeout' | 'warning';  // co se ma stat
  score: number;         // jak moc spatny to bylo (0 = ok, 100 = mega spatny)
  bannedWord?: string;   // ktery slovo to bylo
};

// Tady jsou vsechny zakazany slova
// Kdyz nekdo napise neco z tohohle listu, dostane OKAMZITEJ BAN
const BANNED_WORDS = [
  // Rasisticky veci - tohle je mega spatny, okamzitej ban
  'nigger', 'nigga', 'negro', 'neger',
  'chink', 'gook', 'spic', 'kike', 'wetback',
  
  // Veci proti gay lidem - taky spatny
  'faggot', 'fag', 'dyke', 'homo',
  
  // Sexualni obtezovani
  'rape', 'molest',
  
  // Anglicky nadavky - klasika
  'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker',
  'shit', 'shitty', 'bullshit',
  'cunt', 'cock', 'dick', 'pussy', 'bitch', 'whore', 'slut',
  'asshole', 'ass', 'bastard', 'retard', 'retarded',
  
 
  'kurva', 'kurvy', 'zkurvysyn', 'zkurveny',
  'pica', 'picus', 'pica', 'picka',
  'kokot', 'kokoti', 'kokotina',
  'debil', 'debilni', 'idiot',
  'srac', 'hovno', 'hovado',
  'zmrd', 'vole', 'kreten',
  'hajzl', 'prase',
  
  'scheisse', 'scheisse', 'arschloch', 'hurensohn', 'fotze',
  
  // Kdyz nekdo rika at se zabijes - mega vazny
  'kill yourself', 'kys', 'die',
];

// Tohle jsou takovy lehci slova - nedostanes za ne ban, ale upozornime te
const WARNING_WORDS = [
  'stupid', 'dumb', 'idiot', 'moron', 'ugly', 'fat', 'loser',
  'hate', 'suck', 'sucks', 'lame', 'trash', 'garbage',
];

/**
 * Funkce ktera hleda jestli je ve zprave nejaky zakazany slovo
 * Vraci to slovo co nasla, nebo null kdyz tam nic neni
 */
function findBannedWord(text: string): string | null {
  // udelame text malymi pismenama a vyhodime specialni znaky
  const lowerText = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
  
  // projdeme vsechny zakazany slova
  for (const word of BANNED_WORDS) {
    
    if (lowerText.includes(word.toLowerCase())) {
      return word;
    }
  }
  

  return null;
}

function hasWarningWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  for (const word of WARNING_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}


export function moderateMessage(username: string, text: string): ModerationResult {
  // Prvni check - je tam nejaky banned slovo?
  const bannedWord = findBannedWord(text);
  
  if (bannedWord) {
    
    console.log(`[Moderace] ZABANOVAN: "${text}" obsahuje "${bannedWord}"`);
    return {
      allowed: false,           
      reason: `Zakazany slovo: ${bannedWord}`,
      action: 'ban',          
      score: 100,              
      bannedWord,
    };
  }

  if (hasWarningWords(text)) {
    return {
      allowed: true,           
      reason: 'Obsahuje podezrely slova',
      action: 'warning',        
      score: 30,                
    };
  }
  
  return {
    allowed: true,
    score: 0,
  };
}

export function getBannedWords(): string[] {
  return [...BANNED_WORDS];
}


export function addBannedWord(word: string) {
  // pridame jenom kdyz tam jeste neni
  if (!BANNED_WORDS.includes(word.toLowerCase())) {
    BANNED_WORDS.push(word.toLowerCase());
  }
}
