using System;
using System.Threading;

namespace ParallelProcessor
{
    /// <summary>
    /// Thread-safe logger pro vypis do konzole.
    /// Pouziva LOCK aby se vypisy z ruznych threadu nepromichaly.
    /// 
    /// PROC TO POTREBUJEME:
    /// - Kdyz vic threadu pise do konzole naraz, text se muze promichat
    /// - Lock zajisti ze vzdy pise jen JEDEN thread
    /// - Ostatni thready cekaji az se zamek uvolni
    /// </summary>
    public class ConsoleLogger
    {
        // zamek - objekt ktery slouzi jako "klic" k zamykani
        // readonly = po vytvoreni se nemuze zmenit
        private readonly object _lock = new object();

        /// <summary>
        /// Vypise zpravu s casovou znackou.
        /// Je THREAD-SAFE - muze byt volana z vice threadu naraz.
        /// </summary>
        /// <param name="message">Zprava k vypsani</param>
        public void Log(string message)
        {
            // LOCK blok - pouze jeden thread muze byt uvnitr
            // ostatni thready CEKAJI pred zamkem
            lock (_lock)
            {
                // cas ve formatu HH:mm:ss.fff (hodiny:minuty:sekundy.milisekundy)
                string timestamp = DateTime.Now.ToString("HH:mm:ss.fff");
                Console.WriteLine($"[{timestamp}] {message}");
            }
            // zde se zamek AUTOMATICKY uvolni
        }

        /// <summary>
        /// Vypise zpravu s nazvem aktualniho threadu.
        /// Uzitecne pro sledovani ktery thread co dela.
        /// </summary>
        /// <param name="message">Zprava k vypsani</param>
        public void LogWithThread(string message)
        {
            lock (_lock)
            {
                string timestamp = DateTime.Now.ToString("HH:mm:ss.fff");
                string threadName = Thread.CurrentThread.Name ?? $"Thread-{Thread.CurrentThread.ManagedThreadId}";
                Console.WriteLine($"[{timestamp}] [{threadName}] {message}");
            }
        }
    }
}

