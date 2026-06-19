import { H as Hls } from "./hls-dru42stk.js";

function setupHlsPlayer(video) {
    var source = video.getAttribute("data-src");

    if (!source) {
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                return;
            }

            hls.destroy();
        });

        video.addEventListener("emptied", function () {
            hls.destroy();
        }, { once: true });
    } else {
        video.src = source;
    }
}

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    document.querySelectorAll("video[data-src]").forEach(setupHlsPlayer);
});
