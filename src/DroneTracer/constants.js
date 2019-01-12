// default painting configuration values
export const defaultPaintingConfig = {
    wallId: 'MX19-001', 
    wallSize: [33000, 50000],     // width [mm], height [mm]
    canvasSize: [33000, 10000],   // canvas area size [mm]
    canvasPosition: [0,10000], // position of the canvas in the wall [mm]
    colors: ['#000000'],    // single black color
    droneResolution: 200,   // drone resolution [mm]
    strokeWeight: 100      // drone paint stroke thickness [mm]
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
