const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cs = require('./create_sentence');
const sa = require('./sentence_actions');
const ex = require('./extractor');
const sen = require('./sentences');

var app = express();
app.use(morgan('dev'));

app.use(express.static(`${__dirname}/node_modules`));
app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// log requests

var port = process.env.PORT || '8000';

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
}); 

app.post('/getRap', (req, res, next) => {
  if(!(req && req.body && req.body.text) || req.body.text.trim().length === 0) {
    res.status(400).json('Error - Please make sure you\'re sending some text!');
  } else {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let start = new Date().getTime();
    let input = req.body.text;
    input = ex.init(input);
    ex.extractWords(input, (Words) => {
      if(input.length === 0) {
        console.warn('> Warning: generating generic rap (input empty)');
        input = 'No tokens found (got only stopwords)';
      }
    // ex.getMissingWords(Words, (Words2) => {
      let Sentencer = sen.init(Words);
      let sen1 = Sentencer.DontUVerbMyNoun.make();
      let sen3 = Sentencer.DontUVerbMyNoun.make();
      sen1.fillRhymes(()=> {
        sen3.fillRhymes(() => {
          let sen2 = Sentencer.myNounIsLikeMyNoun.rhyme(sen1);
          let sen4 = Sentencer.myNounIsLikeMyNoun.rhyme(sen3);
          sen2.body = 'but ' + sen2.body;
          sen4.body = 'but ' + sen4.body;
          
          // let sen3 = constructor.rhyme(sen1);
          // let sen4 = constructor.rhyme(sen2);

          let end = new Date().getTime();
          let time = end - start;
          console.log('\n===<Generated in |'+time+'ms| for ip |'+ip+'|>===\n')
          console.log(sen1.text)
          console.log(sen2.text)
          console.log(sen3.text)
          console.log(sen4.text)
          console.log('\n  ===<tokens>===\n  ' + input + '\n  ===</tokens>===\n')
          console.log('===</Generated>===\n')
          res.json({
            sentences: [sen1.text, sen2.text, sen3.text, sen4.text],
            tokens: input,
            took: time + 'ms'
          })
        })
      })

      
      // })
    })
  }
})
// app.get('/', function(req, res){
//   res.sendFile(__dirname + "/public/index.html");
// });


console.log('Running server on http://localhost:' + port);
app.listen(port);