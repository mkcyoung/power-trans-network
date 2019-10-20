/**Loads the data  */

/** POWER SYSTEM LOADING
 * NODE feautres
 * 1) Active Load
 * 2) Voltage
 * 3) Charging Station Power */

 /** EDGE features
 * 1) Current
 * 2) Maximum line current
 * 3) Active Power flow
 */
 

Promise.all([
    d3.csv("data/PowerSystem_csvs/activeLoad.csv"),
    d3.csv("data/PowerSystem_csvs/voltage.csv"),
    d3.csv("data/PowerSystem_csvs/chargingStationPower.csv"),
    d3.csv("data/PowerSystem_csvs/current.csv"),
    d3.csv("data/PowerSystem_csvs/maxLineCurrent.csv"),
    d3.csv("data/PowerSystem_csvs/activePowerFlow.csv")
]).then(function(files){

    //Initializaing power network object
    let powNet = {
        "nodes":[],
        "links":[]
    };

    //Adding active load to power net object w/ id
    files[0].forEach( (d, i) => {
        powNet.nodes.push({
            "id": d[""],
            "aLoad": Object.entries(d).slice(1), //.map(f => parseFloat(f[1]), //gets rid of "t1, t2, etc."
            "volt": null,
            "chSP": null
        });          
    });

    //Adding voltage to power net object nodes
    files[1].forEach( (d, i) => {
        if (powNet.nodes[i].id == d[""]){
            powNet.nodes[i].volt = Object.entries(d).slice(1)
        }
    });

    //Adding charging station power to correct nodes
    stations = ["n2","n13","n9","n33","n25","n31","n8"];
    files[2].forEach( (d, i) => {
        powNet.nodes.forEach( (e,j) => {
            if(e.id == stations[i]){
                e["chSP"] = Object.entries(d).slice(1);
            } 
        })
    });

    //Creating link properties and adding in current
    files[3].forEach( (d, i) => {
        powNet.links.push({
            "source": d.From,
            "target": d.To,
            "current": Object.entries(d).slice(2),
            "mLC": null,
            "aPF": null
        })          
    });

    //Add maximum line currents to links
    files[4].forEach( (d, i) => {
        if((d.From == powNet.links[i]['source']) && (d.To == powNet.links[i]['target'])){
            powNet.links[i].mLC = +d.Imax;
        }
    });

    //Adding in active power flow
    files[5].forEach( (d, i) => {
        if ((d.From == powNet.links[i]['source']) && (d.To == powNet.links[i]['target'])){
            powNet.links[i].aPF = Object.entries(d).slice(2)
        }
    });
    
    console.log("Power Net: ",powNet);

    /** Pass data into PowNet class */
    let powNetwork = new PowNet(powNet);
    powNetwork.createNet();

});