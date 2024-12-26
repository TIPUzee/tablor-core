import { PrimitiveTypesAsString } from '../../stores/items-store/interfaces'


/**
 * A strategy to match a word in a query string with a word in an item.
 *
 * - `ExactMatch`: The word in the item must match the word in the query string exactly.
 * - `Contains`: The word in the item must contain the word in the query string.
 * - `StartsWith`: The word in the item must start with the word in the query string.
 * - `EndsWith`: The word in the item must end with the word in the query string.
 */
export type WordMatchStrategy = 'ExactMatch' | 'Contains' | 'StartsWith' | 'EndsWith'

/**
 * Options for processing a string query.
 */
export type StringQueryOpts<T> = {
    /**
     * A query string or an array of query strings. (Default: "")
     */
    query: string | string[];

    /**
     * An array of fields to search in. (Default: [])
     */
    includeFields?: (keyof T)[];

    /**
     * An array of fields to exclude from search. (Default: [])
     */
    excludeFields?: (keyof T)[];

    /**
     * A strategy to match a word in a query string with a word in an item. (Default: "ExactMatch")
     */
    singleWordMatchCriteria?: WordMatchStrategy;

    /**
     * Whether all words in the query must be matched in the item. (Default: false)
     */
    mustMatchAllWords?: boolean;

    /**
     * Whether the words in the query must be matched in the same order as they appear in the query. (Default: false)
     */
    wordsMustBeInOrder?: boolean;

    /**
     * An array of primitive types to convert to strings. (Default: [])
     */
    convertNonStringTypes?: PrimitiveTypesAsString[]

    /**
     * Whether to ignore whitespace in the query and item. (Default: false)
     */
    ignoreWhitespace?: boolean;

    /**
     * The separator between words in the query. (Default: " ")
     */
    wordSeparator?: string;

    /**
     * Whether the search is case-sensitive. (Default: false)
     */
    isCaseSensitive?: boolean;
}


/**
 * Options for processing a string query.
 */
export type ProcStringQueryOpts<T> = {
    /**
     * A query string or an array of query strings.
     */
    query: string | string[];

    /**
     * An array of fields to search in.
     */
    words: string[];

    /**
     * An array of fields to exclude from search.
     */
    includeFields: (keyof T)[];

    /**
     * An array of fields to exclude from search.
     */
    excludeFields: (keyof T)[];

    /**
     * A strategy to match a word in a query string with a word in an item.
     */
    singleWordMatchCriteria: WordMatchStrategy;

    /**
     * Whether all words in the query must be matched in the item.
     */
    mustMatchAllWords: boolean;

    /**
     * Whether the words in the query must be matched in the same order as they appear in the query.
     */
    wordsMustBeInOrder: boolean;

    /**
     * An array of primitive types to convert to strings.
     */
    convertNonStringTypes: PrimitiveTypesAsString[]

    /**
     * Whether to ignore whitespace in the query and item.
     */
    ignoreWhitespace: boolean;

    /**
     * The separator between words in the query.
     */
    wordSeparator: string;

    /**
     * Whether the search is case-sensitive.
     */
    isCaseSensitive: boolean;
}
