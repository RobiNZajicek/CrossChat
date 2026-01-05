using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;

namespace ParallelProcessor
{
    
    public class FileAnalyzer
    {
        private readonly int _threadCount;
        private readonly ConsoleLogger _logger;
        private AnalysisResult[] _results = null!;

        public FileAnalyzer(int threadCount, ConsoleLogger logger)
        {
            _threadCount = threadCount;
            _logger = logger;
        }

        
        public void Analyze(string filePath)
        {
            var fileInfo = new FileInfo(filePath);
            long fileSize = fileInfo.Length;
            long chunkSize = fileSize / _threadCount;

            _logger.Log($"Soubor: {filePath}");
            _logger.Log($"Velikost: {fileSize / 1024.0:F2} KB");
            _logger.Log($"Pocet threadu: {_threadCount}");
            _logger.Log(new string('-', 40));

            _results = new AnalysisResult[_threadCount];
            
            
            var startTime = DateTime.Now;
            Thread[] threads = CreateThreads(filePath, fileSize, chunkSize);
            StartThreads(threads);
            WaitForThreads(threads);
            var elapsed = DateTime.Now - startTime;

            
            PrintResults(elapsed);
        }
    
        private Thread[] CreateThreads(string filePath, long fileSize, long chunkSize)
        {
            Thread[] threads = new Thread[_threadCount];

            for (int i = 0; i < _threadCount; i++)
            {
                int threadId = i;
                long startPos = i * chunkSize;
                long endPos = (i == _threadCount - 1) ? fileSize : (i + 1) * chunkSize;

                var processor = new ChunkProcessor(filePath, startPos, endPos, _logger);
                
                threads[i] = new Thread(() => {
                    _results[threadId] = processor.Process();
                });
                threads[i].Name = $"Worker-{i + 1}";
            }

            return threads;
        }

        
        private void StartThreads(Thread[] threads)
        {
            foreach (var thread in threads)
                thread.Start();
        }

        
        private void WaitForThreads(Thread[] threads)
        {
            foreach (var thread in threads)
                thread.Join();
        }

        
        private void PrintResults(TimeSpan elapsed)
        {
            _logger.Log(new string('-', 40));
            _logger.Log("=== VYSLEDKY ===");

            int totalWords = 0;
            int totalLines = 0;
            var totalFrequency = new Dictionary<string, int>();

            // secteme vysledky a sloucime frekvence
            for (int i = 0; i < _threadCount; i++)
            {
                var r = _results[i];
                _logger.Log($"Thread-{i + 1}: {r.LineCount} radku, {r.WordCount} slov");
                totalWords += r.WordCount;
                totalLines += r.LineCount;

                // sloucime slovniky frekvenci
                foreach (var kvp in r.WordFrequency)
                {
                    if (!totalFrequency.ContainsKey(kvp.Key))
                        totalFrequency[kvp.Key] = 0;
                    totalFrequency[kvp.Key] += kvp.Value;
                }
            }

            _logger.Log(new string('-', 40));
            _logger.Log($"CELKEM: {totalLines} radku, {totalWords} slov");
            _logger.Log($"Cas: {elapsed.TotalMilliseconds:F0} ms");

            PrintTopWords(totalFrequency, 10);
        }

        private void PrintTopWords(Dictionary<string, int> frequency, int count) // nejcastejsi slova
        {
            _logger.Log("");
            _logger.Log("=== TOP 10 NEJCASTEJSICH SLOV ===");

            // prevedeme na list a seradime sestupne
            var sorted = new List<KeyValuePair<string, int>>(frequency);
            sorted.Sort((a, b) => b.Value.CompareTo(a.Value));

            for (int i = 0; i < Math.Min(count, sorted.Count); i++)
            {
                _logger.Log($"{i + 1}. \"{sorted[i].Key}\" - {sorted[i].Value}x");
            }
        }
    }
}
