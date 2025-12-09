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

    var data = {"OkPercent": 99.99551876845213, "KoPercent": 0.004481231547870097};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.999939206822016, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.999939206822016, 500, 1500, "JDBC Request"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3034880, 136, 0.004481231547870097, 1.0543481126106815, 0, 62862, 0.0, 1.0, 1.0, 3.0, 12699.411661324473, 868.1238440358526, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["JDBC Request", 3034880, 136, 0.004481231547870097, 1.0543481126106815, 0, 62862, 0.0, 1.0, 1.0, 3.0, 12699.411661324473, 868.1238440358526, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 28,741 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,474 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,561 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,087 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,423 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 21,993 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 27,292 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 34,851 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,998 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,538 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,266 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 10,650 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,812 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,141 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,937 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 29,826 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,930 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 37,725 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,454 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,726 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,787 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,261 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,523 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,051 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,862 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,516 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,928 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 26,484 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,121 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, 1.4705882352941178, 6.590046393926613E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,308 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,765 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,906 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,751 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,969 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,833 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,480 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 62,862 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,800 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,157 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,842 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,485 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,428 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,824 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,345 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,086 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,487 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 42,274 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,209 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,709 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 31,138 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,066 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 56,860 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,395 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,013 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,699 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,083 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,382 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,253 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,614 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,618 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,137 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,478 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,989 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 34,350 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,807 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 20,401 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,990 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 7,722 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,222 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 27,171 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 45,546 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 37,451 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,450 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 22,729 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,596 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,692 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,053 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 34,368 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,357 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,388 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,256 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,365 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,515 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,350 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,378 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,153 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,741 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 19,034 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 13,678 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,145 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 14,956 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,429 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,857 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,603 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,108 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,958 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,848 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 15,624 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,005 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,502 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,824 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 16,229 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,989 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,953 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 25,346 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,104 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,749 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 9,440 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 34,571 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,702 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,630 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,482 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 24,102 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,169 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,900 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,735 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,048 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 27,118 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,316 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,063 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,784 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 13,324 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,643 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 8,738 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,119 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 11,174 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 6,983 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 28,468 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 18,052 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 12,696 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 4,484 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 20,319 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,443 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 5,360 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}, {"data": ["The operation lasted too long: It took 25,253 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 0.7352941176470589, 3.2950231969633065E-5], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3034880, 136, "The operation lasted too long: It took 3,121 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 28,741 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,474 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 6,561 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,087 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["JDBC Request", 3034880, 136, "The operation lasted too long: It took 3,121 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 28,741 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,474 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 6,561 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,087 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
