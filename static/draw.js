var drawFlag = false;
var oldX = 0;
var oldY = 0;
var timeoutId = null;

window.onload = function(){
    clear();
}

window.addEventListener("load", function(){
    var can = document.getElementById("canvas");
    can.addEventListener("mousemove", draw, true);
    can.addEventListener("mousedown", drawStart, false);
    can.addEventListener("mouseup", drawEnd, false);
    can.addEventListener("mouseout", drawEnd, false);
    if(window.TouchEvent){
        can.addEventListener("touchstart", drawTouchStart);
        can.addEventListener("touchmove", drawTouch);
        can.addEventListener("touchend", drawEnd);
    }
}, true);

function clear(){
    var can = document.getElementById("canvas");
    var ctx = can.getContext('2d');
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0,0,can.width,can.height);
}

function preventScroll(e){
    
}

function drawStart(e){
    if(timeoutId !== null){
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    drawFlag = true;
    var rect = e.target.getBoundingClientRect();
    oldX = e.clientX - rect.left;
    oldY = e.clientY - rect.top;
}

function drawTouchStart(e){
    e.preventDefault();
    if(timeoutId !== null){
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    drawFlag = true;
    var rect = e.target.getBoundingClientRect();
    oldX = e.touches[0].clientX - rect.left;
    oldY = e.touches[0].clientY - rect.top;
}


function drawEnd(){
    if(timeoutId === null){
        timeoutId = setTimeout(post, 1000);
    }
    drawFlag = false;
}

function draw(e){
    if (!drawFlag) return;
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var can = document.getElementById("canvas");
    var context = can.getContext("2d");
    _draw(context, x, y);
}

function drawTouch(e){
    e.preventDefault();
    if (!drawFlag) return;
    var rect = e.target.getBoundingClientRect();
    var x = e.touches[0].clientX - rect.left;
    var y = e.touches[0].clientY - rect.top;
    var can = document.getElementById("canvas");
    var context = can.getContext("2d");
    _draw(context, x, y);
}

function _draw(context, x, y){
    context.strokeStyle = "rgba(0,0,0,1)";
    context.lineWidth = 30;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(oldX, oldY);
    context.lineTo(x, y);
    context.stroke();
    context.closePath();
    oldX = x;
    oldY = y;
}

function post() {
    var org = document.getElementById("canvas");
    var thm = document.getElementById("cantmb");
    var ctx = thm.getContext('2d');
    var img = new Image();
    img.onload = function(event){
        ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, 28, 28);
        var cArray = ctx.getImageData(0, 0, 28, 28).data;
        var bArray = convBinary(cArray);
        
        $.ajax({
            url: '/recognize',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(bArray),
            success: (data) => {
                $('#result').text(data.result);
                $('#similarity1').text(data.rank[0] + ' (' +  data.rate[0] + ')');
                $('#similarity2').text(data.rank[1] + ' (' +  data.rate[1] + ')');
                $('#similarity3').text(data.rank[2] + ' (' +  data.rate[2] + ')');
            }
        });
    }
    img.src = org.toDataURL();
    clear();
}

function convBinary(colorImg){
    var array =[];
    for (var i = 0; i < 28; i++){
        for (var j = 0; j < 28; j++){
            var idx = (i * 28 + j) * 4;
            array[i*28+j] = (255 - Math.floor(
                colorImg[idx+0] * 0.298912 + 
                colorImg[idx+1] * 0.586611 + 
                colorImg[idx+2] * 0.114478)) / 255.0;
        }
    }
    return array;
}


function post2() {
    var org = document.getElementById("canvas2");
    var thm = document.getElementById("cantmb");
    var ctx = thm.getContext('2d');
    var img = new Image();
    img.onload = function(event){
        ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, 56, 56);
        var cArray = ctx.getImageData(0, 0, 56, 56).data;
        var bArray = convBinary(cArray);
        
        $.ajax({
            url: '/emotionapi',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(bArray),
            success: (data) => {
                $('#result').text(data.result);
            }
        });
    }
    img.src = org.toDataURL();
}

function convBinary2(colorImg){
    var array =[];
    for (var i = 0; i < 56; i++){
        for (var j = 0; j < 56; j++){
            var idx = (i * 56 + j) * 4;
            array[i*56+j] = (255 - Math.floor(
                colorImg[idx+0] * 0.298912 + 
                colorImg[idx+1] * 0.586611 + 
                colorImg[idx+2] * 0.114478)) / 255.0;
        }
    }
    return array;
}
