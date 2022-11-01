import { Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React from 'react';
import BubbleChartCard from './components/BubbleChartCard';
import DoughnutChartCard from './components/DoughnutChartCard';
import { participants, VisualizationType } from './Data';
const DEFAULT_DATA = {
  participantId: "p1",
  visualizationType: VisualizationType.GRAPH
}
interface Props{

}
interface State{
  selectedParticipantId: string;
  selectedVisualizationType: VisualizationType;
}
class App extends React.Component<Props,State> {
  constructor(props: Props){
    super(props);
    this.state ={
      selectedParticipantId: DEFAULT_DATA.participantId,
      selectedVisualizationType: DEFAULT_DATA.visualizationType,

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
        <div className="selection">
              <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="participant-ids-label">Participant</InputLabel>
                <Select
                  labelId="participant-ids-label"
                  id="participant-ids"
                  value={this.state.selectedParticipantId}
                  onChange={(event: SelectChangeEvent) => {
                    const {
                      target: { value },
                    } = event;
                   console.log(value);
                    this.setState({
                      selectedParticipantId: value,
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
                <InputLabel id="vizualization-types-label">Vizualization Type</InputLabel>
                <Select
                  labelId="vizualization-types-label"
                  id="vizualization-types"
                  value={this.state.selectedVisualizationType}
                  onChange={(event: SelectChangeEvent) => {
                    const {
                      target: { value },
                    } = event;
                    this.setState({
                      selectedVisualizationType: value as VisualizationType,
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
          selectedParticipantId = {this.state.selectedParticipantId} 
          selectedVizualizationType = {this.state.selectedVisualizationType}
          width="70%"
        />
        <DoughnutChartCard
          width="70%"
        />

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>
      </div>
    );
  }
}

export default App;