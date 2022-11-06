import { AdditionalData } from "./types/additional/additional";
import { Generated } from "./types/generated/generated";
import { EVD } from "./types/raw/EVD";
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

/**
 *  Map mirroring data file heiarchy
 * 
 *  Usage: DataFiles.get("p3")!.data.get(VisualizationType.GRAPH)!.raw.get(DataType.FXD)! as FXD[]
 */
export const DataFiles = new Map<string, ParticipantData>();
export const LoadedFiles = new Array<string>();

export interface ParticipantData {
	raw: Map<VisualizationType, Map<DataType, Array<EVD> | Array<FXD> | Array<GZD>>>;
  generated: Map<VisualizationType, Map<DataType, Array<Generated>>>;
	additional: AdditionalData[];
}