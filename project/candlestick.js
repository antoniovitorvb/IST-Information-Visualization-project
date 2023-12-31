function createCandlestickChart(containerId, data, width, xScale) {
    const container = document.getElementById(containerId);
    const height = container.offsetHeight - margin.top - margin.bottom;
    const yScale = d3.scaleLinear().domain([d3.min(data, d => d.Low), d3.max(data, d => d.High)]).range([height, 0]);

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(Math.max(d.Open, d.Close)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale(d.Open) - yScale(d.Close)))
        .attr("fill", d => d.Open > d.Close ? "red" : "green");

    svg.selectAll(".line")
        .data(data)
        .enter().append("line")
        .attr("class", "line")
        .attr("x1", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("y1", d => yScale(d.High))
        .attr("y2", d => yScale(d.Low))
        .attr("stroke", d => d.Open > d.Close ? "red" : "green");

    const xAxis = xAxisGenerator(xScale);
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    const horizontalLinesData = yAxisGenerator(yScale, 12);
    svg.selectAll(".horizontalLine")
        .data(horizontalLinesData)
        .enter().append("line")
        .attr("class", "horizontalLine")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "5,5");

    svg.selectAll(".horizontalLabel")
        .data(horizontalLinesData)
        .enter().append("text")
        .attr("class", "horizontalLabel")
        .attr("x", -5)
        .attr("y", d => yScale(d))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .text(d => d.toFixed(pipDigits));

    svg.append("text")
        .attr("class", "chartLabel")
        .attr("x", width + 10)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("transform", `rotate(90, ${width + 10}, ${height / 2})`)
        .attr("font-size", "14px")
        .style("font-weight", "bold")
        .text("Candlestick Chart + Indicators + News");

    svg.append("path")
        .datum(data)
        .attr("class", "sma20")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
            .y(d => yScale(d.SMA_20))
        );

    svg.append("path")
        .datum(data)
        .attr("class", "sma50")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
            .y(d => yScale(d.SMA_50))
        );

    svg.append("path")
        .datum(data)
        .attr("class", "upperBollinger")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
            .y(d => yScale(d.Upper_Bollinger_Band))
        );

    svg.append("path")
        .datum(data)
        .attr("class", "lowerBollinger")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
            .y(d => yScale(d.Lower_Bollinger_Band))
        );

    svg.selectAll(".news-warning")
        .data(data.filter(d => d.News && d.News.length))
        .enter().append("circle")
        .attr("class", "news-warning")
        .attr("cx", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.High) - 15)
        .attr("r", 8)
        .attr("fill", "#ffec00")
        .on("mouseover", function(event, d) {
            const newsList = d.News.map(n => `${n.Impact.charAt(0) + n.Impact.slice(1).toLowerCase()} Impact: ${n.Name}`).join("<br>");
            d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .html(newsList);
        })
        .on("mouseout", function() {
            d3.select(".tooltip").remove();
        });

    svg.append("text")
        .attr("class", "animated-label")
        .attr("x", 10)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("font-size", "14px");

    svg.append("text")
        .attr("class", "selection-label")
        .attr("x", 10)
        .attr("y", 25)
        .attr("text-anchor", "start")
        .attr("font-size", "14px")
        .attr("fill", "#ad2aee");

    return yScale;
}

function updateCandlestickChart(containerId, data, width, xScale) {
    const container = document.getElementById(containerId);
    const height = container.offsetHeight - margin.top - margin.bottom;
    const yScale = d3.scaleLinear().domain([d3.min(data, d => d.Low), d3.max(data, d => d.High)]).range([height, 0]);

    const svg = d3.select(`#${containerId} svg g`);
    const t = d3.transition().duration(1000);

    const bars = svg.selectAll(".bar").data(data);
    bars.enter().append("rect")
        .attr("x", d => xScale(d.Time))
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .merge(bars)
        .transition(t)
        .attr("class", "bar")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(Math.max(d.Open, d.Close)))
        .attr("width", xScale.bandwidth())
        .attr("height", d => Math.abs(yScale(d.Open) - yScale(d.Close)))
        .attr("fill", d => d.Open > d.Close ? "red" : "green");
    bars.exit()
        .transition(t)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    const lines = svg.selectAll(".line").data(data);
    lines.enter().append("line")
        .attr("x1", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("y1", height)
        .attr("y2", height)
        .merge(lines)
        .transition(t)
        .attr("class", "line")
        .attr("x1", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("y1", d => yScale(d.High))
        .attr("y2", d => yScale(d.Low))
        .attr("stroke", d => d.Open > d.Close ? "red" : "green");
    lines.exit()
        .transition(t)
        .attr("y1", height)
        .attr("y2", height)
        .remove();

    const xAxis = xAxisGenerator(xScale);
    svg.select(".x-axis").transition(t).call(xAxis);

    const yAxis = yAxisGenerator(yScale, 12)
    const horizontalLines = svg.selectAll(".horizontalLine").data(yAxis);
    horizontalLines.enter().append("line")
        .attr("class", "horizontalLine")
        .attr("x1", 0)
        .attr("x2", width)
        .merge(horizontalLines)
        .transition(t)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "5,5");
    horizontalLines.exit().remove();

    const horizontalLabels = svg.selectAll(".horizontalLabel").data(yAxis);
    horizontalLabels.enter().append("text")
        .attr("class", "horizontalLabel")
        .attr("x", -5)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "10px")
        .merge(horizontalLabels)
        .transition(t)
        .attr("y", d => yScale(d))
        .text(d => d.toFixed(pipDigits));
    horizontalLabels.exit().remove();

    const sma20Line = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.SMA_20));

    svg.select(".sma20")
        .datum(data)
        .transition(t)
        .attr("d", sma20Line);

    const sma50Line = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.SMA_50));

    svg.select(".sma50")
        .datum(data)
        .transition(t)
        .attr("d", sma50Line);

    const upperBollingerLine = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Upper_Bollinger_Band));

    svg.select(".upperBollinger")
        .datum(data)
        .transition(t)
        .attr("d", upperBollingerLine);

    const lowerBollingerLine = d3.line()
        .x(d => xScale(d.Time) + xScale.bandwidth() / 2)
        .y(d => yScale(d.Lower_Bollinger_Band));

    svg.select(".lowerBollinger")
        .datum(data)
        .transition(t)
        .attr("d", lowerBollingerLine);

    const newsWarnings = svg.selectAll(".news-warning").data(data.filter(d => d.News && d.News.length));
    newsWarnings.enter().append("circle")
        .attr("class", "news-warning")
        .attr("cx", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.High) - 15)
        .attr("r", 8)
        .attr("fill", "#ffec00")
        .on("mouseover", function(event, d) {
            const newsList = d.News.map(n => `${n.Impact.charAt(0) + n.Impact.slice(1).toLowerCase()} Impact: ${n.Name}`).join("<br>");
            d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .html(newsList);
        })
        .on("mouseout", function() {
            d3.select(".tooltip").remove();
        })
        .merge(newsWarnings)
        .transition(t)
        .attr("cx", d => xScale(d.Time) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.High) - 15)
        .attr("r", 8)
        .attr("fill", "#ffec00");
    newsWarnings.exit().remove();

    return yScale;
}
