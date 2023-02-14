

function outputNumber(value,unit=false){
    if (isNaN(value)){return "?"}
    if (unit == 'time'){
        var hours = Math.floor(value/60);
        var minutes = Math.round(value-hours*60);
        if (minutes < 10){
            return hours+":0"+minutes;
        }
        else {
            return hours+":"+minutes;
        }
    }
    var number = 0;
    var sign = "";
    if (value < 0){
        sign = "-";
        value = -1*value;
    }

    if (value < 10){
        number = Math.round(value*1000)/1000;
    }
    else if (value < 100){
        number = Math.round(value*100)/100;
    }
    else if (value < 1000){
        number = Math.round(value*10)/10;
    }
    else if (value < 1000000){
        number = Math.round(value);
    }
    else if (value < 1000000000){
        number = Math.round(value/10000)/100 + " M";
    }
    else if (value < 1000000000000){
        number = Math.round(value/10000000)/100 + " B";
    }
    else {
        number = Math.round(value/10000000000)/100 + " T";
    }


    if (unit == "dollars"){
        return sign+"$"+number;
    }
    else if (unit) {
        return sign + number + " " + unit;
    }
    else {
        return sign + number;
    }
}

function updateDashboard(){
    updateFinances();
    updateRiders();
    updateInfo();
    updateLines();
    Train.save();
}

function updateFinances() {
    var el = document.getElementById('finances');
    el.querySelector('.divF1').textContent = outputNumber(Train.finances.money,'dollars');
    var loanTotal = 0;
    for (var i=0;i<Train.finances.loans.length;i++){
        loanTotal += Train.finances.loans[i].p;
    }
    el.querySelector('#loanAmt').textContent = " "+outputNumber(loanTotal,'dollars');
    var profit = Train.finances.budget.r-Train.finances.budget.c;
    el.querySelector('#profitAmt').textContent = " "+outputNumber(profit,'dollars');
    updateLoans();

    
}
function updateLoans() {
    var borrowed = 0;
    var loanList = document.getElementById('loanList');
    loanList.innerHTML = "";
    for (var i=0;i<Train.finances.loans.length;i++){
        borrowed += Train.finances.loans[i].p;
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.textContent = " "+outputNumber(Train.finances.loans[i].p,'dollars');
        tr.appendChild(td);
        var td = document.createElement('td');
        td.textContent = " "+outputNumber(Train.finances.loans[i].n);
        tr.appendChild(td);
        var td = document.createElement('td');
        td.textContent = " "+outputNumber(Train.finances.loans[i].r*100,'%');
        tr.appendChild(td);
        var td = document.createElement('td');
        td.textContent = " "+outputNumber(Train.finances.loans[i].y,'dollars');
        tr.appendChild(td);
        var td = document.createElement('td');
        var button = document.createElement('button');
        button.textContent = "Repay";
        button.setAttribute('name',i);
        button.addEventListener('click',repayLoan);
        if (Train.finances.loans[i].p > Train.finances.money){
            button.classList.add('disabled');
        }
        
        td.appendChild(button);
        tr.appendChild(td);
        loanList.appendChild(tr);
    }
    var profit = Train.finances.budget.r-Train.finances.budget.c;
    var term = parseInt(document.getElementById('newLoanTerm').value);
    var data = {'borrowed':borrowed,'cash':Train.finances.money,'profit':profit,'term':term};
    //console.log(data);
    var rate = Train.toLoanRate(data);
    document.getElementById('newLoanRate').textContent = " "+rate+"%";
    var principal = parseFloat(document.getElementById('newLoanAmt').value);
    document.getElementById('newLoanAmt').value = principal;
    var payment = Train.computeLoan(principal,term,rate/100);
    document.getElementById('newLoanPayment').textContent = " "+outputNumber(payment,'dollars');
    return rate;
    


}

function updateRiders() {
    var dist = Train.stats.rider_kms*1000000;
    var el = document.getElementById('riders');
    el.querySelector('.divR1').textContent = outputNumber(Train.stats.riders*1000000);
    el.querySelector('.divR2').textContent = outputNumber(dist,'KM');
    el.querySelector('.divR3').textContent = outputNumber(dist*0.621371,'miles');
}

function updateInfo() {
    var el = document.getElementById('spd');
    el.value = Train.timings.sr;
    var months = ["Jan","Feb",'Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];
    var month = months[Math.floor((Train.timings.doy % 360)/30)];
    var dom = Train.timings.doy % 30;
    dom++;
    var year = Math.floor(Train.timings.doy/360)+2022;
    var hod = Math.floor(24*(Date.now()/1000-Train.timings.lastDay)/Train.timings.spd);
    var el = document.getElementById('currentDay');
    el.textContent = month + " "+dom+", "+year+ " ("+hod+")";
}


function updateLines() {
    var el = document.getElementById('lines');
    el.innerHTML = "";
    var count = 0;
    for (var i in Train.lines){
        if (Train.lines[i].owner != Train.owner){
            continue;
        }
        count++;
        var div = document.createElement('div');
        div.classList.add('divLine');
        var details = document.createElement('details');
        var div1 = document.createElement('summary');
        div1.classList.add('lineSummary');

        var divL1 = document.createElement('div');
        divL1.classList.add('divL1');
        divL1.textContent = Train.lines[i].name;
        div1.appendChild(divL1);
        var divL2 = document.createElement('div');
        divL2.classList.add('divL2');
        if (Train.lines[i].stations.length > 1){
            divL2.textContent = Train.stations[Train.lines[i].stations[0]].name + " ↔ " + Train.stations[Train.lines[i].stations[Train.lines[i].stations.length-1]].name;
        }
        div1.appendChild(divL2);
        var divL3 = document.createElement('div');
        divL3.classList.add('divL3');
        divL3.textContent = outputNumber(Train.lineTotals[i].riders*1000000);
        div1.appendChild(divL3);
        var divL4 = document.createElement('div');
        divL4.classList.add('divL4');
        divL4.textContent = outputNumber(Train.lines[i].freq);
        div1.appendChild(divL4);
        var divL5 = document.createElement('div');
        divL5.classList.add('divL5');
        divL5.textContent = outputNumber(Train.lineTotals[i].profit);
        div1.appendChild(divL5);
        var divL6 = document.createElement('div');
        divL6.classList.add('divL6');
        divL6.textContent = outputNumber(Train.lineTotals[i].max/Train.lines[i].freq);
        div1.appendChild(divL6);
        var divL7 = document.createElement('div');
        divL7.classList.add('divL7');
        var buttonL7_1 = document.createElement('button');
        buttonL7_1.textContent = "✏️";
        buttonL7_1.addEventListener('click',addStop);
        buttonL7_1.id = i;
        buttonL7_1.style.display = "block";
        buttonL7_1.style.width = "1.5rem";
        buttonL7_1.style.height = "1.5rem";
        divL7.appendChild(buttonL7_1);
        div1.appendChild(divL7);

        details.appendChild(div1);
        var divS = document.createElement('div');
        divS.classList.add('divLL');
        var divS1 = document.createElement('div');
        divS1.classList.add('divLL1');
        divS1.textContent = "Station";
        divS.appendChild(divS1);
        var divS2 = document.createElement('div');
        divS2.classList.add('divLL2');
        divS2.textContent = "Time";
        divS.appendChild(divS2);
        var divS3 = document.createElement('div');
        divS3.classList.add('divLL3');
        divS3.textContent = "Dist";
        divS.appendChild(divS3);
        var divS4 = document.createElement('div');
        divS4.classList.add('divLL4');
        divS4.textContent = "Riders";
        divS.appendChild(divS4);
        var divS5 = document.createElement('div');
        divS5.classList.add('divLL5');
        divS5.textContent = "👤";
        divS.appendChild(divS5);
        details.appendChild(divS);
        for (var j=0;j<Train.lines[i].stations.length;j++){
            var station = Train.lines[i].stations[j];
            var divS = document.createElement('div');
            divS.classList.add('divLL');
            var divS1 = document.createElement('div');
            divS1.classList.add('divLL1');
            divS1.textContent = Train.stations[station].name;
            divS.appendChild(divS1);
            var divS2 = document.createElement('div');
            divS2.classList.add('divLL2');
            divS2.textContent = outputNumber(Train.lineTotals[i].stationData[station].t,'time');
            divS.appendChild(divS2);
            var divS3 = document.createElement('div');
            divS3.classList.add('divLL3');
            if (j > 0){
                divS3.textContent = outputNumber(Train.lineTotals[i].stationData[station].d);
            }
            else {
                divS3.textContent = "---";
            }
            divS.appendChild(divS3);
            var divS4 = document.createElement('div');
            divS4.classList.add('divLL4');
            if (j > 0){
                divS4.textContent = outputNumber(Train.lineTotals[i].stationData[station].r);
            }
            else {
                divS4.textContent = "---";
            }
            divS.appendChild(divS4);
            var divS5 = document.createElement('div');
            divS5.classList.add('divLL5');
            if (Math.round(Train.stations[station].pop/100)<100){
                var txt = ""+Math.round(Train.stations[station].pop/100)/10;
                if (txt.length < 2){
                    txt += ".0";
                }
                divS5.textContent = txt;
            }
            else {
                divS5.textContent = Math.round(Train.stations[station].pop/1000);
            }
            
            divS.appendChild(divS5);

            details.appendChild(divS);
        }

        div.appendChild(details);
        el.appendChild(div);
    }
    if (count < 2){
        var div = document.createElement('div');
        div.innerHTML = `To create a train line:
        <ol>
          <li>Click the "D" button on the map</li>
          <li>Draw a route</li>
          <li>Click the route and then click "Buy" in the popup</li>
          <li>Click "Add Line" below and choose the stations</li>
        </ol>`;
        el.appendChild(div);
    }

}
function updateJourney() {
    var el = document.getElementById('journey');
    el.innerHTML = "";
    
    for (var i in TrainMap.people){
        
        
        var details = document.createElement('details');
        details.setAttribute('open','true');
        var div1 = document.createElement('summary');
        div1.style.borderBottom = "1px solid black";
        div1.textContent = i + " ("+Train.stations[TrainMap.people[i].start].name+" → "+Train.stations[TrainMap.people[i].end].name+")";
        div1.setAttribute('name',i);
        div1.setAttribute('data-start',TrainMap.people[i].end);
        div1.addEventListener('click',chgJourney);
        details.appendChild(div1);
        el.appendChild(details);
        
        if (!TrainMap.people[i].directions){
            continue;
        }
        for (var j=0;j<TrainMap.people[i].directions.length;j++){
            var station = Train.stations[TrainMap.people[i].directions[j][2]].name;
            var arrival = 0;
            var departure = 0;
            if (j+1 < TrainMap.people[i].directions.length && TrainMap.people[i].directions[j][2] == TrainMap.people[i].directions[j+1][2]){
                arrival = Math.round((TrainMap.people[i].directions[j][3]-TrainMap.people[i].directions[0][3])/1000/TrainMap.animationSPD*60*24);
                departure = Math.round((TrainMap.people[i].directions[j+1][4]-TrainMap.people[i].directions[0][3])/1000/TrainMap.animationSPD*60*24);
                j++;
            }
            else {
                arrival = Math.round((TrainMap.people[i].directions[j][3]-TrainMap.people[i].directions[0][3])/1000/TrainMap.animationSPD*60*24);
                departure = Math.round((TrainMap.people[i].directions[j][4]-TrainMap.people[i].directions[0][3])/1000/TrainMap.animationSPD*60*24);
            }
            if (arrival < 0){arrival = "???"}
            else {
                arrival = outputNumber(arrival,'time');
            }
            
            if (j == TrainMap.people[i].directions.length-1){
                departure = "---"
            }
            else if (departure < 0){departure = "???"}
            else {
                departure = outputNumber(departure,'time');
            }

            var div1 = document.createElement('div');
            div1.classList.add('journeySummary');
            div1.classList.add('divJourney');

            var divJ1 = document.createElement('div');
            divJ1.classList.add('divJ1');
            divJ1.textContent = station;
            div1.appendChild(divJ1);

            var divJ2 = document.createElement('div');
            divJ2.classList.add('divJ2');
            divJ2.textContent = arrival;
            div1.appendChild(divJ2);

            var divJ3 = document.createElement('div');
            divJ3.classList.add('divJ3');
            divJ3.textContent = departure;
            div1.appendChild(divJ3);

            details.appendChild(div1);
            
           
        }

        
        
    }

}

function updateStations(lineID) {
    var el = document.getElementById('pathStations');
    el.innerHTML = "";
    var line = Train.lines[lineID];
    el.setAttribute('name',"line-"+lineID);
    var isOn = {};
    var isActive = {};
    for (var i in line.stations){
        isActive[line.stations[i]]=true;
    }
    for (var i in line.path){
        var div = document.createElement('div');
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type','checkbox');
        checkbox.setAttribute('name',line.path[i]);
        if (isActive[line.path[i]]){
            checkbox.setAttribute('checked',true);
        }
        div.appendChild(checkbox);
        var span = document.createElement('span');
        span.textContent = Train.stations[line.path[i]].name + " ("+Math.round(Train.stations[line.path[i]].popC/100)/10+", "+Math.round(Train.stations[line.path[i]].popM/100)/10+")";
        div.appendChild(span);
        el.appendChild(div);
        isOn[line.path[i]]=true;
    }
    var el = document.getElementById('connectedStations');
    el.innerHTML = "";
    var cStations = {};
    if (line.stations.length > 0){
        cStations = Train.getConnectedStations(lineID);
    }
    else {
        for (var i in Train.tracks){
            if (Train.tracks[i].owner == Train.owner && Train.tracks[i].l == -1){
                cStations[Train.tracks[i].a]=true;
                cStations[Train.tracks[i].b]=true;
            }
        }
    }
    for (var i in cStations){
        if (isOn[i]){continue;}
        var div = document.createElement('div');
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type','checkbox');
        checkbox.setAttribute('name',i);
        if (isActive[i]){
            checkbox.setAttribute('checked',true);
        }
        div.appendChild(checkbox);
        var span = document.createElement('span');
        span.textContent = Train.stations[i].name + " ("+Math.round(Train.stations[i].popC/100)/10+", "+Math.round(Train.stations[i].popM/100)/10+")";
        div.appendChild(span);
        el.appendChild(div);
    }
    var el = document.getElementById('lineName');
    el.value = line.name;
    var el = document.getElementById('lineColor');
    el.value = line.color;
    var el = document.getElementById('lineAnimate');
    if (line.animate){
        el.checked = true;
    }
    else {
        el.checked = false;
    }
    var el = document.getElementById('lineFreq');
    el.value = line.freq;
    var el = document.getElementById('lineDelete');
    el.value = "";
}



function createStops(){
    var pathEl = document.getElementById('pathStations');
    var lineID = pathEl.getAttribute('name').substring(5);
    var lineName = document.getElementById('lineName').value;
    var lineColor = document.getElementById('lineColor').value;
    var lineAnimate = document.getElementById('lineAnimate').checked;
    var lineFreq = document.getElementById('lineFreq').value;
    var lineDelete = document.getElementById('lineDelete').value;
    if (lineDelete.indexOf('DELETE') > -1){
        Train.deleteLine(lineID,lineName,lineFreq);
        MicroModal.close('modal-1');
        Train.calculateNetworks();
        updateDashboard();
        return;
    }
    Train.createLine(false,lineID,lineName,lineFreq,lineColor,lineAnimate);
    var selected = pathEl.querySelectorAll('input:checked');
    selected.forEach(el => {
        var stationID = el.getAttribute('name');
        Train.addToLine(lineID,stationID);
    })
    var selected = document.querySelectorAll('#connectedStations input:checked');
    selected.forEach(el => {
        var stationID = el.getAttribute('name');
        Train.addToLine(lineID,stationID);
    })
    MicroModal.close('modal-1');
    Train.updatePops();
    Train.updateTrains(lineID);
    if (lineAnimate){
        TrainMap.prepAnimationOne(lineID);
    }
    else {
        TrainMap.prepAnimationOne(lineID,false);
    }
    saveMap();
    
    //Train.calculateNetworks();
    //updateDashboard();

}
function addStop(event){
    userAction();
    var id = event.currentTarget.id;
    updateStations(id);
    MicroModal.show('modal-1');

}
function addLine(){
    userAction();
    var lineID = Train.createLine(Train.owner);
    updateLines();
    addStop({currentTarget:{id:lineID}});
}
function mapFullscreen(){
    var mapEl = document.getElementById('mapContainer');
    if (mapEl.classList.contains('full')){
        mapEl.classList.remove('full');
    }
    else {
        mapEl.classList.add('full');
    }
    setTimeout( function() { TrainMap.updateSize();}, 250);
}
window.onresize = function(){setTimeout( function() { TrainMap.updateSize();}, 250);}
