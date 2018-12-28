var pscale = 3
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

function drawPath(path, c = false) {
    if (typeof(path) == 'string') path = JSON.parse(path)
    var col1 = color(255,0,0)
    var col2 = color(0,0,255)
    var col3 = color(0,255,0)
    var cnt = 0
    for(let p of path) {
        var interpC = lerpColor(col1, col2, Math.min(path.length/2.0, cnt)/(path.length/2.0));
        interpC = lerpColor(interpC, col3, Math.max(0,cnt-path.length/2.0)/(path.length/2.0));
        drawPoint(p.x, p.y, c?c:interpC)
        cnt++
    }
}

function setup() {
    createCanvas(1400, 1400)
    rect(0, 0, width-1, height-1)
    colorMode(RGB); // Try changing to HSB.
}

function draw() {
}
