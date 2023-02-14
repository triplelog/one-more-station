
function strToFunction(header,filterStr,justString=false,floatcheck=false){

	var cString = "";
	for (var i=0;i<filterStr.length;i++){
		var cc = filterStr.charCodeAt(i);
		if((cc >= 48 && cc <= 57)||(cc >= 65 && cc <= 90)||(cc >= 97 && cc <= 122)||(cc == 95)){
			cString = cString + filterStr[i];
			if (i+1 < filterStr.length){continue;}
			else{i++}
		}
		if (cString.length > 0){
			for (var ii=0;ii<header.length;ii++){
				if (header[ii] == cString){
					var startStr = filterStr.substring(0,i-cString.length)+intToName(ii);
					filterStr = startStr+filterStr.substring(i);
					i = startStr.length-1;
					break;
				}
			}
		}
		cString = "";
		
	}
	const cleaned = clean(filterStr);
	//console.log(cleaned);
	const postfixed = postfixify(cleaned);
	//console.log(postfixed);
	const modified = toModify(postfixed);
	//console.log("mod ",modified);
	
	for (var j=0;j<modified.length;j++){
		var isGood = false;
        if ((modified[j] == "max" || modified[j] == "min") && j > 0){
            if (modified[j-1] != ","){
                modified[j] = "col"+modified[j];
            }
            isGood = true;
            continue;
        }
		if (prec[modified[j]] || isNumber(modified[j])  || modified[j] == 'true' || modified[j] == 'false' ){
			isGood = true;
			continue;
		}
        if (modified[j].length>1 && modified[j][0] == "-" && isNumber(modified[j].substring(1)) ){
			isGood = true;
			continue;
		}
        if (modified[j] == "undefined" || modified[j] == "null" ){
			isGood = true;
			continue;
		}
		if (modified[j].length > 1 && modified[j][0] == '"'){
			var str = modified[j].trim();
			if (str.indexOf('"',1) == str.length-1){
				isGood = true;
				continue;
			}
		}
		if (modified[j].substring(0,4) == "tktk"){
			var rowint = nameToInt(modified[j].substring(4));
			if (rowint >= 0){
				//modified[j] = "row["+rowint+"]";
				modified[j] = "data[\""+header[rowint]+"\"]";
                if (floatcheck){
                    floatcheck.add(rowint);
                }
				isGood = true;
			}
		}
		

		if (!isGood){
			console.log("not isGood ",modified[j]);
			return "error";
		}
	}
	//console.log("out:",modified);
	const code = toCode(modified,"js");
	//console.log("outcode:",code);
	if (justString){return code}
	return new Function('data',"return "+code);
}

function intToName(i){
	const letters = ["A","B","C","D","E","F","G","H","I","J"];
	var str = ""+i;
	var out = "tktk";
	for (var ii=0;ii<str.length;ii++){
		out = out + letters[parseInt(str[ii])];
	}
	return out;
}
function nameToInt(name){
	const letters = {"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9};
	var out = 0;
	for (var ii=0;ii<name.length;ii++){
		var i = letters[name[ii]];
		if (!i && name[ii] !== "A"){
			return -1;
		}
		out = out*10 + i;
	}
	return out;
}












//mathzetta



function newNode() {
    var obj = {};
    obj.isEnd = false;
    obj.children = {};
    return obj;
}

//Adds a key to the Trie
function trieInsert(key, pCrawl) {
    let len = key.length;
    var index;

    for (var level = 0; level < len; level++) {
        index = key[level];
        if (pCrawl.children[index] == null) {
            pCrawl.children[index] = newNode();
        }
        pCrawl = pCrawl.children[index];
    }
    pCrawl.isEnd = true;
}

// Returns true if key presents in trie, else false
function trieSearch(key, pCrawl) {
    let len = key.length;
    if (len == 0) {
        return;
    }
    var index;
    var longestMatch = -1;
    for (var level = 0; level < len; level++) {
        index = key[level];
        if (pCrawl.children[index] == null) {
            if (longestMatch >= 0) {
                return [longestMatch + 1, key.substring(0, longestMatch + 1)];
            } else {
                return false;
            }
        }
        pCrawl = pCrawl.children[index];
        if (pCrawl.isEnd) {
            longestMatch = level;
        }
    }
    if (longestMatch >= 0) {
        return [longestMatch + 1, key.substring(0, longestMatch + 1)];
    } else {
        return false;
    }
}

function trieReplace0(input) {
    var len = input.length;
    for (var i = 0; i < input.length; i++) {
        var ts = trieSearch(input.substring(i), root0);
        if (ts) {
            let out = trieMap0[ts[1]];
            input = input.substring(0, i) + out + input.substring(i + ts[0]);
            i += out.length - 1;
        }
    }
    return input;
}

function trieReplace1(input) {
    var len = input.length;
    for (var i = 0; i < input.length; i++) {
        var ts = trieSearch(input.substring(i), root1);
        if (ts) {
            let out = trieMap1[ts[1]];
            input = input.substring(0, i) + out + input.substring(i + ts[0]);
            i += out.length - 1;
        }
    }
    return input;
}
let trieMap0 = {
    " And ": "&",
    " and ": "&",
    " AND ": "&",
    " Or ": "|",
    " or ": "|",
    " OR ": "|",
    " In ": "∈",
    " in ": "∈",
    " IN ": "∈",
    " Not In ": "∉",
    " not in ": "∉",
    " NOT IN ": "∉",
    " Mod ": "\\mod",
    " mod ": "\\mod",
    " MOD ": "\\mod",
    " % ": "\\mod",
    " Perm ": "\\perm",
    " perm ": "\\perm",
    " PERM ": "\\perm",
    " Comb ": "\\comb",
    " comb ": "\\comb",
    " COMB ": "\\comb",
    " choose ": "\\comb",
    " CHOOSE ": "\\comb",
    " Choose ": "\\comb",
    "! ": "!_",
    "\\in ": "∈",
    "\\IN ": "∈",
    "\\In ": "∈",
    "\\notin ": "∉",
    "\\NOTIN ": "∉",
    "\\Notin ": "∉",
    "\\not\\in ": "∉",
    "\\NOT\\IN ": "∉",
    "\\Not\\In ": "∉",
    "\\to ": "→",
    "\\TO ": "→",
    "\\To ": "→"
}
let root0 = newNode();
// Construct trie
for (var i in trieMap0) {
    trieInsert(i, root0);
}
let trieMap1 = {
    "Math.sin(": "sin(",
    "math.sin(": "sin(",
    "MATH.SIN(": "sin(",
    "Math.Sin(": "sin(",
    "Math.cos(": "cos(",
    "math.cos(": "cos(",
    "MATH.COS(": "cos(",
    "Math.Cos(": "cos(",
    "Math.tan(": "tan(",
    "math.tan(": "tan(",
    "MATH.TAN(": "tan(",
    "Math.Tan(": "tan(",
    "Math.sec(": "sec(",
    "math.sec(": "sec(",
    "MATH.SEC(": "sec(",
    "Math.Sec(": "sec(",
    "Math.csc(": "csc(",
    "math.csc(": "csc(",
    "MATH.CSC(": "csc(",
    "Math.Csc(": "csc(",
    "Math.cot(": "cot(",
    "math.cot(": "cot(",
    "MATH.COT(": "cot(",
    "Math.Cot(": "cot(",
    "Math.sinh(": "sinh(",
    "math.sinh(": "sinh(",
    "MATH.SINH(": "sinh(",
    "Math.Sinh(": "sinh(",
    "Math.cosh(": "cosh(",
    "math.cosh(": "cosh(",
    "MATH.COSH(": "cosh(",
    "Math.Cosh(": "cosh(",
    "Math.tanh(": "tanh(",
    "math.tanh(": "tanh(",
    "MATH.TANH(": "tanh(",
    "Math.Tanh(": "tanh(",
    "Math.asin(": "arcsin(",
    "math.asin(": "arcsin(",
    "MATH.ASIN(": "arcsin(",
    "Math.Asin(": "arcsin(",
    "Math.acos(": "arccos(",
    "math.acos(": "arccos(",
    "MATH.ACOS(": "arccos(",
    "Math.Acos(": "arccos(",
    "Math.atan(": "arctan(",
    "math.atan(": "arctan(",
    "MATH.ATAN(": "arctan(",
    "Math.Atan(": "arctan(",
    "Math.atan2(": "atan2(",
    "math.atan2(": "atan2(",
    "MATH.ATAN2(": "atan2(",
    "Math.Atan2(": "atan2(",
    "Math.asinh(": "arcsinh(",
    "math.asinh(": "arcsinh(",
    "MATH.ASINH(": "arcsinh(",
    "Math.Asinh(": "arcsinh(",
    "Math.acosh(": "arccosh(",
    "math.acosh(": "arccosh(",
    "MATH.ACOSH(": "arccosh(",
    "Math.Acosh(": "arccosh(",
    "Math.atanh(": "arctanh(",
    "math.atanh(": "arctanh(",
    "MATH.ATANH(": "arctanh(",
    "Math.Atanh(": "arctanh(",
    "Math.random()": "random(1)",
    "math.random()": "random(1)",
    "MATH.RANDOM()": "random(1)",
    "Math.Random()": "random(1)",
    "random.random()": "random(1)",
    "RANDOM.RANDOM()": "random(1)",
    "Random.Random()": "random(1)",
    "Math.log2(": "log_{2}(",
    "math.log2(": "log_{2}(",
    "MATH.LOG2(": "log_{2}(",
    "Math.Log2(": "log_{2}(",
    "Math.log10(": "log_{10}(",
    "math.log10(": "log_{10}(",
    "MATH.LOG10(": "log_{10}(",
    "Math.Log10(": "log_{10}(",
    "Math.fabs(": "abs(",
    "math.fabs(": "abs(",
    "MATH.FABS(": "abs(",
    "Math.Fabs(": "abs(",
    "Math.gcd(": "gcd(",
    "math.gcd(": "gcd(",
    "MATH.GCD(": "gcd(",
    "Math.Gcd(": "gcd(",
    "Math.comb(": "comb(",
    "math.comb(": "comb(",
    "MATH.COMB(": "comb(",
    "Math.Comb(": "comb(",
    "Math.perm(": "perm(",
    "math.perm(": "perm(",
    "MATH.PERM(": "perm(",
    "Math.Perm(": "perm(",
    "Math.fmod(": "mod(",
    "math.fmod(": "mod(",
    "MATH.FMOD(": "mod(",
    "Math.Fmod(": "mod(",
    "Math.exp(": "e^(",
    "math.exp(": "e^(",
    "MATH.EXP(": "e^(",
    "Math.Exp(": "e^(",
    "Math.pow(": "pow(",
    "math.pow(": "pow(",
    "MATH.POW(": "pow(",
    "Math.Pow(": "pow(",
    "**": "^",
    "Math.floor(": "floor(",
    "math.floor(": "floor(",
    "MATH.FLOOR(": "floor(",
    "Math.Floor(": "floor(",
    "Math.ceil(": "ceil(",
    "math.ceil(": "ceil(",
    "MATH.CEIL(": "ceil(",
    "Math.Ceil(": "ceil(",
    "Math.round(": "round(",
    "math.round(": "round(",
    "MATH.ROUND(": "round(",
    "Math.Round(": "round(",
    "Math.max(": "max(",
    "math.max(": "max(",
    "MATH.MAX(": "max(",
    "Math.Max(": "max(",
    "Math.min(": "min(",
    "math.min(": "min(",
    "MATH.MIN(": "min(",
    "Math.Min(": "min(",
    "Math.pi": "π",
    "math.pi": "π",
    "MATH.PI": "π",
    "Math.Pi": "π",
    "Math.PI": "π",
    "math.Pi": "π",
    "Math.e": "e",
    "math.e": "e",
    "MATH.E": "e",
    "Math.E": "e",
    "math.E": "e",
    "Math.sqrt2": "sqrt(2)",
    "math.sqrt2": "sqrt(2)",
    "MATH.SQRT2": "sqrt(2)",
    "Math.Sqrt2": "sqrt(2)",
    "Math.sqrt(": "sqrt(",
    "math.sqrt(": "sqrt(",
    "MATH.SQRT(": "sqrt(",
    "Math.Sqrt(": "sqrt(",
    "Math.sqrt1_2": "sqrt(1/2)",
    "math.sqrt1_2": "sqrt(1/2)",
    "MATH.SQRT1_2": "sqrt(1/2)",
    "Math.Sqrt1_2": "sqrt(1/2)",
    "Math.log2e": "log_{2}(e)",
    "math.log2e": "log_{2}(e)",
    "MATH.LOG2E": "log_{2}(e)",
    "Math.Log2E": "log_{2}(e)",
    "Math.log10e": "log_{10}(e)",
    "math.log10e": "log_{10}(e)",
    "MATH.LOG10E": "log_{10}(e)",
    "Math.Log10E": "log_{10}(e)",
    "Math.ln2": "log_{e}(2)",
    "math.ln2": "log_{e}(2)",
    "MATH.LN2": "log_{e}(2)",
    "Math.Ln2": "log_{e}(2)",
    "Math.ln10": "log_{e}(10)",
    "math.ln10": "log_{e}(10)",
    "MATH.LN10": "log_{e}(10)",
    "Math.Ln10": "log_{e}(10)",
    "Math.tau": "τ",
    "math.tau": "τ",
    "MATH.TAU": "τ",
    "Math.Tau": "τ",
    "infinity": "∞",
    "INFINITY": "∞",
    "Infinity": "∞",
    "\\infty": "∞",
    "\\INFTY": "∞",
    "\\Infty": "∞",
    "\\cdot": "*",
    "\\CDOT": "*",
    "\\Cdot": "*",
    "\\times": "*",
    "\\TIMES": "*",
    "\\Times": "*",
    "\\max": "max",
    "\\MAX": "max",
    "\\Max": "max",
    "\\min": "min",
    "\\MIN": "min",
    "\\Min": "min",
    "product(": "prod(",
    "PRODUCT(": "prod(",
    "Product(": "prod(",
    "log[": "log_[",
    "LOG[": "log_[",
    "Log[": "log_[",
    "\\log_": "\\log_",
    "\\LOG_": "\\log_",
    "\\Log_": "\\log_",
    "\\log": "\\log_{e}",
    "\\LOG": "\\log_{e}",
    "\\Log": "\\log_{e}",
    "\\ln": "\\log_{e}",
    "\\LN": "\\log_{e}",
    "\\Ln": "\\log_{e}",
    "log(": "log_{e}(",
    "LOG(": "log_{e}(",
    "Log(": "log_{e}(",
    "ln(": "log_{e}(",
    "LN(": "log_{e}(",
    "Ln(": "log_{e}(",
    "log2(": "log_{2}(",
    "LOG2(": "log_{2}(",
    "Log2(": "log_{2}(",
    "log3(": "log_{3}(",
    "LOG3(": "log_{3}(",
    "Log3(": "log_{3}(",
    "log4(": "log_{4}(",
    "LOG4(": "log_{4}(",
    "Log4(": "log_{4}(",
    "log5(": "log_{5}(",
    "LOG5(": "log_{5}(",
    "Log5(": "log_{5}(",
    "log6(": "log_{6}(",
    "LOG6(": "log_{6}(",
    "Log6(": "log_{6}(",
    "log7(": "log_{7}(",
    "LOG7(": "log_{7}(",
    "Log7(": "log_{7}(",
    "log8(": "log_{8}(",
    "LOG8(": "log_{8}(",
    "Log8(": "log_{8}(",
    "log9(": "log_{9}(",
    "LOG9(": "log_{9}(",
    "Log9(": "log_{9}(",
    "log10(": "log_{10}(",
    "LOG10(": "log_{10}(",
    "Log10(": "log_{10}(",
    "log_10": "log_{10}",
    "LOG_10": "log_{10}",
    "Log_10": "log_{10}",
    "\\log\\log": "\\loglog",
    "\\LOG\\LOG": "\\loglog",
    "\\Log\\Log": "\\loglog",
    "\\log\\log\\log": "\\logloglog",
    "\\LOG\\LOG\\LOG": "\\logloglog",
    "\\Log\\Log\\Log": "\\logloglog",
    "loglog(": "loglog(",
    "LOGLOG(": "loglog(",
    "Loglog(": "loglog(",
    "\\exp": "e^",
    "\\EXP": "e^",
    "\\Exp": "e^",
    "exp(": "e^(",
    "EXP(": "e^(",
    "Exp(": "e^(",
    "\\div": "/",
    "\\DIV": "/",
    "\\Div": "/",
    "\\int": "\\int",
    "\\INT": "\\int",
    "\\Int": "\\int",
    "\\in": "∈",
    "\\IN": "∈",
    "\\In": "∈",
    "\\not\\in": "∉",
    "\\NOT\\IN": "∉",
    "\\Not\\In": "∉",
    "\\notin": "∉",
    "\\NOTIN": "∉",
    "\\Notin": "∉",
    "\\rightarrow": "→",
    "\\RIGHTARROW": "→",
    "\\Rightarrow": "→",
    "\\limits": "\\limits",
    "\\LIMITS": "\\limits",
    "\\Limits": "\\limits",
    "\\pmod": "%",
    "\\PMOD": "%",
    "\\Pmod": "%",
    "\\mod": "%",
    "\\MOD": "%",
    "\\Mod": "%",
    "\\pm": "±",
    "\\PM": "±",
    "\\Pm": "±",
    "\\plusmn": "±",
    "\\PLUSMN": "±",
    "\\Plusmn": "±",
    "\\neq": "≠",
    "\\NEQ": "≠",
    "\\Neq": "≠",
    "!==": "≠=",
    "!=": "≠",
    "\\gt": ">",
    "\\GT": ">",
    "\\Gt": ">",
    "\\lt": "<",
    "\\LT": "<",
    "\\Lt": "<",
    "\\ge": "≥",
    "\\GE": "≥",
    "\\Ge": "≥",
    "\\geq": "≥",
    "\\GEQ": "≥",
    "\\Geq": "≥",
    ">=": "≥",
    "\\le": "≤",
    "\\LE": "≤",
    "\\Le": "≤",
    "\\leq": "≤",
    "\\LEQ": "≤",
    "\\Leq": "≤",
    "<=": "≤",
    "\\lparen": "(",
    "\\LPAREN": "(",
    "\\Lparen": "(",
    "\\rparen": ")",
    "\\RPAREN": ")",
    "\\Rparen": ")",
    "\\left(": "(",
    "\\LEFT(": "(",
    "\\Left(": "(",
    "\\right)": ")",
    "\\RIGHT)": ")",
    "\\Right)": ")",
    "\\lfloor": "⌊",
    "\\LFLOOR": "⌊",
    "\\Lfloor": "⌊",
    "\\rfloor": "⌋",
    "\\RFLOOR": "⌋",
    "\\Rfloor": "⌋",
    "\\lceil": "⌈",
    "\\LCEIL": "⌈",
    "\\Lceil": "⌈",
    "\\rceil": "⌉",
    "\\RCEIL": "⌉",
    "\\Rceil": "⌉",
    "ceiling(": "ceil(",
    "CEILING(": "ceil(",
    "Ceiling(": "ceil(",
    "\\Pi": "Π",
    "\\Alpha": "Α",
    "\\Beta": "Β",
    "\\Gamma": "Γ",
    "\\Delta": "Δ",
    "\\Epsilon": "Ε",
    "\\Zeta": "Ζ",
    "\\Eta": "Η",
    "\\Theta": "Θ",
    "\\Iota": "Ι",
    "\\Kappa": "Κ",
    "\\Lambda": "Λ",
    "\\Mu": "Μ",
    "\\Nu": "Ν",
    "\\Xi": "Ξ",
    "\\Omicron": "Ο",
    "\\Rho": "Ρ",
    "\\Sigma": "Σ",
    "\\Tau": "Τ",
    "\\Upsilon": "Υ",
    "\\Phi": "Φ",
    "\\Chi": "Χ",
    "\\Psi": "Ψ",
    "\\Omega": "Ω",
    "\\pi": "π",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\delta": "δ",
    "\\epsilon": "ε",
    "\\zeta": "ζ",
    "\\eta": "η",
    "\\theta": "θ",
    "\\iota": "ι",
    "\\kappa": "κ",
    "\\lambda": "λ",
    "\\mu": "μ",
    "\\nu": "ν",
    "\\xi": "ξ",
    "\\omicron": "ο",
    "\\rho": "ρ",
    "\\sigma": "σ",
    "\\tau": "τ",
    "\\upsilon": "υ",
    "\\phi": "φ",
    "\\chi": "χ",
    "\\psi": "ψ",
    "\\omega": "ω"
}
let root1 = newNode();
// Construct trie
for (var i in trieMap1) {
    trieInsert(i, root1);
}

function nextSpaces(input) {

    var openPar = 0;
    var firstSpace = 0;
    for (var i = 0; i < input.length; i++) {

        if (input[i] == "(" || input[i] == "{" || input[i] == "[") {
            openPar++;
        } else if (input[i] == ")" || input[i] == "}" || input[i] == "]") {
            openPar--;
        }
        if (openPar == 0) {
            if (firstSpace == 1) {
                if (input[i] != " " && input[i] != "\t" && input[i] != "\n") {
                    firstSpace = -1;
                    input = input.substring(0, i - 1) + "{" + input.substring(i);
                }
                continue;
            }
            if (input[i] == " " || input[i] == "\t" || input[i] == "\n") {
                if (firstSpace == 0) {
                    firstSpace = 1;
                } else {
                    input = input.substring(0, i) + "}" + input.substring(i + 1);
                    break;
                }
            }
        }
        if (firstSpace == -1 && i == input.length - 1) {
            input += "}";
            break;
        }

    }
    return input;
}


function latexReplaceSpaces(input) {

    for (var i = 0; i < input.length; i++) {
        if (input[i] == "m") {
            if (i >= 3 && input.substring(i - 3, i + 1) == "\\lim") {
                input = input.substring(0, i) + nextSpaces(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "\\sum") {
                input = input.substring(0, i) + nextSpaces(input.substring(i));
            }
        } else if (input[i] == "d") {
            if (i >= 4 && input.substring(i - 4, i + 1) == "\\prod") {
                input = input.substring(0, i) + nextSpaces(input.substring(i));
            }
        }
    }

    return input;
}

function complexClean0(input) {
    input = latexReplaceSpaces(input);

    return input;
}

function parseLatexFC(input) {
    var openPar = 1;
    var type = "floor";
    if (input[0] == "⌈") {
        type = "ceil";
    }
    for (var i = 1; i < input.length; i++) {
        if (input[i] == "⌊") {
            openPar++;
        } else if (input[i] == "⌈") {
            openPar++;
        } else if (input[i] == "⌋") {
            openPar--;
        } else if (input[i] == "⌉") {
            openPar--;
        }

        if (openPar == 0) {
            input = type + "(" + input.substring(1, i) + ")" + input.substring(i + 1);
            return input;
        }
    }
    return input;
}

function parseLatexRoot(input) {
    for (var i = 0; i < input.length; i++) {
        if (input[i] == "]") {
            if (i + 1 < input.length) {
                if (input[i + 1] == '{') {
                    input = "{" + input.substring(0, i) + "," + input.substring(i + 2);
                } else if (input[i + 1] == '(') {
                    input = "(" + input.substring(0, i) + "," + input.substring(i + 2);
                } else {
                    input = input.substring(0, i) + "," + input.substring(i + 2);
                }
            } else {
                input = input.substring(0, i) + "," + input.substring(i + 2);
            }
            return input;
        }
    }
    return input;
}


function parseLatexDerivatives(input) {
    var openPar = 1;
    var parCount = 0;
    var bottomStr = "";
    var dx = "x";
    var insideStr = "";
    for (var i = 0; i < input.length; i++) {
        if (input[i] == "{" || input[i] == "[") {
            openPar++;
        } else if (input[i] == "}" || input[i] == "]") {
            openPar--;
            if (openPar == 0) {
                if (parCount > 0) {
                    bottomStr = bottomStr.substring(0, i - parCount);
                    if (bottomStr.substring(0, 10) == "\\mathrm{d}") {
                        dx = bottomStr.substring(10);
                        insideStr = input.substring(i + 2);
                        openPar = 0;
                        parCount = -1 * (i + 2);
                    } else if (bottomStr[0] == "d") {
                        dx = bottomStr.substring(1);
                        insideStr = input.substring(i + 2);
                        openPar = 0;
                        parCount = -1 * (i + 2);
                    } else {
                        return "\\frac{" + input;
                    }
                } else if (parCount < 0) {
                    insideStr = insideStr.substring(0, i + parCount);
                    input = "der(" + insideStr + "," + dx + ")" + input.substring(i + 1);
                    return input;
                } else {
                    if (input.substring(0, i) == "d" || input.substring(0, i) == "\\mathrm{d}") {
                        bottomStr = input.substring(i + 2);
                        openPar = 0;
                        parCount = i + 2;
                    } else {
                        return "\\frac{" + input;
                    }

                }
            }
        }
    }
    return "\\frac{" + input;
}

function parseLatexMatrix(input) {
    var key = "";
    var openPar = 1;
    var idx = 0;
    var val = "";
    for (var i = 0; i < input.length; i++) {
        if (input[i] == "{") {
            return false;
        } else if (input[i] == "}") {
            key = input.substring(0, i);
            idx = i + 1;
            break;
        }
    }
    var end = input.indexOf("\\end{" + key + "}");
    var begin = input.indexOf("\\begin{" + key + "}", idx);
    if (end < 0) {
        return false;
    }
    if (begin == -1 || begin > end) {
        val = input.substring(idx, end);
    } else {
        return false;
    }
    if (key.indexOf("matrix") > -1) {
        var rows = val.trim().split("\\\\");
        var out = "[";
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].trim().length == 0) {
                continue;
            }
            var row = "[";
            row += rows[i].trim().replace(/&/g, ", ") + '';
            row += "]";

            if (i > 0) {
                out += ", ";
            }
            out += row;

        }
        out += "]";
        out += input.substring(end + 6 + key.length);
        return out;
    }
    return false;
}

function parseLatexInt(input) {
    var sub = "";
    var sup = "";
    var inside = "";
    var rest = "";
    var dx = "x";
    var subi = 0;
    var supi = 0;
    if (input[0] == "_") {

        if (input[1] == "{") {
            var openPar = 1;
            sub = "";
            for (var i = 2; i < input.length; i++) {
                if (input[i] == "{") {
                    openPar++;
                    sub += input[i];
                } else if (input[i] == "}") {
                    openPar--;
                    if (openPar == 0) {
                        subi = i + 1;
                        break;
                    }
                    sub += input[i];
                } else {
                    sub += input[i];
                }
            }
        } else {
            sub = input[1];
            subi = 2;
        }
        if (input[subi] != "^") {
            supi = subi;
        } else {
            subi++;
            if (input[subi] == "{") {
                var openPar = 1;
                sup = "";
                for (var i = subi + 1; i < input.length; i++) {
                    if (input[i] == "{") {
                        openPar++;
                        sup += input[i];
                    } else if (input[i] == "}") {
                        openPar--;
                        if (openPar == 0) {
                            supi = i + 1;
                            break;
                        }
                        sup += input[i];
                    } else {
                        sup += input[i];
                    }
                }
            } else {
                sup = input[subi];
                supi = subi + 1;
            }
        }
    }
    var dindex = input.substring(supi).indexOf('\\mathrm{d}');
    if (dindex < 0) {
        dindex = input.substring(supi).indexOf('d');
        if (dindex < 0) {
            inside = input.substring(supi).replace(/\\\,/g, "").replace(/\\\!/g, "");
            dx = "x";
        } else {
            inside = input.substring(supi, dindex + supi).replace(/\\\,/g, "").replace(/\\\!/g, "");
            rest = input.substring(dindex + supi + 2);
            dx = input.substring(supi)[dindex + 1];
        }
    } else {
        inside = input.substring(supi, dindex + supi).replace(/\\\,/g, "").replace(/\\\!/g, "");
        rest = input.substring(dindex + supi + 11);
        dx = input.substring(supi)[dindex + 10];
    }

    var out = "int(" + inside + "," + dx;
    if (sub != "" || sup != "") {
        out += "," + sub + "," + sup;
    }
    out += ")";
    return out + rest;

}

function parseLatexFunction(input) {
    var sub = "";
    var sup = "";
    var inside = "";
    var rest = "";
    var subi = 0;
    var supi = 0;
    if (input[0] == "_") {

        if (input[1] == "{") {
            var openPar = 1;
            sub = "";
            for (var i = 2; i < input.length; i++) {
                if (input[i] == "{") {
                    openPar++;
                    sub += input[i];
                } else if (input[i] == "}") {
                    openPar--;
                    if (openPar == 0) {
                        subi = i + 1;
                        break;
                    }
                    sub += input[i];
                } else {
                    sub += input[i];
                }
            }
        } else {
            sub = input[1];
            subi = 2;
        }
        if (input[subi] != "^") {
            supi = subi;
        } else {
            subi++;
            if (input[subi] == "{") {
                var openPar = 1;
                sup = "";
                for (var i = subi + 1; i < input.length; i++) {
                    if (input[i] == "{") {
                        openPar++;
                        sup += input[i];
                    } else if (input[i] == "}") {
                        openPar--;
                        if (openPar == 0) {
                            supi = i + 1;
                            break;
                        }
                        sup += input[i];
                    } else {
                        sup += input[i];
                    }
                }
            } else {
                sup = input[subi];
                supi = subi + 1;
            }
        }
    }
    var dindex = input.substring(supi).indexOf('}');
    var openPar = 0;
    for (var i = supi; i < input.length; i++) {
        if (input[i] == "{") {
            openPar++;
        } else if (input[i] == "}") {
            openPar--;
            if (openPar == 0) {
                rest = input.substring(i + 1);
                inside = input.substring(supi + 1, i);
                break;
            }
        }
        if (i == input.length - 1) {
            inside = input.substring(supi);
        }
    }


    var out = "(" + inside;
    if (sub != "" || sup != "") {
        out += "," + sub + "," + sup;
    }
    out += ")";
    return out + rest;
}

function shiftPower(input) {
    var openPar = 0;
    var power = "";
    var inside = "";
    for (var i = 1; i < input.length; i++) {

        if (input[i] == "(" || input[i] == "{" || input[i] == "[") {
            openPar++;
        } else if (input[i] == ")" || input[i] == "}" || input[i] == "]") {
            openPar--;
        }
        if (openPar == 0) {
            if (power == "") {
                power = input.substring(1, i + 1);
                continue;
            } else {
                inside = input.substring(1 + power.length, i + 1);
                break;

            }
        }
    }
    return inside + "^" + power + input.substring(1 + power.length + inside.length);

}


function parseTrigSquare(input) {

    for (var i = 0; i < input.length; i++) {
        if (input[i] == "^") {
            if (i >= 3 && input.substring(i - 3, i + 1) == "sin^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "cos^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "tan^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "csc^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "sec^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "cot^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            }
        }
    }

    return input;
}

function complexClean1(input) {
    for (var i = 0; i < input.length; i++) {
        if (input[i] == "{") {
            if (i >= 6 && input.substring(i - 6, i) == "\\begin") {
                var matrix = parseLatexMatrix(input.substring(i + 1));
                if (matrix) {
                    input = input.substring(0, i - 6) + matrix;
                }
            } else if (i >= 5 && input.substring(i - 5, i) == "\\frac") {
                input = input.substring(0, i - 5) + parseLatexDerivatives(input.substring(i + 1));
            }
        } else if (input[i] == "[") {
            if (i >= 5 && input.substring(i - 5, i) == "\\sqrt") {
                input = input.substring(0, i - 5) + "\\sqrt" + parseLatexRoot(input.substring(i + 1));
            } else if (i >= 4 && input.substring(i - 4, i) == "sqrt") {
                input = input.substring(0, i - 4) + "\\sqrt" + parseLatexRoot(input.substring(i + 1));
            }
        } else if (input[i] == "⌊") {
            input = input.substring(0, i) + parseLatexFC(input.substring(i));
        } else if (input[i] == "⌈") {
            input = input.substring(0, i) + parseLatexFC(input.substring(i));
        } else if (input[i] == "t") {
            if (i >= 3 && input.substring(i - 3, i + 1) == "\\int") {
                input = input.substring(0, i - 3) + parseLatexInt(input.substring(i + 1));
            }

        } else if (input[i] == "m") {
            if (i >= 3 && input.substring(i - 3, i + 1) == "\\sum") {
                input = input.substring(0, i - 3) + "\\sum" + parseLatexFunction(input.substring(i + 1));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "\\lim") {
                input = input.substring(0, i - 3) + "\\lim" + parseLatexFunction(input.substring(i + 1));
            }
        } else if (input[i] == "d") {
            if (i >= 4 && input.substring(i - 4, i + 1) == "\\prod") {
                input = input.substring(0, i - 4) + "\\prod" + parseLatexFunction(input.substring(i + 1));
            }
        } else if (input[i] == "^") {
            if (i >= 3 && input.substring(i - 3, i + 1) == "sin^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "cos^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "tan^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "csc^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "sec^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            } else if (i >= 3 && input.substring(i - 3, i + 1) == "cot^") {
                input = input.substring(0, i) + shiftPower(input.substring(i));
            }
        }
    }
    return input;
}
var checkpoints = {};

function clean(input) {
    checkpoints = {};
    input = input.replace(/\t/g, " ");
    input = trieReplace0(input);
    checkpoints['clean0'] = input;
    input = complexClean0(input);
    checkpoints['clean1'] = input;
    input = input.replace(/\s/g, "");
    checkpoints['clean2'] = input;
    input = trieReplace1(input);
    checkpoints['clean3'] = input;
    input = complexClean1(input);
    checkpoints['clean4'] = input;
    return input;
}
var prec = {}; {

    prec['#clean'] = 1000;
    prec['/clean'] = 1000;

    prec['~'] = 100;
    prec['☀'] = 100;
    prec['ln'] = 100;
    prec['log'] = 100;
    prec['loglog'] = 100;
    prec['logloglog'] = 100;
    prec['matrix'] = 100;
    prec['sqrt'] = 100;
    prec['pow'] = 100;
    prec['der'] = 100;
    prec['lim'] = 100;
    prec['int'] = 100;
    prec['round'] = 100;
    prec['floor'] = 100;
    prec['ceil'] = 100;

    prec['sum'] = 100;
    prec['prod'] = 100;

    prec['_'] = 100;
    prec['mod'] = 100;
    prec['perm'] = 100;
    prec['comb'] = 100;
    prec['random'] = 100;
    var trig = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh'];
    var arctrig = ['arcsin', 'arccos', 'arctan', 'arcsinh', 'arccosh', 'arctanh', 'atan2'];
    for (var i = 0; i < trig.length; i++) {
        prec[trig[i]] = 100;
    }
    for (var i = 0; i < arctrig.length; i++) {
        prec[arctrig[i]] = 100;
    }
    var commafns = ['max', 'min', 'gcd'];
    for (var i = 0; i < commafns.length; i++) {
        prec[commafns[i]] = 100;
    }
    prec['!'] = 90;
    prec['^'] = 80;
    prec['*'] = 70;
    prec['0-'] = 70;
    prec['/'] = 70;
    prec['frac'] = 70;
    prec['+'] = 50;
    prec['±'] = 50;
    prec['-'] = 50;



    prec['>'] = 30;
    prec['<'] = 30;
    prec['==='] = 30;
    prec['=='] = 30;
    prec['='] = 30;
    prec['!=='] = 30;
    prec['≠='] = 30;
    prec['≠'] = 30;
    prec['≤'] = 30;
    prec['≥'] = 30;
    prec['∈'] = 30;
    prec['∉'] = 30;

    prec['&'] = 20;
    prec['|'] = 20;

    prec[','] = 5;
    prec['row'] = 5;

}

function isNumber(input) {
    var len = input.length;
    if (len == 0) {
        return false;
    }
    for (var i = 0; i < len; i++) {
        if ("0123456789.".indexOf(input[i]) < 0) {
            return false;
        }
    }
    return true;

}

function toInfixArray(input) {
    var arr = [];
    var str = "";
    for (var i = 0; i < input.length; i++) {
        if ("(){}[]".indexOf(input[i]) > -1) {
            if (str.length > 0) {
                if ("({[".indexOf(input[i]) > -1) {
                    if (str[0] == "\\") {
                        if (prec[str.substring(1)]) {
                            arr.push(str.substring(1));
                        } else {
                            arr.push("\\:" + str.substring(1));
                            prec["\\:" + str.substring(1)] = 100;
                        }
                    } else if (isNumber(str)) {
                        arr.push(str);
                        arr.push("*");
                    } else if (prec[str]) {
                        arr.push(str);
                    } else {
                        arr.push("\\:" + str);
                        prec["\\:" + str] = 100;
                    }
                } else {
                    arr.push(str);
                }
            }
            arr.push(input[i]);
            str = "";
        } else if (input[i] == "-") {
            if (str.length > 0) {
                arr.push(str);
            }
            if (i == 0) {
                arr.push("0-");
            } else if (arr.length > 0 && prec[arr[arr.length - 1]] > 0) {
                arr.push("0-");
            } else if (i > 0 && "({[".indexOf(input[i - 1]) > -1) {
                arr.push("0-");
            } else {
                arr.push(input[i]);
            }
            str = "";
        } else if (input[i] == "_") {
            if (str == "log") {
                continue;
            }
            if (str == "" && arr.length > 0 && arr[arr.length - 1] == "log") {
                continue;
            }
            if (str.length > 0) {
                arr.push(str);
            }
            arr.push(input[i]);
            str = "";
        } else if (input[i] == " ") {
            if (str.length > 0) {
                arr.push(str);
            }
            str = "";
        } else if (prec[str + input[i]]) {
            str += input[i];
            while (i + 1 < input.length && prec[str + input[i + 1]]) {
                str += input[i + 1];
                i++;
            }
            if (str == "!" && i + 1 < input.length && input[i + 1] == "_") {
                str = "!";
                i++;
            }
            if (str.length > 0) {
                arr.push(str);
            }
            str = "";
        } else if (prec[input[i]]) {
            if (str.length > 0) {
                arr.push(str);
            }
            str = "";
            str += input[i];
            while (i + 1 < input.length && prec[str + input[i + 1]]) {
                str += input[i + 1];
                i++;
            }
            if (str == "!" && i + 1 < input.length && input[i + 1] == "_") {
                str = "!";
                i++;
            }
            arr.push(str);
            str = "";
        } else {
            str += input[i];
        }
    }
    if (str.length > 0) {
        arr.push(str);
    }
    return arr;
}
toPostfixArray(toInfixArray("-3+7"));

function toPostfixArray(input) {
    var stack = [];
    var postfix = [];
    for (var i = 0; i < input.length; i++) {
        if (prec[input[i]] == 1000) {
            postfix.push(input[i]);
            stack.push(input[i].replace("#", "/"));
        } else if (prec[input[i]]) {
            if (stack.length == 0) {
                stack.push(input[i]);
            } else if (input[i] == "0-") {
                stack.push(input[i]);
            } else if (prec[stack[stack.length - 1]] < prec[input[i]]) {
                stack.push(input[i]);
            } else if (stack[stack.length - 1] == "^" && input[i] == "^") {
                stack.push(input[i]);
            } else {
                while (stack.length > 0 && prec[stack[stack.length - 1]] >= prec[input[i]]) {
                    if (stack[stack.length - 1] == "^" && input[i] == "^") {
                        break;
                    }
                    var last = stack[stack.length - 1];
                    if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                        postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                    } else {
                        postfix.push(last);
                    }
                    stack.pop();
                }
                stack.push(input[i]);
            }
        }
        /*else if (input[i][0] == '\\'){
        	stack.push(input[i]);
        }*/
        else if (input[i] == '(' || input[i] == '{' || input[i] == '[') {
            stack.push(input[i]);
        } else if (input[i] == ')') {
            while (stack.length > 0 && stack[stack.length - 1] != "(") {
                var last = stack[stack.length - 1];
                if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                    postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                } else {
                    postfix.push(last);
                }
                stack.pop();
            }
            stack.pop();
        } else if (input[i] == '}') {
            while (stack.length > 0 && stack[stack.length - 1] != "{") {
                var last = stack[stack.length - 1];
                if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                    postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                } else {
                    postfix.push(last);
                }
                stack.pop();
            }
            stack.pop();
        } else if (input[i] == ']') {
            var isRow = false;
            while (stack.length > 0 && stack[stack.length - 1] != "[") {
                var last = stack[stack.length - 1];
                if (last == ",") {
                    isRow = true;
                }
                if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                    postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                } else {
                    postfix.push(last);
                }
                stack.pop();
            }
            stack.pop();
            if (isRow) {
                postfix.push("row")
            }
        } else {
            if (input[i].length <= 1 || isNumber(input[i])) {
                postfix.push(input[i]);
            } else {
                var idx = 1;
                while (idx < input[i].length && isNumber(input[i].substring(0, idx))) {
                    idx++;
                }
                if (idx > 1) {
                    if (input[i][idx - 1] == "%") {
                        if (idx == input[i].length) {
                            //12% is just a number
                            postfix.push(input[i]);
                        } else {
                            //12%7 becomes 12mod7
                            input.splice(i, 1, input[i].substring(0, idx - 1), "mod", input[i].substring(idx));

                            i--;
                            continue;
                        }
                    } else {
                        //Converts 4x to 4*x
                        input.splice(i, 1, input[i].substring(0, idx - 1), "*", input[i].substring(idx - 1));

                        i--;
                        continue;
                    }
                } else {
                    postfix.push(input[i]);
                }
            }
        }
    }
    while (stack.length > 0) {
        var last = stack[stack.length - 1];
        if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
            postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
        } else {
            postfix.push(last);
        }
        stack.pop();
    }
    return postfix;
}

function postfixify(input) {
    var tokenList = toInfixArray(input)
    checkpoints['postfix0'] = tokenList;
    var postfixList = toPostfixArray(tokenList);
    checkpoints['postfix1'] = postfixList;
    return postfixList;
}

var toLatexOp = {};

toLatexOp['~'] = function(stack, stackIndex) {
    //negation
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec <= prec['~']) {
        stack[stackIndex - 1].exp = "-(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 1].exp = "-" + stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 1].op = '~';
    return [stack, stackIndex];
}
toLatexOp['!'] = function(stack, stackIndex) {
    //factorial
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['!']) {
        stack[stackIndex - 1].exp = "(" + stack[stackIndex - 1].exp + ")!";
    } else {
        stack[stackIndex - 1].exp = stack[stackIndex - 1].exp + "!";
    }
    stack[stackIndex - 1].op = '!';
    return [stack, stackIndex];
}
toLatexOp['*'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['*']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")\\cdot ";
    } else {
        if (stack[stackIndex - 2].exp == "-1" && stack[stackIndex - 1].exp.length > 0 && stack[stackIndex - 1].exp[0] != "-") {
            stack[stackIndex - 2].exp = "-";
        }

        if (isNumber(stack[stackIndex - 2].exp) && !(stack[stackIndex - 1].exp.length > 0 && stack[stackIndex - 1].exp[0] >= "0" && stack[stackIndex - 1].exp[0] <= "9")) {
            //number or greek letter followed by string with non-digit first character
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp;
        } else if (isLatexGreek(stack[stackIndex - 2].exp, 'end') && isLatexGreek(stack[stackIndex - 1].exp, 'start')) {
            //number or greek letter followed by string with non-digit first character
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp;
        } else {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "\\cdot ";
        }
    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['*']) {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '*';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp['+'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['+']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")+";
    } else {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "+";
    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['+']) {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else if (lastPrec && lastPrec == prec['+']) {
        //parentheses are not mathematically necessary here, but were presumably used.
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '+';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp['-'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['-']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")-";
    } else {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "-";
    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['-']) {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else if (lastPrec && lastPrec == prec['-'] || stack[stackIndex - 1].op == "~") {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '-';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp['^'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['^']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else if (stack[stackIndex - 2].op == "sin") {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else if (stack[stackIndex - 2].op == "cos") {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else if (stack[stackIndex - 2].op == "tan") {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else if (stack[stackIndex - 2].op == "sec") {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else if (stack[stackIndex - 2].op == "csc") {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else if (stack[stackIndex - 2].op == "cot") {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")^";
    } else {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "^";
    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['^']) {
        stack[stackIndex - 2].exp += "{(" + stack[stackIndex - 1].exp + ")}";
    } else if (stack[stackIndex - 1].exp.length > 1) {
        stack[stackIndex - 2].exp += "{" + stack[stackIndex - 1].exp + "}";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '^';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp['/'] = function(stack, stackIndex) {
    stack[stackIndex - 2].exp = "\\frac{" + stack[stackIndex - 2].exp + "}{" + stack[stackIndex - 1].exp + "}";
    stack[stackIndex - 2].op = '/';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp['frac'] = function(stack, stackIndex) {
    stack[stackIndex - 2].exp = "\\frac{" + stack[stackIndex - 2].exp + "}{" + stack[stackIndex - 1].exp + "}";
    stack[stackIndex - 2].op = '/';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp[','] = function(stack, stackIndex) {
    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "," + stack[stackIndex - 1].exp;
    stack[stackIndex - 2].ops = [stack[stackIndex - 2].op, stack[stackIndex - 1].op];
    stack[stackIndex - 2].op = ',';
    stackIndex--;
    return [stack, stackIndex];
}
toLatexOp['row'] = function(stack, stackIndex) {
    if (stack[stackIndex - 1].exp.indexOf('],[') > -1) {
        var matrix = stack[stackIndex - 1].exp.substring(1, stack[stackIndex - 1].exp.length - 1).split("],[");
        var str = "\\begin{pmatrix}";
        for (var i = 0; i < matrix.length; i++) {
            var row = matrix[i].split(",");
            //console.log(row);
            str += row.join(" & ") + "\\\\ ";
        }
        str += "\\end{pmatrix}";
        //console.log(str);
        stack[stackIndex - 1].exp = str;
        stack[stackIndex - 1].op = 'matrix';
        return [stack, stackIndex];
    } else {
        stack[stackIndex - 1].exp = "[" + stack[stackIndex - 1].exp + "]";
        stack[stackIndex - 1].op = 'row';
        return [stack, stackIndex];
    }
}
toLatexOp['sqrt'] = function(stack, stackIndex, op) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == "#") {
        stack[stackIndex - 1].exp = "\\sqrt{" + stack[stackIndex - 1].exp + "}";
    } else if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {
            stack[stackIndex - 1].exp = "\\sqrt[" + split[0] + "]{" + split[1] + "}";
        } else {
            stack[stackIndex - 1].exp = "\\sqrt{" + stack[stackIndex - 1].exp + "}";
        }
    } else {
        stack[stackIndex - 1].exp = "\\sqrt{" + stack[stackIndex - 1].exp + "}";
    }
    stack[stackIndex - 1].op = 'sqrt';
    return [stack, stackIndex];
}
toLatexOp['pow'] = function(stack, stackIndex, op) {
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {
            var lastPrec = prec[stack[stackIndex - 1].op];
            if (stack[stackIndex - 1].ops && stack[stackIndex - 1].ops.length == 2) {
                lastPrec = prec[stack[stackIndex - 1].ops[0]];
            }
            if (lastPrec && lastPrec < prec['^']) {
                stack[stackIndex - 1].exp = "(" + split[0] + ")^";
            } else {
                stack[stackIndex - 1].exp = split[0] + "^";
            }
            lastPrec = prec[stack[stackIndex - 1].op];
            if (stack[stackIndex - 1].ops && stack[stackIndex - 1].ops.length == 2) {
                lastPrec = prec[stack[stackIndex - 1].ops[1]];
            }

            if (lastPrec && lastPrec < prec['^']) {
                stack[stackIndex - 1].exp += "{(" + split[1] + ")}";
            } else if (split[1].length > 1) {
                stack[stackIndex - 1].exp += "{" + split[1] + "}";
            } else {
                stack[stackIndex - 1].exp += split[1];
            }
        } else {
            stack[stackIndex - 1].exp = "\\pow(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        }

    } else {
        stack[stackIndex - 1].exp = "\\pow(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
    }
    stack[stackIndex - 1].op = 'pow';
    delete stack[stackIndex - 1].ops;
    return [stack, stackIndex];
}
var logfns = ['log', 'loglog', 'logloglog'];
for (var i = 0; i < logfns.length; i++) {
    toLatexOp[logfns[i]] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 1].op];
        if (op == "loglog") {
            op = "log\\log";
        } else if (op == "logloglog") {
            op = "log\\log\\log";
        }
        if (stack[stackIndex - 1].op == "#") {
            var split = stack[stackIndex - 1].exp.split(";");
            if (split.length == 2) {
                if (split[0] == "e") {
                    if (op == "log") {
                        op = "ln";
                    };
                    stack[stackIndex - 1].exp = "\\" + op + "{(" + split[1] + ")}";
                } else {
                    stack[stackIndex - 1].exp = "\\" + op + "_{" + split[0] + "}{(" + split[1] + ")}";
                }
            } else {
                if (op == "log") {
                    op = "ln";
                };
                stack[stackIndex - 1].exp = "\\" + op + "{(" + stack[stackIndex - 1].exp + ")}";
            }
        } else if (stack[stackIndex - 1].op == ",") {
            var split = stack[stackIndex - 1].exp.split(",");
            if (split.length == 2) {
                if (split[0] == "e") {
                    if (op == "log") {
                        op = "ln";
                    };
                    stack[stackIndex - 1].exp = "\\" + op + "{(" + split[1] + ")}";
                } else {
                    stack[stackIndex - 1].exp = "\\" + op + "_{" + split[0] + "}{(" + split[1] + ")}";
                }
            } else {
                if (op == "log") {
                    op = "ln";
                };
                stack[stackIndex - 1].exp = "\\" + op + "{(" + stack[stackIndex - 1].exp + ")}";
            }
        } else {
            if (op == "log") {
                op = "ln";
            };
            stack[stackIndex - 1].exp = "\\" + op + "{" + stack[stackIndex - 1].exp + "}";
        }
        stack[stackIndex - 1].op = 'log';
        return [stack, stackIndex];
    }
}
var comps = {};
comps['∈'] = "\\in ";
comps['∉'] = "\\notin ";
comps['≠'] = "\\neq ";
comps['≤'] = "\\leq ";
comps['≥'] = "\\geq ";
comps['±'] = "\\pm ";
comps['='] = " = ";
for (var i in comps) {
    toLatexOp[i] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 2].op];
        if (lastPrec && lastPrec < prec[op]) {
            stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")" + comps[op];
        } else {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + comps[op];
        }
        lastPrec = prec[stack[stackIndex - 1].op];
        if (lastPrec && lastPrec < prec[op]) {
            stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
        } else {
            stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
        }
        stack[stackIndex - 2].op = op;
        stackIndex--;
        return [stack, stackIndex];
    }
}
var trig = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh'];
for (var i = 0; i < trig.length; i++) {
    toLatexOp[trig[i]] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 1].op];
        if (stack[stackIndex - 1].op == "#") {
            stack[stackIndex - 1].exp = "\\" + op + "{" + stack[stackIndex - 1].exp + "}";
        } else {
            stack[stackIndex - 1].exp = "\\" + op + "(" + stack[stackIndex - 1].exp + ")";
        }
        stack[stackIndex - 1].op = trig[i];
        return [stack, stackIndex];
    }
}
var arctrig = ['arcsin', 'arccos', 'arctan', 'arcsinh', 'arccosh', 'arctanh', 'atan2'];
for (var i = 0; i < arctrig.length; i++) {
    toLatexOp[arctrig[i]] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 1].op];
        if (stack[stackIndex - 1].op == "#") {
            stack[stackIndex - 1].exp = "\\" + op.replace('arc', 'a') + "{" + stack[stackIndex - 1].exp + "}";
        } else {
            stack[stackIndex - 1].exp = "\\" + op.replace('arc', 'a') + "(" + stack[stackIndex - 1].exp + ")";
        }
        stack[stackIndex - 1].op = arctrig[i];
        return [stack, stackIndex];
    }
}
var commafns = ['max', 'min', 'gcd'];
for (var i = 0; i < commafns.length; i++) {
    toLatexOp[commafns[i]] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 1].op];
        if (stack[stackIndex - 1].op == ",") {
            stack[stackIndex - 1].exp = "\\" + op + "(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        } else {
            stack[stackIndex - 1].exp = "\\" + op + "(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        }
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
var roundfns = ['round', 'floor', 'ceil'];
for (var i = 0; i < roundfns.length; i++) {
    toLatexOp[roundfns[i]] = function(stack, stackIndex, op) {
        if (op == "round") {
            if (stack[stackIndex - 1].op == ",") {
                stack[stackIndex - 1].exp = "\\mathrm{" + op + "}(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
            } else {
                stack[stackIndex - 1].exp = "\\mathrm{" + op + "}(" + stack[stackIndex - 1].exp + ")";
            }
        } else {
            stack[stackIndex - 1].exp = "\\l" + op + " " + stack[stackIndex - 1].exp + " \\r" + op;
        }

        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toLatexOp['der'] = function(stack, stackIndex, op) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        stack[stackIndex - 1].exp = "\\frac{\\mathrm{d}}{\\mathrm{d}" + split[1] + "}[" + split[0] + "]";
    } else {
        stack[stackIndex - 1].exp = "\\frac{\\mathrm{d}}{\\mathrm{d}x}[" + stack[stackIndex - 1].exp + "]";
    }
    stack[stackIndex - 1].op = "der";
    return [stack, stackIndex];
}
toLatexOp['int'] = function(stack, stackIndex, op) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 4) {
            stack[stackIndex - 1].exp = "\\int_{" + split[2] + "}^{" + split[3] + "} \\!{" + split[0] + "} \\, \\mathrm{d}{" + split[1] + "}";
        } else if (split.length == 3) {
            stack[stackIndex - 1].exp = "\\int_{" + split[1] + "}^{" + split[2] + "} \\!{" + split[0] + "} \\, \\mathrm{d}x";
        } else if (split.length == 2) {
            stack[stackIndex - 1].exp = "\\int \\!{" + split[0] + "} \\, \\mathrm{d}{" + split[1] + "}";
        } else {
            stack[stackIndex - 1].exp = "\\int \\!{" + stack[stackIndex - 1].exp + "} \\, \\mathrm{d}x";
        }
    } else {
        stack[stackIndex - 1].exp = "\\int \\!{" + stack[stackIndex - 1].exp + "} \\, \\mathrm{d}x";
    }
    stack[stackIndex - 1].op = "int";
    return [stack, stackIndex];
}
var spfns = ['sum', 'prod'];
for (var i = 0; i < spfns.length; i++) {
    toLatexOp[spfns[i]] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 1].op];
        if (stack[stackIndex - 1].op == ",") {
            var split = stack[stackIndex - 1].exp.split(",");
            if (split.length == 3) {
                stack[stackIndex - 1].exp = "\\" + op + "_{" + split[1] + "}^{" + split[2] + "} {" + split[0] + "}";
            } else if (split.length == 2) {
                stack[stackIndex - 1].exp = "\\" + op + "_{" + split[1] + "} {" + split[0] + "}";
            } else {
                stack[stackIndex - 1].exp = "\\" + op + " {" + stack[stackIndex - 1].exp + "}";
            }
        } else {
            stack[stackIndex - 1].exp = "\\" + op + " {" + stack[stackIndex - 1].exp + "}";
        }
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toLatexOp['lim'] = function(stack, stackIndex, op) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 4) {
            if (split[3].length > 0 && split[3].toLowerCase()[0] == "r") {
                stack[stackIndex - 1].exp = "\\lim\\limits_{" + split[1] + "\\to " + split[2] + "^+}{" + split[0] + "}";
            } else if (split[3].length > 0 && split[3].toLowerCase()[0] == "l") {
                stack[stackIndex - 1].exp = "\\lim\\limits_{" + split[1] + "\\to " + split[2] + "^-}{" + split[0] + "}";
            } else {
                stack[stackIndex - 1].exp = "\\lim\\limits_{" + split[1] + "\\to " + split[2] + "}{" + split[0] + "}";
            }

        } else if (split.length == 3) {
            stack[stackIndex - 1].exp = "\\lim\\limits_{" + split[1] + "\\to " + split[2] + "}{" + split[0] + "}";
        } else {
            stack[stackIndex - 1].exp = "\\lim{" + stack[stackIndex - 1].exp + "}";
        }
    } else {
        stack[stackIndex - 1].exp = "\\lim{" + stack[stackIndex - 1].exp + "}";
    }
    stack[stackIndex - 1].op = "lim";
    return [stack, stackIndex];
}

toLatexOp['mod'] = function(stack, stackIndex, op) {
    if (stack[stackIndex - 1].op == ",") {
        stack[stackIndex - 1].exp = "\\mod(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        stack[stackIndex - 1].op = op;
    } else {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "\\mod " + stack[stackIndex - 1].exp;
        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}
toLatexOp['_'] = function(stack, stackIndex, op) {

    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + "_{" + stack[stackIndex - 1].exp + "}";
    stack[stackIndex - 2].op = op;
    stackIndex--;

    return [stack, stackIndex];
}
var onefns = ['random'];
for (var i = 0; i < onefns.length; i++) {
    toLatexOp[onefns[i]] = function(stack, stackIndex, op) {
        stack[stackIndex - 1].exp = "\\mathrm{" + op + "}(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toLatexOp['perm'] = function(stack, stackIndex, op) {
    if (stack[stackIndex - 1].op == ",") {
        stack[stackIndex - 1].exp = "\\mathrm{perm}(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        stack[stackIndex - 1].op = op;
    } else {
        stack[stackIndex - 2].exp = "\\mathrm{perm}(" + stack[stackIndex - 2].exp + ", " + stack[stackIndex - 1].exp + ")";
        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}
toLatexOp['perm'] = function(stack, stackIndex, op) {
    if (stack[stackIndex - 1].op == ",") {
        stack[stackIndex - 1].exp = "\\mathrm{perm}(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        stack[stackIndex - 1].op = op;
    } else {
        stack[stackIndex - 2].exp = "\\mathrm{perm}(" + stack[stackIndex - 2].exp + ", " + stack[stackIndex - 1].exp + ")";
        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}
toLatexOp['comb'] = function(stack, stackIndex, op) {
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {
            stack[stackIndex - 1].exp = "{" + split[0] + "\\choose " + split[1] + "}";
            stack[stackIndex - 1].op = op;
        } else {
            stack[stackIndex - 1].exp = "\\mathrm{comb}(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
            stack[stackIndex - 1].op = op;
        }
    } else {
        stack[stackIndex - 2].exp = "{" + stack[stackIndex - 2].exp + "\\choose " + stack[stackIndex - 1].exp + "}";
        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}



var greekMap = {
    "alpha": ["α", "Α"],
    "beta": ["β", "Β"],
    "gamma": ["γ", "Γ"],
    "delta": ["δ", "Δ"],
    "epsilon": ["ε", "Ε"],
    "zeta": ["ζ", "Ζ"],
    "eta": ["η", "Η"],
    "theta": ["θ", "Θ"],
    "iota": ["ι", "Ι"],
    "kappa": ["κ", "Κ"],
    "lambda": ["λ", "Λ"],
    "mu": ["μ", "Μ"],
    "nu": ["ν", "Ν"],
    "xi": ["ξ", "Ξ"],
    "omicron": ["ο", "Ο"],
    "pi": ["π", "Π"],
    "rho": ["ρ", "Ρ"],
    "sigma": ["σ", "Σ"],
    "tau": ["τ", "Τ"],
    "upsilon": ["υ", "Υ"],
    "phi": ["φ", "Φ"],
    "chi": ["χ", "Χ"],
    "psi": ["ψ", "Ψ"],
    "omega": ["ω", "Ω"]
};

function isLatexGreek(str, type) {
    if (str.length < 3) {
        return false;
    }
    if (type == "end") {
        var split = str.split("\\");
        if (split.length < 2) {
            return false;
        }
        if (greekMap[split[split.length - 1].toLowerCase()]) {
            return true;
        }
    } else if (type == "start") {
        if (str[0] == "\\") {
            var lStr = "";
            var lc = str.toLowerCase();
            for (var i = 1; i < lc.length; i++) {
                if (lc[i] > "z" || lc[i] < "a") {
                    break;
                }
                lStr += lc[i];
            }
            if (greekMap[lStr]) {
                return true;
            }
        }
    }
    return false;
}
var toLatexExp = {};
for (var i in greekMap) {
    toLatexExp[greekMap[i][0]] = "\\" + i;
    var upper = i.substring(0, 1).toUpperCase() + i.substring(1);
    toLatexExp[greekMap[i][1]] = "\\" + upper;
    toLatexExp[i] = "\\" + i;
    toLatexExp[upper] = "\\" + upper;
}

toLatexExp['∞'] = "\\infty";
//toLatexExp['']="";
function toLatex(postfixList) {

    var stack = [];
    var stackIndex = 0;
    var eaIndex = 0;
    for (var i = 0; i < postfixList.length; i++) {
        var c = postfixList[i];
        if (prec[c]) {
            var fn = toLatexOp[c];
            if (fn) {
                var result = fn(stack, stackIndex, c);
                stack = result[0];
                stackIndex = result[1];
            } else {
                var lastPrec = prec[stack[stackIndex - 1].op];
                stack[stackIndex - 1].exp = c + "(" + stack[stackIndex - 1].exp + ")";
                stack[stackIndex - 1].op = c;
            }
        } else if (c[0] == "\\") {
            var fn = toLatexOp[c.substring(1)];
            if (fn) {
                var result = fn(stack, stackIndex, c);
                stack = result[0];
                stackIndex = result[1];
            } else {
                if (c.length > 1 && c[1] == ":") {
                    stack[stackIndex - 1].exp = "\\mathrm{" + c.replace("\\:", "") + "}(" + stack[stackIndex - 1].exp + ")";
                    stack[stackIndex - 1].op = '#';
                } else {
                    if (toLatexExp[c]) {
                        c = toLatexExp[c];
                    }
                    stack[stackIndex] = {
                        "exp": c,
                        "op": '#'
                    };
                    stackIndex++;
                }

            }
        } else {
            if (toLatexExp[c]) {
                c = toLatexExp[c];
            } else if (isNumber(c)) {
                var ddSplit = c.split("..");
                if (ddSplit.length == 2) {
                    c = ddSplit[0] + ".\\overline{" + ddSplit[1] + "}";
                } else {
                    var dSplit = c.split(".");
                    if (dSplit.length == 3) {
                        c = dSplit[0] + "." + dSplit[1] + "\\overline{" + dSplit[2] + "}";
                    }
                }
            }
            stack[stackIndex] = {
                "exp": c,
                "op": '#'
            };
            stackIndex++;
        }
    }
    checkpoints['latex0'] = stack[0].exp;
    return stack[0].exp;
}




var toCodeOp = {};

toCodeOp['~'] = function(stack, stackIndex, op, lang) {
    //negation
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec <= prec['~']) {
        stack[stackIndex - 1].exp = "-1*(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 1].exp = "-1*" + stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 1].op = '~';
    return [stack, stackIndex];
}
toCodeOp['!'] = function(stack, stackIndex, op, lang) {
    //factorial
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['!']) {
        stack[stackIndex - 1].exp = "factorial(" + stack[stackIndex - 1].exp + ")";
    } else {
        //stack[stackIndex-1].exp=stack[stackIndex-1].exp+"!";
        stack[stackIndex - 1].exp = "factorial(" + stack[stackIndex - 1].exp + ")";
    }
    stack[stackIndex - 1].op = '!';
    return [stack, stackIndex];
}
toCodeOp['*'] = function(stack, stackIndex, op, lang) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['*']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ") * ";
    } else {

        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + " * ";

    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['*']) {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '*';
    stackIndex--;
    return [stack, stackIndex];
}
toCodeOp['+'] = function(stack, stackIndex, op, lang) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['+']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ") + ";
    } else {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + " + ";
    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['+']) {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else if (lastPrec && lastPrec == prec['+']) {
        //parentheses are not mathematically necessary here, but were presumably used.
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '+';
    stackIndex--;
    return [stack, stackIndex];
}
toCodeOp['-'] = function(stack, stackIndex, op, lang) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    if (lastPrec && lastPrec < prec['-']) {
        stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ") - ";
    } else {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + " - ";
    }
    lastPrec = prec[stack[stackIndex - 1].op];
    if (lastPrec && lastPrec < prec['-']) {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else if (lastPrec && lastPrec == prec['-'] || stack[stackIndex - 1].op == "~") {
        stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
    } else {
        stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
    }
    stack[stackIndex - 2].op = '-';
    stackIndex--;
    return [stack, stackIndex];
}
toCodeOp['^'] = function(stack, stackIndex, op, lang) {
    var powstr = "Math.pow";
    if (lang == "python") {
        powstr = "math.pow";
    }
    var lastPrec = prec[stack[stackIndex - 2].op];
    stack[stackIndex - 2].exp = powstr + "(" + stack[stackIndex - 2].exp + ", ";
    stack[stackIndex - 2].exp += stack[stackIndex - 1].exp + ")";

    stack[stackIndex - 2].op = '^';
    stackIndex--;
    return [stack, stackIndex];
}
toCodeOp['/'] = function(stack, stackIndex, op, lang) {
    stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")/(" + stack[stackIndex - 1].exp + ")";
    stack[stackIndex - 2].op = '/';
    stackIndex--;
    return [stack, stackIndex];
}
toCodeOp[','] = function(stack, stackIndex, op, lang) {
    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + ", " + stack[stackIndex - 1].exp;
    stack[stackIndex - 2].ops = [stack[stackIndex - 2].op, stack[stackIndex - 1].op];
    stack[stackIndex - 2].op = ',';
    stackIndex--;
    return [stack, stackIndex];
}
toCodeOp['row'] = function(stack, stackIndex, op, lang) {

    stack[stackIndex - 1].exp = "[" + stack[stackIndex - 1].exp + "]";
    stack[stackIndex - 1].op = 'row';
    return [stack, stackIndex];

}
toCodeOp['sqrt'] = function(stack, stackIndex, op, lang) {
    var powstr = "Math";
    if (lang == "python") {
        powstr = "math";
    }


    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == "#") {
        stack[stackIndex - 1].exp = powstr + ".sqrt(" + stack[stackIndex - 1].exp + ")";
    } else if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {
            stack[stackIndex - 1].exp = powstr + ".pow(" + split[1] + ", " + split[0] + ")";
        } else {
            stack[stackIndex - 1].exp = powstr + ".sqrt(" + stack[stackIndex - 1].exp + ")";
        }
    } else {
        stack[stackIndex - 1].exp = powstr + ".sqrt(" + stack[stackIndex - 1].exp + ")";
    }
    stack[stackIndex - 1].op = 'sqrt';
    return [stack, stackIndex];
}
toCodeOp['pow'] = function(stack, stackIndex, op, lang) {
    var powstr = "Math.pow";
    if (lang == "python") {
        powstr = "math.pow";
    }

    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {

            stack[stackIndex - 1].exp = powstr + "(" + split[0] + ", ";

            stack[stackIndex - 1].exp += split[1] + ")";

        } else {
            stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
        }

    } else {
        stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
    }
    stack[stackIndex - 1].op = 'pow';
    delete stack[stackIndex - 1].ops;
    return [stack, stackIndex];
}
var logfns = ['log', 'loglog', 'logloglog'];
for (var i = 0; i < logfns.length; i++) {
    toCodeOp[logfns[i]] = function(stack, stackIndex, op, lang) {
        var powstr = "Math";
        if (lang == "python") {
            powstr = "math";
        }
        var lastPrec = prec[stack[stackIndex - 1].op];

        if (stack[stackIndex - 1].op == "#") {
            var split = stack[stackIndex - 1].exp.split(";");
            if (split.length == 2) {
                if (split[0] == "e") {
                    if (op == "log") {
                        stack[stackIndex - 1].exp = powstr + ".log(" + split[1] + ")";
                    } else if (op == "loglog") {
                        stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + split[1] + "))";
                    } else if (op == "logloglog") {
                        stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + split[1] + ")))";
                    }

                } else {
                    if (lang == "python") {
                        if (op == "log") {
                            stack[stackIndex - 1].exp = powstr + ".log(" + split[1] + ", " + split[0] + ")";
                        } else if (op == "loglog") {
                            stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + split[1] + ", " + split[0] + "), " + split[0] + ")";
                        } else if (op == "logloglog") {
                            stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + split[1] + ", " + split[0] + "), " + split[0] + "), " + split[0] + ")";
                        }
                    } else {
                        if (op == "log") {
                            stack[stackIndex - 1].exp = "(" + powstr + ".log(" + split[1] + ")/" + powstr + ".log(" + split[0] + "))";
                        } else if (op == "loglog") {
                            stack[stackIndex - 1].exp = "(" + powstr + ".log(" + powstr + ".log(" + split[1] + ")/" + powstr + ".log(" + split[0] + "))/" + powstr + ".log(" + split[0] + "))";
                        } else if (op == "logloglog") {
                            stack[stackIndex - 1].exp = "(" + powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + split[1] + ")/" + powstr + ".log(" + split[0] + "))/" + powstr + ".log(" + split[0] + "))/" + powstr + ".log(" + split[0] + "))";
                        }
                    }
                }
            } else {
                if (op == "log") {
                    stack[stackIndex - 1].exp = powstr + ".log(" + stack[stackIndex - 1].exp + ")";
                } else if (op == "loglog") {
                    stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + stack[stackIndex - 1].exp + "))";
                } else if (op == "logloglog") {
                    stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + stack[stackIndex - 1].exp + ")))";
                }
            }
        } else if (stack[stackIndex - 1].op == ",") {
            var split = stack[stackIndex - 1].exp.split(",");
            if (split.length == 2) {
                if (split[0] == "e") {
                    if (op == "log") {
                        stack[stackIndex - 1].exp = powstr + ".log(" + split[1] + ")";
                    } else if (op == "loglog") {
                        stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + split[1] + "))";
                    } else if (op == "logloglog") {
                        stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + split[1] + ")))";
                    }
                } else {
                    if (lang == "python") {
                        if (op == "log") {
                            stack[stackIndex - 1].exp = powstr + ".log(" + split[1] + ", " + split[0] + ")";
                        } else if (op == "loglog") {
                            stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + split[1] + ", " + split[0] + "), " + split[0] + ")";
                        } else if (op == "logloglog") {
                            stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + split[1] + ", " + split[0] + "), " + split[0] + "), " + split[0] + ")";
                        }
                    } else {
                        if (op == "log") {
                            stack[stackIndex - 1].exp = "(" + powstr + ".log(" + split[1] + ")/" + powstr + ".log(" + split[0] + "))";
                        } else if (op == "loglog") {
                            stack[stackIndex - 1].exp = "(" + powstr + ".log(" + powstr + ".log(" + split[1] + ")/" + powstr + ".log(" + split[0] + "))/" + powstr + ".log(" + split[0] + "))";
                        } else if (op == "logloglog") {
                            stack[stackIndex - 1].exp = "(" + powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + split[1] + ")/" + powstr + ".log(" + split[0] + "))/" + powstr + ".log(" + split[0] + "))/" + powstr + ".log(" + split[0] + "))";
                        }
                    }
                }
            } else {
                if (op == "log") {
                    stack[stackIndex - 1].exp = powstr + ".log(" + stack[stackIndex - 1].exp + ")";
                } else if (op == "loglog") {
                    stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + stack[stackIndex - 1].exp + "))";
                } else if (op == "logloglog") {
                    stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + stack[stackIndex - 1].exp + ")))";
                }
            }
        } else {
            if (op == "log") {
                stack[stackIndex - 1].exp = powstr + ".log(" + stack[stackIndex - 1].exp + ")";
            } else if (op == "loglog") {
                stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + stack[stackIndex - 1].exp + "))";
            } else if (op == "logloglog") {
                stack[stackIndex - 1].exp = powstr + ".log(" + powstr + ".log(" + powstr + ".log(" + stack[stackIndex - 1].exp + ")))";
            }
        }
        stack[stackIndex - 1].op = 'log';
        return [stack, stackIndex];
    }
}
var compsCode = {};
compsCode['∈'] = "\\in ";
compsCode['∉'] = "\\notin ";
compsCode['≠'] = " != ";
compsCode['≤'] = " <= ";
compsCode['≥'] = " >= ";
compsCode['±'] = " + ";
compsCode['='] = " == ";
for (var i in compsCode) {
    toCodeOp[i] = function(stack, stackIndex, op, lang) {
        var lastPrec = prec[stack[stackIndex - 2].op];
        if (lastPrec && lastPrec < prec[op]) {
            stack[stackIndex - 2].exp = "(" + stack[stackIndex - 2].exp + ")" + compsCode[op];
        } else {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp + compsCode[op];
        }
        lastPrec = prec[stack[stackIndex - 1].op];
        if (lastPrec && lastPrec < prec[op]) {
            stack[stackIndex - 2].exp += "(" + stack[stackIndex - 1].exp + ")";
        } else {
            stack[stackIndex - 2].exp += stack[stackIndex - 1].exp;
        }
        stack[stackIndex - 2].op = op;
        stackIndex--;
        return [stack, stackIndex];
    }
}
var trig = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh'];
for (var i = 0; i < trig.length; i++) {
    toCodeOp[trig[i]] = function(stack, stackIndex, op, lang) {
        var powstr = "Math.";
        if (lang == "python") {
            powstr = "math.";
        }
        if (op == "sin" || op == "cos" || op == "tan" || op == "sinh" || op == "cosh" || op == "tanh") {
            stack[stackIndex - 1].exp = powstr + op + "(" + stack[stackIndex - 1].exp + ")";
        } else if (op == "csc") {
            stack[stackIndex - 1].exp = "(1/" + powstr + "sin(" + stack[stackIndex - 1].exp + "))";
        } else if (op == "sec") {
            stack[stackIndex - 1].exp = "(1/" + powstr + "cos(" + stack[stackIndex - 1].exp + "))";
        } else if (op == "cot") {
            stack[stackIndex - 1].exp = "(1/" + powstr + "tan(" + stack[stackIndex - 1].exp + "))";
        }
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
var arctrig = ['arcsin', 'arccos', 'arctan', 'arcsinh', 'arccosh', 'arctanh', 'atan2'];
for (var i = 0; i < arctrig.length; i++) {
    toCodeOp[arctrig[i]] = function(stack, stackIndex, op, lang) {
        var rstring = op.substring(3);
        if (op == "atan2") {
            rstring = "tan2";
        }
        var powstr = "Math.a" + rstring;
        if (lang == "python") {
            powstr = "math.a" + rstring;
        }
        stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp + ")";

        stack[stackIndex - 1].op = arctrig[i];
        return [stack, stackIndex];
    }
}
var commafns = ['max', 'min', 'gcd'];
for (var i = 0; i < commafns.length; i++) {
    toCodeOp[commafns[i]] = function(stack, stackIndex, op, lang) {
        var powstr = "";
        if (lang == "python") {
            if (op != "gcd") {
                powstr = op;
            } else {
                powstr = "math.gcd";
            }
        } else {
            if (op != "gcd") {
                powstr = "Math." + op;
            } else {
                powstr = "gcd";
            }
        }
        stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";

        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
var roundfns = ['round', 'floor', 'ceil'];
for (var i = 0; i < roundfns.length; i++) {
    toCodeOp[roundfns[i]] = function(stack, stackIndex, op, lang) {
        var powstr = "Math." + op;
        if (lang == "python") {
            powstr = "math." + op;
            if (op == "round") {
                powstr = "round";
            }
        }
        if (op == "round") {
            if (stack[stackIndex - 1].op == ",") {
                stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";
            } else {
                stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp + ")";
            }
        } else {
            stack[stackIndex - 1].exp = powstr + "(" + stack[stackIndex - 1].exp + ")";
        }

        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toCodeOp['der'] = function(stack, stackIndex, op, lang) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        stack[stackIndex - 1].exp = "derivative(" + split[0] + "," + split[1] + ")";
    } else {
        stack[stackIndex - 1].exp = "derivative(" + stack[stackIndex - 1].exp + ")";
    }
    stack[stackIndex - 1].op = "der";
    return [stack, stackIndex];
}
toCodeOp['int'] = function(stack, stackIndex, op, lang) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    if (stack[stackIndex - 1].op == ",") {
        stack[stackIndex - 1].exp = "integral(" + stack[stackIndex - 1].exp + ")";

    } else {
        stack[stackIndex - 1].exp = "integral(" + stack[stackIndex - 1].exp + ", 'x')";
    }
    stack[stackIndex - 1].op = "int";
    return [stack, stackIndex];
}
var spfns = ['sum', 'prod'];
for (var i = 0; i < spfns.length; i++) {
    toCodeOp[spfns[i]] = function(stack, stackIndex, op, lang) {

        stack[stackIndex - 1].exp = op + "(" + stack[stackIndex - 1].exp + ")";

        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toCodeOp['lim'] = function(stack, stackIndex, op, lang) {
    stack[stackIndex - 1].exp = "limit(" + stack[stackIndex - 1].exp + ")";

    stack[stackIndex - 1].op = "lim";
    return [stack, stackIndex];
}

toCodeOp['mod'] = function(stack, stackIndex, op, lang) {
    /*var powstr = "math.fmod";
    if (lang == "python"){
    	powstr = "math.fmod";
    }*/
    if (stack[stackIndex - 1].op == ",") {
        stack[stackIndex - 1].exp = "((" + stack[stackIndex - 1].exp.replace(/,/g, ") % (") + "))";
        stack[stackIndex - 1].op = op;
    } else {
        stack[stackIndex - 2].exp = "((" + stack[stackIndex - 2].exp + ") % (" + stack[stackIndex - 1].exp + "))";
        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}
toCodeOp['perm'] = function(stack, stackIndex, op, lang) {
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {
            var n = split[0];
            var r = split[1];
            stack[stackIndex - 1].exp = "(factorial(" + n + ")/factorial((" + n + ")-(" + r + ")))";

        } else {
            stack[stackIndex - 1].exp = "permutation(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";

        }
        stack[stackIndex - 1].op = op;
    } else {
        var n = stack[stackIndex - 2].exp;
        var r = stack[stackIndex - 1].exp;
        stack[stackIndex - 2].exp = "(factorial(" + n + ")/factorial((" + n + ")-(" + r + ")))";

        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}
toCodeOp['comb'] = function(stack, stackIndex, op, lang) {
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.split(",");
        if (split.length == 2) {
            var n = split[0];
            var r = split[1];
            stack[stackIndex - 1].exp = "(factorial(" + n + ")/factorial((" + n + ")-(" + r + "))/factorial(" + r + "))";

        } else {
            stack[stackIndex - 1].exp = "combination(" + stack[stackIndex - 1].exp.replace(/,/g, ", ") + ")";

        }
        stack[stackIndex - 1].op = op;
    } else {
        var n = stack[stackIndex - 2].exp;
        var r = stack[stackIndex - 1].exp;
        stack[stackIndex - 2].exp = "(factorial(" + n + ")/factorial((" + n + ")-(" + r + "))/factorial(" + r + "))";

        stack[stackIndex - 2].op = op;
        stackIndex--;
    }
    return [stack, stackIndex];
}
toCodeOp['random'] = function(stack, stackIndex, op) {
    var powstr = "Math.random()";
    if (lang == "python") {
        powstr = "random.random()";
    }
    stack[stackIndex - 1].exp = powstr;
    stack[stackIndex - 1].op = op;
    return [stack, stackIndex];
}



var greekMap = {
    "alpha": ["α", "Α"],
    "beta": ["β", "Β"],
    "gamma": ["γ", "Γ"],
    "delta": ["δ", "Δ"],
    "epsilon": ["ε", "Ε"],
    "zeta": ["ζ", "Ζ"],
    "eta": ["η", "Η"],
    "theta": ["θ", "Θ"],
    "iota": ["ι", "Ι"],
    "kappa": ["κ", "Κ"],
    "lambda": ["λ", "Λ"],
    "mu": ["μ", "Μ"],
    "nu": ["ν", "Ν"],
    "xi": ["ξ", "Ξ"],
    "omicron": ["ο", "Ο"],
    "pi": ["π", "Π"],
    "rho": ["ρ", "Ρ"],
    "sigma": ["σ", "Σ"],
    "tau": ["τ", "Τ"],
    "upsilon": ["υ", "Υ"],
    "phi": ["φ", "Φ"],
    "chi": ["χ", "Χ"],
    "psi": ["ψ", "Ψ"],
    "omega": ["ω", "Ω"]
};

var toCodeExp = {};
for (var i in greekMap) {
    toCodeExp[greekMap[i][0]] = i;
    var upper = i.substring(0, 1).toUpperCase() + i.substring(1);
    toCodeExp[greekMap[i][1]] = upper;
    toCodeExp[i] = i;
    toCodeExp[upper] = upper;
}

toCodeExp['∞'] = "infinity";

//toCodeExp['']="";
function toCode(postfixList, lang) {

    var stack = [];
    var stackIndex = 0;
    var eaIndex = 0;
    if (lang == "python") {
        toCodeExp['e'] = "math.e";
        toCodeExp['pi'] = "math.pi";
        toCodeExp['π'] = "math.pi";
        toCodeExp['tau'] = "math.tau";
        toCodeExp['τ'] = "math.tau";
        toCodeExp['∞'] = "math.inf";
    } else {
        toCodeExp['e'] = "Math.E";
        toCodeExp['pi'] = "Math.PI";
        toCodeExp['π'] = "Math.PI";
        toCodeExp['tau'] = "(2*Math.PI)";
        toCodeExp['τ'] = "(2*Math.PI)";
        toCodeExp['∞'] = "infinity";
    }
    for (var i = 0; i < postfixList.length; i++) {
        var c = postfixList[i];
        if (prec[c]) {
            var fn = toCodeOp[c];
            if (fn) {
                var result = fn(stack, stackIndex, c, lang);
                stack = result[0];
                stackIndex = result[1];
            } else {
                var lastPrec = prec[stack[stackIndex - 1].op];
                stack[stackIndex - 1].exp = c + "(" + stack[stackIndex - 1].exp + ")";
                stack[stackIndex - 1].op = c;
            }
        } else if (c[0] == "\\") {
            var fn = toCodeOp[c.substring(1)];
            if (fn) {
                var result = fn(stack, stackIndex, c, lang);
                stack = result[0];
                stackIndex = result[1];
            } else {
                if (c.length > 1 && c[1] == ":") {
                    stack[stackIndex - 1].exp = "\\mathrm{" + c.replace("\\:", "") + "}(" + stack[stackIndex - 1].exp + ")";
                    stack[stackIndex - 1].op = '#';
                } else {
                    if (toCodeExp[c]) {
                        c = toCodeExp[c];
                    }
                    stack[stackIndex] = {
                        "exp": c,
                        "op": '#'
                    };
                    stackIndex++;
                }

            }
        } else {
            if (toCodeExp[c]) {
                c = toCodeExp[c];
            } else if (isNumber(c)) {

            }
            stack[stackIndex] = {
                "exp": c,
                "op": '#'
            };
            stackIndex++;
        }
    }
    checkpoints[lang + '0'] = stack[0].exp;
    return stack[0].exp;
}






var toCanonicalOp = {};

toCanonicalOp['~'] = function(stack, stackIndex) {
    //negation
    if (stack[stackIndex - 1].exp[stack[stackIndex - 1].exp.length - 1] == "0") {

    } else {
        stack[stackIndex - 1].exp.push("~");
    }
    stack[stackIndex - 1].op = '~';
    return [stack, stackIndex];
}
toCanonicalOp['!'] = function(stack, stackIndex) {
    //factorial
    stack[stackIndex - 1].exp.push("!");
    stack[stackIndex - 1].op = '!';
    return [stack, stackIndex];
}
toCanonicalOp['*'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    var firstFactor = stack[stackIndex - 2].exp;
    var secondFactor = stack[stackIndex - 1].exp;
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0") {
            stack[stackIndex - 2].exp = ["0"];
            stack[stackIndex - 2].op = "#";
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "0") {
            stack[stackIndex - 2].exp = ["0"];
            stack[stackIndex - 2].op = "#";
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "-1") {
            if (secondFactor.length == 1 && secondFactor[0].length > 0 && secondFactor[0][0] != "-") {
                stack[stackIndex - 2].exp = ["-" + secondFactor[0]];
                stack[stackIndex - 2].op = stack[stackIndex - 1].op;
                stackIndex--;
                return [stack, stackIndex];
            }
        } else if (firstFactor[0] == "1") {
            stack[stackIndex - 2].exp = stack[stackIndex - 1].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 1].op;
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "-1") {
            if (firstFactor.length == 1 && firstFactor[0].length > 0 && firstFactor[0][0] != "-") {
                stack[stackIndex - 2].exp = ["-" + firstFactor[0]];
                stack[stackIndex - 2].op = stack[stackIndex - 2].op;
                stackIndex--;
                return [stack, stackIndex];
            }
        } else if (secondFactor[0] == "1") {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 2].op;
            stackIndex--;
            return [stack, stackIndex];
        } else if (isNumber(secondFactor[0]) && (firstFactor.length != 1 || !isNumber(firstFactor[0]))) {
            stack[stackIndex - 2].exp = stack[stackIndex - 1].exp.slice().concat(stack[stackIndex - 2].exp.slice());
            stack[stackIndex - 2].exp.push("*");
            stack[stackIndex - 2].op = "*";
            stackIndex--;
            return [stack, stackIndex];
        }
    }


    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice().concat(stack[stackIndex - 1].exp.slice());
    stack[stackIndex - 2].exp.push("*");
    stack[stackIndex - 2].op = "*";
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['+'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    var firstFactor = stack[stackIndex - 2].exp;
    var secondFactor = stack[stackIndex - 1].exp;

    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0") {
            stack[stackIndex - 2].exp = stack[stackIndex - 1].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 1].op;
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "0") {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 2].op;
            stackIndex--;
            return [stack, stackIndex];
        }
    }


    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice().concat(stack[stackIndex - 1].exp.slice());
    stack[stackIndex - 2].exp.push("+");
    stack[stackIndex - 2].op = "+";
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['-'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    var firstFactor = stack[stackIndex - 2].exp;
    var secondFactor = stack[stackIndex - 1].exp;

    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0") {
            stack[stackIndex - 2].exp = stack[stackIndex - 1].exp.slice();
            stack[stackIndex - 2].exp.push("~");
            stack[stackIndex - 2].op = "~";
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "0") {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 2].op;
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    var isMatch = true;
    if (firstFactor.length == secondFactor.length) {
        for (var i = 0; i < firstFactor.length; i++) {
            if (firstFactor[i] != secondFactor[i]) {
                isMatch = false;
                break;
            }
        }
    } else {
        isMatch = false;
    }
    if (isMatch) {
        stack[stackIndex - 2].exp = ["0"];
        stack[stackIndex - 2].op = "#";
        stackIndex--;
        return [stack, stackIndex];
    }

    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice().concat(stack[stackIndex - 1].exp.slice());
    stack[stackIndex - 2].exp.push("-");
    stack[stackIndex - 2].op = "-";
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['^'] = function(stack, stackIndex) {
    var lastPrec = prec[stack[stackIndex - 2].op];
    var firstFactor = stack[stackIndex - 2].exp;
    var secondFactor = stack[stackIndex - 1].exp;
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0") {
            if (secondFactor.length == 1 && secondFactor[0] == "0") {
                stack[stackIndex - 2].exp = ["0", "0", "^"];
                stack[stackIndex - 2].op = "^";
                stackIndex--;
                return [stack, stackIndex];
            }
            stack[stackIndex - 2].exp = ["0"];
            stack[stackIndex - 2].op = "#";
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "0") {
            stack[stackIndex - 2].exp = ["1"];
            stack[stackIndex - 2].op = "#";
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "1") {
            stack[stackIndex - 2].exp = ["1"];
            stack[stackIndex - 2].op = "#";
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "1") {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 2].op;
            stackIndex--;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 3) {
        if (secondFactor[0] == "1" && secondFactor[1] == "2" && secondFactor[2] == "/") {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice();
            stack[stackIndex - 2].exp.push("sqrt");
            stack[stackIndex - 2].op = "sqrt";
            stackIndex--;
            return [stack, stackIndex];
        }
    }


    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice().concat(stack[stackIndex - 1].exp.slice());
    stack[stackIndex - 2].exp.push("^");
    stack[stackIndex - 2].op = "^";
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['/'] = function(stack, stackIndex) {
    var firstFactor = stack[stackIndex - 2].exp;
    var secondFactor = stack[stackIndex - 1].exp;
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0") {
            if (secondFactor.length == 1 && secondFactor[0] == "0") {
                stack[stackIndex - 2].exp = ["0", "0", "/"];
                stack[stackIndex - 2].op = "/";
                stackIndex--;
                return [stack, stackIndex];
            }
            stack[stackIndex - 2].exp = ["0"];
            stack[stackIndex - 2].op = "#";
            stackIndex--;
            return [stack, stackIndex];
        }
    }

    if (secondFactor.length == 1) {
        if (secondFactor[0] == "1") {
            stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice();
            stack[stackIndex - 2].op = stack[stackIndex - 2].op;
            stackIndex--;
            return [stack, stackIndex];
        }
    }

    var isMatch = true;
    if (firstFactor.length == secondFactor.length) {
        for (var i = 0; i < firstFactor.length; i++) {
            if (firstFactor[i] != secondFactor[i]) {
                isMatch = false;
                break;
            }
        }
    } else {
        isMatch = false;
    }
    if (isMatch) {
        stack[stackIndex - 2].exp = ["1"];
        stack[stackIndex - 2].op = "#";
        stackIndex--;
        return [stack, stackIndex];
    }

    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice().concat(stack[stackIndex - 1].exp.slice());
    stack[stackIndex - 2].exp.push("/");
    stack[stackIndex - 2].op = "/";
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp[','] = function(stack, stackIndex) {
    stack[stackIndex - 2].exp = [stack[stackIndex - 2].exp.slice(), stack[stackIndex - 1].exp.slice(), ","];
    stack[stackIndex - 2].op = ',';
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['row'] = function(stack, stackIndex) {
    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.concat(stack[stackIndex - 1].exp);
    stack[stackIndex - 2].exp.push("row");
    stack[stackIndex - 2].op = 'row';
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['sqrt'] = function(stack, stackIndex, op) {
    var lastPrec = prec[stack[stackIndex - 1].op];
    var firstFactor = stack[stackIndex - 1].exp;
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0" || firstFactor[0] == "1") {

            stack[stackIndex - 1].exp = [firstFactor[0]];
            stack[stackIndex - 1].op = "#";
            return [stack, stackIndex];
        } else if (firstFactor[0] == "-1") {
            stack[stackIndex - 1].exp = ["i"];
            stack[stackIndex - 1].op = "#";
            return [stack, stackIndex];
        }
    }
    stack[stackIndex - 1].exp.push("sqrt");
    stack[stackIndex - 1].op = "sqrt";
    return [stack, stackIndex];
}
toCanonicalOp['pow'] = function(stack, stackIndex, op) {
    var firstFactor = "";
    var secondFactor = "";
    if (stack[stackIndex - 1].op == ",") {
        var split = stack[stackIndex - 1].exp.slice(stack[stackIndex - 1].exp.length - 3, stack[stackIndex - 1].exp.length - 1);
        if (split.length == 2) {
            firstFactor = split[0];
            secondFactor = split[1];

        } else {
            stack[stackIndex - 1].exp.push("pow");
            stack[stackIndex - 1].op = "pow";
            return [stack, stackIndex];
        }

    } else {
        stack[stackIndex - 1].exp.push("pow");
        stack[stackIndex - 1].op = "pow";
        return [stack, stackIndex];
    }

    if (firstFactor.length == 1) {
        if (firstFactor[0] == "0") {
            if (secondFactor.length == 1 && secondFactor[0] == "0") {
                stack[stackIndex - 1].exp = ["0", "0", "^"];
                stack[stackIndex - 1].op = "^";
                return [stack, stackIndex];
            }
            stack[stackIndex - 1].exp = ["0"];
            stack[stackIndex - 1].op = "#";
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "0") {
            stack[stackIndex - 1].exp = ["1"];
            stack[stackIndex - 1].op = "#";
            return [stack, stackIndex];
        }
    }
    if (firstFactor.length == 1) {
        if (firstFactor[0] == "1") {
            stack[stackIndex - 1].exp = ["1"];
            stack[stackIndex - 1].op = "#";
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 1) {
        if (secondFactor[0] == "1") {
            stack[stackIndex - 1].exp = firstFactor.slice();
            stack[stackIndex - 1].op = stack[stackIndex - 1].op;
            return [stack, stackIndex];
        }
    }
    if (secondFactor.length == 3) {
        if (secondFactor[0] == "1" && secondFactor[1] == "2" && secondFactor[2] == "/") {
            stack[stackIndex - 1].exp = firstFactor.slice();
            stack[stackIndex - 1].exp.push("sqrt");
            stack[stackIndex - 1].op = "sqrt";
            return [stack, stackIndex];
        }
    }


    stack[stackIndex - 1].exp = firstFactor.slice().concat(secondFactor.slice());
    stack[stackIndex - 1].exp.push("^");
    stack[stackIndex - 1].op = "^";
    return [stack, stackIndex];
}
var logfns = ['log', 'loglog', 'logloglog'];
for (var i = 0; i < logfns.length; i++) {
    toCanonicalOp[logfns[i]] = function(stack, stackIndex, op) {
        var lastPrec = prec[stack[stackIndex - 1].op];
        var firstFactor = stack[stackIndex - 2].exp;
        var secondFactor = stack[stackIndex - 1].exp;

        if (op == "log" || op == "ln") {
            if (secondFactor.length == 1) {
                if (secondFactor[0] == "1") {
                    stack[stackIndex - 2].exp = ["0"];
                    stack[stackIndex - 2].op = "#";
                    stackIndex--;
                    return [stack, stackIndex];
                } else if (secondFactor[0] == firstFactor) {
                    stack[stackIndex - 2].exp = ["1"];
                    stack[stackIndex - 2].op = "#";
                    stackIndex--;
                    return [stack, stackIndex];
                }
            }
        }
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.slice().concat(stack[stackIndex - 1].exp.slice());
        stack[stackIndex - 2].exp.push(op);
        stack[stackIndex - 2].op = op;
        stackIndex--;
        return [stack, stackIndex];
    }
}
var comps = {};
comps['∈'] = "\\in ";
comps['∉'] = "\\notin ";
comps['≠'] = "\\neq ";
comps['≤'] = "\\leq ";
comps['≥'] = "\\geq ";
comps['±'] = "\\pm ";
comps['='] = " = ";
for (var i in comps) {
    toCanonicalOp[i] = function(stack, stackIndex, op) {
        stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.concat(stack[stackIndex - 1].exp);
        stack[stackIndex - 2].exp.push(op);
        stack[stackIndex - 2].op = op;
        stackIndex--;
        return [stack, stackIndex];
    }
}
var trig = ['sin', 'cos', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh'];
for (var i = 0; i < trig.length; i++) {
    toCanonicalOp[trig[i]] = function(stack, stackIndex, op) {
        stack[stackIndex - 1].exp.push(trig[i]);
        stack[stackIndex - 1].op = trig[i];
        return [stack, stackIndex];
    }
}
var arctrig = ['arcsin', 'arccos', 'arctan', 'arcsinh', 'arccosh', 'arctanh', 'atan2'];
for (var i = 0; i < arctrig.length; i++) {
    toCanonicalOp[arctrig[i]] = function(stack, stackIndex, op) {
        stack[stackIndex - 1].exp.push(arctrig[i]);
        stack[stackIndex - 1].op = arctrig[i];
        return [stack, stackIndex];
    }
}
var commafns = ['max', 'min', 'gcd'];
for (var i = 0; i < commafns.length; i++) {
    toCanonicalOp[commafns[i]] = function(stack, stackIndex, op) {
        stack[stackIndex - 1].exp.push(op);
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
var roundfns = ['round', 'floor', 'ceil', 'random'];
for (var i = 0; i < roundfns.length; i++) {
    toCanonicalOp[roundfns[i]] = function(stack, stackIndex, op) {
        stack[stackIndex - 1].exp.push(op);
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toCanonicalOp['der'] = function(stack, stackIndex, op) {
    stack[stackIndex - 1].exp.push("der");
    stack[stackIndex - 1].op = "der";
    return [stack, stackIndex];
}
toCanonicalOp['int'] = function(stack, stackIndex, op) {
    stack[stackIndex - 1].exp.push("int");
    stack[stackIndex - 1].op = "int";
    return [stack, stackIndex];
}
var spfns = ['sum', 'prod'];
for (var i = 0; i < spfns.length; i++) {
    toCanonicalOp[spfns[i]] = function(stack, stackIndex, op) {
        stack[stackIndex - 1].exp.push(op);
        stack[stackIndex - 1].op = op;
        return [stack, stackIndex];
    }
}
toCanonicalOp['lim'] = function(stack, stackIndex, op) {
    stack[stackIndex - 1].exp.push("lim");
    stack[stackIndex - 1].op = "lim";
    return [stack, stackIndex];
}

toCanonicalOp['mod'] = function(stack, stackIndex, op) {
    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.concat(stack[stackIndex - 1].exp);
    stack[stackIndex - 2].exp.push("mod");
    stack[stackIndex - 2].op = 'mod';
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['perm'] = function(stack, stackIndex, op) {
    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.concat(stack[stackIndex - 1].exp);
    stack[stackIndex - 2].exp.push(op);
    stack[stackIndex - 2].op = op;
    stackIndex--;
    return [stack, stackIndex];
}
toCanonicalOp['comb'] = function(stack, stackIndex, op) {
    stack[stackIndex - 2].exp = stack[stackIndex - 2].exp.concat(stack[stackIndex - 1].exp);
    stack[stackIndex - 2].exp.push(op);
    stack[stackIndex - 2].op = op;
    stackIndex--;
    return [stack, stackIndex];
}








function runSubstring(postfixList, mapOp) {
    var stack = [];
    var stackIndex = 0;
    for (var i = 0; i < postfixList.length; i++) {
        var c = postfixList[i];
        if (prec[c]) {
            var fn = mapOp[c];
            if (fn) {
                var result = fn(stack, stackIndex, c);
                stack = result[0];
                stackIndex = result[1];
            } else {
                stack[stackIndex - 1].exp.push(c);
                stack[stackIndex - 1].op = c;
            }
        } else if (c[0] == "\\") {
            var fn = mapOp[c.substring(1)];
            if (fn) {
                var result = fn(stack, stackIndex, c);
                stack = result[0];
                stackIndex = result[1];
            } else {
                if (c.length > 1 && c[1] == ":") {
                    stack[stackIndex - 1].exp.push(c.replace("\\:", ""));
                    stack[stackIndex - 1].op = '#';
                } else {

                    stack[stackIndex] = {
                        "exp": [c],
                        "op": '#'
                    };
                    stackIndex++;
                }

            }
        } else {

            stack[stackIndex] = {
                "exp": [c],
                "op": '#'
            };
            stackIndex++;
        }
    }
    return stack[0].exp;
}

function toModify(postfixList) {

    var stack = [];
    var stackIndex = 0;
    var pfout = [];
    var runagain = false;
    for (var i = 0; i < postfixList.length; i++) {
        var c = postfixList[i];
        if (c == "#clean") {
            var substring = [];
            var skipthis = false;
            for (var ii = i + 1; ii < postfixList.length; ii++) {
                if (postfixList[ii] == "/clean") {
                    break;
                } else if (postfixList[ii] == "#clean") {
                    pfout.push(c);
                    skipthis = true;
                    runagain = true;
                    break;
                } else {
                    substring.push(postfixList[ii]);
                }
            }
            if (skipthis) {
                continue;
            }
            var sub = runSubstring(substring, toCanonicalOp);
            pfout = pfout.concat(sub);
            i += substring.length + 1;
        } else {
            pfout.push(c);
        }
    }

    if (runagain) {
        pfout = toModify(pfout);
    }
    checkpoints['modify0'] = pfout;
    return pfout;
}





