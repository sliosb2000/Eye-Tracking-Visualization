import { Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React from 'react';
import BubbleChartCard from './components/ChartCard';
import { participants, VisualizationType } from './data/Data';

const DEFAULT_DATA = {
  participantId: "p1",
  visualizationType: VisualizationType.GRAPH,
  timeMin: 0,
  opacity: 0.3,
}

interface Props {

}

interface State {
  participantId: string;
  visualizationType: VisualizationType;
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      participantId: DEFAULT_DATA.participantId,
      visualizationType: DEFAULT_DATA.visualizationType,
    }
  }

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

        <div
          style={{
            marginLeft: "15%",
            width: "70%",
          }}
        >
          <h1>Data Selection</h1>
          <div className="selection">
            <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="participant-ids-label">Participant</InputLabel>
              <Select
                labelId="participant-ids-label"
                id="participant-ids"
                value={this.state.participantId}
                onChange={(event: SelectChangeEvent) => {
                  const {
                    target: { value },
                  } = event;
                  this.setState({
                    participantId: value,
                  });
                }}
              >
                {participants.map((id) => (
                  <MenuItem
                    key={id}
                    value={id}
                  >
                    {id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 150 }}>
              <InputLabel id="visualization-types-label">Visualization Type</InputLabel>
              <Select
                labelId="visualization-types-label"
                id="visualization-types"
                value={this.state.visualizationType}
                onChange={(event: SelectChangeEvent) => {
                  const {
                    target: { value },
                  } = event;
                  this.setState({
                    visualizationType: value as VisualizationType,
                  });
                }}
              >
                {Object.values(VisualizationType).map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <BubbleChartCard
            participantId={this.state.participantId}
            visualizationType={this.state.visualizationType}
            width="100%"
          />
        </div>

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>
      </div>
    );
  }
}

export default App;