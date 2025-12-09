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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6301789721416452, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12827461607949414, 500, 1500, "Test"], "isController": true}, {"data": [0.6816790555312636, 500, 1500, "http://localhost:1080/cgi-bin/login.pl?intro=true"], "isController": false}, {"data": [0.6825044404973357, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=itinerary"], "isController": false}, {"data": [0.6924107142857143, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=itinerary"], "isController": false}, {"data": [0.684051724137931, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights"], "isController": false}, {"data": [0.6941830624465355, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=search"], "isController": false}, {"data": [0.6652211621856028, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl?page=welcome"], "isController": false}, {"data": [0.6619409529377375, 500, 1500, "http://localhost:1080/cgi-bin/reservations.pl"], "isController": false}, {"data": [0.6901978417266187, 500, 1500, "http://localhost:1080/cgi-bin/welcome.pl?page=menus"], "isController": false}, {"data": [0.44675540765391014, 500, 1500, "http://localhost:1080/cgi-bin/login.pl"], "isController": false}, {"data": [0.680095818815331, 500, 1500, "http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home"], "isController": false}, {"data": [0.6855992844364938, 500, 1500, "http://localhost:1080/cgi-bin/itinerary.pl"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17164, 0, 0.0, 661.8753786996041, 33, 9467, 647.0, 967.5, 1118.0, 5036.499999999898, 71.8661156540344, 126.08806660276218, 41.701912921371836], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Test", 1107, 0, 0.0, 9622.57271906052, 602, 20160, 11702.0, 16365.6, 17819.6, 19402.600000000006, 4.683355262322894, 123.2049468336584, 40.734801670005375], "isController": true}, {"data": ["http://localhost:1080/cgi-bin/login.pl?intro=true", 2287, 0, 0.0, 530.2702229995631, 37, 1386, 613.0, 901.2000000000003, 990.5999999999999, 1153.8399999999992, 9.624043697450702, 10.845846119978622, 4.906006650458268], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=itinerary", 1126, 0, 0.0, 518.4591474245121, 33, 1264, 612.0, 865.0, 940.6499999999999, 1140.9500000000003, 4.825990056574661, 3.8551365881621806, 2.4884011229213097], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=itinerary", 1120, 0, 0.0, 525.0857142857145, 35, 1379, 605.5, 894.9, 988.9000000000001, 1181.3199999999997, 4.817390780718393, 8.22814108933249, 2.502785054045103], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=flights", 1160, 0, 0.0, 528.5965517241375, 36, 1415, 613.0, 903.9000000000001, 997.6500000000003, 1159.9500000000005, 4.9485310115053345, 8.452129628049638, 2.5612514024392845], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=search", 1169, 0, 0.0, 520.1625320787, 33, 1466, 602.0, 887.0, 968.5, 1181.3999999999996, 4.931698714973971, 4.05998243820611, 2.528458813829428], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl?page=welcome", 1153, 0, 0.0, 593.8560277536858, 48, 1413, 715.0, 978.2000000000003, 1049.0, 1197.5200000000004, 4.92785584846309, 21.751838663474032, 2.555362749544825], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/reservations.pl", 3421, 0, 0.0, 597.5735165156401, 44, 1447, 722.0, 986.0, 1060.8999999999996, 1207.7799999999997, 14.557818497493553, 40.00017354166489, 11.486446861409227], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/welcome.pl?page=menus", 1112, 0, 0.0, 514.0332733812944, 33, 1334, 600.0, 873.0, 949.7499999999995, 1132.8799999999974, 4.8131860521486205, 3.868410274334291, 2.4629975501229264], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/login.pl", 1202, 0, 0.0, 2199.7212978369357, 37, 9467, 928.5, 6038.400000000003, 8008.499999999999, 8824.37, 5.032805349344521, 5.0917835370321525, 3.4403942817784814], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/nav.pl?page=menu&in=home", 2296, 0, 0.0, 530.1480836236925, 35, 1436, 628.0, 894.6000000000004, 978.0, 1134.0600000000004, 9.634267107537891, 16.455403487386494, 4.95826051335202], "isController": false}, {"data": ["http://localhost:1080/cgi-bin/itinerary.pl", 1118, 0, 0.0, 530.1189624329165, 37, 1190, 625.5, 901.0, 963.0, 1103.81, 4.816370490037695, 5.427823774905762, 2.42229570543888], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17164, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
