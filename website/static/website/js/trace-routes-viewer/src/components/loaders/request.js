import React, {Component} from 'react';
import './css/request.css'


class RequestLoader extends Component {
  render() {
    return (
      <div id={"loader"} className={this.props.hidden ? "loader hidden": "loader"}>
        <div className={"loader-inner"}>
          <div className="container">
            <div className="dot-container">
              <div className="dot src"/>
              <div className="dot"/>
              <div className="dot"/>
            </div>
            <div className="dot-container">
              <div className="dot"/>
              <div className="dot missed"/>
              <div className="dot"/>
            </div>
            <div className="dot-container">
              <div className="dot src-dest"/>
              <div className="dot"/>
              <div className="dot dest"/>
            </div>
          </div>
          <p>Loading</p>
        </div>
      </div>
    )
  }
}

export default RequestLoader;
