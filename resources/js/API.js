
function generarImagenes(prompt, seeds) {
    var promptCodificado = encodeURIComponent(prompt);
    var arrayUrls = [];
    for (var i = 0; i < seeds; i++) {
        arrayUrls.push('https://image.pollinations.ai/prompt/' + promptCodificado + '?nologo=true&enhance=true&seed=' + i + 1);
    }
    return arrayUrls;
}