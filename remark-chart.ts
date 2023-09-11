import type { Code, HTML } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import YAML from 'yaml';
import {z} from 'zod';

export const chartJsSchema = z.object({
	canvas: z.object({
		id: z.string().optional(),
		width: z.number().optional(),
		height: z.number().optional(),
	}).optional(),
	type: z.string(),
	data: z.record(z.string(), z.unknown())
});

export type ChartJsPluginConfig = z.infer<typeof chartJsSchema>;
export type ChartJsPluginState = {
	index: number;
}
export type ChartJsVfileDataShape = { chartJsPluginState?: ChartJsPluginState };

function emitChartJs(original: Code, vfile: VFile) {
	const vfd = vfile.data as ChartJsVfileDataShape;
	let chartJsPluginState: ChartJsPluginState = { index: 0 };
	if(!vfd.chartJsPluginState) {
		vfd.chartJsPluginState = chartJsPluginState; 
	} else {
		chartJsPluginState = vfd.chartJsPluginState;
	}

	const node = original as unknown as HTML;
	node.type = 'html';
	let pluginConfig: ChartJsPluginConfig;
	let chartJsCanvasConfig: any;
	try {
		chartJsCanvasConfig = YAML.parse(original.value);
		pluginConfig = chartJsSchema.parse(chartJsCanvasConfig);		
	} catch (err) {
		node.value = `<div>Error parsing Chart.js configuration: ${err}</div>`;
		return;
	}
	
	chartJsPluginState.index++;
	const elemID = pluginConfig.canvas?.id ?? `chart-js-${chartJsPluginState.index}`;
	node.value = `
		<canvas id="${elemID}" class="chart-js"></canvas>
		<script>
			(() => {
				const render = () => {
					const canvas = document.querySelector("#${elemID}");
					const chart = new Chart(canvas, ${JSON.stringify(chartJsCanvasConfig, null, "  ")});
					this.onclick = (evt) => {
						const points = chart.getElementsAtEventForMode(evt, "nearest", {
							intersect: true,
						}, true);
						if (points.length) {
							const firstPoint = points[0];
							const data = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
							if (("navigation" in data) && data.navigation) window.location = data.navigation.url;
							if (("url" in data) && data.url) window.location = data.url;
						}
					};
				}

				if ("Chart" in window) {
					render();
				} else {
					const scriptElem = document.createElement('script');
					scriptElem.onload = render;
					scriptElem.type = 'text/javascript';
					scriptElem.src = "https://cdn.jsdelivr.net/npm/chart.js";
					document.head.appendChild(scriptElem);
				}		
			})()
		</script>`;
}

export const apacheEChartsPluginSchema = z.object({
	canvas: z.object({
		id: z.string().optional(),
		width: z.number().optional(),
		height: z.number().optional(),
	}).optional(),
});

export type ApacheEChartsPluginConfig = z.infer<typeof apacheEChartsPluginSchema>;
export type ApacheEChartsPluginState = {
	index: number;
}
export type ApacheEChartsVfileDataShape = { apacheEChartsPluginState?: ApacheEChartsPluginState };

function emitApacheECharts(original: Code, vfile: VFile) {
	const vfd = vfile.data as ApacheEChartsVfileDataShape;
	let apacheEChartsPluginState: ApacheEChartsPluginState = { index: 0 };
	if(!vfd.apacheEChartsPluginState) {
		vfd.apacheEChartsPluginState = apacheEChartsPluginState; 
	} else {
		apacheEChartsPluginState = vfd.apacheEChartsPluginState;
	}

	const node = original as unknown as HTML;
	node.type = 'html';
	let pluginConfig: ApacheEChartsPluginConfig;
	let echartsConfig: any;
	try {
		echartsConfig = YAML.parse(original.value);
		pluginConfig = apacheEChartsPluginSchema.parse(echartsConfig);
	} catch (err) {
		node.value = `<div>Error parsing Apache ECharts configuration: ${err}</div>`;
		return;
	}
	
	apacheEChartsPluginState.index++;
	const elemID = pluginConfig.canvas?.id ?? `apache-echarts-${apacheEChartsPluginState.index}`;
	node.value = `
		<div id="${elemID}" class="apache-echarts" style="width: ${pluginConfig.canvas?.width ?? 800}px; height: ${pluginConfig.canvas?.height ?? 600}px;"></div>
		<script>
			(() => {
				const render = () => {
					const chart = echarts.init(document.getElementById("${elemID}"));
					console.dir({chart})
					chart.setOption(${JSON.stringify(echartsConfig, null, "  ")});
					chart.on("click", ({ data }) => {
						if (("navigation" in data) && data.navigation) {
							window.location = data.navigation.url;
						}
						if (("url" in data) && data.url) {
							window.location = data.url;
						}
					});
					window.addEventListener("resize", () => {
						chart.resize();
					});
				}

				if ("echarts" in window) {
					render();
				} else {
					const scriptElem = document.createElement('script');
					scriptElem.onload = render;
					scriptElem.type = 'text/javascript';
					scriptElem.src = "https://cdn.jsdelivr.net/npm/echarts@5.1.2/dist/echarts.min.js";
					document.head.appendChild(scriptElem);
				}		
			})()
		</script>`;
}

export function remarkPlugin() {
	return function transformer(tree: any, vfile: VFile, next?: (...args: unknown[]) => unknown) {
		visit(tree, 'code', (node: Code) => {
			switch(node.lang) {
				case 'chartjs':
					emitChartJs(node, vfile);
					break;

				case 'apache-echarts':
				case 'echarts':
					emitApacheECharts(node, vfile);
					break;
			}			
		});

		if (typeof next === 'function') {
			return next(null, tree, vfile);
		}

		return tree;
	};
}

