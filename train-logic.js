//Boston: "pops": [1062,2368,4225,7508]
//Washington: "pops": [1020,3069,6194,9646]
//Formula: 10000*pop50*pop50/(60+wait+d*60/250)^2, pops in millions and answer is millions per year
//import { DijkstraCalculator } from 'dijkstra-calculator';
import { ShortestPath } from "./dijkstra-shortest";
import haversine from 'haversine';
//import { defaultTextBaseline } from 'ol/render/canvas';


class TrainLogic {
    constructor(settings) {
        //shared
        this.settings = {
            special: 1159151489
        }
        this.stations = {};
        this.tracks = {};
        this.lines = {};
        this.lineTotals = {};
        this.timings = {
            lastDay: Date.now()/1000,
            doy: 0,
            spd: 240,
            sr: 5,
        };
        this.maintenance = 0;

        //unique
        this.owner = settings.owner;
        this.finances = {
            money: settings.initialMoney,
            loans:[],
            budget:{r:0,c:0}
        };
        this.stats = {
            riders: 0,
            rider_kms:0
        };
        this.rewards = {
            subways: {},
            collabs: {},
            subsidy: 0,
            airports: 1,
            bugs: 0,
            tax: 0,
            subwaysAvailable: 0
        };
        this.messages = [];
        

        if (settings.initialLoan){
            this.addLoan(settings.initialLoan.p,settings.initialLoan.n,settings.initialLoan.r);
        }
        
    }
    save() {
        var keys = ['stations','tracks','lines','lineTotals','timings','owner','finances','stats','rewards','messages','maintenance'];
        for (var i=0;i<keys.length;i++){
            window.localStorage.setItem('saved-'+keys[i],JSON.stringify(this[keys[i]]));
        }
    }
    load() {
        for (var key in window.localStorage){
            if (key.substring(0,6) == "saved-"){
                this[key.substring(6)]=JSON.parse(window.localStorage.getItem(key));
            }
        }
        this.timings.spd = this.srToSPD(this.timings.sr);
    }
    
    srToSPD(sr){
        var newSPD = 240;
        if (sr == 0){newSPD = Infinity;}
        else if (sr == 1){newSPD = 86000;}
        else if (sr == 2){newSPD = 7200;}
        else if (sr == 3){newSPD = 1680;}
        else if (sr == 4){newSPD = 480;}
        else if (sr == 5){newSPD = 240;}
        else if (sr == 6){newSPD = 120;}
        else if (sr == 7){newSPD = 40;}
        else if (sr == 8){newSPD = 10;}
        else if (sr == 9){newSPD = 2;}
        else if (sr == 10){newSPD = 0.1666;}
        return newSPD;
    }
    calculateNetwork(network){
        
        var data = {'maintenance':this.maintenance};
        var kph = this.toTrainSpeed(data);
        var graph = new ShortestPath();
        //graph.addNode(""+s);
        //graph.addEdge(""+this.tracks[t].a,""+this.tracks[t].b,this.tracks[t].d*60/250);
        network.sort();
        var stationTimes = {};
        var stationRiders = {};
        var trackLines = {};


        
        var linesOrder = {};
        for (var i=0;i<network.length;i++){
            linesOrder[network[i]]=i;
            var line = this.lines[network[i]];
            this.lineTotals[network[i]] = {'riders':0,'rider_kms':0,'revenue':0,'dist':0,'stops':line.stations.length,max:0,costs:0,tracks:{},stationData:{},pathData:{}};
            line.gdp = [0,0];
            for (var j=0;j<line.stations.length;j++){
                this.lineTotals[network[i]].stationData[line.stations[j]]={d:0,t:0,r:0};
                line.gdp[0] += this.stations[line.stations[j]].gdp;
                line.gdp[1]++;
                stationRiders[line.stations[j]]=0;
            }
            for (var j=0;j<line.path.length;j++){
                graph.addNode(""+network[i]+line.path[j]);//all stations that train passes thru or stops at
                this.lineTotals[network[i]].pathData[line.path[j]] = [j,0,0,0];//index,distance from last to this,riders, special riders
            }
            for (var j in this.tracks){
                if (this.tracks[j].l == network[i]){
                    var station1 = this.tracks[j].a;
                    var station2 = this.tracks[j].b;
                    var d = this.tracks[j].d;
                    graph.addEdge(""+network[i]+station1,""+network[i]+station2,d*60/(kph+this.rewards.bugs),j,this.tracks[j].l);
                    stationTimes[""+network[i]+station1+"---"+network[i]+station2]=d*60/(kph+this.rewards.bugs);
                    stationTimes[""+network[i]+station2+"---"+network[i]+station1]=d*60/(kph+this.rewards.bugs);
                    trackLines[""+network[i]+station1+"---"+network[i]+station2]=[network[i],d,station1,station2];
                    trackLines[""+network[i]+station2+"---"+network[i]+station1]=[network[i],d,station2,station1];
                    this.lineTotals[network[i]].dist += d;
                }
            }
        }
        var stationPairs = {};
        for (var i=0;i<network.length;i++){
            var line = this.lines[network[i]];
            for (var j=0;j<line.stations.length;j++){
                if (stationPairs[line.stations[j]]){
                    for (var k=0;k<stationPairs[line.stations[j]].length;k++){
                        /*var waitCo = 1;
                        var owner = line.owner;
                        if (owner == this.owner){
                            waitCo = 0.25;
                        }
                        else if (this.rewards.collabs[owner]){
                            waitCo = this.rewards.collabs[owner];
                        }
                        var waitTime = waitCo*20*60/line.freq;*/
                        var data = {'frequency':line.freq,'maintenance':this.maintenance};
                        var waitTime = this.toWaitTime(data);
                        graph.addEdge(""+stationPairs[line.stations[j]][k]+line.stations[j],""+network[i]+line.stations[j],waitTime,-1,-1);
                        stationTimes[""+stationPairs[line.stations[j]][k]+line.stations[j]+"---"+network[i]+line.stations[j]]=waitTime;
                        stationTimes[""+network[i]+line.stations[j]+"---"+stationPairs[line.stations[j]][k]+line.stations[j]]=waitTime;
                    }
                    stationPairs[line.stations[j]].push(network[i]);
                }
                else {
                    stationPairs[line.stations[j]] = [network[i]];
                }
            }
        }
        for (var i in stationPairs){
            for (var j in stationPairs){
                if (i <= j){continue;}
                
                var minT = [-1,{}];
                
                for (var ii=0;ii<stationPairs[i].length;ii++){
                    for (var jj=0;jj<stationPairs[j].length;jj++){
                        //var path = graph.calculateShortestPath(""+stationPairs[i][ii]+i,""+stationPairs[j][jj]+j);
                        var path = graph.shortestPath(""+stationPairs[i][ii]+i,""+stationPairs[j][jj]+j,-1).path;
                        var waitTime = 0;
                        var firstLine = 100000;
                        var t = 0;
                        var lines = {};
                        for (var k=0;k<path.length-1;k++){
                            var p = path[k]+"---"+path[k+1];
                            if (path[k] < path[k+1]){
                                p = path[k+1]+"---"+path[k];
                            }
                            t += stationTimes[p]+this.settings.stopTime;
                            if (trackLines[p]){
                                if (lines[trackLines[p][0]]){
                                    lines[trackLines[p][0]].d+=trackLines[p][1];
                                    if (lines[trackLines[p][0]].tracks[p]){

                                    }
                                    lines[trackLines[p][0]].tracks[p]=true;
                                }
                                else {
                                    lines[trackLines[p][0]]={tracks:{},d:0}
                                    lines[trackLines[p][0]].d=trackLines[p][1];
                                    lines[trackLines[p][0]].tracks[p]=true;
                                    if (linesOrder[trackLines[p][0]] < firstLine){
                                        firstLine = linesOrder[trackLines[p][0]];
                                        /*var waitCo = 1;
                                        var owner = this.lines[trackLines[p][0]].owner;
                                        if (owner == this.owner){
                                            waitCo = 0.25;
                                        }
                                        else if (this.rewards.collabs[owner]){
                                            waitCo = this.rewards.collabs[owner];
                                        }
                                        waitTime = waitCo*20*60/this.lines[trackLines[p][0]].freq;*/
                                        var data = {'frequency':this.lines[trackLines[p][0]].freq,'maintenance':this.maintenance};
                                        waitTime = this.toWaitTime(data);
                                    }
                                }
                            }
                        }
                        t += waitTime;
                        if (minT[0] == -1 || t < minT[0]){
                            minT[0] = t;
                            minT[1] = lines;
                        }
                    }
                }
                
                
                minT[0] += this.settings.driveTime*2;
                /*if (this.rewards.subways[i]){
                    minT[0] -= this.settings.driveTime/2;
                }
                if (this.rewards.subways[j]){
                    minT[0] -= this.settings.driveTime/2;
                }*/
                var data = {'popA':this.stations[i].pop/1000,'popB':this.stations[j].pop/1000,'time':minT[0]};
                var ridership = this.toRidership(data);
                //var ridership = 10000*(this.stations[i].pop/1000)*(this.stations[j].pop/1000)/Math.pow(minT[0],2);//in millions per year
                if (minT[0] > 240 && this.rewards.airports != 1){
                    ridership *= this.rewards.airports;
                }
                stationRiders[i]+=ridership/2;
                stationRiders[j]+=ridership/2;
                //console.log(minT,this.stations[i].pop,this.stations[j].pop,this.stations[i].name,this.stations[j].name, ridership);
                
                
                var myRidership = 0;
                for (var k in minT[1]){
                    if (this.lines[k].owner == this.owner){
                        myRidership = ridership;
                    }
                    if (!this.lineTotals[k]){
                        this.lineTotals[k] = {'riders':0,'rider_kms':0,'revenue':0};
                    }
                    this.lineTotals[k].rider_kms += minT[1][k].d*ridership;
                    this.lineTotals[k].riders += ridership;
                    var loc0 = {longitude:this.stations[i].loc[0],latitude:this.stations[i].loc[1]};
                    var cityDistance = haversine(loc0,{longitude:this.stations[j].loc[0],latitude:this.stations[j].loc[1]});
                    
                    var data = {'gdp':(this.stations[i].gdp+this.stations[j].gdp)/2,'cityDistance':cityDistance,'trackDistance':minT[1][k].d};
                    var ticket = this.toTicketPrice(data);
                    this.lineTotals[k].revenue += ridership*1000000*ticket;
                    //console.log(ticket,ridership,this.stations[i].name,this.stations[j].name)
                    /*if (this.rewards.subsidy){ticket += this.rewards.subsidy;}
                    if (this.rewards.tax){ticket -= this.rewards.tax;}
                    if (ticket < 0){ticket = 0}
                    if (ticket > 1){ticket = 1;}*/


                    for (var track in minT[1][k].tracks){
                        if (this.lineTotals[k].tracks[track]){
                            this.lineTotals[k].tracks[track]+=ridership/360*1000000;
                        }
                        else {
                            this.lineTotals[k].tracks[track]=ridership/360*1000000;
                        }
                        var s1 = this.lineTotals[k].pathData[trackLines[track][2]];
                        var s2 = this.lineTotals[k].pathData[trackLines[track][3]];
                        if (s1[0] < s2[0]){
                            s2[1]=trackLines[track][1];
                            s2[2]+=ridership/360*1000000;
                            if (i == this.settings.special || j == this.settings.special){
                                s2[3]+=ridership/360*1000000;
                            }
                        }
                        else {
                            s1[1]=trackLines[track][1];
                            s1[2]+=ridership/360*1000000;
                            if (i == this.settings.special || j == this.settings.special){
                                s1[3]+=ridership/360*1000000;
                            }
                        }
                    }

                }
                this.stats.riders += myRidership;
            }
        }
        for (var i in stationRiders){
            if (this.stations[i].riders != stationRiders[i]){
                console.log(this.stations[i].name,stationRiders[i]);
                this.finances.money -= this.toStationCost({'riders':stationRiders[i]*1000000})-this.toStationCost({'riders':this.stations[i].riders*1000000});
                this.stations[i].riders = stationRiders[i];
            }
            
        }
        for (var i=0;i<network.length;i++){
            for (var j in this.lineTotals[network[i]].tracks){
                if (this.lineTotals[network[i]].tracks[j] > this.lineTotals[network[i]].max){
                    this.lineTotals[network[i]].max = this.lineTotals[network[i]].tracks[j];
                }
            }
            this.lineTotals[network[i]].max /= 2;
            
            //costs are costs per day
            var seats = Math.max(500,this.lineTotals[network[i]].max/this.lines[network[i]].freq);

            var avggdp = 5000;
            if (this.lines[network[i]].gdp[1] > 0){
                avggdp = this.lines[network[i]].gdp[0]/this.lines[network[i]].gdp[1];
            }
            var costs = this.toSeatCost({'gdp':avggdp})*seats*this.lineTotals[network[i]].dist*this.lines[network[i]].freq;
            //console.log('seat cost',Math.round(costs*360/1000)/1000);
            //console.log('revenue',Math.round(this.lineTotals[network[i]].revenue/1000)/1000);
            costs += this.toRiderCost({'gdp':avggdp})*this.lineTotals[network[i]].rider_kms*1000000/360;
            //console.log('rider cost',Math.round(costs*360/1000)/1000);
            this.lineTotals[network[i]].costs = costs;
            
            //this.lineTotals[network[i]].profit = ticket*this.lineTotals[network[i]].rider_kms*1000000;
            this.lineTotals[network[i]].profit = this.lineTotals[network[i]].revenue;
            this.lineTotals[network[i]].profit -= 360*costs;


            delete this.lineTotals[network[i]].tracks;
            var foundStation = false;
            var line = this.lines[network[i]];
            var totalTime = 0;
            var totalDistance = 0;
            for (var j=0;j<line.path.length;j++){
                var d = this.lineTotals[network[i]].pathData[line.path[j]][1];
                if (foundStation){
                    
                    totalDistance += d;
                    totalTime += d*60/(kph+this.rewards.bugs);
                }
                if (this.lineTotals[network[i]].stationData[line.path[j]]){
                    var r = this.lineTotals[network[i]].pathData[line.path[j]][2];
                    this.lineTotals[network[i]].stationData[line.path[j]].d=totalDistance;//={order:-1,d:0,t:0,r:0};
                    this.lineTotals[network[i]].stationData[line.path[j]].t=totalTime;
                    this.lineTotals[network[i]].stationData[line.path[j]].r=r;
                    this.lineTotals[network[i]].stationData[line.path[j]].rs=this.lineTotals[network[i]].pathData[line.path[j]][3];
                    totalDistance = 0;
                    foundStation = true;
                    totalTime += this.settings.stopTime;
                }
                
            }
            delete this.lineTotals[network[i]].pathData;
        }
    }
    calculateNetworks(justStations=false){
        
        var networks = [];
        for (var i in this.lines){
            networks.push([i]);
        }
        this.stats.riders = 0;
        var vertices = {};
        for (var i in this.lines){
            for (var j=0;j<this.lines[i].stations.length;j++){
                if (vertices[this.lines[i].stations[j]]){
                    var networkPair = [-1,-1];
                    for (var k=0;k<networks.length;k++){
                        for (var jk=0;jk<networks[k].length;jk++){
                            if (networks[k][jk] == vertices[this.lines[i].stations[j]]){
                                networkPair[0] = k;
                            }
                        }
                    }
                    for (var k=0;k<networks.length;k++){
                        for (var jk=0;jk<networks[k].length;jk++){
                            if (networks[k][jk] == i){
                                networkPair[1] = k;
                            }
                        }
                    }
                    if (networkPair[0] != networkPair[1]){
                        networks[networkPair[0]]=networks[networkPair[0]].concat(networks[networkPair[1]].slice()).slice();
                        networks.splice(networkPair[1],1);
                    }
                }
                else {
                    vertices[this.lines[i].stations[j]]=i;
                }
            }
        }
        if (justStations){
            return networks;
        }
        for (var i=0;i<networks.length;i++){
            this.calculateNetwork(networks[i]);
        }
        this.finances.budget.r = 0;
        this.finances.budget.c = 0;
        
        this.stats.rider_kms = 0;
        for (var i in this.lineTotals){
            if (this.lines[i].owner == this.owner){
                this.finances.budget.r += this.lineTotals[i].profit + 360*this.lineTotals[i].costs;
                this.finances.budget.c += 360*this.lineTotals[i].costs;
                this.stats.rider_kms += this.lineTotals[i].rider_kms;
            }
        }
    }
    chgPops(pops){
        for (var i in pops){
            this.stations[i].pop = pops[i];
        }
    }
    updatePops(){
        var networks = this.calculateNetworks(true);
        var allFS = [];
        for (var i=0;i<networks.length;i++){
            var network = networks[i];
            network.sort();
            var firstStations = {};
            for (var k=0;k<network.length;k++){
                var line = this.lines[network[k]];
                for (var j=0;j<line.stations.length;j++){
                    firstStations[line.stations[j]]=true;
                }
            }
            allFS.push(firstStations);
            
        }
        console.log(allFS);
        socket.emit('pops',allFS);
    }
    getJourneyStations(stationID){
        const graph = new ShortestPath();
        for (var s in this.stations){
            graph.addNode(""+s);
        }
        for (var t in this.tracks){
            if (this.tracks[t].l && this.tracks[t].l != -1){
                graph.addEdge(""+this.tracks[t].a,""+this.tracks[t].b,this.tracks[t].d,t,this.tracks[t].l);
            }
        }
        graph.shortestPath(""+stationID,"all",-1);
        var shortestNodes = [];
        for (var n in graph.nodes){
            shortestNodes.push([graph.nodes[n].d,n]);
        }
        shortestNodes.sort((a,b) => {return a[0] - b[0]});
        return shortestNodes;
    }
    getConnectedStations(lineID){
        var cStations = {};
        for (var i=0;i<this.lines[lineID].stations.length;i++){
            cStations[this.lines[lineID].stations[i]]=true;
        }
        var newStation = true;
        var count = 0;
        while (newStation && count < 100){
            newStation = false;
            for (var i in this.tracks){
                if (this.tracks[i].owner != this.owner){continue;}
                if (this.tracks[i].l == -1 || this.tracks[i].l == lineID){
                    if (cStations[this.tracks[i].a] && !cStations[this.tracks[i].b]){
                        cStations[this.tracks[i].b] = true;
                        newStation = true;
                    }
                    else if (cStations[this.tracks[i].b] && !cStations[this.tracks[i].a]){
                        cStations[this.tracks[i].a] = true;
                        newStation = true;
                    }
                }
            }
            count++;
        }
        return cStations;
    }
    
    createStation(id,name,pop,popC,loc,gdp){
        if (!this.stations[id]){
            this.stations[id]={name:name,size:0,pop:pop,popC:popC,popM:pop,riders:0,loc:loc,gdp:gdp};
        }
    }

    
    createTrack(a,b,d,p){
        //var rid = "ABC"+Math.floor(Math.random()*1000000);
        var rid = crypto.randomUUID();
        var cost = d*this.settings.trackCost;
        this.finances.money -= cost;
        this.tracks[rid] = {a:a,b:b,d:d,l:-1,p:p,owner:this.owner};
        return rid;
    }

    createBridge(d){
        console.log(d);
        var cost = this.toBridgeCost({'distance':d});
        this.finances.money -= cost;
    }

   
    createLine(owner,lineID=false,name=false,freq=-1,color=false,animate=false){
        //var color = "#"+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);
        if (!lineID){
            name = "Line "+Math.floor(Math.random()*1000000);
            lineID = crypto.randomUUID();
            freq = 20;
            color = "#"+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10)+Math.floor(Math.random()*10);
        }
        else {
            if (!owner){
                owner = this.lines[lineID].owner;
            }
            if (!name){
                name = this.lines[lineID].name;
            }
            if (!color){
                color = this.lines[lineID].color;
            }
            if (!freq || parseInt(freq) <= 0 || isNaN(freq)){
                freq = 20;
            }
            for (var i in this.tracks){
                if (this.tracks[i].l == lineID){
                    this.tracks[i].l = -1;
                }
            }
            
        }
        this.lines[lineID] = {'gdp':[0,0],owner:owner,stations:[],path:[],name:name,freq:freq,color:color,animate:animate};
        this.lineTotals[lineID] = {'riders':0,'rider_kms':0,'revenue':0,'dist':0,'stops':0,max:0,costs:0};
        return lineID;
    }
    deleteLine(lineID,name,freq){
        
        for (var i in this.tracks){
            if (this.tracks[i].l == lineID){
                this.tracks[i].l = -1;
            }
        }
        delete this.lines[lineID];
        delete this.lineTotals[lineID];
        this.updatePops();
        this.updateTrains(lineID,true);
        saveMap();
    }
    
    shortestOverall(station1,station2){
        const graph = new ShortestPath();
        for (var s in this.stations){
            graph.addNode(""+s);
        }
        for (var t in this.tracks){
            if (this.tracks[t].l && this.tracks[t].l != -1){
                graph.addEdge(""+this.tracks[t].a,""+this.tracks[t].b,this.tracks[t].d,t,this.tracks[t].l);
            }
        }
        return graph.shortestPath(""+station1,""+station2,-1);
    }
    newGraph(owner=-1,lineID=-1){
        const graph = new ShortestPath();
        for (var s in this.stations){
            graph.addNode(""+s);
        }
        for (var t in this.tracks){
            if (owner == -1 || this.tracks[t].owner == owner){
                if (this.tracks[t].l == -1 || this.tracks[t].l == lineID){
                    graph.addEdge(""+this.tracks[t].a,""+this.tracks[t].b,this.tracks[t].d,t,this.tracks[t].l);
                }
            }
        }
        return graph;
    }
    shortestTrack(owner,station1,station2,graph,lineID=-1){
        if (!graph){graph = this.newGraph(owner)}
        //const path = graph.calculateShortestPath(""+station1,""+station2);
        const out = graph.shortestPath(""+station1,""+station2,-1);
        const path = out.path;
        var totalDistance = out.d;
        /*var totalDistance = 0;
        var newTracks = [];
        for (var i=0;i<path.length-1;i++){
            var shortestAvailable = [-1,-1];
            for (var t in this.tracks){
                if (owner == -1 || this.tracks[t].owner == owner){
                    if ((this.tracks[t].l == -1 || this.tracks[t].l == lineID) && ""+this.tracks[t].a == path[i] && ""+this.tracks[t].b == path[i+1]){
                        if (shortestAvailable[0] == -1 || this.tracks[t].d < shortestAvailable[0]){
                            shortestAvailable = [this.tracks[t].d,t];
                        }
                    }
                    else if ((this.tracks[t].l == -1 || this.tracks[t].l == lineID) && ""+this.tracks[t].b == path[i] && ""+this.tracks[t].a == path[i+1]){
                        if (shortestAvailable[0] == -1 || this.tracks[t].d < shortestAvailable[0]){
                            shortestAvailable = [this.tracks[t].d,t];
                        }
                    }
                }
            }
            var t = shortestAvailable[1];
            if (t != -1){
                newTracks.push(t);
                totalDistance += this.tracks[t].d;
            }
        }*/
        return {path:path,d:totalDistance,newTracks:out.newTracks};
    }




    addLoan(p,n,r){
        var payment = this.computeLoan(p,n,r);
        var loan = {p:p,n:n,y:payment,r:r};
        this.finances.loans.push(loan);
        this.finances.money += p;
    }
    repayLoan(i){
        if (!this.finances.loans[i]){return;}
        var principal = this.finances.loans[i].p;
        this.finances.loans.splice(i,1);
        this.finances.money -= principal;
    }
    addToLine(lineID,stationID){
        var line = this.lines[lineID];
        if (!line){return;}
        this.stations[stationID].size = 1;
        if (line.stations.length == 0){
            line.stations.push(stationID);
            return;
        }
        var graph = this.newGraph(this.owner,lineID);
        if (line.stations.length == 1){
            line.stations.push(stationID);
            var shortest = this.shortestTrack(this.owner,line.stations[0],line.stations[1],graph);
            for (var i=0;i<shortest.newTracks.length;i++){
                var t = shortest.newTracks[i];
                this.tracks[t].l = lineID;
            }
            line.path = shortest.path.slice();
            line.tracks = [shortest.newTracks.slice()];

            return;
        }


        var stationIndex = 0;
        for (var p=0;p<line.path.length;p++){
            if (line.path[p] == ""+stationID){
                line.stations.splice(stationIndex,0,stationID);
                return;
            }
            else if (line.path[p] == ""+line.stations[stationIndex]){
                stationIndex++;
            }
        }


        var minStation = [-1,-1];
        var lastDistance = 0;
        for (var s=0;s<line.stations.length;s++){
            //var graph = this.newGraph(this.owner,lineID);
            //place before first
            if (s == 0){
                var newPart = this.shortestTrack(this.owner,stationID,line.stations[s],graph,lineID);
                if (newPart.path.length < 2){return;}
                var newDistance = lastDistance + newPart.d;
                lastDistance = newPart.d;
                if (minStation[0] == -1 || newDistance< minStation[0]){
                    minStation = [newDistance,s];
                }
            }
            var existingDistance = 0;
            var newPartDistance = 0;
            if (s < line.stations.length-1){
                newPartDistance = this.shortestTrack(this.owner,stationID,line.stations[s+1],graph,lineID).d;
                existingDistance = this.shortestTrack(this.owner,line.stations[s+1],line.stations[s],graph,lineID).d;
            }
            var newDistance = lastDistance + newPartDistance;
            lastDistance = newPartDistance;
            if (minStation[0] == -1 || newDistance - existingDistance < minStation[0]){
                minStation = [newDistance - existingDistance,s+1];
            }

        }

        
        //var graph = this.newGraph(this.owner,lineID);
        if (minStation[1] == 0){
            var newPart = this.shortestTrack(this.owner,stationID,line.stations[0],graph,lineID);
            line.stations.splice(0,0,stationID);
            newPart.path.pop();
            line.path = newPart.path.concat(line.path).slice();
            line.tracks.splice(0,0,newPart.newTracks);
            for (var i=0;i<newPart.newTracks.length;i++){
                var t = newPart.newTracks[i];
                this.tracks[t].l = lineID;
            }
            return;
        }
        if (minStation[1] == line.stations.length){
            var newPart = this.shortestTrack(this.owner,line.stations[line.stations.length-1],stationID,graph,lineID);
            line.stations.push(stationID);
            line.path.pop();
            line.path = line.path.concat(newPart.path).slice();
            line.tracks.push(newPart.newTracks);
            for (var i=0;i<newPart.newTracks.length;i++){
                var t = newPart.newTracks[i];
                this.tracks[t].l = lineID;
            }
            return;
        }
        line.stations.splice(minStation[1],0,stationID);
        for (var t in this.tracks){
            if (this.tracks[t].l == lineID){
                this.tracks[t].l = -1;
            }
        }
        line.path = [];
        line.tracks = [];
        graph = this.newGraph(this.owner,lineID);
        for (var i=0;i<line.stations.length-1;i++){
            var newPart = this.shortestTrack(this.owner,line.stations[i],line.stations[i+1],graph,lineID);
            line.path.pop();
            line.path = line.path.concat(newPart.path).slice();
            line.tracks.push(newPart.newTracks);
            for (var ii=0;ii<newPart.newTracks.length;ii++){
                var t = newPart.newTracks[ii];
                this.tracks[t].l = lineID;
            }
        }
        
        return;
    }
    updateTrains(lineID,d=false){
        if (d){
            TrainMap.updateLine(lineID,[]);
        }
        else {
            var tracks = this.lines[lineID].tracks;
            TrainMap.updateLine(lineID,tracks);
        }
    }
    computeLoan(p,n,r){
        //r is yearly rate as decimal so 5% is 0.05
        //n is number of years
        //p is principal
        var c = p*r/(1-Math.pow(1+r,-1*n))
        return c
    }
    computeNewPrincipal(p,n,r){
        return p/(1-Math.pow(1+r,-1*n))*(1-Math.pow(1+r,-1*(n-1)));
    }
    updateYear(){
        var loanPayment = 0;
        for (var i=0;i<this.finances.loans.length;i++){
            var loan = this.finances.loans[i];
            loanPayment += loan.y;
            loan.p = this.computeNewPrincipal(loan.p,loan.n,loan.r);
            loan.n -= 1;
            if (loan.n < 1){
                this.finances.loans.splice(i,1);
                i--;
            }
        }
        this.maintenence++;
        this.finances.money -= loanPayment;
    }
    updateDay(){
        this.timings.doy++;
        
        this.calculateNetworks();
        if (this.timings.doy %360 == 0){
            this.updateYear();
        }
        this.finances.money += this.finances.budget.r/360-this.finances.budget.c/360;
        updateFinances();
        updateInfo();
        this.save();
        
    }
    everyDay(){
        var second = Date.now()/1000;
        if (second >= this.timings.lastDay + this.timings.spd){
            this.updateDay();
            this.timings.lastDay += this.timings.spd;
        }
        updateInfo();
    }
    catchUp(){
        var second = Date.now()/1000;
        if (this.timings.lastDay > 0){
            while (second >= this.timings.lastDay + this.timings.spd){

                this.updateDay();
                this.timings.lastDay += this.timings.spd;
            }
        }
        else {
            this.timings.lastDay = second;
        }
    }

    createFunctions(){
        
        for (var key in window.localStorage){
            if (key.substring(0,16) == "functionStrings-"){
                this[key.substring(16)] = new Function('data',window.localStorage.getItem(key));
            }
        }
        this.settings.stopTime = this.toStopTime();
        this.settings.driveTime = this.toDriveTime();
        this.settings.trackCost = this.toTrackCost();
    }
    toRidership(data){return "";}
    toStopTime(data){return "";}
    toWaitTime(data){return "";}
    toDriveTime(data){return "";}
    toTrainSpeed(data){return "";}
    toTrackCost(data){return "";}
    toBridgeCost(data){return "";}
    toStationCost(data){return "";}
    toSeatCost(data){return "";}
    toRiderCost(data){return "";}
    toTicketPrice(data){return "";}
    toLoanRate(data){
        var ratio = 4;
        var fassets = data.cash + data.profit*10;
        if (fassets > 0){
            ratio = data.borrowed/fassets;
        }
        if (ratio < 1){ratio = 1}
        if (ratio > 4){ratio = 4}
        var termAdd = 0;
        if (data.term > 75){termAdd = 0.03}
        else if (data.term > 25){termAdd = 0.02}
        else if (data.term > 15){termAdd = 0.01}
        return Math.round((ratio*0.03+termAdd)*100);
    }
};

var defaultSettings = {
    owner: "test",
    initialMoney: 100000000000,
    initialLoan: {p:100000000000,n:100,r:0.01}
}
if (window.localStorage.getItem('keepGame') && window.localStorage.getItem('keepGame') != "false"){
    window.Train = new TrainLogic(defaultSettings);
    Train.createFunctions();
    Train.load();
    loadMap();
    Train.catchUp();
    Train.calculateNetworks();

    updateDashboard();
    Train.gameInterval = setInterval(callDaily,1000*Train.timings.spd/24);

}
else {
    console.log("new game");
    //new Function('data',str);
    window.localStorage.removeItem('drawnPaths');
    var mySettings = window.localStorage.getItem('initialSettings');
    if (!mySettings){mySettings = defaultSettings;}
    else {mySettings = JSON.parse(mySettings)}
    
    console.log(mySettings);
    window.Train = new TrainLogic(mySettings);
    Train.createFunctions();
    window.localStorage.setItem('keepGame',"true");
    Train.calculateNetworks();

    updateDashboard();
    Train.gameInterval = setInterval(callDaily,1000*Train.timings.spd/24);
    Train.save();
}

MicroModal.init();





