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
import { EVD, EVDEventKey } from "../data/types/raw/EVD";
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
  bubbleChartDataSets: ChartData<"bubble">;

  timeMax: number;
  timeRange: number[];

  opacity: number;

  playback: boolean;
}

class BubbleChartCard extends React.Component<Props, State> {

  private humanizer: HumanizeDuration = new HumanizeDuration(new HumanizeDurationLanguage());
  private playInterval?: NodeJS.Timeout;

  private EVDData: EVD[] = [];
  private FXDData: FXD[] = [];

  private maxTime: number = 0;
  private durationMultiplier: number = 1;

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
    
    this.updateData(this.props.participantId, this.props.visualizationType);
    
    this.state = {
      bubbleChartDataSets: this.getBubbleChartDatasets(this.durationMultiplier, DEFAULT_DATA.opacity),

      timeMax: this.maxTime,
      timeRange: [DEFAULT_DATA.timeMin, this.maxTime],

      opacity: DEFAULT_DATA.opacity,
      
      playback: false,
    }
  }

  componentWillUnmount() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.participantId !== prevProps.participantId || this.props.visualizationType !== prevProps.visualizationType) {
      this.updateData(this.props.participantId, this.props.visualizationType);

      this.setState({
        bubbleChartDataSets: this.getBubbleChartDatasets(this.durationMultiplier, this.state.opacity),

        timeMax: this.maxTime,
        timeRange: [DEFAULT_DATA.timeMin, this.maxTime],

        playback: false,
      });
    }
  }

  private updateData(participantId: string, visualizationType: VisualizationType, timeRange?: number[]) {
    this.updateFXDData(participantId, visualizationType, timeRange);
    this.updateEVDData(participantId, visualizationType, timeRange);
  }

  private updateFXDData(participantId: string, visualizationType: VisualizationType, timeRange?: number[], amount?: number) {
    let FXDData = DataFiles.get(participantId)!.data.get(visualizationType as VisualizationType)!.get(DataType.FXD)! as FXD[];
    if (timeRange) {
      const timeOffset = 1000;
      FXDData = FXDData.filter(data => {
        return data.time > timeRange[0] + timeOffset && data.time <= timeRange[1] + timeOffset;
      });
    }

    if (amount) {
      FXDData = FXDData.slice(-amount);
    }

    const durationMap = FXDData.map(a => { return a.duration });
    const minDuration = DEFAULT_DATA.timeMin;
    const maxDuration = Math.max(...durationMap);
    this.durationMultiplier = 1/(maxDuration-minDuration)*25;
    
    this.maxTime = Math.max(...FXDData.map(o => o.time));

    this.FXDData = FXDData;
  }

  private updateEVDData(participantId: string, visualizationType: VisualizationType, timeRange?: number[], amount?: number) {
    let EVDData = DataFiles.get(participantId)!.data.get(visualizationType)!.get(DataType.EVD)! as EVD[];
    if (timeRange) {
      const timeOffset = 1000;
      EVDData = EVDData.filter(data => {
          return data.time > timeRange[0] + timeOffset && data.time <= timeRange[1] + timeOffset;
        });
    }

    if (amount) {
      EVDData = EVDData.slice(-amount);
    }
  
    this.EVDData = EVDData;
  }

  private getBubbleChartDatasets(durationMultiplier: number, opacity?: number) {
    const chartDataFXD: BubbleDataPoint[] = this.FXDData.map(row => {
      const dataPoint: BubbleDataPoint = {
        x: row.x,
        y: row.y,
        r: row.duration*durationMultiplier,
      }
      return dataPoint;
    });

    const chartDataEVD: BubbleDataPoint[] = [];
    this.EVDData.forEach(row => {
      if (row.eventKey === EVDEventKey.L_MOUSE_BUTTON || row.eventKey === EVDEventKey.R_MOUSE_BUTTON) {
        const dataPoint: BubbleDataPoint = {
          x: row.data1!,
          y: row.data2!,
          r: 100*this.durationMultiplier,
        }
        chartDataEVD.push(dataPoint);
      }
    })

    

    const datasets: ChartData<"bubble"> = {
      datasets: [{
        label: DataType.FXD,
        data: chartDataFXD,
        backgroundColor: `rgba(255, 125, 125, ${opacity})`,
      }, {
        label: DataType.EVD,
        data: chartDataEVD,
        backgroundColor: `rgba(125, 125, 255, ${opacity})`,
      }],
    };

    return datasets;
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
              return `duration: ${Math.round(duration*1/that.durationMultiplier)}ms`;
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

        <Divider
          variant="middle"
          sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}
          flexItem
        />  

        <h1>Chart</h1>
        <Bubble options={options} data={this.state.bubbleChartDataSets} />

        <Divider
          variant="middle"
          sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}
          flexItem
        />  

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
                    min={DEFAULT_DATA.timeMin}
                    max={this.state.timeMax}
                    step={1000}
                    onChange={(event: Event, newValue: number | number[]) => {
                      this.updateData(this.props.participantId, this.props.visualizationType, newValue as number[]);
      
                      this.setState({
                        bubbleChartDataSets: this.getBubbleChartDatasets(this.durationMultiplier, this.state.opacity),
                        timeRange: newValue as number[],
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

                          this.updateData(this.props.participantId, this.props.visualizationType, [this.state.timeRange[0], this.state.timeRange[1]+1000]);
                          
                          this.setState({
                            bubbleChartDataSets: this.getBubbleChartDatasets(this.durationMultiplier, this.state.opacity),
                            timeRange: [this.state.timeRange[0], this.state.timeRange[1]+1000],
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
                this.updateData(this.props.participantId, this.props.visualizationType, this.state.timeRange);

                this.setState({
                  bubbleChartDataSets: this.getBubbleChartDatasets(this.durationMultiplier, newValue as number),
                  opacity: newValue as number,
                });
              }}
              onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const newValue = event.target.value === '' ? 0 : Number(event.target.value);
                
                this.updateData(this.props.participantId, this.props.visualizationType, this.state.timeRange);

                this.setState({
                  bubbleChartDataSets: this.getBubbleChartDatasets(this.durationMultiplier, newValue as number),
                  opacity: newValue,
                });
              }}
            />
          </div>
        </div>

        <Divider
          variant="middle"
          sx={{marginLeft: "5%", marginRight: "5%", marginTop: "20px", marginBottom: "20px"}}
          flexItem
        />  

        <h1>Events</h1>
        <MessageCard 
          height={"200px"}
          backgroundColor={"#fafafa"}
          scrollToBottom={true}
          messages={
            this.EVDData.map(event => {
              return `${this.getHumanizedTimeFromMilliseconds(event.time)} ${event.event} ${event.data1 ? event.data1 : ""} ${event.data2 ? event.data2 : ""} ${event.description ? event.description : ""}`;
            }
          )}
        />
      </div>  
    );
  }
}
export default BubbleChartCard;