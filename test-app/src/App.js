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
          "query": {"regexp": {"name": e.target.value + ".+" }},
          "script_score": {
            "script": "_score * Math.log(doc['views'].value + 1)"
          }
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
        // this.setState({ data: response });
      })
      .then((data) => {
        this.setState({ data: data.hits.hits });
      })
      .catch((e) => {
        console.log('Error: ', e);
      })
  }

  render() {
    return (
      <div className="App">
        <input onChange={this.handleChange} />
        {this.state.data.map((item, i) =>
        <li key={i}>{item['_source'].name}</li>
        )}
      </div>
    );
  }
}

export default App;
