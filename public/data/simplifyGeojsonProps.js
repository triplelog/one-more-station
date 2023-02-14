//ogr2ogr -f GeoJSON countries-110.json ne_110m_admin_0_countries_lakes/ne_110m_admin_0_countries_lakes.shp
//ogr2ogr -f GeoJSON lakes.json ne_10m_lakes/ne_10m_lakes.shp
//ogr2ogr -f GeoJSON rivers.json ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines.shp
//afterwards, upload to mapshaper.org and use precision=0.01 and simplify to 80%, oceans 90%, lakes 66.7%
const fs = require('fs');

var path = process.argv[2]+".json";
var pathOut = process.argv[2]+"-simple.json";

//var path = "./ne_10m_populated_places_simple/cities.geojson";
//var pathOut = "./ne_10m_populated_places_simple/citiesVS.geojson";

//var keeps = ['scalerank','labelrank','name','pop_min','pop_max','adm0_a3','ne_id'];
//var keeps = ['scalerank','name','pop_min','pop_max','adm0_a3','ne_id','adm1name'];
//var keeps = ['NAME','ADM0_A3','NE_ID'];//countries
//var keeps = ['name','adm1_code','ne_id'];//states and lakes
var keeps = ['name','rivernum','scalerank','ne_id'];//rivers

var gj = fs.readFileSync(path, {encoding: 'utf8'});
var gjson = JSON.parse(gj);


//fs.writeFileSync(pathOut, JSON.stringify(simplified));
//console.log(soto)
var cityCount = 0;
var cityRanks = {};
if (gjson.features){
	for (var i=gjson.features.length-1;i>=0;i--){
		var props = gjson.features[i].properties;
        if (props.NAME == "Antarctica"){
            gjson.features.splice(i,1);
            continue;
        }
        if (process.argv[2] == "rivers" && (props.featurecla != "River" || parseFloat(props.scalerank) > 7.5 )){
            gjson.features.splice(i,1);
            continue;
        }
		//if (i == gjson.features.length-1){console.log(JSON.stringify(props))}
		var newProps = {};
		for (var j=0;j<keeps.length;j++){
			//only keep some properties
			newProps[keeps[j]]=props[keeps[j]];
		}
		
		gjson.features[i].properties = {};
		for (var j=0;j<keeps.length;j++){
			gjson.features[i].properties[keeps[j]]=newProps[keeps[j]];
		}

		cityCount++;
	}
}
else {
	for (var i=gjson.geometries.length-1;i>=0;i--){
		if (gjson.geometries[i].type == "Polygon"){
			for (var ii=0;ii<gjson.geometries[i].coordinates[0].length;ii++){
				gjson.geometries[i].coordinates[0][ii][0] = Math.round(gjson.geometries[i].coordinates[0][ii][0]*10000)/10000;
				gjson.geometries[i].coordinates[0][ii][1] = Math.round(gjson.geometries[i].coordinates[0][ii][1]*10000)/10000;
			}
		}

		cityCount++;
	}
}
console.log("Number of countries: ", cityCount)
fs.writeFileSync(pathOut, JSON.stringify(gjson));