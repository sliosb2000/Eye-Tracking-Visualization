import {
  CircularProgressProps,
  Box,
  CircularProgress,
  Typography
} from "@mui/material";
import React from "react";
import HomePage from "./HomePage";
import {
  VisualizationType,
  participants,
  DataType,
  DataFiles
} from "./data/data";
import {
  AdditionalData,
  Ontologies,
  AdditionalDataVisualizationTypeMap
} from "./data/types/additional/additional";
import { Generated } from "./data/types/generated/generated";
import { EVD, EVDEventKeyItems, EVDEventKey } from "./data/types/raw/EVD";
import { FXD } from "./data/types/raw/FXD";
import { GZD } from "./data/types/raw/GZD";
import './App.css';

export const fileType = ".txt";
export const dataPathRaw = "./data/data/raw";
export const dataPathGenerated = "./data/data/generated";
export const dataPathAdditional = "./data/data/additional";

export const fileAdditional = "Project_2_Additional_Participant_Data.csv";

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

interface Props {}

interface State {
  loadedFiles: string[];
  loaded: boolean;
  fileCount: number;
}

class App extends React.Component<Props, State> {
  private loadedFiles: string[] = [];
  private fileCount: number = 0;

  constructor(props: Props) {
    super(props);

    this.state = {
      loadedFiles: [],
      loaded: false,
      fileCount: 0,
    };
  }

  async componentDidMount() {
    // Get total number of files to load
    this.fileCount++;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _i of participants) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _j of Object.values(VisualizationType)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _k of Object.values(DataType)) {
          this.fileCount += 2;
        }
      }
    }
    this.setState({
      fileCount: this.fileCount,
    });

    const file = require("".concat(`${dataPathAdditional}/${fileAdditional}`));
    const additionalDataMap = new Map<string, AdditionalData[]>();
    await fetch(file)
      .then(response => response.text())
      .then(text => {
        const dataRows = text.split("\n");
        for (let i = 0; i < dataRows.length; i++) {
          if (i === 0) continue; // Remove first row = column names row

          const dataRow = dataRows[i];
          const data = dataRow.split(/[\s,]+/).filter(element => {
            return element !== "";
          });

          let j = 0;
          while (j < data.length - 1) {
            let dataElement: AdditionalData = {
              participantId: data[j++],
              ontology: Number(data[j++]) as Ontologies,
              visualization: AdditionalDataVisualizationTypeMap.get(
                Number(data[j++])
              )! as VisualizationType,
              success: Number(data[j++])
            };
            const existingMap = additionalDataMap.get(
              dataElement.participantId
            );
            if (existingMap) {
              existingMap.push(dataElement);
            } else {
              additionalDataMap.set(dataElement.participantId, [dataElement]);
            }
          }
        }
      });

    for (const i of participants) {
      const visualizationTypeMapRaw = new Map<VisualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>
      >();
      const visualizationTypeMapGenerated = new Map<VisualizationType, Map<DataType, Array<Generated>>
      >();

      for (const j of Object.values(VisualizationType)) {
        const dataTypeMapRaw = new Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>
        >();
        const dataTypeMapGenerated = new Map<DataType, Array<Generated>>();

        for (const k of Object.values(DataType)) {
          const pathRaw = `${dataPathRaw}/${i}/${i}.${j}${k}${fileType}`;
          const fileRaw = require("".concat(pathRaw));
          await fetch(fileRaw)
            .then(response => response.text())
            .then(text => {
              const dataRows = text.split("\n");

              switch (DataType[k]) {
                case DataType.EVD:
                  const EVDDataArray = new Array<EVD>();
                  for (const dataRow of dataRows) {
                    const data = dataRow.split(/[\s]+/).filter(element => {
                      return element !== "";
                    });
                    let l = 0;
                    while (l < data.length - 1) {
                      let dataElement: EVD = {
                        time: Number(data[l++]),
                        event: data[l++],
                        eventKey: Number(data[l++])
                      };

                      const remainingKeys =
                        EVDEventKeyItems[dataElement.eventKey as EVDEventKey];
                      if (remainingKeys.length + 3 !== data.length) {
                        break;
                      }

                      for (const keyTypePair of remainingKeys) {
                        let value;
                        switch (keyTypePair[1]) {
                          case "string":
                            value = data[l++];
                            break;
                          case "number":
                            value = data[l++];
                            break;
                        }
                        dataElement[keyTypePair[0]] = value;
                      }
                      EVDDataArray.push(dataElement);
                    }
                  }
                  dataTypeMapRaw.set(k, EVDDataArray);
                  break;

                case DataType.FXD:
                  const FXDDataArray = new Array<FXD>();
                  for (const dataRow of dataRows) {
                    const data = dataRow.split(/[\s]+/).filter(element => {
                      return element !== "";
                    });
                    let l = 0;
                    while (l < data.length - 1) {
                      if (5 !== data.length) {
                        break;
                      }

                      const dataElement: FXD = {
                        id: Number(data[l++]),
                        time: Number(data[l++]),
                        duration: Number(data[l++]),
                        x: Number(data[l++]),
                        y: Number(data[l++])
                      };
                      FXDDataArray.push(dataElement);
                    }
                  }
                  dataTypeMapRaw.set(k, FXDDataArray);
                  break;

                case DataType.GZD:
                  //TODO
                  break;
              }
            });
          this.loadedFiles.push(pathRaw);
          this.setState({
            loadedFiles: this.loadedFiles
          });

          const pathGenerated = `${dataPathGenerated}/${i}/${j}${k}Results${fileType}`;
          const fileGenerated = require("".concat(pathGenerated));
          await fetch(fileGenerated)
            .then(response => response.text())
            .then(text => {
              const dataRows = text.split("\n");

              const generatedArray = new Array<Generated>();
              for (const dataRow of dataRows) {
                const data = dataRow.split(":").filter(element => {
                  return element !== "";
                });

                let l = 0;
                while (l < data.length - 1) {
                  let dataElement: Generated = {
                    description: data[l++],
                    value: Number(data[l++])
                  };

                  generatedArray.push(dataElement);
                }
              }
              dataTypeMapGenerated.set(k, generatedArray);
            });

          this.loadedFiles.push(pathGenerated);
          this.setState({
            loadedFiles: this.loadedFiles
          });
        }

        visualizationTypeMapRaw.set(j, dataTypeMapRaw);
        visualizationTypeMapGenerated.set(j, dataTypeMapGenerated);
      }

      DataFiles.set(i, {
        raw: visualizationTypeMapRaw,
        generated: visualizationTypeMapGenerated,
        additional: additionalDataMap.get(i)!
      });
    }
    this.setState({
      loadedFiles: [],
      loaded: true
    });
  }

  private page(loaded: boolean) {
    if (!loaded) {
      return (
        <div
					style={{
						height: "100vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						textAlign: "center",
					}}
				>
					<div>
						<CircularProgressWithLabel
							value={Math.round(
								(this.state.loadedFiles.length / this.state.fileCount) * 100
							)}
						/>
						<p>Loaded {this.state.loadedFiles.slice(-1)}...</p>
					</div>
        </div>
      );
    }

    return <HomePage />;
  }

  render() {
    return <div>{this.page(this.state.loaded)}</div>;
  }
}

export default App;