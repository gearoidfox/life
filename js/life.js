"use strict";

var lifeCanvas = document.getElementById("lifeCanvas");
var lctx = lifeCanvas.getContext("2d");
var height = window.innerHeight;
var width = window.innerWidth;

lifeCanvas.width = width;
lifeCanvas.height = height;
var updating = false;
var paused = false;
var side = 4;
var grid;
var toggled;
var drawing=false;
var rows;
var cols;
var mini = document.getElementById("mini");
var controls = document.getElementById("controls");
var pauseButton = document.getElementById("pausebutton");
var resumeButton = document.getElementById("resumebutton");
var stepButton = document.getElementById("stepbutton");
var tickTimeout
lifeCanvas.addEventListener("mousedown", mouseDown, false);
lifeCanvas.addEventListener("mousemove", mouseMove, false);
lifeCanvas.addEventListener("mouseup", mouseUp, false);

initLife();
randomise();
drawLife();
tick();

/* Create a grid to fill the window and intialise with random values.
*/
function initLife()
{
  lctx.strokeStyle = "#eeeeee";
  lctx.fillStyle = "#11cc77";
  rows = Math.ceil(height/side);
  cols = Math.ceil(width/side);
  grid = new Array(cols);
  toggled = new Array(cols);
  var i, j;
  for (i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    toggled[i] = new Array(rows);
    for (j = 0; j < rows; j++) {
      grid[i][j] = false;
      toggled[i][j] = false;
    }
  }
}

/* Randomise grid
*/
function randomise()
{
  var i, j;
  var density = document.getElementById("density").value;
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      grid[i][j] = Math.random() >= (1-density) ? true : false;
    }
  }
  drawLife();
}

function clearGrid()
{
  var i, j;
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      grid[i][j] = false;
    }
  }
  drawLife();
}

/* tick: advance simulation one step
*/
function tick()
{
  if(updating)return;
  updating=true;
  var i, j;
  // New matrix
  var gridNext = new Array(cols);
  for (i = 0; i < cols; i++) {
    gridNext[i] = new Array(rows);
    for (j = 0; j < rows; j++) {
      gridNext[i][j] = false;
    }
  }
  var wrap = document.getElementById("wrap").checked;
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      let count = 0;
      if (        i >  0 && grid[i-1][j])    count++;
      if (wrap && i == 0 && grid[cols-1][j]) count++;

      if (        j >  0 && grid[i][j-1])    count++;
      if (wrap && j == 0 && grid[i][rows-1]) count++;

      if (        j <  rows-1 && grid[i][j+1]) count++;
      if (wrap && j == rows-1 && grid[i][0])   count++;

      if (        i <  cols-1 && grid[i+1][j]) count++;
      if (wrap && i == cols-1 && grid[0][j])   count++;

      if (        i >  0 && j >  0 && grid[i-1][j-1])       count++;
      if (wrap && i == 0 && j >  0 && grid[cols-1][j-1])    count++;
      if (wrap && i >  0 && j == 0 && grid[i-1][rows-1])    count++;
      if (wrap && i == 0 && j == 0 && grid[cols-1][rows-1]) count++;

      if (        i <  cols-1 && j <  rows-1 && grid[i+1][j+1]) count++;
      if (wrap && i == cols-1 && j <  rows-1 && grid[0][j+1])   count++;
      if (wrap && i <  cols-1 && j == rows-1 && grid[i+1][0])   count++;
      if (wrap && i == cols-1 && j == rows-1 && grid[0][0])     count++;

      if (        i <  cols-1 && j >  0 && grid[i+1][j-1])    count++;
      if (wrap && i == cols-1 && j >  0 && grid[0][j-1])      count++;
      if (wrap && i <  cols-1 && j == 0 && grid[i+1][rows-1]) count++;
      if (wrap && i == cols-1 && j == 0 && grid[0][rows-1])   count++;

      if (        i >  0 && j <  rows-1 && grid[i-1][j+1])    count++;
      if (wrap && i == 0 && j <  rows-1 && grid[cols-1][j+1]) count++;
      if (wrap && i >  0 && j == rows-1 && grid[i-1][0])      count++;
      if (wrap && i == 0 && j == rows-1 && grid[cols-1][0])   count++;

      if (count == 3) gridNext[i][j] = true;
      if (count == 2 && grid[i][j]) gridNext[i][j] = true;
    }
  }
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      grid[i][j] = gridNext[i][j];
    }
  }
  drawLife();
  let speed = document.getElementById("speed").value;
  let ms = 1000 * (1/(speed * speed))
  tickTimeout=setTimeout(tick, ms);
  updating=false;
}

/* Pause and resume 
*/
function pause()
{
  paused=true
  pauseButton.style.visibility="hidden";
  resumeButton.style.visibility="visible";
  pauseButton.style.float="left";
  resumeButton.style.float="right";
  stepButton.style.visibility="visible";
  clearTimeout(tickTimeout);
}

function resume()
{
  paused=false
  pauseButton.style.visibility="visible";
  resumeButton.style.visibility="hidden";
  pauseButton.style.float="right";
  resumeButton.style.float="left";
  stepButton.style.visibility="hidden";
  let speed = document.getElementById("speed").value;
  let ms = 1000 * (1/(speed * speed))
  tickTimeout=setTimeout(tick, ms);
}

function step()
{
  tick();
  clearTimeout(tickTimeout);
}

/* Draw grid onto canvas
*/
function drawLife()
{
  var i, j;
  lctx.fillStyle = "#eeffdd";
  lctx.fillRect(0, 0, width, height);
  lctx.fillStyle = "#11cc77";
  for (i = 0; i < cols; i++) {
    for (j = 0; j < rows; j++) {
      if (grid[i][j] == false) {
        //
      } else {
        lctx.fillRect(i*side, j*side, side, side);
      }
    }
  }
  lctx.stroke();
}

/* Handle window resize events.
 *
 * Want to call resize() just once per window resize.
 *
 * - Listen for resize events and call onresize()
 * - resize() called 500ms after last call to onresize()
 */
window.addEventListener("resize", onresize, false);

var timeOut = null;
function onresize()
{
  if(timeOut!=null)clearTimeout(timeOut);
  timeOut=setTimeout(resize,500);
}

function resize()
{
  height = window.innerHeight;
  width = window.innerWidth;
  lifeCanvas.width=width;
  lifeCanvas.height=height;
  var newCols, newRows;
  newRows = Math.ceil(height/side);
  newCols = Math.ceil(width/side);
  // New matrix
  var i, j;
  var gridNext = new Array(newCols);
  for (i = 0; i < newCols; i++) {
    gridNext[i] = new Array(newRows);
    for (j = 0; j < newRows; j++) {
      if(j<rows && i<cols){
        gridNext[i][j] = grid[i][j];
      } else {
        gridNext[i][j] = false;
      }
    }
  }
  cols = newCols;
  rows = newRows;
  grid = new Array(cols);
  toggled = new Array(cols);
  var i, j;
  for (i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    toggled[i] = new Array(rows);
    for (j = 0; j < rows; j++) {
      grid[i][j] = gridNext[i][j];
      toggled[i][j] = false;
    }
  }
  lctx = lifeCanvas.getContext("2d");
  lctx.strokeStyle = "#eeeeee";
  lctx.fillStyle = "#11cc77";
  drawLife();
}

/* Hide and unhide the menu
*/
function unhide()
{
  mini.style.visibility="hidden";
  controls.style.visibility="visible";
  if (paused) {
    stepButton.style.visibility="visible";
    resumeButton.style.visibility="visible";
  } else {
    pauseButton.style.visibility="visible";
  }
}

function hide()
{
  mini.style.visibility="visible";
  controls.style.visibility="hidden";
  pauseButton.style.visibility="hidden";
  stepButton.style.visibility="hidden";
  resumeButton.style.visibility="hidden";
}


/* Draw cells on canvas
*/ 
function mouseDown(event) {
  drawing=true;
  let mouseY =  event.offsetY;
  let mouseX =  event.offsetX;
  let gridX = Math.floor(mouseX/side);
  let gridY = Math.floor(mouseY/side);
  grid[gridX][gridY] = !grid[gridX][gridY];
  var i,j;
  for (i=0; i<cols; i++) {
    for (j=0; j<rows; j++) {
      toggled[i][j]=false;
    }
  }
  toggled[gridX][gridY] = true;
  drawLife();
}

function mouseMove(event) {
  let mouseY =  event.offsetY;
  let mouseX =  event.offsetX;
  let gridX = Math.floor(mouseX/side);
  let gridY = Math.floor(mouseY/side);
  if (drawing && !toggled[gridX][gridY]) {
    grid[gridX][gridY] = !grid[gridX][gridY];
    toggled[gridX][gridY] = true;
    drawLife();
  }
}

function mouseUp(event) {
  drawing=false;
}
