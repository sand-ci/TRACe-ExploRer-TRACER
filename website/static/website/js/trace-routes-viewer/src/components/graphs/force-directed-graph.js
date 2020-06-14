import React, {Component} from 'react';
import './css/force-directed-graph.css'
import {ForceGraph3D} from 'react-force-graph';
import {SphereGeometry, Mesh, MeshBasicMaterial} from 'three';

const shapes = {
  "LargeSphere": new SphereGeometry(10, 32, 32),
  "sphere": new SphereGeometry(5, 32, 32)
};

class Node {
  constructor(id, type, number, pathHash) {
    this.id = id;
    this.type = type;
    this.number = number;
    this.pathHash = pathHash;
    this.label = this.getLabel();
  }

  getLabel() {
    let label;
    switch (this.type) {
      case 'src':
        label = `<span class="tooltip-content">Source: ${this.id}</span>`;
        break;
      case 'dest':
        label = `<span class="tooltip-content">Destination: ${this.id}</span>`;
        break;
      case 'hop':
        label = `<span class="tooltip-content">Node №${this.number}: ${this.id}</span>`;
        break;
      case "src-dest":
        label = `<span class="tooltip-content">Source&Destination: ${this.id}</span>`;
        break;
      case 'missed-hop':
        label = `<span class="tooltip-content">Missed node №${this.number}</span>`;
        break;
      default:
        label = this.id
    }

    return label
  }

  get color() {
    let color;
    switch (this.type) {
      case "src":
        color = '#ff2b83';
        break;
      case "dest":
        color = '#0a7cb3';
        break;
      case "src-dest":
        color = '#ad2bff';
        break;
      case "missed-hop":
        color = '#ff832b';
        break;
      default:
        color = '#484848'
    }

    return color
  }

  get shape() {
    let shape;
    switch (this.type) {
      case "src":
        shape = 'LargeSphere';
        break;
      case "dest":
        shape = 'LargeSphere';
        break;
      case "src-dest":
        shape = 'LargeSphere';
        break;
      default:
        shape = 'sphere'
    }

    return shape
  }
}

class Link {
  constructor(source, target, hopNumber, pathHash, hopStats, completed) {
    this.id = `${pathHash}-${hopNumber}`;
    this.source = source.id;
    this.target = target.id;
    this.hopNumber = hopNumber;
    this.pathHash = pathHash;
    this.hopStats = hopStats;
    this.curvature = 0;
    this.rotation = 0;
    this.distance = this.getDistance();
    this.velocity = this.getVelocity();
    this.color = '#484848';
    this.completed = completed;
  }

  getDistance() {
    let dist = 5;
    if (this.hopStats) {
      dist = this.hopStats.median;
      if (dist <= 5) {
        dist = 5
      }
    }

    return dist
  }

  getVelocity() {
    let velocity = 0.4;
    if (this.hopStats) {
      if (this.hopStats.median <= 0) {
        velocity = 0.4
      } else {
        velocity = Math.exp(-0.05 * (this.hopStats.median + 40));
      }
    }

    return velocity
  }

  set calculateCurvature(counter) {
    this.curvature = 0.3 * counter
  }

  get calculateCurvature() {
    return this.curvature
  }

  set calculateRotation(counter) {
    this.rotation = Number((Math.PI * counter / 6).toFixed(3))
  }

  get calculateRotation() {
    return this.rotation
  }
}

class GraphData {
  constructor() {
    this.nodes = {};
    this.links = {};

    this.nodesConnectionsCounter = {};
  }

  addNode(node) {
    if (node.id in this.nodes && node.type !== 'hop') {
      if ((node.type === "src" && this.nodes[node.id].type === "dest") ||
        (node.type === "dest" && this.nodes[node.id].type === "src")) {
        node.type = "src-dest";
        node.label = node.getLabel()
      }
      delete this.nodes[node.id]
      this.nodes[node.id] = node
    } else {
      this.nodes[node.id] = node
    }
  }

  addLink(link) {
    if (!(link.id in this.links)) {
      this.nodesConnectionsCounter[link.source] = this.nodesConnectionsCounter[link.source] ? this.nodesConnectionsCounter[link.source] + 1 : 1;

      link.calculateCurvature = this.nodesConnectionsCounter[link.source];
      link.calculateRotation = this.nodesConnectionsCounter[link.source];
      this.links[link.id] = link;

    }
  }

  jsonData() {
    return {
      nodes: Object.values(this.nodes),
      links: Object.values(this.links)
    }
  }
}

class ForceDirectedGraph extends Component {

  constructor(props) {
    super(props);

    this.state = {
      graphData: {
        nodes: [],
        links: []
      }
    };

    this.graphRef = React.createRef();

    this.focusOnHop = this.focusOnHop.bind(this);
    this.prepareData = this.prepareData.bind(this);
    this.getLinkLabel = this.getLinkLabel.bind(this);
    this.handleHopPressed = this.handleHopPressed.bind(this);
  }

  getLinkLabel(linkId) {
    const {pathsStats} = this.props;
    const hopStats = pathsStats[linkId];
    return `<div class="tooltip-content">
              <table>
                <tr>
                  <th><span class="label">Min: </span></th>
                  <td><span class="value">${hopStats ? hopStats.min.toFixed(2) : "-"}</span></td>
                  <th><span class="label">Std. dev.: </span></th>
                  <td><span class="value">${hopStats ? hopStats.stdDev.toFixed(2) : "-"}</span></td>
                  <th><span class="label">Max: </span></th>
                  <td><span class="value">${hopStats ? hopStats.max.toFixed(2) : "-"}</span></td>
                </tr>
                <tr>
                  <th><span class="label">Q1: </span></th>
                  <td><span class="value">${hopStats ? hopStats.q1.toFixed(2) : "-"}</span></td>
                  <th><span class="label">Median: </span></th>
                  <td><span class="value">${hopStats ? hopStats.median.toFixed(2) : "-"}</span></td>
                  <th><span class="label">Q3: </span></th>
                  <td><span class="value">${hopStats ? hopStats.q3.toFixed(2) : "-"}</span></td>
                </tr>
            </table>
          </div>`
  }

  componentDidMount() {
    const graphData = this.prepareData();
    this.graphRef.current.d3Force('link').distance(link => link.distance);
    this.setState({graphData})
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.responseData !== prevProps.responseData) {
      const graphData = this.prepareData();
      this.setState({graphData})
    }

    if (this.props.selectedHop !== prevProps.selectedHop) {
      const {selectedPath, selectedHop} = this.props;
      this.graphRef.current.d3Force('link').distance(link => {
        if (`${selectedPath}-${selectedHop}` === link.id) {
          this.focusOnHop(link)
        }

        return link.distance
      });
    }
  }

  handleHopPressed(hopPressed) {
    const {selectedPath, selectedHop} = this.props;
    if (selectedPath === hopPressed.pathHash && selectedHop === hopPressed.hopNumber) {
      this.props.onPathSelected(null);
      this.props.onHopSelected({selectedHop: null})
    } else {

      if (selectedPath === hopPressed.pathHash && selectedHop !== hopPressed.hopNumber) {
        this.props.onHopSelected({selectedHop: hopPressed.hopNumber})
      } else {
        this.props.onPathSelected(hopPressed.pathHash);
        this.props.onHopSelected({selectedHop: hopPressed.hopNumber})
      }
    }

    this.graphRef.current.refresh();

  }

  focusOnHop(hop) {
    if (hop["__arrowObj"]) {
      const position = hop["__arrowObj"].position;

      const distance = 250;
      const distRatio = 1 + distance / Math.hypot(position.x, position.y, position.z);

      this.graphRef.current.cameraPosition(
        {x: position.x * distRatio, y: position.y * distRatio, z: position.z * distRatio},
        position,
        3000
      );
    }
  }

  prepareData() {
    const {responseData, pathsStats} = this.props;
    const hits = responseData['hits']['hits'];

    const graphData = new GraphData();

    for (let i = 0; i < hits.length; i++) {
      const record = hits[i]['_source'];
      const pathHash = record['route-sha1'];

      const hops = record['hops'];
      const ttls = record['ttls'];

      const src = new Node(record['src'], 'src', 0, pathHash);
      graphData.addNode(src);
      const dest = new Node(record['dest'], 'dest', hops.length - 1, pathHash);
      graphData.addNode(dest);

      const completed = dest.id === hops[hops.length - 1];
      let previousNode = src;

      let offset = 1;
      hops.forEach((hop, idx) => {
        const ttl = ttls[idx];
        while (idx + offset < ttl) {
          const missedNode = new Node(`${pathHash}-${idx + offset}`, 'missed-hop', idx + offset, pathHash);
          graphData.addNode(missedNode);
          graphData.addLink(new Link(previousNode, missedNode, idx + offset, pathHash, pathsStats[`${pathHash}-${idx + offset}`], completed));
          previousNode = missedNode;
          offset += 1
        }

        const node = new Node(hop, 'hop', idx + offset, pathHash);

        if (idx !== hops.length - 1) {
          graphData.addNode(node);
          graphData.addLink(new Link(previousNode, node, ttl, pathHash, pathsStats[`${pathHash}-${ttl}`], completed));
          previousNode = node
        } else {
          if (completed) {
            graphData.addLink(new Link(previousNode, dest, ttl, pathHash, pathsStats[`${pathHash}-${ttl}`], completed));
          } else {
            graphData.addNode(node);
            graphData.addLink(new Link(previousNode, node, ttl, pathHash, pathsStats[`${pathHash}-${ttl}`], completed));
            graphData.addLink(new Link(node, dest, ttl + 1, pathHash, pathsStats[`${pathHash}-${ttl}`], completed));
          }
        }
      })

    }

    return graphData.jsonData()

  }

  render() {
    const {selectedPath, selectedHop} = this.props;

    return (
      <ForceGraph3D
        graphData={this.state.graphData}
        ref={this.graphRef}
        backgroundColor={"#ffffff"}
        linkWidth={2.5}
        linkCurvature={d => d.curvature}
        linkCurveRotation={d => d.rotation}
        linkDirectionalArrowLength={10}
        linkDirectionalArrowRelPos={1}
        linkColor={link => link.pathHash === selectedPath ? `${selectedPath}-${selectedHop}` === link.id ? "#21bda8" : "#bd1d4f" : "#484848"}
        linkDirectionalParticles={link => link.pathHash === selectedPath ? 3 : 0}
        linkDirectionalParticleWidth={4}
        linkDirectionalParticleSpeed={d => d.velocity}
        nodeLabel={n => n.label}
        linkLabel={l => this.getLinkLabel(l.id)}
        showNavInfo={false}
        onLinkClick={link => this.handleHopPressed(link)}
        nodeThreeObject={({shape, color}) => new Mesh(
          shapes[shape],
          new MeshBasicMaterial({color})
        )}
      />
    )
  }

}

export default ForceDirectedGraph;
