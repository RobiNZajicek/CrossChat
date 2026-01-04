using System;
using System.Collections.Generic;
using System.IO;

namespace ParallelProcessor
{
    // generuje testovaci soubory s nahodnymi slovy
    public static class TestFileGenerator
    {
        // vzorova slova pro generovani
        private static readonly string[] Words = {
            "parallel", "thread", "process", "lock", "sync",
            "data", "file", "read", "write", "buffer",
            "queue", "worker", "task", "result", "count"
        };

        // vytvori soubor s nahodnymi radky
        public static void Create(string path, int lineCount)
        {
            var random = new Random();
            
            using (var writer = new StreamWriter(path))
            {
                for (int i = 0; i < lineCount; i++)
                {
                    string line = GenerateLine(random);
                    writer.WriteLine(line);
                }
            }
        }

        // vygeneruje jeden radek s 5-15 nahodnymi slovy
        private static string GenerateLine(Random random)
        {
            int wordCount = random.Next(5, 15);
            var lineWords = new List<string>();
            
            for (int i = 0; i < wordCount; i++)
            {
                int index = random.Next(Words.Length);
                lineWords.Add(Words[index]);
            }
            
            return string.Join(" ", lineWords);
        }
    }
}

