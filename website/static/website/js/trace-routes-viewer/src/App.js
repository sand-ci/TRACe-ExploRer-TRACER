import React, { Component } from 'react';
import ItemsQuery from "./components/filters/items-query";
import TimeQuery from "./components/filters/time-query";
import IPvQuery from "./components/filters/ipv-query";
import PathsTable from "./components/tables/paths-table";
import PathChart from "./components/viewers/path-chart";
import PathInfo from "./components/viewers/path-info";
import ForceDirectedGraph from "./components/graphs/force-directed-graph";
import {dispatchUrl, packUrl} from "./utils/common";
import RequestLoader from "./components/loaders/request";
import FiltersPreview from "./components/filters/preview";
import './App.css';
import 'logo.svg';

import { config } from './constants'

class App extends Component {

  constructor (props) {
    super(props);

    this.state = {
      responseData: null,
      pathsStats: null,
      currentUrl: "",
      interruptedUrl: "",
      query: {
        datetimeFrom: null,
        datetimeTo: null,
        sources: [],
        sources_hosts: [],
        destinations: [],
        destinations_hosts: [],
        virtual_organisations: [], // not here yet
        IPv6: false
      },
      pathInfo: {
        filterWrongMeasurements: false
      },
      pathTableData: null,
      graphVisualisation: {
        threeDimensions: false,
        linksPower: 1,
        showMissedHops: false
      },
      graphNavigation: {
        selectedPath: null
      },
      pathNavigation: {
        selectedHop: null
      }
    };

    this.pathChartRef = React.createRef();
    this.queryContainerRef = React.createRef();
    this.preLoaderContainer = React.createRef();
    this.preLoaderErrors = React.createRef();
    this.loaderContainer = React.createRef();
    this.loaderErrors = React.createRef();

    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handlePathSelected = this.handlePathSelected.bind(this);
    this.handleHopSelected = this.handleHopSelected.bind(this);
    this.handleHideShow = this.handleHideShow.bind(this);

    this.getData = this.getData.bind(this);
  }

  async componentDidMount() {
    let urlParams = window.location.search;
    let query;
    let response;
    let response_content;
    let retry = 0;

    while (retry < 10) {
      try {
        if (!urlParams.length) {
          response = await fetch(`${config.url.API_URL}query`);
          response_content = await response.json();
          query = {...this.state.query};
          query.datetimeFrom = new Date(response_content["datetime_range"][0]);
          query.datetimeTo = new Date(response_content["datetime_range"][1])
        } else {
          response = await fetch(`${config.url.API_URL}query${urlParams}`);
          response_content = await response.json();
          query = dispatchUrl(urlParams);
        }

        this.preLoaderContainer.current.classList.add("hidden");
        break;
      } catch (error) {
        retry += 1
        this.preLoaderErrors.current.innerHTML = "";
        this.preLoaderErrors.current.append(
          `Failed to get response from server. Retry ${retry}/10`
        );
        this.preLoaderContainer.current.classList.remove("hidden")
      }
    }

    try {
      if (response_content.status) {
        urlParams = packUrl(query);
        const currentUrl = `${config.url.API_URL}query${urlParams}`;
        window.history.pushState(null, 'queried', window.location.origin + urlParams);
        const responseData = response_content['es_data'];
        const pathsStats = response_content['stats'];
        this.setState({query, responseData, pathsStats, currentUrl})
        if (this.preLoaderErrors.current) {
          this.preLoaderContainer.current.classList.add("hidden")
        }
      } else {
        alert(JSON.stringify(response_content.message))
      }
    } catch (error) {
      if (this.preLoaderErrors.current) {
        this.preLoaderErrors.current.innerHTML = "";
        this.preLoaderErrors.current.append(
          `Failed to get response from server. Try later.`
        )
      }
    }

  }

  handleQueryChange(query) {
    this.setState({query})
  }

  handlePathSelected(pathID) {
    const {graphNavigation} = this.state;
    if (pathID === graphNavigation.selectedPath) {
      graphNavigation.selectedPath = null;
    } else {
      graphNavigation.selectedPath = pathID;
    }
    this.setState({graphNavigation})
  }

  handleHopSelected(pathNavigation) {
    this.setState({pathNavigation})
  }

  async getData() {
    const query = this.state.query;
    const urlParams = packUrl(query);
    let url;
    let retry = 0;

    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");

    url = `${config.url.API_URL}query${urlParams}`;
    window.history.pushState(null, 'queried', window.location.origin + urlParams);
    if (url !== this.state.currentUrl) {
      while (retry < 10) {
        try {
          await fetch(url)
            .then(res => res.json())
            .then(responseData => {
              if (responseData.status) {
                if (responseData["number_of_paths"] > 50) {
                  let answer = window.confirm(`Number of paths is ${responseData["number_of_paths"]}, which is not recommended for rendering. Are you sure you want to continue?`);
                  if (answer) {
                    this.setState({pathsStats: responseData['stats']});
                    this.setState({responseData: responseData['es_data']});
                  }
                } else {
                  this.setState({pathsStats: responseData['stats']});
                  this.setState({responseData: responseData['es_data']});
                }
              } else {
                alert(JSON.stringify(responseData.message))
              }
            });
          this.loaderContainer.current.classList.add("hidden");
          retry = 10
        } catch (error) {
          retry += 1
          this.loaderErrors.current.innerHTML = "";
          this.loaderErrors.current.append(
            `Failed to get response from server. Retry ${retry}/10`
          )
          this.loaderContainer.current.classList.remove("hidden");
        }
      }

      this.setState({currentUrl: url})
    }

    loader.classList.add("hidden");
  }

  handleHideShow() {
    const classList = this.queryContainerRef.current.classList;
    if (classList.contains("opened")) {
      classList.remove("opened")
    } else {
      classList.add("opened")
    }
  }

  render() {
    if (this.state.responseData === null) {
      return (
        <div>
          <RequestLoader
            hidden={false}
          />
          <div ref={this.preLoaderContainer} className={"errors-on-load hidden"}>
            <p ref={this.preLoaderErrors}/>
          </div>
        </div>
      )
    }

    let itemsFilters = [
      {title: "Sources", id: "sources", hideIPs: false},
      {title: "Sources hosts", id: "sources_hosts", hideIPs: true},
      {title: "Destinations", id: "destinations", hideIPs: false},
      {title: "Destinations hosts", id: "destinations_hosts", hideIPs: true}
    ];

    return (
      <div className={"app-wrapper"}>
        <FiltersPreview
          queryContainer={this.queryContainerRef}
          query={this.state.query}
          itemsFilters={itemsFilters}
          triggerRequest={this.getData}
        />
        <div ref={this.queryContainerRef} className={"query-container opened"} onMouseLeave={this.getData}>
          <div className={"query-container-inner"}>
            <div id={"query-switcher"}>
              <button onClick={this.handleHideShow}>
                <i className="im im-arrow-right"/>
              </button>
            </div>
            <div className={"query-container-body"}>
              <div id={"logo"} onClick={() => document.location.href = "/"}/>
              <TimeQuery
                query={this.state.query}
                onQueryChange={this.handleQueryChange}
              />
              <div className={"query-separator"}/>
              <IPvQuery
                strikeQuery={this.getData}
                query={this.state.query}
                onQueryChange={this.handleQueryChange}
              />
              <div className={"query-separator"}/>
              <ItemsQuery
                strikeQuery={this.getData}
                query={this.state.query}
                itemsFilters={itemsFilters}
                aggregations={this.state.responseData.aggregations}
                onQueryChange={this.handleQueryChange}
              />
            </div>
          </div>
        </div>
        <div className={"table-container"}>
          <PathsTable
            paths={this.state.responseData['hits']['hits']}
            onPathSelected={this.handlePathSelected}
            selectedPath={this.state.graphNavigation.selectedPath}
            onHopSelected={this.handleHopSelected}
          />
        </div>
        <div className={"path-chart-container"}>
          <PathChart
            pathChartRef={this.pathChartRef}
            pathInfo={this.state.pathInfo}
            paths={this.state.responseData['hits']['hits']}
            selectedPath={this.state.graphNavigation.selectedPath}
            onHopSelected={this.handleHopSelected}
          />
        </div>
        <div className={"path-info-container"}>
          <PathInfo
            pathChart={this.pathChartRef}
            pathInfo={this.state.pathInfo}
            paths={this.state.responseData['hits']['hits']}
            pathsStats={this.state.pathsStats}
            selectedPath={this.state.graphNavigation.selectedPath}
            selectedHop={this.state.pathNavigation.selectedHop}
            onHopSelected={this.handleHopSelected}
          />
        </div>
        <div id={"graph-container"}>
          <ForceDirectedGraph
            responseData={this.state.responseData}
            pathsStats={this.state.pathsStats}
            graphVisualisation={this.state.graphVisualisation}
            graphNavigation={this.state.graphNavigation}
            pathNavigation={this.state.pathNavigation}
            onHopSelected={this.handleHopSelected}
            onPathSelected={this.handlePathSelected}
            selectedPath={this.state.graphNavigation.selectedPath}
            selectedHop={this.state.pathNavigation.selectedHop}
          />
        </div>
        <div>
          <RequestLoader
            hidden={true}
          />
          <div ref={this.loaderContainer} className={"errors-on-load hidden"}>
            <p ref={this.loaderErrors}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;