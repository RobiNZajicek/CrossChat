using System;

namespace ParallelProcessor
{
    class Program
    {
        static void Main(string[] args)
        {
            // vytvorime logger - bude sdileny mezi thready
            var logger = new ConsoleLogger();
            
            logger.Log("=== Parallel File Analyzer ===");
            logger.LogWithThread("Program spusten");
        }
    }
}
