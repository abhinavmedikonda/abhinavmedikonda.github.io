window.onload = function(){
    createChart();
    document.getElementById("panelBackground").style.left = document.getElementById("ulTags").getBoundingClientRect().left + "px";
    document.getElementById("panelBackground").style.width = document.getElementById("ulTags").getBoundingClientRect().width + "px";
    window.addEventListener('resize', function () {
        document.getElementById("panelBackground").style.left = document.getElementById("ulTags").getBoundingClientRect().left + "px";
        document.getElementById("panelBackground").style.width = document.getElementById("ulTags").getBoundingClientRect().width + "px";
    });

    $("ul#ulSelected").on("click", "li", function(){
        onUnselect(this.innerText);
    });

    $("input:checkbox[name='tag-list']:checked").each(function(){
        onSelect(this.parentElement.innerText);
    });

    $("ul#ulTags").on("click", "label", function(e){
        if (e.target !== this){
            return;
        }
        console.log($(this).children('input')[0].checked);
        if($(this).children('input')[0].checked){
            onUnselect(this.innerText);
        }
        else {
            onSelect(this.innerText);
        }
    });

    function onSelect(labelText){
        console.log(labelText);
        $("input").val(labelText);

        if ($("#ulSelected li").length < 5) {
            if ($("#ulSelected li").length == 0) {
                createChart();
            }
            if ($("#ulSelected li:contains(" + labelText + ")").length == 0) {
                var newLi = document.createElement('li');
                newLi.className = "list-item display-inline";
                newLi.innerHTML = labelText + '<span class="margin-left-20 glyphicon glyphicon-remove"></span>';
                document.getElementById("ulSelected").appendChild(newLi);

                getData(labelText);
            }
        }

        // buttonClick();
    }

    function onUnselect(labelText){
        $("#ulSelected").children().filter(function() {
            return $(this).text() === labelText;
        }).remove();
        options.data = options.data.filter(obj => obj.name != labelText);
        $("#chartContainer").CanvasJSChart(options);
    }

    $("button").click(function () { buttonClick(); });

    function createChart(){
        options = {
            animationEnabled: true,
            zoomEnabled: true,
            theme: "light2",
            title: {
                text: "stackOverflow tags per day"
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

    function getData(tag){
        var count = 3; //increase number of dataPoints by increasing the count
        var interval = 86400000; //1 day in milli seconds

        var date = new Date();
        var from = date.setHours(0,0,0,0);
        var to = date.setDate(date.getDate()+1);
        var data = {
            type: "line",
            name: tag,
            showInLegend: true,
            dataPoints: []
        };

        var dataPoints = [];

        for(var i = 0; i < count; i++){
            //y += Math.round(Math.random() * 10 - 5);
            $.ajax({
                url: "https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + from.toString().slice(0, -3)
                    + "&todate=" + to.toString().slice(0, -3) + "&order=desc&sort=activity&site=stackoverflow",
                type: 'GET',
                data: { tagged: tag},
                success: function (response) {
                    console.log(response);
                    dataPoints.push({
                        x: new Date(from),
                        y: response.items.length
                    });
                    console.log(dataPoints);
                },
                async: false
            })

            to = from;
            from -= interval;
        }
        data.dataPoints = dataPoints;
        options.data.push(data);
        $("#chartContainer").CanvasJSChart(options);
    }
    function toogleDataSeries(e){
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
    function buttonClick(){
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