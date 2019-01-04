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
    for (let y = 0; y < imgSource.length; y++) {
        for (let x = 0; x < imgSource[0].length; x++) {
            var current = imgSource[y][x]
            var neighbors = getNeighbors(imgSource, x, y, neighborSize) 
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

