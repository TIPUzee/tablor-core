import {
    ImmutableAugmentedItem,
    PrimitiveTypesAsString,
    Item,
} from '../../stores/items-store/interfaces'
import { FieldsStore } from '../../stores/fields-store/fields-store'
import { StringQueryOpts, ProcStringQueryOpts } from './interfaces'
import { containsSubstring } from './searcher-utils/utils'


/**
 * String query searcher.
 */
export class StringQuerySearcher<T extends Item<T>>
{

    constructor(
        protected readonly fieldsStore: FieldsStore<T>,
    )
    { }


    /**
     * Processes string query options.
     */
    processOptions(options: StringQueryOpts<T>): ProcStringQueryOpts<T>
    {
        const newOptions: ProcStringQueryOpts<T> = {
            query: options.query !== undefined ? options.query : '',
            words: [],

            includeFields: options.includeFields || [],
            excludeFields: options.excludeFields || [],

            singleWordMatchCriteria: options.singleWordMatchCriteria !== undefined ?
                                     options.singleWordMatchCriteria :
                                     'Contains',
            mustMatchAllWords: options.mustMatchAllWords === undefined ? true : options.mustMatchAllWords,
            wordsMustBeInOrder: options.wordsMustBeInOrder === undefined ? false : options.wordsMustBeInOrder,
            convertNonStringTypes: options.convertNonStringTypes === undefined ?
                                   (['string', 'number', 'boolean', 'date'] as PrimitiveTypesAsString[]) :
                                   options.convertNonStringTypes,

            ignoreWhitespace: options.ignoreWhitespace === undefined ? true : options.ignoreWhitespace,
            wordSeparator: options.wordSeparator === undefined ? ' ' : options.wordSeparator,
            isCaseSensitive: options.isCaseSensitive === undefined ? false : options.isCaseSensitive,
        }

        if (newOptions.includeFields.length === 0)
            newOptions.includeFields = this.fieldsStore.getFieldsAsArray()
                .map(field => field.key)
                .filter(field => !newOptions.excludeFields.includes(field))

        if (!options.query) return newOptions

        newOptions.words = this.genQuerySplitterIntoWords(
            newOptions.wordSeparator,
            newOptions.ignoreWhitespace,
            newOptions.isCaseSensitive,
        )(newOptions.query)

        return newOptions
    }


    /**
     * Search items by string query.
     */
    public search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcStringQueryOpts<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        if (options.words.length === 0)
            return items

        if (options.includeFields.length === 0) return []

        const fieldValueExtractorFn
            = this.genFieldValueExtractorFn(options.isCaseSensitive)

        return this._search(
            items,
            options,
            fieldValueExtractorFn,
        )
    }


    /**
     * Generates field value extractor function.
     */
    protected genQuerySplitterIntoWords(
        wordSeparator: string = ' ',
        ignoreWhitespace: boolean = true,
        isCaseSensitive: boolean = false,
    ): (query: string | string[]) => (string)[]
    {
        return (query: string | string[]) =>
        {
            const combinedQuery = Array.isArray(query) ? query.join(wordSeparator) : query

            let words = combinedQuery.split(wordSeparator)

            if (ignoreWhitespace)
                words = words.map(word => word.trim())

            words = words.filter(word => word.length > 0)

            if (!isCaseSensitive)
                words = words.map(word => word.toLowerCase())

            return words
        }
    }


    /**
     * Search items by string query.
     */
    protected _search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcStringQueryOpts<T>,
        fieldValueExtractor: (item: ImmutableAugmentedItem<T>, field: keyof T) => string,
    ): ImmutableAugmentedItem<T>[]
    {
        const searchedItems: ImmutableAugmentedItem<T>[] = []

        items.forEach((item) =>
        {
            const matchedSubstrings: [number, number][] = []
            const wordsMatchStatus: boolean[] = Array(options.words.length).fill(false)

            for (const field of options.includeFields)
            {
                if (field === 'tablorMeta') continue

                if (!options.includeFields.includes(field as keyof T))
                    continue

                if (item[field as keyof T] === null || item[field as keyof T] === undefined)
                    continue

                const valType = typeof item[field as keyof T] !== 'object' ?
                                (typeof item[field as keyof T] as PrimitiveTypesAsString) :
                                (item[field as keyof T] as any) instanceof Date ? 'date' : 'string'

                if (valType === 'date')
                    continue

                if (!options.convertNonStringTypes.includes(valType))
                    continue

                let fieldValue = fieldValueExtractor(item, field as keyof T)

                for (let i = 0; i < options.words.length; i++)
                {
                    if (options.words[i] === '' || wordsMatchStatus[i])
                        continue

                    const [wordStart, wordEnd] = containsSubstring(fieldValue, options.words[i])

                    if (wordStart === undefined && wordEnd === undefined)
                        continue

                    if (
                        options.wordsMustBeInOrder && matchedSubstrings.length > 0 &&
                        wordStart < matchedSubstrings[matchedSubstrings.length - 1][1]
                    )
                        continue

                    if (
                        matchedSubstrings.some(substring =>
                            (wordStart >= substring[0] && wordStart < substring[1]) ||
                            (wordEnd > substring[0] && wordEnd <= substring[1]),
                        )
                    )
                        continue

                    wordsMatchStatus[i] = true
                    matchedSubstrings.push([wordStart, wordEnd])

                    fieldValue = fieldValue.replace(fieldValue.substring(wordStart, wordEnd), '')

                    if (matchedSubstrings.length === options.words.length)
                    {
                        searchedItems.push(item)
                        break
                    }
                }
            }
        })

        return searchedItems
    }


    /**
     * Generates field value extractor function.
     */
    protected genFieldValueExtractorFn(isCaseSensitive: boolean): (
        item: ImmutableAugmentedItem<T>,
        field: keyof T,
    ) => string
    {
        if (isCaseSensitive)
            return (item, field) => String(item[field])

        return (item, field) => String(item[field]).toLowerCase()
    }

}
