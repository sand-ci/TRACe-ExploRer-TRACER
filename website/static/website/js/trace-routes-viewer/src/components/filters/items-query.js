import ItemsFilter from "./items";
import './css/items-query.css';
import React, {Component} from 'react';

class SearchQueryNavigation extends Component {
  constructor(props) {
    super(props);

    this.prepareButtons = this.prepareButtons.bind(this);
    this.handleShownFilterChange = this.handleShownFilterChange.bind(this)
  }

  handleShownFilterChange(e) {
    const shownFilter = Number(e.target.getAttribute("itemID"));
    this.props.onShownFilterChange(shownFilter)
  }

  prepareButtons() {
    const buttons = [];
    this.props.itemsFilters.forEach((itemFilter, idx) => {
      buttons.push(
        <button
          id={`${itemFilter.id}-switcher`}
          key={itemFilter.title}
          className={"search-query-item" + (this.props.shownFilter === idx ? " active" : "")}
          onClick={this.handleShownFilterChange}
          itemID={idx}
        >
          {itemFilter.title}
        </button>
      )
    });

    return buttons
  }

  render() {
    const buttons = this.prepareButtons();

    return (
      <div className={"search-query-nav"}>
        {buttons}
      </div>
    )
  }
}

class ItemsQuery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shownFilter: 1
    };

    this.handleShownFilterChange = this.handleShownFilterChange.bind(this);
    this.remapItems = this.remapItems.bind(this);
    this.handleItemsFilterSelect = this.handleItemsFilterSelect.bind(this);
    this.handleItemsFilterDelete = this.handleItemsFilterDelete.bind(this);
    this.handleItemsFilterClear = this.handleItemsFilterClear.bind(this);
  }

  handleHideShow() {
    const containers = document.getElementsByClassName("search-query-container");
    for (let i = 0; i < containers.length; i++) {
      const classList = containers[i].classList;
      if (classList.contains("opened")) {
        classList.remove("opened")
      } else {
        classList.add("opened")
      }
    }
  }

  handleShownFilterChange(shownFilter) {
    this.setState({shownFilter})
  }

  handleItemsFilterSelect(itemsFilterID, value) {
    let query = this.props.query;
    if (query[itemsFilterID].indexOf(value) < 0) {
      query[itemsFilterID].unshift(value);

      this.props.onQueryChange(query)
    }
  }

  handleItemsFilterDelete(itemsFilterID, value) {
    let query = this.props.query;
    let selectedItems = [];

    query[itemsFilterID].forEach(item => {
      if (String(item) !== String(value)) {
        selectedItems.push(item)
      }
    });

    query[itemsFilterID] = selectedItems;
    this.props.onQueryChange(query)
  }

  handleItemsFilterClear(itemsFilterID) {
    let query = this.props.query;
    query[itemsFilterID] = [];
    this.props.onQueryChange(query)
  }

  remapItems(itemsFilterID) {
    return this.props.aggregations[itemsFilterID].buckets.map(item => {
      return {name: item.key, count: item.doc_count}
    })
  }

  render() {
    let itemsFilters = [];
    this.props.itemsFilters.forEach((itemFilter, idx) => {
      itemsFilters.push(
        <ItemsFilter
          key={itemFilter.id}
          title={itemFilter.title}
          filterID={itemFilter.id}
          hideIPs={itemFilter.hideIPs}
          shownFilter={this.state.shownFilter === idx}
          items={this.remapItems(itemFilter.id)}
          allItems={this.props.query.IPv6 ? this.props.ipv6Items[itemFilter.id]: this.props.ipv4Items[itemFilter.id]}
          selectedItems={this.props.query[itemFilter.id]}
          onItemsFilterSelect={this.handleItemsFilterSelect}
          onItemsFilterDelete={this.handleItemsFilterDelete}
          onItemsFilterClear={this.handleItemsFilterClear}
        />
      )
    });

    return (
      <div id={"search-query"} className={"search-query-container opened"}>
        <SearchQueryNavigation
          itemsFilters={this.props.itemsFilters}
          shownFilter={this.state.shownFilter}
          onShownFilterChange={this.handleShownFilterChange}
        />
        <div className={"search-query"} onMouseEnter={this.props.strikeQuery}>
          {itemsFilters}
        </div>
      </div>
    )
  }
}

export default ItemsQuery;
