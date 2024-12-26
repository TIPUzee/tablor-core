import { AugmentedItem, Item } from '../stores/items-store/interfaces'
import { ItemsStore } from '../stores/items-store/items-store'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { Selector } from '../selector/selector'
import { Searcher } from '../searcher/searcher/searcher'
import { Paginator } from '../paginator/paginator'
import { Sorter } from '../sorter/sorter'


/**
 * **TablorCore Class**
 *
 * A core functionality library for building flexible data tables, grids, and item lists in frameworks like Angular and React.
 *
 * ---
 *
 * **Core Functionalities**:
 * 1. **Pagination**:
 *    - Support for single-page and multiple-page data pagination.
 *
 * 2. **Searching**:
 *    - Advanced string query processing, including splitting into words and matching patterns like startsWith, endsWith, contains, and anywhere.
 *    - Ensure all query words match with `mustMatchAllWords`.
 *    - Filter by number ranges, date ranges, exact values, and inverted results.
 *    - Advanced searches like distance and priority filtering planned for future releases.
 *
 * 3. **Sorting**:
 *    - Single-field and multi-field hierarchical sorting.
 *
 * 4. **Selection**:
 *    - Programmatic selection and unselection of items.
 *
 * 5. **Fields**:
 *    - Define searchable fields during initialization.
 *
 * 6. **Items**:
 *    - Add, remove, and update items dynamically.
 *    - Support for both instant and lazy data loading (planned).
 *
 * 7. **Events**:
 *    - Emit events for actions like searching, sorting, and pagination to provide extensive customizability.
 *
 * ---
 *
 * **Features**:
 * - Focuses purely on core functionalities, with no UI.
 * - Highly extensible and designed for developers to adapt to their needs.
 *
 * ---
 *
 * **Get Started**:
 * - **GitHub Repository**: [TablorCore on GitHub](https://github.com/TIPUzee/TablorCore)
 *   Explore the repository for documentation, examples, and contribution guidelines.
 * - **NPM Package**: Search for `tablor-core` on [npmjs.com](https://www.npmjs.com/) to install and integrate this library into your projects.
 *
 * ---
 *
 * **Developed by**: Zeeshan Nadeem
 * **GitHub**: [TIPUzee](https://github.com/TIPUzee)
 * **License**: Apache-2.0
 *
 * ---
 *
 * **Open Source Contribution**:
 * Developers are encouraged to contribute, enhance functionality, and share ideas. Submit pull requests, raise issues, or provide feedback on GitHub to make this library better for the community.
 */
export class TablorCore<T extends Item<T>>
{
    protected readonly allItems: AugmentedItem<T>[] = []

    protected readonly allSearchedItems: AugmentedItem<T>[][] = []

    protected readonly fieldsStore: FieldsStore<T> = new FieldsStore<T>()

    protected readonly itemsStore: ItemsStore<T> =
        new ItemsStore<T>(this.allItems, this.fieldsStore)

    protected readonly selector = new Selector<T>(
        this.itemsStore,
        this.allItems,
        this.itemsStore.$itemsRemoved,
    )

    protected readonly searcher = new Searcher<T>(
        this.allItems,
        this.allSearchedItems,
        this.fieldsStore,
        this.itemsStore.$itemsAdded,
        this.itemsStore.$itemsRemoved,
        this.itemsStore.$itemsUpdated,
    )

    protected readonly sorter = new Sorter<T>(
        this.fieldsStore,
        this.allItems,
        this.allSearchedItems,
        this.itemsStore.$itemsAdded,
        this.itemsStore.$itemsUpdated,
        this.searcher.$searchedItemsChanged,
    )

    protected readonly paginator = new Paginator(
        this.searcher,
        this.itemsStore.$itemsRemoved,
        this.itemsStore.$itemsAdded,
        this.searcher.$searchedItemsChanged,
        this.sorter.$sortingOptionsChanged,
    )


    constructor() { }


    /** ------------ SEARCH METHODS ------------ */

    /**
     * Searches the items by multiple number ranges for multiple fields.
     *
     * @keywords `revert` - If reverted, all the _new searched_ items will be replaced by
     * non-searched items.
     *
     * @parameter options - An object with the following properties:
     *   - `ranges`: An object containing the number ranges for each field (fields as key, array of number ranges
     *     objects).
     *   - `mustMatchAllFields`: A boolean value indicating whether all fields must match the number ranges.
     *   - `searchBehavior`: A string value indicating the search behaviour (ClearPrev, SearchInPrev, MergeInPrev).
     *   - `revertResultsAtEnd`: A boolean value indicating whether to revert the results at the end of the search.
     *
     * @exampleUsage
     * ```typescript
     * tablor.searchByNumbersRanges({
     *     ranges: {
     *         field1: [{ min: 1, max: 10 }, { min: 20 }],
     *         field2: [{ max: 10 }],
     *     },
     *     mustMatchAllFields: true,  // Optional
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     */
    searchByNumbersRanges
        = this.searcher.searchByNumbersRanges.bind(this.searcher)

    /**
     * Searches the items by multiple exact values for multiple fields.
     *
     * @keywords `revert` - If reverted, all the _new searched_ items will be replaced by
     * non-searched items.
     *
     * @parameter options - An object with the following properties:
     *   - `values`: An object containing the exact values for each field (fields as key, array of exact values).
     * - `mustMatchAllFields`: A boolean value indicating whether all fields must match the number ranges.
     *  - `searchBehavior`: A string value indicating the search behaviour (ClearPrev, SearchInPrev, MergeInPrev).
     *   - `revertResultsAtEnd`: A boolean value indicating whether to revert the results at the end of the search.
     *
     * @exampleUsage
     * ```typescript
     * tablor.searchByExactValues({
     *     values: {
     *         field1: ['value1', 'value2'],
     *         field2: ['value3'],
     *     },
     *     customCompareFns: {  // Optional
     *         field2: (actualVal: Date, expectedVal: Date) => actualVal.getTime() === expectedVal.getTime(),
     *     },
     *     mustMatchAllFields: true,  // Optional
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     */
    searchByExactValues
        = this.searcher.searchByExactValues.bind(this.searcher)

    /**
     * Searches the items by one or multiple string queries.
     *
     * @keywords `revert` - If reverted, all the _new searched_ items will be replaced by
     * non-searched items.
     *
     * @parameter options - An object with the following properties:
     *   - `query`: A string query or an array of string queries.
     *   - `includeFields`: An array of fields to include in the search.
     *   If empty or not provided, then all fields will be included.
     *   **(Default: [])**
     *   - `excludeFields`: An array of fields to exclude from the search. **(Default: [])**
     *   - `singleWordMatchCriteria`: A string value indicating the match criteria for single-word queries.
     *   **(Default: 'Contains')**.
     *   `Contains`: Matches the substring anywhere in the word.
     *   `StartsWith`: Matches
     *   the substring at the beginning of the word.
     *   `EndsWith`: Matches the substring at the end of the
     *   word.
     *   `ExactMatch`: Matches the exact complete word.
     *   - `mustMatchAllWords`: A boolean value indicating whether all words must match the query.
     *   **(Default: true)**
     *   - `wordsMustBeInOrder`: A boolean value indicating whether the words must be in order.
     *   **(Default: false)**
     *   - `convertNonStringTypes`: An array of primitive types to convert to string before searching.
     *   **(Default: ['string', 'number', 'boolean', 'date'])**.
     *   NOTE: `date` is not yet supported.
     *   - `ignoreWhitespace`: A boolean value indicating whether to ignore whitespace in the query.
     *   **(Default: true)**
     *   - `wordSeparator`: A string value indicating the separator between words in the query.
     *   **(Default: " ")**
     *   - `isCaseSensitive`: A boolean value indicating whether the search is case-sensitive.
     *   **(Default: false)**
     *   - `searchBehavior`: A string value indicating the search behavior (ClearPrev, SearchInPrev, MergeInPrev).
     *   **(Default: 'ClearPrev')**
     *   - `revertResultsAtEnd`: A boolean value indicating whether to revert the results at the end of the search.
     *   **(Default: false)**
     *
     * @exampleUsage
     * ```typescript
     * tablor.searchByStringQuery({
     *     query: 'search query',
     *     includeFields: [],  // Optional
     *     excludeFields: ['field3'],  // Optional
     *     singleWordMatchCriteria: 'Contains',  // Optional
     *     mustMatchAllWords: true,  // Optional
     *     wordsMustBeInOrder: false,  // Optional
     *     convertNonStringTypes: ['number'],  // Optional
     *     ignoreWhitespace: true,  // Optional
     *     wordSeparator: ' ',  // Optional
     *     isCaseSensitive: false,  // Optional
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: false,  // Optional
     * })
     * ```
     */
    searchByStringQuery
        = this.searcher.searchByStringQuery.bind(this.searcher)

    /**
     * Searches the items by a void query.
     *
     * @keywords `revert` - If reverted, all the _new searched_ items will be replaced by
     * non-searched items.
     *
     * @parameter options - An object with the following properties:
     *   - `query`: A string query.
     *   - `searchBehavior`: A string value indicating the search behaviour (ClearPrev, SearchInPrev, MergeInPrev).
     *   - `revertResultsAtEnd`: A boolean value indicating whether to revert the results at the end of the search.
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.searchByVoid({
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     *
     * @remarks
     * - This method can be used to clear the search results.
     * - This method can be used to revert all the searched items.
     */
    searchByVoid
        = this.searcher.searchByVoid.bind(this.searcher)

    /**
     * Searches the items by date ranges for multiple fields.
     *
     * @keywords `revert` - If reverted, all the _new searched_ items will be replaced by
     * non-searched items.
     *
     * @parameter options - An object with the following properties:
     *   - `ranges`: An object containing the date ranges for each field (fields as a key, array of date ranges).
     *   - `searchBehavior`: A string value indicating the search behavior (ClearPrev, SearchInPrev, MergeInPrev).
     *   - `revertResultsAtEnd`: A boolean value indicating whether to revert the results at the end of the search.
     *
     * @exampleUsage
     * ```typescript
     * tablor.searchByDateTimesRanges({
     *     ranges: {
     *         hire_date: [
     *             {
     *                 start: new Date('2020-01-01'),
     *                 includeStart: true,
     *                 end: new Date('2021-01-01'),
     *                 includeEnd: false,
     *             },
     *         ],
     *     },
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.searchByDateTimesRanges({
     *     ranges: {
     *         hire_date: [
     *             {
     *                 start: '2020-01-01',
     *                 includeStart: true,
     *                 end: 'Now',
     *                 includeEnd: false,
     *             }
     *         ],
     *     },
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     *
     * @exampleUsage
     * ```typescript
     * tablor.searchByDateTimesRanges({
     *     ranges: {
     *         hire_date: [
     *             {
     *                 start: 'Now',
     *                 startOffset: {
     *                     years: -2,  // 2 years back from now
     *                 },
     *                 includeStart: true,
     *                 end: 'Now'
     *             }
     *         ],
     *     },
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     */
    searchByDateTimesRanges
        = this.searcher.searchByDateRanges.bind(this.searcher)

    /**
     * Searches the items by a custom function.
     *
     * @keywords `revert` - If reverted, all the _new searched_ items will be replaced by
     * non-searched items.
     *
     * @parameter options - An object with the following properties:
     *   - `customName`: A string name for the custom search.
     *   - `customFn`: A function that takes the following parameters:
     *     - `item`: The item to evaluate.
     *     - `items`: The list of all items.
     *     and returns a boolean.
     *   - `searchBehavior`: A string value indicating the search behaviour (ClearPrev, SearchInPrev, MergeInPrev).
     *   - `revertResultsAtEnd`: A boolean value indicating whether to revert the results at the end of the search.
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.searchByCustomFn({
     *     fn: (item: AugmentedItem<T>) => item.name === 'John Doe',
     *     searchBehavior: 'ClearPrev',  // Optional
     *     revertResultsAtEnd: true,  // Optional
     * })
     * ```
     */
    searchByCustomFn
        = this.searcher.searchByCustomFn.bind(this.searcher)

    /**
     * Retrieves all the current searched items.
     *
     * @returnings an array of current searched items.
     *
     * @remarks
     * If no search is performed, all the items will be returned.
     *
     * @exampleUsage
     * ```typescript
     * const items = tablor.getSearchedItems()
     * // [
     * //     {
     * //         name: 'John wick',
     * //         surname: 'Doe',
     * //         ...
     * //         tablorMeta: { uuid: 1, isSelected: false, isLoaded: true } // isLoaded: not yet supported
     * //     },
     * //     ...
     * // ]
     * ```
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.searchByStringQuery({
     *     name: 'john',
     * })
     *
     * const items = tablor.getSearchedItems()
     * // [
     * //     {
     * //         name: 'John wick',
     * //         surname: 'Doe',
     * //         ...
     * //         tablorMeta: { uuid: 1, isSelected: false, isLoaded: true } // isLoaded: not yet supported
     * //     },
     * //     {
     * //         name: 'Unknown',
     * //         surname: 'Alison John',
     * //         ...
     * //         tablorMeta: { uuid: 2, isSelected: false, isLoaded: true } // isLoaded: not yet supported
     * //     },
     * //     ...
     * // ]
     * ```
     */
    getSearchedItems
        = this.searcher.getItems.bind(this.searcher)

    /**
     * Retrieves the current search options.
     *
     * @returnings an array of current search items.
     *
     * @remarks
     * This method returns processed search options.
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.searchByStringQuery({
     *     query: 'john wick',
     * })
     *
     * tablor.searchByDateTimesRanges({
     *     ranges: {
     *         hire_date: [
     *             { start: 'Now' }
     *         ]
     *     }
     * })
     *
     * const options = tablor.getSearchOptions()
     * // [
     * //    {
     * //        by: 'StringQuery',
     * //        query: 'john wick',
     * //        words: [ 'john', 'wick' ],
     * //        includeFields: [
     * //            'field1', 'field2',
     * //            'field3', ...
     * //        ],
     * //        excludeFields: [],
     * //        singleWordMatchCriteria: 'Contains',
     * //        mustMatchAllWords: true,
     * //        wordsMustBeInOrder: false,
     * //        convertNonStringTypes: [ 'string', 'number', 'boolean', 'date' ],
     * //        ignoreWhitespace: true,
     * //        wordSeparator: ' ',
     * //        isCaseSensitive: false
     * //        searchBehavior: 'ClearPrev',
     * //        revertResultsAtEnd: false
     * //    },
     * //    {
     * //        by: 'DateTimesRanges',
     * //        ranges: {
     * //            hire_date: [{
     * //                 start: new Date('2024-01-01'),
     * //                 includeStart: false,
     * //                 end: undefined,
     * //                 includeEnd: undefined
     * //            }]
     * //        },
     * //        mustMatchAllFields: true,
     * //        searchBehavior: 'ClearPrev',
     * //        revertResultsAtEnd: false
     * //    }
     * // ]
     * ```
     */
    getSearchOptions
        = this.searcher.getOptions.bind(this.searcher)

    /**
     * Retrieves the number of searched items.
     *
     * @returnings the number of searched items
     *
     * @keywords
     * searched items - Items that are searched.
     * Search is identified by the `tablorMeta.uuid` property.
     */
    getNbOfSearchedItems
        = this.searcher.getNbOfSearchedItems.bind(this.searcher)

    /** ------------ SELECT METHODS  ------------ */

    /**
     * Retrieves the number of selected items.
     *
     * @returnings the number of selected items
     *
     * @keywords
     * selected items - Items that are selected.
     * Selection is identified by the `tablorMeta.isSelected` property.
     */
    getNbOfSelectedItems
        = this.selector.getNbOfSelectedItems.bind(this.selector)

    /**
     * Retrieves the number of selected items in the given items.
     *
     * @returnings the number of selected items
     *
     * @remarks
     * - For `undefined` item, it is ignored.
     * - For `number` item, it is considered as a `tablorMeta.uuid`, and check is performed.
     * - For `object` item containing `tablorMeta`, it is considered as an `AugmentedItem<T>`, and it's
     * `givenItem.tablorMeta.uuid` is checked.
     * Note that `givenItem.tablorMeta.isSelected` is not checked, because the
     * given item might be an outdated copy of the original item.
     * - For any other item, it is ignored.
     *
     * @keywords
     * selected items - Items that are selected.
     * Selection is identified by the `tablorMeta.isSelected` property.
     *
     * @exampleUsage
     * ```typescript
     * const nbOfSelectedItems = tablor.getNbOfSelectedItemsIn([
     *     { // selected
     *         ...,
     *         tablorMeta: { uuid: 1, isSelected: true, ... }
     *     },
     *     { // selected, but outdated copy
     *         ...,
     *         tablorMeta: { uuid: 2, isSelected: false, ... }
     *     },
     *      { // not selected, but outdated copy
     *          ...,
     *          tablorMeta: { uuid: 1, isSelected: true, ... }
     *     },
     *     9, // not selected
     *     10, // selected
     *     undefined, // not selected
     * ])
     * // Output: 3
     * ```
     */
    getNbOfSelectedItemsIn
        = this.selector.getNbOfSelectedItemsIn.bind(this.selector)

    /**
     * Selects an item.
     *
     * @parameters item - The item to select.
     * @parameters state - A boolean value indicating whether to select or deselect the item.
     *
     * @keywords
     * selected items - Items that are selected.
     * Selection is identified by the `tablorMeta.isSelected` property.
     *
     * @exampleUsage
     * ```TypeScript
     * const augmentedItem = {
     *     ...
     *     tablorMeta: { uuid: 1, isSelected: false, ... }
     * }
     *
     * tablor.select(item, true)
     * tablor.select(item, false)
     * tablor.select(item, 'toggle')
     * ```
     *
     * @exampleUsage
     * ```TypeScript
     * const regularItem = {
     *     ...
     *     tablorMeta: undefined
     * }
     *
     * tablor.select(item, true)
     * tablor.select(item, false)
     * tablor.select(item, 'toggle')
     * ```
     *
     * @exampleUsage
     * ```TypeScript
     * const itemUuid = 9
     *
     * tablor.select(itemUuid, true)
     * tablor.select(itemUuid, false)
     * tablor.select(itemUuid, 'toggle')
     * ```
     */
    selectItem
        = this.selector.select.bind(this.selector)

    /**
     * Selects multiple items.
     *
     * @parameters items - The items to select.
     * @parameters state - A boolean value indicating whether to select or deselect the items.
     *
     * @keywords
     * selected items - Items that are selected.
     * Selection is identified by the `tablorMeta.isSelected` property.
     *
     * @exampleUsage
     * ```TypeScript
     * const items = [
     *     {
     *         ...,
     *         tablorMeta: { uuid: 1, isSelected: false, ... }
     *     },
     *     {
     *         ...,
     *         tablorMeta: undefined
     *     },
     *     9,
     *     10,
     *     undefined
     * ]
     *
     * tablor.select(items, true)
     * tablor.select(items, false)
     * tablor.select(items, 'toggle')
     *
     * tablor.select(items, [false, true, false, 'toggle', true])
     * ```
     */
    selectItems
        = this.selector.selectMultiple.bind(this.selector)

    /** ------------ PAGINATION METHODS  ------------ */

    /**
     * Retrieve the current page items.
     *
     * @returnings The current page items.
     *
     * @remarks
     * This method is optimized for performance.
     * But in Angular, `Angular changes detection` might get slower
     * for `nbOfItemsPerPage` is set to `-1` for large numbers of items (e.g., 5000 items per page).
     * But this is not the case when using a limited number of items per page (e.g., 300 items per page).

     * -
     *
     * @exampleUsage
     * ```typescript
     * const items = tablor.getPaginatedItems()
     * // [
     * //     {
     * //         ...,
     * //         tablorMeta: { uuid: 1, isSelected: false, ... }
     * //     },
     * //     {
     * //         ...,
     * //         tablorMeta: { uuid: 2, isSelected: false, ... }
     * //     },
     * //     ...
     * // ]
     * ```
     */
    getPaginatedItems
        = this.paginator.getItems.bind(this.paginator)

    /**
     * Retrieve the current page number.
     *
     * @returnings The current page number.
     */
    getPageNb
        = this.paginator.getPageNb.bind(this.paginator)

    /**
     * Retrieve the number of total pages.
     *
     * @returnings The number of total pages.
     */
    getNbOfPages
        = this.paginator.getNbOfPages.bind(this.paginator)

    /**
     * Retrieve the number of items on the current page.
     *
     * @returnings The current page size.
     */
    getPageSize
        = this.paginator.getPageSize.bind(this.paginator)

    /**
     * Retrieve the number of items per page.
     *
     * @returnings The number of items per page.
     */
    getNbOfItemsPerPage
        = this.paginator.getNbOfItemsPerPage.bind(this.paginator)

    /**
     * Set the page number.
     *
     * @parameters nb - The page number to set.
     */
    setPageNb
        = this.paginator.setPageNb.bind(this.paginator)

    /**
     * Set the number of items per page.
     *
     * @parameters nb - The number of items per page to set.
     */
    setNbOfItemsPerPage
        = this.paginator.setNbOfItemsPerPage.bind(this.paginator)

    /** ------------ EVENT METHODS  ------------ */

    /**
     * Adds an event listener.
     *
     * @parameters type - The event name.
     * @parameters cb - The callback function to be executed when the event occurs.
     *
     * @throws {Error} Will throw an error if the event type does not correspond to an
     *                 existing event listener property.
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.addEventListener('ItemsChanged', (items) => {
     *     console.log(items)
     * })
     * ```
     */
    // addEventListener
    //     = this.events.addEventListener.bind(this.events)

    /**
     * Removes an event listener.
     *
     * @parameters type - The event name.
     * @parameters cb - The callback function to be removed.
     *
     * @throws {Error} Will throw an error if the event type does not correspond to an
     *                 existing event listener property.
     *
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.removeEventListener('ItemsChanged', (items) => {
     *     console.log(items)
     * })
     * ```
     */
    // removeEventListener
    //     = this.events.removeEventListener.bind(this.events)

    /**
     * Emits an event.
     *
     * @parameters type - The event name.
     * @parameters data - The event data.
     *
     * @throws {Error} Will throw an error if the event type does not correspond to an
     *                 existing event listener property.
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.emitEventListeners('ItemClicked', {
     *     ...,
     *     tablorMeta: { uuid: 1, ... }
     * })
     * ```
     */
    // emitEventListeners
    //     = this.events.emitEventListeners.bind(this.events)

    /** ------------ FIELDS METHODS  ------------ */

    /**
     * Initializes the fields with an array of fields.
     *
     * @parameters fields - An array of fields.
     *
     * @exampleUsage
     * ```TypeScript
     * type User = {
     *     id: number
     *     name: string
     *     age: number
     * }
     *
     * const userFields: TablorTypes['Fields']<User> = {
     *     id: {
     *         title: 'ID',
     *         isSortedByDefault: true
     *     },
     *     name: { title: 'Name' },
     *     age: { title: 'Age' },
     * }
     *
     * const tablor = new Tablor<User>()
     *
     * tablor.initializeFields(userFields)
     * ```
     */
    initializeFields
        = this.fieldsStore.initialize.bind(this.fieldsStore)

    /**
     * Get all processed fields as an object.
     *
     * @returnings The fields as an object.
     *
     * @remarks
     * To get the fields as an array, use the `getFieldsAsArray` method.
     *
     * @exampleUsage
     * ```TypeScript
     * const fields = tablor.getFields()
     * // {
     * //     id: {
     * //         key: 'id',
     * //         title: 'ID',
     * //         isSortedByDefault: true
     * //     },
     * //     name: { ... },
     * //     age: { ... },
     * // }
     * ```
     */
    getFields
        = this.fieldsStore.getFields.bind(this.fieldsStore)

    /**
     * Get all processed fields as an array.
     *
     * @returnings The fields as an array.
     *
     * @exampleUsage
     * ```TypeScript
     * const fields = tablor.getFieldsAsArray()
     * // [
     * //     {
     * //         key: 'id',
     * //         title: 'ID',
     * //         isSortedByDefault: true
     * //     },
     * //     { ... },
     * //     { ... },
     * // ]
     * ```
     */
    getFieldsAsArray
        = this.fieldsStore.getFieldsAsArray.bind(this.fieldsStore)

    /** ------------ ITEMS METHODS  ------------ */

    /**
     * Initializes the items with an array of items.
     *
     * @parameters items - An array of items.
     *
     * @exampleUsage
     * ```TypeScript
     * type User = {
     *     id: number
     *     name: string
     *     age: number
     * }
     *
     * const users: User[] = [
     *     {
     *         id: 1,
     *         name: 'John',
     *         age: 30
     *     },
     *     {
     *         id: 2,
     *         name: 'Jane',
     *         age: 25
     *     }
     * ]
     *
     * const tablor = new Tablor<User>()
     *
     * tablor.initializeItems(users)
     * ```
     */
    initializeItems
        = this.itemsStore.initialize.bind(this.itemsStore)

    /**
     * Get all items.
     *
     * @parameters strictlyTyped - A boolean indicating whether to return strictly typed items or loosely typed items.
     *
     * @returnings An array of items.
     *
     * @remarks
     * - For getting searched items, use the `getSearchedItems` method.
     * - For getting selected items, use the `getSelectedItems` method.
     * - For getting sorted items, use the `getSortedItems` method.
     * - For getting paginated items, use the `getPaginatedItems` method.
     *
     * @exampleUsage
     * ```typescript
     * const users = tablor.getItems()
     * // [
     * //     {
     * //         id: 1,
     * //         name: 'John',
     * //         age: 30,
     * //         tablorMeta: { uuid: 1, ... }
     * //     },
     * //     {
     * //         id: 2,
     * //         name: 'Jane',
     * //         age: 25,
     * //         tablorMeta: { uuid: 1, ... }
     * //     }
     * // ]
     * ```
     */
    getAllItems
        = this.itemsStore.getItems.bind(this.itemsStore)

    /**
     * Adds new items to the store.
     *
     * @parameters items - An array of items.
     *
     * @exampleUsage
     * ```TypeScript
     * const users: User[] = [
     *     {
     *         id: 1,
     *         name: 'John',
     *         age: 30
     *     },
     *     {
     *         id: 2,
     *         name: 'Jane',
     *         age: 25
     *     }
     * ]
     *
     * tablor.addItems(users)
     * ```
     */
    addItems
        = this.itemsStore.add.bind(this.itemsStore)

    /**
     * Removes items from the store by UUIDs.
     *
     * @parameters itemsOrUuids - An array of UUIDs.
     *
     * @returnings An array of boolean values, indicating whether the items were removed successfully or not.
     *
     * @recommendations
     * It is recommended to remove multiple items at once if there is a need to do so, as an event listener will be
     * emitted for all removed items at once.
     *
     * @exampleUsage
     * ```TypeScript
     * const itemsAndUuids = [
     *     1, // used as a UUID
     *     2, // used as a UUID
     *     {  // tablorMeta.uuid is used
     *         ...
     *         tablorMeta: { uuid: 3, ... }
     *     },
     *     {  // a complete object is matched, and tablorMeta.uuid is used if found
     *         ...
     *         tablorMeta: undefined
     *     }
     * ]
     *
     * tablor.removeItems(uuids)
     * ```
     */
    removeItems
        = this.itemsStore.remove.bind(this.itemsStore)

    /**
     * Returns the loading state.
     *
     * @returnings A boolean value indicating whether the store is currently loading or not.
     *
     * @experimental
     * This method is not yet supported.
     */
    getLoadingState
        = this.itemsStore.getLoadingState.bind(this.itemsStore)

    /**
     * Returns the total number of items.
     *
     * @returnings A number representing the total number of items.
     */
    getNbOfItems
        = this.itemsStore.getNbOfItems.bind(this.itemsStore)

    /**
     * Finds and returns items matching the given UUIDs or item objects.
     *
     * @parameters itemsAndUuids - An array of UUIDs or item objects.
     *
     * @returnings An array of items that match the given UUIDs or item objects.
     *
     * @remarks
     * For not found items, undefined values are placed in the returned array.
     * - For finding single index for each item, use the `findOneIndexForEach` instead.
     * - For finding all possible indexes for each item (useful for duplicates),
     * use the `findAllPossibleIndexesForEach`
     * instead.
     *
     * @exampleUsage
     * ```typescript
     * const itemsAndUuids = [
     *     1, // used as a UUID
     *     2, // used as a UUID
     *     {  // tablorMeta.uuid is used
     *         ...
     *         tablorMeta: { uuid: 3, ... }
     *     },
     *     {  // complete object is matched to find it
     *         ...
     *         tablorMeta: undefined
     *     },
     *     {  // deleted item
     *         ...
     *         tablorMeta: { uuid: 5, ... }
     *     }
     * ]
     *
     * const items = tablor.findItems(itemsAndUuids)
     * // [
     * //     {
     * //         ...
     * //         tablorMeta: { uuid: 1, ... }
     * //     },
     * //     {
     * //         ...
     * //         tablorMeta: { uuid: 2, ... }
     * //     },
     * //     {
     * //         ...
     * //         tablorMeta: { uuid: 3, ... }
     * //     },
     * //     {
     * //         ...
     * //         tablorMeta: { uuid: 4, ... }
     * //     },
     * //     undefined,
     * // ]
     * ```
     */
    findOneMatchingItemForEach
        = this.itemsStore.findOneMatchingItemForEach.bind(this.itemsStore)

    /**
     * Finds and returns the indexes of items matching the given UUIDs or item objects.
     *
     * @parameters itemsAndUuids - An array of UUIDs or item objects.
     *
     * @returnings An array of indexes of items that match the given UUIDs or item objects.
     *
     * @remarks
     * For not found items, undefined values are placed in the returned array.
     * - For finding all possible indexes (useful for duplicates), use `findAllPossibleIndexesForEach` instead.
     * - For finding a single matching item, use `findOneMatchingItemForEach` instead.
     *
     * @exampleUsage
     * ```typescript
     * const itemsAndUuids = [
     *     1, // used as a UUID
     *     2, // used as a UUID
     *     {  // tablorMeta.uuid is used
     *         ...
     *         tablorMeta: { uuid: 3, ... }
     *     },
     *     {  // complete object is matched to find it
     *         ...
     *         tablorMeta: undefined
     *     },
     *     {  // deleted item
     *         ...
     *         tablorMeta: { uuid: 5, ... }
     *     }
     * ]
     *
     * const items = tablor.findOneIndexForEach(itemsAndUuids)
     * // [
     * //     0,
     * //     1,
     * //     2,
     * //     3,
     * //     undefined,
     * // ]
     * ```
     */
    findOneIndexForEach = this.itemsStore.findOneIndexForEach.bind(this.itemsStore)

    /**
     * Finds and returns all the possible indexes of items matching the given UUIDs or item objects.
     *
     * @parameters itemsAndUuids - An array of UUIDs or item objects.
     *
     * @returnings An array of indexes of items that match the given UUIDs or item objects.
     *
     * @remarks
     * This method is useful for finding duplicate items.
     * - For finding single index for each item, use `findOneIndexForEach` instead.
     * - For finding single matching item, use `findOneMatchingItemForEach` instead.
     *
     * @exampleUsage
     * ```TypeScript
     * const itemsAndUuids = [
     *     1, // used as a UUID
     *     2, // used as a UUID
     *     {  // tablorMeta.uuid is used
     *         ...
     *         tablorMeta: { uuid: 3, ... }
     *     },
     *     {  // a complete object is matched to find it
     *         ...
     *         tablorMeta: undefined
     *     }
     * ]
     *
     * const items = tablor.findAllPossibleIndexesForEach(itemsAndUuids)
     * // [
     * //     [0, 8],
     * //     [1, 2, 15, 20,
     * //     [],
     * //     [3],
     * // ]
     * ```
     */
    findAllPossibleIndexesForEach
        = this.itemsStore.findAllPossibleIndexesForEach.bind(this.itemsStore)

    /**
     * Updates items by matching UUIDs that are present in the items.
     *
     * @parameters items - An array of partial item objects.
     *
     * @returnings An array of booleans, each indicating whether the update was successful.
     *
     * @remarks
     * If applicable, update all the target items at once, as this method emits a single event.
     * - For updating items by index, use `updateByIndex` instead.
     * - For updating items by UUID, use `updateByUuid` instead.
     *
     * @exampleUsage
     * ```TypeScript
     * const items = [
     *     {
     *         ...
     *         tablorMeta: { uuid: 1, ... }
     *     },
     *     {
     *         ...
     *         tablorMeta: { uuid: 2, ... }
     *     },
     * ]
     *
     * const updated = tablor.updateByInItemUuid(items)
     * // [true, true]
     * ```
     */
    updateByInItemUuid
        = this.itemsStore.updateByInItemUuid.bind(this.itemsStore)

    /**
     * Updates items by matching UUIDs that are passed externally.
     *
     * @parameters items - An array of partial item objects.
     * @parameters uuids - An array of UUIDs to match against.
     *
     * @returnings An array of booleans, each indicating whether the update was successful.
     *
     * @throws If the number of items and UUIDs do not match.
     *
     *
     * @remarks
     * If applicable, update all the target items at once, as this method emits a single event.
     * - For updating items by index, use `updateByIndex` instead.
     * - For updating items by internal UUID in the item, use `updateByInItemUuid` instead.
     *
     * @exampleUsage
     * ```TypeScript
     * const items = [
     *     {
     *         ...
     *         tablorMeta: { uuid: 1, ... }
     *     },
     *     {
     *         ...
     *         tablorMeta: { uuid: 2, ... }
     *     },
     * ]
     * const uuids = [1, 2]
     *
     * const updated = tablor.updateByExternalUuids(items, uuids)
     * // [true, true]
     * ```
     */
    updateByExternalUuids
        = this.itemsStore.updateByExternalUuids.bind(this.itemsStore)

    /**
     * Updates items at specified indexes.
     *
     * @parameters items - An array of partial item objects.
     * @parameters indexes - An array of indexes of items to update.
     *
     * @returnings An array of booleans, each indicating whether the update was successful.
     *
     * @throws If the number of items and indexes do not match.
     *
     * @remarks
     * If applicable, update all the target items at once, as this method emits a single event.
     * - For updating items by internal UUID in the item, use `updateByInItemUuid` instead.
     * - For updating items by external UUID, use `updateByExternalUuids` instead.
     *
     * @exampleUsage
     * ```TypeScript
     * const items = [
     *     {
     *         ...
     *         tablorMeta: { uuid: 1, ... }
     *     },
     *     {
     *         ...
     *         tablorMeta: { uuid: 2, ... }
     *     },
     * ]
     * const indexes = [0, 1]
     *
     * const updated = tablor.updateByIndex(items, indexes)
     * // [true, true]
     * ```
     */
    updateByIndex
        = this.itemsStore.updateByIndex.bind(this.itemsStore)

    /** ------------ SORTER METHODS ------------ */

    /**
     * Gets the sorting option objects.
     *
     * @returnings An array of sorting options.
     *
     * @exampleUsage
     * ```TypeScript
     * // sorted by a single field
     * const options = tablor.getSortingOptions();
     * // [{ column: 'name', order: 'ASC' }]
     * ```
     *
     * @exampleUsage
     * ```TypeScript
     * // sorted by multiple fields
     * const options = tablor.getSortingOptions();
     * // [
     * //     { column: 'name', order: 'ASC' },
     * //     { column: 'surname', order: 'ASC' }
     * // ]
     * ```
     */
    getSortingOptions
        = this.sorter.getOptions.bind(this.sorter)

    /**
     * Sorts the items.
     *
     * @parameters options - An array of sorting options.
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.sort('name', 'ASC');
     * ```
     *
     * @exampleUsage
     * ```TypeScript
     * tablor.sort('name', 'ASC');
     * tablor.sort('surname', 'Toggle');
     * ```
     */
    sort = this.sorter.sort.bind(this.sorter)

    /**
     * Clears the sorting.
     *
     * @remarks
     * Note that after calling this method, the items will go back to their original order.
     */
    clearSorting
        = this.sorter.clearSort.bind(this.sorter)
}
