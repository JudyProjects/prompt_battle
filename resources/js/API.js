
function generarImagenes(prompt, seeds) {
    let promptCodificado = encodeURIComponent(prompt);
    let arrayUrls = [];
    for (let i = 0; i < seeds; i++) {
        let seed = i + 1;
        arrayUrls.push(`https://image.pollinations.ai/prompt/${promptCodificado}?nologo=true&enhance=true&seed=${seed}`);
    }
    return arrayUrls;
}