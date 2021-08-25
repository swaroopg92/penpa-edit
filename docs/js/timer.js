var sw_timer = new easytimer.Timer();

$('#stop_watch #sw_stop').click(function() {
    sw_timer.stop();
});

$('#stop_watch #sw_reset').click(function() {
    sw_timer.reset();
});

$('#stop_watch #sw_hide').click(function() {
    let timer_value = document.getElementById("timer");
    let hide_button = document.getElementById("sw_hide");
    if (hide_button.textContent === "Hide") {
        timer_value.style.display = "None";
        hide_button.textContent = "UnHide";
    } else {
        timer_value.style.display = "inline-block";
        hide_button.textContent = "Hide";
    }
});

sw_timer.addEventListener('secondsUpdated', function(e) {
    $('#stop_watch .values').html(sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']));
});

sw_timer.addEventListener('started', function(e) {
    $('#stop_watch .values').html(sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']));
});

sw_timer.addEventListener('reset', function(e) {
    $('#stop_watch .values').html(sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']));
    sw_timer.stop();
});

sw_timer.addEventListener('paused', function(e) {
    $('#stop_watch .values').html(sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']));
});