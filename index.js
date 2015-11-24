var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var dataModule = require('./data.js');
var pgClient = require('./pg_client.js')

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/list', function(req, res) {
  var result = pgClient.getList(
  	function(list){
  		res.json(list);		
  	});
  
})

app.post('/create', function(req, res) {
  var result = pgClient.addCompany(req.body, answert => {
	  pgClient.getList(list => {
	  		res.json(list);
	  })
  })
})

app.post('/update', function(req, res) {
	var result = pgClient.updateCompany(req.body, result => {
		pgClient.getList(list => {
			res.json(list);
		})
	})

})

app.get('/delete/:id', function(req, res, id){
	var result = pgClient.deleteCompany(req.params.id, result => {
		pgClient.getList(list => {
			res.json(list);
		})
	})
})

var server = app.listen(3000, function () {
  console.log('Example app listening');
})