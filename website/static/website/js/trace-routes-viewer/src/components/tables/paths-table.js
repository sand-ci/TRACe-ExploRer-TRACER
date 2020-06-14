import './css/paths-table.css';
import React, {Component} from 'react';


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
      <div className={"paths-table-paginator"}>
        <div className={"empty"}/>
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
        <div className={"empty"}/>
      </div>
    )
  }
}

class Contents extends Component {

  constructor(props) {
    super(props);

    this.prepareRows = this.prepareRows.bind(this);
    this.sortItems = this.sortItems.bind(this);
    this.handleSortFieldCLick = this.handleSortFieldCLick.bind(this);
    this.handleItemFocusedChange = this.handleItemFocusedChange.bind(this);
  }

  handleSortFieldCLick(e) {
    const sortRules = this.props.sortRules;
    const element = e.currentTarget;
    if (element.getAttribute("name") === sortRules.columnName) {
      sortRules.asc = !this.props.sortRules.asc;
    } else {
      sortRules.asc = element.getAttribute("value") === "asc";
      sortRules.columnName = element.getAttribute("name")
    }

    this.props.onSortRulesChange(sortRules)
  }

  handleItemFocusedChange(itemID) {
    if (itemID !== undefined) {
      this.props.onItemFocused(Number(itemID))
    }
  }

  sortItems(items) {
    const {sortRules, pathsCount} = this.props;
    if (sortRules.columnName === "count") {
      if (sortRules.asc) {
        items.sort((a, b) => (pathsCount[a["_source"]["route-sha1"]] > pathsCount[b["_source"]["route-sha1"]] ? 1: -1));
      } else {
        items.sort((a, b) => (pathsCount[a["_source"]["route-sha1"]] < pathsCount[b["_source"]["route-sha1"]] ? 1: -1));
      }
    } else {
      const fieldName = sortRules.columnName;
      if (sortRules.asc) {
        items.sort((a, b) => ((a["_source"][fieldName] || '') > (b["_source"][fieldName] || '') ? 1: -1));
      } else {
        items.sort((a, b) => ((a["_source"][fieldName] || '') < (b["_source"][fieldName] || '') ? 1: -1));
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
          <Path
            key={item._source["route-sha1"]}
            searchQuery={this.props.searchQuery}
            itemIdx={i}
            item={item}
            count={this.props.pathsCount[item._source["route-sha1"]]}
            odd={Math.abs(i % 2) === 1}
            focused={this.props.itemFocused === i}
            pressed={this.props.selectedPath === item._source["route-sha1"]}
            onItemFocusedChange={this.handleItemFocusedChange}
            onItemClicked={this.props.onItemPressed}
          />
        )
      }
    } else {
      rows = [<tr key={"no-data"} className={"filter-item no-data"}><td colSpan={6}><span>No data</span></td></tr>]
    }

    return rows
  }

  render() {
    const {columnName, asc} = this.props.sortRules;

    return (
      <div>
        <table id={"paths-table"} className={"full-width"} cellSpacing="1" cellPadding="0">
          <thead>
          <tr className={"table-head"}>
            <th>
              <div className={"table-column-name"}>
                <span>Path's ends</span>
              </div>
            </th>
            <th>
              <div className={"table-column-name"}>
                <span>Hosts</span>
              </div>
            </th>
            <th className={"middle"}>
              <div className={"table-column-name"}>
                <span>Sites</span>
              </div>
            </th>
            <th className={"middle"}>
              <div className={"table-column-name"}>
                <span>Virtual Organisations</span>
              </div>
            </th>
            <th className={"small"}>
              <div className={"table-column-name"}>
                <span>Production</span>
              </div>
            </th>
            <th className={"small"}>
              <div className={"table-column-name no-border"}>
                <span>Count</span>
              </div>
            </th>
          </tr>
          <tr className={"table-sub-head"}>
            <th>
              <div className={"table-column-name"}>
                <div className={"two-lines-cell"}>
                  <button className={"table-row-value text-center " + (columnName === "src" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"src"} value={"desc"}>
                    <span>Src</span>
                    <span className={"arrow"}>{columnName === "src" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                  <button className={"table-row-value text-center " + (columnName === "dest" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"dest"} value={"desc"}>
                    <span>Dest</span>
                    <span className={"arrow"}>{columnName === "dest" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div className={"table-column-name"}>
                <div className={"two-lines-cell"}>
                  <button className={"table-row-value text-center " + (columnName === "src_host" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"src_host"} value={"desc"}>
                    <span>Src</span>
                    <span className={"arrow"}>{columnName === "src_host" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                  <button className={"table-row-value text-center " + (columnName === "dest_host" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"dest_host"} value={"desc"}>
                    <span>Dest</span>
                    <span className={"arrow"}>{columnName === "dest_host" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div className={"table-column-name"}>
                <div className={"two-lines-cell"}>
                  <button className={"table-row-value text-center " + (columnName === "src_site" && !asc ? "rotated": "")}  onClick={this.handleSortFieldCLick} name={"src_site"} value={"desc"}>
                    <span>Src</span>
                    <span className={"arrow"}>{columnName === "src_site" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                  <button className={"table-row-value text-center " + (columnName === "dest_site" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"dest_site"} value={"desc"}>
                    <span>Dest</span>
                    <span className={"arrow"}>{columnName === "dest_site" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div className={"table-column-name"}>
                <div className={"two-lines-cell"}>
                  <button className={"table-row-value text-center " + (columnName === "src_VO" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"src_VO"} value={"desc"}>
                    <span>Src</span>
                    <span className={"arrow"}>{columnName === "src_VO" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                  <button className={"table-row-value text-center " + (columnName === "dest_VO" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"dest_VO"} value={"desc"}>
                    <span>Dest</span>
                    <span className={"arrow"}>{columnName === "dest_VO" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div className={"table-column-name"}>
                <div className={"two-lines-cell"}>
                  <button className={"table-row-value text-center " + (columnName === "src_production" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"src_production"} value={"desc"}>
                    <span>Src</span>
                    <span className={"arrow"}>{columnName === "src_production" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                  <button className={"table-row-value text-center " + (columnName === "dest_production" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"dest_production"} value={"desc"}>
                    <span>Dest</span>
                    <span className={"arrow"}>{columnName === "dest_production" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                </div>
              </div>
            </th>
            <th>
              <div className={"table-column-name"}>
                <div className={"one-lines-cell"}>
                  <button className={"table-row-value text-center " + (columnName === "count" && !asc ? "rotated": "")} onClick={this.handleSortFieldCLick} name={"count"} value={"desc"}>
                    <span>Records</span>
                    <span className={"arrow"}>{columnName === "count" ? <i className="im im-arrow-up"/>:
                      <i className="im im-minus"/>}</span>
                  </button>
                </div>
              </div>
            </th>
          </tr>
          </thead>
          <tbody>
          {this.prepareRows(this.props.paths)}
          </tbody>
        </table>
        <div>
          <Paginator
            currentPage={this.props.currentPage}
            maxPage={this.props.maxPage}
            onJumpToPageChange={this.props.onJumpToPageChange}
          />
          <Statistics statistics={this.props.statistics}/>
        </div>
      </div>
    )
  }
}

class Path extends Component {

  constructor(props) {
    super(props);

    this.handleItemFocusedChange = this.handleItemFocusedChange.bind(this);
    this.highlightSearch = this.highlightSearch.bind(this);
    this.handleItemCLicked = this.handleItemCLicked.bind(this);
  }

  handleItemCLicked() {
    this.props.onItemClicked(this.props.itemIdx)
  }

  handleItemFocusedChange() {
    this.props.onItemFocusedChange(this.props.itemIdx)
  }

  highlightSearch(value) {
    if (this.props.searchQuery.length) {
      let index = value.toLowerCase().indexOf(this.props.searchQuery.toLowerCase());
      if (index >= 0) {
        let modifiedSpan = [];
        let substring = value.slice(index, index + this.props.searchQuery.length);
        let chunks = value.split(substring);

        for (let i = 0; i < chunks.length; i++) {
          modifiedSpan.push(chunks[i]);
          if (i + 1 !== chunks.length) {
            modifiedSpan.push(<span key={i + substring} className={"search-query-highlight"}>{substring}</span>)
          }
        }

        return modifiedSpan
      } else {
        return value
      }

    } else {
      return value
    }
  }

  render() {
    const item = this.props.item._source;

    return (
      <tr onMouseEnter={this.handleItemFocusedChange}
          onClick={this.handleItemCLicked
          } itemID={item["route-sha1"]}
          className={"path-table-row" + (this.props.odd ? " odd": " even") + (this.props.focused ? " focused": "") + (this.props.pressed ? " pressed": "")}>
        <td className={"border-left"}>
          <div className={"two-lines-cell large"}>
            <p className={"table-row-value source text-left text-truncate"} title={item.src}><span>{this.highlightSearch(item.src ? item.src: "-")}</span></p>
            <p className={"table-row-value destination text-left text-truncate"} title={item.dest}><span>{this.highlightSearch(item.dest ? item.dest: "-")}</span></p>
          </div>
        </td>
        <td>
          <div className={"two-lines-cell large"}>
            <p className={"table-row-value source text-left text-truncate"} title={item.src_host}>{this.highlightSearch(item.src_host ? item.src_host: "-")}</p>
            <p className={"table-row-value destination text-left text-truncate"} title={item.dest_host}>{this.highlightSearch(item.dest_host ? item.dest_host: "-")}</p>
          </div>
        </td>
        <td>
          <div className={"two-lines-cell middle"}>
            <p className={"table-row-value source text-center text-truncate"} title={item.src_site}>{this.highlightSearch(item.src_site ? item.src_site: "-")}</p>
            <p className={"table-row-value destination text-center text-truncate"} title={item.dest_site}>{this.highlightSearch(item.dest_site ? item.dest_site: "-")}</p>
          </div>
        </td>
        <td>
          <div className={"two-lines-cell middle"}>
            <p className={"table-row-value source text-center text-truncate"} title={item.src_VO}>{this.highlightSearch(item.src_VO ? item.src_VO: "-")}</p>
            <p className={"table-row-value destination text-center text-truncate"} title={item.dest_VO}>{this.highlightSearch(item.dest_VO ? item.dest_VO: "-")}</p>
          </div>
        </td>
        <td>
          <div className={"two-lines-cell small"}>
            <p className={"table-row-value source text-center"}>{item.src_production ?
              <i className="green im im-check-mark-circle-o"/> : <i className="red im im-x-mark-circle-o"/>}</p>
            <p className={"table-row-value destination text-center"}>{item.dest_production ?
              <i className="green im im-check-mark-circle-o"/> : <i className=" red im im-x-mark-circle-o"/>}</p>
          </div>
        </td>
        <td  className={"border-right"}>
          <div className={"one-lines-cell small"}>
            <p className={"table-row-value text-center border-right"}>{this.props.count}</p>
          </div>
        </td>
      </tr>
    )
  }
}


class PathsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: "",
      currentPage: {
        value: 1,
        mask: "1"
      },
      paginateBy: 5,
      sortRules: {
        columnName: "count",
        asc: false
      },
      itemFocused: 0,
      itemPressed: null,
    };

    this.handleJumpToPage = this.handleJumpToPage.bind(this);
    this.handleSortRulesChange = this.handleSortRulesChange.bind(this);
    this.handleItemFocused = this.handleItemFocused.bind(this);
    this.handleSearchQueryChange = this.handleSearchQueryChange.bind(this);
    this.handleItemPressed = this.handleItemPressed.bind(this);
  }

  handleSortRulesChange(sortRules) {
    this.setState({sortRules})
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

  handleItemFocused(itemFocused) {
    this.setState({itemFocused})
  }

  handleSearchQueryChange(searchQuery) {
    const currentPage = {
      value: 1,
      mask: "1"
    };

    this.setState({
      searchQuery,
      currentPage
    })
  }

  handleItemPressed(itemPressed) {
    if (itemPressed !== null) {
      this.setState({itemPressed});
      const pathID = document.getElementsByClassName("path-table-row")[itemPressed].getAttribute("itemID");
      this.props.onPathSelected(pathID);
      this.props.onHopSelected({selectedHop: null})
    }

    this.setState({itemPressed})
  }

  calculateStatistics(items) {
    const itemsTotal = new Set(Array.from(this.props.paths, item => item["_source"]["route-sha1"])).size;

    if (items.length === 0) {
      return {
        itemsShown: items.length,
        itemsTotal: itemsTotal,
        shownFrom: 0,
        shownTo: 0
      }
    } else {
      const shownFrom = (this.state.currentPage.value - 1) * this.state.paginateBy + 1;
      return {
        itemsShown: items.length,
        itemsTotal: itemsTotal,
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

  countPaths(paths){
    const count = {};
    for (let i = 0; i < paths.length; i++) {
      count[paths[i]["_source"]["route-sha1"]] = 1 + (count[paths[i]["_source"]["route-sha1"]] || 0)
    }

    return count
  }

  filterPaths(paths) {
    const {searchQuery} = this.state;
    const searchFields = ["src", "dest", "src_host", "dest_host", "src_site", "dest_site", "src_VO", "dest_VO"];

    let buffer = [], processedItems = [];
    for (let k = 0; k < paths.length; k++) {
      if (buffer[paths[k]["_source"]["route-sha1"]]) continue;
      buffer[paths[k]["_source"]["route-sha1"]] = true;

      if (searchQuery) {
        for (let j = 0; j < searchFields.length; j++) {
          if (paths[k]["_source"][searchFields[j]]) {
            if (paths[k]["_source"][searchFields[j]].toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0) {
              processedItems.push(paths[k]);
              break
            }
          }
        }
      } else {
        processedItems.push(paths[k])
      }
    }

    return processedItems
  }

  handleHideShow() {
    const classList = document.getElementById("paths-table-container").classList;
    if (classList.contains("opened")) {
      classList.remove("opened")
    } else {
      classList.add("opened")
    }
  }

  render() {

    const paths = this.filterPaths(this.props.paths);
    const pathsCount = this.countPaths(this.props.paths);
    const statistics = this.calculateStatistics(paths);
    const maxPage = this.calculateMaxPage(paths);

    return (
      <div id={"paths-table-container"} className={"paths-table opened"}>
        <div className={"paths-table-switcher"}>
          <button onClick={this.handleHideShow} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}>
            <i className="im im-arrow-down"/>
          </button>
        </div>
        <div className={"paths-table-wrapper"}>
          <div>
            <div className={"paths-table-tools"}>
              <div className={"paths-table-tool-item"}/>
              <div className={"paths-table-tool-item"}>
                <SearchBar
                  searchQuery={this.state.searchQuery}
                  onSearchBarChange={this.handleSearchQueryChange}
                  itemFocused={this.state.itemFocused}
                  paginateBy={this.state.paginateBy}
                  currentPage={this.state.currentPage}
                  maxPage={maxPage}
                  tail={paths.length % this.state.paginateBy}
                  onJumpToPageChange={this.handleJumpToPage}
                  onItemFocused={this.handleItemFocused}
                  onItemPressed={this.handleItemPressed}
                />
              </div>
            </div>
            <div className={"paths-table-body"}>
              <Contents
                paths={paths}
                pathsCount={pathsCount}
                searchQuery={this.state.searchQuery}
                currentPage={this.state.currentPage}
                paginateBy={this.state.paginateBy}
                maxPage={maxPage}
                onJumpToPageChange={this.handleJumpToPage}
                statistics={statistics}
                sortRules={this.state.sortRules}
                onSortRulesChange={this.handleSortRulesChange}
                itemFocused={this.state.itemFocused}
                selectedPath={this.props.selectedPath}
                onItemFocused={this.handleItemFocused}
                onItemPressed={this.handleItemPressed}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default PathsTable
