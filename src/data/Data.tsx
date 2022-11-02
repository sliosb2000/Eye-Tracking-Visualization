import { EVD, EVDEventKeyItems, EVDEventKey } from "./Models/Raw/EVD";
import { FXD } from "./Models/Raw/FXD";
import { GZD } from "./Models/Raw/GZD";

// File Naming Conventions
export const participants = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p10", "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20", "p21", "p23", "p24", "p25", "p27", "p28", "p30", "p31", "p32", "p33", "p34", "p35", "p36"];
export enum VisualizationType {
  GRAPH = "graph",
  TREE = "tree",
}
export enum DataType {
  FXD = "FXD",
  EVD = "EVD",
  GZD = "GZD",
}

const fileType = ".txt";
const dataPath = "./Archive";

/**
 *  Map mirroring data file heiarchy
 *  ParticipantId: string
 *    VizualizationType: VizualizationType.GRAPH | VizualizationType.Tree
 *       DataType: DataType.FXD | DataType.EVD | DataType.GZD
 * 
 * Usage: DataFiles.get("p3")!.get(VizualizationType.GRAPH)!.get(DataType.FXD)! as FXD[]
 */
export const DataFiles = new Map<string, Map<VisualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>>();

export async function loadData() {  
  for (const i of participants) {
    const vizualizationTypeMap = new Map<VisualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>();
    for (const j of Object.values(VisualizationType)) {
      const dataTypeMap = new Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>();
      for (const k of Object.values(DataType)) {
        const path = `${dataPath}/${i}/${i}.${j}${k}${fileType}`;
        console.log(`Loading ${path}`);
        const file = require("".concat(path));
        await fetch(file)
          .then(response => response.text())
          .then(text => {
            const dataRows = text.split("\n");
            switch(DataType[k]) {
              case DataType.EVD:
                const EVDDataArray = new Array<EVD>();
                for (const dataRow of dataRows) {
                  const data = dataRow.split(/[\s]+/).filter(element => {
                    return element !== '';
                  });
                  let l = 0;
                  while (l < data.length-1) {
                    let dataElement: EVD = {
                      time: Number(data[l++]),
                      event: data[l++],
                      eventKey: Number(data[l++]),
                    };
                    
                    const remainingKeys = EVDEventKeyItems[dataElement.eventKey as EVDEventKey];
                    if (remainingKeys.length+3 !== data.length) {
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
                dataTypeMap.set(k, EVDDataArray);
                break;

              case DataType.FXD:
                const FXDDataArray = new Array<FXD>();
                for (const dataRow of dataRows) {
                  const data = dataRow.split(/[\s]+/).filter(element => {
                    return element !== '';
                  });
                  let l = 0;
                  while (l < data.length-1) {
                    if (5 !== data.length) {
                      break;
                    }
                    
                    const dataElement: FXD = {
                      id: Number(data[l++]),
                      time: Number(data[l++]),
                      duration: Number(data[l++]),
                      x: Number(data[l++]),
                      y: Number(data[l++]),
                    }
                    FXDDataArray.push(dataElement);
                  }
                }
                dataTypeMap.set(k, FXDDataArray);
                break;

              case DataType.GZD:
                //TODO
                break;
            }  
          });
      }
      vizualizationTypeMap.set(j, dataTypeMap);
    }
    DataFiles.set(i, vizualizationTypeMap);
  }
}