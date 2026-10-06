import { ChoirMember, VoiceSection } from '../types';

/**
 * Extracts the first name from a member's full name.
 * e.g. "BACCIOTTINI Franco" -> "Franco"
 *      "ARRIGONI Norma/Mimma" -> "Norma"
 *      "DALLAVALLE Anna Maria" -> "Anna Maria"
 *      "DEGLI ESPOSTI Chiara" -> "Chiara"
 *      "DELLA COSTANZA Eleonora" -> "Eleonora"
 *      "Mario Rossi" -> "Mario"
 *      "Daniele" -> "Daniele"
 */
export function getMemberFirstName(fullName?: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].split('/')[0].trim();
  }

  // Handle composite surnames like "DEGLI ESPOSTI Chiara", "DELLA COSTANZA Eleonora", "DI PAOLO Marco"
  // If the last word is in Titlecase (e.g. Chiara, Eleonora, Franco) and previous words are uppercase
  const lastPart = parts[parts.length - 1];
  const isLastPartTitleCase = /^[A-Z][a-zàèéìòù]+$/.test(lastPart);
  
  // If all uppercase words preceded a TitleCase word
  const leadingPartsUpper = parts.slice(0, parts.length - 1).every(p => p === p.toUpperCase());
  if (isLastPartTitleCase && leadingPartsUpper) {
    // Check if penultimate part is also a first name (like "Anna Maria")
    if (parts.length >= 3) {
      const penultPart = parts[parts.length - 2];
      const isPenultTitleCase = /^[A-Z][a-zàèéìòù]+$/.test(penultPart);
      if (isPenultTitleCase && parts.slice(0, parts.length - 2).every(p => p === p.toUpperCase())) {
        return `${penultPart} ${lastPart}`;
      }
    }
    return lastPart.split('/')[0].trim();
  }

  // Standard "SURNAME Firstname [SecondName]" where parts[0] is UPPERCASE and parts[1..] are TitleCase
  if (parts[0] === parts[0].toUpperCase() && parts[0].length > 1) {
    const remaining = parts.slice(1).join(' ');
    return remaining.split('/')[0].trim();
  }
  
  // Default to first token if format is "Firstname Surname"
  return parts[0].split('/')[0].trim();
}

/**
 * Determines whether a member or section is female or male in Italian.
 * In a choir:
 * Soprano & Contralto -> Donna ("Benvenuta")
 * Tenore, Baritono, Basso -> Uomo ("Benvenuto")
 */
export function isFemale(member?: ChoirMember | null, section?: VoiceSection | string): boolean {
  const currentSection = member?.section || section;
  if (currentSection === 'Soprano' || currentSection === 'Contralto') {
    return true;
  }
  if (currentSection === 'Tenore' || currentSection === 'Baritono' || currentSection === 'Basso') {
    return false;
  }
  
  // Fallback heuristic based on first name ending in 'a'
  const firstName = getMemberFirstName(member?.name).toLowerCase();
  const maleAExceptions = ['andrea', 'luca', 'nicola', 'elia', 'mattia', 'gianluca', 'gianandrea', 'daniele'];
  if (firstName.endsWith('a') && !maleAExceptions.includes(firstName)) {
    return true;
  }
  return false;
}

/**
 * Generates "Benvenuto + nome" or "Benvenuta + nome"
 * If isDirector is true: "Benvenuto Daniele"
 * If no user: "Benvenuto"
 */
export function getWelcomeGreeting(
  user?: ChoirMember | null,
  isDirector?: boolean
): string {
  if (isDirector) {
    return 'Benvenuto Daniele';
  }
  if (!user) {
    return 'Benvenuto';
  }

  const firstName = getMemberFirstName(user.name);
  const female = isFemale(user);
  const prefix = female ? 'Benvenuta' : 'Benvenuto';

  return firstName ? `${prefix} ${firstName}` : prefix;
}
