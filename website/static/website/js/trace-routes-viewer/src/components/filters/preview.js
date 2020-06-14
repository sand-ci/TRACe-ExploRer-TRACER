import React, {Component} from 'react';
import './css/preview.css'

class ItemsPreview extends Component {

  constructor(props) {
    super(props);

    this.focusOnFilter = this.focusOnFilter.bind(this)
  }

  focusOnFilter() {
    const container = this.props.queryContainer.current;
    if (!container.classList.contains("opened")) {
      container.classList.add("opened")
    }

    const {itemID} = this.props;
    const switcher = document.getElementById(`${itemID}-switcher`);
    switcher.click()
  }

  render() {
    const {name, items} = this.props;

    if (!items.length) {
      return <div/>
    }

    return (
      <div className={"filter-preview-item"}>
        <button onClick={this.focusOnFilter} className={"focus-on-ipv"}>{name}: <span className={"items-counter"}>{items.length}</span></button>
      </div>
    )
  }
}

class IPv6Preview extends Component {
  constructor(props) {
    super(props);

    this.switchIPv = this.switchIPv.bind(this)
  }

  switchIPv () {
    if (this.props.IPv6) {
      document.getElementById("ipv4-selection").click()
    } else {
      document.getElementById("ipv6-selection").click()
    }

    const {triggerRequest} = this.props;

    setTimeout(function () {
      triggerRequest()
    }, 1000)

  }

  render() {
    const { IPv6 } = this.props;
    return (
      <div className={"filter-preview-item"}>
        <button onClick={this.switchIPv} className={"focus-on-ipv"}>{IPv6 ? "IPv6": "IPv4"}</button>
      </div>
    )
  }
}

class TimePreview extends Component {

  constructor(props) {
    super(props);

    this.focusDatetimeFrom = this.focusDatetimeFrom.bind(this);
    this.focusDatetimeTo = this.focusDatetimeTo.bind(this)
  }

  focusDatetimeFrom() {
    const container = document.getElementById("time-query");
    if (!container.classList.contains("opened")) {
      const switcher = document.getElementsByClassName("search-query-switcher")[0];
      switcher.childNodes[0].click()
    }

    this.focusInput(0)
  }

  focusDatetimeTo() {
    const container = document.getElementById("time-query");
    if (!container.classList.contains("opened")) {
      const switcher = document.getElementsByClassName("search-query-switcher")[0];
      switcher.childNodes[0].click()
    }

    this.focusInput(1)
  }

  focusInput(index) {
    const inputs = document.getElementsByClassName("form-control");
    inputs[index].click()
  }

  render() {
    const { datetimeFrom, datetimeTo } = this.props;

    return (
      <div className={"filter-preview-item"}>
        <i className="im im-history"/>
        <button onClick={this.focusDatetimeFrom} className={"focus-on-time"}>{datetimeFrom.toISOString().slice(0, 19).replace("T", " ")}</button>
        <i className="im im-arrow-right"/>
        <button onClick={this.focusDatetimeTo} className={"focus-on-time"}>{datetimeTo.toISOString().slice(0, 19).replace("T", " ")}</button>
      </div>
    )
  }
}

class FiltersPreview extends Component {
  render() {
    const { query, itemsFilters, queryContainer } = this.props;

    const itemsFiltersContent = [];
    itemsFilters.forEach((item, i) => {
      itemsFiltersContent.push(
        <ItemsPreview
          queryContainer={queryContainer}
          key={`${i}-filter-preview`}
          name={item.title}
          items={query[item.id]}
          itemID={item.id}
        />
      )
    });

    return (
      <div className={"filter-preview"}>
        <div className={"filter-preview-inner"}>
          <TimePreview
            datetimeFrom={query.datetimeFrom}
            datetimeTo={query.datetimeTo}
          />
          <IPv6Preview
            IPv6={query.IPv6}
            triggerRequest={this.props.triggerRequest}
          />
          {itemsFiltersContent}
        </div>
      </div>
    )
  }
}

export default FiltersPreview;
