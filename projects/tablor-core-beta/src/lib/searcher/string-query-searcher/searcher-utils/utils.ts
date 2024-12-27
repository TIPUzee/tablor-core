/**
 * Returns the start and end indices of the first occurrence of the substring within the sentence.
 */
export function containsSubstring(sentence: string, substring: string): [number, number] | [undefined, undefined]
{
    const startIndex = sentence.indexOf(substring)

    if (startIndex === -1)
    {
        return [undefined, undefined]
    }

    let wordStart = startIndex
    while (wordStart > 0 && !isBoundaryCharacter(sentence[wordStart - 1]))
    {
        wordStart--
    }

    let wordEnd = startIndex + substring.length
    while (wordEnd < sentence.length && !isBoundaryCharacter(sentence[wordEnd]))
    {
        wordEnd++
    }

    return [wordStart, wordEnd]
}

/**
 * Returns whether the given character is a boundary character.
 */
export function isBoundaryCharacter(char: string): boolean
{
    return char === ' ' || char === ',' || char === '.' || char === '!' || char === '?'
        || char === ';' || char === '@' || char === '"' || char === '\'' || char === '(' || char === ')'
        || char === '[' || char === ']'
        || char === '\n' || char === '\t' || char === '\r' || char === '\f' || char === '\v'
}
