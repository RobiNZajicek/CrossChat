# 📚 Portfolio - Robin Zajicek (zajicek3)

> **SPSE Jecna, Praha | 2026**

---

# ⚠️ DŮLEŽITÉ - AKTUÁLNÍ VERZE PROJEKTU D1

## 🔗 **E-SHOP PROJEKT JE V JINÉM REPOZITÁŘI!**

| Projekt | Aktuální repozitář |
|---------|-------------------|
| **D1 - E-Shop** | 👉 **[github.com/RobiNZajicek/basic_eshop_for_school](https://github.com/RobiNZajicek/basic_eshop_for_school)** 👈 |

**Verze v tomto repozitáři (D1-Eshop-Database/) je ZASTARALÁ!**

Pro aktuální verzi s kompletní dokumentací, testy a PDF soubory navštivte:
### **https://github.com/RobiNZajicek/basic_eshop_for_school**

---

## 🗂️ Obsah Portfolio

Toto repo obsahuje skolni projekty:

| # | Projekt | Typ | Odkaz | Popis |
|---|---------|-----|-------|-------|
| 1 | **D1 - E-Shop** | Databaze | 🔗 **[basic_eshop_for_school](https://github.com/RobiNZajicek/basic_eshop_for_school)** | E-shop s Repository Pattern |
| 2 | **Threads** | Paralelni programovani | [Threads-ParallelFileAnalyzer/](./Threads-ParallelFileAnalyzer/) | Multi-threaded file analyzer |

---

## 📦 Projekt 1: D1 - E-Shop (Databazovy projekt)

# ⚠️ PŘESUNUT DO SAMOSTATNÉHO REPOZITÁŘE!

### 👉 [https://github.com/RobiNZajicek/basic_eshop_for_school](https://github.com/RobiNZajicek/basic_eshop_for_school) 👈

**Oznaceni:** D1 - Repository Pattern

### Pouzite technologie

| Vrstva | Technologie |
|--------|-------------|
| Backend | Python Flask, pyodbc |
| Frontend | React + Vite |
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
- ✅ **3x testovaci scenar** + kompletni dokumentace (PDF)

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

### Jak spustit

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
