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

function drawLine(p1, p2, c = color(0,255,0)) {
    push()
    noFill()
    stroke(c)
    line(p1.x*pscale, p1.y*pscale, p2.x*pscale, p2.y*pscale)
    pop()
}

function drawPath(path, c = false) {
    if (typeof(path) == 'string') path = JSON.parse(path)
    var col1 = color(255,0,0)
    var col2 = color(0,0,255)
    var col3 = color(0,255,0)
    for(let i = 0; i < path.length-1; i++) {
        var interpC = lerpColor(col1, col2, Math.min(path.length/2.0, i)/(path.length/2.0));
        interpC = lerpColor(interpC, col3, Math.max(0,i-path.length/2.0)/(path.length/2.0));
        //drawLine(path[i], path[i+1], c?c:interpC)
        drawLine(path[i], path[i+1])
        //drawPoint(path[i], color(0))
    }
}

function setup() {
    createCanvas(2000, 2000)
    rect(0, 0, width-1, height-1)
    colorMode(RGB); // Try changing to HSB.
    strokeWeight(pscale)
}

function draw() {
}
