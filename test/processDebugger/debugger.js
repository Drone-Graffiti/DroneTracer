var pscale = 2
function displayImage(url, x = 1, y = 1) {
    loadImage(url, img => image(img, x*pscale, y*pscale, img.width*pscale, img.height*pscale) )
}

function drawPoint(x, y, c = color(0,255,0)) {
    push()
    fill(c)
    noStroke()
    rect(x*pscale, y*pscale, pscale, pscale)
    pop()
}

function drawPath(path, c = color(255,0,100)) {
    if (typeof(path) == 'string') path = JSON.parse(path)
    for(let p of path)
        drawPoint(p.x, p.y, c)
}

function setup() {
    createCanvas(1000, 1000)
    rect(0, 0, width-1, height-1)
}

function draw() {
}
