import { AdditionalData, AdditionalDataVisualizationTypeMap, Ontologies } from "./types/AdditionalData";
import { EVD, EVDEventKeyItems, EVDEventKey } from "./types/raw/EVD";
import { FXD } from "./types/raw/FXD";
import { GZD } from "./types/raw/GZD";

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
const dataPath = "./data/raw";

/**
 *  Map mirroring data file heiarchy
 *  ParticipantId: string
 *    ParticipantData: ParticipantData
 *      AdditionalData: AdditionalData
 *      VisualizationType: VisualizationType.GRAPH | VisualizationType.Tree
 *        DataType: DataType.FXD | DataType.EVD | DataType.GZD
 * 
 * Usage: DataFiles.get("p3")!.data.get(VisualizationType.GRAPH)!.get(DataType.FXD)! as FXD[]
 */
export const DataFiles = new Map<string, ParticipantData>();

export interface ParticipantData {
	data: Map<VisualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>;
	additionalData: AdditionalData[];
}

export async function loadData() {  
  const file = require("".concat("./data/Project_2_Additional_Participant_Data.csv"));
  const additionalDataMap = new Map<string, AdditionalData[]>();
  await fetch(file)
    .then(response => response.text())
    .then(text => {
      const dataRows = text.split("\n");
      for (let i=0; i<dataRows.length; i++) {
        if (i === 0) continue; // Remove first row = column names row

        const dataRow = dataRows[i];
        const data = dataRow.split(/[\s,]+/).filter(element => {
          return element !== '';
        });
        
        let j = 0;
        while(j < data.length-1) {
          let dataElement: AdditionalData = {
            participantId: data[j++],
            ontology: Number(data[j++]) as Ontologies,
            visualization: AdditionalDataVisualizationTypeMap.get(Number(data[j++]))! as VisualizationType,
            success: Number(data[j++]),
          }
          const existingMap = additionalDataMap.get(dataElement.participantId);
          if (existingMap) {
            existingMap.push(dataElement);
          } else {
            additionalDataMap.set(dataElement.participantId, [dataElement]);
          }
        }
      }
    });

  for (const i of participants) {
    const visualizationTypeMap = new Map<VisualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>();
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
      visualizationTypeMap.set(j, dataTypeMap);
    }

    DataFiles.set(i, {
      data: visualizationTypeMap,
      additionalData: additionalDataMap.get(i)!,
    });
  }
}