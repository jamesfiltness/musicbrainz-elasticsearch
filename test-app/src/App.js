import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const postData = JSON.stringify({
     "query": {
        "function_score": {
          "query": {
            "match_phrase": {
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
        this.setState({ data: data.hits.hits });
      })
      .catch((e) => {
        console.log('Error: ', e);
      })
  }

  render() {
    console.log(this.state.data);
    return (
      <div className="App">
        <input onChange={this.handleChange} />
        {
          this.state.data.map((item, i) => {
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
      </div>
    );
  }
}

export default App;
