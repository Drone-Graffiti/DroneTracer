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

const getNeighbors = function(imgSource, x, y, size, repeat = false) {
    var neighbors = []
    for (let i = 0; i < size; i++) {
        neighbors[i] = []
        for (let j = 0; j < size; j++) {
            var trnsX = x-(size-1)/2+i
            var trnsY = y-(size-1)/2+j
            if (imgSource[trnsY] !== undefined && imgSource[trnsY][trnsX] !== undefined)
                neighbors[i][j] = imgSource[trnsY][trnsX]
            else {
                if (repeat) neighbors[i][j] = imgSource[y][x]
                else neighbors[i][j] = 0
            }
        }
    }

    return neighbors
}

const roundDir = function(deg) {
    deg = deg < 0 ? deg + 180 : deg

    if ((deg >= 0 && deg <= 22.5) || (deg > 157.5 && deg <= 180)) {
        return 0
    } else if (deg > 22.5 && deg <= 67.5) {
        return 45
    } else if (deg > 67.5 && deg <= 112.5) {
        return 90
    } else if (deg > 112.5 && deg <= 157.5) {
        return 135
    }
}

// TODO: convert into ES6 generator?
const convolve = function(imgSource, neighborSize, callback, repeat = false) {
    var imgCopy = imgSource.slice(0)
    for (let y = 0; y < imgSource.length; y++) {
        for (let x = 0; x < imgSource[0].length; x++) {
            var current = imgSource[y][x]
            var neighbors = getNeighbors(imgCopy, x, y, neighborSize, repeat) 
            callback(x,y, current, neighbors)
            
        }
    }
}

export const invert = function(imgSource) {
    var invertedImg = []

    for (let y = 0; y < imgSource.length; y++) {
        invertedImg[y] = []
        for (let x = 0; x < imgSource[0].length; x++) {
            invertedImg[y][x] = 255 - imgSource[y][x]
        }
    }

    return invertedImg
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
    }, true)

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
            let a = imageData.data[index + 3]

            grayscale[y][x] = a===255 ? (0.3 * r)+(0.59 * g)+(0.11 * b) : 255
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
    var dirMap = []
    for (let y of imgSource) {
        sobelImage.push( new Array(y.length) )
        dirMap.push( new Array(y.length) )
    }

    convolve(imgSource, 3, (x, y, current, neighbors) => {
        var sumX = 0, sumY = 0

        if (x !== 0 && y !== 0 && x !== imgSource[0].length-1 && y !== imgSource.length-1) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    //if (!neighbors[i][j]) continue
                    sumX += neighbors[i][j] * filterOperator['x'][i][j] 
                    sumY += neighbors[i][j] * filterOperator['y'][i][j] 
                }
            }
        }

        // direction
        dirMap[y][x] = roundDir(Math.atan2(sumY, sumX) * (180/Math.PI))

        // magnitude
        sobelImage[y][x] = Math.round( Math.sqrt(sumX*sumX + sumY*sumY) )
    })

    return {sobelImage, dirMap}
}

// based on cmisenas non-maximum-suppression for canny-edge-detection
export const nonMaximumSuppression = function(imgSource, dirMap) {
    // clone Array
    var nmsuImg = []
    for (let y of imgSource)
        nmsuImg.push( y.slice(0) )

    var degrees = {
        0: [{x: 0, y: 1}, {x: 2, y: 1}],
        45:[{x: 0, y: 0}, {x: 2, y: 2}],
        90:  [{x: 1, y: 2}, {x: 1, y: 0}],
        135: [{x: 0, y: 2}, {x: 2, y: 0}],
    }

    convolve(imgSource, 3, (x, y, current, neighbors) => {
        var pixNeighbors = degrees[dirMap[y][x]]

        var neighbor1 = neighbors[pixNeighbors[0].x][pixNeighbors[0].y]
        var neighbor2 = neighbors[pixNeighbors[1].x][pixNeighbors[1].y]

        if (neighbor1 > imgSource[y][x] || neighbor2 > imgSource[y][x] ||
          (neighbor2 === imgSource[y][x] && neighbor1 < imgSource[y][x])
        )
            nmsuImg[y][x] = 0
    })

    return nmsuImg
}

// Threshold in %
export const hysteresis = function(imgSource, highThreshold = 55, lowThreshold = 5) {
    var ht =  255 * (highThreshold/100)
    var lt = 255 * (lowThreshold/100)

    // create an empty image array
    var hysteresisImg = []
    for (let y of imgSource)
        hysteresisImg.push( new Array(y.length) )

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

// threshold value in %
export const thresholdFilter = function(imgSource, thresholdValue) {
    var thresholdImg = []
    var threshold = 255 * (thresholdValue/100)
    for (let y = 0; y < imgSource.length; y++) {
        thresholdImg[y] = []
        for (let x = 0; x < imgSource[0].length; x++)
            thresholdImg[y][x] = imgSource[y][x] > threshold ? 255 : 0
    }

    return thresholdImg
}

export const screen = function(imgSource, imgMask) {
    var screenImg = []

    for (let y = 0; y < imgSource.length; y++) {
        screenImg[y] = []
        for (let x = 0; x < imgSource[0].length; x++) {
            if (imgSource[y][x] === imgMask[y][x] && imgSource[y][x] === 0)
                screenImg[y][x] = 0
            else 
                screenImg[y][x] = 255
        }
    }

    return screenImg
}

// simplification of on https://en.wikipedia.org/wiki/Mathematical_morphology#Dilation
const setDilationValue = function(neighbors) {
    for (let x of neighbors) {
        for (let y of x) {
            if ( y < 255 ) return 0
        }
    }
    return 255
}
export const dilation = function(imgSource, radius = 5) {
    // create an empty image array
    var dilationImg = []
    for (let y of imgSource)
        dilationImg.push( new Array(y.length) )

    for(let y = 0; y < imgSource.length; y++) {
        for(let x = 0; x < imgSource[0].length; x++) {
            var neighbors = getNeighbors(imgSource, x, y, radius*2+1, true)
            dilationImg[y][x] = imgSource[y][x] === 0 ? 0 : setDilationValue(neighbors)
        }
    }

    return dilationImg
}

// implementation base on https://rosettacode.org/wiki/Zhang-Suen_thinning_algorithm#JavaScript
var nbrs = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]]
var nbrGroups = [[[0, 2, 4], [2, 4, 6]], [[0, 2, 6], [0, 4, 6]]]
var toWhite = new Array()

export const zsthinning = function(imgSource) {
    // clone Array
    var thinningImg = []
    for (let y of imgSource)
        thinningImg.push( y.slice(0) )

    var firstStep = false
    var hasChanged
    do {
        hasChanged = false
        firstStep = !firstStep
        for (var r = 1; r < thinningImg.length - 1; r++) {
            for (var c = 1; c < thinningImg[0].length - 1; c++) {
                if (thinningImg[r][c] !== 0)
                    continue
                var nn = numNeighbors(thinningImg, r, c)
                if (nn < 2 || nn > 6)
                    continue
                if (numTransitions(thinningImg, r, c) !== 1)
                    continue
                if (!atLeastOneIsWhite(thinningImg, r, c, firstStep ? 0 : 1))
                    continue
                toWhite.push({x:c, y:r})
                hasChanged = true
            }
        }
        for (let i = 0; i < toWhite.length; i++) {
            var p = toWhite[i]
            thinningImg[p.y][p.x] = 255
        }
        toWhite = new Array()
    } while ((firstStep || hasChanged))

    return thinningImg
}
var numNeighbors = function (imgSource, r, c) {
    var count = 0
    for (var i = 0; i < nbrs.length - 1; i++)
        if (imgSource[r + nbrs[i][1]][c + nbrs[i][0]] === 0)
            count++
    return count
}
var numTransitions = function (imgSource, r, c) {
    var count = 0
    for (var i = 0; i < nbrs.length - 1; i++)
        if (imgSource[r + nbrs[i][1]][c + nbrs[i][0]] === 255) {
            if (imgSource[r + nbrs[i + 1][1]][c + nbrs[i + 1][0]] === 0)
                count++
        }
    return count
}
var atLeastOneIsWhite = function (imgSource, r, c, step) {
    var count = 0
    var group = nbrGroups[step]
    for (var i = 0; i < 2; i++)
        for (var j = 0; j < group[i].length; j++) {
            var nbr = nbrs[group[i][j]]
            if (imgSource[r + nbr[1]][c + nbr[0]] === 255) {
                count++
                break
            }
        }
    return count > 1
}


