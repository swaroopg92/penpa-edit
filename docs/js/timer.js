var sw_timer = new easytimer.Timer();

$('#stop_watch #sw_stop').click(function() {
    sw_timer.stop();
});

$('#stop_watch #sw_reset').click(function() {
    sw_timer.reset();
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