// default painting configuration values
export const defaultPaintingConfig = {
    wallSize: [33000, 50000],   // width [mm], height [mm]
    canvasSize: [33000, 10000], // canvas area size [mm]
    canvasPosition: [0,10000],  // position of the canvas in the wall [mm]
    colors: ['#000000'],    // single black color
    strokeWeight: 100,      // drone paint stroke thickness [mm]
    droneResolution: 200,   // drone resolution [mm]
    droneFlyingSpeed: 0.4,    // average drone flying speed [m/s]
    droneFlightTime: 240000,  // duration of battery flying [ms]
    droneDrawingTime: 84000,  // average continuous drawing time [ms]
    droneSwapTime: 300000,    // land, swap battery and paint can, takeoff, and resume painting [ms]
    droneTakeoffTime: 140000, // Max duration from drone takeoff to actual painting [ms]
    droneLandingTime: 90000,  // Max time needed to stop painting and land [ms]
}

export const requiredPaintingConfigParams = [
    'wallId', 'gpsLocation',
    'wallSize', 'canvasSize', 'canvasPosition',
]


// default transformation options
export const defaultTransformOptions = {
    centerline: false,
    blurKernel: 4,
    hysteresisHighThreshold: 50,
    hysteresisLowThreshold: 5,
    binaryThreshold: 45,
    traceFilterTolerance: 1.4,
    minimunPathLength: 10,
    targetInfluence: 0.5,
    contrastPathLengthFactor: 0.1, // relative %
    contrastConcatLengthFactor: 3, // relative %
    dilationRadius: 4,
}
