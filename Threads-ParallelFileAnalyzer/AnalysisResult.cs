using System.Collections.Generic;

namespace ParallelProcessor
{
    /// <summary>
    /// Datova trida pro ulozeni vysledku analyzy.
    /// Kazdy thread ma SVOJI VLASTNI instanci teto tridy.
    /// Na konci se vysledky ze vsech threadu SPOJI dohromady.
    /// 
    /// PROC KAZDY THREAD MA SVOJI INSTANCI:
    /// - Pokud by vsechny thready psaly do jedne instance, potrebovali bychom LOCK
    /// - Kdyz ma kazdy svoji, mohou psat PARALELNE bez cekani
    /// - Na konci vysledky sloucime (to dela hlavni thread sam)
    /// </summary>
    public class AnalysisResult
    {
        /// <summary>
        /// Pocet slov ktere tento thread nasel
        /// </summary>
        public int WordCount { get; set; }

        /// <summary>
        /// Pocet radku ktere tento thread zpracoval
        /// </summary>
        public int LineCount { get; set; }

        /// <summary>
        /// Frekvence slov - slovnik kde:
        /// - KLIC = slovo (napr. "hello")
        /// - HODNOTA = kolikrat se vyskytlo (napr. 42)
        /// </summary>
        public Dictionary<string, int> WordFrequency { get; }

        /// <summary>
        /// Konstruktor - inicializuje prazdny vysledek
        /// </summary>
        public AnalysisResult()
        {
            WordCount = 0;
            LineCount = 0;
            WordFrequency = new Dictionary<string, int>();
        }

        /// <summary>
        /// Prida slovo do frekvencniho slovniku.
        /// Pokud slovo jeste neni ve slovniku, prida ho s hodnotou 1.
        /// Pokud uz existuje, zvysi pocet o 1.
        /// </summary>
        /// <param name="word">Slovo k pridani</param>
        public void AddWord(string word)
        {
            // ContainsKey = obsahuje slovnik tento klic?
            if (!WordFrequency.ContainsKey(word))
            {
                // slovo jeste neni ve slovniku - pridame ho
                WordFrequency[word] = 0;
            }
            // zvysime pocet vyskytu o 1
            WordFrequency[word]++;
        }

        /// <summary>
        /// Slouci jiny vysledek do tohoto.
        /// Pouziva se na konci pro spojeni vysledku ze vsech threadu.
        /// </summary>
        /// <param name="other">Vysledek k slouceni</param>
        public void Merge(AnalysisResult other)
        {
            // pricteme pocty
            WordCount += other.WordCount;
            LineCount += other.LineCount;

            // sloucime frekvence slov
            foreach (var kvp in other.WordFrequency)
            {
                // kvp.Key = slovo, kvp.Value = pocet vyskytu
                if (!WordFrequency.ContainsKey(kvp.Key))
                {
                    WordFrequency[kvp.Key] = 0;
                }
                WordFrequency[kvp.Key] += kvp.Value;
            }
        }
    }
}

