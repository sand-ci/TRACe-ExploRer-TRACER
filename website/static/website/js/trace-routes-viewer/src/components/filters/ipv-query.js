import './css/ipv-query.css';
import React, {Component} from 'react';


class IPvQuery extends Component {
  constructor(props) {
    super(props);

    this.onIPv4Clicked = this.onIPv4Clicked.bind(this);
    this.onIPv6Clicked = this.onIPv6Clicked.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
    this.onTrashCanClick = this.onTrashCanClick.bind(this);
  }

  onTrashCanClick(e) {
    const element = e.target.parentElement;
    if (element.classList.contains("rotated")) {
      element.classList.remove("rotated");
    } else {
      element.classList.add("rotated");
    }

    this.toggleSelection(false)
  }

  toggleSelection(ipv6) {
    let newQuery = {...this.props.query};
    newQuery.IPv6 = ipv6;
    this.props.onQueryChange(newQuery)
  }

  onIPv4Clicked() {
    this.toggleSelection(false)
  }

  onIPv6Clicked() {
    this.toggleSelection(true)
  }

  render() {
    const { IPv6 } = this.props.query;

    return (
      <div id={"ipv-query"} className={"search-query-container opened"} onMouseEnter={this.props.strikeQuery}>
        <div className={"ipv-query"}>
          <div className={"ipv-query-wrapper"}>
            <div>
              <div className={"items-filter-header"}>
                <div className={"items-filter-reset"}>
                  <button onClick={this.onTrashCanClick}><i className="im im-trash-can"/></button>
                </div>
                <div className={"items-filter-title"}>
                  <h3>IP version</h3>
                </div>
              </div>
              <div className={"ipv-content"}>
                <div className={"ipv-names"}>
                  <div className={"ipv-name"}>
                    <span>IPv4</span>
                  </div>
                  <div className={"ipv-name"}>
                    <span>IPv6</span>
                  </div>
                </div>
                <div className={"ipv-selections"}>
                  <div id={"ipv4-selection"} className={"ipv-selection ipv4" + (IPv6 ? " hidden": " active")} onClick={this.onIPv4Clicked}>
                    <div className={"selection-indicator"}>selected</div>
                  </div>
                  <div id={"ipv6-selection"} className={"ipv-selection ipv6" + (IPv6 ? " active": " hidden")} onClick={this.onIPv6Clicked}>
                    <div className={"selection-indicator"}>selected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default IPvQuery;