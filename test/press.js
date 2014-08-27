console.log('=============================');
var befor = process.memoryUsage();
var arr = [];
for(var i = 1;i<=10000000; ++i){
	arr.push(socket);
	//arr.push(null);
}
var after = process.memoryUsage();
console.log(befor);
console.log(after);
console.log(after.heapUsed - befor.heapUsed);
console.log('=============================');