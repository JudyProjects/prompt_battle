function eliminarAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generarImagenes(prompt, seeds) {
    // Eliminar acentos del prompt
    let promptLimpio = eliminarAcentos(prompt);
    let promptCodificado = encodeURIComponent(promptLimpio);
    let arrayUrls = [];
    for (let i = 0; i < seeds; i++) {
        let seed = i + 1;
        arrayUrls.push(`https://image.pollinations.ai/prompt/${promptCodificado}?nologo=true&enhance=true&seed=${seed}`);
    }
    return arrayUrls;
}