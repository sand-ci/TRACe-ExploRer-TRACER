import React, {Component} from 'react';
import 'chartjs-chart-box-and-violin-plot';
import "./css/path-info.css"
import PerfectScrollbar from 'react-perfect-scrollbar'
import preparePathData from '../../utils/common'
import { config } from '../../constants'


class ASNumberLabel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      asnData: null
    }
  }

  async componentDidMount() {
    const {asn} = this.props;

    let asnData = JSON.parse(localStorage.getItem(`asn-${asn}`));
    if (!asnData) {
      const response = await fetch(`${config.url.API_URL}asn/${asn}`);
      // const response = await fetch(`/api/asn/${asn}`);
      const response_content = await response.json();
      if (response_content.status) {
        asnData = response_content.item;
        localStorage.setItem(`asn-${asn}`, JSON.stringify(asnData))
      }
    }

    this.setState({asnData})
  }

  render() {
    const {asnData} = this.state;

    if (!asnData) {
      return <div className={"asn-label"}>Loading...</div>
    } else {
      return (
        <div className={"asn-label"}>
          <table>
            <tbody>
            <tr>
              <th>Name</th>
              <td>{asnData["Name"] ? asnData["Name"]: "-"}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{asnData["Description"] ? asnData["Description"]: "-"}</td>
            </tr>
            <tr>
              <th>Website</th>
              <td>
                {asnData["Website"] ? <a
                  className={"asn-website"}
                  href={asnData["Website"]}
                  target={"_blank"}>
                  {asnData["Website"]}
                </a>: "-"}
              </td>
            </tr>
            <tr>
              <th>Country</th>
              <td>{asnData["Country"] ? asnData["Country"]: "-"}</td>
            </tr>
            <tr>
              <th>E-mail contracts</th>
              <td>{asnData["E-mail contracts"] ? asnData["E-mail contracts"]: "-"}</td>
            </tr>
            <tr>
              <th>Abuse contracts</th>
              <td>{asnData["Abuse contracts"] ? asnData["Abuse contracts"]: "-"}</td>
            </tr>
            <tr>
              <th>Traffic estimation</th>
              <td>{asnData["Traffic estimation"] ? asnData["Traffic estimation"]: "-"}</td>
            </tr>
            <tr>
              <th>Traffic ratio</th>
              <td>{asnData["Traffic ratio"] ? asnData["Traffic ratio"]: "-"}</td>
            </tr>
            <tr>
              <th>Owner address</th>
              <td>{asnData["Owner address"] ? asnData["Owner address"]: "-"}}</td>
            </tr>
            </tbody>
          </table>
        </div>
      )
    }
  }
}

class PathNode extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovered: false
    }
  }

  handleEnter() {
    this.setState({isHovered: true})
  }

  handleLeave() {
    this.setState({isHovered: false})
  }

  render() {
    const {nodeType, value, extraValue, label, asn} = this.props;
    let variablePart;
    if (extraValue) {
      variablePart = <span>({extraValue})</span>
    } else {
      if (asn) {
        variablePart = <div className={"asn-container"} onMouseEnter={this.handleEnter.bind(this)} onMouseLeave={this.handleLeave.bind(this)}>
          <span>asn:</span><span>{asn}</span>{this.state.isHovered ? <ASNumberLabel asn={asn}/>: <span/>}
        </div>
      } else {
        variablePart = <span/>
      }
    }

    return (
      <div className={"path-fragment node " + nodeType}>
        <div className={"node-type"}>
          <span>{label}</span>
        </div>
        <div className={"node-info"}>
          <span title={value} >{value}</span>
          {variablePart}
        </div>
      </div>
    )
  }
}

class PathHop extends Component {

  constructor(props) {
    super(props);

    this.handleHopSelected = this.handleHopSelected.bind(this)
  }

  handleHopSelected() {
    const {hopNumber, onHopSelected} = this.props;

    const pathNavigation = {
      selectedHop: hopNumber
    };
    onHopSelected(pathNavigation)
  }

  render() {
    const { stats, hopSelected} = this.props;

    return (
      <div onClick={this.handleHopSelected} className={"path-fragment hop stats" + (hopSelected ? " active": "")}>
        <div className={"stats-group less"}>
          <div className={"stats-item min"}>
            <span className={"label"}>{"Min: "}</span>
            <span className={"value"}>{stats ? stats.min.toFixed(2): "-"}</span>
          </div>
          <div className={"stats-item q1"}>
            <span className={"label"}>{"Q1: "}</span>
            <span className={"value"}>{stats ? stats.q1.toFixed(2): "-"}</span>
          </div>
        </div>
        <div className={"stats-group middle"}>
          <div className={"stats-item median"}>
            <span className={"label"}>{"Std. dev."}</span>
            <span className={"value"}>{stats ? stats.stdDev.toFixed(2): "-"}</span>
          </div>
          <div className={"stats-item median"}>
            <span className={"label"}>{"Median"}</span>
            <span className={"value"}>{stats ? stats.median.toFixed(2): "-"}</span>
          </div>
        </div>
        <div className={"stats-group more"}>
          <div className={"stats-item max"}>
            <span className={"label"}>{"Max: "}</span>
            <span className={"value"}>{stats ? stats.max.toFixed(2): "-"}</span>
          </div>
          <div className={"stats-item q3"}>
            <span className={"label"}>{"Q3: "}</span>
            <span className={"value"}>{stats ? stats.q3.toFixed(2): "-"}</span>
          </div>
        </div>
      </div>
    )
  }
}

class PathInfo extends Component {
  constructor(props) {
    super(props);

    this.pathInfoRef = React.createRef();
    this.pathViewerFragments = React.createRef();
    this.scrollBarRef = React.createRef();

    this.getPathFragments = this.getPathFragments.bind(this);
    this.handleHopSelected = this.handleHopSelected.bind(this);
    this.handleHideShow = this.handleHideShow.bind(this);
  }

  componentDidMount() {
    const chartHeight = this.props.pathChart.current.clientHeight;
    const restScreenHeight = document.getElementsByTagName("body")[0].clientHeight - chartHeight - 75;
    document.getElementsByClassName("path-viewer-fragments")[0].style.height = restScreenHeight + "px"
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let scrollTop = -this.pathViewerFragments.current.scrollHeight/2.5;
    const elements = document.getElementsByClassName("path-fragment");
    let flag = false;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList.contains("active")) {
        flag = true;
        break
      } else {
        scrollTop += elements[i].scrollHeight
      }
    }

    if (flag) {
      this.scrollBarRef.current["_container"].scrollTo({
        top: scrollTop,
        behavior: "smooth"
      });
    }
  }

  filterWrongMeasurements(paths) {
    const higherZero = (number) => number > 0;
    paths = paths.filter(path => path["_source"]["rtts"].every(higherZero));

    return paths
  }

  getPathFragments(pathInfoData) {
    const { selectedHop, pathsStats } = this.props;
    const content = [];
    const {labels, pathInfo} = pathInfoData;
    if (pathInfo !== null) {

      let pathData = {};
      pathInfo["_source"]["ttls"].forEach((ttl, i) => {
        pathData[ttl] = {
          hop: pathInfo["_source"]["hops"][i],
          asn: pathInfo["_source"]["asns"][i],
          stats: pathsStats[`${pathInfo["_source"]["route-sha1"]}-${ttl}`]
        };
      });

      content.push(
        <PathNode
          key={pathInfo["_source"]["src"] + pathInfo["_source"]["route-sha1"]}
          label={"src"}
          nodeType={"src"}
          value={pathInfo["_source"]["src"]}
          extraValue={pathInfo["_source"]["src_host"]}
        />
      );

      let offset = 1;
      let destNumber = Math.max(...labels);
      labels.forEach((hopNumber, i) => {
        while (i + offset < hopNumber) {
          content.push(
            <PathHop
              key={(i + offset) + "Hop" + pathInfo["_source"]["route-sha1"]}
              hopSelected={(i + offset) === selectedHop}
              hopNumber={(i + offset)}
              onHopSelected={this.props.onHopSelected}
            />
          );
          content.push(
            <PathNode
              key={(i + offset) + "-node-" + pathInfo["_source"]["route-sha1"]}
              nodeType={"missed " + ((i + offset) === destNumber ? "dest": "hop")}
              label={(i + offset) === destNumber ? "dest": "Node №" + (i + offset)}
              value={"No data"}
            />
          );
          offset += 1;
        }

        if (hopNumber === i + offset) {
          const {hop, asn, stats} = pathData[hopNumber];
          content.push(
            <PathHop
              key={(i + offset) + "Hop" + pathInfo["_source"]["route-sha1"]}
              hopSelected={(i + offset) === selectedHop}
              stats={stats}
              hopNumber={(i + offset)}
              onHopSelected={this.props.onHopSelected}
            />
          );
          content.push(
            <PathNode
              key={(i + offset) + "-node-" + pathInfo["_source"]["route-sha1"]}
              nodeType={(i + offset) === destNumber ? "dest" + (pathInfo["_source"]["dest"] === hop ? "":" incomplete") : "hop"}
              label={(i + offset) === destNumber ? "dest": "Node №" + (i + offset)}
              value={hop}
              asn={asn}
            />
          )
        }
      })
    } else {
      content.push(<div key={"path-no-data"} className={"no-data"}><span>No data</span></div>)
    }

    return content
  }

  handleHideShow() {
    const classList = this.pathInfoRef.current.classList;
    if (classList.contains("opened")) {
      classList.remove("opened")
    } else {
      classList.add("opened")
    }
  }

  handleHopSelected(event) {
    console.log(event);
    // const pathNavigation = {
    //   selectedHop: Number(hopSelected)
    // };
    // this.props.onHopSelected(pathNavigation)
  }

  render() {
    const {paths, selectedPath, pathInfo} = this.props;

    const pathInfoData = preparePathData(paths, selectedPath, pathInfo);
    const pathFragments = this.getPathFragments(pathInfoData);

    return (
      <div id={"path-info"} ref={this.pathInfoRef} className={"path-viewer-container"}>
        <div className={"path-viewer"}>
          <div className={"path-viewer-switcher"}>
            <button onClick={this.handleHideShow} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
              <i className="im im-arrow-left"/>
            </button>
          </div>
          <div className={"path-viewer-content"}>
            <div className={"path-viewer-wrapper"}>
              <h3>Path info</h3>
              <div ref={this.pathViewerFragments} className={"path-viewer-fragments"}>
                <PerfectScrollbar ref={this.scrollBarRef}>
                  <div className={"path-viewer-fragments-content"}>
                    {pathFragments}
                  </div>
                </PerfectScrollbar>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}


export default PathInfo;
