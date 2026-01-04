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
            
            // pripravime testovaci soubor
            string testFile = "testfile.txt";
            if (!File.Exists(testFile))
            {
                logger.Log("Generuji testovaci soubor...");
                TestFileGenerator.Create(testFile, 50000);  // 50000 radku
            }
            
            // spustime analyzu se 4 thready
            var analyzer = new FileAnalyzer(threadCount: 4, logger);
            analyzer.Analyze(testFile);
        }
    }
}
