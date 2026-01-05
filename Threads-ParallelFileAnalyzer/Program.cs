using System;
using System.IO;

namespace ParallelProcessor
{
    class Program
    {
        static void Main(string[] args)
        {
            var logger = new ConsoleLogger();
            
            logger.Log("=== Parallel File Analyzer ===");
            
            // zpracujeme argumenty
            string filePath = GetFilePath(args, logger);
            int threadCount = GetThreadCount(args);
            
            // spustime analyzu
            var analyzer = new FileAnalyzer(threadCount, logger);
            analyzer.Analyze(filePath);
        }

        
        static string GetFilePath(string[] args, ConsoleLogger logger)
        {
            if (args.Length > 0 && File.Exists(args[0]))
            {
                return args[0];
            }
            
            // vytvorime testovaci soubor
            string testFile = "testfile.txt";
            if (!File.Exists(testFile))
            {
                logger.Log("Generuji testovaci soubor (100000 radku)...");
                TestFileGenerator.Create(testFile, 100000);
            }
            return testFile;
        }

        static int GetThreadCount(string[] args)
        {
            if (args.Length > 1 && int.TryParse(args[1], out int count))
            {
                return Math.Max(1, Math.Min(count, 16));  
            }
            return 4;  
        }
    }
}
