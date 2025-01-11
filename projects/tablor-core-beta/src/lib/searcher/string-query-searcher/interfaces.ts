import { Item } from '../../stores/items-store/interfaces'


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
 * Fields to include in the search.
 */
export type DraftStringQueryFieldIncludeOptions<T extends Item<T>> =
    | {
    /**
     * An array of fields to exclude from search.
     */
    includeFields?: (keyof T)[];

    /**
     * An array of fields to exclude from search.
     */
    excludeFields?: never[];
}
    | {
    /**
     * An array of fields to exclude from search.
     */
    includeFields?: never[];

    /**
     * An array of fields to exclude from search.
     */
    excludeFields: (keyof T)[];
}

/**
 * Draft options for processing a string query.
 */
export type DraftStringQueryOptions<T extends Item<T>> = DraftStringQueryFieldIncludeOptions<T> & {
    /**
     * A query string. (Default: "")
     */
    query: string;

    /**
     * Whether the words in the query must be matched in the same order as they appear in the query.
     */
    wordsInOrder?: boolean;

    /**
     * Whether the words in the query must be matched in a consecutive manner as they appear in the query.
     */
    consecutiveWords?: boolean;

    /**
     * A strategy to match a word in a query string with a word in an item. (Default: "ExactMatch")
     */
    singleWordMatchCriteria?: WordMatchStrategy;

    /**
     * Whether all words in the query must be matched in the item. (Default: false)
     */
    requireAllWords?: boolean;

    /**
     * An object of functions to convert any types to strings.
     */
    convertToString?: {
        /**
         * A function to convert a string to a string. Undefined if you do not want to perform search on strings.
         */
        string?: (val: string) => string

        /**
         * A function to convert a null to a string. Undefined if you do not want to perform search on null.
         */
        null?: (val: null) => string

        /**
         * A function to convert an undefined to a string. Undefined if you do not want to perform search on undefined.
         */
        undefined?: (val: undefined) => string

        /**
         * A function to convert a boolean to a string. Undefined if you do not want to perform search on booleans.
         */
        boolean?: (val: boolean) => string

        /**
         * A function to convert a number to a string. Undefined if you do not want to perform search on numbers.
         */
        number?: (val: number) => string

        /**
         * A function to convert a date to a string. Undefined if you do not want to perform search on dates.
         */
        date?: (val: Date) => string
    }

    /**
     * Whether to ignore whitespace in the query and item. (Default: false)
     */
    ignoreWhitespace?: boolean;

    /**
     * An array of word separators. (Default: [ " " ])
     */
    wordSeparators?: (string | RegExp | ((query: string) => string[]))[];

    /**
     * Whether the search is case-sensitive. (Default: false)
     */
    isCaseSensitive?: boolean;
}

/**
 * Processed options a string query.
 */
export type ProcessedStringQueryOptions<T extends Item<T>> = {
    /**
     * An array of fields to include for search.
     */
    includeFields: (keyof T)[];

    /**
     * A query string.
     */
    query: string;

    /**
     * An array of fields to search in.
     */
    words: string[];

    /**
     * Whether the words in the query must be matched in the same order as they appear in the query.
     */
    wordsInOrder: boolean;

    /**
     * Whether the words in the query must be matched in a consecutive manner as they appear in the query.
     */
    consecutiveWords: boolean;

    /**
     * A strategy to match a word in a query string with a word in an item.
     */
    singleWordMatchCriteria: WordMatchStrategy;

    /**
     * Whether all words in the query must be matched in the item.
     */
    requireAllWords: boolean;

    /**
     * An object of functions to convert any types to string.
     */
    convertToString: {
        /**
         * A function to convert a string to a string. Undefined if you do not want to perform search on strings.
         */
        string?: (val: string) => string

        /**
         * A function to convert a null to a string. Undefined if you do not want to perform search on null.
         */
        null?: (val: null) => string

        /**
         * A function to convert an undefined to a string. Undefined if you do not want to perform search on undefined.
         */
        undefined?: (val: undefined) => string

        /**
         * A function to convert a boolean to a string. Undefined if you do not want to perform search on booleans.
         */
        boolean?: (val: boolean) => string

        /**
         * A function to convert a number to a string. Undefined if you do not want to perform search on numbers.
         */
        number?: (val: number) => string

        /**
         * A function to convert a date to a string. Undefined if you do not want to perform search on dates.
         */
        date?: (val: Date) => string
    }

    /**
     * Whether to ignore whitespace in the query and item.
     */
    ignoreWhitespace: boolean;

    /**
     * An array of word separators.
     */
    wordSeparators: (string | RegExp | ((query: string) => string[]))[];

    /**
     * Whether the search is case-sensitive.
     */
    isCaseSensitive: boolean;
}
