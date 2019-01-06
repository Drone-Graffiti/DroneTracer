const generateKernel = function(sigmma, size) {
    const E = 2.718 // Euler's number rounded of to 3 places
    var kernel = []
    var sum = 0

    for (let i = 0; i < size; i++) {
        kernel[i] = []
        let y = -(size - 1)/2 + i // calculate the local y coordinate of neighbor

        for (let j = 0; j < size; j++) {
            let x = -(size - 1)/2 + j // calculate the local x coordinate of neighbor

            //create kernel round to 3 decimal places
            let gaussian = 1/(2 * Math.PI * Math.pow(sigmma, 2)) * Math.pow(E, -(Math.pow(Math.abs(x),2) + Math.pow(Math.abs(y), 2))/(2 * Math.pow(sigmma, 2)) )
            kernel[i][j] = gaussian
            sum += gaussian
        }
    }

    //normalize the kernel
    for (let k = 0; k < kernel.length; k++)
        for (let l = 0; l < kernel[k].length; l++)
          kernel[k][l] = (kernel[k][l]/sum).toFixed(3)

    return kernel

}

const getNeighbors = function(imgSource, x, y, size) {
    var neighbors = []
    for (let i = 0; i < size; i++) {
        neighbors[i] = []
        for (let j = 0; j < size; j++) {
            var trnsX = x-(size-1)/2+i
            var trnsY = y-(size-1)/2+j
            if (imgSource[trnsY] && imgSource[trnsY][trnsX])
                neighbors[i][j] = imgSource[trnsY][trnsX]
            else
                neighbors[i][j] = 0
        }
    }

    return neighbors
}

// TODO: convert into ES6 generator?
const convolve = function(imgSource, neighborSize, callback) {
    var imgCopy = imgSource.slice(0)
    for (let y = 0; y < imgSource.length; y++) {
        for (let x = 0; x < imgSource[0].length; x++) {
            var current = imgSource[y][x]
            var neighbors = getNeighbors(imgCopy, x, y, neighborSize) 
            callback(x,y, current, neighbors)
            
        }
    }
}

// imgSource should be an array with the grayscale values of the image pixels
export const gaussianBlur = function(imgSource, sigmma = 2.4, size = 5) {
    // size oddNumber
    size =  size%2 == 0 ? size+1 : size
    var kernel = generateKernel(sigmma, size)
    var blurImage = imgSource.slice(0)

    convolve(imgSource, size, (x, y, current, neighbors) => {
        blurImage[y][x] = 0
        for (let i = 0; i < size; i++)
            for (let j = 0; j < size; j++)
                blurImage[y][x] += neighbors[i][j] * kernel[i][j]
    })

    return blurImage
}

// imageData should be a canvas imageData object
export const grayscale = function(imageData) {
    var grayscale = []

    for(let y = 0; y < imageData.height; y++) {
        grayscale[y] = []
        for(let x = 0; x < imageData.width ; x++) {
            var index = (y * imageData.width + x) * 4

            let r = imageData.data[index]
            let g = imageData.data[index + 1]
            let b = imageData.data[index + 2]

            grayscale[y][x] = (0.3 * r) + (0.59 * g) + (0.11 * b)
        }
    }

    return grayscale
}

// Gradient (Magnitude) with Sobel
export const gradient = function(imgSource) {
    var filterOperator = {
        y: [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ],
        x: [
            [-1, -2, -1],
            [0, 0, 0],
            [1, 2, 1]
        ]
    }

    // create an empty image array
    var sobelImage = []
    for (let y of imgSource)
        sobelImage.push( new Array(imgSource[0].length) )

    convolve(imgSource, 3, (x, y, current, neighbors) => {
        var sumX = 0, sumY = 0

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
              //if (!neighbors[i][j]) continue
              sumX += neighbors[i][j] * filterOperator['x'][i][j] 
              sumY += neighbors[i][j] * filterOperator['y'][i][j] 
          }
        }

        // magnitude
        sobelImage[y][x] = Math.round( Math.sqrt(sumX*sumX + sumY*sumY) )
    })

    return sobelImage
}

export const nonMaximumSuppression = function(imgSource) {
    // create an empty image array
    var nmsuImg = []
    for (let y of imgSource)
        nmsuImg.push( new Array(imgSource[0].length) )

    convolve(imgSource, 3, (x, y, current, n) => {
        if (n[1][1] > n[0][1] && n[1][1] > n[2][1])
            nmsuImg[y][x] = n[1][1]
        else
            nmsuImg[y][x] = 0
        if (n[1][1] > n[0][2] && n[1][1] > n[2][0])
            nmsuImg[y][x] = n[1][1]
        else
            nmsuImg[y][x] = 0
        if (n[1][1] > n[1][0] && n[1][1] > n[1][2])
            nmsuImg[y][x] = n[1][1]
        else
            nmsuImg[y][x] = 0
        if (n[1][1] > n[0][0] && n[1][1] > n[2][2])
            nmsuImg[y][x] = n[1][1]
        else
            nmsuImg[y][x] = 0
    })

    return nmsuImg
}

// Threshold in %
export const hysteresis = function(imgSource, highThreshold = 55, lowThreshold = 5) {
    //var isStrong = function(edge) {return edge > ht}
    //var isCandidate = function(edge) {return edge <= ht && edge >= lt}
    //var isWeak = function(edge) {return edge < lt}

    var ht =  255 * (highThreshold/100)
    var lt = 255 * (lowThreshold/100)

    // create an empty image array
    var hysteresisImg = []
    for (let y of imgSource)
        hysteresisImg.push( new Array(imgSource[0].length) )

    // first pass | find high threshold edges
    convolve(imgSource, 3, (x, y, current) => {
        if (current > ht)
            hysteresisImg[y][x] = 255
        else if (current < lt || (current<=ht && current>=lt))
            hysteresisImg[y][x] = 0
    
    })

    // second pass | traver over potential edges and join with high threshold ones
    var traverseEdge = function(x,y) {
        if (x === 0 || y === 0 || x === imgSource[0].length-1 || y === imgSource.length-1)
            return
        if (hysteresisImg[y][x] > ht) {
            var neighbors = getNeighbors(imgSource, x, y, 3)
            for (let i = 0; i < neighbors.length; i++) {
                for (let j = 0; j < neighbors[0].length; j++) {
                    if (neighbors[i][j]<=ht && neighbors[i][j]>=lt &&
                        hysteresisImg[y-1+j][x-1+i] <= ht) {
                        hysteresisImg[y-1+j][x-1+i] = 255
                        traverseEdge(x-1+i, y-1+j)
                    }
                }
            }
        }
    }
    convolve(imgSource, 1, (x, y) => { traverseEdge(x, y) })

    return hysteresisImg
}


// based on https://en.wikipedia.org/wiki/Mathematical_morphology#Dilation
// radius based on %
export const dilation = function(imgSource, radius = 10) {

}
