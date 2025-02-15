import {
    ImmutableAugmentedItem,
    Item,
} from '../../stores/items-store/interfaces'
import { ProcessedField } from '../../stores/fields-store/interfaces'
import { DraftStringQueryOptions, ProcessedStringQueryOptions } from './interfaces'


/**
 * String query searcher.
 */
export class StringQuerySearcher<T extends Item<T>>
{

    constructor(
        protected readonly getFields: () => ProcessedField<T, keyof T>[],
        protected readonly hasField: (key: keyof T) => boolean,
    )
    { }


    /**
     * Processes string query options.
     */
    processOptions(options: DraftStringQueryOptions<T>): ProcessedStringQueryOptions<T>
    {
        let includeFields: ProcessedStringQueryOptions<T>['includeFields']
        let excludeFields = options.excludeFields || []

        if (options.includeFields === undefined)
            includeFields = this.getFields()
                .map(field => field.key)
                .filter(field => !excludeFields.includes(field))
        else
            includeFields = options.includeFields

        const newOptions: ProcessedStringQueryOptions<T> = {
            query: options.query,
            words: [],

            includeFields: includeFields,

            wordsInOrder: options.wordsInOrder === undefined ? false : options.wordsInOrder,

            consecutiveWords: options.consecutiveWords === undefined ? false : options.consecutiveWords,

            singleWordMatchCriteria: options.singleWordMatchCriteria !== undefined ?
                                     options.singleWordMatchCriteria :
                                     'Contains',

            requireAllWords: options.requireAllWords === undefined ? true : options.requireAllWords,

            convertToString: {
                string: s => s,
                null: undefined,
                undefined: undefined,
                boolean: undefined,
                number: undefined,
                date: undefined,
            },

            ignoreWhitespace: options.ignoreWhitespace === undefined ? true : options.ignoreWhitespace,

            wordSeparators: options.wordSeparators === undefined ? [' '] : options.wordSeparators,

            isCaseSensitive: options.isCaseSensitive === undefined ? false : options.isCaseSensitive,
        }

        if (options.convertToString)
        {
            // @ts-ignore
            newOptions.convertToString = {
                string: undefined,
                null: undefined,
                undefined: undefined,
                boolean: undefined,
                number: undefined,
                date: undefined,
                ...options.convertToString,
            }
        }

        if (!options.query) return newOptions

        newOptions.words = this.genQuerySplitterIntoWords(
            newOptions.wordSeparators,
            newOptions.ignoreWhitespace,
            newOptions.isCaseSensitive,
        )(newOptions.query)

        return newOptions
    }


    /**
     * Checks if the given options are valid.
     */
    checkKeys(options: ProcessedStringQueryOptions<T>): boolean
    {
        for (const field of options.includeFields)
        {
            if (!this.hasField(field))
                return false
        }

        return true
    }


    /**
     * Search items by string query.
     */
    public search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcessedStringQueryOptions<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        if (options.words.length === 0)
            return items

        if (options.includeFields.length === 0) return []

        return this._search(
            items,
            options,
        )
    }


    /**
     * Search items by string query.
     */
    protected _search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcessedStringQueryOptions<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        const searchedItems: ImmutableAugmentedItem<T>[] = []

        const splitQueryIntoWords = this.genQuerySplitterIntoWords(
            options.wordSeparators,
            options.ignoreWhitespace,
            options.isCaseSensitive,
        )

        const matchWords = this.genWordsMatcherFn(options)

        const matchPhrases = this.genPhrasesMatcherFn(matchWords, options)

        items.forEach((item) =>
        {
            const itemWords: string[][] = []

            for (const field of options.includeFields)
            {
                if (field === 'tablorMeta')
                    throw new Error('Cannot search by tablorMeta field')

                const valueType: string =
                    item[field] as any instanceof Date ? 'date' :
                    item[field] === null ? 'null' : typeof item[field]

                // @ts-ignore
                if (options.convertToString[valueType] === undefined)
                    continue

                // @ts-ignore
                let value: string = options.convertToString[valueType](item[field])

                const valueWords: string[] = splitQueryIntoWords(value)

                if (valueWords.length === 0)
                    continue

                itemWords.push(valueWords)
            }

            if (itemWords.length === 0)
                return

            const itemPassed = matchPhrases(options.words, itemWords)

            if (itemPassed)
                searchedItems.push(item)
        })

        return searchedItems
    }


    /**
     * Generates field value extractor function.
     */
    protected genQuerySplitterIntoWords(
        wordSeparators: ProcessedStringQueryOptions<T>['wordSeparators'],
        ignoreWhitespace: boolean,
        isCaseSensitive: boolean,
    ): (query: string) => (string)[]
    {
        const wordsSeparatorFns = wordSeparators.map(separator =>
        {
            if (typeof separator === 'string')
                return (query: string) => query.split(separator)
            else if (typeof separator === 'function')
                return separator
            else if (separator instanceof RegExp)
                return (query: string) => query.split(separator)
            else
                throw new Error('Invalid word separator')
        })

        return (query: string) =>
        {
            let words: string[] = [query]

            for (const separatorFn of wordsSeparatorFns)
            {
                words = words.map(word => separatorFn(word)).flat()
            }

            if (ignoreWhitespace)
                words = words.map(word => word.trim())

            words = words.filter(word => word.length > 0)

            if (!isCaseSensitive)
                words = words.map(word => word.toLowerCase())

            return words
        }
    }


    protected genWordsMatcherFn(
        options: ProcessedStringQueryOptions<T>,
    ): (subWord: string, word: string) => boolean
    {
        switch (options.singleWordMatchCriteria)
        {
            case 'ExactMatch':
                return (subWord, word) => subWord === word
            case 'Contains':
                return (subWord, word) => word.includes(subWord)
            case 'StartsWith':
                return (subWord, word) => word.startsWith(subWord)
            case 'EndsWith':
                return (subWord, word) => word.endsWith(subWord)
        }
    }


    protected genPhrasesMatcherFn(
        wordsMatcherFn: (subWord: string, word: string) => boolean,
        options: ProcessedStringQueryOptions<T>,
    ): (searchWords: string[], itemWords: string[][]) => boolean
    {
        if (options.requireAllWords)
        {
            if (options.wordsInOrder)
            {
                if (options.consecutiveWords)
                {
                    return (sw, iw) =>
                    {
                        // start with
                        // iw: [ [ Fill Full Screen With Gray Color ], [ Command Set Ok Color ] ]
                        // sw: f s wi: true
                        // sw: f s g: false
                        // sw: g c c: false
                        // sw: g c o: true

                        for (let itemFieldWords of iw)
                        {
                            for (
                                let fieldWordIndex = 0;
                                fieldWordIndex <= itemFieldWords.length - sw.length;
                                fieldWordIndex++
                            )
                            {
                                let match = true
                                for (let searchWordIndex = 0; searchWordIndex < sw.length; searchWordIndex++)
                                {
                                    if (!wordsMatcherFn(
                                        sw[searchWordIndex],
                                        itemFieldWords[fieldWordIndex + searchWordIndex],
                                    ))
                                    {
                                        match = false
                                        break
                                    }
                                }
                                if (match) return true
                            }
                        }
                        return false
                    }
                }
                else
                {
                    return (sw, iw) =>
                    {
                        // start with
                        // iw: [ [ Fill Full Screen With Gray Color ], [ Command Set Ok Color ] ]
                        // sw: f s wi: true
                        // sw: f s g: true
                        // sw: g c c: false
                        // sw: g c o: false

                        for (let itemFieldWords of iw)
                        {
                            let currentIndex = 0
                            let isMatched = true

                            for (let i = 0; i < sw.length; i++)
                            {
                                let found = false
                                for (let j = currentIndex; j < itemFieldWords.length; j++)
                                {
                                    if (wordsMatcherFn(sw[i], itemFieldWords[j]))
                                    {
                                        found = true
                                        currentIndex = j + 1
                                        break
                                    }
                                }
                                if (!found)
                                {
                                    isMatched = false
                                    break
                                }
                            }
                            if (isMatched) return true
                        }
                        return false
                    }
                }
            }
            else
            {
                if (options.consecutiveWords)
                {
                    const isPermutationMatch = (sw: string[], slice: string[], wordsMatcherFn: Function): boolean =>
                    {
                        const matchedIndices = new Set<number>()

                        for (let i = 0; i < sw.length; i++)
                        {
                            let found = false

                            for (let j = 0; j < slice.length; j++)
                            {
                                if (!matchedIndices.has(j) && wordsMatcherFn(sw[i], slice[j]))
                                {
                                    matchedIndices.add(j)
                                    found = true
                                    break
                                }
                            }
                            if (!found) return false
                        }
                        return true
                    }

                    return (sw, iw) =>
                    {
                        // start with
                        // iw: [ [ Fill Full Screen With Gray Color ], [ Command Set Ok Color ] ]
                        // sw: wi f s: true
                        // sw: g f s: false
                        // sw: c c s: false
                        // sw: s c o: true

                        for (let itemFieldWords of iw)
                        {
                            for (let i = 0; i <= itemFieldWords.length - sw.length; i++)
                            {
                                const slice = itemFieldWords.slice(i, i + sw.length)

                                if (isPermutationMatch(sw, slice, wordsMatcherFn))
                                {
                                    return true
                                }
                            }
                        }
                        return false
                    }
                }
                else
                {
                    return (sw, iw) =>
                    {
                        // start with
                        // iw: [ [ Fill Full Screen With Gray Color ], [ Command Set Ok Color ] ]
                        // sw: s c wi: true
                        // sw: s f g: true

                        return sw.every((word) => iw.flat().some((itemWord) => wordsMatcherFn(word, itemWord)))
                    }
                }
            }
        }
        else
        {
            return (sw, iw) =>
            {
                // start with
                // iw: [ [ Fill Full Screen With Gray Color ], [ Command Set Ok Color ] ]
                // sw: s a t: true
                // sw: a l l: false
                // sw: o m m: true

                return sw.some((word) => iw.flat().some((itemWord) => wordsMatcherFn(word, itemWord)))
            }
        }
    }
}
