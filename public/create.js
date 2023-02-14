var defaultSettings = {
    ridershipFormula: "10000*popA*popB/Math.pow(time,2)",
    stopTimeFormula: "5",
    waitTimeFormula: "0.333*24*60/frequency",
    trainSpeedFormula: "500*1/(1+Math.pow(10,(maintenance/50)))",
    driveTimeFormula: "20",
    trackCostFormula: "25000000",
    bridgeCostFormula: "distance*100000000",
    stationCostFormula: "riders*10",
    seatCostFormula: "Math.sqrt(gdp/50000)*0.02",
    riderCostFormula: "Math.sqrt(gdp/50000)*0.05",
    ticketPriceFormula: "0.15*Math.sqrt(gdp/50000)*cityDistance",
    loanRateFormula: "borrowed/(cash+profit*10)*3+term/25",
    loanRateMin: "3",
    loanRateMax: "12",
}

var settings = {
    ridershipFormula: "10000*popA*popB/Math.pow(time,2)",
    stopTimeFormula: "5",
    waitTimeFormula: "0.333*24*60/frequency",
    trainSpeedFormula: "500*1/(1+Math.pow(10,(maintenance/50)))",
    driveTimeFormula: "20",
    trackCostFormula: "25000000",
    bridgeCostFormula: "distance*100000000",
    stationCostFormula: "riders*10",
    seatCostFormula: "Math.sqrt(gdp/50000)*0.02",
    riderCostFormula: "Math.sqrt(gdp/50000)*0.05",
    ticketPriceFormula: "0.15*Math.sqrt(gdp/50000)*cityDistance",
    loanRateFormula: "borrowed/(cash+profit*10)*3+term/25",
    loanRateMin: "3",
    loanRateMax: "12",
}

var initialSettings = {
    owner: "test",
    initialMoney: 100000000000,
    initialLoan: {p:100000000000,n:100,y:1500000000,r:0.01}
}

var unsaved = {'ridership':false,'timing':false,'costs':false,'profits':false,'finances':false};
  

var functionStrings = {}

function formulaConverter(str,variables){
    for (var i=0;i<variables.length;i++){
        //var re = new RegExp(variables[i], "g");
        //str = str.replace(re, 'data["'+variables[i]+'"]');

    }
    console.log(str,variables)
    str = strToFunction(variables,str,true);
    return str;
}

function setAndSave(){
    //load saved settings
    if (window.localStorage.getItem('savedSettings')){
        settings = JSON.parse(window.localStorage.getItem('savedSettings'));
    }
    revertRidership(false,true);
    revertTiming(false,true);
    revertCosts(false,true);
    revertProfits(false,true);
    revertFinances(false,true);

    saveRidership();
    saveTiming();
    saveCosts();
    saveProfits();
    saveFinances();

    document.querySelectorAll('.div5 .formulaTextarea').forEach((el) => {
        el.addEventListener('change',(event) => {revertCosts(false,false,false)})
    })
    document.querySelectorAll('.div3 .formulaTextarea').forEach((el) => {
        el.addEventListener('change',(event) => {revertTiming(false,false,false)})
    })
    document.querySelectorAll('.div2 .formulaTextarea').forEach((el) => {
        el.addEventListener('change',(event) => {revertRidership(false,false,false)})
    })
    document.querySelectorAll('.div6 .formulaTextarea').forEach((el) => {
        el.addEventListener('change',(event) => {revertProfits(false,false,false)})
    })
}
var ridershipInputs = ["time", "popA", "popB"];
function saveRidership(){

    var str = document.getElementById('ridershipFormula').value;
    str = formulaConverter(str, ridershipInputs);
    if (str){
        settings.ridershipFormula = document.getElementById('ridershipFormula').value;
        console.log("return "+str);
        functionStrings["toRidership"] = "return "+str;
        window.localStorage.setItem('savedSettings',JSON.stringify(settings));
        unsaved.ridership = false;
        document.getElementById('saveRidershipBtn').classList.remove('unsaved');
        document.getElementById('ridershipFormula').classList.remove('error');
        unsaved.ridership = false;
    }
    else {
        document.getElementById('ridershipFormula').classList.add('error');
    }
}
function revertRidership(def=false,first=false,revert=true){
    var formulaEl = document.getElementById('ridershipFormula');
    if (def){
        if (formulaEl.value != defaultSettings.ridershipFormula && !first){
            unsaved.ridership = true;
            document.getElementById('saveRidershipBtn').classList.add('unsaved');
        }
        if (revert){
            formulaEl.value = defaultSettings.ridershipFormula;
        }
    }
    else {
        if (formulaEl.value != settings.ridershipFormula && !first){
            unsaved.ridership = true;
            document.getElementById('saveRidershipBtn').classList.add('unsaved');
        }
        if (revert){
            formulaEl.value = settings.ridershipFormula;
        }

    }
    checkFormula(formulaEl.value,ridershipInputs,'ridership');
    
}
function checkFormula(input,inputs,name){
    var str = formulaConverter(input, inputs);
    if (str && str != "error"){
        document.getElementById(name+'Formula').classList.remove('error');
    }
    else {
        document.getElementById(name+'Formula').classList.add('error');
    }
}



var timingInputs = ["frequency","maintenance"];
function saveTiming(){
    
    var isError = false;

    var names = {'stopTime':[],'waitTime':["frequency"],'driveTime':[],'trainSpeed':["maintenance"]};
    for (var i in names){
        var str = document.getElementById(i+'Formula').value;
        str = formulaConverter(str, names[i]);
        if (str){
            settings[i+'Formula'] = document.getElementById(i+'Formula').value;
            functionStrings["to"+i[0].toUpperCase()+i.substring(1)+'Formula'] = "return "+str;
            window.localStorage.setItem('savedSettings',JSON.stringify(settings));
            document.getElementById(i+'Formula').classList.remove('error');
        }
        else {
            isError = true;
            document.getElementById(i+'Formula').classList.add('error');
        }
        console.log("return "+str);
    }


    if (isError){
        
    }
    else {
        document.getElementById('saveTimingBtn').classList.remove('unsaved');
        unsaved.timing = false;
    }
}
function revertTiming(def=false,first=false,revert=true){
    var ns = settings;
    if (def){ns = defaultSettings;}
    var names = {'stopTime':[],'waitTime':["frequency"],'driveTime':[],'trainSpeed':["maintenance"]};
    for (var i in names){
        var formulaEl = document.getElementById(i+'Formula');
        if (formulaEl.value != ns[i+'Formula'] && !first){
            unsaved.timing = true;
            document.getElementById('saveTimingBtn').classList.add('unsaved');
        }
        if (revert){formulaEl.value = ns[i+'Formula'];}
        checkFormula(formulaEl.value,names[i],i);
    }
}

function saveCosts(){
    var isError = false;

    var names = {'trackCost':["gdp"],'bridgeCost':["gdp","distance"],'stationCost':["gdp","riders"]};
    for (var i in names){
        var str = document.getElementById(i+'Formula').value;
        str = formulaConverter(str, names[i]);
        if (str){
            settings[i+'Formula'] = document.getElementById(i+'Formula').value;
            functionStrings["to"+i[0].toUpperCase()+i.substring(1)+'Formula'] = "return "+str;
            window.localStorage.setItem('savedSettings',JSON.stringify(settings));
            document.getElementById(i+'Formula').classList.remove('error');
        }
        else {
            isError = true;
            document.getElementById(i+'Formula').classList.add('error');
        }
        console.log("return "+str);
    }

    if (isError){
        
    }
    else {
        document.getElementById('saveCostsBtn').classList.remove('unsaved');
        unsaved.costs = false;
    }
}
function revertCosts(def=false,first=false,revert=true){
    var ns = settings;
    if (def){ns = defaultSettings;}
    var names = {'trackCost':["gdp"],'bridgeCost':["gdp","distance"],'stationCost':["gdp","riders"]};
    for (var i in names){
        var formulaEl = document.getElementById(i+'Formula');
        if (formulaEl.value != ns[i+'Formula'] && !first){
            unsaved.costs = true;
            document.getElementById('saveCostsBtn').classList.add('unsaved');
        }
        if (revert){formulaEl.value = ns[i+'Formula'];}
        checkFormula(formulaEl.value,names[i],i);
    }
}

function saveProfits(){
    var isError = false;

    var names = {'seatCost':["gdp"],'riderCost':["gdp"],'ticketPrice':["gdp","cityDistance","trackDistance"]};
    for (var i in names){
        var str = document.getElementById(i+'Formula').value;
        str = formulaConverter(str, names[i]);
        if (str){
            settings[i+'Formula'] = document.getElementById(i+'Formula').value;
            functionStrings["to"+i[0].toUpperCase()+i.substring(1)+'Formula'] = "return "+str;
            window.localStorage.setItem('savedSettings',JSON.stringify(settings));
            document.getElementById(i+'Formula').classList.remove('error');
        }
        else {
            isError = true;
            document.getElementById(i+'Formula').classList.add('error');
        }
        console.log("return "+str);
    }

    if (isError){
        
    }
    else {
        document.getElementById('saveProfitsBtn').classList.remove('unsaved');
        unsaved.profits = false;
    }

    
}
function revertProfits(def=false,first=false,revert=true){
    var ns = settings;
    if (def){ns = defaultSettings;}
    var names = {'seatCost':["gdp"],'riderCost':["gdp"],'ticketPrice':["gdp","cityDistance","trackDistance"]};
    for (var i in names){
        var formulaEl = document.getElementById(i+'Formula');
        if (formulaEl.value != ns[i+'Formula'] && !first){
            unsaved.costs = true;
            document.getElementById('saveProfitsBtn').classList.add('unsaved');
        }
        if (revert){formulaEl.value = ns[i+'Formula'];}
        
        checkFormula(formulaEl.value,names[i],i);
    }
}

var financesInputs = ["borrowed","cash","profit",'term'];
function saveFinances(){
    
    var loanAmount = parseFloat(document.getElementById('loanAmount').value);
    if (loanAmount && loanAmount > 0){
        var loanTerm = parseInt(document.getElementById('loanTerm').value);
        var loanRate = parseFloat(document.getElementById('loanRate').value)/100;
        initialSettings.initialLoan.p = loanAmount;
        initialSettings.initialLoan.n = loanTerm;
        initialSettings.initialLoan.r = loanRate;
    }
    else {
        initialSettings.initialLoan = false;
    }
    initialSettings.initialMoney = parseFloat(document.getElementById('cashValue').value);
    window.localStorage.setItem("initialSettings",JSON.stringify(initialSettings));

    var loanRateMinMax = document.getElementById('loanRateMinMax').value.replace(/\s/g,"");
    console.log(loanRateMinMax)
    var split = loanRateMinMax.split(",");
    console.log(split);
    var loanRateMin = 0;
    var loanRateMax = 100;
    if (split.length > 1){
        loanRateMin = parseFloat(split[0]);
        loanRateMax = parseFloat(split[1]);
    }
    else if (split.length == 1){
        loanRateMin = parseFloat(split[0]);
    }
    
    var str = document.getElementById('loanRateFormula').value;
    settings.loanRateFormula = str;
    settings.loanRateMin = loanRateMin;
    settings.loanRateMax = loanRateMax;
    var loanStr = "var ratio = "+loanRateMax+";\ntry {ratio = "+formulaConverter(str, financesInputs)+"}\ncatch {}\n";
    loanStr += "if (!ratio || ratio < "+loanRateMin+"){\n";
    loanStr += "ratio = "+loanRateMin+";}\n";
    loanStr += "if (isNaN(ratio) || ratio > "+loanRateMax+"){\n";
    loanStr += "ratio = "+loanRateMax+";}\n";
    loanStr += "return Math.round(ratio);";
    
    console.log(loanStr);
    functionStrings["toLoanRate"] = loanStr;

    
}
function revertFinances(def=false,first=false){

    var formulaEl = document.getElementById('cashValue');
    formulaEl.value = initialSettings.initialMoney;
    if (initialSettings.initialLoan){
        var formulaEl = document.getElementById('loanAmount');
        formulaEl.value = initialSettings.initialLoan.p;
        var formulaEl = document.getElementById('loanRate');
        formulaEl.value = initialSettings.initialLoan.r*100;
        var formulaEl = document.getElementById('loanTerm');
        formulaEl.value = initialSettings.initialLoan.n;
    }
    else {
        var formulaEl = document.getElementById('loanAmount');
        formulaEl.value = 0;
        var formulaEl = document.getElementById('loanRate');
        formulaEl.value = 0;
        var formulaEl = document.getElementById('loanTerm');
        formulaEl.value = 0;
    }

    var formulaEl = document.getElementById('loanRateFormula');
    formulaEl.value = settings.loanRateFormula;
    var formulaEl = document.getElementById('loanRateMinMax');
    formulaEl.value = settings.loanRateMin + ", "+settings.loanRateMax;
}


setAndSave();