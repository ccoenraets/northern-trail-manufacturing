var content = document.getElementById('content');
var mixes;

function renderMixList() {
    var html = '';
    mixes.forEach(function(mix) {
        html = html + '<div class="row">' + renderMix(mix) + '</div>';
    });
    content.innerHTML = html;
}

function renderMix(mix, isAnimated) {
    return `
        <div class="col-sm-12">
            <div class="panel panel-primary ${isAnimated?"animateIn":""}">
                <div class="panel-heading">Mix ID: ${mix.mixId}</div>
                <div class="panel-body">
                    <div class="col-md-12 col-lg-7">
                        <table>
                            <tr>
                                <td class="panel-table-label">Customer:</td><td>${mix.account}</td>
                            </tr>
                            <tr>
                                <td class="panel-table-label">Mix Name:</td><td>${mix.mixName}</td>
                            </tr>
                        </table>
                    </div>   
                    <div class="col-md-12 col-lg-5">
                        <button class="btn btn-info" onclick="getMixDetails('${mix.mixId}')">
                            <span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>
                            View Details
                        </button>
                        <button class="btn btn-info" onclick="approveMix('${mix.mixId}')">
                            <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>
                            Approve
                        </button>
                    </div>
                    <div id="details-${mix.mixId}" class="col-md-12"></div>
                </div>
            </div>
        </div>`;
}

// Render the merchandise list for a mix
function renderMixDetails(mix, items) {
    var html = `
        <table class="table">
            <tr>
                <th colspan="2">Product</th>
                <th>MSRP</th>
                <th>Qty</th>
            </tr>`;
    items.forEach(function(item) {
        html = html + `
            <tr>
                <td><img src="${item.pictureURL}" style="height:50px"/></td>
                <td>${item.productName}</td>
                <td>$${item.price}</td>
                <td>${item.qty}</td>
            </tr>`
    });
    html = html + "</table>"    
    var details = document.getElementById('details-' + mix.mixId);
    details.innerHTML = html;
}

function deleteMix(mixId) {
    var index = mixes.length - 1;
    while (index >= 0) {
        if (mixes[index].mixId === mixId) {
            mixes.splice(index, 1);
        }
        index -= 1;
    }
}

var socket = io.connect();

socket.on('mix_submitted', function (newMix) {
    // if the mix is alresdy in the list: do nothing
    var exists = false;
    mixes.forEach((mix) => {
        if (mix.mixId == newMix.mixId) {
            exists = true;
        }
    });
    // if the mix is not in the list: add it
    if (!exists) {
        mixes.push(newMix);
        var el = document.createElement("div");
        el.className = "row";
        el.innerHTML = renderMix(newMix, true);
        content.insertBefore(el, content.firstChild);
    }
});

socket.on('mix_unsubmitted', function (data) {
    deleteMix(data.mixId);
    renderMixList();
});

// Retrieve the existing list of mixes from Node server
function getMixList() {
    var xhr = new XMLHttpRequest(),
        method = 'GET',
        url = '/mixes';

    xhr.open(method, url, true);
    xhr.onload = function () {
        mixes = JSON.parse(xhr.responseText);
        renderMixList();
    };
    xhr.send();
}

// Retrieve the merchandise list for a mix from Node server
function getMixDetails(mixId) {
    var details = document.getElementById('details-' + mixId);
    if (details.innerHTML != '') {
        details.innerHTML = '';
        return;
    }
    var mix;
    for (var i=0; i<mixes.length; i++) {
        if (mixes[i].mixId = mixId) {
            mix = mixes[i];
            break;
        }
    };
    var xhr = new XMLHttpRequest(),
        method = 'GET',
        url = '/mixes/' + mixId;

    xhr.open(method, url, true);
    xhr.onload = function () {
        var items = JSON.parse(xhr.responseText);
        renderMixDetails(mix, items);
    };
    xhr.send();
}

// Post approve message to Node server
function approveMix(mixId) {
    var xhr = new XMLHttpRequest(),
        method = 'POST',
        url = '/approvals/' + mixId;

    xhr.open(method, url, true);
    xhr.onload = function () {
        deleteMix(mixId);
        renderMixList();
    };
    xhr.send();
}

getMixList();