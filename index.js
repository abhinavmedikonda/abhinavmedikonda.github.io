window.onload = function () {
    document.getElementById("panelBackground").style.left = document.getElementById("ulTags").getBoundingClientRect().left + "px";
    document.getElementById("panelBackground").style.width = document.getElementById("ulTags").getBoundingClientRect().width + "px";
    window.addEventListener('resize', function () {
        document.getElementById("panelBackground").style.left = document.getElementById("ulTags").getBoundingClientRect().left + "px";
        document.getElementById("panelBackground").style.width = document.getElementById("ulTags").getBoundingClientRect().width + "px";
    });
    $("ul#ulTags").on("click", "label", function () {
        console.log($(this).text());
        $("input").val($(this).text());

        if ($("#ulSelected li").length < 5) {
            if ($("#ulSelected li").length == 0) {
                createChart();
            }
            if ($("#ulSelected li:contains(" + $(this).text() + ")").length == 0) {
                var newLi = document.createElement('li');
                newLi.className = "list-item display-inline";
                newLi.innerHTML = $(this).text() + '<span class="margin-left-20 glyphicon glyphicon-remove"></span>';
                document.getElementById("ulSelected").appendChild(newLi);

                getData($(this).text());
            }
        }

        // buttonClick();
    });

    $("ul#ulSelected").on("click", "span.glyphicon-remove", function () {
        options.data = options.data.filter(obj => obj.name != $(this).get(0).parentElement.innerText);
        $(this).get(0).parentElement.remove();
        if ($("#ulSelected li").length == 0) {
            options = {};
        }
        $("#chartContainer").CanvasJSChart(options);
    });

    $("button").click(function () { buttonClick(); });

    function createChart() {
        options = {
            animationEnabled: true,
            zoomEnabled: true,
            theme: "light2",
            title: {
                text: "every hour past 24 hours"
            },
            axisX: {
                title: "hours",
                //valueFormatString: "DD MMM"
            },
            axisY: {
                title: "Number of Posts",
                //suffix: "K",
                //minimum: 30,
                //viewportMinimum: 50
            },
            toolTip: {
                shared: true
            },
            legend: {
                fontSize: 15,
                cursor: "pointer",
                verticalAlign: "bottom",
                horizontalAlign: "center",
                dockInsidePlotArea: false,
                itemclick: toogleDataSeries
            },
            data: []
        };
        $("#chartContainer").CanvasJSChart(options);
    }
    function getData(tag) {
        var limit = 2;    //increase number of dataPoints by increasing the limit
        var y = 0;
        var data = {
            type: "line",
            name: tag,
            showInLegend: true,
            dataPoints: []
        };
        var dataPoints = [];
        var totalSeconds = Date.now().toString().slice(0, -3) - 86400;

        for (var i = 0; i < limit; i++) {
            //y += Math.round(Math.random() * 10 - 5);
            $.ajax({
                url: "https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + totalSeconds + "&todate=" + (totalSeconds + 3600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow",
                success: function (response) {
                    console.log(response);
                    dataPoints.push({
                        x: i + 1,
                        y: response.items.length
                    });
                    totalSeconds += 3600;
                    console.log(dataPoints);
                },
                async: false
            })
        }
        data.dataPoints = dataPoints;
        options.data.push(data);
        $("#chartContainer").CanvasJSChart(options);
    }
    function toogleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
    function buttonClick() {
        console.log($("input").val());

        var iteration = 1;
        var items = 0;
        var tag = $("input").val();
        console.log(tag);

        var nowSeconds = Date.now().toString().slice(0, -3);
        var x = "https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 21600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow";
        console.log(x);

        $.get("https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 3600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow", function (response) {
            console.log(response);
            $("h1#1hour").text(response.items.length);
        });
        $.get("https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 21600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow", function (response) {
            console.log(response);
            $("h1#6hour").text(response.items.length);
        });
        $.get("https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 86400).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow", function (response) {
            console.log(response);
            $("h1#24hour").text(response.items.length);
        });
    }
};