.pragma library

.import "../util/url.js" as URL
.import "../util/util.js" as Util

var BMW_HOST = 'data.api.hackthedrive.com';

function makeBMWGetRequest(apiToken, resource, parameters, successCallback) {
    var url = URL.createHttpUrl(BMW_HOST, resource, parameters);
    var request = new XMLHttpRequest;
    request.open("GET", url)
    request.setRequestHeader("MojioAPIToken", "69e0e0dc-b17e-444b-9b53-fe0bf6c06299")
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            if (request.status === 200) {
                successCallback(JSON.parse(request.responseText))
            } else {
                console.error('Resource ' + resource + ' not found. Response: \n' + request.responseText)
            }
        }
    }

    request.send()
}

function sampleVehicleSpeed(apiToken, vehicleId, callback) {
    makeBMWGetRequest(apiToken, '/v1/Vehicles/' + vehicleId, {}, function (response) {
        var date = new Date(Util.valueOfPath('LastContactTime', response))
        callback(Util.valueOfPath('LastSpeed', response), date)
    })
}
