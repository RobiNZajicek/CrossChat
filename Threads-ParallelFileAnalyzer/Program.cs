using System;

namespace ParallelProcessor
{
    /// <summary>
    /// Hlavni vstupni bod programu
    /// Jen spousti analyzu - samotna logika je v jinych tridach
    /// </summary>
    class Program
    {
        static void Main(string[] args)
        {
            // vytvorime logger - bude sdilet vsechny thready
            var logger = new ConsoleLogger();
            
            logger.Log("=== Parallel File Analyzer ===");
            logger.Log("Program pro paralelni analyzu textovych souboru");
            
            // ukazka logovani s nazvem threadu
            logger.LogWithThread("Toto je hlavni thread");
            
            // TODO: Zde vytvorime FileAnalyzer a spustime analyzu
        }
    }
}
