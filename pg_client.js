var pg = require("pg");

var conString = "pg://admin:admin@localhost:5432/company";

var client = new pg.Client(conString);
client.connect();

// client.query("CREATE TABLE IF NOT EXISTS emps(firstname varchar(64), lastname varchar(64))");
// client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
// client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);


function getParents(callBack){

	var query = client.query("SELECT * FROM company WHERE parent");
	query.on("row", function (row, result) {
	    result.addRow(row);
	});
	query.on("end", function(result){
		callBack(result.rows);
	});

}

function getChildsList(parentId, callBack){
	var query = client.query({text: "SELECT child from child where parent = $1", values: [parentId]});	
	query.on('row', function(row, result){
		result.addRow(row);
	});

	query.on('end', function(result){
		var cbCount = result.rows.length;
		var list = [];
		if(result.rows.length > 0){
				result.rows.forEach(function(el) {
				createCompany(el.child, function(company){
					cbCount--;
					if(company.status == undefined)
						list.push(company);
					if(!cbCount){
						callBack(list);
					}
				});
			});
		} else callBack([]);
	})
}

function createCompany(id, callBack){
	var query = client.query({ text: "SELECT * from company WHERE id = $1", values: [id]})
	query.on('row', function(row, result) {
		result.addRow(row);
	})

	query.on('end', function(result){
		if(result.rows[0] != undefined){
				getChildsList(result.rows[0].id, function(list){
				var company = result.rows[0];
				company.list = list;
				var childSum = 0;
				list.forEach(el => {
					childSum = childSum + el.fullValue;
				});
				company.fullValue = company.value + childSum;
				callBack(company);
			})
			} else callBack({status: false});
	})
}


function getList(callBack){
	var countCB;
	getParents(parents => {
		countCB = parents.length;
		var parentList = [];
		parents.forEach(parent => {
			createCompany(parent.id, newParent => {
				countCB--;
				parentList.push(newParent);
				if(!countCB)
					callBack(parentList);
			})
		})
	})
}

function addCompany(company, callBack){
	var query = client.query({text: "INSERT INTO company(name, value, parent) values($1, $2, $3) RETURNING id", values: [company.name, company.value, company.parent]});
	query.on('row', (row, result) => {
		result.addRow(row);
	});

	query.on('end', result => {
		if(company.parentId == undefined){
			callBack(true);
		} else {

			var childQuery = client.query({text: "INSERT INTO child(child, parent) values($1, $2)", values: [result.rows[0].id, company.parentId]});
			childQuery.on('row', (row, result) => {
				result.addRow(row);
			})

			childQuery.on('end', result => {
				callBack(true);
			})
		}
	})
}

function updateCompany(company, callBack){
	var query = client.query({text: "UPDATE company SET name = ($1), value = ($2) WHERE id = ($3)", values: [company.name, company.value, company.id]});

	query.on('row', (row, result) => {
		result.addRow(row);
	});

	query.on('end', result => {
		callBack(true);
	})
}

function deleteCompany(id, callBack){

	createCompany(id, company => {

		if(company.list.length == 0){
			var query = client.query({text: "DELETE from company where id = ($1)", values: [id]});

			query.on('row', (row, result) => {
				result.addRow(row);
			})

			query.on('end', result => {
				callBack(true);
			})	
		} else {
			var cbCount = company.list.length;
			debugger
			company.list.forEach(el => {
				deleteCompany(el.id, res => {
					client.query({text: "delete from child where child = ($1)", values: [el.id]}).on('end', res => {
							cbCount--;
							debugger
							if(!cbCount){
								debugger
								var finaleQuery = client.query({text: "DELETE from company where id = ($1)", values: [id]})
								finaleQuery.on('row', (row, result) => {
									result.addRow(row);
								})

								finaleQuery.on('end', result => {							
									debugger
									callBack(true);
								})
							}
					})
			
				})
			})
		}

		

	})
}



module.exports = {
	getList: getList,
	addCompany: addCompany,
	updateCompany: updateCompany,
	deleteCompany: deleteCompany
}