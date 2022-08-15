const fs = require("fs");
const readline = require("readline");

const readFile = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

readFile.question(`Enter file name: `, (fileName) => {
	lineIterator(fileName).then((data) => {
		const orders = data.getAll();

		const productOrderedAverage = calcAverage(orders);
		const mostPopularBrand = getMostPopularBrand(orders);

		writeResult(`0_${fileName}`, productOrderedAverage);
		writeResult(`1_${fileName}`, mostPopularBrand);
	});

	readFile.close();
});

function lineIterator(fileName) {
	const rl = readline.createInterface({
		input: fs.createReadStream(`./${fileName}`),
	});

	const orders = [];
	return new Promise((resolve, reject) => {
		rl.on("line", (line) => {
			orders.push({
				id: line.split(",")[0],
				location: line.split(",")[1],
				product: line.split(",")[2],
				quantity: line.split(",")[3],
				brand: line.split(",")[4],
			});
		});
		rl.on("close", () => {
			resolve({
				getAll: () => {
					return orders;
				},
			});
		});
	});
}

function calcAverage(orders) {
	let productOrderedQuantity = {};
	let productOrderedAverage = {};

	for (let i = 0; i < orders.length; i++) {
		productOrderedQuantity[orders[i].product] =
			+productOrderedQuantity[orders[i].product] + +orders[i].quantity || +orders[i].quantity;
	}

	for (let key in productOrderedQuantity) {
		productOrderedAverage[key] = productOrderedQuantity[key] / orders.length;
	}

	return productOrderedAverage;
}

function getMostPopularBrand(orders) {
	let products = {};
	let mostPopularBrand = {};

	for (let i = 0; i < orders.length; i++) {
		if (products[orders[i].product] === undefined) products[orders[i].product] = {};
		products[orders[i].product][orders[i].brand] = +products[orders[i].product][orders[i].brand] + 1 || 1;
	}

	for (let product in products) {
		mostPopularBrand[product] = Object.keys(products[product]).reduce((a, b) =>
			products[product][a] > products[product][b] ? a : b
		);
	}

	return mostPopularBrand;
}

function writeResult(fileName, resultObj) {
	let output = "";

	for (let key of Object.keys(resultObj)) {
		output += `${[key]},${resultObj[key]}\n`;
	}

	fs.writeFile(fileName, output, "utf8", (err) => {
		if (err) return console.log({ error: err });
	});
}
