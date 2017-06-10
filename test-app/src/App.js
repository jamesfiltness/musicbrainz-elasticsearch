import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      data: {},
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const postData = JSON.stringify({
      "query": {
        "function_score": {
          "query": {"match_phrase": {"name": e.target.value}},
          "script_score": {
            "script": "_score * Math.log(doc['views'].value + 1)"
          },
        },
      },
      "size": 3
    });

    fetch('http://localhost:9200/artists/_search', {
      method: "POST",
      body: postData
    })
      .then((response) => {
        console.log(response.json());
        this.setState({ data: response });
      })
      .catch((e) => {
        console.log('Error: ', e);
      })
  }

  render() {
    return (
      <div className="App">
        <input onChange={this.handleChange} />
      </div>
    );
  }
}

export default App;
