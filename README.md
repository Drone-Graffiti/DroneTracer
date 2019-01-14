### Aeternity Drone Graffiti Project

# DroneTracer Library

Thepurpose of this library is to transform bitmap images intopolyline-based artwork paintable by drone.

Theconversion is done in different stages in which the image is analyzedand the most relevant visual elements are extracted. A pathrepresenting the image abstracted information is calculated usingpath trajectories optimized for the drone parameters.

Theflight time estimation and size/resolution is calculated along withthe drawing coordinates.



## API

Library name: **DroneTracer**

#### Painting Configuration:

Creating an instance of the *DroneTracer* class requires passing a configuration object.
This configurations describes properties of the wall and the painting required by the transformation process and the drone system.
Multiple instances of the DroneTracer class can be created simultaneously with the same or different configuration.

```js
// Painting configuration
{
    wallId: 'CT19-001',         // required | ID to identify the wall target
    gpsLocation: [0,0],         // required | wall GPS coordinates [Latitude, Longitude]
    wallSize: [33000, 50000],   // required | wall width [mm], wall height [mm] (33m x 50m)
    canvasSize: [33000, 10000], // required | canvas area size [mm] (33m x 10m)
    canvasPosition: [0,10000], 	// required | relative position of the canvas in the wall [mm]
    colors: ['#000000'],    	// list of available colors
    strokeWeight: 100           // drone paint stroke thickness [mm]
    droneResolution: 200,   	// drone resolution [mm]
    droneFlyingSpeed: 0.6,      // average drone flying speed [m/s]
    droneFlightTime: 240000,    // duration of battery flying [ms]
    droneDrawingTime: 84000,    // average continuous drawing time [ms]
    droneSwapTime: 300000,      // land, swap battery and paint can, takeoff, and resume painting [ms]
    droneTakeoffTime: 140000,   // max duration from drone takeoff to actual painting [ms]
    droneLandingTime: 90000,    // max time needed to stop painting and land [ms]
}
```

Required parameters: *wallId, gpsLocation, wallSize, canvasSize, canvasPosition*



#### DroneTracer transform( File, [progressFunction], [transformationOptions] )

Converts an input image into a svg drone paint

##### Parameters:

***File***: The input accepts a **Base64** **string** or a **File API** object.
*File formats are still not defined but probably would be jpg and png.*


***Progress Function***: |*Optional*| Function callback that return the progress of the transformation  				process.

***TransformationOptions object***: |*Optional*| Passes an object that adjusts transformation parameters.

**Return**:
The transform function returns a promise that resolves into the *dronePaint* object.



#### DroneTracer uiParameters

The uiParameters getter, exposes the properly parameters, values and ranges for a successful image transformation.

This parameters can be used to build an user interface and allow the user to retouch the results.

```javascript
[
	{
		label: "Blur Radius",
		name: "blurKernel",
		value: 4,
		type: "range",
		from: 1,
		to: 8
	},
	{
		label: "Threshold",
      	name: "hysteresisHighThreshold",
      	value: 50,
      	type: "range",
      	from: 1,
      	to: 100
    }
]
```



#### dronePaint object:

Provides functions to access and modify related information to the svg for the drone. This functions does not affect the transformation process.

**setPaintingPosition(x, y):** Sets relative positioning inside the wall.

**setPaintingScale(factor):** Transforms the scale of the generated SVG. *Only accepts positive numbers greater or equals than 1.*

**setPaintingColor(color):** Sets the painting color of the draw.

**svgFile:** Getter, svg drone path

**sourceImage**: Getter, original source image

**estimatedTime:** Getter, estimated painting time (milliseconds). *Includes takeoff, painting and flying time, battery and spray can swapping and landing.*



### Implementation


```javascript
// Painting wall configuration
var paintingConfig = {
    wallId: 'LN21-011',
    gpsLocation: [0000,0000],
    wallSize: [22000, 40000],
    canvasSize: [20000, 20000],
    canvasPosition: [0, 0], // millimeters (origin = [bottom left])
    colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
}

// Instance of a drone tracer
var tracer = new DroneTracer(paintingConfig)

// Transform image into a flyable drone path
tracer.transform(
  imagefile, // loaded File API or Base64 String
  (progress) => { console.log(`${progress}%`) }, // log progress
  { 
    centerline: false
    blurKernel: 3,
    hysteresisHighThreshold: 50,
    binaryThreshold: 45,
    dilationRadius: 6     
  }
).then( (dronePaint) => {
  /* The dronePaint object, provides functions to access and modify
   * related information to the svg for the drone.
   * This functions does not affect the transformation process.
   */
  dronePaint.setPaintingPosition(12000, 0) // in millimeters
  dronePaint.setPaintingScale(2.5) // post-scale the svg
  dronePaint.setPaintingColor('#aa0000')

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
