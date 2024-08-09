window.onload = function(){
    var chart;
    createChart();
    document.getElementById("panelBackground").style.left = document.getElementById("ul-tags").getBoundingClientRect().left + "px";
    document.getElementById("panelBackground").style.width = document.getElementById("ul-tags").getBoundingClientRect().width + "px";
    window.addEventListener('resize', function () {
        document.getElementById("panelBackground").style.left = document.getElementById("ul-tags").getBoundingClientRect().left + "px";
        document.getElementById("panelBackground").style.width = document.getElementById("ul-tags").getBoundingClientRect().width + "px";
    });

    $("#ul-selected").on("click", "li", function(){
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

        if ($("#ul-selected li").length < 5) {
            if ($("#ul-selected li:contains(" + tag + ")").length == 0) {
                let newLi = document.createElement('li');
                newLi.className = "list-item display-inline";
                newLi.innerHTML = tag + '<span class="margin-left-20 glyphicon glyphicon-remove"></span>';
                document.getElementById("ul-selected").appendChild(newLi);

                getData(tag);
            }
        }

        // // buttonClick();
    }

    function unselectTag(tag){
        $("#ul-selected").children().filter(function() {
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
            data: []
        };
        refresh(options);
    }

    function getData(tag){
        let count = 10; //increase number of dataPoints by increasing the count
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