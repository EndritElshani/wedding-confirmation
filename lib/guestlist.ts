// guestList.ts

export interface FamilySubmission {
  familyName: string;
  submissionDate: string;
  memberNames: string[];
  additionalNotes?: string;
  submissionKey?: string;
}

export const generateSubmissionKey = (familyName: string): string => {
  return btoa(familyName.toLowerCase().replace(/\s/g, '')); // Simple encoding
};

export const invitedFamilies = [
    {
      id: 1,
      familyName: 'Bekim Elshani',
      members: ['Endrit', 'Adem', 'Luljeta', 'Bekim']
    },
    {
      id: 2,
      familyName: 'Agim Krasniqi',
      members: ['Agim', 'Shpresa', 'Arta', 'Artan']
    },
    {
      id: 3,
      familyName: 'Fadil Gashi',
      members: ['Fadil', 'Fatima', 'Faton', 'Fitore']
    },
    {
      id: 4,
      familyName: 'Bujar Morina',
      members: ['Bujar', 'Mimoza', 'Blerta', 'Blerim']
    },
    {
      id: 5,
      familyName: 'Naim Berisha',
      members: ['Naim', 'Nafije', 'Naser', 'Nora']
    },
    {
      id: 6,
      familyName: 'Ismet Hoxha',
      members: ['Ismet', 'Igballe', 'Ilir', 'Ida']
    },
    {
      id: 7,
      familyName: 'Ramadan Shala',
      members: ['Ramadan', 'Remzije', 'Rinor', 'Rina']
    },
    {
      id: 8,
      familyName: 'Xhevdet Kelmendi',
      members: ['Xhevdet', 'Xhevahire', 'Xherdan', 'Xhenet']
    },
    {
      id: 9,
      familyName: 'Besnik Rexhepi',
      members: ['Besnik', 'Besa', 'Blend', 'Blerta']
    },
    {
      id: 10,
      familyName: 'Lulzim Voca',
      members: ['Lulzim', 'Linda', 'Leart', 'Lea']
    },
    {
      id: 11,
      familyName: 'Bajram Kryeziu',
      members: ['Zejnep', 'Harisa', 'Rijad', 'Vaxhide', 'Bajram']
    }
  ];
  
  export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9fhDF22U1An-fR88B2gliSAZW7-oihGuepC9r5sEU4pC5qJycJaMCt6dgclKX6m7S/exec';
  
  export const checkExistingSubmission = async (familyName) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?check=true&family=${encodeURIComponent(familyName)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking submission:', error);
      return { exists: false };
    }
  };