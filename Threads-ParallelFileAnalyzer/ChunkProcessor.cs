using System;
using System.IO;
using System.Text;
using System.Threading;

namespace ParallelProcessor
{
    // zpracovava jednu cast souboru - kazdy thread ma svoji instanci
    public class ChunkProcessor
    {
        private readonly string _filePath;
        private readonly long _startPos;    // zacatek cteni 
        private readonly long _endPos;      // konec cteni
        private readonly ConsoleLogger _logger;

        public ChunkProcessor(string filePath, long startPos, long endPos, ConsoleLogger logger)
        {
            _filePath = filePath;
            _startPos = startPos;
            _endPos = endPos;
            _logger = logger;
        }

        // zpracuje cast a vrati vysledek 
        public AnalysisResult Process()
        {
            var result = new AnalysisResult();
            string threadName = Thread.CurrentThread.Name ?? "Unknown";
            
            _logger.LogWithThread("Zacinam zpracovani...");

            // otevreme soubor - FileShare.Read umozni vice threadum cist naraz
            using (var stream = new FileStream(_filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                // skocime na nasi startovni pozici
                stream.Seek(_startPos, SeekOrigin.Begin);

                // pokud nezaciname od zacatku, preskocime zbytek radku
                // jinak bychom zacali uprostred slova
                if (_startPos > 0)
                {
                    SkipToNextLine(stream);
                }

                // ctime a zpracovavame radky
                using (var reader = new StreamReader(stream, Encoding.UTF8))
                {
                    string? line;
                    while (stream.Position < _endPos && (line = reader.ReadLine()) != null)
                    {
                        ProcessLine(line, result);
                    }
                }
            }

            _logger.LogWithThread($"Hotovo: {result.LineCount} radku, {result.WordCount} slov");
            return result;
        }

        // preskoci na zacatek dalsiho radku
        private void SkipToNextLine(FileStream stream)
        {
            int b;
            while (stream.Position < _endPos && (b = stream.ReadByte()) != -1)
            {
                if (b == '\n') break;
            }
        }

        // zpracuje jeden radek - spocita slova
        private void ProcessLine(string line, AnalysisResult result)
        {
            result.LineCount++;
            
            // rozdelime na slova podle mezer a interpunkce
            string[] words = line.Split(
                new[] { ' ', '\t', ',', '.', '!', '?' },
                StringSplitOptions.RemoveEmptyEntries
            );

            foreach (var word in words)
            {
                string clean = word.ToLower().Trim();
                if (clean.Length > 2)  // ignorujeme kratka slova
                {
                    result.WordCount++;
                    result.AddWord(clean);
                }
            }
        }
    }
}

