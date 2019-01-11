// default painting configuration values
export const defaultPaintingConfig = {
    wallId: 'MX19-001', 
    wallSize: [33, 50],     // width [m], height [mm]
    canvasSize: [33, 10],   // canvas area size [mm]
    canvasPosition: [0,10], // position of the canvas in the wall [mm]
    colors: ['#000000'],    // single black color
    droneResolution: 0.2,   // drone resolution [m]
    strokeWeight: 10      // drone paint stroke thickness [cm]
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
    traceFilterTolerance: 1.2,
    minimunPathLength: 10,
    targetInfluence: 0.5,
    contrastPathLengthFactor: 0.1, // relative %
    contrastConcatLengthFactor: 3, // relative %
    dilationRadius: 4,
}
