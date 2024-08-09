window.onload = function(){
    var chart;
    createChart();
    document.getElementById("panelBackground").style.left = document.getElementById("ul-tags").getBoundingClientRect().left + "px";
    document.getElementById("panelBackground").style.width = document.getElementById("ul-tags").getBoundingClientRect().width + "px";
    window.addEventListener('resize', function () {
        document.getElementById("panelBackground").style.left = document.getElementById("ul-tags").getBoundingClientRect().left + "px";
        document.getElementById("panelBackground").style.width = document.getElementById("ul-tags").getBoundingClientRect().width + "px";
    });

    $("#ulSelected").on("click", "li", function(){
        unselectTag(this.innerText);
    });

    $("#ul-navbar").on("change", "input[type='radio'][name='chart-type']", function(){
        options.data.forEach(x => {
            x.type = this.parentElement.innerText.toLowerCase();
        });
        refresh(options);
    });

    $("input:checkbox[name='tag-list']:checked").each(function(){
        selectTag(this.parentElement.innerText);
    });

    $("#ul-tags").on("change", "input:checkbox[name='tag-list']", function(e){
        if (e.target !== this){
            return;
        }
        if(this.checked){
            selectTag(this.parentElement.innerText);
            console.log("select");
        }
        else {
            console.log("unselect");
            unselectTag(this.parentElement.innerText);
        }
    });

    function selectTag(tag){
        $("input").val(tag);
        console.log(chart)

        if ($("#ulSelected li").length < 5) {
            if ($("#ulSelected li:contains(" + tag + ")").length == 0) {
                let newLi = document.createElement('li');
                newLi.className = "list-item display-inline";
                newLi.innerHTML = tag + '<span class="margin-left-20 glyphicon glyphicon-remove"></span>';
                document.getElementById("ulSelected").appendChild(newLi);

                getData(tag);
            }
        }

        // // buttonClick();
    }

    function unselectTag(tag){
        $("#ulSelected").children().filter(function() {
            return $(this).text() === tag;
        }).remove();

        let test = $("#ul-tags").children().filter(function(){
            return $(this).text() === tag;
        }).children()[0].checked = false;

        options.data = options.data.filter(obj => obj.name != tag);
        render(options);
    }

    function render(options){
        chart.options = options;
        chart.render();
    }

    function refresh(options){
        chart = new CanvasJS.Chart("chartContainer", options);
        render(options);
    }

    $("button").click(function () { buttonClick(); });

    function createChart(){
        options = {
            animatedRender: true,
            animationEnabled: true,
            zoomEnabled: true,
            theme: "light2",
            title: {
                text: "StackOverflow tags"
            },
            axisX: {
                title: "Day",
                valueFormatString: "DD-MMM"
            },
            axisY: {
                title: "Number of Tags",
                // suffix: "K",
                //minimum: 30,
                //viewportMinimum: 50
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "bottom",
                horizontalAlign: "center",
                dockInsidePlotArea: false,
                itemclick: toogleDataSeries
            },
            data: [{
                type: "line",
                showInLegend: true,
                name: "Projected Sales",
                markerType: "circle",
                xValueFormatString: "DD MMM, YYYY",
                //color: "#F08080",
                yValueFormatString: "#,##0K",
                dataPoints: [
                    { x: new Date(2023, 10, 1), y: 63 },
                    { x: new Date(2023, 10, 2), y: 69 },
                    { x: new Date(2023, 10, 3), y: 65 },
                    { x: new Date(2023, 10, 4), y: 70 },
                    { x: new Date(2023, 10, 5), y: 71 },
                    { x: new Date(2023, 10, 6), y: 65 },
                    { x: new Date(2023, 10, 7), y: 73 },
                    { x: new Date(2023, 10, 8), y: 96 },
                    { x: new Date(2023, 10, 9), y: 84 },
                    { x: new Date(2023, 10, 10), y: 85 },
                    { x: new Date(2023, 10, 11), y: 86 },
                    { x: new Date(2023, 10, 12), y: 94 },
                    { x: new Date(2023, 10, 13), y: 97 },
                    { x: new Date(2023, 10, 14), y: 86 },
                    { x: new Date(2023, 10, 15), y: 89 }
                ]
            },
            {
                type: "line",
                showInLegend: true,
                name: "Actual Sales",
                //lineDashType: "dash",
                //yValueFormatString: "#,##0K",
                dataPoints: [
                    { x: new Date(2023, 10, 1), y: 60 },
                    { x: new Date(2023, 10, 2), y: 57 },
                    { x: new Date(2023, 10, 3), y: 51 },
                    { x: new Date(2023, 10, 4), y: 56 },
                    { x: new Date(2023, 10, 5), y: 54 },
                    { x: new Date(2023, 10, 6), y: 55 },
                    { x: new Date(2023, 10, 7), y: 54 },
                    { x: new Date(2023, 10, 8), y: 69 },
                    { x: new Date(2023, 10, 9), y: 65 },
                    { x: new Date(2023, 10, 10), y: 66 },
                    { x: new Date(2023, 10, 11), y: 63 },
                    { x: new Date(2023, 10, 12), y: 67 },
                    { x: new Date(2023, 10, 13), y: 66 },
                    { x: new Date(2023, 10, 14), y: 56 },
                    { x: new Date(2023, 10, 15), y: 64 }
                ]
            }]
        };
        refresh(options);
    }

    function getData(tag){
        let count = 3; //increase number of dataPoints by increasing the count
        let interval = 86400000; //1 day in milli seconds

        let date = new Date();
        let from = date.setHours(0,0,0,0);
        let to = date.setDate(date.getDate()+1);
        let chartType = $("input[type='radio'][name='chart-type']:checked")[0]?.parentElement.innerText.toLowerCase()
        chartType = chartType ? chartType : "line";
        let data = {
            type: chartType, //column, line, bar, scatter
            name: tag,
            showInLegend: true,
            dataPoints: []
        };

        let dataPoints = [];

        for(let i = 0; i < count; i++){
            //y += Math.round(Math.random() * 10 - 5);
            $.ajax({
                url: "https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + from.toString().slice(0, -3)
                    + "&todate=" + to.toString().slice(0, -3) + "&order=desc&sort=activity&site=stackoverflow",
                type: 'GET',
                data: { tagged: tag},
                success: function (response) {
                    dataPoints.push({
                        x: new Date(from),
                        y: response.items.length
                    });
                },
                async: false
            })

            to = from;
            from -= interval;
        }
        data.dataPoints = dataPoints;
        options.data.push(data);
        render(options);
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
        let iteration = 1;
        let items = 0;
        let tag = $("input").val();

        let nowSeconds = Date.now().toString().slice(0, -3);
        let x = "https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 21600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow";

        $.get("https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 3600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow", function (response) {
            $("h1#1hour").text(response.items.length);
        });
        $.get("https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 21600).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow", function (response) {
            $("h1#6hour").text(response.items.length);
        });
        $.get("https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + (nowSeconds - 86400).toString() + "&order=desc&sort=activity&tagged=" + tag + "&site=stackoverflow", function (response) {
            $("h1#24hour").text(response.items.length);
        });
    }
};