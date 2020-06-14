import DatetimeRangePicker from 'react-datetime-range-picker';
import './css/time-query.css';
import React, {Component} from 'react';
import moment from "moment";


class TimeQuery extends Component {
  constructor(props) {
    super(props);

    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleEndDateBlur = this.handleEndDateBlur.bind(this);
    this.handleStartDateBlur = this.handleStartDateBlur.bind(this);
    this.onTrashCanClick = this.onTrashCanClick.bind(this);
  }

  handleDateTimeChange(timeRange) {
    const {start, end} = timeRange;

    let newQuery = {...this.props.query};
    newQuery.datetimeTo = end;
    newQuery.datetimeFrom = start;

    this.props.onQueryChange(newQuery)
  }

  handleEndDateBlur(endDate) {
    if (endDate < this.props.query.datetimeFrom) {
      let newQuery = {...this.props.query};
      newQuery.datetimeTo = this.props.query.datetimeFrom;
      newQuery.datetimeFrom = endDate;

      this.props.onQueryChange(newQuery)
    }
  }

  handleStartDateBlur(startDate) {
    if (startDate > this.props.query.datetimeTo) {
      let newQuery = {...this.props.query};
      newQuery.datetimeTo = startDate;
      newQuery.datetimeFrom = this.props.query.datetimeTo;

      this.props.onQueryChange(newQuery)
    }
  }

  onTrashCanClick(e) {
    const element = e.target.parentElement;
    if (element.classList.contains("rotated")) {
      element.classList.remove("rotated");
    } else {
      element.classList.add("rotated");
    }

    const datetimeTo = moment().utc();
    let newQuery = {...this.props.query};
    newQuery.datetimeTo = datetimeTo;
    newQuery.datetimeFrom = datetimeTo.clone().subtract(1, "minutes");
    this.props.onQueryChange(newQuery)
  }

  render() {
    const {strikeData} = this.props;

    return (
      <div id={"time-query"} className={"search-query-container opened"} onMouseEnter={strikeData}>
        <div className={"time-query"}>
          <div className={"time-query-wrapper"}>
            <div>
              <div className={"items-filter-header"}>
                <div className={"items-filter-reset"}>
                  <button onClick={this.onTrashCanClick}><i className="im im-trash-can"/></button>
                </div>
                <div className={"items-filter-title"}>
                  <h3>Time range</h3>
                </div>
              </div>
              <div>
                <div className={"time-query-labels"}>
                  <div>
                    <span>from:</span>
                  </div>
                  <div>
                    <span>to:</span>
                  </div>
                </div>
                <DatetimeRangePicker
                  dateFormat={"YYYY-MM-DD"}
                  timeFormat={"H:mm:ss"}
                  pickerClassName={"datetime-picker"}
                  startDate={this.props.query.datetimeFrom}
                  endDate={this.props.query.datetimeTo}
                  input={true}
                  utc={true}
                  onChange={this.handleDateTimeChange}
                  onEndDateBlur={this.handleEndDateBlur}
                  onStartDateBlur={this.handleStartDateBlur}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TimeQuery;
