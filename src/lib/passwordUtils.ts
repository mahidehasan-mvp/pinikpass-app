const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:\'",.<>/?~';

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function generatePassword(options: PasswordOptions): string {
  const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;
  
  if (length <= 0) {
    return '';
  }

  let charPool = '';
  let guaranteedChars = '';

  if (includeUppercase) {
    charPool += UPPERCASE_CHARS;
    if (length > guaranteedChars.length) {
        guaranteedChars += UPPERCASE_CHARS[Math.floor(Math.random() * UPPERCASE_CHARS.length)];
    }
  }
  if (includeLowercase) {
    charPool += LOWERCASE_CHARS;
    if (length > guaranteedChars.length) {
        guaranteedChars += LOWERCASE_CHARS[Math.floor(Math.random() * LOWERCASE_CHARS.length)];
    }
  }
  if (includeNumbers) {
    charPool += NUMBER_CHARS;
    if (length > guaranteedChars.length) {
        guaranteedChars += NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)];
    }
  }
  if (includeSymbols) {
    charPool += SYMBOL_CHARS;
    if (length > guaranteedChars.length) {
        guaranteedChars += SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)];
    }
  }

  if (charPool === '') {
    return 'Please select character types';
  }
  
  let password = guaranteedChars;
  const remainingLength = length - password.length;

  for (let i = 0; i < remainingLength; i++) {
    password += charPool[Math.floor(Math.random() * charPool.length)];
  }
  
  return shuffleString(password);
}


export type PasswordStrengthLevel = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Excellent';

export interface StrengthResult {
  level: PasswordStrengthLevel;
  value: number; // Progress bar value (0-100)
  colorClass: string; // Tailwind CSS class for color
  label: string;
}

export function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return { level: 'Very Weak', value: 0, colorClass: 'bg-gray-300', label: 'Strength: -' };
  }

  let score = 0;
  const len = password.length;

  // Length criteria
  if (len >= 16) score += 4; // Excellent length
  else if (len >= 12) score += 3; // Strong length
  else if (len >= 8) score += 2; // Medium length
  else if (len > 0) score += 1; // Weak length

  // Character type criteria
  let types = 0;
  if (/[A-Z]/.test(password)) types++;
  if (/[a-z]/.test(password)) types++;
  if (/[0-9]/.test(password)) types++;
  if (/[^A-Za-z0-9\s]/.test(password)) types++; // Symbols (excluding space)
  
  score += types; // Add number of unique character types used

  // Max possible score = 4 (length) + 4 (types) = 8

  if (len > 0 && len < 4) { // Penalize extremely short passwords regardless of types
    score = Math.min(score, 1);
  }


  if (score >= 7) { // e.g., 16+ chars (4) + 3-4 types (3-4)
    return { level: 'Excellent', value: 100, colorClass: 'bg-[hsl(var(--chart-2))]', label: 'Strength: Excellent' };
  } else if (score >= 5) { // e.g., 12+ chars (3) + 2-3 types (2-3) OR 8+ chars (2) + 3-4 types (3-4)
    return { level: 'Strong', value: 75, colorClass: 'bg-green-500', label: 'Strength: Strong' }; // Using direct Tailwind for more granularity
  } else if (score >= 3) { // e.g., 8+ chars (2) + 1 type (1) OR <8 chars (1) + 2 types (2)
    return { level: 'Medium', value: 50, colorClass: 'bg-[hsl(var(--chart-4))]', label: 'Strength: Medium' };
  } else if (score >= 1) { // e.g., <8 chars (1) + 0-1 type
    return { level: 'Weak', value: 25, colorClass: 'bg-[hsl(var(--chart-1))]', label: 'Strength: Weak' };
  } else { // Score 0 (empty password was handled, this is for edge cases or if logic changes)
    return { level: 'Very Weak', value: 10, colorClass: 'bg-destructive', label: 'Strength: Very Weak' };
  }
}
