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
            
            // vytvorime testovaci soubor
            string testFile = "testfile.txt";
            logger.Log("Generuji testovaci soubor...");
            TestFileGenerator.Create(testFile, 10000);  // 10000 radku
            
            // info o souboru
            var fileInfo = new FileInfo(testFile);
            logger.Log($"Soubor vytvoren: {fileInfo.Length / 1024.0:F2} KB");
        }
    }
}
