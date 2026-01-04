using System;
using System.Threading;

namespace ParallelProcessor
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Parallel File Analyzer");
            Console.WriteLine("Hlavni thread: " + Thread.CurrentThread.ManagedThreadId);
        }
    }
}
