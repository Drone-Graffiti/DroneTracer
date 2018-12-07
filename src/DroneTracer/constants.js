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
    color: 0, // Color id from the paintingConfig color list
    threshold: 0.1
    // more TBD
}
