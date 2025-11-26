import { Component, ChangeDetectionStrategy, input, ElementRef, inject, effect, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

export interface ChartData {
  axis: string;
  value: number;
}

export interface RadarChartColors {
  protein: string;
  carbohydrates: string;
  fat: string;
}

@Component({
  selector: 'app-radar-chart',
  template: ``, // D3 will manage the SVG inside the host element
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 250px;
    }
  `],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarChartComponent {
  data = input.required<ChartData[]>();
  goals = input.required<ChartData[]>();
  colors = input.required<RadarChartColors>();

  private elRef = inject(ElementRef);
  private svg: any;
  private chartGroup: any;
  private isInitialized = false;

  constructor() {
    afterNextRender(() => {
      this.setupChart();
      this.isInitialized = true;
      this.drawChart(true);
    });

    effect(() => {
      if (this.isInitialized) {
        this.drawChart();
      }
    });
  }

  private setupChart() {
    const element = this.elRef.nativeElement;
    const { width, height } = this.getChartDimensions();
    
    this.svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height);
      
    this.chartGroup = this.svg.append('g');
  }

  private getChartDimensions() {
    const element = this.elRef.nativeElement;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const margin = { top: 40, right: 50, bottom: 40, left: 50 };
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;
    return { width, height, radius };
  }

  private drawChart(isInitial = false) {
    const { width, height, radius } = this.getChartDimensions();
    this.chartGroup.attr('transform', `translate(${width / 2}, ${height / 2})`);

    const data = this.data();
    const goals = this.goals();
    const colors = this.colors();
    if (data.length === 0 || goals.length === 0) return;

    const features = data.map(d => d.axis);
    const angleSlice = (Math.PI * 2) / features.length;
    
    const maxDataValue = Math.max(...data.map(d => d.value), 0);
    const maxGoalValue = Math.max(...goals.map(g => g.value), 1);
    const scaleMax = Math.max(maxDataValue, maxGoalValue) * 1.1 || 1;

    const rScale = d3.scaleLinear().domain([0, scaleMax]).range([0, radius]);

    // Cleanup previous elements
    this.chartGroup.selectAll('.grid, .axes, .areas').remove();

    const grid = this.chartGroup.append('g').attr('class', 'grid');
    const axes = this.chartGroup.append('g').attr('class', 'axes');
    const areas = this.chartGroup.append('g').attr('class', 'areas');
    
    // Grid circles
    const levels = 3;
    grid.selectAll('.grid-circle')
      .data(d3.range(1, levels + 1))
      .enter()
      .append('circle')
      .attr('r', d => (radius / levels) * d)
      .style('fill', 'rgba(255, 255, 255, 0.05)')
      .style('stroke', 'rgba(255, 255, 255, 0.1)');
      
    // Axes
    const axis = axes.selectAll('.axis')
        .data(features)
        .enter().append('g');

    axis.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', (d, i) => rScale(scaleMax) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => rScale(scaleMax) * Math.sin(angleSlice * i - Math.PI / 2))
        .style('stroke', 'rgba(255, 255, 255, 0.1)');
        
    axis.append('text')
      .style('font-size', '12px').attr('text-anchor', 'middle').attr('dy', '0.35em')
      .attr('x', (d, i) => rScale(scaleMax * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (d, i) => rScale(scaleMax * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d)
      .style('fill', (d) => {
        if (d === 'Protein') return colors.protein;
        if (d === 'Carbs') return colors.carbohydrates;
        if (d === 'Fat') return colors.fat;
        return 'white';
      });

    const radarLine = d3.lineRadial<ChartData>()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice);

    // Goal Area
    areas.append('path')
      .datum(goals)
      .attr('d', radarLine)
      .style('stroke-width', 2)
      .style('stroke', 'rgba(56, 189, 248, 0.8)') // Keep goal line consistent for now
      .style('fill', 'none');

    // Data Area
    const dataArea = areas.append('path')
      .datum(data)
      .attr('d', radarLine)
      .style('fill', 'rgba(56, 189, 248, 0.4)'); // Keep data area consistent
    
    if (isInitial) {
      dataArea
        .attr('transform', 'scale(0.1)')
        .transition()
        .duration(1000)
        .ease(d3.easeElastic.period(0.6))
        .attr('transform', 'scale(1)');
    }
  }
}
