import json
import os
import sys
import numpy as np
import requests

from collections import defaultdict
from django.views import View
from django.http import JsonResponse
from elasticsearch import Elasticsearch

from Tracer.settings import ES_HOSTS, ES_USER, ES_PASSWORD, ES_INDEX, DEBUG


def track_error(func):
    def wrapped(*args, **kwargs):
        data = {
            "status": True,
            "message": "Everything is fine!"
        }

        try:
            data.update(func(*args, **kwargs))
        except Exception as error:
            if DEBUG:
                exc_type, exc_obj, exc_tb = sys.exc_info()
                file_name = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                message = {
                    "error": str(error),
                    "type": str(exc_type),
                    "filename": str(file_name),
                    "line_number": exc_tb.tb_lineno
                }
            else:
                message = {
                    "error": "Something went wrong on server side, your request failed!",
                    "type": "",
                    "filename": "",
                    "line_number": 0
                }

            data = {
                "status": False,
                "message": message
            }

        return data

    return wrapped


def fix_elastic_index(es_data):
    for hit in es_data['hits']['hits']:
        try:
            # sorting rtts by ttls
            hit = hit["_source"]

            hit['hops'], hit['ttls'], hit['rtts'], hit['asns']\
                = list(zip(*sorted(zip(hit['hops'], hit['ttls'], hit['rtts'], hit['asns']), key=lambda x: x[1])))

            # recalculating rtts
            new_rtts = []
            previous_rtt = 0
            for rtt in hit['rtts']:
                new_rtts.append(round(rtt - previous_rtt, 3))
                previous_rtt = rtt

            hit['rtts'] = new_rtts
        except ValueError:
            # for this case: 'hops': [], 'asns': [], 'rtts': [], 'ttls': [],
            pass


def calculate_stats(es_data):
    grouped_rtts = defaultdict(list)
    grouped_ttls = defaultdict(list)
    for hit in es_data['hits']['hits']:
        try:
            record = hit['_source']
            grouped_rtts[record['route-sha1']].append(record['rtts'])
            grouped_ttls[record['route-sha1']] = record['ttls']
        except KeyError:
            # when there is no 'route-sha1'
            pass

    stats = defaultdict(dict)
    for key in grouped_rtts:
        ttls = grouped_ttls[key]
        for i, rtts in enumerate(zip(*grouped_rtts[key])):
            item = {
                "median": np.nanmedian(rtts),
                "stdDev": np.nanstd(rtts),
                "min": np.nanmin(rtts),
                "max": np.nanmax(rtts),
                "q1": np.percentile(rtts, 25),
                "q3": np.percentile(rtts, 75)
            }

            stats[f"{key}-{ttls[i]}"] = {k: round(item[k], 3) for k in item}

    return stats


class QueryES(View):
    if ES_USER and ES_PASSWORD:
        es_connection = Elasticsearch(hosts=ES_HOSTS, http_auth=(ES_USER, ES_PASSWORD))
    else:
        es_connection = Elasticsearch(hosts=ES_HOSTS)

    def get(self, request):
        query = self.prepare_query(request)
        if query["status"]:
            es_data = self.get_from_es(query=query["body"])
            if es_data["status"]:
                data = self.process_gotten_data(es_data=es_data["es_data"])
            else:
                data = es_data
        else:
            data = query

        return JsonResponse(data)

    @track_error
    def prepare_query(self, request):
        data = {}

        raw_query = request.GET.get("query")
        if not raw_query:
            query = self.init_query()["query"]
        else:
            query = json.loads(raw_query)["es_query"]
            query["size"] = 10000

        query["sort"] = {
            "timestamp": "desc"
        }

        query["aggs"] = {
            "sources": {
                "terms": {
                    "field": "src",
                    "size": 10000
                }
            },
            "sources_hosts": {
                "terms": {
                    "field": "src_host",
                    "size": 10000
                }
            },
            "destinations": {
                "terms": {
                    "field": "dest",
                    "size": 10000
                }
            },
            "destinations_hosts": {
                "terms": {
                    "field": "dest_host",
                    "size": 10000
                }
            }
        }

        data["body"] = query

        return data

    def init_query(self):
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"ipv6": False}}
                    ]
                }
            },
            "size": 25,
            "sort": {
                "timestamp": "desc"
            }
        }

        es_data = self.es_connection.search(index=ES_INDEX, body=query)
        timestamps = [hit["_source"]["timestamp"] for hit in es_data["hits"]["hits"]]
        query["query"]["bool"]["must"].append({
            "range": {
                "timestamp": {
                    "gte": timestamps[1],
                    "lte": timestamps[0]
                }
            }
        })

        return query

    @track_error
    def get_from_es(self, query):
        data = {}

        es_data = self.es_connection.search(index=ES_INDEX, body=query)
        data["es_data"] = es_data

        fix_elastic_index(data["es_data"])

        return data

    @track_error
    def process_gotten_data(self, es_data):

        number_of_paths = len(set([hit["_source"]["route-sha1"] for hit in es_data["hits"]["hits"] if hit["_source"]
                                  .get("route-sha1")]))

        data = {
            "es_data": es_data,
            "stats": calculate_stats(es_data),
            "datetime_range": [],
            "number_of_paths": number_of_paths
        }

        if number_of_paths:
            data["datetime_range"] = [
                es_data["hits"]["hits"][-1]["_source"]["timestamp"],
                es_data["hits"]["hits"][0]["_source"]["timestamp"]
            ]

        return data


class GetASN(View):
    url_template = "https://api.bgpview.io/asn/"

    def get(self, request, asn):
        data = self.parse_source(asn)

        return JsonResponse(data)

    @track_error
    def parse_source(self, asn):
        data = {
            "status": True,
            "message": "Success"
        }

        url = f"{self.url_template}{asn}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json().get("data", None)
            if data:
                data["item"] = {
                    "Name": data.get("name"),
                    "Description": data.get("description_short"),
                    "Website": data.get("website"),
                    "Country": data.get("country_code"),
                    "E-mail contracts": ", ".join(data.get("email_contracts")) if data.get("email_contracts") else None,
                    "Abuse contracts": ", ".join(data.get("abuse_contracts")) if data.get("abuse_contracts") else None,
                    "Traffic estimation": data.get("traffic_estimation"),
                    "Traffic ratio": data.get("traffic_ratio"),
                    "Owner address": ", ".join(data.get("owner_address")) if data.get("owner_address") else None
                }

            else:
                data["status"] = False
                data["message"] = f"Response didn't returned data."

        else:
            data["status"] = False
            data["message"] = f"Response status code {response.status_code} - service is not available."

        return data
