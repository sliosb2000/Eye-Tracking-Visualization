import { Box, Divider } from '@mui/material';
import React from 'react';
import BubbleChartCard from './components/BubbleChartCard';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h1
          style={{
            padding: "10px",
            textAlign: "center",
            color: "white",
            fontSize: "30px",
            backgroundColor: "#2576ce",
          }}
        >Eye Gaze Data Visualization</h1>

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>

        <BubbleChartCard
          width="70%"
        />

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>
      </div>
    );
  }
}

export default App;