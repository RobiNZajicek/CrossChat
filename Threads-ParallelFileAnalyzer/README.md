# 🔄 Parallel File Analyzer

> **Multi-threaded file processing in C# with word frequency analysis**

---

## Zakladni informace

| Polozka | Hodnota |
|---------|---------|
| **Nazev projektu** | Parallel File Analyzer |
| **Oznaceni** | Threads - Paralelni zpracovani |
| **Autor** | Robin Zajicek (zajicek3) |
| **Kontakt** | zajicek3@spsejecna.cz |
| **Skola** | SPSE Jecna, Praha |
| **Predmet** | Threads / Paralelni programovani |
| **Datum** | 2026 |
| **Typ projektu** | Skolni projekt |

---

## 📋 Popis projektu

Aplikace demonstruje **paralelni zpracovani souboru** pomoci vice threadu v C#. 
Rozdeli velky textovy soubor na 4 casti a kazdy thread zpracovava svoji cast **soucasne**.

### Hlavni funkce

- ✅ **Paralelni cteni** - 4 thready cteou soubor najednou
- ✅ **Pocitani slov** - kazdy thread pocita slova ve sve casti
- ✅ **Frekvencni analyza** - urcuje nejcastejsi slova
- ✅ **Thread synchronizace** - bezpecny vypis pomoci `lock`
- ✅ **Agregace vysledku** - spojeni dat od vsech threadu

---

## 🏗️ Architektura

```
┌─────────────────────────────────────────────────────────────┐
│                         MAIN THREAD                          │
│                                                              │
│  1. Nacti/vytvor soubor                                      │
│  2. Rozdel na 4 casti                                        │
│  3. Vytvor 4 worker thready                                  │
│  4. Spust vsechny (.Start())                                │
│  5. Pockej na vsechny (.Join())                             │
│  6. Agreguj vysledky                                         │
│  7. Vypis TOP 10 slov                                        │
└─────────────────────────────────────────────────────────────┘
        │
        │ Thread.Start()
        ▼
┌───────────────┬───────────────┬───────────────┬──────────────┐
│   THREAD-1    │   THREAD-2    │   THREAD-3    │   THREAD-4   │
│   (0-25%)     │   (25-50%)    │   (50-75%)    │   (75-100%)  │
├───────────────┼───────────────┼───────────────┼──────────────┤
│ - Seek na     │ - Seek na     │ - Seek na     │ - Seek na    │
│   startPos    │   startPos    │   startPos    │   startPos   │
│ - Cti radky   │ - Cti radky   │ - Cti radky   │ - Cti radky  │
│ - Pocitej     │ - Pocitej     │ - Pocitej     │ - Pocitej    │
│   slova       │   slova       │   slova       │   slova      │
│ - Uloz do     │ - Uloz do     │ - Uloz do     │ - Uloz do    │
│   slovniku    │   slovniku    │   slovniku    │   slovniku   │
└───────┬───────┴───────┬───────┴───────┬───────┴───────┬──────┘
        │               │               │               │
        └───────────────┴───────────────┴───────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │ SDILENA DATA        │
                    ├─────────────────────┤
                    │ _wordCounts[4]      │
                    │ _lineCounts[4]      │
                    │ _wordFrequencies[4] │
                    └─────────────────────┘
```

---

## 🔧 Pouzite technologie

| Technologie | Ucel |
|-------------|------|
| C# (.NET 9) | Programovaci jazyk |
| System.Threading | Thread, lock |
| System.IO | FileStream, StreamReader |
| System.Collections.Generic | Dictionary, List |

---

## 🚀 Spusteni

### Pozadavky
- .NET 9.0 SDK

### Kompilace a spusteni

```bash
# Kompilace
dotnet build

# Spusteni (vytvori testovaci soubor)
dotnet run

# Spusteni s vlastnim souborem
dotnet run mujsoubor.txt
```

### Priklad vystupu

```
=== Parallel File Analyzer ===
Soubor: testfile.txt
Velikost: 1234.56 KB
Threadů: 4
--------------------------------------------------
[12:34:56.789] Thread-1: pozice 0-316000 (25% souboru)
[12:34:56.790] Thread-2: pozice 316000-632000 (25% souboru)
[12:34:56.791] Thread-3: pozice 632000-948000 (25% souboru)
[12:34:56.792] Thread-4: pozice 948000-1264000 (25% souboru)
--------------------------------------------------
[12:34:56.793] [Worker-1] Začínám zpracování...
[12:34:56.794] [Worker-2] Začínám zpracování...
[12:34:56.795] [Worker-3] Začínám zpracování...
[12:34:56.796] [Worker-4] Začínám zpracování...
[12:34:56.850] [Worker-2] Hotovo: 25000 řádků, 150000 slov
[12:34:56.852] [Worker-1] Hotovo: 25000 řádků, 148000 slov
[12:34:56.855] [Worker-4] Hotovo: 25000 řádků, 151000 slov
[12:34:56.858] [Worker-3] Hotovo: 25000 řádků, 149000 slov
--------------------------------------------------
=== VÝSLEDKY ===
Thread-1: 25000 řádků, 148000 slov
Thread-2: 25000 řádků, 150000 slov
Thread-3: 25000 řádků, 149000 slov
Thread-4: 25000 řádků, 151000 slov
--------------------------------------------------
CELKEM: 100000 řádků, 598000 slov
Čas: 65 ms

=== TOP 10 NEJČASTĚJŠÍCH SLOV ===
1. "processing" - 45123x
2. "thread" - 43567x
3. "parallel" - 42890x
...
```

---

## 📖 Klicove koncepty

### 1. Thread (vlakno)

```csharp
Thread t = new Thread(() => ProcessChunk(...));
t.Start();  // Spusti thread (bezi paralelne)
t.Join();   // Pocka na dokonceni
```

### 2. Lock (zamek)

```csharp
private static readonly object _consoleLock = new object();

lock (_consoleLock)
{
    // Pouze jeden thread muze byt uvnitr
    Console.WriteLine("Bezpecny vypis");
}
```

### 3. Sdilena data

```csharp
// Kazdy thread pise do jineho indexu = bezpecne
_wordCounts[threadId] = wordCount;
```

### 4. FileShare.Read

```csharp
new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read)
// Umoznuje vice threadum cist soubor najednou
```

---

## 📂 Struktura projektu

```
Threads-ParallelFileAnalyzer/
├── Program.cs              ← Hlavni kod
├── ParallelProcessor.csproj ← Projektovy soubor
├── DOKUMENTACE.txt         ← Podrobna dokumentace
└── README.md               ← Tento soubor
```

---

## 🎓 Splneni pozadavku

| Pozadavek | Splneno | Kde |
|-----------|---------|-----|
| Prace s thready | ✅ | Thread[], Start(), Join() |
| Synchronizace | ✅ | lock(_consoleLock) |
| Sdilena data | ✅ | _wordCounts[], _wordFrequencies[] |
| Realne vyuziti | ✅ | Analyza textovych souboru |

---

## 👨‍💻 Autor

**Robin Zajicek (zajicek3)**  
SPSE Jecna, Praha  
2026

