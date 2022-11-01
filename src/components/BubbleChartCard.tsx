import { PlayArrowRounded } from "@mui/icons-material";
import { Slider, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, ToggleButton } from "@mui/material";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BubbleDataPoint,
  ChartData,
} from 'chart.js';
import { HumanizeDuration, HumanizeDurationLanguage } from "humanize-duration-ts";
import React from "react";
import { Bubble } from "react-chartjs-2";
import { VisualizationType , FXD, DataFiles, DataType, participants } from "../Data";

const DEFAULT_DATA = {
  participantId: "p1",
  visualizationType: VisualizationType.GRAPH,
  timeSliderMinValue: 0,
  opacitySliderValue: 0.3,
}

interface Props {
  height?: string,
  width?: string;
  margin?: string;
}

interface State {
  data: ChartData<"bubble">;
  selectedParticipantId: string;
  selectedVizualizationType: VisualizationType;
  durationMultiplier: number;

  timeSliderMin: number;
  timeSliderMax: number;
  timeSliderRange: number[];

  opacitySliderValue: number;

  buttonSelectedState: boolean;
}

//TODO: slider/input field opacity for bubble
//TODO: slider scale for bubble radius

class BubbleChartCard extends React.Component<Props, State> {

  private humanizer: HumanizeDuration = new HumanizeDuration(new HumanizeDurationLanguage());
  private playInterval?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);

    ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

    this.humanizer.addLanguage("shortEn", {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
      decimal: ".",
    });
    this.humanizer.setOptions({
      language: "shortEn",
      spacer: "",
      units: ["m", "s", "ms"],
    });
    
    const data = this.getBubbleChartData(DEFAULT_DATA.participantId, DEFAULT_DATA.visualizationType);
    this.state = {
      data: data.data,
      selectedParticipantId: DEFAULT_DATA.participantId,
      selectedVizualizationType: DEFAULT_DATA.visualizationType,
      durationMultiplier: data.durationMultiplier,

      timeSliderMin: DEFAULT_DATA.timeSliderMinValue,
      timeSliderMax: data.max,
      timeSliderRange: [DEFAULT_DATA.timeSliderMinValue, data.max],

      opacitySliderValue: DEFAULT_DATA.opacitySliderValue,
      
      buttonSelectedState: false,
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
    }
  }

  private getBubbleChartData(participantId: string, vizualizationType: VisualizationType, min?: number, max?: number) {
    let participantData: FXD[] = DataFiles.get(participantId)!.get(vizualizationType as VisualizationType)!.get(DataType.FXD)! as FXD[];
    if (min !== undefined && max !== undefined) {
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
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
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
              return `(x, y): (${x}px, ${y}px)`;
            },
            afterLabel: function(context: any) {
              const duration = context.raw.r;
              return `duration: ${Math.round(duration*1/that.state.durationMultiplier)}ms`;
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
            <div className="slider" style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}>
              <div style={{
                width: "10px",
              }} />
              <Slider
                style={{
                  width: "95%"
                }}
                getAriaLabel={() => 'Time Range'}
                value={this.state.timeSliderRange}
                min={this.state.timeSliderMin}
                max={this.state.timeSliderMax}
                step={1000}
                onChange={(event: Event, newValue: number | number[]) =>{
                  const data = this.getBubbleChartData(this.state.selectedParticipantId, this.state.selectedVizualizationType, (newValue as number[])[0],  (newValue as number[])[1]);
                  this.setState({
                    data: data.data,
                    timeSliderRange: newValue as number[],
                    durationMultiplier: data.durationMultiplier,
                  });
                }}
                valueLabelFormat={(value) => {
                  return `${this.humanizer.humanize(value).replaceAll(",", "")}`;
                }}
                valueLabelDisplay="auto"
              />
              <div style={{
                width: "20px",
              }} />
              <ToggleButton
                value="check"
                selected={this.state.buttonSelectedState}
                onChange={() =>{
                  if (!this.state.buttonSelectedState) {
                    this.playInterval = setInterval(() => {
                      if (this.state.timeSliderRange[1] >= this.state.timeSliderMax) {
                        if (this.playInterval) {
                          clearInterval(this.playInterval);
                          this.setState({
                            buttonSelectedState: false,
                          });
                          return;
                        }
                      }
                      const data = this.getBubbleChartData(this.state.selectedParticipantId, this.state.selectedVizualizationType, this.state.timeSliderRange[0], this.state.timeSliderRange[1]);
                      this.setState({
                        data: data.data,
                        timeSliderRange: [this.state.timeSliderRange[0], this.state.timeSliderRange[1] + 1000],
                        durationMultiplier: data.durationMultiplier,
                      });
                    }, 1000);
                  } else {
                    if (this.playInterval) {
                      clearInterval(this.playInterval);
                      this.setState({
                        buttonSelectedState: false,
                      });
                    }
                  }

                  this.setState({
                    buttonSelectedState: !this.state.buttonSelectedState,
                  });
                }}
              >
                <PlayArrowRounded />
              </ToggleButton>
            </div>

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
                    const data = this.getBubbleChartData(value, this.state.selectedVizualizationType);
                    this.setState({
                      data: data.data,
                      selectedParticipantId: value,
                      timeSliderMin: 0,
                      timeSliderMax: data.max,
                      timeSliderRange: [0, data.max],
                      durationMultiplier: data.durationMultiplier,
                      buttonSelectedState: false,
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
                  value={this.state.selectedVizualizationType}
                  onChange={(event: SelectChangeEvent) => {
                    const {
                      target: { value },
                    } = event;
                    const data = this.getBubbleChartData(this.state.selectedParticipantId, value as VisualizationType);
                    this.setState({
                      data: data.data,
                      selectedVizualizationType: value as VisualizationType,
                      timeSliderMin: 0,
                      timeSliderMax: data.max,
                      timeSliderRange: [0, data.max],
                      durationMultiplier: data.durationMultiplier,
                      buttonSelectedState: false,
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
          </div>
        </div>  
    );
  }
}
export default BubbleChartCard;