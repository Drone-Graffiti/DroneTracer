### Aeternity Drone Graffiti Project

# DroneTracer Library

The purpose of this library is to transform bitmap images into polyline-based artwork paintable by drone.

The conversion is done in different stages in which the image is analyzed; the edges, colors and shapes are detected and the most relevant parts are extracted. A path representing the image abstracted information is calculated using the drone parameters. Then the flight time estimation and the optimized trajectories.



## API

Library name: **DroneTracer**

#### Painting Configuration:

Creating an instance of the *DroneTracer* class requires passing a configuration object.
This configurations describes properties of the wall and the painting required by the transformation process and the drone system.
Multiple instances of the DroneTracer class can be created simultaneously with the same or different configuration.

*Few configuration parameters are required and others are optional. All parameters are still not defined.*



#### Transform: transform( File, [progressFunction], [options] )

Converts an input image into a svg drone paint

##### Parameters:

***File***: The input accepts a **Base64** **string** or a **File API** object.
*File formats are still not defined but probably would be jpg and png.*


***Progress Function***: |*Optional*| Function callback that return the progress of the transformation  				process.

***Options object***: |*Optional*| Passes an object that overwrites default transformation parameters. *Parameters TBD*
The **size** option (default 4m x 3m) is the desired size for the image to be traced on the wall. The size option will affect the resolution/detail of the traced svg.

**Return**:
The transform function returns a promise that resolves into the *dronePaint* object.



#### dronePaint object:

Provides functions to access and modify related information to the svg for the drone. This functions does not affect the transformation process.

**setPaintingPosition(x, y):** Sets relative positioning inside the wall.

**setPaintingScale(factor):** Transforms the scale of the generated SVG. *Only accepts positive numbers greater or equals than 1.*

**svgFile:** Getter, svg drone path

**sourceImage**: Getter, original source image

**estimatedTime:** Getter, estimated painting time (milliseconds)



### Implementation


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
  (progress) => { console.log(`${progress}%`) }, // log progress
  { 
    size: [5,8], // graffiti size in meters | default 4mx3m
    color: 2,  // default 0. Color id from the paintingConfig color list
    threshold: 0.1
  }
).then( (dronePaint) => {
  /* The dronePaint object, provides functions to access and modify
   * related information to the svg for the drone.
   * This functions does not affect the transformation process.
   */
  dronePaint.setPaintingPosition(12.1, 0.85) // default: middle of the wall
  dronePaint.setPaintingScale(2.5) // post-scale the svg
  dronePaint.setPaintingData('dataName', 'datAvalue')

  console.log( 'result path: ', dronePaint.svgFile )
  console.log( 'image source: ', dronePaint.sourceImage )
  console.log( 'painting time: ', dronePaint.estimatedTime )
});

```



## Development

#### Installation

```bash
$ npm install
```



#### Run test

```bash
$ npm test
```



#### Build Release version

```bash
$ npm run rlease
```



#### Test Interface Version

```bash
# Requires release version previously built
$ npm run interface
```





## License

TBD
