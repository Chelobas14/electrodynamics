let arr = [];

for (let x = 0; x < w / box; x++) {
    arr.push([]);
    for (let y = 0; y < h / box; y++) {
        arr[x].push(new Point(x, y));
    }
}
let time = 0;
let maxlenE;
let game = setInterval(() => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w / box; x++) {
        for (let y = 0; y < h / box; y++) {
            arr[x][y].E = { x: 0, y: 0 };
            arr[x][y].B = { x: 0, y: 0 };
            for (let i = 0; i < objs.length; i++) {
                let sE = { x: x - objs[i].x, y: y - objs[i].y };
                let len = vecMod(sE);
                sE = vecNorm(sE);
                sE = vecMultScalar(sE, k * objs[i].q / len ** 2);
                arr[x][y].E = vecSum([arr[x][y].E, sE])

                sB = getVectFromAngle(
                    (mu / 4 * 3.14) * (Math.abs(objs[i].q) * vecMod(objs[i].v) * getSinBtw(objs[i].v, { x: x - objs[i].x, y: y - objs[i].y })) / (vecMod({ x: x - objs[i].x, y: y - objs[i].y })) ** 2, -3.14 / 2);

                arr[x][y].B = vecSum([arr[x][y].B, sB])

            }
            maxlenE = vecMod(arr[0][0].E);
            if (vecMod(arr[x][y].E) > maxlenE) maxlenE = vecMod(arr[x][y].E);

        }
    }
    for (let i = 0; i < objs.length; i++) {
        objs[i].f = { x: 0, y: 0 };
        for (let j = 0; j < objs.length; j++) {
            if (i != j) {
                let sF = { x: objs[j].x - objs[i].x, y: objs[j].y - objs[i].y };
                let lenF = vecMod({ x: objs[j].x - objs[i].x, y: objs[j].y - objs[i].y })
                sF = vecNorm(sF);
                sF = vecMultScalar(sF, k * objs[i].q * objs[j].q / lenF ** 2);
                objs[i].f = vecSum([objs[i].f, sF])
            }
        }
    }
    for (let i = 0; i < objs.length; i++) {
        objs[i].a = { x: 1, y: 1 };
        objs[i].a = vecNorm(objs[i].f);
        objs[i].a = vecMultScalar(objs[i].f, 1 / objs[i].m);
        objs[i].v.x += objs[i].a.x / 1000;
        objs[i].v.y += objs[i].a.y / 1000;
        objs[i].x += objs[i].v.x / 1000;
        objs[i].y += objs[i].v.y / 1000;
    }
    for (let x = 0; x < w / box; x++) {
        for (let y = 0; y < h / box; y++) {
            ctx.fillStyle = `rgb(${vecMod(arr[x][y].B) * 1 * 10 ** 15}, 0, ${vecMod(arr[x][y].E)})`;
            ctx.fillRect(x * box, y * box, box, box);
        }
    }
    //obj.y++;
    time += 1;
}, 1)
