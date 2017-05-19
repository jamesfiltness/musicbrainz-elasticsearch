# Musicbrainz Elasticsearch

Musicbrainz Postgresql (VM) -> Logstash ([jdbc](https://www.elastic.co/blog/logstash-jdbc-input-plugin)) -> Elasticsearch.

Autocomplete search results will be returned ranked by a combination of textual relevance and popularity:

```
curl -XPOST http://localhost:9200/artists/_search -d '
{
  "query": {
    "function_score": {
      "query": {"match": {"_all": "Soundgarden"}},
      "script_score": {
        "script": "_score * log(doc['views'].value + 1)"
      }
    }
  }
}'
```

## Notes

#### Run Logstash

cd to logstash and run:

`bin/logstash -f jdbc/musicbrainz.conf`

#### Create an Elasticsearch index:

`curl -XPUT 'localhost:9200/index-name?pretty`

or specify custom shards/replicas config:

```
curl -XPUT 'localhost:9200/some-index?pretty' -H 'Content-Type: application/json' -d'
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
` curl http://localhost:9200/index-name/_search?size=100&pretty`

#### Get a record:
`curl http://localhost:9200/index-name/type-name/some-id?pretty`

#### Get a mapping:
`curl http://localhost:9200/index-name/_mapping/type-name?pretty`

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

#### Update some fields value (field properties live in the _source object by default)
```
http://localhost:9200/index-name/type-name/some-id/_update
{
   "script" : "ctx._source.some-integer-field+=1"
}
```
