# Tablor-Core - Stable 🌟

**Create beautiful datatables, grid views, and more effortlessly with Tablor-Core!**  
Leverage powerful features already implemented—you just need to focus on your UI.

---

## 💡 Why Choose Tablor-Core?

Tablor-Core offers an extensive toolkit for building interactive and dynamic datatables with minimal effort. Whether you're creating grid views or advanced data management UIs, Tablor-Core has you covered.

--- 

## Demo

- Fully functioning preview with pre-built (sample) UI:  
  **👉 [Sample Preview](https://stackblitz.com/github/TIPUzee/tablor-core-demo/tree/simple-ui?file=src%2Fapp%2Fapp.component.ts)**

- Fully functioning preview with Spartan UI:  
  **👉 [Spartan-UI Preview](https://stackblitz.com/github/TIPUzee/tablor-core-demo/tree/spartan-ui?file=src%2Fapp%2Fapp.component.ts)**

- Minimal setup with dataset for your own implementation:  
  **👉 [Try It Yourself](https://stackblitz.com/github/TIPUzee/tablor-core-demo/tree/master?file=src%2Fapp%2Fapp.component.ts)**

---

## 🛠️ Installation

```bash
npm install tablor-core
```

---

## 🚀 Features at a Glance

### Sorting

- **Basic Sorting**
- **Custom Sorting Toggle Orders**
- **Multi-Field Sorting**
    - Example: Sort transactions by **bank names**, then **nested sort by transaction date**.

---

### 🔍 Search

- **Search Within Previous Results**
- **Merge Results into Previous Searches**
- **Field-Specific Search Criteria**

#### **Search By String Query**

- Include specific fields.
- Custom functions for converting numbers, dates, booleans, nulls, and undefined values to searchable strings.
- Word matching with:
    - **StartsWith**, **EndsWith**, **Contains**, **ExactMatch**
    - Search words **in order** or **any order**.
    - Search **consecutive** or **non-consecutive** words.

#### **Advanced Search Capabilities**

- Search by **date ranges** (multiple ranges for multiple fields).
- Search by **number ranges** (multiple ranges for multiple fields).
- Search by **exact values** (multiple values for multiple fields).
- Use **custom search functions**.
- **Revert Search Results**: Replace searched items with those not searched.

---

### 📖 Pagination

- Navigate pages with ease:
    - **Go To Page**
    - **Set Items Per Page**
    - Display **all items** on a single page.

---

### 🗂️ Item Selection

- Select and retrieve items with flexibility:
    - Get **selected items**.
    - Get items **within the page** or **outside the page**.

---

### ⚡ Event-Based System

- Fully event-driven for seamless integration:
    - Events for **page changes**, **sorting updates**, **search criteria changes**, **item selection changes**, **deletions**, and more.

---

## How to Use Tablor-Core

### 1. Define Your Data and Fields

#### `user.interface.ts`

```typescript
import { TablorCoreTypes as TcT } from 'tablor-core';


export type User = {
    id: number;
    name: string;
    email: string;
    dob: Date | null;
    cgpa: number,
};

export type UserTcT = TcT<User>;

export const userFields: UserTcT['RegularFields'] = {
    id: { title: 'ID' },
    name: { title: 'Name' },
    email: { title: 'Email' },
    dob: { title: 'Date of Birth' },
    cgpa: { title: 'CGPA' },
};
```

#### `user.data.ts`

```typescript
import { User } from './user.interface';


export const users: User[] = [
    { id: 1, name: 'John Doe', email: 'M3u5W@example.com', dob: new Date('1990-01-01'), cgpa: 3.7 },
    { id: 2, name: 'Jane Smith', email: 'H7Uwq@example.com', dob: null, cgpa: 3.0 },
    // Add more data as needed...
];
```

### 2. Initialize TablorCore in Your Component

#### `my.component.ts`

```typescript
import { Component } from '@angular/core';
import { TablorCore } from 'tablor-core';
import { User, UserTcT, userFields } from './user.interface';
import { users } from './user.data';


@Component({
    selector: 'my-component',
    templateUrl: './my.component.html',
    styleUrls: ['./my.component.scss'],
})
export class MyComponent
{
    readonly tablor: TablorCore<User> = new TablorCore();


    constructor()
    {
        this.tablor.initializeFields(userFields);
        this.tablor.initializeItems(users);
    }
}
```

### 3. Use TablorCore in Templates

#### `my.component.html`

```html
<table>
   <thead>
      <tr>
         <th *ngFor="let field of tablor.getFieldsAsArray()">
            {{ field.title }}
         </th>
      </tr>
   </thead>
   <tbody>
      <tr *ngFor="let item of tablor.getPaginatedItems()">
         <td *ngFor="let field of tablor.getFieldsAsArray()">
            {{ item[field.key] }}
         </td>
      </tr>
   </tbody>
</table>

<button (click)="tablor.setPageNb(tablor.getPageNb() + 1)">
   Next Page
</button>
```

### 4. Sorting Examples

#### Sort by Single Field

```typescript
tablor.sort({
    field: 'name',
    order: 'Toggle',
    insertBehavior: {
        insertAt: 0,
    },
    clear: {
        target: 'AllNested',
    },
});
```

#### Sort by Multiple Nested Fields

Use cases: Sort transactions by **transaction amount**, then **nested sort by transaction date**. Means if there are multiple transactions with the same amount, older transactions should show up first.

```typescript
tablor.sort({
    field: 'name',
    order: 'DESC',
});

tablor.sort({
    field: 'dob',
    order: 'ASC',
});

// Items will be sorted first by name as desc order, then by date of birth as asc order.
// e.g.
// Zeeshan Nadeem (1990-01-01) // there are multiple items with the same name
// Zeeshan Nadeem (1995-01-01)
// Zeeshan Nadeem (2000-01-01)
// John Doe (1990-01-01)
// Jahn Doe (1991-01-01)
// Jane Smith (null)
```

#### Handle undefined and null values for sorting

```typescript
tablor.sort({
    field: 'dob',
    order: 'Toggle',
    prioritizeNulls: 'AlwaysLast',
    prioritizeUndefineds: 'AlwaysLast',
    insertBehavior: {
        insertAt: 0,
    },
    clear: {
        target: 'AllNested',
    },
});

// Possible options: 'AlwaysFirst' | 'AlwaysLast' | 'FirstOnASC' | 'LastOnASC'
// 'FirstOnASC' means if sorted by ASC order, null/undefined values will be sorted first.
// And if sorted by DESC order, it will be sorted last.
```

### 5. Searching Examples

#### Search by String Query

```typescript
tablor.searchByStringQuery({
    query: 'Zeeshan Nadeem',
    includeFields: ['name', 'email'],
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
});
```

#### Search by String with Non-String Conversion

```typescript
tablor.searchByStringQuery({
    query: 'Zeeshan 31 Mar',
    includeFields: ['name', 'dob'],
    convertToString: {
        string: s => s,
        number: n => n.toString(),
        date: d => d.toGMTString(),
        boolean: b => b.toString(),
        null: () => 'null',
        undefined: () => 'undefined',
    },
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
});
```

### 6. Advanced Search Examples

#### Search by Date Ranges

```typescript
tablor.searchByDateTimesRanges({
    ranges: {
        dob: [
            { start: new Date('2020-01-01'), end: 'Now', includeStart: true },
            { start: undefined, end: 'Now', endOffset: { years: -20 } },
        ],
    },
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
});
```

#### Search by Number Ranges

```typescript
tablor.searchByNumbersRanges({
    ranges: {
        cgpa: [
            { min: 3.7 },
        ],
    },
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
});
```

#### Search by Exact Values

```typescript
tablor.searchByExactValues({
    values: {
        dob: [null, undefined],
    },
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
});
```

#### Combine Search Queries

```typescript
tablor.searchByStringQuery({
    query: 'Zeeshan',
    includeFields: ['name'],
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
});

tablor.searchByDateTimesRanges({
    ranges: {
        dob: [
            { start: new Date('1995-01-01'), end: new Date('2005-01-01'), includeStart: true },
        ],
    },
    prevResults: {
        action: 'Keep',
    },
    searchTarget: {
        scope: 'Prev',
    },
});
```

#### Revert Search Results of one Search

To replace searched items with those not searched, use the `revertResultsAtEnd` property.

```typescript
tablor.searchByStringQuery({
    query: 'Zeeshan',
    includeFields: ['name'],
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
    revertResultsAtEnd: true,
})
// This operation will get those users who do not have 'Zeeshan' in their name.
```

#### Revert Search Results of All the Performed Searches

```typescript
tablor.searchByStringQuery({
    query: 'Zeeshan',
    includeFields: ['name'],
    prevResults: {
        action: 'Clear',
        scope: 'All',
    },
})

tablor.searchByDateTimesRanges({
    ranges: {
        dob: [
            { start: new Date('1995-01-01'), end: new Date('2005-01-01'), includeStart: true },
        ],
    },
    prevResults: {
        action: 'Keep',
    },
    searchTarget: {
        scope: 'Prev',
    },
});

tablor.searchByVoid({
    prevResults: {
        action: 'Keep',
    },
    searchTarget: {
        scope: 'Prev',
    },
    revertResultsAtEnd: true,
})
```

### 7. Select Items

#### Select an Item

```typescript
tablor.selectItem(item, true);
```

#### Deselect an Item

```typescript
tablor.selectItem(item, false);
```

#### Toggle an Item's Selection

```typescript
tablor.selectItem(item, 'toggle');
```

#### Get Selected Items

```typescript
tablor.getSelectedItems();
```

#### Get Selected Items Within the Current Page

```typescript
tablor.getSelectedPaginatedItems();
```

### 8. Event Handling

TablorCore provides events to handle user interactions and custom events.

#### Subscribe to Items Removed Event

```typescript
tablor.$itemsRemoved.subscribe(options =>
{
    console.log('Items removed:', options.removedItems);
    // Or API call to remove items from server.
})
```

#### Subscribe to Items Updated Event

```typescript
tablor.$itemsUpdated.subscribe(options =>
{
    console.log('Items updated - after update:', options.updatedItems);
    console.log('Items updated - before update:', options.prevUpdatedItems);
    console.log('Items updated - update difference:', options.updatedItemsDifference);
})
```

#### Subscribe to Page Number Changed Event

```typescript
tablor.$pageNbChanged.subscribe(options =>
{
    console.log('Page number changed - new page nb:', options.pageNb);
    console.log('Page number changed - prev page nb:', options.prevPageNb);
})
```

There are many more events you can subscribe to.
But note that all of these events are also used in the `TablorCore` class,
so `avoid marking them as completed`.

---

### Additional Functionalities

Explore more powerful features that you can explore yourself.

--- 

🔗 **Start Building with Tablor-Core Today!**

---

## 📄 License

This project is licensed under the **Apache-2.0 License**.

Copyright 2025 [TIPUzee](https://github.com/TIPUzee).
