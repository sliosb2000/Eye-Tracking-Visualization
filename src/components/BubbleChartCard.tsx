import { PlayArrowRounded } from "@mui/icons-material";
import { Slider, ToggleButton, Box,  Grid, Divider } from "@mui/material";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BubbleDataPoint,
  ChartData,
  ChartOptions,
  TooltipItem,
  Tick,
} from 'chart.js';
import { HumanizeDuration, HumanizeDurationLanguage } from "humanize-duration-ts";
import React from "react";
import { Bubble } from "react-chartjs-2";
import { VisualizationType, DataFiles, DataType } from "../data/Data";
import { EVD } from "../data/types/raw/EVD";
import { FXD } from "../data/types/raw/FXD";
import InputSlider from "./InputSlider";
import MessageCard from "./ScrollableMessageCard";

const DEFAULT_DATA = {
  timeMin: 0,
  opacity: 0.3,
}

interface Props {
  height?: string,
  width?: string;
  margin?: string;
  participantId: string;
  visualizationType: VisualizationType;
}

interface State {
  data: ChartData<"bubble">;
  durationMultiplier: number;

  timeMin: number;
  timeMax: number;
  timeRange: number[];

  opacity: number;

  playback: boolean;

  events: EVD[];
}

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
    
    const data = this.getBubbleChartData(this.props.participantId, this.props.visualizationType);
    const EVDData = this.getEVDData(this.props.participantId, this.props.visualizationType, data.max);
    this.state = {
      data: data.data,
      durationMultiplier: data.durationMultiplier,

      timeMin: DEFAULT_DATA.timeMin,
      timeMax: data.max,
      timeRange: [DEFAULT_DATA.timeMin, data.max],

      opacity: DEFAULT_DATA.opacity,
      
      playback: false,

      events: EVDData,
    }
  }

  componentWillUnmount() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.participantId !== prevProps.participantId || this.props.visualizationType !== prevProps.visualizationType) {
      const data = this.getBubbleChartData(this.props.participantId, this.props.visualizationType, undefined, undefined ,this.state.opacity);
      this.setState({
        data: data.data,
        durationMultiplier: data.durationMultiplier,

        timeMin: DEFAULT_DATA.timeMin,
        timeMax: data.max,
        timeRange: [DEFAULT_DATA.timeMin, data.max],

        playback: false,
      });
    }

    const nextTimeRange = this.state.timeRange;
      if (nextTimeRange[1] !== prevState.timeRange[1]) {
        const participantEVDData = this.getEVDData(this.props.participantId, this.props.visualizationType, nextTimeRange[1]);
        
        this.setState({  
          events: participantEVDData,
        });
      }
  }

  private getEVDData(participantId: string, visualizationType: VisualizationType, time: number, amount?: number) {
    let participantEVDData = DataFiles.get(participantId)!.get(visualizationType)!.get(DataType.EVD)! as EVD[];
    participantEVDData = participantEVDData
      .filter(data => {
        return data.time <= time;
      });
    if (amount) {
      participantEVDData = participantEVDData.slice(-amount);
    }
  
    return participantEVDData;
  }

  private getBubbleChartData(participantId: string, visualizationType: VisualizationType, min?: number, max?: number, opacity?: number) {
    let participantFXDData = DataFiles.get(participantId)!.get(visualizationType as VisualizationType)!.get(DataType.FXD)! as FXD[];
    if (min !== undefined && max !== undefined) {
      participantFXDData = participantFXDData.filter(data => {
        return data.time > min && data.time < max;
      });
    }
    const durationMap = participantFXDData.map(a => { return a.duration });
    const minDuration = Math.min(...durationMap);
    const maxDuration = Math.max(...durationMap);
    const durationMultiplier = 1/(maxDuration-minDuration)*25;
    const chartData: BubbleDataPoint[] = participantFXDData.map(row => {
      const dataPoint: BubbleDataPoint = {
        x: row.x,
        y: row.y,
        r: row.duration*durationMultiplier,
      }
      return dataPoint;
    });
    const data: ChartData<"bubble"> = {
      datasets: [{
        label: DataType.FXD,
        data: chartData,
        backgroundColor: `rgba(255, 99, 132, ${opacity ?? DEFAULT_DATA.opacity})`,
      }],
    };

    return {
      data: data,
      min: Math.min(...participantFXDData.map(o => o.time)),
      max: Math.max(...participantFXDData.map(o => o.time)),
      durationMultiplier: durationMultiplier,
    }
  }

  private getHumanizedTimeFromMilliseconds(timeMs: number) {
    return this.humanizer.humanize(Math.floor(timeMs / 1000) * 1000).replaceAll(",", "");
  }
  
  render() {
    const that = this;
    const options: ChartOptions<"bubble"> = {
      plugins: {
        tooltip: {
          callbacks: {
            title: function(context: TooltipItem<"bubble">[]) {
              return context[0].label;
            },
            label: function(context: TooltipItem<"bubble">) {
              const rawData = context.raw as BubbleDataPoint;
              const x = rawData.x;
              const y = rawData.y;
              return `(x, y): (${x}px, ${y}px)`;
            },
            afterLabel: function(context: TooltipItem<"bubble">) {
              const rawData = context.raw as BubbleDataPoint;
              const duration = rawData.r;
              return `duration: ${Math.round(duration*1/that.state.durationMultiplier)}ms`;
            }
          }
        },
      },
      scales: {
        y: {
          ticks: {
            callback: function(value: string | number, index: number, ticks: Tick[]) {
              return `${value}px`;
            }
          },
          suggestedMin: 0,
          suggestedMax: 1200,
        },
        x: {
          ticks: {
            callback: function(value: string | number, index: number, ticks: Tick[]) {
              return `${value}px`;
            }
          },
          suggestedMin: 0,
          suggestedMax: 1400,
        },
      },
    };

    return (
      <div className="bubbleChart" style={{
        width: this.props.width ?? "100%",
        height: this.props.height ?? "100%",
        margin: this.props.margin ?? "0 auto",
      }}>

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>

        <h1>Chart</h1>
        <Bubble options={options} data={this.state.data} />

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>

        <h1>Chart Controls</h1>
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
                      const data = this.getBubbleChartData(this.props.participantId, this.props.visualizationType, (newValue as number[])[0],  (newValue as number[])[1], this.state.opacity);
                      this.setState({
                        data: data.data,
                        timeRange: newValue as number[],
                        durationMultiplier: data.durationMultiplier,
                      });
                    }}
                    valueLabelFormat={(value) => {
                      return `${this.getHumanizedTimeFromMilliseconds(value)}`;
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
                          const data = this.getBubbleChartData(this.props.participantId, this.props.visualizationType, this.state.timeRange[0], this.state.timeRange[1], this.state.opacity);
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
            <h3>Opacity</h3>
            <InputSlider
              width={"50%"}
              min={0}
              max={1}
              step={0.01}
              value={this.state.opacity}
              onSliderChange={(event: Event, newValue: number | number[]) =>{
                const data = this.getBubbleChartData(this.props.participantId, this.props.visualizationType, this.state.timeRange[0], this.state.timeRange[1], newValue as number);
                this.setState({
                  data: data.data,
                  opacity: newValue as number,
                });
              }}
              onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = event.target.value === '' ? 0 : Number(event.target.value);
                const data = this.getBubbleChartData(this.props.participantId, this.props.visualizationType, this.state.timeRange[0], this.state.timeRange[1], newValue);
                this.setState({
                  data: data.data,
                  opacity: newValue,
                });
              }}
            />
          </div>
        </div>

        <Divider sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}/>

        <h1>Events</h1>
        <MessageCard 
          height={"200px"}
          backgroundColor={"#fafafa"}
          scrollToBottom={true}
          messages={this.state.events.map(event => {
            return `${this.getHumanizedTimeFromMilliseconds(event.time)} ${event.event} ${event.data1 ? event.data1 : ""} ${event.data2 ? event.data2 : ""} ${event.description ? event.description : ""}`;
          })}
        />
      </div>  
    );
  }
}
export default BubbleChartCard;