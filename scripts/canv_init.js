const canv = document.querySelector("canvas");
canv.width = canv.style.width = w;
canv.height = canv.style.height = h;

const ctx = canv.getContext('2d');
ctx.fillStyle = "black";
ctx.fillRect(0, 0, w, h);