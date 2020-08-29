import moment from "moment";

function preparePathData(paths, selectedPath, pathInfo) {
  let data = {
    labels: [],
    datasets: [{
      label: 'Hops',
      backgroundColor: 'rgba(72,72,72,0.5)',
      borderColor: 'rgba(72,72,72,1)',
      borderWidth: 1,
      outlierColor: '#ff2b71',
      padding: 10,
      itemRadius: 0,
      data: []
    }],
    pathInfo: null
  };

  if (!selectedPath) {
    return data
  }

  paths = paths.filter((path) => path["_source"]["route-sha1"] === selectedPath);
  if (pathInfo.filterWrongMeasurements) {
    paths = this.filterWrongMeasurements(paths)
  }

  if (!paths.length) {
    return data
  }

  const ttlsRtts = paths.map(path => {
    const ttls = path["_source"]["ttls"];
    const rtts = path["_source"]["rtts"];
    return ttls.map((element, idx) => [element, rtts[idx]])
  });

  const xCoords = [];
  ttlsRtts[0].forEach(e => xCoords.push(e[0]));

  let rtts = [];
  ttlsRtts.forEach(rttsValues => {
    rtts.push(rttsValues.map(values => values[1]))
  });

  const rttsByTtls = rtts[0].map((col, i) => rtts.map(row => row[i]));

  data.labels = xCoords;
  data.datasets[0].data = rttsByTtls;
  data.pathInfo = paths[0];

  return data
}

function DispatchUrl(urlSearchParams) {
  const urlParams = new URLSearchParams(urlSearchParams);
  const urlData = JSON.parse(urlParams.get("query"));
  const esQuery = urlData.es_query;
  const mustConditions = esQuery.query.bool.must;

  const query = {
    datetimeFrom: moment.unix(urlParams.get("datetimeFrom")/1000),
    datetimeTo: moment.unix(urlParams.get("datetimeTo")/1000),
    sources: [],
    sources_hosts: [],
    destinations: [],
    destinations_hosts: [],
    virtual_organisations: [], // not here yet
    IPv6: false
  };

  for (let i = 0; i < mustConditions.length; i++) {
    const condition = mustConditions[i];
    if ("range" in condition) {
      query.datetimeFrom = moment.unix(condition.range.timestamp.gte/1000);
      query.datetimeTo = moment.unix(condition.range.timestamp.lte/1000);
    } else {
      if ("term" in condition) {
        query.IPv6 = condition.term.ipv6
      } else {
        for (let j = 0; j < condition.bool.should.length; j++) {
          const conditionTerms = condition.bool.should[j].terms;
          if ("src" in conditionTerms) {
            query.sources = conditionTerms.src
          }
          if ("src_host" in conditionTerms) {
            query.sources_hosts = conditionTerms.src_host
          }
          if ("dest" in conditionTerms) {
            query.destinations = conditionTerms.dest
          }
          if ("dest_host" in conditionTerms) {
            query.destinations_hosts = conditionTerms.dest_host
          }
        }
      }
    }
  }

  return query
}

/**
 * @return {string}
 */
function PackUrl(query) {

  const srcShould = [];
  if (query.sources.length) {
    srcShould.push({
      terms: {
        src: query.sources
      }
    })
  }

  if (query.sources_hosts.length) {
    srcShould.push({
      terms: {
        src_host: query.sources_hosts
      }
    })
  }

  const destShould = [];
  if (query.destinations.length) {
    destShould.push({
      terms: {
        dest: query.destinations
      }
    })
  }

  if (query.destinations_hosts.length) {
    destShould.push({
      terms: {
        dest_host: query.destinations_hosts
      }
    })
  }

  const newQuery = {
    es_query: {
      query: {
        bool: {
          must: [
            {
              range: {
                timestamp: {
                  gte: moment.unix(query.datetimeFrom)/1000,
                  lte: moment.unix(query.datetimeTo)/1000,
                }
              }
            },
            {
              term: {
                ipv6: query.IPv6
              }
            },
            {
              bool: {
                should: srcShould
              }
            },
            {
              bool: {
                should: destShould
              }
            }
          ]
        }
      }
    },
    parameters: {}
  };

  return `?query=${JSON.stringify(newQuery)}`;
}

function ReformAggregations(aggregations) {
  const reformedItems = {}

  Object.keys(aggregations).forEach(item => {
    reformedItems[item] = [];
    aggregations[item]["buckets"].forEach(i => {
      reformedItems[item].push({
        "name": i.key,
        "count": 0
      })
    })
  })

  return reformedItems
}

export const reformAggregations = (aggregations) => {
  return ReformAggregations(aggregations)
};

export const dispatchUrl = (url) => {
  return DispatchUrl(url)
};

export const packUrl = (query) => {
  return PackUrl(query)
};

export default preparePathData