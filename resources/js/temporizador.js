function iniciarTemporizador(selectedTime) {
    var interval;
    var time = selectedTime * 60;
    var timerElement = $('#timer');

    interval = setInterval(function() {
        var minutes = Math.floor(time / 60);
        var seconds = time % 60;

        seconds = seconds < 10 ? '0' + seconds : seconds;

        timerElement.text(minutes + ":" + seconds);

        if (time > 0) {
            time--;
        } else {
            clearInterval(interval);
            alert("¡El tiempo ha terminado!");
        }
    }, 1000);
}