var data = [];

function get(){
	return JSON.stringify(data);
} 

function create(newVal){
	data.push(newVal);
}


module.exports = {
	get: get,
	create: create
}