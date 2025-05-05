var sw_timer = new easytimer.Timer();

$('#stop_watch #sw_stop').click(function() {
    sw_timer.stop();
});

$('#stop_watch #sw_reset').click(function() {
    let timer_running = sw_timer.isRunning();
    sw_timer.reset();
    if (timer_running) {
        sw_timer.start();
    }
});

$('#stop_watch #sw_hide').click(function() {
    let timer_value = document.getElementById("timer");
    let hide_button = document.getElementById("sw_hide");
    if (hide_button.getAttribute('data-mode') === "hide") {
        timer_value.style.display = "none";
        hide_button.setAttribute('data-mode', 'show');
        hide_button.textContent = PenpaText.get('show');
    } else {
        timer_value.style.display = "inline-block";
        hide_button.setAttribute('data-mode', 'hide');
        hide_button.textContent = PenpaText.get('hide');
    }
});

function timer_update() {
    $('#stop_watch .values').html(sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']));
}

sw_timer.addEventListener('secondsUpdated', timer_update);
sw_timer.addEventListener('started', timer_update);

sw_timer.addEventListener('reset', function(e) {
    timer_update();
    sw_timer.stop();
});

sw_timer.addEventListener('paused', timer_update);