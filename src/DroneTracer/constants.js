// default painting configuration values
export const defaultPaintingConfig = {
    dimensions: [33, 50],   // width [m], height [m]
    colors: ['#000000'],    // single black color
    droneResolution: 0.2,   // drone resolution [m]
}

export const requiredPaintingConfigParams = ['wallId', 'gpsLocation', 'dimensions']


// default transformation options
export const defaultTransformOptions = {
    size: [4, 3], // default graffiti size 4m x 3m
    blurKernel: 4,
    hysteresisHighThreshold: 50,
    hysteresisLowThreshold: 5,
    centerline: false,
    traceFilterTolerance: 1.0,
    minimunPathLength: 10,
    targetInfluence: 0.5,
    contrastPathLengthFactor: 0.1, // relative %
    contrastConcatLengthFactor: 3, // relative %
    dilationRadius: 4,
    svgcolor: '#000',
}
