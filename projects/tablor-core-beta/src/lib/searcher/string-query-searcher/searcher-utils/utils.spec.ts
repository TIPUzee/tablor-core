import { isBoundaryCharacter, containsSubstring } from './utils'


describe('isBoundaryCharacter', () =>
{

    it('is a boundary character', () =>
    {
        expect(isBoundaryCharacter(' ')).toBe(true)
        expect(isBoundaryCharacter(',')).toBe(true)
        expect(isBoundaryCharacter('.')).toBe(true)
        expect(isBoundaryCharacter('!')).toBe(true)
        expect(isBoundaryCharacter('?')).toBe(true)
        expect(isBoundaryCharacter(';')).toBe(true)
        expect(isBoundaryCharacter('@')).toBe(true)
        expect(isBoundaryCharacter('"')).toBe(true)
        expect(isBoundaryCharacter('\'')).toBe(true)
        expect(isBoundaryCharacter('(')).toBe(true)
        expect(isBoundaryCharacter(')')).toBe(true)
    })

    it('contains substring', () =>
    {
        expect(containsSubstring('hello world', 'hel')).toEqual([0, 5])
        expect(containsSubstring('hello, world', 'hel')).toEqual([0, 5])
        expect(containsSubstring('hello.world', 'hel')).toEqual([0, 5])
        expect(containsSubstring('hello@world.com', 'wor')).toEqual([6, 11])
        expect(containsSubstring('hello.world@gmail.com', 'h')).toEqual([0, 5])
        expect(containsSubstring('hello.world@gmail.com', 'ld')).toEqual([6, 11])
    })

})
