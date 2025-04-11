/**
 * Fast token estimation based on character classes.
 * For each character in the text, we add a pre-determined
 * fractional weight and then round the total count.
 */

export function estimateTextTokens(text: string): number {
  let tokenCount = 0
  for (let i = 0; i < text.length; i++) {
    const charClass = getCharacterClass(text, i)
    tokenCount += avgTokenPerClass[charClass] || avgTokenPerClass['CX']
  }
  return Math.round(tokenCount)
}

function getCharacterClass(text: string, pos: number): string {
  const char = text[pos]
  if (char === ' ') {
    // If space and the previous character was a space, mark as C4; otherwise C0.
    return pos > 0 && text[pos - 1] === ' ' ? 'C4' : 'C0'
  } else if (char.charCodeAt(0) > 255) {
    return 'C3'
  }
  for (let i = 0; i < allClusters.length; i++) {
    if (allClusters[i].includes(char)) {
      return 'C' + i
    }
  }
  return 'CX'
}

// Clusters based on groups of characters (order matters).
const allClusters: string[] = [
  'NORabcdefghilnopqrstuvy', // C0
  '"#%)\\*+56789<>?@Z[\\]^|§«äç\'', // C1
  '-.ABDEFGIKWY_\r\tz{ü', // C2
  ',01234:~Üß', // C3
  '', // C4: space that follows a space
  '!$&(/;=JX`j\n}ö', // C5
  'CHLMPQSTUVfkmspwx ' // C6 (note: includes a trailing space)
]

const avgTokenPerClass: { [key: string]: number } = {
  C4: 0.08086208692099685,
  C0: 0.2020182639633662,
  C6: 0.2372744211422125,
  C2: 0.3042805747355606,
  C5: 0.4157646363858563,
  C1: 0.4790556468110302,
  C3: 0.6581971122770317,
  CX: 0.980083857442348
}
