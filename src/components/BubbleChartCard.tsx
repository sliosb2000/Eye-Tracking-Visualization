import { Slider, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem } from "@mui/material";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BubbleDataPoint,
  ChartData,
} from 'chart.js';
import React from "react";
import { Bubble } from "react-chartjs-2";
import { VizualizationType, FXD, DataFiles, DataType, participants } from "../Data";

interface Props {
  height?: string,
  width?: string;
  margin?: string;
}

interface State {
  sliderValueMax: number;
  sliderValueMin: number;
  sliderValueRange: number[];
  data: ChartData<"bubble">;
  selectedParticipantId: string;
  durationMultiplier: number;
}

class BubbleChartCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

    const data = this.getBubbleChartData("p1", VizualizationType.GRAPH);
    this.state = {
      data: data.data,
      sliderValueMin: data.min,
      sliderValueMax: data.max,
      sliderValueRange: [data.min, data.max],
      selectedParticipantId: "p1",
      durationMultiplier: data.durationMultiplier,
    }
  }

  private getBubbleChartData(participantId: string, vizualizationType: VizualizationType, min?: number, max?: number) {
    let participantData: FXD[] = DataFiles.get(participantId)!.get(vizualizationType)!.get(DataType.FXD)! as FXD[];
    if (min && max) {
      participantData = participantData.filter(data => {
        return data.time > min && data.time < max;
      });
    }
    const durationMap = participantData.map(a => { return a.duration });
    const minDuration = Math.min(...durationMap);
    const maxDuration = Math.max(...durationMap);
    const durationMultiplier = 1/(maxDuration-minDuration)*25
    const chartData: BubbleDataPoint[] = participantData.map(row => {
      const dataPoint: BubbleDataPoint = {
        x: row.x,
        y: row.y,
        r: row.duration*durationMultiplier,
      }
      return dataPoint;
    });

    const data: ChartData<"bubble"> = {
      datasets: [{
        label: participantId,
        data: chartData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }],
    };

    return {
      data: data,
      min: Math.min(...participantData.map(o => o.time)),
      max: Math.max(...participantData.map(o => o.time)),
      durationMultiplier: durationMultiplier,
    }
  }

  render() {
    const that = this;
    const options = {
      plugins: {
        tooltip: {
          callbacks: {
            title: function(context: any) {
              return context[0].label;
            },
            label: function(context: any) {
              const x = context.raw.x;
              const y = context.raw.y;
              return `(x, y): (${x}, ${y})`;
            },
            afterLabel: function(context: any) {
              const duration = context.raw.r;
              return `duration: ${Math.round(duration*1/that.state.durationMultiplier)}`;
            }
          }
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <div className="bubbleChart" style={{
        width: this.props.width ?? "100%",
        height: this.props.height ?? "100%",
        margin: this.props.margin ?? "0 auto",
      }}>
          <h1>Bubble Chart</h1>
          <Bubble options={options} data={this.state.data} />
          
          <div className="menu">
            <Slider
              getAriaLabel={() => 'Time Range'}
              value={this.state.sliderValueRange}
              min={this.state.sliderValueMin}
              max={this.state.sliderValueMax}
              onChange={(event: Event, newValue: number | number[]) =>{
                const data = this.getBubbleChartData(this.state.selectedParticipantId, VizualizationType.GRAPH, (newValue as number[])[0],  (newValue as number[])[1]);
                this.setState({
                  data: data.data,
                  sliderValueRange: newValue as number[],
                  durationMultiplier: data.durationMultiplier,
                });
              }}
              valueLabelDisplay="auto"
            />

            <div>
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
                    const data = this.getBubbleChartData(this.state.selectedParticipantId, VizualizationType.GRAPH);
                    this.setState({
                      data: data.data,
                      selectedParticipantId: value,
                      durationMultiplier: data.durationMultiplier,
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
            </div>
          </div>
        </div>  
    );
  }
}

export default BubbleChartCard;