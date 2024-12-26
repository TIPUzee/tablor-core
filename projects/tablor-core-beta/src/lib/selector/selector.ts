import {
    AugmentedItem,
    ImmutableAugmentedPartialRegularItem,
    ImmutableAugmentedItem,
    ImmutableRegularItem,
    Item, ItemsRemovedPayload,
} from '../stores/items-store/interfaces'
import { ItemsStore } from '../stores/items-store/items-store'
import { Subject } from 'rxjs'
import { ItemsSelectionChangedPayload } from './interfaces'


/**
 * Represents a selector.
 */
export class Selector<T extends Item<T>>
{
    protected _selectedUuids: number[] = []

    public readonly $itemsSelectionChanged: Subject<ItemsSelectionChangedPayload<T>> = new Subject<ItemsSelectionChangedPayload<T>>()


    constructor(
        protected readonly itemsStore: ItemsStore<T>,
        protected readonly allItems: AugmentedItem<T>[],
        protected readonly $itemsRemoved: Subject<ItemsRemovedPayload<T>>,
    )
    {
        this.$itemsRemoved.subscribe(this.verifySelectedItemsOnRemoval.bind(this))
    }


    /**
     * Returns the number of selected items.
     */
    public getNbOfSelectedItems(): number
    {
        return this._selectedUuids.length
    }


    /**
     * Selects or deselects an item.
     */
    public select(
        item: ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | number | undefined,
        state: boolean | 'toggle',
    ): void
    {
        const i = this.selectInternal(item, state)
        if (i === -1) return

        this.$itemsSelectionChanged.next({
            items: [this.allItems[i]],
        })
    }


    /**
     * Selects or deselects multiple items.
     */
    public selectMultiple(
        items: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>,
        states: (boolean | 'toggle')[] | (boolean | 'toggle'),
    ): void
    {
        if (Array.isArray(states) && items.length !== states.length)
            throw new Error('The number of items and states must match')

        if (items.length === 0) return

        const indexes: number[] = []

        if (!Array.isArray(states))
        {
            for (let i = 0; i < items.length; i++)
            {
                indexes.push(this.selectInternal(items[i], states))
            }
        }
        else
        {
            for (let i = 0; i < items.length; i++)
            {
                indexes.push(this.selectInternal(items[i], states[i]))
            }
        }

        const selectedItems = indexes.map(i => this.itemsStore.getItems()[i])

        this.$itemsSelectionChanged.next({
            items: selectedItems,
        })
    }


    /**
     * Returns the number of selected items in the given items.
     */
    public getNbOfSelectedItemsIn(items: Readonly<(ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>): number
    {
        return items.reduce(
            (c: number, item) =>
            {
                if (item === undefined)
                    return c

                else if (typeof item === 'number')
                    return c + (this._selectedUuids.includes(item) ? 1 : 0)

                else if (typeof item === 'object' && 'tablorMeta' in item)
                    return c + (this._selectedUuids.includes(item.tablorMeta.uuid) ? 1 : 0)

                return c
            },
            0,
        )
    }


    /**
     * Verifies that the selected items are still valid after items have been removed.
     */
    protected verifySelectedItemsOnRemoval({ removedItems }: ItemsRemovedPayload<T>): void
    {
        const removedUuids = removedItems.map(item => item.tablorMeta.uuid)
        this._selectedUuids = this._selectedUuids
            .filter(uuid => !removedUuids.includes(uuid))
    }


    /**
     * Selects or deselects an item.
     */
    protected selectInternal(
        item: ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | number | undefined,
        state: boolean | 'toggle',
    ): number
    {
        const i = this.itemsStore.findOneIndexForEach([item])[0]
        if (i === -1) return -1

        if (state === 'toggle')
        {
            state = !this.allItems[i].tablorMeta.isSelected
            this.allItems[i].tablorMeta.isSelected = state
        }
        else if ((state || !state) && this.allItems[i].tablorMeta.isSelected !== state)
        {
            this.allItems[i].tablorMeta.isSelected = state
        }

        if (state)
            this._selectedUuids.push(this.allItems[i].tablorMeta.uuid)
        else
            this._selectedUuids = this._selectedUuids
                .filter(uuid => uuid !== this.allItems[i].tablorMeta.uuid)

        return i
    }
}
