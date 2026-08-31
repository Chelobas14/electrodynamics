const canvas = document.getElementById('canv');
canvas.width = w;
canvas.height = h;

const gl = canvas.getContext('webgl2');
if (!gl) {
    alert('WebGL 2 not supported');
    throw new Error('WebGL 2 not supported');
}

// Shader sources
const vsSource = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_texCoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
}`;

const fsSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int u_numObjs;
uniform vec4 u_objs[10];
uniform float u_k;
uniform float u_mu;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
    vec2 gridPos = v_texCoord * u_resolution;
    vec2 fieldE = vec2(0.0);
    vec2 fieldB = vec2(0.0);
    
    for (int i = 0; i < u_numObjs; i++) {
        vec4 obj = u_objs[i];
        vec2 objPos = obj.xy;
        float charge = obj.z;
        float vLen = obj.w;
        
        vec2 sE = gridPos - objPos;
        float len = length(sE);
        if (len > 1.0) {
            vec2 normE = normalize(sE);
            fieldE += normE * (u_k * charge / (len * len));
            
            vec2 toPoint = gridPos - objPos;
            float sinAngle = abs(toPoint.y) / max(len, 1.0);
            float bMagnitude = (u_mu / (4.0 * 3.14159)) * (abs(charge) * vLen * sinAngle) / (len * len);
            fieldB += vec2(-bMagnitude * toPoint.y / len, bMagnitude * toPoint.x / len);
        }
    }
    
    float eMag = length(fieldE);
    float bMag = length(fieldB);
    
    float r = clamp(bMag * 1e14, 0.0, 1.0);
    float g = 0.0;
    float b = clamp(eMag * 1e-10, 0.0, 1.0);
    
    fragColor = vec4(r, g, b, 1.0);
}`;

// Compile shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create program
const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// Create buffer for full-screen quad
const positions = new Float32Array([
    -1, -1,  0, 0,
     1, -1,  1, 0,
    -1,  1,  0, 1,
    -1,  1,  0, 1,
     1, -1,  1, 0,
     1,  1,  1, 1,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const aPosition = gl.getAttribLocation(program, 'a_position');
const aTexCoord = gl.getAttribLocation(program, 'a_texCoord');

gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);

gl.enableVertexAttribArray(aTexCoord);
gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

// Uniform locations
const uResolution = gl.getUniformLocation(program, 'u_resolution');
const uNumObjs = gl.getUniformLocation(program, 'u_numObjs');
const uObjs = gl.getUniformLocation(program, 'u_objs');
const uK = gl.getUniformLocation(program, 'u_k');
const uMu = gl.getUniformLocation(program, 'u_mu');

// Set static uniforms
gl.uniform2f(uResolution, w, h);
gl.uniform1f(uK, k);
gl.uniform1f(uMu, mu);

// Physics update loop
function updatePhysics() {
    for (let i = 0; i < objs.length; i++) {
        objs[i].f = { x: 0, y: 0 };
        for (let j = 0; j < objs.length; j++) {
            if (i !== j) {
                let dx = objs[j].x - objs[i].x;
                let dy = objs[j].y - objs[i].y;
                let lenF = Math.sqrt(dx * dx + dy * dy);
                if (lenF > 0) {
                    let sF = { x: dx / lenF, y: dy / lenF };
                    let force = k * objs[i].q * objs[j].q / (lenF * lenF);
                    objs[i].f.x += sF.x * force;
                    objs[i].f.y += sF.y * force;
                }
            }
        }
    }
    
    for (let i = 0; i < objs.length; i++) {
        let ax = objs[i].f.x / objs[i].m;
        let ay = objs[i].f.y / objs[i].m;
        objs[i].v.x += ax / 1000;
        objs[i].v.y += ay / 1000;
        objs[i].x += objs[i].v.x / 1000;
        objs[i].y += objs[i].v.y / 1000;
    }
}

// Render loop
function render() {
    updatePhysics();
    
    // Prepare object data for shader
    const objData = [];
    for (let i = 0; i < objs.length && i < 10; i++) {
        let vLen = Math.sqrt(objs[i].v.x ** 2 + objs[i].v.y ** 2);
        objData.push(objs[i].x, objs[i].y, objs[i].q, vLen);
    }
    
    // Pad with zeros if less than 10 objects
    while (objData.length < 40) {
        objData.push(0);
    }
    
    gl.uniform1i(uNumObjs, objs.length);
    gl.uniform4fv(uObjs, new Float32Array(objData));
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    requestAnimationFrame(render);
}

render();
