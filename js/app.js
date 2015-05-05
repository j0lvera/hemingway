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

          app.highlight(app.stripHTML(s.editor.innerHTML));

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
          callback(s.editor.textContent.trim());
        };
      },

      stripHTML: function(html) {
        if (!html) { throw "HTML missing."; }

        return html.replace(/<(\/?[a-zA-Z0-9]+)(.*?)>/g, '<$1>');
      },

      logWriting: function(content) {},

      highlight: function(content) {
        // ## TODO:
        // - I need to separate the tokenize functions to a separate
        // function
        var text = content.split(' ');

        // // We look through each word to see if it matches a specific word,
        // // then it apply a `span` element with a class.
        // text.forEach(function(value, key) {
        //   // This only work with one word.
        //   // Also this doesn't work if the word has a dot in the end like 
        //   // "tototo."
        //   if (value === 'tototo') {
        //     text[key] = '<span class="testing">tototo</span>';
        //   }
        // });
        
        // This is what works best, for future reference and use an array as regex
        // see this link: http://stackoverflow.com/questions/28280920/convert-array-of-words-strings-to-regex-and-use-it-to-get-matches-on-a-string
        var regex = /tototo|yoyoyo/gi,
            replacer = function(value) {  return '<span class="testing">' + value + '</span>'; };

        text = text.join(' ').replace(regex, replacer).split(' ');

        // When we write on the `contentEditable` element, each paragraph
        // is separated with `<br><br>`, we part form there to build the
        // paragraphs and wrap them in the next function.
        var paragraphs = text.join(' ').split('<br><br>').filter(Boolean),
          paragraphsTokenized = [];

        // Wrap paragraphs with `p` tags.
        paragraphs.forEach(function(value) {
          var sentences = value.trim().split(/[\.!?][ ]?/).filter(Boolean),
            sentencesTokenized = [];

          // Convert sentences in `span` elements with the `.token-sentence` class.
          sentences.forEach(function(sentence) {
            sentencesTokenized.push('<span class="token-sentence">' + sentence + '. </span>');
          });

          paragraphsTokenized.push('<p>' + sentencesTokenized.join('') + '</p>'); 
        });

        // Without the last `substring` a dot appear at the end, I need to
        // figure a better fix for this.
        var result = paragraphsTokenized.join('');
        s.contentResult.innerHTML = result.substring(0, result.length-1);
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
