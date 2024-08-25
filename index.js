window.onload = function () {
    var chart;
    createChart();
    // document.getElementById("panelBackground").style.left = document.getElementById("ul-tags").getBoundingClientRect().left + "px";
    // document.getElementById("panelBackground").style.width = document.getElementById("ul-tags").getBoundingClientRect().width + "px";
    // window.addEventListener('resize', function () {
    //     document.getElementById("panelBackground").style.left = document.getElementById("ul-tags").getBoundingClientRect().left + "px";
    //     document.getElementById("panelBackground").style.width = document.getElementById("ul-tags").getBoundingClientRect().width + "px";
    // });

    $("#ul-selected").on("click", "li", function () {
        unselectTag(this.innerText);
    });

    $("#ul-navbar").on("change", "input[type='radio'][name='chart-type']", function () {
        options.data.forEach(x => {
            x.type = this.parentElement.innerText.toLowerCase();
        });
        refresh(options);
    });

    checked()
    async function checked() {
        var checks = $("input:checkbox[name='tag-list']:checked");
        var errors = []

        for (var i = 0; i < checks.length; i++) {
            try {
                await selectTag(checks[i].parentElement.innerText);
            } catch (error) {
                checks[i].checked = false;
                errors.push(error.responseJSON.error_message);
            }
        }

        if (errors?.length > 0) {
            alert(errors[0]);
        }
    }

    $("#ul-tags").on("click", "label.list-item", async function (e) {
        // await new Promise((resolve, reject) => {test(); resolve();})
        // await test();
        console.log('click');
        // return;

        if (e.target !== this) {
            e.preventDefault();
            return;
        }

        if (this.style.cursor === 'wait') {
            return;
        }

        let checkbox = $(this).children('input:checkbox[name="tag-list"]')[0];
        if (checkbox.checked) {
            await new Promise(resolve => { unselectTag(this.innerText); resolve(); });
            checkbox.checked = false;
        }
        else {
            $("#ul-tags > *").each(function (index) {
                $(this).css("cursor", "wait");
            })

            // // then catch approach
            // selectTag(this.innerText)
            // .then(response => {checkbox.checked = true;})
            // .catch(error => {alert(error.responseJSON.error_message)})
            // .finally(any => {
            //     $("#ul-tags > *").each(function(index) {
            //         $(this).css("cursor", "pointer");
            //     })
            // });

            // async await approach
            try {
                await selectTag(this.innerText)
                checkbox.checked = true;
                $("#ul-tags > *").each(function (index) {
                    $(this).css("cursor", "pointer");
                })
            } catch (error) {
                alert(error.responseJSON.error_message);
            } finally {
                $("#ul-tags > *").each(function (index) {
                    $(this).css("cursor", "pointer");
                })
            }
        }
    });

    async function test() {
        await new Promise((resolve, reject) => { setTimeout(function () { resolve(); console.log('test'); }, 5000) });
        await new Promise(x => setTimeout(x, 1000));
        for (let index = 0; index < 50000; index++) { console.log('5000') }
    }


    // $("#ul-tags").on("change", "input:checkbox[name='tag-list']", async function(e){
    // await new Promise(r => setTimeout(r, 5000));
    // });

    async function selectTag(tag) {
        // await new Promise(x => setTimeout(x, 1000));

        $("input").val(tag);

        if ($("#ul-selected li").length < 5) {
            if ($("#ul-selected li:contains(" + tag + ")").length == 0) {
                await getData(tag);

                let newLi = document.createElement('li');
                newLi.className = "list-item display-inline";
                newLi.innerHTML = tag + '<span class="margin-left-20 glyphicon glyphicon-remove"></span>';
                document.getElementById("ul-selected").appendChild(newLi);
            }
        }

        // // buttonClick();
    }

    function unselectTag(tag) {
        $("#ul-selected").children().filter(function () {
            return $(this).text() === tag;
        }).remove();

        let test = $("#ul-tags").children().filter(function () {
            return $(this).text() === tag;
        }).children()[0].checked = false;

        options.data = options.data.filter(obj => obj.name != tag);
        render(options);
    }

    function render(options) {
        chart.options = options;
        chart.render();
    }

    function refresh(options) {
        chart = new CanvasJS.Chart("chartContainer", options);
        render(options);
    }

    $("button").click(function () { buttonClick(); });

    function createChart() {
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

    async function getData(tag) {
        // throw { responseJSON: { error_message: "test error" } };
        let count = 5; //increase number of dataPoints by increasing the count
        let interval = 86400000; //1 day in milli seconds

        let date = new Date();
        let from = date.setHours(0, 0, 0, 0);
        let to = date.setDate(date.getDate() + 1);
        let chartType = $("input[type='radio'][name='chart-type']:checked")[0]?.parentElement.innerText.toLowerCase()
        chartType = chartType ? chartType : "line";
        let data = {
            type: chartType, //column, line, bar, scatter
            name: tag,
            showInLegend: true,
            dataPoints: []
        };

        let dataPoints = [];

        for (let i = 0; i < count; i++) {
            //y += Math.round(Math.random() * 10 - 5);

            await $.ajax({
                url: "https://api.stackexchange.com/2.2/search?page=1&pagesize=100&fromdate=" + from.toString().slice(0, -3)
                    + "&todate=" + to.toString().slice(0, -3) + "&order=desc&sort=activity&site=stackoverflow",
                type: 'GET',
                data: { tagged: tag },
                success: function (response) {
                    dataPoints.push({
                        x: new Date(from),
                        y: response.items.length
                    });
                },
                // error: function(error){
                //     console.log(error.responseJSON.error_message);
                // },
                async: true //if await is added for this operation, "async: true" still going to be synchronous
            })

            to = from;
            from -= interval;
        }
        data.dataPoints = dataPoints;
        options.data.push(data);
        render(options);
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