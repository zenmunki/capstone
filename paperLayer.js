
    var gl;
    function initGL(canvas) {
      try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
      } catch (e) {
      }
      if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
      }
    }

    function getShader(gl, id) {
      var shaderScript = document.getElementById(id);
      if (!shaderScript) {
        return null;
      }

      var str = "";
      var k = shaderScript.firstChild;
      while (k) {
        if (k.nodeType == 3) {
          str += k.textContent;
        }
        k = k.nextSibling;
      }

      var shader;
      if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
      } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
      } else {
        return null;
      }

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
      }

      return shader;
    }

    var shaderProgram;

    function initVariableLocations() {
     shaderProgram.positionLocation=gl.getAttribLocation(shaderProgram,"a_position");
     gl.enableVertexAttribArray(shaderProgram.positionLocation);

     shaderProgram.colorLocation=gl.getUniformLocation(shaderProgram, "u_color");
     gl.uniform4f(shaderProgram.colorLocation, 0, 1, 0, 1);

     shaderProgram.mvMatrixLocation=gl.getUniformLocation(shaderProgram, "u_MVMatrix");
     shaderProgram.pMatrixLocation=gl.getUniformLocation(shaderProgram, "u_PMatrix");
    }

    function initShaders() {
      var fragmentShader = getShader(gl, "shader-fs");
      var vertexShader = getShader(gl, "shader-vs");

      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
      }

      gl.useProgram(shaderProgram);

      initVariableLocations();
    }

    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixLocation, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixLocation, false, mvMatrix);
    }

    var FVertexPositionBuffer;

    function initScene(){
      FVertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,FVertexPositionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        /*new Float32Array([
              // left column
              0,   0,  0,
              30,   0,  0,
              0, 150,  0,
              0, 150,  0,
              30,   0,  0,
              30, 150,  0,

              // top rung
              30,   0,  0,
              100,   0,  0,
              30,  30,  0,
              30,  30,  0,
              100,   0,  0,
              100,  30,  0,

              // middle rung
              30,  60,  0,
              67,  60,  0,
              30,  90,  0,
              30,  90,  0,
              67,  60,  0,
              67,  90,  0]), 2D = 18 items*/
        new Float32Array([0,0,0,30,0,0,0,150,0,0,150,0,30,0,0,30,150,0,30,0,0,100,0,0,30,30,0,30,30,0,100,0,0,100,30,0,30,60,0,67,60,0,30,90,0,30,90,0,67,60,0,67,90,0,0,0,30,30,0,30,0,150,30,0,150,30,30,0,30,30,150,30,30,0,30,100,0,30,30,30,30,30,30,30,100,0,30,100,30,30,30,60,30,67,60,30,30,90,30,30,90,30,67,60,30,67,90,30,0,0,0,100,0,0,100,0,30,0,0,0,100,0,30,0,0,30,100,0,0,100,30,0,100,30,30,100,0,0,100,30,30,100,0,30,30,30,0,30,30,30,100,30,30,30,30,0,100,30,30,100,30,0,30,30,0,30,30,30,30,60,30,30,30,0,30,60,30,30,60,0,30,60,0,30,60,30,67,60,30,30,60,0,67,60,30,67,60,0,67,60,0,67,60,30,67,90,30,67,60,0,67,90,30,67,90,0,30,90,0,30,90,30,67,90,30,30,90,0,67,90,30,67,90,0,30,90,0,30,90,30,30,150,30,30,90,0,30,150,30,30,150,0,0,150,0,0,150,30,30,150,30,0,150,0,30,150,30,30,150,0,0,0,0,0,0,30,0,150,30,0,0,0,0,150,30,0,150,0]),
        gl.STATIC_DRAW);
      FVertexPositionBuffer.itemSize = 3;
      FVertexPositionBuffer.numItems = 96;

      gl.vertexAttribPointer(shaderProgram.positionLocation,FVertexPositionBuffer.itemSize,gl.FLOAT,false,0,0);
    }

    var boundingSphereRadius = 100;
    var eye = [0, 0, -boundingSphereRadius];
    var center = [0, 0, 0];
    var up = [0, 1, 0];

    function drawScene(){
    	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      mat4.ortho(pMatrix, -gl.viewportWidth/2, gl.viewportWidth/2, 
        -gl.viewportHeight/2, gl.viewportHeight/2, 
        0.1, 2*boundingSphereRadius);

      //mat4.identity(mvMatrix);
      mat4.lookAt(mvMatrix, [0, 0, 100], [0, 0, 0], [0, 1, 0]);

      //Draw
      setMatrixUniforms();
      gl.drawArrays(gl.TRIANGLES,0,FVertexPositionBuffer.numItems);
    }

    function webGLStart(){
      var canvas=document.getElementById("webGLcanvas");
      initGL(canvas);
      initShaders();
      initScene();

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);

      drawScene();
    }