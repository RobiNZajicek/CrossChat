using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;

namespace ParallelProcessor
{
    class Program
    {
        // kolik threadu bude delat praci
        private const int NUM_THREADS = 4;
        
        // sem si kazdy thread ulozi svuj vysledek
        private static int[] _wordCounts = null!;
        private static int[] _lineCounts = null!;
        private static Dictionary<string, int>[] _wordFrequencies = null!;
        
        // zamek aby se nam nepomichaly vypisy do konzole
        private static readonly object _consoleLock = new object();

        // hlavni metoda tady to vsechno zacina
        static void Main(string[] args)
        {
            string? filePath = args.Length > 0 ? args[0] : null;
            
            // kdyz neni soubor tak si vytvorime testovaci
            if (filePath == null || !File.Exists(filePath))
            {
                filePath = "testfile.txt";
                CreateTestFile(filePath, 100000);
                Console.WriteLine($"Vytvořen testovací soubor: {filePath}");
            }

            var fileInfo = new FileInfo(filePath);
            Console.WriteLine("=== Parallel File Analyzer ===");
            Console.WriteLine($"Soubor: {filePath}");
            Console.WriteLine($"Velikost: {fileInfo.Length / 1024.0:F2} KB");
            Console.WriteLine($"Threadů: {NUM_THREADS}");
            Console.WriteLine(new string('-', 50));

            // inicializace poli pro vysledky od kazdeho threadu
            _wordCounts = new int[NUM_THREADS];
            _lineCounts = new int[NUM_THREADS];
            _wordFrequencies = new Dictionary<string, int>[NUM_THREADS];

            // rozdelime soubor na 4 casti
            long fileSize = fileInfo.Length;
            long chunkSize = fileSize / NUM_THREADS;
            
            var startTime = DateTime.Now;
            Thread[] threads = new Thread[NUM_THREADS];

            // vytvarime 4 thready a kazdemu dame jeho cast souboru
            for (int i = 0; i < NUM_THREADS; i++)
            {
                // dulezity trik musime zkopirovat i jinak by vsechny thready videly 4
                int threadId = i;
                long startPos = i * chunkSize;
                long endPos = (i == NUM_THREADS - 1) ? fileSize : (i + 1) * chunkSize;
                
                int percentage = (int)((endPos - startPos) * 100 / fileSize);
                SafeLog($"Thread-{threadId + 1}: pozice {startPos}-{endPos} ({percentage}% souboru)");

                // lambda ktera rekne threadu co ma delat
                threads[i] = new Thread(() => ProcessChunk(filePath, threadId, startPos, endPos));
                threads[i].Name = $"Worker-{threadId + 1}";
            }

            Console.WriteLine(new string('-', 50));
            
            // spustime vsechny thready naraz bezi paralelne
            foreach (var t in threads)
            {
                t.Start();
            }

            // pockame az vsechny thready dokonci praci
            foreach (var t in threads)
            {
                t.Join();
            }

            var elapsed = DateTime.Now - startTime;

            // ted spojime vysledky od vsech threadu dohromady
            Console.WriteLine(new string('-', 50));
            Console.WriteLine("=== VÝSLEDKY ===");
            
            int totalWords = 0;
            int totalLines = 0;
            var totalFrequency = new Dictionary<string, int>();

            for (int i = 0; i < NUM_THREADS; i++)
            {
                Console.WriteLine($"Thread-{i + 1}: {_lineCounts[i]} řádků, {_wordCounts[i]} slov");
                totalWords += _wordCounts[i];
                totalLines += _lineCounts[i];
                
                // sloucime slovniky frekvenci slov
                if (_wordFrequencies[i] != null)
                {
                    foreach (var kvp in _wordFrequencies[i])
                    {
                        if (!totalFrequency.ContainsKey(kvp.Key))
                            totalFrequency[kvp.Key] = 0;
                        totalFrequency[kvp.Key] += kvp.Value;
                    }
                }
            }

            Console.WriteLine(new string('-', 50));
            Console.WriteLine($"CELKEM: {totalLines} řádků, {totalWords} slov");
            Console.WriteLine($"Čas: {elapsed.TotalMilliseconds:F0} ms");
            
            // seradime slova od nejcastejsich a vypiseme top 10
            Console.WriteLine();
            Console.WriteLine("=== TOP 10 NEJČASTĚJŠÍCH SLOV ===");
            var sortedWords = new List<KeyValuePair<string, int>>(totalFrequency);
            sortedWords.Sort((a, b) => b.Value.CompareTo(a.Value));
            
            for (int i = 0; i < Math.Min(10, sortedWords.Count); i++)
            {
                Console.WriteLine($"{i + 1}. \"{sortedWords[i].Key}\" - {sortedWords[i].Value}x");
            }
        }

        // tohle bezi v kazdem threadu zvlast kazdy ma svoji cast souboru
        static void ProcessChunk(string filePath, int threadId, long startPos, long endPos)
        {
            _wordFrequencies[threadId] = new Dictionary<string, int>();
            int wordCount = 0;
            int lineCount = 0;

            SafeLog($"[{Thread.CurrentThread.Name}] Začínám zpracování...");

            // otevreme soubor pro cteni vic threadu muze cist naraz diky FileShare.Read
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                // skocime na nasi pozici v souboru
                stream.Seek(startPos, SeekOrigin.Begin);

                // kdyz nezaciname od zacatku musime preskocit zbytek radku
                // jinak bychom zacali uprostred slova a to nechceme
                if (startPos > 0)
                {
                    while (stream.Position < endPos)
                    {
                        int b = stream.ReadByte();
                        if (b == -1 || b == '\n')
                            break;
                    }
                }

                using (var reader = new StreamReader(stream, Encoding.UTF8, false, 4096, true))
                {
                    string? line;
                    // cti radky dokud jsi ve sve casti souboru
                    while (stream.Position < endPos && (line = reader.ReadLine()) != null)
                    {
                        lineCount++;
                        
                        // rozdelime radek na slova
                        string[] words = line.Split(new[] { ' ', '\t', ',', '.', '!', '?', ';', ':' }, 
                                                     StringSplitOptions.RemoveEmptyEntries);
                        
                        foreach (var word in words)
                        {
                            string cleanWord = word.ToLower().Trim();
                            // kratka slova ignorujeme
                            if (cleanWord.Length > 2)
                            {
                                wordCount++;
                                
                                // pridame slovo do slovniku nebo zvysime pocet
                                if (!_wordFrequencies[threadId].ContainsKey(cleanWord))
                                    _wordFrequencies[threadId][cleanWord] = 0;
                                _wordFrequencies[threadId][cleanWord]++;
                            }
                        }
                    }
                }
            }

            // ulozime vysledky kazdy thread pise do jineho indexu takze je to safe
            _wordCounts[threadId] = wordCount;
            _lineCounts[threadId] = lineCount;

            SafeLog($"[{Thread.CurrentThread.Name}] Hotovo: {lineCount} řádků, {wordCount} slov");
        }

        // vytvori testovaci soubor s nahodnymi slovy
        static void CreateTestFile(string path, int lines)
        {
            string[] sampleWords = { 
                "program", "thread", "parallel", "processing", "file", "data", 
                "analysis", "worker", "queue", "lock", "synchronization", "buffer",
                "producer", "consumer", "task", "result", "word", "count", "line",
                "text", "example", "test", "sample", "random", "generate"
            };
            
            var random = new Random();
            using (var writer = new StreamWriter(path))
            {
                for (int i = 0; i < lines; i++)
                {
                    int wordsInLine = random.Next(5, 15);
                    var lineWords = new List<string>();
                    for (int w = 0; w < wordsInLine; w++)
                    {
                        lineWords.Add(sampleWords[random.Next(sampleWords.Length)]);
                    }
                    writer.WriteLine(string.Join(" ", lineWords));
                }
            }
        }

        // bezpecny vypis do konzole zamek zajisti ze se nam to nepomicha
        static void SafeLog(string message)
        {
            lock (_consoleLock)
            {
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] {message}");
            }
        }
    }
}
