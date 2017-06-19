import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      artistData: [],
      releaseData: [],
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const postData = JSON.stringify({
     "query": {
        "function_score": {
          "query": {
            "match_phrase_prefix": {
              "name": {
                "query": e.target.value,
                "analyzer": "standard"
              }
            }
          },
          "script_score": {
            "script": "_score * Math.log(doc['views'].value + 1)"
          },
        }
     },
     "size": 3,
    });

    fetch('http://localhost:9200/artists/_search', {
      method: "POST",
      body: postData
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({ artistData: data.hits.hits });
      })
      .catch((e) => {
        console.log('Error: ', e);
      })


    fetch('http://localhost:9200/releases/_search', {
      method: "POST",
      body: postData
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({ releaseData: data.hits.hits });
      })
      .catch((e) => {
        console.log('Error: ', e);
      })
  }

  render() {
    console.log('artists', this.state.artistData);
    console.log('releases', this.state.releaseData);
    return (
      <div className="App">
        <input onChange={this.handleChange} />
        <ul>
          {
            this.state.artistData.map((item, i) => {
              if(item['_score'] > 0) {
              const link = `http://localhost:8900/artist/${item['_source'].gid}`;
                return (
                <li key={i}>
                  <a target="_blank" href={link}>
                    {item['_source'].name}</a></li>
                );
                }
                return null
            })
            }
          </ul>

          <ul>
            {
              this.state.releaseData.map((item, i) => {
                if(item['_score'] > 0) {
                const link = `http://localhost:8900/album/${item['_source'].gid}`;
                  return (
                  <li key={i}>
                    <a target="_blank" href={link}>
                      {item['_source'].name}</a></li>
                  );
                  }
                  return null
              })
              }
          </ul>
      </div>
    );
  }
}

export default App;
