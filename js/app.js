(function() {
  'use strict';

  var s,
    doc = document,
    app = {
      settings: {
        editor: doc.getElementsByClassName('editor')[0],
        syllables: doc.getElementsByClassName('syllables')[0],
        words: doc.getElementsByClassName('words')[0],
        sentences: doc.getElementsByClassName('sentences')[0],
        flesch: doc.getElementsByClassName('flesch')[0],
        gradeLevel: doc.getElementsByClassName('grade-level')[0]
      },

      init: function() {
        s = app.settings;
        app.onWriting(app.getTotalWords);

        grande.bind(doc.getElementsByClassName('editor')[0]);

        // app.onWriting(function(content) {
        //   console.log(app.getTotalSentences(content));
        // });

        // app.onWriting(function(content) {
        //   console.log(app.getTotalSyllables(content));
        // });

        // app.onWriting(function(content) {
        //   console.log(app.getTotalWords(content));
        // });


        app.onWriting(function(content) {
          var totalWords = app.getTotalWords(content);
          var totalSentences = app.getTotalSentences(content);
          var totalSyllables = app.getTotalSyllables(content);

          s.syllables.innerHTML = totalSyllables;
          s.words.innerHTML = totalWords;
          s.sentences.innerHTML = totalSentences;
          s.flesch.innerHTML = app.getFleschReadingEase(totalWords, totalSentences, totalSyllables);
          s.gradeLevel.innerHTML = app.getFleschKincaidGradeLevelFormula(totalWords, totalSentences, totalSyllables);

          doc.getElementsByClassName('content-result')[0].innerHTML = content.replace(/(<([^>]+)>)/ig,"");
        });
      },

      onWriting: function(callback) {
        s.editor.onkeyup = function() {
          callback(s.editor.innerHTML);
        };
      },

      logWriting: function(content) {
        console.log(content);
      },

      getTotalWords: function(text) {
        if (!text) {
          throw 'Need some text as argument.';
        } 

        var words = text.split(/[.:;?! !@#$%^&*()]+/),
          count = 0;

        words.forEach(function(value) {
          if (value) {
            count++;
          } 
        });
        // return text.split(/[.:;?! !@#$%^&*()]+/).length;
        // return text.split(' ');
        return count;
      },

      getTotalSentences: function(text) {
        if (!text) {
          throw 'Need some text as argument.';
        }

        // var matches = text.match(/\.\s/g);
        // return matches.length > 1 ? matches.length + 2 : 1;
        return text.split(/[.:;?!]/).length;
      },

      getTotalSyllables: function(text) {
        if (!text) {
          throw 'Need some words as argument.';
        }

        var words = text.split(' '),
          totalSyllables = 0;
        
        // A method to count the number of syllables in a word
        // Pretty basic, just based off of the number of vowels
        // This could be improved
        function countSyllables(word) {
          var syl = 0,
            vowel = false,
            length = word.length;

          // Check each word for vowels (don't count more than one vowel in a row)
          for (var i = 0; i < length; i++) {
            if (isVowel(word.charAt(i)) && (vowel == false)) {
              vowel = true;
              syl++;
            } else if (isVowel(word.charAt(i)) && (vowel == true)) {
              vowel = true;
            } else {
              vowel = false;
            }
          }

          var tempChar = word.charAt(word.length-1);
          // Check for 'e' at the end, as long as not a word w/ one syllable
          if (((tempChar == 'e') || (tempChar == 'E')) && (syl != 1)) {
            syl--;
          }

          return syl;
        }

        // Check if a char is a vowel (count y)
        function isVowel(c) {
          return c.match(/^[aeiouy]/);
        }

        words.forEach(function(word) {
          totalSyllables += countSyllables(word);
        });

        return totalSyllables;
      },

      getFleschReadingEase: function(totalWords, totalSentences, totalSyllables) {
        var score = 206.835 - (1.015 * (totalWords / totalSentences)) - (84.6 * (totalSyllables / totalWords));

        return score.toFixed(2);
      },

      getFleschKincaidGradeLevelFormula: function(totalWords, totalSentences, totalSyllables) {
        var score = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;

        return score.toFixed(2);
      }
    };

  app.init();
})();
