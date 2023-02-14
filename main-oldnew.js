import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {transformExtent} from 'ol/proj.js';
import {transform} from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import TopoJSON from 'ol/format/TopoJSON';
import {VectorImage as VectorImageLayer, Vector as VectorLayer, Image} from 'ol/layer.js';
import {Vector, ImageStatic} from 'ol/source.js';
import {Style, Fill, Stroke, Text, Circle} from 'ol/style';

function transformE(extent) {
  return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
}

const extents = {
  USA: transformE([-130, 25, -60, 50]),
};

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

const stationStroke = new Stroke({color: 'rgba(55,55,0,0.5)',width:1});
const stationCircle = new Circle({
  radius: 10,
  fill: new Fill({color: 'rgba(255,0,0,0.0)'}),
  stroke: stationStroke
});

var labelStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#fdd',
      width: 4
    })
  }),
  image: stationCircle
});



var labelSmallStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '10px Calibri,sans-serif',
    fill: new Fill({
      color: '#222'
    }),
    stroke: new Stroke({
      color: '#666',
      width: 1
    })
  }),
  image: stationCircle
});



var dotStyle = new Style({
  image: new Circle({
    radius: 5,
    fill: new Fill({color: 'rgba(0,0,0,0.5)'}),
    stroke: null
  })
});



window.TrainMap = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      title: 'Overlay',
      opacity: 1,
      extent: [-20037508.342789, -20037508.342789,20037508.342789, 20037508.342789],
      source: new XYZ({
          attributions: '',
          minZoom: 0,
          maxZoom: 5,
          url: './tiles/{z}/{x}/{y}.svg',
          tileSize: [2048, 2048],
          preload: 1
      })
    }),
    /*new TileLayer({
      title: 'Overlay',
      opacity: 1,
      extent: extents.USA,
      source: new XYZ({
          attributions: '',
          minZoom: 5,
          maxZoom: 5,
          url: './tiles/{z}/{x}/{y}.svg',
          tileSize: [512, 512],
          preload: 3
      })
    }),*/
    new VectorImageLayer({
      source: new Vector({
        url: './data/ocean-simple.json',
        format: new TopoJSON()
      }),
      minZoom: 4,
      style: oceanStyle
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/states-simple.json',
        format: new TopoJSON()        
      }),
      minZoom: 4,
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
      source: new Vector({
        url: './data/lakes-simple.json',
        format: new TopoJSON()
      }),
      minZoom: 4,
      style: lakeStyle
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/rivers-simple.json',
        format: new TopoJSON()
      }),
      minZoom: 4,
      style: function(feature, resolution) {
        var scale = feature.get('scalerank');
        riverStyle.getStroke().setWidth(500 / Math.pow(resolution,0.66) / Math.log(scale+1));
        return riverStyle;
      }
    }),
    new VectorImageLayer({
      source: new Vector({
        url: './data/cities.json',
        format: new GeoJSON(),
      }),
      style: function(feature, resolution) {
        var name = feature.get('name');
        var scalerank = Math.pow(parseFloat(feature.get('scalerank2')),0.25);
        var pop = feature.get('pop50');
        var zoom = 0.8*Math.pow(2.1,scalerank);
        var zoomLevel = TrainMap.getView().getZoomForResolution(resolution);
        //console.log(resolution,zoomLevel);
        //var zoom = Math.pow(2.2,parseFloat(feature.get('scalerank')));
        if (resolution < xz / zoom){
          labelStyle.getText().setText(name);
          if (TrainMap.isDraw){
            labelStyle.getImage().setRadius(zoomToRadius(zoomLevel));
            stationStroke.setWidth(popToWidth(pop));
            labelStyle.getImage().setStroke(stationStroke);
            labelStyle.getImage().setOpacity(1);
          }
          else {
            labelStyle.getImage().setOpacity(0);
          }
          return labelStyle;
        }
        else if (resolution < 2 * xz / zoom){
          labelSmallStyle.getText().setText(name);
          if (TrainMap.isDraw){
            labelSmallStyle.getImage().setRadius(zoomToRadius(zoomLevel));
            stationStroke.setWidth(popToWidth(pop));
            labelSmallStyle.getImage().setStroke(stationStroke);
            labelSmallStyle.getImage().setOpacity(1);
          }
          else {
            labelSmallStyle.getImage().setOpacity(0);
          }
          return labelSmallStyle;
        }
        else if (resolution < 3 * xz / zoom){
          if (TrainMap.isDraw){
            labelSmallStyle.getText().setText(name);
            labelSmallStyle.getImage().setRadius(zoomToRadius(zoomLevel));
            stationStroke.setWidth(popToWidth(pop));
            labelSmallStyle.getImage().setStroke(stationStroke);
            labelSmallStyle.getImage().setOpacity(1);
            return labelSmallStyle;
          }
          else {
            return dotStyle;
          }
          
        }
        else {
          labelStyle.getText().setText("");
          //return dotStyle;
        }
        
      },
      minZoom: 3
    })
    
    
  ],
  view: new View({
    center: transform([-81, 34], 'EPSG:4326', 'EPSG:3857'),
    zoom: 1,
    extent: transformE([-180, -60, 180, 75]),
    preload: 1
  })
});

var currZoom = TrainMap.getView().getZoom();
TrainMap.on('moveend', function(e) {
  var newZoom = TrainMap.getView().getZoom();
  if (currZoom != newZoom) {
    console.log('zoom end, new zoom: ' + newZoom);
    currZoom = newZoom;
  }
});
TrainMap.isDraw = true;

window.xz = 60000;

function zoomToRadius(zoomLevel){
  return 1.5*Math.pow(2,zoomLevel/2);
}
function popToWidth(pop){
  return pop/500;
}
