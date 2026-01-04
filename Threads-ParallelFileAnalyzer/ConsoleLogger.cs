
using System;
using System.Threading;

namespace ParallelProcessor
{
    // trida pro bezpecny vypis do konzole z vice threadu
    public class ConsoleLogger
    {
        // zamek - jen jeden thread muze vypisovat naraz
        private readonly object _lock = new object();

        // vypise zpravu s casovou znackou
        public void Log(string message)
        {
            lock (_lock)
            {
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] {message}");
            }
        }

        // vypise zpravu s nazvem aktualniho threadu
        public void LogWithThread(string message)
        {
            lock (_lock)
            {
                string threadName = Thread.CurrentThread.Name ?? $"Thread-{Thread.CurrentThread.ManagedThreadId}";
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] [{threadName}] {message}");
            }
        }
    }
}

