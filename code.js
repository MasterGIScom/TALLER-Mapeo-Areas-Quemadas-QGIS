/*
var distrito = table.filter(ee.Filter.eq("DISTRITO","CHUGUR"));
Map.addLayer(distrito, {color: 'red'}, 'Distrito')
*/
var Lan8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                  .filterDate('2021-08-15', '2021-08-30')
                  .filterBounds(geometry) 
                  .filterMetadata('CLOUD_COVER', 'Less_Than', 30);
                  
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

// Map the function over one year of data and take the median.
// Load Sentinel-2 TOA reflectance data.
var Sen2 = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2021-08-15', '2021-08-25')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                  .map(maskS2clouds);
                  

/*                
var nicfi = ee.ImageCollection('projects/planet-nicfi/assets/basemaps/americas');

var planet = nicfi.filter(ee.Filter.date('2021-08-01', '2021-08-25')).first();
*/



//Seleccionar el primero de la lista 

var img8 = ee.Image(Lan8.sort('CLOUD_COVER').mosaic());
print(img8)

var img2 = ee.Image(Sen2.sort('CLOUD_COVER').mosaic());
print(img2)

// Cortar imagen con el área de estudio

var l8_clip = img8.clip(geometry);


var S2_clip = img2.clip(geometry);     

                  
//var plan_clip = planet.clip(geometry);
            
//Map.centerObject(area);

Map.setCenter( 23.309957,38.941245, 12 );
            



// Visualizar color natural Landsat 08

Map.addLayer(l8_clip, {
  min: 0.0,
  max: 0.5,
  gamma: 1.0,
  bands: ['B4','B3','B2']}, 
  'Imagen Landsat 8');



Map.addLayer (S2_clip, {
  min: 0.0,
  max: 0.3,
  gamma: 1.0, 
  bands: ['B4','B3','B2']}, 
  'Imagen Sentinel 2',0);


//var vis = {"bands":["R","G","B"],"min":0,"max":5000,"gamma":1.0};
//Map.addLayer(plan_clip, vis, 'Imagen Planet');



Export.image.toDrive({
  image: l8_clip.select("B1","B2","B3", "B4" ,"B5", "B6", "B7" ),
  description: 'Landsat8_T',
  scale: 30,
  region: geometry
});

  
  
/*
Export.image.toDrive({
  image: S2_clip.select("B1","B2","B3", "B4" ,"B5", "B6", "B7" , "B8" , "B9" , "B10" , "B11" , "B12"),
  description: 'Sentinel2_T',
  scale: 15,
  region: geometry
}); 
  
*/


