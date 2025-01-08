import {
    FieldsUpdatedPayload,
    ProcessedField,
    ProcessedFields,
    RegularField,
    RegularFields,
} from '../stores/fields-store/interfaces'

import {
    AugmentedItem,
    AugmentedHalfItem,
    PartialItem,
    Item,
    ItemsUpdatedPayload,
    ItemsRemovedPayload,
    ItemsAddedPayload,
    ImmutableAugmentedItem,
    ImmutableAugmentedPartialRegularItem,
    ImmutablePartialRegularItem,
    ImmutableRegularItem,
    StoreLoadingStateChangedPayload,
    PrimitiveTypes,
    DynamicImmutableAugmentedItem,
    AugItemMetaData,
} from '../stores/items-store/interfaces'

import {
    SortingOptionsChangedPayload,
    ItemsSortedPayload,
    SortedItemsChangedPayload,
    ImmutableProcessedSortingOption,
    DraftSortingOptions,
    ProcessedSortingOptions,
} from '../sorter/interfaces'

import {
    DraftSearchableOptions,
    ItemsSearchedPayload,
    ProcessedSearchableOptions,
    SearchedItemsChangedPayload,
    SearchOptionsChangedPayload,
    DraftDateRangeSearchOptions,
    ProcessedDateTimeRangeSearchOptions,
    DraftCustomSearchOptions,
    ProcessedCustomSearchOptions,
    DraftVoidSearchOptions,
    ProcessedVoidSearchOptions,
    DraftStringQuerySearchOptions,
    ProcessedStringQuerySearchOptions,
    DraftNumberRangeSearchOptions,
    ProcessedNumberRangeSearchOptions,
    DraftExactValueSearchOptions,
    ProcessedExactValueSearchOptions,
} from '../searcher/searcher/interfaces'

import {
    NbOfItemsPerPageChangedPayload,
    NbOfTotalPagesChangedPayload,
    PageNbChangedPayload,
    PaginatedItemsChangedPayload,
} from '../paginator/interfaces'

import {
    ItemsSelectionChangedPayload,
} from '../selector/interfaces'


/**
 * **TablorCoreTypes**
 *
 * A comprehensive type definition that aggregates all public types provided by the TablorCore library.
 *
 * This type serves as a single entry point for accessing various types used throughout the library,
 * making it easier for developers to manage their imports and avoid code clutter.
 *
 * ---
 *
 * **Purpose**:
 * - Consolidates all public types into a single structure.
 * - Simplifies type management by reducing the need for multiple imports.
 * - Promotes cleaner and more maintainable code.
 *
 * ---
 *
 * **Key Features**:
 * - Includes definitions for core elements like `Field`, `AugmentedItem`, `SortingOptionsChangedPayload`, and more.
 * - Provides full support for generic typing, ensuring flexibility and adaptability.
 * - Enhances developer experience by standardizing type access.
 *
 * ---
 *
 * **Example Usage**:
 * ```TypeScript
 * import { TablorCoreTypes as TcT } from 'tablor-core';
 *
 * type User = {
 *   name: string;
 *   age: number;
 *   email: string;
 * }
 *
 * const tablor = new TcT<User>();
 * const fields: TcT<User>['Fields'] = tablor.getFields();
 * ```
 *
 * ---
 *
 * **Get Started**:
 * - **GitHub Repository**: [TablorCore on GitHub](https://github.com/TIPUzee/tablor-core)
 *   Explore the repository for documentation, examples, and contribution guidelines.
 * - **NPM Package**: Search for `tablor-core` on [npmjs.com](https://www.npmjs.com/)
 * to install and integrate this library into your projects.
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
 * Developers are encouraged to contribute, enhance functionality, and share ideas.
 * Submit pull requests, raise issues, or provide feedback on GitHub to make this library better for the community.
 */
export type TablorCoreTypes<T extends Item<T>, K extends keyof T = keyof T> = {

    FieldsUpdatedPayload: FieldsUpdatedPayload<T>,
    ProcessedField: ProcessedField<T, K>,
    ProcessedFields: ProcessedFields<T>,
    RegularField: RegularField<T>,
    RegularFields: RegularFields<T>,

    AugmentedItem: AugmentedItem<T>,
    AugmentedHalfItem: AugmentedHalfItem<T>,
    PartialItem: PartialItem<T>,
    Item: Item<T>,
    ItemsUpdatedPayload: ItemsUpdatedPayload<T>,
    ItemsRemovedPayload: ItemsRemovedPayload<T>,
    ItemsAddedPayload: ItemsAddedPayload<T>,
    ImmutableAugmentedItem: ImmutableAugmentedItem<T>,
    ImmutableAugmentedPartialRegularItem: ImmutableAugmentedPartialRegularItem<T>,
    ImmutablePartialRegularItem: ImmutablePartialRegularItem<T>,
    ImmutableRegularItem: ImmutableRegularItem<T>,
    StoreLoadingStateChangedPayload: StoreLoadingStateChangedPayload<T>,
    PrimitiveTypes: PrimitiveTypes,
    DynamicImmutableAugmentedItem: DynamicImmutableAugmentedItem,
    AugItemMetaData: AugItemMetaData,

    SortingOptionsChangedPayload: SortingOptionsChangedPayload<T>,
    ItemsSortedPayload: ItemsSortedPayload<T>,
    SortedItemsChangedPayload: SortedItemsChangedPayload<T>,
    ImmutableProcessedSortingOption: ImmutableProcessedSortingOption<T, K>,
    DraftSortingOption: DraftSortingOptions<T, K>,
    ProcessedSortingOption: ProcessedSortingOptions<T, K>,

    DraftSearchableOptions: DraftSearchableOptions<T>,
    ItemsSearchedPayload: ItemsSearchedPayload<T>,
    ProcessedSearchableOptions: ProcessedSearchableOptions<T>,
    SearchedItemsChangedPayload: SearchedItemsChangedPayload<T>,
    SearchOptionsChangedPayload: SearchOptionsChangedPayload<T>,
    DraftDateRangeSearchOptions: DraftDateRangeSearchOptions<T>,
    ProcessedDateTimeRangeSearchOptions: ProcessedDateTimeRangeSearchOptions<T>,
    DraftCustomSearchOptions: DraftCustomSearchOptions<T>,
    ProcessedCustomSearchOptions: ProcessedCustomSearchOptions<T>,
    DraftVoidSearchOptions: DraftVoidSearchOptions<T>,
    ProcessedVoidSearchOptions: ProcessedVoidSearchOptions<T>,
    DraftStringQuerySearchOptions: DraftStringQuerySearchOptions<T>,
    ProcessedStringQuerySearchOptions: ProcessedStringQuerySearchOptions<T>,
    DraftNumberRangeSearchOptions: DraftNumberRangeSearchOptions<T>,
    ProcessedNumberRangeSearchOptions: ProcessedNumberRangeSearchOptions<T>,
    DraftExactValueSearchOptions: DraftExactValueSearchOptions<T>,
    ProcessedExactValueSearchOptions: ProcessedExactValueSearchOptions<T>,

    NbOfItemsPerPageChangedPayload: NbOfItemsPerPageChangedPayload<T>,
    NbOfTotalPagesChangedPayload: NbOfTotalPagesChangedPayload<T>,
    PageNbChangedPayload: PageNbChangedPayload<T>,
    PaginatedItemsChangedPayload: PaginatedItemsChangedPayload<T>,

    ItemsSelectionChangedPayload: ItemsSelectionChangedPayload<T>,
}
