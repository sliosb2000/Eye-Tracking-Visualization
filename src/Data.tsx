// File Naming Conventions
export const participants = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 27, 28, 30, 31, 32, 33, 34, 35, 36];
export enum VizualizationType {
  GRAPH = "graph",
  TREE = "tree",
}
export enum DataType {
  FXD = "FXD",
  EVD = "EVD",
  GZD = "GZD",
}

const fileType = ".txt";
const dataPath = "./data/Archive";

/* Map mirroring data file heiarchy
 *  ParticipantId: string
 *    VizualizationType: VizualizationType.GRAPH | VizualizationType.Tree
 *       DataType: DataType.FXD | DataType.EVD | DataType.GZD
 * 
 * Usage: DataFiles.get("p3")!.get(VizualizationType.GRAPH)!.get(DataType.FXD)! as FXD[]
 */
export const DataFiles = new Map<string, Map<VizualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>>();

export interface EVD {

}
export interface FXD {
  id: number,
  time: number,
  duration: number,
  x: number,
  y: number,
}
export interface GZD {

}

export async function loadData() {  
  for (const i of participants) {
    const vizualizationTypeMap = new Map<VizualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>();
    for (const j of Object.values(VizualizationType)) {
      const dataTypeMap = new Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>();
      for (const k of Object.values(DataType)) {
        const path = `${dataPath}/p${i}/p${i}.${j}${k}${fileType}`;
        //console.log(path)
        const file = require("".concat(path));
        await fetch(file)
          .then(response => response.text())
          .then(text => {
            const data = text.split(/[\s,]+/);
            switch(DataType[k]) {
              case DataType.EVD:
                console.log(`p${i}`, "EVD");
                break;
              case DataType.FXD:
                console.log(`p${i}`, "FXD");
                const dataArray = new Array<FXD>();
                for (let i=0; i<data.length-1; i+=5) {
                  const dataElement: FXD = {
                    id: Number(data[i]),
                    time: Number(data[i+1]),
                    duration: Number(data[i+2]),
                    x: Number(data[i+3]),
                    y: Number(data[i+4]),
                  }
                  dataArray.push(dataElement);
                }
                dataTypeMap.set(k, dataArray);
                break;
              case DataType.GZD:
                console.log(`p${i}`, "GZD");
                break;
            }
          });
      }
      vizualizationTypeMap.set(j, dataTypeMap);
    }
    DataFiles.set(`p${i}`, vizualizationTypeMap);
  }
}
