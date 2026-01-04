using System.Collections.Generic;

namespace ParallelProcessor
{
    // ulozi vysledky analyzy od jednoho threadu
    public class AnalysisResult
    {
        public int WordCount { get; set; }     
        public int LineCount { get; set; }     
        
        // frekvence slov: slovo -> kolikrat se vyskytlo
        public Dictionary<string, int> WordFrequency { get; }
        //kazdy thread ma svuj result word county a line count a slovnik frekvenci slov
        public AnalysisResult()
        {
            WordCount = 0;
            LineCount = 0;
            WordFrequency = new Dictionary<string, int>();
        }

        // prida slovo do slovniku frekvenci
        public void AddWord(string word)
        {
            if (!WordFrequency.ContainsKey(word))
            {
                WordFrequency[word] = 0;
            }
            WordFrequency[word]++;
        }
    }
}

