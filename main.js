import './style.css';

import {Map, View} from 'ol';
import {Style, Fill, Stroke, Text, Circle} from 'ol/style';
import TileLayer from 'ol/layer/Tile';
import {VectorImage as VectorImageLayer, Vector as VectorLayer, Image} from 'ol/layer.js';
import {Vector, ImageStatic, VectorTile} from 'ol/source.js';
import VectorSource from 'ol/source/Vector.js';
import {Projection, get as getProj} from 'ol/proj.js';
//import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';

import Feature from 'ol/Feature.js';
import {Geometry, GeometryCollection, LineString, Point} from 'ol/geom.js';
import {Control, defaults as defaultControls} from 'ol/control';
import Draw from 'ol/interaction/Draw.js';
import XYZ from 'ol/source/XYZ';
import {transformExtent} from 'ol/proj.js';
import {transform} from 'ol/proj';
import TopoJSON from 'ol/format/TopoJSON';
import haversine from 'haversine';
//import crypto from 'crypto';
//import simplifySvgPath from './paper-simplify.js';
import crypto from 'crypto';




window.saveMap = function(){
  var str = TrainMap.savePaths();
  window.localStorage.setItem('drawnPaths',str);

}
window.loadMap = function(){
  var drawnPaths = window.localStorage.getItem('drawnPaths');
  if (drawnPaths){
    TrainMap.loadPaths(drawnPaths);
  }
}





function transformE(extent) {
  return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
}

const extents = {
  USA: transformE([-130, 25, -60, 50]),
};



function addTracksBridge(newTracks,uid,pathIdxs,bridges){
  TrainMap.tempTracks[uid]={nt:newTracks,pi:pathIdxs,bridges:bridges.slice()};
  console.log(newTracks);
}
function chgStartEnd(){
  var start = document.querySelector('input[name=startStation]:checked').value;
  var end = document.querySelector('input[name=endStation]:checked').value;
  var id = document.querySelector('input[name=endStation]:checked').getAttribute('data-id');
  console.log(start,end,id);
  var cost = 0;
  TrainMap.tempTracks[id].astart = start;
  TrainMap.tempTracks[id].aend = end;
  for (var i=0;i<TrainMap.tempTracks[id].nt.length;i++){
    if (i >= start && i < end){
      cost += TrainMap.tempTracks[id].nt[i].d*Train.settings.trackCost;
    }
  }
  for (var i=0;i<TrainMap.tempTracks[id].bridges.length;i++){
    cost += Train.toBridgeCost({'distance':TrainMap.tempTracks[id].bridges[i]});
  }
  if (cost > Train.finances.money){
    document.getElementById('modalBuyTrack').classList.add('disabled');
  }
  else {
    document.getElementById('modalBuyTrack').classList.remove('disabled');
  }
  document.getElementById('trackCost').textContent = outputNumber(cost,'dollars');
}
function buyTracks(feat){
  var cost = 0;
  if (!feat || !feat.ol_uid){
    return;
  }
  var id = feat.ol_uid;
  if (!TrainMap.tempTracks[id]){
    drawSource.removeFeature(feat);
    return;
  }
  var el = document.getElementById('pendingStations');
  el.innerHTML = "";
  for (var i=0;i<TrainMap.tempTracks[id].nt.length;i++){
    cost += TrainMap.tempTracks[id].nt[i].d*Train.settings.trackCost;
    if (i == 0){
      var div = document.createElement('div');
      var radio1 = document.createElement('input');
      radio1.setAttribute('type','radio');
      radio1.setAttribute('name','startStation');
      radio1.setAttribute('value',0);
      radio1.checked = true;
      radio1.addEventListener('change',chgStartEnd);
      div.appendChild(radio1);
      var radio2 = document.createElement('input');
      radio2.setAttribute('type','radio');
      radio2.setAttribute('name','endStation');
      radio2.setAttribute('value',0);
      radio2.setAttribute('disabled','true');
      radio2.addEventListener('change',chgStartEnd);
      div.appendChild(radio2);
      el.appendChild(div);
      var span = document.createElement('span');
      span.textContent = Train.stations[TrainMap.tempTracks[id].nt[i].a].name;
      div.appendChild(span);
    }
    var div = document.createElement('div');
    var radio1 = document.createElement('input');
    radio1.setAttribute('type','radio');
    radio1.setAttribute('name','startStation');
    radio1.setAttribute('value',i+1);
    radio1.addEventListener('change',chgStartEnd);
    div.appendChild(radio1);
    var radio2 = document.createElement('input');
    radio2.setAttribute('type','radio');
    radio2.setAttribute('name','endStation');
    radio2.setAttribute('value',i+1);
    radio2.setAttribute('data-id',id);
    radio2.addEventListener('change',chgStartEnd);
    if (i == TrainMap.tempTracks[id].nt.length - 1){
      radio1.setAttribute('disabled','true');
      radio2.checked = true;
    }
    else {
      radio2.checked = false;
    }
    div.appendChild(radio2);
    el.appendChild(div);
    var span = document.createElement('span');
    span.textContent = Train.stations[TrainMap.tempTracks[id].nt[i].b].name;
    div.appendChild(span);
  }
  for (var i=0;i<TrainMap.tempTracks[id].bridges.length;i++){
    cost += Train.toBridgeCost({'distance':TrainMap.tempTracks[id].bridges[i]});
  }
  if (TrainMap.tempTracks[id].nt.length < 1){
    drawSource.removeFeature(feat);
    return;
  }
  document.getElementById('trackCost').textContent = outputNumber(cost,'dollars');
  if (cost > Train.finances.money){
    document.getElementById('modalBuyTrack').classList.add('disabled');
  }
  else {
    document.getElementById('modalBuyTrack').classList.remove('disabled');
  }
  TrainMap.tempTracks[id].astart = 0;
  TrainMap.tempTracks[id].aend = TrainMap.tempTracks[id].nt.length;
  TrainMap.activeTrack = id;
  TrainMap.activeFeat = feat;
  TrainMap.pathIdxs= TrainMap.tempTracks[id].pi;
  feat.setStyle(activeTrackStyle);
  
  MicroModal.show('modal-buy');
  return;
  
}
function infoTracks(feat){
  var cost = 0;
  if (!feat || !feat.ol_uid){
    return;
  }
  var id = feat.ol_uid;
  
  var el = document.getElementById('trackStations');
  el.innerHTML = "";
  for (var i=0;i<TrainMap.tempTracks[id].nt.length;i++){
    
    if (i == 0){
      var div = document.createElement('div');
      div.textContent = Train.stations[TrainMap.tempTracks[id].nt[i].a].name;
      el.appendChild(div);
    }
    var div = document.createElement('div');
    div.textContent = Train.stations[TrainMap.tempTracks[id].nt[i].b].name;
    el.appendChild(div);
  }
  
  MicroModal.show('modal-trackInfo');
  return;
  
}




const drawSource = new Vector({wrapX: false});


class SwitchModeControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = 'Draw';

    const element = document.createElement('div');
    element.className = 'draw-mode-btn ol-unselectable ol-control';
    
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.switchMode.bind(this), false);
    button.style.width = "3.25rem";
    button.style.color = "black";
    button.style.background = "#EEE";
    button.style.cursor = "pointer";
  }

  switchMode(event) {
    var btn = event.currentTarget;
    
    if (this.currentMode == 'None') {
      this.currentMode = 'LineString';
      btn.style.background = "#F88";
      this.rawCoords = [];
      this.newCoords = [];
      citySource.forEachFeature(function (feature) {
        feature.set('type','city');
      })
      lakeSource.forEachFeature(function (feature) {
        feature.set('type','water');
      })
      draw = new Draw({
        source: drawSource,
        type: 'LineString',
        freehand: true,
        geometryFunction: function(coords, geom) {
          this.rawCoords = [];
          for (var i=0;i<coords.length;i++){
            this.rawCoords.push([coords[i][0]*25,coords[i][1]*25]);
          }
          /*var segments = simplifySvgPath(this.rawCoords,{tolerance:1});
          TrainMap.newCoords = [];
          for (var i=0;i<segments.length;i++){
            for (var j=0;j<segments[i].length;j++){
              TrainMap.newCoords.push([segments[i][j].x/25,segments[i][j].y/25]);
            }
          }*/
          if (!geom) {
              geom = new LineString(coords);
          }
          TrainMap.newCoords =coords;
          geom.setCoordinates(coords);
          //console.log(segments);
          return geom;
        }
      });
      
      draw.on('drawstart', function(event) {
        TrainMap.bridges = [];
        TrainMap.deleteMode = false;
        TrainMap.drawMode = true;
        TrainMap.overWater = false;
        TrainMap.lastStation = false;
      })
      draw.on('drawend', function(event) {
        TrainMap.drawMode = false;
        endPath(event.feature.ol_uid,TrainMap.bridges,event.feature);
        TrainMap.lastStation = false;
        TrainMap.overWater = false;
      })
      draw.on('drawabort', function(event) {
        TrainMap.drawMode = false;
        TrainMap.lastStation = false;
        if (TrainMap.overWater == "bad"){
          alert('This route requires a bridge that is more than 20 km. Draw a new route.');
          TrainMap.overWater = false;
        }
        
        TrainMap.overWater = false;
      })
      this.getMap().addInteraction(draw);
      TrainMap.isDraw = true;
      labelStyle[0].getImage().setOpacity(1);
      labelStyle[1].getImage().setOpacity(1);
      labelStyle[2].getImage().setOpacity(1);
      namedLayer.changed();
    }
    else {
      this.currentMode = 'None';
      this.getMap().removeInteraction(draw);
      btn.style.background = "#EEE";
      TrainMap.isDraw = false;
      labelStyle[0].getImage().setRadius(0);
      labelStyle[0].getImage().setOpacity(0);
      labelStyle[1].getImage().setRadius(0);
      labelStyle[1].getImage().setOpacity(0);
      labelStyle[2].getImage().setRadius(0);
      labelStyle[2].getImage().setOpacity(0);
      namedLayer.changed();
    }
  }
  currentMode = 'None';
}

let draw = false; // global so we can remove it later

var countryStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(255,255,255,0.5)',
    width: 3
  }),
  fill: new Fill({
    color: 'rgba(230, 255, 230, 0.0)'
  })
});
var stateStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(255,255,255,0.3)',
    width: 2
  }),
  fill: new Fill({
    color: 'rgba(230, 255, 230, 0.0)'
  })
});
var oceanStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0,0,0,0)',
    width: 0
  }),
  fill: new Fill({
    color: 'rgba(200, 200, 255, 0.25)'
  })
});
var lakeStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0,0,255,0.2)',
    width: 1
  }),
  fill: new Fill({
    color: 'rgba(100, 100, 255, 0.4)'
  })
});
var riverStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0,0,255,0.2)',
    width: 2
  })
});

const largeText = new Text({
  font: '12px Calibri,sans-serif',
  fill: new Fill({
    color: '#000'
  }),
  stroke: new Stroke({
    color: '#fdd',
    width: 4
  })
});
const smallText = new Text({
  font: '10px Calibri,sans-serif',
  fill: new Fill({
    color: '#222'
  }),
  stroke: new Stroke({
    color: '#666',
    width: 1
  })
});
const stationCircle1 = new Circle({
  radius: 20,
  fill: new Fill({color: 'rgba(0,170,0,1.0)'})
});
const stationCircle2 = new Circle({
  radius: 15,
  fill: new Fill({color: 'rgba(120,220,120,1.0)'})
});
const stationCircle3 = new Circle({
  radius: 10,
  fill: new Fill({color: 'rgba(255,255,255,1.0)'})
});

var labelStyle = [new Style({
  image: stationCircle1
}), new Style({
  image: stationCircle2
}), new Style({
  image: stationCircle3
}), new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: largeText
})];
labelStyle[0].getImage().setRadius(0);
labelStyle[0].getImage().setOpacity(0);
labelStyle[1].getImage().setRadius(0);
labelStyle[1].getImage().setOpacity(0);
labelStyle[2].getImage().setRadius(0);
labelStyle[2].getImage().setOpacity(0);

const can = document.createElement('canvas');
const ctx = can.getContext('2d');
can.width = 1;
can.height = 1;


var dotStyle = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({color: 'rgba(0,0,0,0.5)'}),
    stroke: null
  })
});
var trainDotStyle = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({color: 'rgba(0,0,0,0)'}),
    opacity: 0.75,
    //stroke: new Stroke({color: 'rgba(0,255,0,1)', width: 5}),
    stroke: new Stroke({color: 'rgba(50,50,50,0.75)', width: 2}),
    //stroke: null,
  })
});
var personDotStyle = new Style({
  image: new Circle({
    radius: 20,
    fill: new Fill({color: 'rgba(0,0,0,0)'}),
    opacity: 0.75,
    //stroke: new Stroke({color: 'rgba(0,255,0,1)', width: 5}),
    stroke: new Stroke({color: 'rgba(50,50,50,0.75)', width: 4}),
    //stroke: null,
  }),
  text: new Text({
    text: "😀",
    font: '20px Calibri,sans-serif'

  })
});


var trackStyle = new Style({
  fill: 'none',
  stroke: new Stroke({
    color: '#900',
    width: 4
  })
});

var trainStyleBase = new Style({
  fill: 'none',
  stroke: new Stroke({
    color: '#900',
    width: 12,
    lineDash: [3,12],
    lineCap: 'butt',
    lineJoin: 'miter'
  })
});


var otherTrackStyle = new Style({
  fill: 'none',
  stroke: new Stroke({
    color: 'rgba(100,100,100,0.5)',
    width: 4
  })
});
/*
var trackStyle = new Style({
  fill: 'none',
  stroke: new Stroke({
    color: '#900',
    width: 8,
    lineDash: [2,10],
    lineCap: "butt"
  })
});*/
var activeTrackStyle = new Style({
  fill: 'none',
  stroke: new Stroke({
    color: '#00B',
    width: 12,
    lineCap: "butt"
  })
});
var pendingTrackStyle = new Style({
  fill: 'none',
  stroke: new Stroke({
    color: '#000',
    width: 12,
    lineCap: "butt"
  })
});


const citySource = new Vector({
  url: './data/cities.json',
  format: new GeoJSON(),
});
const lakeSource = new Vector({
  url: './data/lakes-simple.json',
  format: new TopoJSON()
});

var namedLayer = new VectorImageLayer({
  properties: {name: 'cities'},
  source: citySource,
  style: function(feature, resolution) {
    var name = feature.get('name');
    var scalerank = Math.pow(parseFloat(feature.get('scalerank')),0.25);
    var nextrank1 = parseFloat(feature.get('nextrank')[0]);
    var nextrank4 = parseFloat(feature.get('nextrank')[1]);
    var pop = feature.get('pop');
    var popC = feature.get('popC');
    var zoom = 0.8*Math.pow(2.25,scalerank);
    var zoomLevel = TrainMap.getView().getZoomForResolution(resolution);
    //console.log(resolution,zoomLevel);
    //var zoom = Math.pow(2.2,parseFloat(feature.get('scalerank')));
    if (resolution < xz[0][0] / zoom && resolution < nextrank1 * xz[0][1] && resolution < nextrank4 * xz[0][2]){
      labelStyle[3].setText(largeText);
      labelStyle[3].getText().setText(name);
      
      if (TrainMap.isDraw){
        labelStyle[0].getImage().setRadius(zoomToRadius(zoomLevel)+popToWidth(pop,zoomLevel));
        labelStyle[1].getImage().setRadius(zoomToRadius(zoomLevel)+popToWidth(popC,zoomLevel));
        labelStyle[2].getImage().setRadius(zoomToRadius(zoomLevel));
        //stationStroke.setWidth(popToWidth(pop));
        //labelStyle[0].getImage().setStroke(stationStroke);
      }
      return labelStyle;
    }
    else if (resolution < xz[1][0] / zoom && resolution < nextrank1 * xz[1][1] && resolution < nextrank4 * xz[1][2]){
      labelStyle[3].setText(smallText);
      labelStyle[3].getText().setText(name);
      
      if (TrainMap.isDraw){
        labelStyle[0].getImage().setRadius(zoomToRadius(zoomLevel)+popToWidth(pop,zoomLevel));
        labelStyle[1].getImage().setRadius(zoomToRadius(zoomLevel)+popToWidth(popC,zoomLevel));
        labelStyle[2].getImage().setRadius(zoomToRadius(zoomLevel));
        //stationStroke.setWidth(popToWidth(pop));
        //labelSmallStyle.getImage().setStroke(stationStroke);
      }
      return labelStyle;
    }
    else if (resolution < xz[2][0] / zoom && resolution < nextrank1 * xz[2][1] && resolution < nextrank4 * xz[2][2]){
      if (TrainMap.isDraw){
        labelStyle[3].setText(smallText);
        labelStyle[3].getText().setText(name);
        labelStyle[0].getImage().setRadius(zoomToRadius(zoomLevel)+popToWidth(pop,zoomLevel));
        labelStyle[1].getImage().setRadius(zoomToRadius(zoomLevel)+popToWidth(popC,zoomLevel));
        labelStyle[2].getImage().setRadius(zoomToRadius(zoomLevel));
        //stationStroke.setWidth(popToWidth(pop));
        //labelSmallStyle.getImage().setStroke(stationStroke);
        return labelStyle;
      }
      else {
        return dotStyle;
      }
      
    }
    else {
      labelStyle[3].getText().setText("");
      //return dotStyle;
    }
    
  },
  minZoom: 3
})

const trainSource = new VectorSource({
  features: [],
});
const personSource = new VectorSource({
  features: [],
});
const lineSource = new VectorSource({
  features: [],
});
const xyzSource = new XYZ({
  attributions: '',
  minZoom: 0,
  maxZoom: 5,
  url: 'https://triplelog.b-cdn.net/tiles/{z}/{x}/{y}.svg',
  tileSize: [2048, 2048],
  preload: 1,

});


var oneView = new View({
  projection: 'EPSG:3857',
  smoothResolutionConstraint:true,
  center: transform([0, 10], 'EPSG:4326', 'EPSG:3857'),
  zoom: 2,
  extent: transformE([-180, -60, 180, 75]),
  preload: 1
});
var ovProj = getProj('EPSG:4326');
window.TrainMap = new Map({
  controls: defaultControls().extend([new SwitchModeControl()]),
  target: 'map',
  layers: [
    new TileLayer({
      title: 'BG',
      opacity: 1,
      extent: [-20037508.342789, -20037508.342789,20037508.342789, 20037508.342789],
      source: xyzSource
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/ocean-simple.json',
        format: new TopoJSON()
      }),
      minZoom: 3,
      style: oceanStyle,
      properties: {name: 'water'}
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/states-simple.json',
        format: new TopoJSON()        
      }),
      minZoom: 3,
      style: stateStyle
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/countries-simple.json',
        format: new TopoJSON()
      }),
      style: countryStyle
    }),
    new VectorImageLayer({
      source: lakeSource,
      minZoom: 3,
      style: lakeStyle,
      properties: {name: 'water'}
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/rivers-simple.json',
        format: new TopoJSON()
      }),
      minZoom: 3,
      properties: {name: 'water'},
      style: function(feature, resolution) {
        var scale = feature.get('scalerank');
        riverStyle.getStroke().setWidth(500 / Math.pow(resolution,0.66) / Math.log(scale+1));
        return riverStyle;
      }
    }),
    namedLayer,
    new VectorLayer({
      source: drawSource,
      style: pendingTrackStyle,
      properties: {name: 'track'}
    }),
    new VectorLayer({
      source: lineSource,
      style: function(feature,resolution) {
        const div = Math.log(1000)/Math.log(resolution)
        trainStyleBase.getStroke().setLineDash([3*div,12*div]);
        trainStyleBase.getStroke().setColor(feature.get('color'));
        return trainStyleBase;
      },
      properties: {name: 'line'}
    }),
    new VectorLayer({
      source: trainSource,
      style: function(feature,resolution) {
        var r = 5;
        if (feature.get('max')){
          r = Math.sqrt(parseFloat(feature.get('max')))/2;
        }
        var img = trainDotStyle.getImage();
        img.setRadius(r);
        img.setOpacity(0.75);
        var a = Math.sqrt(parseFloat(feature.get('pct')));
        var b = 0;
        if (feature.get('pctSpecial')){
          b = Math.sqrt(parseFloat(feature.get('pctSpecial')));
        }
        //img.getFill().setColor('rgba(0,255,0,'+a+')');
        //var grad= ctx.createLinearGradient(0, -1, 0, 1);
        var grad= ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, 'white');
        grad.addColorStop(b, 'white');
        grad.addColorStop(b, feature.get('color'));
        grad.addColorStop(a, feature.get('color'));
        grad.addColorStop(a, "transparent");
        grad.addColorStop(1, "transparent");
        img.getFill().setColor(grad);
        //img.getStroke().setWidth(r*a)
        return trainDotStyle;
      },
      properties: {name: 'train'}
    }),
    new VectorLayer({
      source: personSource,
      style: personDotStyle,
      properties: {name: 'person'}
    })

  ],
  view: oneView
});
var dataTilesLoaded = {};
var magicNumber = 20037508.3427892;
xyzSource.on('tileloadstart', () => {
  if (oneView.getZoom() > 5.5){
    var extent = oneView.calculateExtent(TrainMap.getSize());
    var tileX1 = Math.floor((extent[0]+magicNumber)/(2*magicNumber)*4);
    var tileX2 = Math.floor((extent[2]+magicNumber)/(2*magicNumber)*4);
    var tileY1 = 3-Math.floor((extent[1]+magicNumber)/(2*magicNumber)*4);
    var tileY2 = 3-Math.floor((extent[3]+magicNumber)/(2*magicNumber)*4);
    for (var i=tileX1;i<tileX2+1;i++){
      for (var j=tileY1;j<tileY2+1;j++){
        if (!dataTilesLoaded[i+"-"+j]){
          console.log(i,j);
          dataTilesLoaded[i+"-"+j]=true;
          var xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              var features = JSON.parse(this.responseText);
              //console.log(features);
              var olFeatures = [];
              if (!TrainMap.cityMap){
                createCityMap();
              }
              for (var k=0;k<features.length;k++){
                if (TrainMap.cityMap[features[k].properties['ne_id']]){
                  continue;
                }
                var geom = new Point( transform(features[k].geometry.coordinates, 'EPSG:4326', 'EPSG:3857'));
                var thejson = {geometry: geom};
                for (var m in features[k].properties){
                  thejson[m]=features[k].properties[m];
                }
                var newFeature = new Feature(thejson);
                olFeatures.push(newFeature);
              }
              if (olFeatures.length > 0){
                citySource.addFeatures(olFeatures);
                createCityMap();
              }
            }
          };
          xhttp.open("GET", "https://triplelog.b-cdn.net/cityTiles/cities-"+i+"-"+j+".json", true);
          xhttp.send();
        }
      }
    }
    console.log(oneView.getZoom(),tileX1,tileX2,tileY1,tileY2)
  }
  

})


TrainMap.drawMode = false;
TrainMap.deleteMode = false;
TrainMap.lastStation = false;
TrainMap.tempTracks = {};
TrainMap.activeTrack = false;
TrainMap.overWater = false;
TrainMap.isDraw = false;
TrainMap.trackRoutes = {};
TrainMap.cityMap = false;

TrainMap.savePaths = function(){
  var f = drawSource.getFeatures();
  var coordMap = {};
  for (var i=0;i<f.length;i++){
    if (f[i].get('bought')){
      var g = f[i].getGeometry();
      var coords = g.flatCoordinates;
      coordMap[f[i].ol_uid]={coords:coords,owner:f[i].get('owner')};
    }
  }
  var saved = {};
  saved.coordMap = coordMap;
  saved.trackRoutes = {};
  for (var i in TrainMap.trackRoutes){
    saved.trackRoutes[i] = TrainMap.trackRoutes[i].getCoordinates();
  }
  saved.lines = {};
  for (var i in TrainMap.lines){
    saved.lines[i] = TrainMap.lines[i].getGeometry().getCoordinates();
  }
  console.log(saved.lines);
  var str = JSON.stringify(saved);
  return str;

}
TrainMap.loadPaths = function(str){
  var saved = JSON.parse(str);
  TrainMap.trackRoutes = {};
  for (var i in saved.trackRoutes){
    TrainMap.trackRoutes[i] = new LineString(saved.trackRoutes[i]);
  }
  TrainMap.lines = {};
  lineSource.clear();
  for (var i in saved.lines){
    if (!Train.lines[i]){
      continue;
    }
    var geom = new LineString(saved.lines[i]);
    console.log(geom);
    var thejson = {geometry: geom, name:'line'};
    var newFeature = new Feature(thejson);
    newFeature.set('color',Train.lines[i].color);
    lineSource.addFeature(newFeature);
    TrainMap.lines[i] = newFeature;
    if (Train.lines[i].animate){
      TrainMap.animatedLines[i]=true;
    }
  }
  var j = saved.coordMap;

  for (var i in j){
    var coords = [];
    for (var k=0;k<j[i].coords.length;k+=2){
      coords.push([j[i].coords[k],j[i].coords[k+1]]);
    }
    const feature = new Feature({});
    var ls = new LineString(coords);
    feature.setGeometry(ls);
    feature.set('bought',true);
    if (j[i].owner == Train.owner){
      feature.setStyle(trackStyle);
    }
    else {
      feature.setStyle(otherTrackStyle);
    }
    feature.set('owner',j[i].owner);
    
    drawSource.addFeature(feature);
  }
  
}
function createCityMap(){
  TrainMap.cityMap = {};
  citySource.forEachFeature((feature) => {
    var coords = feature.getGeometry().getCoordinates();
    TrainMap.cityMap[feature.get('ne_id')]={'feature':feature,'coords':coords,'minD':Infinity,'minIdx':0,'minPoint':{x:0,y:0},'lat':0};
  })
}
TrainMap.updateStations = function(fs){
  //get pops of all stations based on whats in use
}
TrainMap.updateTracks = function(type){
  if (!TrainMap.activeTrack){
    return;
  }
  var id = TrainMap.activeTrack;
  if (type == 'delete'){
    delete TrainMap.tempTracks[id];
    drawSource.removeFeature(TrainMap.activeFeat);
    //delete the feature
    return;
  }
  if (type != 'buy'){
    return;
  }
  if (TrainMap.tempTracks[id].astart && TrainMap.tempTracks[id].astart >= TrainMap.tempTracks[id].aend){
    return;
  }
  var fullCoords = TrainMap.activeFeat.getGeometry().getCoordinates();
  var newTracks = TrainMap.tempTracks[id].nt;
  var minIdx = Infinity;
  var maxIdx = -Infinity;
  console.log(newTracks)
  console.log(TrainMap.tempTracks[id].astart,TrainMap.tempTracks[id].aend)
  for (var i=0;i<newTracks.length;i++){
    if (TrainMap.tempTracks[id].astart && i < TrainMap.tempTracks[id].astart){
      continue;
    }
    if (TrainMap.tempTracks[id].aend && i >= TrainMap.tempTracks[id].aend){
      continue;
    }
    var rid = Train.createTrack(newTracks[i].a,newTracks[i].b,newTracks[i].d,id);
    var geom = new LineString(fullCoords.slice(newTracks[i].idxs[0],newTracks[i].idxs[1]+1));
    if (newTracks[i].idxs[0] < minIdx){minIdx = newTracks[i].idxs[0]}
    if (newTracks[i].idxs[1]+1 > maxIdx){maxIdx = newTracks[i].idxs[1]+1}
    TrainMap.trackRoutes[rid] = geom;
    console.log(i,minIdx,maxIdx,newTracks[i].idxs[0],newTracks[i].idxs[1])
  }
  for (var i=0;i<TrainMap.tempTracks[id].bridges.length;i++){
    Train.createBridge(TrainMap.tempTracks[id].bridges[i]);
  }
  var newCoords = fullCoords.slice(minIdx,maxIdx);
  TrainMap.activeFeat.getGeometry().setCoordinates(newCoords);
  
  
  TrainMap.activeFeat.setStyle(trackStyle);
  TrainMap.activeFeat.set('owner',Train.owner);
  TrainMap.activeFeat.set('bought',true);
  
  //feats[i].setStyle(trackStyle);
  TrainMap.activeTrack = false;
  
  Train.calculateNetworks();
  updateDashboard();
  saveMap();
}

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
function pointOnSegment(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return v;
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
}


function getStationsOnTrack(coords){
  console.log(coords);
  var maxDistance = 25*1000;
  //create box
  var box = {'l':Infinity,'r':-Infinity,'b':Infinity,'t':-Infinity};
  for (var i=0, len=coords.length;i<len;i++){
    if (coords[i][0] < box.l){
      box.l = coords[i][0];
    }
    if (coords[i][0] > box.r){
      box.r = coords[i][0];
    }
    if (coords[i][1] < box.b){
      box.b = coords[i][1];
    }
    if (coords[i][1] > box.t){
      box.t = coords[i][1];
    }
  }
  console.log(box);
  var minLat = Math.min(Math.abs(transform([box.l,box.b],'EPSG:3857', 'EPSG:4326')[1]),Math.abs(transform([box.l,box.t],'EPSG:3857', 'EPSG:4326')[1]));

  var maxLatDistance = maxDistance*Math.cos(minLat*Math.PI/180);
  console.log(maxLatDistance);
  //get city coords

  if (!TrainMap.cityMap){
    createCityMap();
  }
  var cityMap = [];
  for (var j in TrainMap.cityMap){
    var coords2 = TrainMap.cityMap[j].coords;
    if (coords2[0] < box.r + maxLatDistance && coords2[0] > box.l - maxLatDistance){
      if (coords2[1] < box.t + maxLatDistance && coords2[1] > box.b - maxLatDistance){
        cityMap.push({'feature':TrainMap.cityMap[j].feature,'coords':coords2,'minD':maxDistance*10+1000,'minIdx':0,'minPoint':{x:0,y:0},'lat':0});
      }
    }
  }
  console.log(cityMap);
  for (var i=1, len=coords.length;i<len;i++){
    var v = {x:coords[i-1][0],y:coords[i-1][1]};
    var w = {x:coords[i][0],y:coords[i][1]};
    for (var j=0;j<cityMap.length;j++){
      var p = {x:cityMap[j].coords[0],y:cityMap[j].coords[1]};
      var d = distToSegment(p, v, w);
      console.log(d);
      if (d < maxLatDistance){
        var lat = transform(cityMap[j].coords,'EPSG:3857', 'EPSG:4326')[1];
        var betterD = d*Math.cos(lat*Math.PI/180);
        console.log(betterD);
        if (betterD < cityMap[j].minD && betterD < maxDistance){
          cityMap[j].minD = betterD;
          cityMap[j].minIdx = i;
          cityMap[j].minPoint = pointOnSegment(p, v, w);
          cityMap[j].lat = lat;
        }
      }
    }
  }
  var trackStations = [];
  for (var j=0;j<cityMap.length;j++){
    if (cityMap[j].minD < maxDistance){
      
      var pointBefore = coords[cityMap[j].minIdx-1];
      var pointAfter = coords[cityMap[j].minIdx];
      var dBefore = Math.pow(cityMap[j].minPoint.x-pointBefore[0],2)+Math.pow(cityMap[j].minPoint.y-pointBefore[1],2);
      dBefore = Math.sqrt(dBefore)*Math.cos(cityMap[j].lat*Math.PI/180);
      var dAfter = Math.pow(cityMap[j].minPoint.x-pointAfter[0],2)+Math.pow(cityMap[j].minPoint.y-pointAfter[1],2);
      dAfter = Math.sqrt(dAfter)*Math.cos(cityMap[j].lat*Math.PI/180);
      cityMap[j].dBefore = dBefore/1000;
      cityMap[j].dAfter = dAfter/1000;
      console.log(cityMap[j]);
      trackStations.push(cityMap[j]);
    }
  }
  trackStations.sort((a,b) => {return a.minIdx - b.minIdx});
  console.log(JSON.stringify(coords));
  for (var i=trackStations.length-1;i>=0;i--){
    var minPoint = trackStations[i].minPoint;
    var minCoords = [minPoint.x,minPoint.y];
    coords.splice(trackStations[i].minIdx,0,minCoords);
    for(var j=i+1;j<trackStations.length;j++){
      trackStations[j].minIdx++;
    }
  }
  console.log(JSON.stringify(coords));
  return {stations:trackStations,coords:coords};

}

TrainMap.on('pointermove', function (evt) {
  if (!TrainMap.drawMode){return;}
  var isWater = false;
  var feats = TrainMap.getFeaturesAtPixel(evt.pixel, {
    layerFilter: function(layer){
      if (layer.get('name')){
        if (layer.get('name') == 'water'){
          return true;
        }
        else {
          return false;
        }
      }
      return false;
    }
  });
  if (feats){
    for (var i=0;i<feats.length;i++){
      var ne_id = feats[i].get('ne_id');
      if (feats[i].get('type') == "water"){
        //over water
        isWater = true;
        if (!TrainMap.overWater){
          TrainMap.overWater = [TrainMap.getCoordinateFromPixel(evt.pixel),TrainMap.getCoordinateFromPixel(evt.pixel)];
        }
        else {
          TrainMap.overWater[1] = TrainMap.getCoordinateFromPixel(evt.pixel);
        }

      }
    }
  }
  if (!isWater && TrainMap.overWater){
    var llcoords = [[],[]];
    llcoords[0] = transform(TrainMap.overWater[0],'EPSG:3857', 'EPSG:4326');
    llcoords[1] = transform(TrainMap.overWater[1],'EPSG:3857', 'EPSG:4326');
    var d = haversine({latitude:llcoords[0][1],longitude:llcoords[0][0]},{latitude:llcoords[1][1],longitude:llcoords[1][0]});
    
    if (d > 20){
      TrainMap.overWater = "bad";
      draw.abortDrawing();
      
      return;
    }
    else if (d > 0.5){
      TrainMap.bridges.push(d);
    }
  }
  if (!isWater){
    TrainMap.overWater = false;
  }
});
TrainMap.on('click', function (evt) {
  if (TrainMap.drawMode){return;}
  var feats = TrainMap.getFeaturesAtPixel(evt.pixel, {
    layerFilter: function(layer){
      if (layer.get('name') && layer.get('name') == 'track'){
        return true;
      }
      return false;
    }
  });
  if (feats){
    for (var i=0;i<feats.length;i++){
      if (feats[i].get('bought')){
        //alert('already owned');
        infoTracks(feats[i]);
      }
      else {
        buyTracks(feats[i]);
      }
      
      
      break;
    }
  }
});

function endPath(uid,bridges,feature){
  //if (path.length < 2){
  //  return;
  //}
  var simplified = feature.getGeometry().simplify(2500);
  var coords = simplified.getCoordinates();
  
  var ret = getStationsOnTrack(coords);
  var stations = ret.stations;
  feature.getGeometry().setCoordinates(ret.coords);
  coords = ret.coords;

  console.log(stations);
  if (stations.length < 2){
    return;
  }
  var newTracks = [];
  var pathIdxs = [];
  
  
  for (var i=0;i<stations.length;i++){
    pathIdxs.push(stations[i].minIdx);
    var llcenter = transform(stations[i].coords,'EPSG:3857', 'EPSG:4326')
    Train.createStation(stations[i].feature.get('ne_id'),stations[i].feature.get('name'),stations[i].feature.get('pop'),stations[i].feature.get('popC'),llcenter,stations[i].feature.get('gdp')*1000);
  }
  var llcoords = [];
  for (var i=0;i<coords.length;i++){
    llcoords.push(transform(coords[i],'EPSG:3857', 'EPSG:4326'));
  }
  var dIdxs = [0];
  var totalLength = 0;
  for (var i=1;i<Math.min(pathIdxs[pathIdxs.length-1]+1,llcoords.length);i++){
    
    var d = haversine({latitude:llcoords[i-1][1],longitude:llcoords[i-1][0]},{latitude:llcoords[i][1],longitude:llcoords[i][0]});
    if (i < pathIdxs[0]){
      d = 0;
    }
    else if (i == pathIdxs[0]){
      //d = stations[0].dAfter;
      d = 0;
    }
    
    totalLength += d;
    dIdxs.push(totalLength);
  }


  for (var i=0;i<stations.length-1;i++){
    //console.log(path[i].pts[0]);
    var id1 = stations[i].feature.get('ne_id');
    var id2 = stations[i+1].feature.get('ne_id');

    var d = dIdxs[pathIdxs[i+1]-1]-dIdxs[pathIdxs[i]];
    d += stations[i].dAfter;
    d += stations[i+1].dBefore;
    if (pathIdxs[i+1] == pathIdxs[i]){
      d = Math.abs(stations[i+1].dAfter-stations[i].dAfter);
    }
    var track = {a:id1,b:id2,d:d,idxs:[pathIdxs[i],pathIdxs[i+1]]};
    newTracks.push(track);
  }
  addTracksBridge(newTracks,uid,pathIdxs,bridges);
  //console.log(TrainMap.lastStation);
}

TrainMap.lines = {};
TrainMap.animatedLines = {};
TrainMap.trackFeatures = {};//map of array of geometry collections
TrainMap.preppedLines = {};
TrainMap.people = {};
TrainMap.animationSPD = Infinity;

TrainMap.prepPerson = function(pid,end,fly=false,newPerson=false) {
  while (newPerson && TrainMap.people[pid]){
    pid += "1";
  }
  if (!TrainMap.people[pid]){
    TrainMap.people[pid]={};
    var geom = new Point([0,0]);
    var thejson = {geometry: geom, name:'person'};
    TrainMap.people[pid].j = j;
    TrainMap.people[pid].feature = new Feature(thejson);
    personSource.addFeature(TrainMap.people[pid].feature);
  }

  var start = TrainMap.people[pid].end;
  if (!start){
    start = 1159150519;//nashville
  }
  
  if (!end){
    //start = 1159150519;//1159151489 for atlanta, 1159146259 for birmingham, 1159150519 for nashville, 1159151573 for DC
    end = 1159151573;
  }
  TrainMap.people[pid].start = start;
  TrainMap.people[pid].end = end;
  var results = Train.shortestOverall(start,end);
  if (!results || results.d == Infinity || fly){
    TrainMap.people[pid].end = end;
    TrainMap.people[pid].start = end;
    var coords = [0,0];
    citySource.forEachFeature((feature) => {
      if (feature.get('ne_id') == end){
        coords = feature.getGeometry().getCoordinates();
      }
    })
    console.log(coords);
    var point = new Point(coords);
    TrainMap.people[pid].feature.setGeometry(point);
    delete TrainMap.people[pid].directions;
    delete TrainMap.people[pid].next;
    delete TrainMap.people[pid].nextIdx;
    delete TrainMap.people[pid].j;
    updateJourney();
    return;
  }
  var directions = [];
  var lastLine = -1;
  var lastDirection = -1;
  for (var i=0;i<results.newTracks.length;i++){
    var line = Train.tracks[results.newTracks[i]].l;
    
    var lastStation = results.path[i];
    if (!Train.lineTotals[line].stationData[lastStation]){continue;}
    var direction = 1;
    for (var j=i+1;j<results.path.length;j++){
      if (Train.lineTotals[line].stationData[results.path[j]]){
        if (Train.lineTotals[line].stationData[results.path[j]].t > Train.lineTotals[line].stationData[lastStation].t){
          direction = 1;
        }
        else {
          direction = -1;
        }
        break;
      }
    }
    if (line != lastLine && i > 0){
      directions.push([lastLine,lastDirection,lastStation,0,0]);
    }
    directions.push([line,direction,lastStation,0,0]);
    lastLine = line;
    lastDirection = direction;
  }
  directions.push([lastLine,lastDirection,results.path[results.path.length-1],0,0]);
  directions[0][3]= Date.now();
  TrainMap.people[pid].directions = directions;
  TrainMap.people[pid].next = directions[0];
  TrainMap.people[pid].nextIdx = 0;
  console.log(directions);
  TrainMap.people[pid].j = -1;
  TrainMap.people[pid].startWait = Date.now();
  updateJourney();
  

}

TrainMap.prepAnimationOne = function(lineID,animate=true) {
  if (animate){
    TrainMap.animatedLines[lineID]=true;
  }
  else {
    delete TrainMap.animatedLines[lineID];
  }
  Train.calculateNetworks();
  TrainMap.prepAnimation();

}

TrainMap.prepAnimation = function() {
  
  TrainMap.preppedLines = {};
  TrainMap.trackFeatures = {};
  trainSource.clear();
  if (TrainMap.animationSPD == Infinity){
    clearInterval(TrainMap.animateInterval);
    return;
  }
  for (var lineID in TrainMap.animatedLines){
    if (!Train.lineTotals[lineID]){
      delete TrainMap.lines[lineID];
      continue;
    }
    var stationData = Train.lineTotals[lineID].stationData;
    var maxT = 0;
    var maxD = 0;
    var orderedStations = [];
    for (var i in stationData){
      if (stationData[i].t > maxT){
        maxT = stationData[i].t;
      }
      maxD += stationData[i].d;
      
      orderedStations.push([stationData[i],i]);
    }
    maxT += Train.settings.stopTime;
    orderedStations.sort((a,b) => {return a[0].t - b[0].t});
    
    var obj = {};
    obj.maxT = maxT;
    obj.n = Train.lines[lineID].freq;
    obj.offsetPct = hashCode(JSON.stringify(Train.lines[lineID].stations));
    var geom = TrainMap.lines[lineID].getGeometry();
    if (!geom){continue;}
    obj.geoms = [];
    var lastStation = 0;
    var lastD = 0;
    for (var i=0;i<1001;i++){
      var objobj = {};
      var t = i/1000*maxT;
      if (t > orderedStations[lastStation+1][0].t){
        lastD+=orderedStations[lastStation+1][0].d;
        lastStation++;
      }
      if (lastStation+1 >= orderedStations.length){
        objobj['station']=orderedStations[lastStation][1];
        objobj['idx']=lastStation-1;
        var coord = geom.getCoordinateAt(1);
        var geom2 = new Point( coord);
        objobj.geom = geom2;
        for (var j=i;j<1001;j++){
          obj.geoms.push(objobj);
        }
        break;
      }
      var tpct = 0;
      if (t < orderedStations[lastStation][0].t + Train.settings.stopTime){
        objobj['station']=orderedStations[lastStation][1];
      }
      else {
        objobj['track']=lastStation;
        tpct = (t-orderedStations[lastStation][0].t-Train.settings.stopTime)/(orderedStations[lastStation+1][0].t-orderedStations[lastStation][0].t-Train.settings.stopTime);
      }
      objobj['idx']=lastStation;
      //objobj['riders']=orderedStations[lastStation+1][0].r/Train.lines[lineID].freq/2;
      var dpct = (lastD+tpct*orderedStations[lastStation+1][0].d)/maxD;
      //console.log(i,lastStation, lastD,t,tpct,dpct);
      var coord = geom.getCoordinateAt(dpct);
      var geom2 = new Point( coord);
      objobj.geom = geom2;
      obj.geoms.push(objobj);
    }
    TrainMap.preppedLines[lineID]=obj;
  
    TrainMap.trackFeatures[lineID] = [];
    
    for (var j=0;j<orderedStations.length-1;j++){
      var geomList = [];
      for (var i=0;i<1;i++){
        geomList.push(obj.geoms[0].geom);
      }
      var geoms = new GeometryCollection(geomList);
      var thejson = {geometry: geoms, name:'train'};
      var newFeature = new Feature(thejson);
      var maxmax = Math.max(500,Train.lineTotals[lineID].max/Train.lines[lineID].freq);
      var pct = orderedStations[j+1][0].r/2/Train.lines[lineID].freq/maxmax;
      if (pct < 0){pct = 0}
      if (pct > 1){pct = 1}
      var pctSpecial = orderedStations[j+1][0].rs/2/Train.lines[lineID].freq/maxmax;
      if (pctSpecial < 0){pctSpecial = 0}
      if (pctSpecial > pct){pctSpecial = pct}
      newFeature.set('max',maxmax);
      newFeature.set('pct',pct);
      newFeature.set('pctSpecial',pctSpecial);
      newFeature.set('color',Train.lines[lineID].color);
      TrainMap.trackFeatures[lineID].push(geoms);
      trainSource.addFeature(newFeature);
    }
    
  }
  
  clearInterval(TrainMap.animateInterval);
  TrainMap.animateInterval = setInterval(TrainMap.animateAll,TrainMap.animationSPD/2);


}


TrainMap.animateAll = function() {
  //var oneDay = Train.timings.spd;
  //var oneDay = 3600;
  var oneDay = TrainMap.animationSPD;
  var dayTime = TrainMap.animationSPD*1/2;
  var person = false;
  for (var i in TrainMap.people){
    person = TrainMap.people[i];
    break;
  }
  for (var lineID in TrainMap.preppedLines){
    var geoms = [];
    var len2 = TrainMap.trackFeatures[lineID].length;
    for (var j=0;j<len2;j++){
      geoms.push([]);
    }
    var len = TrainMap.preppedLines[lineID].n;
    var offsetPct = TrainMap.preppedLines[lineID].offsetPct;
    
    for (var j=0;j<2*len;j++){
      //var i = (Date.now()/1000 + offsetPct*((1/len)*dayTime) + (j/len)*dayTime + oneDay/4 + oneDay-(Train.timings.lastDay%oneDay))%oneDay;//i is seconds since start of day
      var i = (Date.now()/1000 + offsetPct*((1/len)*oneDay) + (j/len)*oneDay )%oneDay;//i is seconds since start of day
      
      var gm = i/oneDay*60*24;//minutes since start of day in game time
      
      var loc = gm/TrainMap.preppedLines[lineID].maxT;
      if (loc <= 1){
        var i0time = (0 + offsetPct*((1/len)*oneDay) + (j/len)*oneDay )%oneDay;
        var gm0 = i0time/oneDay*60*24;
        if (gm0 < 60*6 || gm0 > 60*18){continue}


        var obj = TrainMap.preppedLines[lineID].geoms[Math.floor(loc*1000)];
        if (person && person.next){
          if (obj.station && -1 == person.j && person.next && lineID == person.next[0] && person.next[1] == 1 && obj.station == person.next[2]){
            //transfer station
            
            person.feature.setGeometry(obj.geom)
            person.j = j;
            personDotStyle.getText().setText("😀");
            console.log(loc,obj.station,'found',Date.now());
            person.nextIdx++;
            if (person.nextIdx < person.directions.length){
              person.next = person.directions[person.nextIdx];
            }
            else {
              delete person.next;
              person.directions[person.nextIdx-1][3] = Date.now();
            }
            updateJourney();
          }
          else if (obj.station && j == person.j && person.next && lineID == person.next[0] && person.next[1] == 1 && obj.station == person.next[2]){
            //another station
            person.feature.setGeometry(obj.geom);
            person.directions[person.nextIdx][3] = Date.now();
            
            
            console.log(loc,obj.station);
            person.nextIdx++;
            if (person.nextIdx < person.directions.length){
              person.next = person.directions[person.nextIdx];
              if (person.next[0] != lineID){
                person.j = -1;
                person.startWait = Date.now();
                person.directions[person.nextIdx][3] = Date.now();
                person.directions[person.nextIdx-1][4] = Date.now();
              }
            }
            else {
              delete person.next;
              person.directions[person.nextIdx-1][3] = Date.now();
            }
            updateJourney();
          }
          else if (person.feature && lineID == person.next[0] && person.next[1] == 1 && j == person.j){
            //update location of person
            person.feature.setGeometry(obj.geom);
            if (obj.station){
              person.directions[person.nextIdx-1][4] = Date.now();
              person.toUpdate = true;
            }
            else if (person.toUpdate){
              updateJourney();
              person.toUpdate = false;
            }
          }
        }
        var geom2 = obj.geom;
        geoms[obj.idx].push(geom2);
      }
      else if (loc <= 2){
        var ii = TrainMap.preppedLines[lineID].maxT*oneDay/60/24;
        var i0time = (oneDay - ii + offsetPct*((1/len)*oneDay) + (j/len)*oneDay )%oneDay;
        var gm0 = i0time/oneDay*60*24;
        if (gm0 < 60*6 || gm0 > 60*18){continue}

        var nloc = 2-loc;
        var obj = TrainMap.preppedLines[lineID].geoms[Math.floor(nloc*1000)];
        if (person && person.next){
          if (obj.station && -1 == person.j && person.next && lineID == person.next[0] && person.next[1] == -1 && obj.station == person.next[2]){
            //transfer station
            person.feature.setGeometry(obj.geom)
            person.j = j;
            personDotStyle.getText().setText("😀");
            console.log(loc,obj.station,'found',Date.now());
            person.nextIdx++;
            if (person.nextIdx < person.directions.length){
              person.next = person.directions[person.nextIdx];
            }
            else {
              delete person.next;
              person.directions[person.nextIdx-1][3] = Date.now();
            }
            updateJourney();
          }
          else if (obj.station && j == person.j && person.next && lineID == person.next[0] && person.next[1] == -1 && obj.station == person.next[2]){
            //another station
            person.feature.setGeometry(obj.geom)
            person.directions[person.nextIdx][3] = Date.now();
            
            console.log(loc,obj.station);
            person.nextIdx++;
            if (person.nextIdx < person.directions.length){
              person.next = person.directions[person.nextIdx];
              if (person.next[0] != lineID){
                person.j = -1;
                person.startWait = Date.now();
                person.directions[person.nextIdx][3] = Date.now();
                person.directions[person.nextIdx-1][4] = Date.now();
              }
            }
            else {
              delete person.next;
              person.directions[person.nextIdx-1][3] = Date.now();
            }
            updateJourney();
          }
          else if (person.feature && lineID == person.next[0] && person.next[1] == -1 && j == person.j){
            //update location of person
            person.feature.setGeometry(obj.geom);
            if (obj.station){
              person.directions[person.nextIdx-1][4] = Date.now();
              person.toUpdate = true;
            }
            else if (person.toUpdate){
              updateJourney();
              person.toUpdate = false;
            }
            
          }
        }
        var geom2 = obj.geom;
        geoms[obj.idx].push(geom2);
      }

    }
    if (person && person.next && person.j == -1 && person.startWait){
      //console.log('still waiting',Date.now());
      var gameWait = (Date.now()-person.startWait)/1000/oneDay*60*24;//wait in game minutes
      //console.log(gameWait);
      if (gameWait > 80){
        personDotStyle.getText().setText("🤬");
        person.feature.setStyle(personDotStyle);
      }
      else if (gameWait > 40){
        personDotStyle.getText().setText("😡");
        person.feature.setStyle(personDotStyle);
      }
      else if (gameWait > 20){
        personDotStyle.getText().setText("😠");
        person.feature.setStyle(personDotStyle);
      }
      else if (gameWait > 10){
        personDotStyle.getText().setText("☹️");
        person.feature.setStyle(personDotStyle);
      }/*
      else if (gameWait > 5){
        personDotStyle.getText().setText("🙁");
        person.feature.setStyle(personDotStyle);
      }*/
      
    }
    for (var j=0;j<len2;j++){
      TrainMap.trackFeatures[lineID][j].setGeometries(geoms[j]);
    }
    
    
  }

}


function firstAndLast(l){
  var coords = [];
  var g = TrainMap.trackRoutes[l[0]].getCoordinates();
  coords.push(g[0]);
  coords.push(g[g.length-1]);
  var g = TrainMap.trackRoutes[l[l.length-1]].getCoordinates();
  coords.push(g[0]);
  coords.push(g[g.length-1]);
  return coords;
}
function orderCoords(l,first){
  var coords = [];
  for (var i=0;i<l.length;i++){
    var g = TrainMap.trackRoutes[l[i]].getCoordinates().slice();
    var d1 = Math.pow(g[0][0]-first[0],2)+Math.pow(g[0][1]-first[1],2);
    var d2 = Math.pow(g[g.length-1][0]-first[0],2)+Math.pow(g[g.length-1][1]-first[1],2);
    if (d2<d1){
      g.reverse();
    }
    for (var j=0;j<g.length;j++){
      coords.push(g[j]);
      first = g[j];
    }
  }
  return coords;
}
TrainMap.updateLine = function(lineID,tracks) {
  
  
    if (!tracks || tracks.length == 0){
      lineSource.removeFeature(TrainMap.lines[lineID]);
      TrainMap.lines[lineID] = null;
      delete TrainMap.lines[lineID];
      return;
    }
    console.log(JSON.stringify(tracks));
    //find first match
    var firstCoords = firstAndLast(tracks[0]);
    var outCoords = [];
    if (tracks.length == 1){
      if (tracks[0].length == 1){
        var coords = orderCoords(tracks[0].reverse(),firstCoords[3]);
        outCoords = outCoords.concat(coords.reverse());
      }
      else {
        var g1 = TrainMap.trackRoutes[tracks[0][0]].getCoordinates().slice();
        var g2 = TrainMap.trackRoutes[tracks[0][1]].getCoordinates().slice();
        var d1 = Math.pow(g1[0][0]-g2[0][0],2)+Math.pow(g1[0][1]-g2[0][1],2);
        var d2 = Math.pow(g1[g1.length-1][0]-g2[0][0],2)+Math.pow(g1[g1.length-1][1]-g2[0][1],2);
        var d3 = Math.pow(g1[g1.length-1][0]-g2[g2.length-1][0],2)+Math.pow(g1[g1.length-1][1]-g2[g2.length-1][1],2);
        var d4 = Math.pow(g1[0][0]-g2[g2.length-1][0],2)+Math.pow(g1[0][1]-g2[g2.length-1][1],2);
        if (d2 <= Math.min(d1,d2,d3,d4) || d3 <= Math.min(d1,d2,d3,d4)){
          var coords = orderCoords(tracks[0],g1[0]);
          outCoords = outCoords.concat(coords);
        }
        else {
          var coords = orderCoords(tracks[0],g1[g1.length-1]);
          outCoords = outCoords.concat(coords);
        }
      }
    }
    else {
      var secondCoords = firstAndLast(tracks[1]);

      var minD = Infinity;
      var minij = [0,0];
      for (var i=0;i<4;i++){
        for (var j=0;j<4;j++){
          var d = Math.pow(firstCoords[i][0]-secondCoords[j][0],2)+Math.pow(firstCoords[i][1]-secondCoords[j][1],2);
          if (d < minD){
            minD = d;
            minij = [i,j];
          }
        }
      }

      
      if (minij[0] == 0){
        var coords = orderCoords(tracks[0],firstCoords[0]);
        outCoords = outCoords.concat(coords.reverse());
      }
      else if (minij[0] == 1){
        var coords = orderCoords(tracks[0],firstCoords[1]);
        outCoords = outCoords.concat(coords.reverse());
      }
      else if (minij[0] == 2){
        var coords = orderCoords(tracks[0].reverse(),firstCoords[2]);
        outCoords = outCoords.concat(coords.reverse());
      }
      else if (minij[0] == 3){
        var coords = orderCoords(tracks[0].reverse(),firstCoords[3]);
        outCoords = outCoords.concat(coords.reverse());
      }
      
      for (var i=1;i<tracks.length;i++){
        var coords = orderCoords(tracks[i],outCoords[outCoords.length-1]);
        outCoords = outCoords.concat(coords);
      }
    }
    console.log(outCoords);
    var geom1 = new LineString(outCoords);
    //var geom = new GeometryCollection([geom1]);

    if (!TrainMap.lines[lineID]){
      var thejson = {geometry: geom1, name:'line'};
      var newFeature = new Feature(thejson);
      newFeature.set('color',Train.lines[lineID].color);
      lineSource.addFeature(newFeature);
      TrainMap.lines[lineID] = newFeature;
      return;
    }
    TrainMap.lines[lineID].setGeometry(geom1);
    TrainMap.lines[lineID].set('color',Train.lines[lineID].color);
  

}



window.xz = [[100000,25,5],[250000,50,10],[400000,100,25]];//larger shows more cities

function hashCode(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  hash += 4294967296/2;
  var f = hash/4294967296;
  return f;
}
function zoomToRadius(zoomLevel){
  return 1.3*Math.pow(2,zoomLevel/2);
}
function popToWidth(pop,zoomLevel){
  return pop/1000*Math.pow(2,zoomLevel/3);
}