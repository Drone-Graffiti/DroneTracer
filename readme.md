### Aeternity Drone Graffiti Project

# DroneTracer Library

#### The purpose of this library is to transform bitmap images into polyline-based artwork paintable by drone.

The conversion is done in different stages in which the image is analyzed; the edges, colors and shapes are detected and the most relevant parts are extracted. A path representing the image abstracted information is calculated using the drone parameters. Then the flight time estimation and the optimized trajectories.

Library name: DroneTracer

Painting Configuration:
Creating an instance of the DroneTracer class requires passing a configuration object.
This configurations describes properties of the wall and the painting required by the transformation process and the drone system.
Multiple instances of the DroneTracer class can be created simultaneously with the same or different configuration.
* Few configuration parameters are required and others are optional. All parameters are still not defined.

transform( File, [progressFunction], [options] )
Converts an input image into a svg drone paint

Parameters:
File: The input accepts a File API object.
file formats are still not defined but probably would be jpg and png.


Progress Function: |Optional| Function callback that return the progress of the transformation  process.


Options object: |Optional| Passes an object that overwrites default transformation parameters. Parameters TBD

Return:
The transform function returns a promise that resolves into the dronePaint object.

dronePaint object:
This object, provides functions to access and modify related information to the svg for the drone.
Relative positioning into the wall must be registered into the dronePaint.


```javascript
// Painting wall configuration
var paintingConfig = {
  wallId: 1,
  gpsLocation: [-99.134982,19.413494],
  dimensions: [30.4, 22.07],
  colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
  droneResolution: 0.1, // default 0.2
}

// Instance of a drone tracer
var tracer = new DroneTracer(paintingConfig)

// Transform image into a flyable drone path
tracer.transform(
  imagefile, // loaded File API
  (progress) => { console.log(progress) }, // log progress
  { threshold: 0.1 } // overwrite default threshold parameter
).then( (dronePaint) => {
  // The dronePaint object, provides functions to access and modify related information to the svg for the drone.
  dronePaint.setPaintingPosition(12.1, 0.85)
  dronePaint.setPaintingScale(2.5)
  dronePaint.setPaintingData('dataName', 'datAvalue')
  
  console.log( 'result path: ', dronePaint.getSVGFile() )
  console.log( 'painting time: ', dronePaint.getEstimatedTime() )
});
...
