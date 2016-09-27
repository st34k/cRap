const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cs = require('./create_sentence');
const sa = require('./sentence_actions');
const ex = require('./extractor');

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
  if(!(req && req.body && req.body.text)) {
    next('Error - Please make sure you\'re sending some text!');
  }
  let start = new Date().getTime();
  let input = req.body.text;
  input = ex.init(input);
  ex.extractWords(input, (Words) => {
    ex.getMissingWords(Words, (Words2) => {
      let constructor = new cs.Sentencer(Words2, sa.IAuxVerb, sa.myNoun);
      let sen1 = constructor.make();
      sen1.fillRhymes(()=> {
        let sen2 = constructor.rhyme(sen1);
        let end = new Date().getTime();
        let time = end - start;
        res.json({
          sentences: [sen1.text, sen2.text],
          tokens: input,
          took: time + 'ms'
        })
      })
    })
  })

})
// app.get('/', function(req, res){
//   res.sendFile(__dirname + "/public/index.html");
// });


console.log('Running server on http://localhost:' + port);
app.listen(port);