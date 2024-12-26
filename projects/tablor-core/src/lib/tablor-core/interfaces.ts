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
    HalfItem,
    Item, ItemsUpdatedPayload, ItemsRemovedPayload, ItemsAddedPayload,
} from '../stores/items-store/interfaces'
import { SampleItemType } from '../test-data/test-data-2'
import {
    ImmutableSortingOptions,
    ItemsSortedPayload,
    SortingOptions,
    ProcessedSortingOrder,
    DraftSortingOrder,
} from '../sorter/interfaces'
import {
    DraftSearchableOptions,
    ItemsSearchedPayload,
    ProcessedSearchableOptions,
    SearchedItemsChangedPayload, SearchOptionsChangedPayload,
} from '../searcher/searcher/interfaces'
import { ItemsSelectionChangedPayload } from '../selector/interfaces'


/**
 * **TablorCoreType**
 *
 * A comprehensive type definition that aggregates all public types provided by the TablorCore library.
 *
 * This type serves as a single entry point for accessing various types used throughout the library, making it easier for developers to manage their imports and avoid code clutter.
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
 * - Includes definitions for core elements like `Field`, `Fields`, and more.
 * - Provides full support for generic typing, ensuring flexibility and adaptability.
 * - Enhances developer experience by standardizing type access.
 *
 * ---
 *
 * **Example Usage**:
 * ```TypeScript
 * const fields: TablorCoreType<MyCustomItem>['Fields'] = tablor.getFields();
 * ```
 *
 * ---
 *
 * **Get Started**:
 * - **GitHub Repository**: [TablorCore on GitHub](https://github.com/TIPUzee/TablorCore)
 * - **NPM Package**: Search for `tablor-core` on [npmjs.com](https://www.npmjs.com/) to integrate this type into your projects.
 *
 * **Developed by**: Zeeshan Nadeem
 * **GitHub**: [TIPUzee](https://github.com/TIPUzee)
 * **License**: Apache-2.0
 */
export type TablorCoreType<T extends Item<T>, K extends keyof T = keyof T> = {

    Field: RegularField<T>
    Fields: RegularFields<T>
    ProcessedField: ProcessedField<T, K>
    ProcessedFields: ProcessedFields<T>

    Item: Item<T>
    HalfItem: HalfItem<T>

    AugmentedItem: AugmentedItem<T>
    AugmentedHalfItem: AugmentedHalfItem<T>

    ProcessedSearchableOptions: ProcessedSearchableOptions<T>
    DraftSearchableOptions: DraftSearchableOptions<T>

    FieldsUpdatedPayload: FieldsUpdatedPayload<T>
    ItemsAddedPayload: ItemsAddedPayload<T>
    ItemsRemovedPayload: ItemsRemovedPayload<T>
    ItemsUpdatedPayload: ItemsUpdatedPayload<T>
    ItemsSelectionChangedPayload: ItemsSelectionChangedPayload<T>
    ItemsSearchedPayload: ItemsSearchedPayload<T>
    SearchedItemsChangedPayload: SearchedItemsChangedPayload<T>
    SearchOptionsChangedPayload: SearchOptionsChangedPayload<T>

    ItemsSortedPayload: ItemsSortedPayload<T>
    ImmutableSortingOptions: ImmutableSortingOptions<T>
    SortingOptions: SortingOptions<T>
    SortingOrder: ProcessedSortingOrder
    SortingOrderMode: DraftSortingOrder
}
