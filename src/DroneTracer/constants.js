// default painting configuration values
export const defaultPaintingConfig = {
    dimensions: [50, 22],   // width [m], height [m]
    colors: ['#000000'],    // single black color
    droneResolution: 0.2,   // drone resolution [m]
}

export const requiredPaintingConfigParams = ['wallId', 'gpsLocation', 'dimensions']


// default transformation options
export const defaultTransformOptions = {
    size: [4, 3], // default graffiti size 4m x 3m
    blurKernel: 3,
    blurSigma: 1.4,
    hysteresisHighThreshold: 50,
    hysteresisLowThreshold: 5,
    centerline: false,
    traceFilterTolerance: 1.2,
    minimunPathLength: 10,
    contrastPathLengthFactor: 0.1, // relative %
    contrastConcatLengthFactor: 3, // relative %
    drone: {
        minimunDistance: 20
    }
}
