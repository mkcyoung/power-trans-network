/**Loads the data  */

/** POWER SYSTEM LOADING
 * NODE feautres
 * 1) Active Load
 * 2) Voltage
 * 3) Charging Station Power */
 
 //  Active load
d3.csv("data/PowerSystem_csvs/activeLoad.csv").then(csvData => {
    
    //Create a unique "id" field for node
    csvData.forEach( (d, i) => {
            d.id = d[""];            
    });
    console.log("Active Load",csvData);
});

// Voltage
d3.csv("data/PowerSystem_csvs/voltage.csv").then(csvData => {

    //Create a unique "id" field for each node
    csvData.forEach( (d, i) => {
        d.id = d[""];
    });
    console.log("Voltage",csvData);
});

//Charging station power
d3.csv("data/PowerSystem_csvs/chargingStationPower.csv").then(csvData => {

    //Create a unique "id" field for each node
    csvData.forEach( (d, i) => {
        d.id = d[""];
    });
    console.log("Charging Station Power",csvData);
});

/** EDGE features
 * 1) Current
 * 2) Maximum line current
 * 3) Active Power flow
 */

 //  Current
 d3.csv("data/PowerSystem_csvs/current.csv").then(csvData => {
    
    //Create a unique "id" field for edge
    csvData.forEach( (d, i) => {
            d.id = i+1;            
    });
    console.log("Current",csvData);
});

// Maximum line current
d3.csv("data/PowerSystem_csvs/maxLineCurrent.csv").then(csvData => {

    //Create a unique "id" field for each node
    csvData.forEach( (d, i) => {
        d.id = i+1;
    });
    console.log("Max Line Current",csvData);
});

//active power flow
d3.csv("data/PowerSystem_csvs/activePowerFlow.csv").then(csvData => {

    //Create a unique "id" field for each node
    csvData.forEach( (d, i) => {
        d.id = i+1;
    });
    console.log("Active power flow",csvData);
});
 
//TODO I think I need to make into a better object? Maybe w/ nodes and links?
