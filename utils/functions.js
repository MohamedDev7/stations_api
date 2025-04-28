exports.getMovmentNumber = (stationNumber, date) => {
	const currDate = new Date(date);
	const year = currDate.getFullYear().toString().slice(-2);
	return `${stationNumber.toString().padStart(3, "0")}${year}`;
};
