// read image file from File API
export const readImage = function(imageFile) {
    var reader = new FileReader()

    return new Promise( (resolve) => {
        reader.onload = function(e) {
            resolve(e.target.result)
        }
        // Read in the image file as a data URL.
        reader.readAsDataURL(imageFile)
    })
}

export const isAnImageFile = function(file) {
    if (!file.type.match('image.*')) return false
    return true
}
