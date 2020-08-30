const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const webcam = new Webcam(webcamElement, 'user', canvasElement);

$(function () {
    console.log("document is ready")
    webcam.start()
    .then(result => {
        console.log("webcam started");
    })
    .catch(err => {
        console.log(err);
    })
})
// webcam.stop()
$(function() {
    var params = {
        // Request parameters
        "visualFeatures": "Brand",
        // "details": "{string}",
        "language": "en",
    };
    let picture = webcam.snap();
    $.ajax({
        url: "http://localhost:5000" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","{subscription key}");
        },
        type: "POST",
        // Request body
        data: {
            imageUrl: picture,
        },
    })
    .done(function(data) {
        alert("success");
    })
    .fail(function() {
        alert("error");
    });
});