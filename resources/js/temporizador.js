$(document).ready(function() {
    var interval;

    $('#timerSelect').change(function() {
        clearInterval(interval);

        var selectedTime = parseInt($(this).val());
        var time = selectedTime * 60;
        var timerElement = $('#timer');

        interval = setInterval(function() {
            var minutes = Math.floor(time / 60);
            var seconds = time % 60;

            // Formatear los segundos para que siempre muestren dos dígitos
            seconds = seconds < 10 ? '0' + seconds : seconds;

            timerElement.text(minutes + ":" + seconds);

            if (time > 0) {
                time--;
            } else {
                clearInterval(interval);
                alert("¡El tiempo ha terminado!");
            }
        }, 1000);
    });
});