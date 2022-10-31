// File Naming Conventions
export const participants = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p10", "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20", "p21", "p23", "p24", "p25", "p27", "p28", "p30", "p31", "p32", "p33", "p34", "p35", "p36"];
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

/**
 *  Map mirroring data file heiarchy
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
        const path = `${dataPath}/${i}/${i}.${j}${k}${fileType}`;
        //console.log(path)
        const file = require("".concat(path));
        await fetch(file)
          .then(response => response.text())
          .then(text => {
            const data = text.split(/[\s,]+/);
            switch(DataType[k]) {
              case DataType.EVD:
                console.log(i, "EVD");
                break;
              case DataType.FXD:
                console.log(i, "FXD");
                const dataArray = new Array<FXD>();
                for (let l=0; l<data.length-1; l+=5) {
                  const dataElement: FXD = {
                    id: Number(data[l]),
                    time: Number(data[l+1]),
                    duration: Number(data[l+2]),
                    x: Number(data[l+3]),
                    y: Number(data[l+4]),
                  }
                  dataArray.push(dataElement);
                }
                dataTypeMap.set(k, dataArray);
                break;
              case DataType.GZD:
                console.log(i, "GZD");
                break;
            }
          });
      }
      vizualizationTypeMap.set(j, dataTypeMap);
    }
    DataFiles.set(i, vizualizationTypeMap);
  }
}
