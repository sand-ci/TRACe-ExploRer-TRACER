import ChartComponent from 'react-chartjs-2';
import React, {Component} from 'react';
import 'chartjs-chart-box-and-violin-plot';
import "./css/path-chart.css"
import preparePathData from '../../utils/common'


class PathChart extends Component {

  constructor(props) {
    super(props);

    this.getOptions = this.getOptions.bind(this);
  }

  filterWrongMeasurements(paths) {
    const higherZero = (number) => number > 0;
    paths = paths.filter(path => path["_source"]["rtts"].every(higherZero));

    return paths
  }

  getOptions() {
    const convertStats = (stats) => {
      let { min, q1, median, q3, max } = stats;
      min = min.toFixed(2);
      q1 = q1.toFixed(2);
      median = median.toFixed(2);
      q3 = q3.toFixed(2);
      max = max.toFixed(2);

      return { min, q1, median, q3, max }
    };

    return {
      onClick: (event, item) => {
        if (item.length) {
          const pathNavigation = {
            selectedHop: Number(item[0]._model.label)
          };
          this.props.onHopSelected(pathNavigation)
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItems) {
            return `Hop № ${tooltipItems[0].xLabel}`
          },
          boxplotLabel: function (item, data, stats, hoveredOutlierIndex) {
            let {min, q1, median, q3, max} = convertStats(stats);
            return `min: ${min} max:${max} q1:${q1} median:${median} q3:${q3}`;
          },
          violinLabel: function (item, data, stats) {
            let {min, q1, median, q3, max} = convertStats(stats);
            return [
              `min: ${min} max:${max}`,
              `median:${median}`,
              `q1:${q1} q3:${q3}`
            ]
          },
        }
      }
    }
  }

  handleHideShow() {
    const classList = document.getElementById("path-chart").classList;
    if (classList.contains("opened")) {
      classList.remove("opened")
    } else {
      classList.add("opened")
    }
  }

  handleChartResize() {
    const chartElement = document.getElementById("path-chart");
    const classList = chartElement.classList;

    const resizeIcon = document.getElementById("path-chart-resize-icon");
    const iconClassList = resizeIcon.classList;

    const pathInfoContainer = document.getElementsByClassName("path-info-container");

    if (classList.contains("maximized")) {
      classList.remove("maximized");
      pathInfoContainer[0].classList.remove("maximize-impact");

      iconClassList.remove("im-minimize");
      iconClassList.add("im-maximize")
    } else {
      classList.add("maximized");

      pathInfoContainer[0].classList.add("maximize-impact");
      iconClassList.remove("im-maximize");
      iconClassList.add("im-minimize")
    }

    const chartHeight = chartElement.clientHeight;
    const restScreenHeight = document.getElementsByTagName("body")[0].clientHeight - chartHeight - 75;
    document.getElementsByClassName("path-viewer-fragments")[0].style.height = restScreenHeight + "px"
  }

  render() {
    let {paths, selectedPath, pathInfo, pathChartRef} = this.props;
    const pathChartData = preparePathData(paths, selectedPath, pathInfo);
    const options = this.getOptions();

    return (
      <div id={"path-chart"} ref={pathChartRef} className={"path-viewer-container"}>
        <div className={"path-viewer"}>
          <div className={"path-viewer-switcher"}>
            <button onClick={this.handleHideShow}>
              <i className="im im-arrow-left"/>
            </button>
          </div>
          <div className={"path-viewer-switcher resize"}>
            <button onClick={this.handleChartResize}>
              <i id={"path-chart-resize-icon"} className="im im-maximize"/>
            </button>
          </div>
          <div className={"path-viewer-content"}>
            <div className={"path-viewer-wrapper chart"}>
              <h3>Hops chart</h3>
              <div className={"path-viewer-chart"}>
                <ChartComponent
                  data={pathChartData}
                  options={options}
                  legend={false}
                  ref={ref => this.chartInstance = ref && ref.chartInstance}
                  type='violin'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default PathChart;
