# Parallel File Analyzer

Paralelní analyzátor textových souborů v C#. Rozdělí soubor mezi více threadů, každý zpracuje svou část a výsledky se sloučí.

## Spuštění

```bash
dotnet run                    # testovací soubor, 4 thready
dotnet run soubor.txt         # vlastní soubor, 4 thready
dotnet run soubor.txt 8       # vlastní soubor, 8 threadů
```

## Struktura projektu

| Soubor | Popis |
|--------|-------|
| `Program.cs` | Vstupní bod, zpracování argumentů |
| `FileAnalyzer.cs` | Řídí thready, agreguje výsledky |
| `ChunkProcessor.cs` | Worker - zpracovává část souboru |
| `AnalysisResult.cs` | Datová třída pro výsledky |
| `ConsoleLogger.cs` | Thread-safe výpis do konzole |
| `TestFileGenerator.cs` | Generuje testovací soubory |

## Jak to funguje

```
┌─────────────────────────────────────────────────────────┐
│                    SOUBOR (100%)                        │
├──────────────┬──────────────┬──────────────┬────────────┤
│    0-25%     │    25-50%    │    50-75%    │   75-100%  │
│   Thread-1   │   Thread-2   │   Thread-3   │  Thread-4  │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬─────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
   AnalysisResult  AnalysisResult  AnalysisResult  AnalysisResult
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                           │
                     AGREGACE VÝSLEDKŮ
                           │
                    CELKEM + TOP 10 slov
```

## Klíčové koncepty

### Thread synchronizace
- `lock` - zajistí že jen jeden thread přistupuje ke sdílenému zdroji
- `Thread.Join()` - počká na dokončení threadu

### Paralelní čtení souboru
- `FileShare.Read` - umožní více threadům číst stejný soubor
- Každý thread čte svou část (startPos až endPos)

### Proč každý thread má vlastní AnalysisResult?
- Nepotřebují lock při zapisování
- Žádné konflikty - každý píše do svého
- Slučujeme až po skončení všech threadů

## Autor

Robin Zajíček - SPŠE Ječná 2026

