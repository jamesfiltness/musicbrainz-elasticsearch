# Musicbrainz Elasticsearch

An autocomplete built using Elasticsearch, powered by data from [Musicbrainz](http://musicbrainz.org/).

Musicbrainz Postgresql (VM) -> Logstash ([jdbc](https://www.elastic.co/blog/logstash-jdbc-input-plugin)) -> Elasticsearch.

The data is indexed using a custom Autocomplete analyzer:

1. Set up the analyzer
```
curl -XPUT 'localhost:9200/artists?pretty' -d '
{
    "settings": {
        "number_of_shards": 1,
        "analysis": {
            "filter": {
                "autocomplete_filter": {
                    "type":     "edge_ngram",
                    "min_gram": 1,
                    "max_gram": 20
                }
            },
            "analyzer": {
                "autocomplete": {
                    "type":      "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "autocomplete_filter"
                    ]
                }
            }
        }
    }
}
'
```

2. Alter the index mapping to use the analyzer:

```
curl -XPUT 'localhost:9200/artists/_mapping/artist' -d '
{
    "artist": {
        "properties": {
            "name": {
                "type":     "string",
                "analyzer": "autocomplete",
                "search_analyzer": "standard"
            }
        }
    }
}
'
```

https://www.elastic.co/guide/en/elasticsearch/guide/current/_index_time_search_as_you_type.html

Autocomplete search results will be returned ranked by a combination of textual relevance and popularity:

```
curl -XPOST 'http://localhost:9200/artists/_search' -d '
{
  "query": {
    "function_score": {
      "query": {
        "match": {
          "name": {
            "query": e.target.value, 
            "analyzer": "standard" 
          }
        }
      },
      "script_score": {
        "script": "_score * Math.log(doc['views'].value + 1)"
      }
    }
  }
}
'
```

## Notes

#### Start Elasticsearch

cd to Elasticsearch and run: 

`./bin/elasticsearch`

#### Run Logstash

cd to logstash and run:

`bin/logstash -f jdbc/musicbrainz.conf`

#### Create an Elasticsearch index:

`curl -XPUT 'localhost:9200/index-name?pretty'`

or specify custom shards/replicas config:

```
curl -XPUT 'localhost:9200/some-index?pretty' -d '
{
    "settings" : {
        "index" : {
            "number_of_shards" : 5,
            "number_of_replicas" : 2
        }
    }
}
'
```

#### Delete an index:
`curl -XDELETE 'localhost:9200/index-name?pretty'`

#### List the first 100 records from an index:
` curl 'http://localhost:9200/index-name/_search?size=100&pretty'`

#### Count all documents in index:
`curl 'http://localhost:9200/artists/_count'`

#### Get a record:
`curl 'http://localhost:9200/index-name/type-name/some-id?pretty'`

#### Get a mapping:
`curl 'http://localhost:9200/index-name/_mapping/type-name?pretty'`

#### Put a mapping:
```
curl -XPUT 'http://localhost:9200/artists/artist/_mapping' -d '
{
    “{
        "properties" : {
            “some-field” : {"type" : “integer”}
        }
    }
}
'
```

#### Add some fields to add index:
```
curl -XPUT 'http://localhost:9200/artists/artist/6fd9967d-5836-475f-9936-8914fa72a82f' -d '
{
  "gid": "6fd9967d-5836-475f-9936-8914fa72a82f",
  "name": "Elliot Smith",
  "views": 1
}
'
```

#### Update some fields value (field properties live in the _source object by default)
```
curl -XPOST 'http://localhost:9200/artists/artist/a74b1b7f-71a5-4011-9441-d0b5e4122711/_update' -d '
{
   "script" : "ctx._source.views+=1"
}
'
```
