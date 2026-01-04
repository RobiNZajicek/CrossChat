using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;

namespace ParallelProcessor
{
    // ridi celou analyzu - vytvari thready a sbira vysledky
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

        // spusti analyzu souboru
        public void Analyze(string filePath)
        {
            var fileInfo = new FileInfo(filePath);
            long fileSize = fileInfo.Length;
            long chunkSize = fileSize / _threadCount;

            _logger.Log($"Soubor: {filePath}");
            _logger.Log($"Velikost: {fileSize / 1024.0:F2} KB");
            _logger.Log($"Pocet threadu: {_threadCount}");
            _logger.Log(new string('-', 40));

            // pripravime pole pro vysledky
            _results = new AnalysisResult[_threadCount];
            
            // vytvorime a spustime thready
            Thread[] threads = CreateThreads(filePath, fileSize, chunkSize);
            StartThreads(threads);
            WaitForThreads(threads);

            // agregace a vypis vysledku
            PrintResults();
        }

        // vytvori thready - kazdy dostane svoji cast souboru
        private Thread[] CreateThreads(string filePath, long fileSize, long chunkSize)
        {
            Thread[] threads = new Thread[_threadCount];

            for (int i = 0; i < _threadCount; i++)
            {
                int threadId = i;  // dulezite! kopie pro closure
                long startPos = i * chunkSize;
                long endPos = (i == _threadCount - 1) ? fileSize : (i + 1) * chunkSize;

                // vytvorime processor a thread
                var processor = new ChunkProcessor(filePath, startPos, endPos, _logger);
                
                threads[i] = new Thread(() => {
                    _results[threadId] = processor.Process();
                });
                threads[i].Name = $"Worker-{i + 1}";
            }

            return threads;
        }

        // spusti vsechny thready naraz
        private void StartThreads(Thread[] threads)
        {
            foreach (var thread in threads)
            {
                thread.Start();
            }
        }

        // pocka az vsechny thready skonci
        private void WaitForThreads(Thread[] threads)
        {
            foreach (var thread in threads)
            {
                thread.Join();
            }
        }

        // spocita a vypise vysledky
        private void PrintResults()
        {
            _logger.Log(new string('-', 40));
            _logger.Log("=== VYSLEDKY ===");

            int totalWords = 0;
            int totalLines = 0;

            // secteme vysledky od vsech threadu
            for (int i = 0; i < _threadCount; i++)
            {
                var r = _results[i];
                _logger.Log($"Thread-{i + 1}: {r.LineCount} radku, {r.WordCount} slov");
                totalWords += r.WordCount;
                totalLines += r.LineCount;
            }

            _logger.Log(new string('-', 40));
            _logger.Log($"CELKEM: {totalLines} radku, {totalWords} slov");
        }
    }
}

