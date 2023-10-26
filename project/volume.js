function createVolumeHistogram(data, containerId) {
    const container = document.getElementById(containerId);
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]).padding(0.1);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => +d.Volume)]).range([height, 0]);

    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxis = xAxisGenerator(xScale);
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    const horizontalLinesData = yAxisGenerator(yScale, 5);
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
        .text(d => d.toFixed(0));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(d.Volume))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.Volume))
        .attr("fill", "#4682B4");
}

function updateVolumeHistogram(data, containerId) {
    const container = document.getElementById(containerId);
    const width = container.offsetWidth - margin.left - margin.right;
    const height = container.offsetHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand().domain(data.map(d => d.Time)).range([0, width]).padding(0.1);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => +d.Volume)]).range([height, 0]);

    const svg = d3.select(`#${containerId}`).select("svg").select("g");

    const t = d3.transition().duration(750);

    const xAxis = xAxisGenerator(xScale);
    svg.select(".x-axis").transition(t).call(xAxis);

    const yAxis = yAxisGenerator(yScale, 5);
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
        .text(d => d.toFixed(0));
    horizontalLabels.exit().remove();

    const bars = svg.selectAll(".bar").data(data);
    bars.enter().append("rect")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(d.Volume))  // Bars start from their respective yScale value
        .attr("width", xScale.bandwidth())
        .attr("height", 0)  // Initial height of 0
        .merge(bars)
        .transition(t)
        .attr("class", "bar")
        .attr("x", d => xScale(d.Time))
        .attr("y", d => yScale(d.Volume))  // Bars' y position is based on the data's volume
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.Volume))  // Height is the difference between container height and yScale value
        .attr("fill", "#4682B4");
    bars.exit()
        .transition(t)
        .attr("y", d => yScale(d.Volume))  // Bars exit from their respective yScale value
        .attr("height", 0)  // Exit height of 0
        .remove();

}

