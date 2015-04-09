(function() {
  'use strict';

  var s,
    doc = document,
    app = {
      settings: {
        editor: doc.getElementsByClassName('editor')[0],
        syllables: doc.getElementsByClassName('syllables')[0],
        letters: doc.getElementsByClassName('letters')[0],
        chars: doc.getElementsByClassName('chars')[0],
        words: doc.getElementsByClassName('words')[0],
        sentences: doc.getElementsByClassName('sentences')[0],
        flesch: doc.getElementsByClassName('flesch')[0],
        automated: doc.getElementsByClassName('automated')[0],
        gradeLevel: doc.getElementsByClassName('grade-level')[0],
        contentResult: doc.getElementsByClassName('content-result')[0]
      },

      init: function() {
        s = app.settings;

        // Bind grande.js editor
        grande.bind(doc.getElementsByClassName('editor')[0]);

        // Trigger app when user paste content
        s.editor.addEventListener('paste', function(e) {
          setTimeout(function() {
            s.editor.innerHTML = app.stripHTML(s.editor.innerHTML);
            app.placeCaretAtEnd(s.editor);
          }, 0);
        });

        // Run basic functions
        app.onWriting(function(content) {
          var totalWords = app.getTotalWords(content),
            totalSentences = app.getTotalSentences(content),
            totalSyllables = app.getTotalSyllables(content),
            totalChars = app.getTotalChars(content),
            totalLetters = app.getTotalLetters(content);

          // app.highlight(content);

          s.syllables.innerHTML = totalSyllables;
          s.letters.innerHTML = totalLetters;
          s.chars.innerHTML = totalChars;
          s.words.innerHTML = totalWords;
          s.sentences.innerHTML = totalSentences;
          s.flesch.innerHTML = app.getFleschReadingEase(totalWords, totalSentences, totalSyllables);
          s.gradeLevel.innerHTML = app.getFleschKincaidGradeLevelFormula(totalWords, totalSentences, totalSyllables);
          s.automated.innerHTML = app.getAutomatedReadabilityIndex(totalWords, totalSentences, totalLetters);
        });
      },

      onWriting: function(callback) {
        s.editor.onkeyup = function() {
          callback(s.editor.innerText.trim());
        };
      },

      stripHTML: function(html) {
        if (!html) { throw "HTML missing."; }

        return html.replace(/<(\/?[a-zA-Z0-9]+)(.*?)>/g, '<$1>');
      },

      logWriting: function(content) {},

      highlight: function(content) {
        // Build sentences and push to array then push to text
        var text = content.split(' ');
          // sentences = content.trim().split(/[.?!]/).filter(Boolean);

        text.forEach(function(value, key) {
          if (value === 'tototo') {
            text[key] = '<span class="testing">tototo</span>';
          }
        });

        // Creating tokenized sentences
        var sentences = text.join(' ').split(/[.?!]/);
        var result = [];

        sentences.forEach(function(value, key) {
          result.push('<span class="token-sentence">' + value + '.</span>');
        });

        s.contentResult.innerHTML = result.join(' ');
      },

      // http://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
      placeCaretAtEnd: function(el) {
        el.focus();
        if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
          var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (typeof document.body.createTextRange != 'undefined') {
          var textRange = document.body.createTextRange();
          textRange.moveToelementText(el);
          textRange.collapse(false);
          textRange.select();
        }
      },

      getTotalChars: function(text) {
        if (!text) { throw 'Need some text as argument.'; }

        return text.length;
      },

      getTotalLetters: function(text) {
        if (!text) { throw 'Need some text as argument.'; }

        return text.replace(/[^a-zA-Z]/g, '').length;
      },

      getTotalWords: function(text) {
        if (!text) { throw 'Need some text as argument.'; }

        return text.trim().split(' ').filter(Boolean).length;
      },

      getTotalSentences: function(text) {
        if (!text) { throw 'Need some text as argument.'; }

        return text.trim().split(/[.?!]/).filter(Boolean).length;
      },

      getTotalSyllables: function(text) {
        if (!text) { throw 'Need some words as argument.'; }

        var words = text.split(' ').filter(Boolean),
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
        var score = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);

        return score.toFixed(2);
      },

      getFleschKincaidGradeLevelFormula: function(totalWords, totalSentences, totalSyllables) {
        var score = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;

        return score.toFixed(2);
      },

      getAutomatedReadabilityIndex: function(totalWords, totalSentences, totalLetters) {
        var score = Math.round(4.71 * (totalLetters / totalWords) + 0.5 * (totalWords / totalSentences) - 21.43);

        return score;
      }
    };

  app.init();
})();
