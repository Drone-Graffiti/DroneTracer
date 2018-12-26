var pscale = 8
function displayImage(url, x = 0, y = 0) {
    loadImage(url, img => image(img, 0, 0, img.width*pscale, img.height*pscale) )
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
    createCanvas(800, 800)
    rect(0, 0, width-1, height-1)
}

function draw() {
}
