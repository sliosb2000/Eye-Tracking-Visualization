import { PlayArrowRounded } from "@mui/icons-material";
import { Slider, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, ToggleButton, Box, Typography, Grid, Input } from "@mui/material";
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
import InputSlider from "./InputSlider";

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

  timeMin: number;
  timeMax: number;
  timeRange: number[];

  opacity: number;

  playback: boolean;
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

      timeMin: DEFAULT_DATA.timeSliderMinValue,
      timeMax: data.max,
      timeRange: [DEFAULT_DATA.timeSliderMinValue, data.max],

      opacity: DEFAULT_DATA.opacitySliderValue,
      
      playback: false,
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
    }
  }

  private getBubbleChartData(participantId: string, vizualizationType: VisualizationType, min?: number, max?: number, opacity?: number) {
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
        backgroundColor: `rgba(255, 99, 132, ${opacity ?? DEFAULT_DATA.opacitySliderValue})`,
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
          <h2>Chart Controls</h2>
          <div className="menu">
            <div className="slider">
              <Box sx={{ width: "100%" }}>
                <h3>Time Range</h3>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs>
                    <Slider
                      getAriaLabel={() => 'Time Range'}
                      value={this.state.timeRange}
                      min={this.state.timeMin}
                      max={this.state.timeMax}
                      step={1000}
                      onChange={(event: Event, newValue: number | number[]) =>{
                        const data = this.getBubbleChartData(this.state.selectedParticipantId, this.state.selectedVizualizationType, (newValue as number[])[0],  (newValue as number[])[1]);
                        this.setState({
                          data: data.data,
                          timeRange: newValue as number[],
                          durationMultiplier: data.durationMultiplier,
                        });
                      }}
                      valueLabelFormat={(value) => {
                        return `${this.humanizer.humanize(value).replaceAll(",", "")}`;
                      }}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item>
                    <ToggleButton
                      value="check"
                      selected={this.state.playback}
                      onChange={() =>{
                        if (!this.state.playback) {
                          this.playInterval = setInterval(() => {
                            if (this.state.timeRange[1] >= this.state.timeMax) {
                              if (this.playInterval) {
                                clearInterval(this.playInterval);
                                this.setState({
                                  playback: false,
                                });
                                return;
                              }
                            }
                            const data = this.getBubbleChartData(this.state.selectedParticipantId, this.state.selectedVizualizationType, this.state.timeRange[0], this.state.timeRange[1]);
                            this.setState({
                              data: data.data,
                              timeRange: [this.state.timeRange[0], this.state.timeRange[1] + 1000],
                              durationMultiplier: data.durationMultiplier,
                            });
                          }, 1000);
                        } else {
                          if (this.playInterval) {
                            clearInterval(this.playInterval);
                            this.setState({
                              playback: false,
                            });
                          }
                        }

                        this.setState({
                          playback: !this.state.playback,
                        });
                      }}
                    >
                      <PlayArrowRounded />
                    </ToggleButton>
                  </Grid>
                </Grid>
              </Box>
              <InputSlider
                width={"50%"}
                label={"Opacity"}
                min={0}
                max={1}
                step={0.01}
                value={this.state.opacity}
                onSliderChange={(event: Event, newValue: number | number[]) =>{
                  const data = this.getBubbleChartData(this.state.selectedParticipantId, this.state.selectedVizualizationType, this.state.timeRange[0], this.state.timeRange[1], newValue as number);
                  this.setState({
                    data: data.data,
                    opacity: newValue as number,
                  });
                }}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const newValue = event.target.value === '' ? 0 : Number(event.target.value);
                  const data = this.getBubbleChartData(this.state.selectedParticipantId, this.state.selectedVizualizationType, this.state.timeRange[0], this.state.timeRange[1], newValue);
                  this.setState({
                    data: data.data,
                    opacity: newValue,
                  });
                }}
              />
            </div>

            <h2>Data Selection</h2>
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
                      timeMin: 0,
                      timeMax: data.max,
                      timeRange: [0, data.max],
                      durationMultiplier: data.durationMultiplier,
                      playback: false,
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
                      timeMin: 0,
                      timeMax: data.max,
                      timeRange: [0, data.max],
                      durationMultiplier: data.durationMultiplier,
                      playback: false,
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