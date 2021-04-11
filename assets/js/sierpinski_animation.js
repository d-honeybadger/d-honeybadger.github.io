function drawTriangle() {
  'use strict';

  function init() {
    let canvas = document.getElementById('sierpinskiTriangle');
    if (!canvas.getContext) return;

    // size and position the canvas
    const cos60 = Math.sqrt(3)/2;
    canvas.style.width ='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = cos60*canvas.width;

    // animation parameters
    const sideLimit = Math.max(30, canvas.width/Math.pow(2, 5));
    let animationProgress = 0;
    const baseAnimationSpeed = 10; // for a side of 100px
    let animationSpeed = baseAnimationSpeed;
    const fps = 25;
    // params for the first (largest) triangle
    let origin = { x: canvas.width/2, y: canvas.height };
    let sideLength = canvas.width;

    const c = canvas.getContext('2d');
    // Helpers for drawing and animating
    function resetAnimation() {
      c.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      animationProgress = 0;
    }

    function setAnimationSpeed(sideLength) {
      animationSpeed = baseAnimationSpeed * sideLength / 100;
    }

    function drawTriangle(origin, sideLength, pointingUp, maxLineLength) {
      if (maxLineLength === undefined)  maxLineLength = Infinity;
      let upDownFactor = pointingUp ? 1 : -1;
      let lineLength = 0;
      c.moveTo(origin.x, origin.y);
      let increment = Math.min(sideLength, (maxLineLength - lineLength));
      let newX = origin.x + upDownFactor*increment/2;
      let newY = origin.y + upDownFactor*increment*cos60;
      c.lineTo(newX, newY);
      lineLength += increment;
      increment = Math.min(sideLength, (maxLineLength - lineLength));
      newX -= upDownFactor*increment;
      c.lineTo(newX, newY);
      lineLength += increment;
      increment = Math.min(sideLength, (maxLineLength - lineLength));
      newX += upDownFactor*increment/2;
      newY -= upDownFactor*increment*cos60;
      c.lineTo(newX, newY);
      lineLength += increment;
      return maxLineLength - lineLength;
    }

    //level 1, 2, ...
    function drawTrianglesRecursively(origin, sideLength,  maxLineLength) {
      if (maxLineLength === undefined)  maxLineLength = Infinity;
      // if animating, reset once all triangles are drawn
      if (isFinite(maxLineLength) && sideLength < sideLimit && maxLineLength >= 0) {
        resetAnimation();
        return sideLength;
      }
      //limit recursion by the size of the smallest triangle
      if (sideLength < sideLimit || maxLineLength <= 0) return sideLength;

      maxLineLength = drawTriangle(origin, sideLength, true, maxLineLength);

      // draw 3 triangles, one on each side
      sideLength = sideLength/2;
      
      let origins = [
        { x: origin.x - sideLength, y: origin.y },
        { x: origin.x, y: origin.y + 2*sideLength*cos60},
        { x: origin.x + sideLength, y: origin.y}
      ];
      let currAnimationSideLength
      for (let i = 0; i < origins.length; i++) {
        currAnimationSideLength = drawTrianglesRecursively(origins[i], sideLength, maxLineLength);
      }
      return currAnimationSideLength
    }

    //Background - draw triangle without animation
    function drawBackground() {
      c.strokeStyle = 'rgba(255, 255, 255, 0.13)';
      c.beginPath();
      drawTriangle(origin, sideLength, false);
      drawTrianglesRecursively({ x: sideLength/2, y: 0}, sideLength/2);
      c.stroke();
    }

    //Animate drawing
    function paintSierpinski() {
      c.strokeStyle = '#2997ff';
      c.beginPath();
      
      let maxLineLength = drawTriangle(origin, sideLength, false, animationProgress);
      let currSideLength = sideLength
      currSideLength = drawTrianglesRecursively({ x: sideLength/2, y: 0}, sideLength/2, maxLineLength);

      setAnimationSpeed(currSideLength)
      animationProgress += animationSpeed;

      maxLineLength = drawTriangle(origin, sideLength, false, animationProgress);
      currSideLength = sideLength
      currSideLength = drawTrianglesRecursively({ x: sideLength/2, y: 0}, sideLength/2, maxLineLength);
      
      c.stroke();
      
      setTimeout(function() { //slow down the animation to reduce CPU load
        window.requestAnimationFrame(paintSierpinski);
      }, 1000/fps);
    }


    // Set up canvas parameters (clear in case we're resizing)
    c.lineWidth = 1;
    c.lineJoin = 'bevel';

    // draw static triangles
    drawBackground();

    // animate
    window.requestAnimationFrame(paintSierpinski);
  }

  // Go!
  init();

  // Restart everything on window resize
  window.addEventListener('resize', function() {
    location.reload();
  });

};
