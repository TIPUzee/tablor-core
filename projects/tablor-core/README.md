# Tablor Core - Stable 🌟

**Create beautiful datatables, grid views, and more effortlessly with Tablor-Core!**  
Leverage powerful features already implemented—you just need to focus on your UI.

--- 

## Demo

- Fully functioning preview with pre-built UI:  
  **👉 [Sample Preview](https://stackblitz.com/github/TIPUzee/tablor-core-demo/tree/beta/simple?file=src%2Fapp%2Fapp.component.ts)**

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

## 💡 Why Choose Tablor-Core?

Tablor-Core offers an extensive toolkit for building interactive and dynamic datatables with minimal effort. Whether you're creating grid views or advanced data management UIs, Tablor-Core has you covered.

---

🔗 **Start Building with Tablor-Core Today!**

--- 

## 📄 License

This project is licensed under the **Apache-2.0 License**.

Copyright 2025 [TIPUzee](https://github.com/TIPUzee).
