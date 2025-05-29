const getVectFromAngle = (len, angle) => {
    return { x: len * Math.cos(angle), y: len * Math.sin(angle) }
}
const vecSum = (vecs) => {
    sumX = 0
    sumY = 0
    for (let i = 0; i < vecs.length; i++) {
        sumX += vecs[i].x
        sumY += vecs[i].y
    }

    return { x: sumX, y: sumY }
}

const vecMod = (vec) => {
    return Math.sqrt(vec.x ** 2 + vec.y ** 2)
}

const vecNorm = (vec) => {
    return { x: vec.x / vecMod(vec), y: vec.y / vecMod(vec) }
}

const vecMultScalar = (vec, num) => {
    return { x: vec.x * num, y: vec.y * num }
}

const getSinBtw = (v1, v2) => {
    let scal = v1.x * v2.x + v1.y * v2.y;
    let cosBtw = scal / vecMod(v1) / vecMod(v2);
    return (1 - cosBtw ** 2) ** 0.5;
}