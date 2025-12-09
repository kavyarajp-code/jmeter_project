/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9380863039399625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/login.pl?intro=true"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=itinerary"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=itinerary"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=search"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl?page=welcome"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=menus"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/login.pl"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home"], "isController": false}, {"data": [1.0, 500, 1500, "http://localhost:1080/cgi-bin/itinerary.pl"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20000, 0, 0.0, 214.43584999999968, 64, 386, 211.0, 261.0, 271.0, 292.0, 33.359687486447626, 58.573792827583794, 19.35607906287634], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Test", 1320, 0, 0.0, 3215.9818181818187, 2586, 3632, 3229.0, 3378.9, 3425.95, 3545.79, 2.2448406928394684, 59.04601976565224, 19.526168018672994], "isController": true}, {"data": ["http://localhost:1080/cgi-bin/login.pl?intro=true", 2660, 0, 0.0, 206.5097744360902, 78, 277, 211.0, 232.0, 237.0, 248.0, 4.476185347728925, 5.0437838711346625, 2.281805421400878], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=itinerary", 1340, 0, 0.0, 186.43358208955226, 64, 235, 191.0, 209.0, 215.0, 224.58999999999992, 2.2550950000841454, 1.800769351323606, 1.1627833594183874], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=itinerary", 1320, 0, 0.0, 201.08030303030284, 77, 260, 205.0, 224.0, 229.95000000000005, 237.0, 2.255531177592323, 3.8509547107067674, 1.1718189321085117], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights", 1340, 0, 0.0, 202.7962686567165, 87, 271, 205.0, 228.0, 236.0, 251.58999999999992, 2.2549356165397847, 3.8511682806704903, 1.1671053484043807], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=search", 1340, 0, 0.0, 190.35298507462693, 75, 258, 193.0, 215.0, 231.0, 252.0, 2.255083614798061, 1.855464312670709, 1.1561707986025214], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl?page=welcome", 1340, 0, 0.0, 265.6111940298509, 131, 386, 265.0, 291.0, 298.0, 365.17999999999984, 2.254764873455528, 9.952178464113903, 1.1692188943407085], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl", 4020, 0, 0.0, 249.56616915422893, 109, 344, 252.0, 273.0, 279.0, 296.0, 6.75100383396561, 18.548937679900817, 5.326963962738489], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=menus", 1320, 0, 0.0, 189.41136363636372, 79, 255, 193.0, 214.0, 220.0, 233.78999999999996, 2.255519615331382, 1.811784577372012, 1.1541916781578556], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/login.pl", 1340, 0, 0.0, 208.83283582089558, 86, 321, 212.0, 233.0, 238.95000000000005, 295.17999999999984, 2.2552050637768626, 2.279282980480695, 1.5416440865662147], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home", 2660, 0, 0.0, 200.16278195488718, 81, 255, 204.0, 224.0, 230.0, 242.38999999999987, 4.476456531251052, 7.644415946534953, 2.3038013593450235], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/itinerary.pl", 1320, 0, 0.0, 208.9901515151518, 94, 274, 212.0, 234.0, 240.95000000000005, 251.0, 2.2554463904314397, 2.5416004778940624, 1.1343309483126869], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
