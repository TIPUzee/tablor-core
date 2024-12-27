import { StringQueryOpts, ProcStringQueryOpts } from '../string-query-searcher/interfaces'
import {
    DateRangesOpts,
    ProcDateRangesOpts,
} from '../date-ranges-searcher/interfaces'
import { NumberRangesOpts, ProcNumberRangesOpts } from '../numbers-range-searcher/interfaces'
import { CustomOpts, ProcCustomOpts } from '../custom-searcher/interfaces'
import { VoidOpts, ProcessedVoidOptions } from '../void-searcher/interfaces'
import { ExactValuesOpts, ProcExactValuesOpts } from '../exact-values-searcher/interfaces'
import { ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'


/**
 * Represents the behavior for handling previous search results.
 */
export type PrevResultsBehavior =
    | {
    /**
     * Retains all previous results without modification.
     */
    action: 'Keep';
}
    | {
    /**
     * Clears all previous results before performing a new search.
     */
    action: 'Clear';
    scope: 'All';
}
    | {
    /**
     * Clears a single result from the previous results based on the specified target.
     * - `target: 'Last'`: Clears the last result in the previous results.
     * - `target: 'LastIfSameType'`: Clears the last result if it matches the type of the new search criteria.
     * - `target: number`: Clears the result at the specified index in the previous results.
     * Use minus one (-1) to clear the last result.
     */
    action: 'Clear';
    scope: 'Single';
    target: 'Last' | 'LastIfSameType' | number;
}

/**
 * Represents the processed behavior for handling previous search results.
 */
export type ProcessedPrevResultsBehavior =
    | {
    /**
     * Retains all previous results without modification.
     */
    action: 'Keep';
}
    | {
    /**
     * Clears all previous results before performing a new search.
     */
    action: 'Clear';
    scope: 'All';
}
    | {
    /**
     * Clears a single result from the previous results based on the specified target.
     * - `target: number`: Clears the result at the specified index in the previous results.
     * -1 means nothing to clear.
     */
    action: 'Clear';
    scope: 'Single';
    target: 'Last' | 'LastIfSameType' | number;
}
/**
 * Represents the target scope for a new search operation.
 */
type SearchTarget = {
    /**
     * Specifies the scope of items to search within:
     * - `scope: 'All'`: Perform the search across all items, ignoring any previous results.
     * - `scope: 'Prev'`: Restrict the search to items that were part of the previous results.
     */
    scope: 'All' | 'Prev';
};

/**
 * Represents the search behavior of a new search.
 * - Whether to clear the previous results or keep them.
 * - Whether to perform a new search on all items or on the previous results.
 *
 * @property prevResults - The behavior of the previous results.
 * @property searchTarget - The target of the new search.
 * @property revertResultsAtEnd - Indicates whether the current search results should be reverted to include items
 * that do not match the current search criteria.
 *
 * @useCases
 * - Search has already been performed on transactions of a specific user.
 * Now we want to search his transactions on a specific date range.
 * <br>
 * - Search has already been performed on transactions of a specific user on a specific date range.
 * Now we want to search his transactions on a different date range
 * <br>
 * - Search has already been performed on transactions of a specific user on a specific date range.
 * Now we want to search his incoming transactions on the same date range.
 */
export type SearchBehavior = {
    /**
     * Defines how the previous results should be handled during a new search.
     * - `{ action: 'Keep' }`: Retain all previous results without modifications.
     * - `{ action: 'Clear', scope: 'All' }`: Clear all previous results before performing a new search.
     * - `{ action: 'Clear', scope: 'Single', target: 'Last' }`: Clear only the last result in the previous results.
     * - `{ action: 'Clear', scope: 'Single', target: 'LastIfSameType' }`: Clear the last result
     * if it matches the type of the new search criteria.
     * - `{ action: 'Clear', scope: 'Single', target: 'Specific', targetIndex: number }`:
     * Clear a specific result based on its index in the previous results list.
     */
    prevResults?: PrevResultsBehavior,

    /**
     * Specifies the target items for the new search operation.
     * - `{ scope: 'All' }`: Perform the search across all items, ignoring previous results.
     * - `{ scope: 'Prev' }`: Restrict the search to items matched in the previous results.
     */
    searchTarget?: SearchTarget,

    /**
     * Indicates whether to revert the current search results at the end of the search operation.
     * When set to `true`, the current search results (those resulting from the current search query) will be reverted to
     * include items that do not meet the search criteria.
     * This effectively replaces the current search results
     * with items that are excluded from the query.
     *
     * @useCases
     * If a date range is provided for a search and `revertResultsAtEnd` is set to `true`, the resulting set
     * will include items that fall outside the specified date range.
     */
    revertResultsAtEnd?: boolean
}

/**
 * Represents the processed search behavior of a new search.
 * - Whether to clear the previous results or keep them.
 * - Whether to perform a new search on all items or on the previous results.
 *
 * @property prevResults - The behavior of the previous results.
 * @property searchTarget - The target of the new search.
 * @property revertResultsAtEnd - Indicates whether the current search results should be reverted to include items
 * that do not match the current search criteria.
 *
 * @useCases
 * - Search has already been performed on transactions of a specific user.
 * Now we want to search his transactions on a specific date range.
 * <br>
 * - Search has already been performed on transactions of a specific user on a specific date range.
 * Now we want to search his transactions on a different date range
 * <br>
 * - Search has already been performed on transactions of a specific user on a specific date range.
 * Now we want to search his incoming transactions on the same date range.
 */
export type ProcessedSearchBehavior = {
    /**
     * Defines how the previous results should be handled during a new search.
     * - `{ action: 'Keep' }`: Retain all previous results without modifications.
     * - `{ action: 'Clear', scope: 'All' }`: Clear all previous results before performing a new search.
     * - `{ action: 'Clear', scope: 'Single', target: 'Last' }`: Clear only the last result in the previous results.
     * - `{ action: 'Clear', scope: 'Single', target: 'LastIfSameType' }`: Clear the last result
     * if it matches the type of the new search criteria.
     * - `{ action: 'Clear', scope: 'Single', target: 'Specific', targetIndex: number }`:
     * Clear a specific result based on its index in the previous results list.
     */
    prevResults: ProcessedPrevResultsBehavior,

    /**
     * Specifies the target items for the new search operation.
     * - `{ scope: 'All' }`: Perform the search across all items, ignoring previous results.
     * - `{ scope: 'Prev' }`: Restrict the search to items matched in the previous results.
     */
    searchTarget: SearchTarget,

    /**
     * Indicates whether to revert the current search results at the end of the search operation.
     * When set to `true`, the current search results (those resulting from the current search query) will be reverted to
     * include items that do not meet the search criteria.
     * This effectively replaces the current search results
     * with items that are excluded from the query.
     *
     * @useCases
     * If a date range is provided for a search and `revertResultsAtEnd` is set to `true`, the resulting set
     * will include items that fall outside the specified date range.
     */
    revertResultsAtEnd: boolean
}
/**
 * Represents options for a draft search with string query functionality.
 * Extends `SearchOptions` with `DraftStringQueryOptions<T>`.
 *
 * @template T - The base type for the draft search options.
 */
export type DraftStringQuerySearchOptions<T> = SearchBehavior & StringQueryOpts<T>

/**
 * Represents options for a processed search with string query functionality.
 * Extends `SearchOptions` with `ProcessedStringQueryOptions<T>` and includes an identifier for the type of search.
 *
 * @template T - The base type for the processed search options.
 */
export type ProcessedStringQuerySearchOptions<T> = ProcessedSearchBehavior & ProcStringQueryOpts<T> & {
    by: 'StringQuery';
}

/**
 * Represents options for a draft search with date-time range query functionality.
 * Extends `SearchOptions` with `DraftDateTimesRangesOptions<T>`.
 *
 * @template T - The base type for the draft date-time range search options.
 */
export type DraftDateRangeSearchOptions<T> = SearchBehavior & DateRangesOpts<T>

/**
 * Represents options for a processed search with date-time range query functionality.
 * Extends `SearchOptions` with `ProcessedDateTimeRangesOptions<T>` and includes an identifier for the type of search.
 *
 * @template T - The base type for the processed date-time range search options.
 */
export type ProcessedDateTimeRangeSearchOptions<T> = ProcessedSearchBehavior & ProcDateRangesOpts<T> & {
    by: 'DateTimesRanges';
};

/**
 * Represents options for a draft search with number range query functionality.
 * Extends `SearchOptions` with `DraftNumbersRangesOptions<T>`.
 *
 * @template T - The base type for the draft number range search options.
 */
export type DraftNumberRangeSearchOptions<T> = SearchBehavior & NumberRangesOpts<T>

/**
 * Represents options for a processed search with number range query functionality.
 * Extends `SearchOptions` with `ProcessedNumbersRangesOptions<T>` and includes an identifier for the type of search.
 *
 * @template T - The base type for the processed number range search options.
 */
export type ProcessedNumberRangeSearchOptions<T> = ProcessedSearchBehavior & ProcNumberRangesOpts<T> & {
    by: 'NumbersRanges';
};

/**
 * Represents options for a draft search with custom query functionality.
 * Extends `SearchOptions` with `DraftCustomOptions<T>`.
 *
 * @template T - The base type for the draft custom search options.
 */
export type DraftCustomSearchOptions<T> = SearchBehavior & CustomOpts<T>

/**
 * Represents options for a processed search with custom query functionality.
 * Extends `SearchOptions` with `ProcessedCustomOptions<T>` and includes an identifier for the type of search.
 *
 * @template T - The base type for the processed custom search options.
 */
export type ProcessedCustomSearchOptions<T> = ProcessedSearchBehavior & ProcCustomOpts<T> & {
    by: 'CustomFn';
};

/**
 * Represents options for a draft search with void query functionality.
 * Extends `SearchOptions` with `DraftVoidOptions<T>`.
 *
 * @template T - The base type for the draft void search options.
 */
export type DraftVoidSearchOptions<T> = SearchBehavior & VoidOpts<T>

/**
 * Represents options for a processed search with void query functionality.
 * Extends `SearchOptions` with `ProcessedVoidOptions<T>` and includes an identifier for the type of search.
 *
 * @template T - The base type for the processed void search options.
 */
export type ProcessedVoidSearchOptions<T> = ProcessedSearchBehavior & ProcessedVoidOptions<T> & {
    by: 'Void';
};

/**
 * Represents options for a draft search with exact value query functionality.
 * Extends `SearchOptions` with `DraftExactValuesOptions<T>`.
 *
 * @template T - The base type for the draft exact value search options.
 */
export type DraftExactValueSearchOptions<T> = SearchBehavior & ExactValuesOpts<T>

/**
 * Represents options for a processed search with exact value query functionality.
 * Extends `SearchOptions` with `ProcessedExactValuesOptions<T>` and includes an identifier for the type of search.
 *
 * @template T - The base type for the processed exact value search options.
 */
export type ProcessedExactValueSearchOptions<T> = ProcessedSearchBehavior & ProcExactValuesOpts<T> & {
    by: 'ExactValues';
};

export type DraftSearchableOptions<T> =
    | DraftStringQuerySearchOptions<T>
    | DraftDateRangeSearchOptions<T>
    | DraftNumberRangeSearchOptions<T>
    | DraftCustomSearchOptions<T>
    | DraftVoidSearchOptions<T>
    | DraftExactValueSearchOptions<T>;

/**
 * Represents the different types of processed searchable options.
 * This type is a union of various processed search options, each specifying a particular kind of search functionality.
 *
 * @template T - The base type for the searchable options.
 */
export type ProcessedSearchableOptions<T> =
/**
 * Represents processed search options for string query functionality.
 */
    ProcessedStringQuerySearchOptions<T>

    /**
     * Represents processed search options for date-time range query functionality.
     */
    | ProcessedDateTimeRangeSearchOptions<T>

    /**
     * Represents processed search options for number range query functionality.
     */
    | ProcessedNumberRangeSearchOptions<T>

    /**
     * Represents processed search options for custom query functionality.
     */
    | ProcessedCustomSearchOptions<T>

    /**
     * Represents processed search options for void query functionality.
     */
    | ProcessedVoidSearchOptions<T>

    /**
     * Represents processed search options for exact value query functionality.
     */
    | ProcessedExactValueSearchOptions<T>;

/************** Event Payloads **************/

/**
 * Represents the payload for the `ItemsSearched` event.
 *
 * @property options - The new options.
 * @property prevOptions - The previous options.
 * @property searchResults - The search results.
 * @property prevSearchResults - The previous search results.
 *
 * @remarks
 * This payload won't be triggered on item removal or addition.
 * This payload will only be triggered on user search.
 */
export type ItemsSearchedPayload<T extends Item<T>> = {
    options: Readonly<ProcessedSearchableOptions<T>[]>,
    prevOptions: Readonly<ProcessedSearchableOptions<T>[]>,
    searchResults: Readonly<ImmutableAugmentedItem<T>[]>,
    prevSearchResults: Readonly<ImmutableAugmentedItem<T>[]>,
}

/**
 * Represents the payload for the `SearchOptionsChanged` event.
 *
 * @property options - The new options.
 * @property prevOptions - The previous options.
 */
export type SearchOptionsChangedPayload<T extends Item<T>> = {
    options: Readonly<ProcessedSearchableOptions<T>[]>,
    prevOptions: Readonly<ProcessedSearchableOptions<T>[]>,
}

/**
 * Represents the payload for the `SearchedItemsChanged` event.
 *
 * @property searchResults - The search results.
 * @property prevSearchResults - The previous search results.
 *
 * @remarks
 * This payload will be triggered on item removal and addition.
 * This payload will also be triggered on user search.
 */
export type SearchedItemsChangedPayload<T extends Item<T>> = {
    searchResults: Readonly<ImmutableAugmentedItem<T>[]>,
    prevSearchResults: Readonly<ImmutableAugmentedItem<T>[]>,
}
