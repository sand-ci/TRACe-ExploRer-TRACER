import './css/items.css';
import '../../icons/iconmonstr-iconic-font-1.3.0/css/iconmonstr-iconic-font.min.css'
import React, { Component } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css';


function IfIPv4(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);

}

class ItemsBox extends Component {

  constructor(props) {
    super(props);

    this.handleItemsFilterDelete = this.handleItemsFilterDelete.bind(this);
    this.handleItemsFilterClear = this.handleItemsFilterClear.bind(this);
  }

  handleItemsFilterDelete(e) {
    this.props.onItemsFilterDelete(this.props.itemsFilterID, e.target.getAttribute("itemID"))
  }

  handleItemsFilterClear() {
    this.props.onItemsFilterClear(this.props.itemsFilterID)
  }

  render() {
    let boxContent = [];
    if (this.props.items.length) {
      for (let i = 0; i < this.props.items.length; i++) {
        boxContent.push(
          <button
            className={"selected-item text-truncate"}
            key={"btn-" + this.props.items[i]}
            onClick={this.handleItemsFilterDelete}
            itemID={this.props.items[i]}
          >
            {this.props.items[i]}
          </button>
        )
      }
      return(
        <div className={"selected-items-box-wrapper"}>
          <div className={"selected-items-box"}>
            <div className={"selected-items-box-empty"}>
              <button onClick={this.handleItemsFilterClear}>
                <i className="im im-x-mark-circle"/>
              </button>
            </div>
            <PerfectScrollbar>
              <div className={"item-box-scroll-content"}>
                {boxContent}
              </div>
            </PerfectScrollbar>
          </div>
        </div>
      )
    } else {
      return (
        <div className={"selected-items-box-wrapper"}>
          <div className={"selected-items-box"}>
            <div key={"item-box-empty"} className={"no-data-container"}>
              <span className={"no-data"}>No items selected</span>
            </div>
          </div>
        </div>
      )
    }
  }
}

class SearchBar extends Component {

  constructor (props) {
    super(props);

    this.handleSearchQueryChange = this.handleSearchQueryChange.bind(this);
    this.handleSearchBarReset = this.handleSearchBarReset.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleArrowUp = this.handleArrowUp.bind(this);
    this.handleArrowDown = this.handleArrowDown.bind(this);
    this.handleItemPressed = this.handleItemPressed.bind(this);
  }

  handleSearchQueryChange(e) {
    this.props.onSearchBarChange(e.target.value)
  }

  handleSearchBarReset() {
    this.props.onSearchBarChange("")
  }

  handleArrowUp() {
    const { itemFocused, paginateBy, currentPage, maxPage, onJumpToPageChange, onItemFocused, tail } = this.props;
    let itemFocusedCandidate = itemFocused;
    let currentPageCandidate = {
      value: 1,
      mask: "1"
    };

    if (itemFocused > 0) {
      itemFocusedCandidate --;
      onItemFocused(itemFocusedCandidate)
    } else {
      if (currentPage.value > 1) {
        currentPageCandidate.value = currentPage.value - 1;
        currentPageCandidate.mask = String(currentPage.value - 1);
        onJumpToPageChange(null, currentPageCandidate, maxPage);
        onItemFocused(paginateBy - 1)
      } else {
        currentPageCandidate.value = maxPage;
        currentPageCandidate.mask = String(maxPage);
        onJumpToPageChange(null, currentPageCandidate, maxPage);
        onItemFocused(tail - 1)
      }
    }
  }

  handleArrowDown() {
    const { itemFocused, paginateBy, currentPage, maxPage, onJumpToPageChange, onItemFocused, tail } = this.props;
    let itemFocusedCandidate = itemFocused;
    let currentPageCandidate = {
      value: 1,
      mask: "1"
    };

    if (currentPage.value < maxPage) {
      if (itemFocused < paginateBy - 1) {
        itemFocusedCandidate ++;
        onItemFocused(itemFocusedCandidate)
      } else {
        currentPageCandidate.value = currentPage.value + 1;
        currentPageCandidate.mask = String(currentPage.value + 1);
        onJumpToPageChange(null, currentPageCandidate, maxPage);
        onItemFocused(0)
      }
    } else {
      if (itemFocused < tail - 1) {
        itemFocusedCandidate ++;
        onItemFocused(itemFocusedCandidate)
      } else {
        currentPageCandidate.value = 1;
        currentPageCandidate.mask = String(1);
        onJumpToPageChange(null, currentPageCandidate, maxPage);
        onItemFocused(0)
      }
    }

  }

  handleItemPressed() {
    this.props.onItemPressed(this.props.itemFocused)
  }

  handleKeyDown(e) {
    if (e.keyCode === 38) {
      this.handleArrowUp()
    } else if (e.keyCode === 40) {
      this.handleArrowDown()
    } else if (e.keyCode === 13) {
      this.handleItemPressed()
    }
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.props.onItemPressed(null)
    }
  }

  render () {
    return (
      <div className={"items-filter-searchbar"}>
        <span>Search</span>
        <input
          className={"items-filter-searchbar-input"}
          type="text"
          onChange={this.handleSearchQueryChange}
          value={this.props.searchQuery}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
        />
        <button onClick={this.handleSearchBarReset} className={"reset-searchbar-btn"}>
          <i className="im im-x-mark-circle"/>
        </button>
      </div>
    )
  }
}

class SortBar extends Component {

  constructor(props) {
    super(props);

    this.handleFieldCLick = this.handleFieldCLick.bind(this)
  }

  handleFieldCLick(e) {
    const sortRules = this.props.sortRules;
    if (e.target.parentElement.getAttribute("itemID") === "name") {
      sortRules.name.active = true;
      sortRules.count.active = false;
      sortRules.name.asc = !this.props.sortRules.name.asc;
    } else {
      sortRules.count.active = true;
      sortRules.name.active = false;
      sortRules.count.asc = !this.props.sortRules.count.asc;
    }

    sortRules.matchIndex.active = false;
    this.props.onSortRulesChange(sortRules)
  }

  render() {
    return (
      <div className={"items-filter-sortbar"}>
        <button onClick={this.handleFieldCLick} itemID={"name"} className={"items-filter-sortbar-field name" + (this.props.sortRules.name.asc ? "": " rotated")}>
          <h5 className={this.props.sortRules.name.active ? "active": ""}>Name</h5>
          <span><i className="im im-arrow-up"/></span>
        </button>
        <button onClick={this.handleFieldCLick} itemID={"count"} className={"items-filter-sortbar-field count"  + (this.props.sortRules.count.asc ? "": " rotated")}>
          <h5 className={this.props.sortRules.count.active ? "active": ""}>Count</h5>
          <span><i className="im im-arrow-up"/></span>
        </button>
      </div>
    )
  }
}

class FilterContent extends Component {
  constructor(props) {
    super(props);

    this.handleItemFocusedChange = this.handleItemFocusedChange.bind(this);
    this.handleJumpToPage = this.handleJumpToPage.bind(this);
    this.handleItemsFilterSelect = this.handleItemsFilterSelect.bind(this);
  }

  handleJumpToPage(currentPage) {
    this.props.onJumpToPageChange(currentPage)
  }

  handleItemFocusedChange(itemID) {
    if (itemID !== undefined) {
      this.props.onItemFocused(Number(itemID))
    }
  }

  handleItemsFilterSelect(itemName) {
    this.props.onItemsFilterSelect(this.props.filterID, itemName)
  }

  sortItems(items) {

    if (this.props.sortRules.matchIndex.active) {
      if (this.props.sortRules.matchIndex.asc) {
        items.sort((a, b) => (a.count > b.count ? 1: -1));
        items.sort((a, b) => (a.weight > b.weight ? 1: -1))
      } else {
        items.sort((a, b) => (a.count > b.count ? 1: -1));
        items.sort((a, b) => (a.weight < b.weight ? 1: -1))
      }

      return items
    }

    if (this.props.sortRules.name.active) {
      if (this.props.sortRules.name.asc) {
        items.sort((a, b) => (a.count < b.count ? 1: -1));
        items.sort((a, b) => (a.name > b.name ? 1: -1))
      } else {
        items.sort((a, b) => (a.count < b.count ? 1: -1));
        items.sort((a, b) => (a.name < b.name ? 1: -1))
      }
    } else {
      if (this.props.sortRules.count.asc) {
        items.sort((a, b) => (a.name > b.name ? 1: -1));
        items.sort((a, b) => (a.count > b.count ? 1: -1))
      } else {
        items.sort((a, b) => (a.name > b.name ? 1: -1));
        items.sort((a, b) => (a.count < b.count ? 1: -1))
      }
    }

    return items
  }

  paginateItems(items) {
    let pageNumber = this.props.currentPage.value;
    --pageNumber;
    return items.slice(pageNumber * this.props.paginateBy, (pageNumber + 1) * this.props.paginateBy);
  }

  prepareRows(items) {
    let processedItems = this.paginateItems(this.sortItems(items));
    let rows = [];

    if (items.length) {
      for (let i = 0; i < processedItems.length; i++) {
        let item = processedItems[i];
        rows.push(
          <ContentRow
            key={item.name}
            name={item.name}
            count={item.count}
            notHere={item.notHere}
            weight={item.weight}
            searchQuery={this.props.searchQuery}
            itemIdx={i}
            focused={i === this.props.itemFocused}
            pressed={i === this.props.itemPressed}
            onItemsFilterSelect={this.handleItemsFilterSelect}
            onItemFocusedChange={this.handleItemFocusedChange}
          />
        )
      }
    } else {
      rows = [<li key={"no-data"} className={"filter-item no-data"}><span>No data</span></li>]
    }

    return rows
  }

  render() {
    return(
      <div className={""}>
        <div className={"filter-content"}>
          <ul id={"filter-items-shown-" + this.props.filterID} className={"filter-content-list"}>
            {this.prepareRows(this.props.items)}
          </ul>
        </div>
        <Paginator
          currentPage={this.props.currentPage}
          maxPage={this.props.maxPage}
          onJumpToPageChange={this.props.onJumpToPageChange}
        />
        <Statistics statistics={this.props.statistics}/>
      </div>
    )
  }
}

class ContentRow extends Component {
  constructor(props) {
    super(props);

    this.handleItemFocusedChange = this.handleItemFocusedChange.bind(this);
    this.handleItemsFilterSelect = this.handleItemsFilterSelect.bind(this);
    this.highlightSearchQuery = this.highlightSearchQuery.bind(this);
  }

  handleItemFocusedChange() {
    this.props.onItemFocusedChange(this.props.itemIdx)
  }

  handleItemsFilterSelect() {
    this.props.onItemsFilterSelect(this.props.name)
  }

  highlightSearchQuery() {
    if (this.props.searchQuery.length) {
      let modifiedSpan = [];
      let name = this.props.name;
      let substring = this.props.name.slice(this.props.weight, this.props.weight + this.props.searchQuery.length);
      let chunks = name.split(substring);

      for (let i = 0; i < chunks.length; i++) {
        modifiedSpan.push(chunks[i]);
        if (i + 1 !== chunks.length) {
          modifiedSpan.push(<span key={i + substring} className={"search-query-highlight"}>{substring}</span>)
        }
      }

      return modifiedSpan
    } else {
      return <span>{this.props.name}</span>
    }
  }

  render() {
    let additionalClasses = [
      this.props.focused ? "focused": "",
      this.props.pressed ? "pressed": "",
      this.props.notHere ? "notHere": ""
    ].join(" ");

    return(
      <li
        key={this.props.name}
        className={"filter-item" + additionalClasses ? " " + additionalClasses: ""}
        value={this.props.name}
        onClick={this.handleItemsFilterSelect}
        onMouseEnter={this.handleItemFocusedChange}
      >
        <div className={"filter-item-name text-truncate"} title={this.props.name}>
          <span>{this.highlightSearchQuery()}</span>
        </div>
        <div className={"filter-name-count text-truncate"}>
          <span>{this.props.count.toLocaleString()}</span>
        </div>
      </li>
    )
  }
}

class Paginator extends Component {
  constructor (props) {
    super(props);

    this.handlePreviousPage = this.handlePreviousPage.bind(this);
    this.handleJumpToPage = this.handleJumpToPage.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this)
  }

  handlePreviousPage() {
    let currentPage = {
      value: this.props.currentPage.value - 1,
      mask: this.props.currentPage.value - 1,
    };
    this.handleJumpToPage(null, currentPage)
  }

  handleJumpToPage(e, currentPage) {
    this.props.onJumpToPageChange(e, currentPage, this.props.maxPage)
  }

  handleNextPage() {
    let currentPage = {
      value: this.props.currentPage.value + 1,
      mask: this.props.currentPage.value + 1,
    };
    this.handleJumpToPage(null, currentPage)
  }

  handleFocusOut() {
    const currentPage = this.props.currentPage;
    currentPage.mask = currentPage.value;

    this.handleJumpToPage(null, currentPage)
  }

  render() {
    return (
      <div className={"items-filter-paginator"}>
        <button onClick={this.handlePreviousPage}><i className={"im im-angle-left"}/></button>
        <div className={"page-numbers"}>
          <input
            className={"items-filter-paginator-input"}
            onChange={this.handleJumpToPage}
            onBlur={this.handleFocusOut}
            value={this.props.currentPage.mask}
            type="text"/>
          <span>/</span>
          <span>{this.props.maxPage}</span>
        </div>
        <button onClick={this.handleNextPage}><i className={"im im-angle-right"}/></button>
      </div>
    )
  }
}

class Statistics extends Component {
  render() {
    return (
      <div className={"items-filter-statistics"}>
        <p>
          <span>Showing </span>
          <span>{this.props.statistics.shownFrom} </span>
          <span>to </span>
          <span>{this.props.statistics.shownTo} </span>
          <span>of </span>
          <span>{this.props.statistics.itemsShown} </span>
          <span>({this.props.statistics.itemsTotal}) </span>
          <span>records</span>
        </p>
      </div>
    )
  }
}

class ItemsFilter extends Component {
  constructor (props) {
    super(props);

    this.state = {
      searchQuery: "",
      currentPage: {
        value: 1,
        mask: "1"
      },
      paginateBy: 10,
      sortRules: {
        name: {
          asc: true,
          active: false
        },
        count: {
          asc: false,
          active: true
        },
        matchIndex: {
          asc:true,
          active: false
        }
      },
      itemFocused: 0,
      itemPressed: null
    };

    this.handleItemFocused = this.handleItemFocused.bind(this);
    this.handleItemPressed = this.handleItemPressed.bind(this);
    this.handleJumpToPage = this.handleJumpToPage.bind(this);
    this.handleSortRulesChange = this.handleSortRulesChange.bind(this);
    this.handleSearchQueryChange = this.handleSearchQueryChange.bind(this);
    this.onTrashCanClick = this.onTrashCanClick.bind(this);
  }

  handleItemFocused(itemFocused) {
    this.setState({itemFocused})
  }

  handleItemPressed(itemPressed) {
    if (itemPressed !== null) {
      const value = document.getElementById("filter-items-shown-" + this.props.filterID)
        .childNodes[itemPressed].getAttribute("value");

      this.props.onItemsFilterSelect(this.props.filterID, value)
    }

    this.setState({itemPressed})
  }

  handleJumpToPage(e, currentPage, maxPage) {
    if (e !== null) {
      let pageInput = e.target.value;
      if (pageInput === "") {
        currentPage = {
          value: this.state.currentPage.value,
          mask: pageInput,
        };
      } else {
        currentPage = {
          value: Number(pageInput),
          mask: pageInput
        }
      }
    }
    if ((0 === currentPage.value) || (currentPage.value > maxPage)) {
      if (0 === currentPage.value) {
        currentPage.value = maxPage;
        currentPage.mask = String(maxPage)
      }
      if (currentPage.value > maxPage) {
        currentPage.value = 1;
        currentPage.mask = String(1)
      }
    }

    this.setState({currentPage})
  }

  handleSortRulesChange(sortRules) {
    this.setState({sortRules})
  }

  handleSearchQueryChange(searchQuery) {
    const currentPage = {
      value: 1,
      mask: "1"
    };

    let sortRules = this.state.sortRules;
    sortRules.matchIndex.active = !!searchQuery.length;

    this.setState({
      searchQuery,
      currentPage,
      sortRules
    })
  }

  onTrashCanClick(e) {
    const element = e.target.parentElement;
    if (element.classList.contains("rotated")) {
      element.classList.remove("rotated");
    } else {
      element.classList.add("rotated");
    }

    this.props.onItemsFilterClear(this.props.filterID);

    this.setState({
      searchQuery: "",
      currentPage: {
        value: 1,
        mask: "1"
      },
      sortRules: {
        name: {
          asc: true,
          active: false
        },
        count: {
          asc: false,
          active: true
        },
        matchIndex: {
          asc:false,
          active: false
        }
      },
      itemFocused: 0,
      itemPressed: null
    })
  }

  filterItems(items) {
    let filteredItems = [];

    if (this.state.searchQuery) {
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let weight = item.name.toLowerCase().indexOf(this.state.searchQuery);
        if (weight >= 0) {
          item.weight = weight;
          filteredItems.push(item)
        }
      }
    } else {
      if (this.props.hideIPs) {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (!IfIPv4(item.name)) {
            filteredItems.push(item)
          }
        }
      } else {
        filteredItems = items
      }
    }

    return filteredItems
  }

  concatenateItems(items, allItems) {
    const concatenatedItems = items;
    const buffer = [];

    items.forEach(item => {
      buffer.push(item.name)
    })

    allItems.forEach(item => {
      if (buffer.indexOf(item.name) < 0) {
        item.notHere = true
        concatenatedItems.push(item)
      }
    })

    return concatenatedItems
  }

  calculateStatistics(items) {
    if (items.length === 0) {
      return {
        itemsShown: items.length,
        itemsTotal: this.props.allItems.length,
        shownFrom: 0,
        shownTo: 0
      }
    } else {
      const shownFrom = (this.state.currentPage.value - 1) * this.state.paginateBy + 1;
      return {
        itemsShown: items.length,
        itemsTotal: this.props.allItems.length,
        shownFrom: shownFrom,
        shownTo: shownFrom + this.state.paginateBy > items.length ? items.length: shownFrom + this.state.paginateBy - 1
      };
    }
  }

  calculateMaxPage(items) {
    let maxPage = 1;
    if (items.length) {
      maxPage = Math.ceil(items.length/this.state.paginateBy);
    }
    return maxPage
  }

  render() {
    let items = this.props.items;
    if (items.length) {
      items = this.filterItems(items);
    }

    let allItems = this.props.allItems;
    if (allItems.length) {
      allItems = this.filterItems(allItems);
    }

    items = this.concatenateItems(items, allItems)

    const statistics = this.calculateStatistics(items);
    const maxPage = this.calculateMaxPage(items);

    return (
      <div className={"items-filter" + (this.props.shownFilter ? " shown": "")}>
        <div className={"items-filter-wrapper"}>
          <div className={"items-filter-header"}>
            <div className={"items-filter-reset"}>
              <button onClick={this.onTrashCanClick}><i className="im im-trash-can"/></button>
            </div>
            <div className={"items-filter-title"}>
              <h3>{this.props.title}</h3>
            </div>
          </div>
          <div className={"items-filter-body"}>
            <ItemsBox
                items={this.props.selectedItems}
                onItemsFilterDelete={this.props.onItemsFilterDelete}
                itemsFilterID={this.props.filterID}
                onItemsFilterClear={this.props.onItemsFilterClear}
            />
            <SearchBar
                searchQuery={this.state.searchQuery}
                onSearchBarChange={this.handleSearchQueryChange}
                itemFocused={this.state.itemFocused}
                paginateBy={this.state.paginateBy}
                currentPage={this.state.currentPage}
                maxPage={maxPage}
                tail={items.length%this.state.paginateBy}
                onJumpToPageChange={this.handleJumpToPage}
                onItemFocused={this.handleItemFocused}
                onItemPressed={this.handleItemPressed}
            />
            <SortBar
                sortRules={this.state.sortRules}
                onSortRulesChange={this.handleSortRulesChange}
            />
            <FilterContent
                filterID={this.props.filterID}
                searchQuery={this.state.searchQuery}
                items={items}
                allItems={allItems}
                currentPage={this.state.currentPage}
                onJumpToPageChange={this.handleJumpToPage}
                onItemFocused={this.handleItemFocused}
                itemFocused={this.state.itemFocused}
                itemPressed={this.state.itemPressed}
                onItemsFilterSelect={this.props.onItemsFilterSelect}
                statistics={statistics}
                maxPage={maxPage}
                sortRules={this.state.sortRules}
                paginateBy={this.state.paginateBy}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ItemsFilter;