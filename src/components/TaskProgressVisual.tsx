import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TaskProgressVisualProps {
  progress: number;
  status: string;
}

export function TaskProgressVisual({ progress, status }: TaskProgressVisualProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing to avoid duplicate rendering

    const width = 42;
    const height = 42;
    const radius = Math.min(width, height) / 2;
    const thickness = 4;

    // Create a group centered in the SVG
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Pick visual style based on status
    let color = "#6366f1"; // Indigo
    if (status === "COMPLETED") {
      color = "#10b981"; // Emerald
    } else if (status === "PENDING") {
      color = "#94a3b8"; // Slate / gray
    }

    // Background tracking circle
    const backgroundArc = d3.arc<any>()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .cornerRadius(radius);

    g.append("path")
      .attr("d", backgroundArc as any)
      .attr("class", "fill-slate-200 dark:fill-slate-800/60")
      .style("opacity", 0.4);

    // Foreground progress arc
    const foregroundArc = d3.arc<any>()
      .innerRadius(radius - thickness)
      .outerRadius(radius)
      .startAngle(0)
      .cornerRadius(radius);

    // Cap progress value safely
    const safeProgress = Math.max(0, Math.min(100, progress));
    const targetAngle = (safeProgress / 100) * 2 * Math.PI;

    // Add path with interpolation anim
    const progressPath = g.append("path")
      .datum({ endAngle: 0 }) 
      .attr("fill", color);

    progressPath
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attrTween("d", function (d: any) {
        const interpolate = d3.interpolate(d.endAngle, targetAngle);
        return function (t: number) {
          d.endAngle = interpolate(t);
          return foregroundArc(d) || "";
        };
      });

    // Add progress percent label text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("class", "font-mono font-bold text-[9px] fill-slate-800 dark:fill-slate-300")
      .text(`${safeProgress}%`);

  }, [progress, status]);

  return (
    <div className="flex items-center justify-center shrink-0 w-11 h-11" id={`progress-ring-${status}-${progress}`}>
      <svg ref={svgRef} width="42" height="42" className="overflow-visible" />
    </div>
  );
}
