# 📚 Portfolio - Robin Zajicek (zajicek3)

> **SPSE Jecna, Praha | 2026**

---

## 🗂️ Obsah Portfolio

Toto repo obsahuje dva skolni projekty:

| # | Projekt | Typ | Slozka | Popis |
|---|---------|-----|--------|-------|
| 1 | **D1 - E-Shop** | Databaze | [D1-Eshop-Database/](./D1-Eshop-Database/) | E-shop s Repository Pattern |
| 2 | **Threads** | Paralelni programovani | [Threads-ParallelFileAnalyzer/](./Threads-ParallelFileAnalyzer/) | Multi-threaded file analyzer |

---

## 📦 Projekt 1: D1 - E-Shop (Databazovy projekt)

**Oznaceni:** D1 - Repository Pattern  
**Dokumentace:** [D1-Eshop-Database/README.md](./D1-Eshop-Database/README.md)

### Pouzite technologie

| Vrstva | Technologie |
|--------|-------------|
| Backend | Python Flask, pyodbc |
| Frontend | Next.js 16, React |
| Databaze | Microsoft SQL Server |
| Pattern | **Repository Pattern (D1)** |

### Splnene pozadavky

- ✅ **5 tabulek** - users, categories, products, orders, order_items
- ✅ **2 views** - v_order_details, v_product_stats
- ✅ **M:N vazba** - order_items (products ↔ orders)
- ✅ **Datove typy** - DECIMAL, BIT, VARCHAR, DATETIME, CHECK
- ✅ **CRUD operace** pres vice tabulek (vytvoreni objednavky)
- ✅ **Transakce** - prevod kreditu, vytvoreni objednavky
- ✅ **Report** z 3+ tabulek
- ✅ **Import z JSON**
- ✅ **3x testovaci scenar** + kompletni dokumentace

### Struktura

```
D1-Eshop-Database/
├── README.md
├── doc/
│   ├── DOKUMENTACE.md          ← 1000+ radku dokumentace
│   ├── test_scenario_1_installation.md
│   ├── test_scenario_2_functions.md
│   └── test_scenario_3_errors.md
├── src/
│   ├── backend/                ← Flask API + Repository Pattern
│   │   ├── app.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── repositories/
│   │       ├── base_repository.py
│   │       ├── product_repository.py
│   │       ├── category_repository.py
│   │       ├── user_repository.py
│   │       └── order_repository.py
│   ├── sql/                    ← DDL skripty pro databazi
│   └── app/                    ← Next.js frontend
└── requirements.txt
```

---

## 🔄 Projekt 2: Parallel File Analyzer (Threads)

**Oznaceni:** Threads - Paralelni programovani  
**Dokumentace:** [Threads-ParallelFileAnalyzer/README.md](./Threads-ParallelFileAnalyzer/README.md)

### Pouzite technologie

| Technologie | Ucel |
|-------------|------|
| C# (.NET 9) | Programovaci jazyk |
| System.Threading | Thread, lock |
| System.IO | FileStream, StreamReader |

### Hlavni funkce

- ✅ **4 paralelni thready** - kazdy zpracovava 25% souboru
- ✅ **Thread synchronizace** - `lock` pro bezpecny vypis
- ✅ **Sdilena data** - pole pro vysledky od kazdeho threadu
- ✅ **Frekvencni analyza** - TOP 10 nejcastejsich slov
- ✅ **Realne vyuziti** - analyza textovych souboru

### Architektura

```
┌─────────────────────────────────────────────────────────────┐
│                         MAIN THREAD                          │
│  Rozdeli soubor → Spusti 4 thready → Pockej → Agreguj       │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────┬───────────────┬───────────────┬──────────────┐
│   THREAD-1    │   THREAD-2    │   THREAD-3    │   THREAD-4   │
│   (0-25%)     │   (25-50%)    │   (50-75%)    │   (75-100%)  │
│   Cte a       │   Cte a       │   Cte a       │   Cte a      │
│   pocita      │   pocita      │   pocita      │   pocita     │
└───────────────┴───────────────┴───────────────┴──────────────┘
```

### Struktura

```
Threads-ParallelFileAnalyzer/
├── Program.cs              ← Hlavni kod (230 radku)
├── ParallelProcessor.csproj
├── DOKUMENTACE.txt         ← Podrobna dokumentace radek po radku
└── README.md
```

---

## 🚀 Jak spustit

### Projekt 1: E-Shop

```bash
# Backend
cd D1-Eshop-Database/src/backend
pip install -r ../../requirements.txt
python app.py

# Frontend (v novem terminalu)
cd D1-Eshop-Database
npm install
npm run dev
```

### Projekt 2: Parallel File Analyzer

```bash
cd Threads-ParallelFileAnalyzer
dotnet run
```

---

## 👨‍💻 Autor

**Robin Zajicek (zajicek3)**  
📧 zajicek3@spsejecna.cz  
🏫 SPSE Jecna, Praha  
📅 2026
