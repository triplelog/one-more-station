//ogr2ogr -f GeoJSON countries-110.json ne_110m_admin_0_countries_lakes/ne_110m_admin_0_countries_lakes.shp

const fs = require('fs');
//const turf = require('@turf/turf');

var path = process.argv[2]+".json";
var pathOut = process.argv[2]+"-simple.json";

//var path = "./ne_10m_populated_places_simple/cities.geojson";
//var pathOut = "./ne_10m_populated_places_simple/citiesVS.geojson";

//var keeps = ['scalerank','labelrank','name','pop_min','pop_max','adm0_a3','ne_id'];
var keeps = ['NAME','ADM0_A3','NE_ID'];

var gj = fs.readFileSync(path, {encoding: 'utf8'});
var gjson = JSON.parse(gj);

//tolerance of 0.06 for countries, 0.2 for ocean
var options = {tolerance: parseFloat(process.argv[3]), highQuality: true};
gjson = turf.simplify(gjson, options);
//fs.writeFileSync(pathOut, JSON.stringify(simplified));
//console.log(soto)
var cityCount = 0;
var cityRanks = {};
if (gjson.features){
	for (var i=gjson.features.length-1;i>=0;i--){
		var props = gjson.features[i].properties;
		//if (i == gjson.features.length-1){console.log(JSON.stringify(props))}
		var newProps = {};
		for (var j=0;j<keeps.length;j++){
			//only keep some properties
			newProps[keeps[j]]=props[keeps[j]];
		}
		//simplify lat/lng coordinates and round pops to 1000s
		if (gjson.features[i].geometry.type == "Polygon"){
			for (var ii=0;ii<gjson.features[i].geometry.coordinates[0].length;ii++){
				gjson.features[i].geometry.coordinates[0][ii][0] = Math.round(gjson.features[i].geometry.coordinates[0][ii][0]*1000)/1000;
				gjson.features[i].geometry.coordinates[0][ii][1] = Math.round(gjson.features[i].geometry.coordinates[0][ii][1]*1000)/1000;
			}
		}
		else if (gjson.features[i].geometry.type == "MultiPolygon"){
			for (var ii=0;ii<gjson.features[i].geometry.coordinates.length;ii++){
				for (var j=0;j<gjson.features[i].geometry.coordinates[ii].length;j++){
					for (var iii=0;iii<gjson.features[i].geometry.coordinates[ii][j].length;iii++){
						gjson.features[i].geometry.coordinates[ii][j][iii][0] = Math.round(gjson.features[i].geometry.coordinates[ii][j][iii][0]*1000)/1000;
						gjson.features[i].geometry.coordinates[ii][j][iii][1] = Math.round(gjson.features[i].geometry.coordinates[ii][j][iii][1]*1000)/1000;
					}
				}
			}
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