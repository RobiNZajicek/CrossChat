
using System;
using System.Threading;

namespace ParallelProcessor
{
    
    public class ConsoleLogger
    {
  
        private readonly object _lock = new object();

    
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

